const crypto = require('crypto');
const os = require('os');
const path = require('path');
const mammoth = require('mammoth');
const { ocrPdfWithMultimodalAI } = require('./aiProviderService');

const MAX_BOOK_FILE_SIZE_BYTES = (parseInt(process.env.MAX_BOOK_FILE_SIZE_MB || '50', 10) || 50) * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'docx', 'txt']);
const ALLOWED_MIME_MAP = {
    pdf: new Set(['application/pdf', 'application/x-pdf', 'application/octet-stream']),
    docx: new Set([
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip',
        'application/octet-stream'
    ]),
    txt: new Set(['text/plain', 'text/markdown', 'application/octet-stream'])
};

let cachedPdfjsLib = null;

/**
 * Load PDF.js statically so Vercel's Node File Tracer (NFT) always bundles both
 * pdf.js and pdf.worker.js without relying on pdf-parse's dynamic require string.
 */
function loadPdfjsLib() {
    if (cachedPdfjsLib) return cachedPdfjsLib;

    try {
        // Explicit static reference so Vercel NFT traces the companion fake-worker bundle
        require.resolve('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.worker.js');
    } catch {
        // Worker file check is best-effort
    }

    const pdfjsLib = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');
    pdfjsLib.disableWorker = true;
    cachedPdfjsLib = pdfjsLib;
    return pdfjsLib;
}

/**
 * Normalize Buffer / Uint8Array / ArrayBuffer into a standard Node Buffer.
 */
function normalizeBuffer(input) {
    if (!input) return Buffer.alloc(0);
    if (Buffer.isBuffer(input)) return input;
    if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    if (input instanceof ArrayBuffer) return Buffer.from(input);
    if (Array.isArray(input)) return Buffer.from(input);
    if (typeof input === 'object' && input.type === 'Buffer' && Array.isArray(input.data)) {
        return Buffer.from(input.data);
    }
    return Buffer.from(input);
}

/**
 * Sanitize filename to prevent path traversal or injection
 */
function sanitizeFileName(name) {
    const base = path.basename(String(name || 'book.txt'));
    return base.replace(/[^a-zA-Z0-9._\-\s()]/g, '_').slice(0, 180) || 'reference-book.txt';
}

/**
 * Compute SHA-256 hash of a buffer or string
 */
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Check if buffer starts with UTF-16 BOM
 */
function detectUtf16Bom(buf) {
    if (!buf || buf.length < 2) return null;
    if (buf[0] === 0xFF && buf[1] === 0xFE) return 'utf16le';
    if (buf[0] === 0xFE && buf[1] === 0xFF) return 'utf16be';
    return null;
}

/**
 * Decode TXT file buffer cleanly (supports UTF-8 with/without BOM and UTF-16LE/BE).
 */
function decodeTextBuffer(buf) {
    const utf16 = detectUtf16Bom(buf);
    if (utf16 === 'utf16le') {
        return buf.subarray(2).toString('utf16le');
    }
    if (utf16 === 'utf16be') {
        const swapped = Buffer.from(buf.subarray(2));
        for (let i = 0; i + 1 < swapped.length; i += 2) {
            const tmp = swapped[i];
            swapped[i] = swapped[i + 1];
            swapped[i + 1] = tmp;
        }
        return swapped.toString('utf16le');
    }
    let text = buf.toString('utf8');
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }
    return text;
}

/**
 * Inspect magic bytes & validate uploaded reference book securely
 */
