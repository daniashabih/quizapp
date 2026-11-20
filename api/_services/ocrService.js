const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const Tesseract = require('tesseract.js');
const {
    createCanvas,
    DOMMatrix,
    ImageData,
    Path2D
} = require('@napi-rs/canvas');

const MIN_SEARCHABLE_PAGE_ALPHANUM = 30;
const MIN_OCR_PAGE_ALPHANUM = 8;
const MAX_RENDER_DIMENSION = parseInt(process.env.OCR_MAX_RENDER_DIM || '2200', 10) || 2200;
const DEFAULT_OCR_SCALE = parseFloat(process.env.OCR_RENDER_SCALE || '2.0') || 2.0;
const DEFAULT_OCR_LANGUAGE = String(process.env.OCR_LANGUAGE || 'eng').trim() || 'eng';
const DEFAULT_PAGE_TIMEOUT_MS = parseInt(
    process.env.OCR_PAGE_TIMEOUT_MS || (process.env.VERCEL ? '16000' : '25000'),
    10
) || 18000;
const DEFAULT_BATCH_PAGES = parseInt(
    process.env.OCR_BATCH_PAGES || (process.env.VERCEL ? '3' : '5'),
    10
) || 3;

let cachedPdfjs = null;
let sharedWorkerPromise = null;
let workerQueue = Promise.resolve();
let ocrTestOverride = null;

function ensureCanvasGlobals() {
    if (typeof globalThis.DOMMatrix === 'undefined' && DOMMatrix) {
        globalThis.DOMMatrix = DOMMatrix;
    }
    if (typeof globalThis.ImageData === 'undefined' && ImageData) {
        globalThis.ImageData = ImageData;
    }
    if (typeof globalThis.Path2D === 'undefined' && Path2D) {
        globalThis.Path2D = Path2D;
    }
}

class NodeCanvasFactory {
    create(width, height) {
        const w = Math.max(1, Math.ceil(Number(width) || 1));
        const h = Math.max(1, Math.ceil(Number(height) || 1));
        const canvas = createCanvas(w, h);
        const context = canvas.getContext('2d');
        return { canvas, context };
    }

    reset(canvasAndContext, width, height) {
        if (!canvasAndContext?.canvas) return;
        canvasAndContext.canvas.width = Math.max(1, Math.ceil(Number(width) || 1));
        canvasAndContext.canvas.height = Math.max(1, Math.ceil(Number(height) || 1));
    }

    destroy(canvasAndContext) {
        if (!canvasAndContext?.canvas) return;
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
}

function setOcrTestOverride(override) {
    if (process.env.NODE_ENV !== 'test' && !process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE) {
        throw new Error('OCR test override is only allowed in test environments.');
    }
    ocrTestOverride = override || null;
}

function getOcrWorkerConfig() {
    const url = String(process.env.OCR_WORKER_URL || '').trim().replace(/\/+$/, '');
    const secret = String(process.env.OCR_WORKER_SECRET || '').trim();
    const timeoutMs = parseInt(process.env.OCR_WORKER_TIMEOUT_MS || '45000', 10) || 45000;
    const allowFallback = String(process.env.OCR_WORKER_FALLBACK || 'true').trim().toLowerCase() !== 'false';
    return {
        configured: Boolean(url),
        url,
        secret,
        timeoutMs,
        allowFallback
    };
}

function resolveBundledLangPath() {
    const customPath = String(process.env.OCR_LANG_PATH || '').trim();
    if (customPath && fs.existsSync(customPath)) {
        return customPath;
    }

    try {
        const pkgDir = path.dirname(require.resolve('@tesseract.js-data/eng/package.json'));
        const bestIntDir = path.join(pkgDir, '4.0.0_best_int');
        if (fs.existsSync(path.join(bestIntDir, 'eng.traineddata.gz'))) {
            return bestIntDir;
        }
        const defaultDir = path.join(pkgDir, '4.0.0');
        if (fs.existsSync(path.join(defaultDir, 'eng.traineddata.gz'))) {
            return defaultDir;
        }
    } catch {
        // Fallback to Tesseract.js default CDN only if local package is absent
    }

    return null;
}

function resolveTesseractWorkerPath() {
    try {
        return require.resolve('tesseract.js/src/worker-script/node/index.js');
    } catch {
        return undefined;
    }
}

function getOcrEngineInfo() {
    const workerCfg = getOcrWorkerConfig();
    const bundledLangPath = resolveBundledLangPath();
    return {
        freeOcrEnabled: true,
        requiresPaidApiKey: false,
        primaryEngine: workerCfg.configured ? 'ocr_worker' : 'tesseract.js',
        fallbackEngine: workerCfg.configured && workerCfg.allowFallback ? 'tesseract.js' : null,
        engineLabel: workerCfg.configured
            ? 'Self-Hosted OCR Worker (with Tesseract.js fallback)'
            : 'Tesseract.js LSTM + PDF.js (Self-Hosted Free OCR)',
        language: DEFAULT_OCR_LANGUAGE,
        bundledTrainedData: Boolean(bundledLangPath),
        batchPages: DEFAULT_BATCH_PAGES,
        externalWorkerConfigured: workerCfg.configured
    };
}

/**
 * Load modern pdfjs-dist legacy Node build once with Canvas globals & worker configured.
 */
async function loadModernPdfjs() {
    if (cachedPdfjs) return cachedPdfjs;

    ensureCanvasGlobals();

    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    try {
        const workerAbsPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerAbsPath).href;
    } catch {
        // pdfjs falls back to sibling worker path automatically
    }

