const crypto = require('crypto');
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
 * Inspect magic bytes & validate uploaded reference book securely
 */
function validateUploadedBookFile({ buffer, originalname, mimetype }) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        const err = new Error('Uploaded file is empty or missing.');
        err.status = 400;
        throw err;
    }

    if (buffer.length > MAX_BOOK_FILE_SIZE_BYTES) {
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
        const header = buffer.subarray(0, 8).toString('latin1');
        if (!header.includes('%PDF-')) {
            const err = new Error('Invalid PDF file signature. Please upload a genuine PDF document.');
            err.status = 400;
            throw err;
        }
    } else if (ext === 'docx') {
        const isZip = buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B &&
            (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07);
        if (!isZip) {
            const err = new Error('Invalid DOCX file signature. Please upload a valid .docx file.');
            err.status = 400;
            throw err;
        }
    } else if (ext === 'txt') {
        // Reject binary files disguised as .txt
        const sample = buffer.subarray(0, Math.min(buffer.length, 4096));
        if (sample.includes(0x00)) {
            const err = new Error('Invalid TXT file: binary content detected.');
            err.status = 400;
            throw err;
        }
    }

    return {
        fileName: safeName,
        fileType: ext,
        mimeType: cleanMime,
        fileSize: buffer.length,
        fileHash: sha256(buffer)
    };
}

/**
 * Sanitize extracted text so book content is strictly clean, readable, non-executable data.
 */
function sanitizeExtractedContent(text) {
    return String(text || '')
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
    const maxImages = 30;

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

/**
 * Run OCR on a scanned PDF using multimodal AI (if configured) or Tesseract.js on embedded page images.
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

    // Strategy 2: Extract embedded page images & run local Tesseract.js OCR
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

    const ocrPages = [];
    for (let i = 0; i < embeddedImages.length; i++) {
        try {
            const { data } = await Tesseract.recognize(embeddedImages[i].buffer, 'eng');
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
 * Extract structured pages with chapter titles and page numbers from PDF, DOCX, or TXT.
 */
async function extractBookDocument(buffer, fileType, { onProgress } = {}) {
    const ext = String(fileType || '').toLowerCase();
    let pages = [];
    let ocrUsed = false;

    if (ext === 'pdf') {
        // Load pdf-parse lazily from lib/pdf-parse.js to avoid pdf-parse's notorious test-file read on index.js
        let pdfParse;
        try {
            pdfParse = require('pdf-parse/lib/pdf-parse.js');
        } catch {
            pdfParse = require('pdf-parse');
        }

        const pageTexts = [];
        const options = {
            pagerender: (pageData) => {
                return pageData.getTextContent({
                    normalizeWhitespace: false,
                    disableCombineTextItems: false
                }).then((textContent) => {
                    let lastY = null;
                    let text = '';
                    for (const item of textContent.items) {
                        const curY = item.transform?.[5];
                        if (lastY !== null && curY !== undefined && Math.abs(lastY - curY) > 5) {
                            text += '\n';
                        } else if (text && !text.endsWith(' ') && !text.endsWith('\n')) {
                            text += ' ';
                        }
                        text += item.str;
                        if (curY !== undefined) lastY = curY;
                    }
                    pageTexts.push(sanitizeExtractedContent(text));
                    return text;
                });
            }
        };

        let pdfMeta = { numpages: 0 };
        try {
            pdfMeta = await pdfParse(buffer, options);
        } catch (parseErr) {
            console.warn('[PDF Extract] Primary parser warning, checking OCR fallback:', parseErr.message);
        }

        const numPages = Math.max(pageTexts.length, pdfMeta?.numpages || 0, 1);
        const rawPages = pageTexts.length > 0
            ? pageTexts.map((txt, idx) => ({ pageNumber: idx + 1, text: txt }))
            : [{ pageNumber: 1, text: sanitizeExtractedContent(pdfMeta?.text || '') }];

        const totalAlphaNum = rawPages.reduce((sum, p) => sum + p.text.replace(/[^a-zA-Z0-9]/g, '').length, 0);
        const avgCharsPerPage = totalAlphaNum / numPages;
        const sparsePageCount = rawPages.filter(p => p.text.replace(/[^a-zA-Z0-9]/g, '').length < 25).length;
        const looksScanned = avgCharsPerPage < 40 || (rawPages.length >= 1 && sparsePageCount / rawPages.length >= 0.7);

        if (looksScanned) {
            if (onProgress) await onProgress('Extracting Text (OCR for scanned PDF)');
            const ocrResult = await performScannedPdfOcr(buffer);
            if (ocrResult.pages.length > 0) {
                pages = ocrResult.pages;
                ocrUsed = true;
            } else if (totalAlphaNum >= 15) {
                pages = rawPages.filter(p => p.text.length > 0);
            } else {
                throw new Error(
                    'This PDF appears to be a scanned image document with no extractable text layer. Configure GEMINI_API_KEY for cloud OCR or ensure the PDF contains standard embedded page images.'
                );
            }
        } else {
            pages = rawPages.filter(p => p.text.length > 0);
        }
    } else if (ext === 'docx') {
        const htmlResult = await mammoth.convertToHtml({ buffer });
        const html = String(htmlResult?.value || '');

        // Parse headings and paragraphs in order to preserve chapter/section structure
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
            const rawRes = await mammoth.extractRawText({ buffer });
            const rawText = sanitizeExtractedContent(rawRes?.value || '');
            if (rawText) {
                blocks.push({ isHeading: false, text: rawText });
            }
        }

        // Paginate into logical pages (~2200 chars each) while preserving chapter heading
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
    } else if (ext === 'txt') {
        const rawText = buffer.toString('utf8');
        // Respect explicit form-feed (\f) page breaks if present
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
    } else {
        throw new Error(`Unsupported file format: ${ext}`);
    }

    // Carry forward chapter/heading annotations across pages
    let activeChapter = '';
    const enrichedPages = pages
        .map((p, idx) => {
            const cleanText = sanitizeExtractedContent(p.text);
            const detected = p.chapter || detectHeadingInText(cleanText, activeChapter);
            if (detected) activeChapter = detected;
            return {
                pageNumber: Number(p.pageNumber) || idx + 1,
                chapter: activeChapter || 'General Reference',
                text: cleanText
            };
        })
        .filter(p => p.text.length >= 10);

    if (enrichedPages.length === 0) {
        throw new Error('No readable text could be extracted from this book file.');
    }

    const totalPages = Math.max(...enrichedPages.map(p => p.pageNumber), enrichedPages.length);
    return {
        pages: enrichedPages,
        totalPages,
        ocrUsed
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
    sanitizeFileName,
    sha256,
    validateUploadedBookFile,
    sanitizeExtractedContent,
    extractBookDocument,
    chunkExtractedPages,
    extractEmbeddedImagesFromPdf
};