function validateUploadedBookFile({ buffer, originalname, mimetype }) {
    const fileBuffer = normalizeBuffer(buffer);
    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
        const err = new Error('Uploaded file is empty or missing.');
        err.status = 400;
        throw err;
    }

    if (fileBuffer.length > MAX_BOOK_FILE_SIZE_BYTES) {
        const maxMb = Math.round(MAX_BOOK_FILE_SIZE_BYTES / (1024 * 1024));
        const err = new Error(`File exceeds maximum allowed size of ${maxMb} MB.`);
        err.status = 413;
        throw err;
    }

    const safeName = sanitizeFileName(originalname);
    const ext = path.extname(safeName).replace('.', '').toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
        const err = new Error('Unsupported file format. Only PDF, DOCX, and TXT reference books are allowed.');
        err.status = 400;
        throw err;
    }

    const cleanMime = String(mimetype || 'application/octet-stream').toLowerCase().split(';')[0].trim();
    if (!ALLOWED_MIME_MAP[ext].has(cleanMime)) {
        const err = new Error(`Invalid MIME type (${cleanMime}) for .${ext} file.`);
        err.status = 400;
        throw err;
    }

    // Magic-byte signature verification
    if (ext === 'pdf') {
        // PDF header %PDF- must appear near start of file (PDF spec allows small leading preamble up to 1024 bytes)
        const header = fileBuffer.subarray(0, Math.min(fileBuffer.length, 1024)).toString('latin1');
        if (!header.includes('%PDF-')) {
            const err = new Error('Invalid PDF file signature. Please upload a genuine PDF document.');
            err.status = 400;
            throw err;
        }
    } else if (ext === 'docx') {
        const isZip = fileBuffer.length >= 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B &&
            (fileBuffer[2] === 0x03 || fileBuffer[2] === 0x05 || fileBuffer[2] === 0x07);
        if (!isZip) {
            const err = new Error('Invalid DOCX file signature. Please upload a valid .docx file.');
            err.status = 400;
            throw err;
        }
    } else if (ext === 'txt') {
        // Reject binary files disguised as .txt (allow valid UTF-16 BOM text files)
        const utf16 = detectUtf16Bom(fileBuffer);
        if (!utf16) {
            const sample = fileBuffer.subarray(0, Math.min(fileBuffer.length, 4096));
            if (sample.includes(0x00)) {
                const err = new Error('Invalid TXT file: binary content detected.');
                err.status = 400;
                throw err;
            }
        }
    }

    return {
        fileName: safeName,
        fileType: ext,
        mimeType: cleanMime,
        fileSize: fileBuffer.length,
        fileHash: sha256(fileBuffer)
    };
}

/**
 * Sanitize extracted text so book content is strictly clean, readable, non-executable data.
 */
function sanitizeExtractedContent(text) {
    return String(text || '')
        .replace(/\uFEFF/g, '')
        .replace(/\u0000/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Detect likely chapter/section heading from a block of text lines
 */
function detectHeadingInText(text, fallbackChapter = '') {
    const lines = String(text || '').split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines.slice(0, 12)) {
        if (line.length < 3 || line.length > 130) continue;

        // Explicit Chapter / Unit / Module / Lesson / Section markers
        if (/^(chapter|unit|module|part|section|lesson)\s+([0-9ivxlcdm]+)([\s:.\-–—]+.*)?$/i.test(line)) {
            return line.slice(0, 120);
        }

        // Markdown headings (# Heading)
        const mdMatch = line.match(/^#{1,4}\s+(.+)$/);
        if (mdMatch && mdMatch[1].trim().length >= 3) {
            return mdMatch[1].trim().slice(0, 120);
        }

        // Numbered technical heading e.g. "3.2 Semantic HTML Elements"
        if (/^\d+(\.\d+){0,2}\s+[A-Z][A-Za-z0-9\s,&:/()\-+#]{2,80}$/.test(line) && !line.endsWith('.')) {
            return line.slice(0, 120);
        }
    }
    return fallbackChapter;
}

/**
 * Extract embedded JPEG/PNG images directly from PDF binary streams for local OCR on scanned PDFs
 */
function extractEmbeddedImagesFromPdf(pdfBuffer) {
    const images = [];
    const maxImages = process.env.VERCEL ? 6 : 20;

    // 1. Scan for JPEG images (SOI: FF D8 FF ... EOI: FF D9)
    let offset = 0;
    while (offset < pdfBuffer.length - 4 && images.length < maxImages) {
        if (pdfBuffer[offset] === 0xFF && pdfBuffer[offset + 1] === 0xD8 && pdfBuffer[offset + 2] === 0xFF) {
            let end = offset + 3;
            while (end < pdfBuffer.length - 1) {
                if (pdfBuffer[end] === 0xFF && pdfBuffer[end + 1] === 0xD9) {
                    const imgBuf = pdfBuffer.subarray(offset, end + 2);
                    if (imgBuf.length >= 1024 && imgBuf.length <= 8 * 1024 * 1024) {
                        images.push({ buffer: Buffer.from(imgBuf), mimeType: 'image/jpeg' });
                    }
                    offset = end + 2;
                    break;
                }
                end++;
            }
            if (end >= pdfBuffer.length - 1) break;
        } else {
            offset++;
        }
    }

    // 2. Scan for PNG images (89 50 4E 47 0D 0A 1A 0A ... IEND AE 42 60 82)
    const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const pngEnd = Buffer.from([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    let pngOffset = 0;
    while (pngOffset < pdfBuffer.length - 16 && images.length < maxImages) {
        const startIdx = pdfBuffer.indexOf(pngSig, pngOffset);
        if (startIdx === -1) break;
        const endIdx = pdfBuffer.indexOf(pngEnd, startIdx + 8);
        if (endIdx === -1) break;
        const imgBuf = pdfBuffer.subarray(startIdx, endIdx + 8);
        if (imgBuf.length >= 512 && imgBuf.length <= 8 * 1024 * 1024) {
            images.push({ buffer: Buffer.from(imgBuf), mimeType: 'image/png' });
        }
        pngOffset = endIdx + 8;
    }

    return images;
}

function withPromiseTimeout(promise, ms, label = 'Operation') {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => {
                reject(new Error(`${label} timed out after ${ms}ms.`));
            }, ms);
        })
    ]).finally(() => clearTimeout(timer));
}