    cachedPdfjs = pdfjs;
    return pdfjs;
}

function resolvePdfjsAssetPaths() {
    try {
        const pkgDir = path.dirname(require.resolve('pdfjs-dist/package.json'));
        const standardFontDataUrl = path.join(pkgDir, 'standard_fonts') + path.sep;
        const cMapUrl = path.join(pkgDir, 'cmaps') + path.sep;
        return {
            standardFontDataUrl: fs.existsSync(standardFontDataUrl) ? standardFontDataUrl : undefined,
            cMapUrl: fs.existsSync(cMapUrl) ? cMapUrl : undefined
        };
    } catch {
        return { standardFontDataUrl: undefined, cMapUrl: undefined };
    }
}

/**
 * Open a PDF Buffer with PDF.js in a Node/Vercel-safe configuration.
 */
async function openPdfDocument(pdfBuffer) {
    const pdfjs = await loadModernPdfjs();
    const { standardFontDataUrl, cMapUrl } = resolvePdfjsAssetPaths();

    // Copy into an owned Uint8Array so PDF.js worker transfer cannot mutate caller Buffer
    const uint8 = new Uint8Array(pdfBuffer.length);
    uint8.set(pdfBuffer);

    try {
        const loadingTask = pdfjs.getDocument({
            data: uint8,
            useSystemFonts: true,
            disableFontFace: true,
            isEvalSupported: false,
            useWorkerFetch: false,
            verbosity: 0,
            ...(standardFontDataUrl ? { standardFontDataUrl } : {}),
            ...(cMapUrl ? { cMapUrl, cMapPacked: true } : {}),
            CanvasFactory: NodeCanvasFactory
        });
        const doc = await loadingTask.promise;
        return {
            pdfjs,
            doc,
            numPages: Number(doc?.numPages) || 0,
            destroy: async () => {
                if (doc && typeof doc.destroy === 'function') {
                    await doc.destroy().catch(() => {});
                }
            }
        };
    } catch (err) {
        const errName = String(err?.name || '');
        const errMsg = String(err?.message || '');
        if (/PasswordException|password/i.test(`${errName} ${errMsg}`)) {
            throw new Error('This PDF is password-protected or encrypted. Please upload an unlocked PDF document.');
        }
        throw err;
    }
}

/**
 * Clean & normalize OCR-extracted text while preserving headings, paragraphs, and code tokens.
 */
