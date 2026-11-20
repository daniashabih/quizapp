const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);
const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10) || 8080;
const OCR_WORKER_SECRET = String(process.env.OCR_WORKER_SECRET || '').trim();
const DEFAULT_DPI = parseInt(process.env.OCR_DPI || '200', 10) || 200;
const PAGE_TIMEOUT_MS = parseInt(process.env.OCR_PAGE_TIMEOUT_MS || '25000', 10) || 25000;

app.use(express.json({ limit: '70mb' }));

function requireWorkerAuth(req, res, next) {
    if (!OCR_WORKER_SECRET) return next();
    const header = String(req.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token || token !== OCR_WORKER_SECRET) {
        return res.status(401).json({ success: false, message: 'Unauthorized OCR worker request.' });
    }
    return next();
}

function cleanOcrText(raw) {
    return String(raw || '')
        .replace(/\uFEFF/g, '')
        .replace(/\u0000/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/([A-Za-z]{2,})-\s*\n\s*([a-z]{2,})/g, '$1$2')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

app.get('/health', async (_req, res) => {
    try {
        const { stdout } = await execFileAsync('tesseract', ['--version'], { timeout: 5000 });
        res.json({
            success: true,
            status: 'ok',
            engine: 'tesseract-native',
            version: String(stdout || '').split('\n')[0].trim()
        });
    } catch (err) {
        res.status(503).json({
            success: false,
            status: 'degraded',
            message: err.message
        });
    }
});

app.post('/ocr/batch', requireWorkerAuth, async (req, res) => {
    const { pdfBase64, pageNumbers, language = 'eng' } = req.body || {};
    if (!pdfBase64 || !Array.isArray(pageNumbers) || pageNumbers.length === 0) {
        return res.status(400).json({ success: false, message: 'pdfBase64 and non-empty pageNumbers are required.' });
    }

    const safeLang = /^[a-z0-9_+]+$/i.test(String(language)) ? String(language) : 'eng';
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), `hangbug-ocr-${crypto.randomBytes(4).toString('hex')}-`));
    const pdfPath = path.join(workDir, 'input.pdf');

    try {
        fs.writeFileSync(pdfPath, Buffer.from(pdfBase64, 'base64'));
        const pages = [];

        for (const rawNum of pageNumbers) {
            const pageNumber = parseInt(rawNum, 10);
            if (!Number.isFinite(pageNumber) || pageNumber < 1) continue;

            const outPrefix = path.join(workDir, `page_${pageNumber}`);
            try {
                await execFileAsync(
                    'pdftoppm',
                    ['-png', '-gray', '-r', String(DEFAULT_DPI), '-f', String(pageNumber), '-l', String(pageNumber), pdfPath, outPrefix],
                    { timeout: PAGE_TIMEOUT_MS }
                );

                const renderedFile = fs.readdirSync(workDir)
                    .find(name => name.startsWith(`page_${pageNumber}`) && name.endsWith('.png'));

                if (!renderedFile) {
                    throw new Error(`Failed to render PDF page ${pageNumber} to image.`);
                }

                const imgPath = path.join(workDir, renderedFile);
                const { stdout } = await execFileAsync(
                    'tesseract',
                    [imgPath, 'stdout', '-l', safeLang, '--oem', '1', '--psm', '3'],
                    { timeout: PAGE_TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 }
                );

                const cleaned = cleanOcrText(stdout);
                const alphaNum = cleaned.replace(/[^a-zA-Z0-9]/g, '').length;
                pages.push({
                    pageNumber,
                    ok: alphaNum >= 8,
                    text: alphaNum >= 8 ? cleaned : '',
                    confidence: alphaNum >= 8 ? 85 : 0,
                    attempts: 1,
                    error: alphaNum >= 8 ? '' : 'No legible text detected on this scanned page.'
                });
            } catch (pageErr) {
                pages.push({
                    pageNumber,
                    ok: false,
                    text: '',
                    confidence: 0,
                    attempts: 1,
                    error: String(pageErr?.message || 'OCR failed on page').slice(0, 300)
                });
            }
        }

        res.json({
            success: true,
            engine: 'ocr_worker',
            pages
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message || 'OCR batch failed.' });
    } finally {
        fs.rmSync(workDir, { recursive: true, force: true });
    }
});

app.listen(PORT, () => {
    console.log(`[Hangbug OCR Worker] Listening on port ${PORT} (native Tesseract + Poppler pdftoppm)`);
});