/**
 * Run OCR on a scanned PDF using multimodal AI (if configured) or bounded Tesseract.js on embedded page images.
 */
async function performScannedPdfOcr(pdfBuffer) {
    // Strategy 1: Multimodal AI native PDF OCR (fastest & highest accuracy in serverless)
    try {
        const aiPages = await ocrPdfWithMultimodalAI(pdfBuffer);
        if (Array.isArray(aiPages) && aiPages.length > 0) {
            const totalChars = aiPages.reduce((sum, p) => sum + sanitizeExtractedContent(p.text).length, 0);
            if (totalChars >= 30) {
                return { pages: aiPages, ocrEngine: 'multimodal_ai' };
            }
        }
    } catch (err) {
        console.warn('[Book OCR] Multimodal PDF OCR fallback:', err.message);
    }

    // Strategy 2: Extract embedded page images & run bounded local Tesseract.js OCR
    const embeddedImages = extractEmbeddedImagesFromPdf(pdfBuffer);
    if (embeddedImages.length === 0) {
        return { pages: [], ocrEngine: 'none' };
    }

    let Tesseract;
    try {
        Tesseract = require('tesseract.js');
    } catch {
        return { pages: [], ocrEngine: 'unavailable' };
    }

    const ocrStartedAt = Date.now();
    const totalOcrBudgetMs = process.env.VERCEL ? 15000 : 45000;
    const perImageTimeoutMs = process.env.VERCEL ? 8000 : 15000;
    const ocrPages = [];

    for (let i = 0; i < embeddedImages.length; i++) {
        if (Date.now() - ocrStartedAt > totalOcrBudgetMs) {
            console.warn(`[Book OCR] Stopped Tesseract fallback after ${totalOcrBudgetMs}ms budget (${ocrPages.length} pages extracted).`);
            break;
        }
        try {
            const { data } = await withPromiseTimeout(
                Tesseract.recognize(embeddedImages[i].buffer, 'eng', {
                    cachePath: os.tmpdir()
                }),
                perImageTimeoutMs,
                `OCR page ${i + 1}`
            );
            const cleanText = sanitizeExtractedContent(data?.text || '');
            if (cleanText) {
                ocrPages.push({
                    pageNumber: i + 1,
                    text: cleanText
                });
            }
        } catch (pageErr) {
            console.warn(`[Book OCR] Tesseract failed on embedded image ${i + 1}:`, pageErr.message);
        }
    }

    return { pages: ocrPages, ocrEngine: 'tesseract.js' };
}

/**
 * Format PDF.js textContent items into clean line-aware text.
 */
function renderPdfTextContent(textContent) {
    const items = Array.isArray(textContent?.items) ? textContent.items : [];
    let lastY = null;
    let text = '';
    for (const item of items) {
        const str = typeof item?.str === 'string' ? item.str : '';
        const curY = item?.transform?.[5];
        if (lastY !== null && curY !== undefined && Math.abs(lastY - curY) > 5) {
            text += '\n';
        } else if (text && str && !text.endsWith(' ') && !text.endsWith('\n') && !str.startsWith(' ')) {
            text += ' ';
        }
        text += str;
        if (curY !== undefined) lastY = curY;
    }
    return sanitizeExtractedContent(text);
}