function cleanOcrText(rawText) {
    if (!rawText) return '';

    let text = String(rawText)
        .replace(/\uFEFF/g, '')
        .replace(/\u0000/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Rejoin soft-hyphenated words split across OCR line wraps (e.g. "implemen-\ntation")
        .replace(/([A-Za-z]{2,})-\s*\n\s*([a-z]{2,})/g, '$1$2')
        // Normalize curly quotes and OCR ligatures
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/\uFB01/g, 'fi')
        .replace(/\uFB02/g, 'fl');

    const cleanedLines = text
        .split('\n')
        .map(line => line.replace(/[ \t]{2,}/g, ' ').trim())
        .filter(line => {
            if (!line) return true; // Keep paragraph boundaries
            // Strip isolated 1-2 character pure scanner border noise like "|" or "~" or ".."
            if (line.length <= 2 && !/[a-zA-Z0-9{}[\]()<>]/.test(line)) {
                return false;
            }
            return true;
        });

    return cleanedLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Format PDF.js textContent items into clean line-aware text.
 */
function formatPdfJsTextContent(textContent) {
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
        if (item?.hasEOL && !text.endsWith('\n')) {
            text += '\n';
        }
        if (curY !== undefined) lastY = curY;
    }

    return cleanOcrText(text);
}

/**
 * Inspect PDF.js operator list on a page to determine whether it contains raster images
 * or dense vector/outlined graphics that require OCR when text layer is absent.
 */
async function inspectPageVisualContent(page, OPS) {
    try {
        const opList = await page.getOperatorList();
        const fnArray = Array.isArray(opList?.fnArray) ? opList.fnArray : [];
        let imageOps = 0;
        let pathOps = 0;

        const imageOpCodes = new Set(
            [
                OPS?.paintImageXObject,
                OPS?.paintInlineImageXObject,
                OPS?.paintImageMaskXObject,
                OPS?.paintImageXObjectRepeat,
                OPS?.paintJpegXObject,
                OPS?.paintFormXObjectBegin
            ].filter(v => v !== undefined)
        );
        const pathOpCodes = new Set(
            [
                OPS?.constructPath,
                OPS?.fill,
                OPS?.eoFill,
                OPS?.stroke
            ].filter(v => v !== undefined)
        );

        for (let i = 0; i < fnArray.length; i++) {
            const code = fnArray[i];
            if (imageOpCodes.has(code)) imageOps++;
            else if (pathOpCodes.has(code)) pathOps++;
        }

        return {
            hasImages: imageOps > 0,
            imageOps,
            hasDenseVectorGraphics: pathOps >= 20,
            pathOps
        };
    } catch {
        return {
            hasImages: true,
            imageOps: 0,
            hasDenseVectorGraphics: false,
            pathOps: 0
        };
    }
}

/**
 * Step 1 of PDF pipeline: Detect PDF type (searchable, scanned, or mixed) page-by-page.
 * Preserves selectable text on searchable pages and marks ONLY image/scanned pages as `ocr_pending`.
 */
async function analyzePdfPages(pdfBuffer, { onPageProgress } = {}) {
    if (ocrTestOverride?.analyzePdfPages) {
        return ocrTestOverride.analyzePdfPages(pdfBuffer, { onPageProgress });
    }

    const opened = await openPdfDocument(pdfBuffer);
    const { pdfjs, doc, numPages } = opened;

    try {
        if (numPages <= 0) {
            throw new Error('This PDF contains zero pages.');
        }

        const inspected = [];
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            let pageText = '';
            let visualInfo = { hasImages: false, hasDenseVectorGraphics: false, imageOps: 0, pathOps: 0 };

            try {
                const page = await doc.getPage(pageNum);
                const textContent = await page.getTextContent();
                pageText = formatPdfJsTextContent(textContent);

                const alphaNumCount = pageText.replace(/[^a-zA-Z0-9]/g, '').length;
                const wordCount = pageText.split(/\s+/).filter(w => /[a-zA-Z0-9]{2,}/.test(w)).length;
                const hasSelectableText =
                    alphaNumCount >= MIN_SEARCHABLE_PAGE_ALPHANUM ||
                    (alphaNumCount >= 18 && wordCount >= 4);

                if (!hasSelectableText) {
                    visualInfo = await inspectPageVisualContent(page, pdfjs.OPS);
                }

                inspected.push({
                    pageNumber: pageNum,
                    text: pageText,
                    alphaNumCount,
                    wordCount,
                    hasSelectableText,
                    hasVisualContent: visualInfo.hasImages || visualInfo.hasDenseVectorGraphics,
                    imageOps: visualInfo.imageOps
                });

                if (typeof page.cleanup === 'function') {
                    page.cleanup();
                }
            } catch (pageErr) {
                console.warn(`[PDF Analyze] Page ${pageNum}/${numPages} inspection warning:`, pageErr.message);
                inspected.push({
                    pageNumber: pageNum,
                    text: '',
                    alphaNumCount: 0,
                    wordCount: 0,
                    hasSelectableText: false,
                    hasVisualContent: true,
                    imageOps: 0
                });
            }

            if (onPageProgress) {
                await onPageProgress({ currentPage: pageNum, totalPages: numPages });
            }
        }

        const totalAlphaNum = inspected.reduce((sum, p) => sum + p.alphaNumCount, 0);
        const avgAlphaNum = totalAlphaNum / Math.max(1, numPages);
        const searchablePages = inspected.filter(p => p.hasSelectableText);
        const docLooksEntirelyScanned = searchablePages.length === 0 || avgAlphaNum < 25;

        const pages = inspected.map(p => {
            if (p.hasSelectableText) {
                return {
                    pageNumber: p.pageNumber,
                    text: p.text,
                    alphaNumCount: p.alphaNumCount,
                    needsOcr: false,
                    status: 'text_extracted',
                    extractionMethod: 'text'
                };
            }

            const shouldOcr = p.hasVisualContent || docLooksEntirelyScanned;
            if (shouldOcr) {
                return {
                    pageNumber: p.pageNumber,
                    text: p.text,
                    alphaNumCount: p.alphaNumCount,
                    needsOcr: true,
                    status: 'ocr_pending',
                    extractionMethod: 'ocr'
                };
            }

            // Sparse non-image separator/blank page inside an otherwise searchable PDF
            return {
                pageNumber: p.pageNumber,
                text: p.text,
                alphaNumCount: p.alphaNumCount,
                needsOcr: false,
                status: 'text_extracted',
                extractionMethod: 'text'
            };
        });

        const ocrPages = pages.filter(p => p.needsOcr);
        const textExtractedPages = pages.filter(p => !p.needsOcr && p.text.length >= 10);

        let documentType = 'searchable_pdf';
        if (ocrPages.length > 0 && textExtractedPages.length > 0) {
            documentType = 'mixed_pdf';
        } else if (ocrPages.length > 0) {
            documentType = 'scanned_pdf';
        }

        return {
            totalPages: numPages,
            documentType,
            ocrRequired: ocrPages.length > 0,
            searchablePageCount: textExtractedPages.length,
            ocrRequiredPageCount: ocrPages.length,
            pages
        };
    } finally {
        await opened.destroy();
    }
}

/**
 * Pure-JS pixel preprocessing on Canvas ImageData to improve OCR accuracy on faded,
 * skewed-contrast, yellowed, or low-quality scanned pages without extra native image libraries.
 */