/**
 * Extract raw pages & page count from a PDF buffer using static PDF.js (Vercel-safe).
 */
async function extractPdfRawPages(fileBuffer, { onPageProgress, onProgress } = {}) {
    let rawPages = [];
    let reportedNumPages = 0;
    let parseError = null;
    let doc = null;

    try {
        const pdfjsLib = loadPdfjsLib();
        const uint8 = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
        doc = await pdfjsLib.getDocument(uint8);
        reportedNumPages = Number(doc?.numPages) || 0;

        for (let pageNum = 1; pageNum <= reportedNumPages; pageNum++) {
            try {
                const pageData = await doc.getPage(pageNum);
                const textContent = await pageData.getTextContent({
                    normalizeWhitespace: false,
                    disableCombineTextItems: false
                });
                const cleanPageText = renderPdfTextContent(textContent);
                rawPages.push({ pageNumber: pageNum, text: cleanPageText });
            } catch (pageErr) {
                console.warn(`[PDF Extract] Warning on page ${pageNum}/${reportedNumPages}:`, pageErr.message);
                rawPages.push({ pageNumber: pageNum, text: '' });
            }

            if (onPageProgress) {
                await onPageProgress({ currentPage: pageNum, totalPages: reportedNumPages });
            }
        }
    } catch (err) {
        parseError = err;
        const errName = String(err?.name || '');
        const errMsg = String(err?.message || '');

        if (/PasswordException|password/i.test(`${errName} ${errMsg}`)) {
            throw new Error('This PDF is password-protected or encrypted. Please upload an unlocked PDF document.');
        }

        console.warn('[PDF Extract] Primary PDF.js parser warning:', errMsg);
    } finally {
        if (doc && typeof doc.destroy === 'function') {
            await doc.destroy().catch(() => {});
        }
    }

    const numPages = Math.max(reportedNumPages, rawPages.length, 1);
    const totalAlphaNum = rawPages.reduce((sum, p) => sum + p.text.replace(/[^a-zA-Z0-9]/g, '').length, 0);
    const avgCharsPerPage = totalAlphaNum / numPages;
    const sparsePageCount = rawPages.filter(p => p.text.replace(/[^a-zA-Z0-9]/g, '').length < 25).length;
    const looksScanned = rawPages.length === 0 ||
        avgCharsPerPage < 40 ||
        (rawPages.length >= 1 && sparsePageCount / rawPages.length >= 0.7);

    if (looksScanned) {
        if (onProgress) await onProgress('Extracting Text (OCR for scanned PDF)');
        const ocrResult = await performScannedPdfOcr(fileBuffer);
        if (ocrResult.pages.length > 0) {
            return {
                pages: ocrResult.pages,
                detectedPageCount: Math.max(reportedNumPages, ocrResult.pages.length),
                ocrUsed: true
            };
        }

        if (totalAlphaNum >= 15) {
            return {
                pages: rawPages.filter(p => p.text.length > 0),
                detectedPageCount: Math.max(reportedNumPages, rawPages.length),
                ocrUsed: false
            };
        }

        if (parseError) {
            throw new Error(
                `Unable to extract text from this PDF (${parseError.message || 'corrupted or unsupported PDF structure'}). Please re-export the PDF or upload a DOCX/TXT version.`
            );
        }

        throw new Error(
            'This PDF appears to be a scanned image document with no extractable text layer. Configure GEMINI_API_KEY for cloud OCR or upload a text-based PDF, DOCX, or TXT file.'
        );
    }

    return {
        pages: rawPages.filter(p => p.text.length > 0),
        detectedPageCount: Math.max(reportedNumPages, rawPages.length),
        ocrUsed: false
    };
}

/**
 * Extract raw pages from DOCX buffer via mammoth.
 */