function preprocessCanvasForOcr(context, width, height, mode = 'standard') {
    const imgData = context.getImageData(0, 0, width, height);
    const data = imgData.data;
    const pixelCount = width * height;
    const gray = new Uint8Array(pixelCount);
    const histogram = new Uint32Array(256);

    // 1. Convert RGBA to grayscale luminance (composited on white) and collect histogram
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const a = data[i + 3] / 255;
        const r = data[i] * a + 255 * (1 - a);
        const g = data[i + 1] * a + 255 * (1 - a);
        const b = data[i + 2] * a + 255 * (1 - a);
        const lum = Math.min(255, Math.max(0, Math.round(0.299 * r + 0.587 * g + 0.114 * b)));
        gray[p] = lum;
        histogram[lum]++;
    }

    // 2. Find 1st and 98th percentile luminance bounds for contrast stretching
    const lowTarget = Math.floor(pixelCount * 0.01);
    const highTarget = Math.floor(pixelCount * 0.98);
    let acc = 0;
    let minLum = 0;
    let maxLum = 255;
    for (let v = 0; v < 256; v++) {
        acc += histogram[v];
        if (acc >= lowTarget) {
            minLum = v;
            break;
        }
    }
    acc = 0;
    for (let v = 0; v < 256; v++) {
        acc += histogram[v];
        if (acc >= highTarget) {
            maxLum = v;
            break;
        }
    }

    const span = Math.max(1, maxLum - minLum);
    const stretchedHist = new Uint32Array(256);
    for (let p = 0; p < pixelCount; p++) {
        let val = gray[p];
        if (span < 245 && span >= 12) {
            val = Math.round(((val - minLum) * 255) / span);
            if (val < 0) val = 0;
            else if (val > 255) val = 255;
        }
        gray[p] = val;
        stretchedHist[val]++;
    }

    if (mode === 'enhanced_binarize') {
        // 3. Otsu's automatic global threshold for low-quality / faded / noisy scans
        let sumAll = 0;
        for (let t = 0; t < 256; t++) sumAll += t * stretchedHist[t];

        let sumB = 0;
        let wB = 0;
        let maxVar = -1;
        let threshold = 160;

        for (let t = 0; t < 256; t++) {
            wB += stretchedHist[t];
            if (wB === 0) continue;
            const wF = pixelCount - wB;
            if (wF === 0) break;

            sumB += t * stretchedHist[t];
            const mB = sumB / wB;
            const mF = (sumAll - sumB) / wF;
            const betweenVar = wB * wF * (mB - mF) * (mB - mF);
            if (betweenVar > maxVar) {
                maxVar = betweenVar;
                threshold = t;
            }
        }

        // Clamp threshold so nearly blank pages don't turn completely black
        const safeThreshold = Math.min(220, Math.max(85, threshold));

        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            const bw = gray[p] < safeThreshold ? 0 : 255;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
            data[i + 3] = 255;
        }
    } else {
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            const v = gray[p];
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
    }

    context.putImageData(imgData, 0, 0);
}

/**
 * Render a single PDF page to a preprocessed PNG buffer using PDF.js + @napi-rs/canvas.
 */
async function renderPdfPageToPng(doc, pageNumber, { scale = DEFAULT_OCR_SCALE, enhanceMode = 'standard' } = {}) {
    const page = await doc.getPage(pageNumber);
    try {
        const baseViewport = page.getViewport({ scale: 1.0 });
        const maxBaseDim = Math.max(baseViewport.width || 1, baseViewport.height || 1);
        const clampedScale = Math.min(scale, MAX_RENDER_DIMENSION / maxBaseDim);
        const effectiveScale = Math.max(1.0, clampedScale);
        const viewport = page.getViewport({ scale: effectiveScale });

        const factory = new NodeCanvasFactory();
        const canvasAndCtx = factory.create(viewport.width, viewport.height);
        const { canvas, context } = canvasAndCtx;

        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
            canvasContext: context,
            viewport,
            canvasFactory: factory
        }).promise;

        if (enhanceMode === 'standard' || enhanceMode === 'enhanced_binarize') {
            preprocessCanvasForOcr(context, canvas.width, canvas.height, enhanceMode);
        }

        const pngBuffer = canvas.toBuffer('image/png');
        const dims = { width: canvas.width, height: canvas.height };
        factory.destroy(canvasAndCtx);

        return { pngBuffer, ...dims };
    } finally {
        if (typeof page.cleanup === 'function') {
            page.cleanup();
        }
    }
}

function withTimeout(promise, ms, label) {
    let timer;
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timer = setTimeout(() => {
                const err = new Error(`${label} timed out after ${ms}ms.`);
                err.code = 'OCR_TIMEOUT';
                reject(err);
            }, ms);
        })
    ]).finally(() => clearTimeout(timer));
}

/**
 * Lazily initialize and reuse one warm offline Tesseract.js LSTM worker.
 */
async function getSharedOcrWorker(language = DEFAULT_OCR_LANGUAGE) {
    if (!sharedWorkerPromise) {
        const langPath = resolveBundledLangPath();
        const workerPath = resolveTesseractWorkerPath();
        const workerOpts = {
            cachePath: os.tmpdir(),
            gzip: true,
            ...(workerPath ? { workerPath } : {}),
            ...(langPath ? { langPath } : {})
        };

        sharedWorkerPromise = (async () => {
            const worker = await Tesseract.createWorker(language, Tesseract.OEM.LSTM_ONLY, workerOpts);
            await worker.setParameters({
                preserve_interword_spaces: '1'
            }).catch(() => {});
            return worker;
        })().catch(err => {
            sharedWorkerPromise = null;
            throw err;
        });
    }

    return sharedWorkerPromise;
}

async function terminateOcrWorker() {
    const existing = sharedWorkerPromise;
    sharedWorkerPromise = null;
    if (!existing) return;
    try {
        const worker = await existing;
        if (worker && typeof worker.terminate === 'function') {
            await worker.terminate();
        }
    } catch {
        // Ignore termination cleanup errors
    }
}

/**
 * Run Tesseract.js recognition serially through the warm worker with timeout & crash recovery.
 */
function runSerializedTesseract(imageBuffer, { psm = Tesseract.PSM.AUTO, timeoutMs = DEFAULT_PAGE_TIMEOUT_MS, pageNumber = 1 } = {}) {
    const task = async () => {
        const worker = await getSharedOcrWorker();
        await worker.setParameters({
            tessedit_pageseg_mode: String(psm)
        }).catch(() => {});

        try {
            const result = await withTimeout(
                worker.recognize(imageBuffer),
                timeoutMs,
                `OCR page ${pageNumber}`
            );
            return {
                text: cleanOcrText(result?.data?.text || ''),
                confidence: Number(result?.data?.confidence) || 0
            };
        } catch (err) {
            // Reset worker cleanly on timeout or WASM runtime error so next page starts fresh
            await terminateOcrWorker();
            throw err;
        }
    };

    const next = workerQueue.then(task, task);
    workerQueue = next.catch(() => {});
    return next;
}

function scoreOcrCandidate(text, confidence) {
    const alphaNum = String(text || '').replace(/[^a-zA-Z0-9]/g, '').length;
    const words = String(text || '').split(/\s+/).filter(w => /[a-zA-Z0-9]{2,}/.test(w)).length;
    return (alphaNum * 1.2) + (words * 4) + (Number(confidence) || 0);
}

/**
 * OCR a single page from an open PDF.js document with automatic low-quality scan retry.
 */