async function extractDocxRawPages(fileBuffer) {
    let html = '';
    try {
        const htmlResult = await mammoth.convertToHtml({ buffer: fileBuffer });
        html = String(htmlResult?.value || '');
    } catch (err) {
        throw new Error(`Unable to read DOCX file (${err.message || 'corrupted archive'}). Please upload a valid .docx document.`);
    }

    const blockRegex = /<(h[1-4]|p|li|tr)[^>]*>([\s\S]*?)<\/\1>/gi;
    const blocks = [];
    let match;
    while ((match = blockRegex.exec(html)) !== null) {
        const tag = match[1].toLowerCase();
        const text = sanitizeExtractedContent(
            match[2]
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
        );
        if (text) {
            blocks.push({ isHeading: tag.startsWith('h'), text });
        }
    }

    if (blocks.length === 0) {
        try {
            const rawRes = await mammoth.extractRawText({ buffer: fileBuffer });
            const rawText = sanitizeExtractedContent(rawRes?.value || '');
            if (rawText) {
                blocks.push({ isHeading: false, text: rawText });
            }
        } catch (err) {
            throw new Error(`Unable to extract text from DOCX file (${err.message}).`);
        }
    }

    if (blocks.length === 0) {
        throw new Error('This DOCX file contains no readable text.');
    }

    // Paginate into logical pages (~2400 chars each) while preserving chapter heading
    const pages = [];
    let currentPage = 1;
    let currentChapter = '';
    let currentBuf = '';
    for (const block of blocks) {
        if (block.isHeading) {
            if (currentBuf.trim()) {
                pages.push({ pageNumber: currentPage, chapter: currentChapter, text: currentBuf.trim() });
                if (currentBuf.length >= 1600) currentPage++;
                currentBuf = '';
            }
            currentChapter = block.text.slice(0, 120);
            currentBuf = `${block.text}\n`;
        } else {
            if (currentBuf.length + block.text.length > 2400 && currentBuf.trim()) {
                pages.push({ pageNumber: currentPage, chapter: currentChapter, text: currentBuf.trim() });
                currentPage++;
                currentBuf = '';
            }
            currentBuf += (currentBuf ? '\n' : '') + block.text;
        }
    }
    if (currentBuf.trim()) {
        pages.push({ pageNumber: currentPage, chapter: currentChapter, text: currentBuf.trim() });
    }

    return {
        pages,
        detectedPageCount: Math.max(...pages.map(p => p.pageNumber), pages.length),
        ocrUsed: false
    };
}

/**
 * Extract raw pages from TXT buffer.
 */
function extractTxtRawPages(fileBuffer) {
    const rawText = decodeTextBuffer(fileBuffer);
    const pages = [];

    if (rawText.includes('\f')) {
        const splitPages = rawText.split('\f');
        splitPages.forEach((txt, idx) => {
            const clean = sanitizeExtractedContent(txt);
            if (clean) {
                pages.push({ pageNumber: idx + 1, text: clean });
            }
        });
    } else {
        const clean = sanitizeExtractedContent(rawText);
        if (!clean) {
            throw new Error('This TXT file contains no readable text.');
        }
        const paragraphs = clean.split(/\n{2,}/).filter(Boolean);
        let currentPage = 1;
        let buf = '';
        for (const para of paragraphs) {
            if (buf.length + para.length > 2400 && buf.trim()) {
                pages.push({ pageNumber: currentPage, text: buf.trim() });
                currentPage++;
                buf = '';
            }
            buf += (buf ? '\n\n' : '') + para;
        }
        if (buf.trim()) {
            pages.push({ pageNumber: currentPage, text: buf.trim() });
        }
    }

    if (pages.length === 0) {
        throw new Error('This TXT file contains no readable text.');
    }

    return {
        pages,
        detectedPageCount: Math.max(...pages.map(p => p.pageNumber), pages.length),
        ocrUsed: false
    };
}

/**
 * Clean, normalize, count pages, and enrich extracted pages with chapter headings.
 */
function prepareExtractedPages(rawPages, detectedPageCount = 0) {
    let activeChapter = '';
    const enrichedPages = (Array.isArray(rawPages) ? rawPages : [])
        .map((p, idx) => {
            const cleanText = sanitizeExtractedContent(p?.text || '');
            const detected = p?.chapter || detectHeadingInText(cleanText, activeChapter);
            if (detected) activeChapter = detected;
            return {
                pageNumber: Number(p?.pageNumber) || idx + 1,
                chapter: activeChapter || 'General Reference',
                text: cleanText
            };
        })
        .filter(p => p.text.length >= 10);

    if (enrichedPages.length === 0) {
        throw new Error('No readable text could be extracted from this book file.');
    }

    const maxPageNum = Math.max(...enrichedPages.map(p => p.pageNumber), enrichedPages.length);
    const totalPages = Math.max(Number(detectedPageCount) || 0, maxPageNum);

    return {
        pages: enrichedPages,
        totalPages
    };
}