async function ocrSinglePdfPage(doc, pageNumber, { perPageTimeoutMs = DEFAULT_PAGE_TIMEOUT_MS, onPhase } = {}) {
    let attempts = 0;

    try {
        // Pass 1: Standard grayscale + histogram contrast stretch at 2.0x scale
        attempts++;
        if (onPhase) await onPhase('rendering');
        const pass1Img = await renderPdfPageToPng(doc, pageNumber, {
            scale: DEFAULT_OCR_SCALE,
            enhanceMode: 'standard'
        });

        if (onPhase) await onPhase('ocr_processing');
        const pass1 = await runSerializedTesseract(pass1Img.pngBuffer, {
            psm: Tesseract.PSM.AUTO,
            timeoutMs: perPageTimeoutMs,
            pageNumber
        });

        let best = pass1;
        const pass1Alpha = pass1.text.replace(/[^a-zA-Z0-9]/g, '').length;

        // Pass 2: Automatic retry for low-quality / faded / noisy scans using Otsu binarization at higher scale
        if (pass1Alpha < 30 || pass1.confidence < 50) {
            try {
                attempts++;
                if (onPhase) await onPhase('rendering');
                const pass2Img = await renderPdfPageToPng(doc, pageNumber, {
                    scale: Math.min(2.5, DEFAULT_OCR_SCALE + 0.4),
                    enhanceMode: 'enhanced_binarize'
                });

                if (onPhase) await onPhase('ocr_processing');
                const pass2 = await runSerializedTesseract(pass2Img.pngBuffer, {
                    psm: Tesseract.PSM.SINGLE_BLOCK,
                    timeoutMs: perPageTimeoutMs,
                    pageNumber
                });

                if (scoreOcrCandidate(pass2.text, pass2.confidence) > scoreOcrCandidate(best.text, best.confidence)) {
                    best = pass2;
                }
            } catch (retryErr) {
                console.warn(`[OCR] Low-quality enhancement retry skipped on page ${pageNumber}:`, retryErr.message);
            }
        }

        const bestAlpha = best.text.replace(/[^a-zA-Z0-9]/g, '').length;
        if (bestAlpha < MIN_OCR_PAGE_ALPHANUM) {
            return {
                pageNumber,
                ok: false,
                text: '',
                confidence: Math.round(best.confidence || 0),
                attempts,
                engine: 'tesseract.js',
                error: 'No legible text detected on this scanned page.'
            };
        }

        return {
            pageNumber,
            ok: true,
            text: best.text,
            confidence: Math.round(best.confidence || 0),
            attempts,
            engine: 'tesseract.js',
            error: ''
        };
    } catch (err) {
        return {
            pageNumber,
            ok: false,
            text: '',
            confidence: 0,
            attempts: Math.max(1, attempts),
            engine: 'tesseract.js',
            error: String(err?.message || 'OCR failed on this page.').slice(0, 300)
        };
    }
}

/**
 * Optional delegation to a self-hosted open-source OCR worker service (e.g. Render/Fly/Railway Docker container).
 */
async function runExternalOcrWorkerBatch(pdfBuffer, pageNumbers, { bookId = '' } = {}) {
    const cfg = getOcrWorkerConfig();
    if (!cfg.configured) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        };
        if (cfg.secret) {
            headers.Authorization = `Bearer ${cfg.secret}`;
        }

        const resp = await fetch(`${cfg.url}/ocr/batch`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                bookId,
                pageNumbers,
                language: DEFAULT_OCR_LANGUAGE,
                pdfBase64: pdfBuffer.toString('base64')
            }),
            signal: controller.signal
        });

        if (!resp.ok) {
            const errText = await resp.text().catch(() => '');
            throw new Error(`OCR worker HTTP ${resp.status}: ${errText.slice(0, 200)}`);
        }

        const data = await resp.json();
        if (!data || !Array.isArray(data.pages)) {
            throw new Error('OCR worker returned malformed payload (missing pages array).');
        }

        const results = data.pages.map(p => {
            const cleaned = cleanOcrText(p?.text || '');
            const alphaNum = cleaned.replace(/[^a-zA-Z0-9]/g, '').length;
            const ok = p?.ok !== false && alphaNum >= MIN_OCR_PAGE_ALPHANUM;
            return {
                pageNumber: Number(p?.pageNumber) || 1,
                ok,
                text: ok ? cleaned : '',
                confidence: Math.round(Number(p?.confidence) || 0),
                attempts: Number(p?.attempts) || 1,
                engine: String(data.engine || 'ocr_worker'),
                error: ok ? '' : String(p?.error || 'No legible text detected on this page.')
            };
        });

        return {
            results,
            engine: String(data.engine || 'ocr_worker')
        };
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Run batched, time-bounded OCR on a specific list of PDF page numbers.
 * Opens the PDF once, processes pages sequentially while honoring `timeBudgetMs` and `maxPagesPerBatch`,
 * and invokes `onPageComplete` after EVERY page so MongoDB progress is always durable.
 */
async function runOcrOnPdfPages(
    pdfBuffer,
    pageNumbers,
    {
        bookId = '',
        timeBudgetMs = 0,
        maxPagesPerBatch = 0,
        perPageTimeoutMs = DEFAULT_PAGE_TIMEOUT_MS,
        onPageStart,
        onPageComplete
    } = {}
) {
    if (ocrTestOverride?.runOcrOnPdfPages) {
        return ocrTestOverride.runOcrOnPdfPages(pdfBuffer, pageNumbers, {
            bookId,
            timeBudgetMs,
            maxPagesPerBatch,
            perPageTimeoutMs,
            onPageStart,
            onPageComplete
        });
    }

    const uniquePages = Array.from(
        new Set((Array.isArray(pageNumbers) ? pageNumbers : []).map(Number).filter(n => Number.isFinite(n) && n >= 1))
    ).sort((a, b) => a - b);

    if (uniquePages.length === 0) {
        return { results: [], processedCount: 0, engine: getOcrEngineInfo().primaryEngine, budgetExhausted: false };
    }

    const targetPages = maxPagesPerBatch > 0 ? uniquePages.slice(0, maxPagesPerBatch) : uniquePages;
    const workerCfg = getOcrWorkerConfig();

    // 1. Optional external self-hosted OCR worker path (when OCR_WORKER_URL is configured)
    if (workerCfg.configured) {
        try {
            if (onPageStart) {
                await onPageStart({ pageNumber: targetPages[0], phase: 'ocr_processing', batchSize: targetPages.length });
            }
            const workerRes = await runExternalOcrWorkerBatch(pdfBuffer, targetPages, { bookId });
            if (workerRes && Array.isArray(workerRes.results)) {
                for (const pageResult of workerRes.results) {
                    if (onPageComplete) {
                        await onPageComplete(pageResult);
                    }
                }
                return {
                    results: workerRes.results,
                    processedCount: workerRes.results.length,
                    engine: workerRes.engine,
                    budgetExhausted: targetPages.length < uniquePages.length
                };
            }
        } catch (workerErr) {
            if (!workerCfg.allowFallback) {
                throw new Error(`Self-hosted OCR worker failed: ${workerErr.message}`);
            }
            console.warn('[OCR] External worker unavailable; falling back to built-in Tesseract.js:', workerErr.message);
        }
    }

    // 2. Built-in Vercel-compatible Free OCR Engine (PDF.js + @napi-rs/canvas + Offline Tesseract.js LSTM)
    const startedAt = Date.now();
    const opened = await openPdfDocument(pdfBuffer);
    const results = [];
    let budgetExhausted = false;

    try {
        for (let idx = 0; idx < targetPages.length; idx++) {
            const pageNumber = targetPages[idx];

            // Always process at least 1 page per step so forward progress is guaranteed
            if (timeBudgetMs > 0 && idx > 0 && (Date.now() - startedAt) >= timeBudgetMs) {
                budgetExhausted = true;
                break;
            }

            const remainingMs = timeBudgetMs > 0
                ? Math.max(8000, Math.min(perPageTimeoutMs, timeBudgetMs - (Date.now() - startedAt) + 4000))
                : perPageTimeoutMs;

            const pageResult = await ocrSinglePdfPage(opened.doc, pageNumber, {
                perPageTimeoutMs: remainingMs,
                onPhase: async (phase) => {
                    if (onPageStart) {
                        await onPageStart({ pageNumber, phase, batchIndex: idx + 1, batchSize: targetPages.length });
                    }
                }
            });

            results.push(pageResult);
            if (onPageComplete) {
                await onPageComplete(pageResult);
            }
        }

        if (targetPages.length < uniquePages.length) {
            budgetExhausted = true;
        }
    } finally {
        await opened.destroy();
    }

    return {
        results,
        processedCount: results.length,
        engine: 'tesseract.js',
        budgetExhausted
    };
}

module.exports = {
    MIN_SEARCHABLE_PAGE_ALPHANUM,
    MIN_OCR_PAGE_ALPHANUM,
    DEFAULT_BATCH_PAGES,
    DEFAULT_PAGE_TIMEOUT_MS,
    NodeCanvasFactory,
    getOcrEngineInfo,
    getOcrWorkerConfig,
    loadModernPdfjs,
    openPdfDocument,
    cleanOcrText,
    analyzePdfPages,
    renderPdfPageToPng,
    preprocessCanvasForOcr,
    ocrSinglePdfPage,
    runOcrOnPdfPages,
    terminateOcrWorker,
    setOcrTestOverride
};