/**
 * Extract structured pages with chapter titles and page numbers from PDF, DOCX, or TXT.
 */
async function extractBookDocument(buffer, fileType, { onProgress, onPageProgress } = {}) {
    const fileBuffer = normalizeBuffer(buffer);
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('Book file buffer is empty or unreadable.');
    }

    const ext = String(fileType || '').toLowerCase().replace('.', '').trim();
    let rawResult;

    if (ext === 'pdf') {
        rawResult = await extractPdfRawPages(fileBuffer, { onProgress, onPageProgress });
    } else if (ext === 'docx') {
        rawResult = await extractDocxRawPages(fileBuffer);
    } else if (ext === 'txt') {
        rawResult = extractTxtRawPages(fileBuffer);
    } else {
        throw new Error(`Unsupported file format: ${ext || 'unknown'}. Only PDF, DOCX, and TXT files are supported.`);
    }

    const prepared = prepareExtractedPages(rawResult.pages, rawResult.detectedPageCount);
    return {
        pages: prepared.pages,
        totalPages: prepared.totalPages,
        ocrUsed: Boolean(rawResult.ocrUsed)
    };
}

/**
 * Split extracted pages into meaningful overlapping chunks while preserving
 * chapter title, page number, and deterministic contentHash (for embedding reuse).
 */
function chunkExtractedPages(pages, { targetSize = 1100, minSize = 160, overlap = 180 } = {}) {
    const chunks = [];
    let chunkIndex = 0;

    for (const page of pages) {
        const text = sanitizeExtractedContent(page.text);
        if (!text) continue;

        const chapter = page.chapter || 'General Reference';
        const pageNumber = Number(page.pageNumber) || 1;

        if (text.length <= targetSize) {
            const contentHash = sha256(text.toLowerCase().replace(/\s+/g, ' ').trim());
            chunks.push({
                chunkIndex: chunkIndex++,
                chapter,
                pageNumber,
                chunkText: text,
                contentHash
            });
            continue;
        }

        // Split by paragraphs first, then sentences if a paragraph is too long
        const paragraphs = text.split(/\n{2,}/).filter(Boolean);
        let current = '';

        const flushChunk = (chunkBody) => {
            const clean = chunkBody.trim();
            if (clean.length < Math.min(minSize, 30)) return;
            const contentHash = sha256(clean.toLowerCase().replace(/\s+/g, ' ').trim());
            chunks.push({
                chunkIndex: chunkIndex++,
                chapter,
                pageNumber,
                chunkText: clean,
                contentHash
            });
        };

        for (const para of paragraphs) {
            if (para.length > targetSize) {
                if (current.trim()) {
                    flushChunk(current);
                    current = current.slice(-overlap);
                }
                const sentences = para.match(/[^.!?\n]+[.!?\n]*/g) || [para];
                for (const sent of sentences) {
                    if ((current + ' ' + sent).trim().length > targetSize && current.trim().length >= minSize) {
                        flushChunk(current);
                        current = current.slice(-overlap).trim() + ' ' + sent.trim();
                    } else {
                        current = (current ? current + ' ' : '') + sent.trim();
                    }
                }
            } else if ((current + '\n\n' + para).length > targetSize && current.trim().length >= minSize) {
                flushChunk(current);
                const tail = current.slice(-overlap).trim();
                current = tail ? `${tail}\n\n${para}` : para;
            } else {
                current = current ? `${current}\n\n${para}` : para;
            }
        }

        if (current.trim()) {
            flushChunk(current);
        }
    }

    return chunks;
}

module.exports = {
    MAX_BOOK_FILE_SIZE_BYTES,
    normalizeBuffer,
    sanitizeFileName,
    sha256,
    validateUploadedBookFile,
    sanitizeExtractedContent,
    prepareExtractedPages,
    extractBookDocument,
    chunkExtractedPages,
    extractEmbeddedImagesFromPdf
};
