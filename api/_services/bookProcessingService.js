const crypto = require('crypto');
const prisma = require('../_config/prisma');
const { normalizeTechnology } = require('../_utils/ragTechnology');
const {
    generateEmbeddings,
    getActiveProviderInfo,
    getDetailedProviderInfo
} = require('./aiProviderService');
const { redactSecrets } = require('./aiUsageService');
const {
    normalizeBuffer,
    validateUploadedBookFile,
    extractBookDocument,
    prepareExtractedPages,
    chunkExtractedPages,
    sha256
} = require('./bookExtractorService');
const {
    DEFAULT_BATCH_PAGES,
    getOcrEngineInfo,
    analyzePdfPages,
    runOcrOnPdfPages,
    cleanOcrText
} = require('./ocrService');

const FILE_PART_SIZE_BYTES = 2 * 1024 * 1024; // 2MB per MongoDB binary part (safe well under 16MB BSON cap)
const LOCK_TTL_MS = 45 * 1000; // 45s lease expiry so interrupted Vercel functions recover automatically
const DEFAULT_STEP_TIME_BUDGET_MS = 18 * 1000; // 18s per step (well within Vercel maxDuration & client timeouts)
const EMBEDDING_BATCH_SIZE = 20;
const CHUNK_INSERT_BATCH_SIZE = 50;

const activeProcessingJobs = new Set();
// Fallback in-memory page store used ONLY in offline unit tests where prisma.knowledgeBook is mocked without prisma.knowledgeBookPage
const testFallbackPageStore = new Map();

const PROCESSING_STATUSES = {
    UPLOADED: 'Uploaded',
    PROCESSING: 'Processing',
    DETECTING_PDF_TYPE: 'Detecting PDF Type',
    OCR_REQUIRED: 'OCR Required',
    OCR_PROCESSING: 'OCR Processing',
    EXTRACTING_TEXT: 'Extracting Text',
    PREPARING_CONTENT: 'Preparing Content',
    GENERATING_CHUNKS: 'Generating Chunks',
    GENERATING_EMBEDDINGS: 'Generating Embeddings',
    INDEXING: 'Indexing',
    COMPLETED: 'Completed',
    FAILED: 'Failed'
};

const PROCESSING_STAGES = {
    UPLOADED: 'uploaded',
    DETECTING_PDF_TYPE: 'detecting_pdf_type',
    OCR_REQUIRED: 'ocr_required',
    OCR_PROCESSING: 'ocr_processing',
    EXTRACTING_TEXT: 'extracting_text',
    PREPARING_CONTENT: 'preparing_content',
    CHUNKING: 'chunking',
    GENERATING_EMBEDDINGS: 'generating_embeddings',
    INDEXING: 'indexing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

const IN_PROGRESS_STATUS_LIST = [
    PROCESSING_STATUSES.UPLOADED,
    PROCESSING_STATUSES.PROCESSING,
    PROCESSING_STATUSES.DETECTING_PDF_TYPE,
    PROCESSING_STATUSES.OCR_REQUIRED,
    PROCESSING_STATUSES.OCR_PROCESSING,
    PROCESSING_STATUSES.EXTRACTING_TEXT,
    PROCESSING_STATUSES.PREPARING_CONTENT,
    PROCESSING_STATUSES.GENERATING_CHUNKS,
    PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
    PROCESSING_STATUSES.INDEXING
];

const IN_PROGRESS_STATUS_SET = new Set(IN_PROGRESS_STATUS_LIST);

function isServerlessRuntime() {
    return Boolean(
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.NETLIFY
    );
}

function isInProgressStatus(status) {
    return IN_PROGRESS_STATUS_SET.has(String(status || ''));
}

function shouldUseTestFallbackPageStore() {
    if (process.env.NODE_ENV !== 'test') return false;
    if (!prisma.knowledgeBookPage || typeof prisma.knowledgeBookPage.findMany !== 'function') {
        return true;
    }
    // If a legacy unit test replaced prisma.knowledgeBook with a plain mock object without mocking prisma.knowledgeBookPage,
    // avoid hitting a real/unconfigured MongoDB connection for knowledgeBookPage.
    const bookModelIsMock = prisma.knowledgeBook && prisma.knowledgeBook.constructor === Object;
    const pageModelIsMock = prisma.knowledgeBookPage && prisma.knowledgeBookPage.constructor === Object;
    return bookModelIsMock && !pageModelIsMock;
}

async function listBookPages(bookId) {
    if (shouldUseTestFallbackPageStore()) {
        const map = testFallbackPageStore.get(bookId);
        if (!map) return [];
        return Array.from(map.values()).sort((a, b) => a.pageNumber - b.pageNumber);
    }
    return prisma.knowledgeBookPage.findMany({
        where: { bookId },
        orderBy: { pageNumber: 'asc' }
    });
}

async function deleteBookPages(bookId) {
    if (shouldUseTestFallbackPageStore()) {
        testFallbackPageStore.delete(bookId);
        return { count: 1 };
    }
    if (typeof prisma.knowledgeBookPage?.deleteMany === 'function') {
        return prisma.knowledgeBookPage.deleteMany({ where: { bookId } });
    }
    return { count: 0 };
}

async function replaceInitialBookPages(bookId, pages) {
    await deleteBookPages(bookId);

    const records = pages.map(p => ({
        bookId,
        pageNumber: Number(p.pageNumber) || 1,
        extractionMethod: p.extractionMethod || (p.needsOcr ? 'ocr' : 'text'),
        status: p.status || (p.needsOcr ? 'ocr_pending' : 'text_extracted'),
        chapter: p.chapter || '',
        text: p.text || '',
        charCount: (p.text || '').length,
        ocrConfidence: Number(p.ocrConfidence) || 0,
        ocrAttempts: Number(p.ocrAttempts) || 0,
        ocrError: p.ocrError || ''
    }));

    if (shouldUseTestFallbackPageStore()) {
        const map = new Map();
        for (const rec of records) {
            map.set(rec.pageNumber, { ...rec, updatedAt: new Date() });
        }
        testFallbackPageStore.set(bookId, map);
        return records;
    }

    if (records.length > 0) {
        if (typeof prisma.knowledgeBookPage?.createMany === 'function') {
            for (let i = 0; i < records.length; i += 100) {
                await prisma.knowledgeBookPage.createMany({ data: records.slice(i, i + 100) });
            }
        } else {
            for (const rec of records) {
                await prisma.knowledgeBookPage.upsert({
                    where: { bookId_pageNumber: { bookId, pageNumber: rec.pageNumber } },
                    update: rec,
                    create: rec
                });
            }
        }
    }

    return records;
}

async function saveBookPageOcrResult(bookId, pageNumber, updateFields) {
    if (shouldUseTestFallbackPageStore()) {
        let map = testFallbackPageStore.get(bookId);
        if (!map) {
            map = new Map();
            testFallbackPageStore.set(bookId, map);
        }
        const prev = map.get(pageNumber) || {
            bookId,
            pageNumber,
            extractionMethod: 'ocr',
            ocrAttempts: 0
        };
        const next = {
            ...prev,
            ...updateFields,
            ocrAttempts: (prev.ocrAttempts || 0) + (updateFields.attemptIncrement || 1),
            updatedAt: new Date()
        };
        delete next.attemptIncrement;
        map.set(pageNumber, next);
        return next;
    }

    const { attemptIncrement = 1, ...cleanFields } = updateFields;
    const existing = await prisma.knowledgeBookPage.findUnique({
        where: { bookId_pageNumber: { bookId, pageNumber } }
    }).catch(() => null);

    if (existing) {
        return prisma.knowledgeBookPage.update({
            where: { bookId_pageNumber: { bookId, pageNumber } },
            data: {
                ...cleanFields,
                ocrAttempts: (existing.ocrAttempts || 0) + attemptIncrement
            }
        });
    }

    return prisma.knowledgeBookPage.create({
        data: {
            bookId,
            pageNumber,
            extractionMethod: 'ocr',
            ocrAttempts: attemptIncrement,
            ...cleanFields
        }
    });
}

async function resetFailedOcrPages(bookId) {
    if (shouldUseTestFallbackPageStore()) {
        const map = testFallbackPageStore.get(bookId);
        if (!map) return 0;
        let count = 0;
        for (const [pg, rec] of map.entries()) {
            if (rec.status === 'ocr_failed') {
                map.set(pg, { ...rec, status: 'ocr_pending', ocrError: '', updatedAt: new Date() });
                count++;
            }
        }
        return count;
    }

    const res = await prisma.knowledgeBookPage.updateMany({
        where: { bookId, status: 'ocr_failed' },
        data: { status: 'ocr_pending', ocrError: '' }
    });
    return res?.count || 0;
}

function summarizeBookPages(pages, fallbackTotalPages = 0) {
    const list = Array.isArray(pages) ? pages : [];
    const totalPages = Math.max(fallbackTotalPages || 0, list.length);
    const textLayerPages = list.filter(p => p.status === 'text_extracted' && String(p.text || '').trim().length >= 10).length;
    const ocrCompletedPages = list.filter(p => p.status === 'ocr_completed' && String(p.text || '').trim().length >= 10).length;
    const ocrFailedPages = list.filter(p => p.status === 'ocr_failed').length;
    const ocrPendingPages = list.filter(p => p.status === 'ocr_pending').length;
    const ocrTotalPages = list.filter(p => p.extractionMethod === 'ocr' || ['ocr_pending', 'ocr_completed', 'ocr_failed'].includes(p.status)).length;
    const ocrProcessedPages = ocrCompletedPages + ocrFailedPages;
    const textExtractedPages = textLayerPages + ocrCompletedPages;

    return {
        totalPages,
        textLayerPages,
        ocrTotalPages,
        ocrCompletedPages,
        ocrFailedPages,
        ocrPendingPages,
        ocrProcessedPages,
        textExtractedPages
    };
}

function inferProcessingStage(book) {
    if (!book) return PROCESSING_STAGES.UPLOADED;
    if (book.processingStatus === PROCESSING_STATUSES.COMPLETED) {
        return PROCESSING_STAGES.COMPLETED;
    }

    const explicit = String(book.processingStage || '').trim().toLowerCase();
    const validActiveStages = new Set([
        PROCESSING_STAGES.UPLOADED,
        PROCESSING_STAGES.DETECTING_PDF_TYPE,
        PROCESSING_STAGES.OCR_REQUIRED,
        PROCESSING_STAGES.OCR_PROCESSING,
        PROCESSING_STAGES.EXTRACTING_TEXT,
        PROCESSING_STAGES.PREPARING_CONTENT,
        PROCESSING_STAGES.CHUNKING,
        PROCESSING_STAGES.GENERATING_EMBEDDINGS,
        PROCESSING_STAGES.INDEXING
    ]);
    if (validActiveStages.has(explicit)) {
        return explicit;
    }

    switch (book.processingStatus) {
        case PROCESSING_STATUSES.DETECTING_PDF_TYPE:
            return PROCESSING_STAGES.DETECTING_PDF_TYPE;
        case PROCESSING_STATUSES.OCR_REQUIRED:
            return PROCESSING_STAGES.OCR_REQUIRED;
        case PROCESSING_STATUSES.OCR_PROCESSING:
            return PROCESSING_STAGES.OCR_PROCESSING;
        case PROCESSING_STATUSES.GENERATING_EMBEDDINGS:
            return PROCESSING_STAGES.GENERATING_EMBEDDINGS;
        case PROCESSING_STATUSES.INDEXING:
            return PROCESSING_STAGES.INDEXING;
        case PROCESSING_STATUSES.GENERATING_CHUNKS:
            return PROCESSING_STAGES.CHUNKING;
        case PROCESSING_STATUSES.PREPARING_CONTENT:
            return PROCESSING_STAGES.PREPARING_CONTENT;
        case PROCESSING_STATUSES.EXTRACTING_TEXT:
            return PROCESSING_STAGES.EXTRACTING_TEXT;
        case PROCESSING_STATUSES.FAILED:
            return PROCESSING_STAGES.FAILED;
        default:
            return PROCESSING_STAGES.UPLOADED;
    }
}

/**
 * Determine whether an in-progress book has a stale or missing lease lock
 * (for example, interrupted by a Vercel timeout or legacy unawaited promise).
 */
function isBookProcessingStalled(book, nowMs = Date.now()) {
    if (!book || !isInProgressStatus(book.processingStatus)) return false;

    const hasLock = Boolean(book.processingLockId && String(book.processingLockId).trim());
    const lastActivity = book.processingHeartbeatAt || book.processingLockedAt || book.updatedAt || book.createdAt;
    const lastMs = lastActivity ? new Date(lastActivity).getTime() : 0;

    if (!hasLock) {
        return !lastMs || (nowMs - lastMs) > 5000;
    }

    if (!lastMs) return true;
    return (nowMs - lastMs) > LOCK_TTL_MS;
}

/**
 * Store original uploaded file buffer securely in MongoDB Atlas `knowledge_book_file_parts`
 */
async function storeBookBinaryParts(bookId, buffer) {
    const fileBuffer = normalizeBuffer(buffer);
    await prisma.knowledgeBookFilePart.deleteMany({ where: { bookId } });
    const totalParts = Math.max(1, Math.ceil(fileBuffer.length / FILE_PART_SIZE_BYTES));

    for (let i = 0; i < totalParts; i++) {
        const start = i * FILE_PART_SIZE_BYTES;
        const end = Math.min(fileBuffer.length, start + FILE_PART_SIZE_BYTES);
        const slice = fileBuffer.subarray(start, end);
        await prisma.knowledgeBookFilePart.create({
            data: {
                bookId,
                partIndex: i,
                data: slice
            }
        });
    }

    return totalParts;
}

/**
 * Reconstruct original book binary from MongoDB Atlas secure parts and verify completeness.
 */
async function loadBookBinaryFromParts(bookId, expectedTotalParts = 0) {
    const parts = await prisma.knowledgeBookFilePart.findMany({
        where: { bookId },
        orderBy: { partIndex: 'asc' }
    });
    if (!parts || parts.length === 0) {
        throw new Error('Stored original book file could not be found in database storage. Please replace or re-upload the book.');
    }
    if (expectedTotalParts > 0 && parts.length < expectedTotalParts) {
        throw new Error(
            `Stored book file is incomplete (${parts.length} of ${expectedTotalParts} binary parts found). Please re-upload the book.`
        );
    }

    const buffers = parts.map(p => normalizeBuffer(p.data));
    const combined = Buffer.concat(buffers);
    if (!combined || combined.length === 0) {
        throw new Error('Stored book file binary is empty or unreadable. Please re-upload the book.');
    }
    return combined;
}

/**
 * Check for duplicate book by SHA-256 fileHash or matching title+author+edition+technology
 */
async function findDuplicateBook({ fileHash, title, author, edition, technologyNormalized, excludeBookId }) {
    const whereHash = { fileHash };
    if (excludeBookId) whereHash.id = { not: excludeBookId };
    const hashMatch = await prisma.knowledgeBook.findFirst({ where: whereHash });
    if (hashMatch) {
        return { reason: 'file_hash', book: hashMatch };
    }

    const cleanTitle = String(title || '').trim();
    const cleanAuthor = String(author || '').trim();
    const cleanEdition = String(edition || '').trim();
    if (cleanTitle && technologyNormalized) {
        const candidates = await prisma.knowledgeBook.findMany({
            where: {
                technologyNormalized,
                ...(excludeBookId ? { id: { not: excludeBookId } } : {})
            },
            select: { id: true, title: true, author: true, edition: true, technology: true }
        });
        const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const metaMatch = candidates.find(b =>
            norm(b.title) === norm(cleanTitle) &&
            norm(b.author) === norm(cleanAuthor) &&
            norm(b.edition) === norm(cleanEdition)
        );
        if (metaMatch) {
            return { reason: 'metadata', book: metaMatch };
        }
    }

    return null;
}

async function updateBookStatus(bookId, fields) {
    return prisma.knowledgeBook.update({
        where: { id: bookId },
        data: {
            ...fields,
            processingHeartbeatAt: new Date()
        }
    });
}

/**
 * Acquire an atomic distributed lease lock in MongoDB so two serverless instances
 * never process the same book simultaneously, while stale locks recover after LOCK_TTL_MS.
 */
async function acquireBookProcessingLock(bookId) {
    if (activeProcessingJobs.has(bookId)) {
        return { acquired: false, lockId: '' };
    }

    const lockId = `lock_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const now = new Date();
    const staleCutoff = new Date(now.getTime() - LOCK_TTL_MS);

    if (typeof prisma.knowledgeBook?.updateMany === 'function') {
        const res = await prisma.knowledgeBook.updateMany({
            where: {
                id: bookId,
                OR: [
                    { processingLockId: null },
                    { processingLockId: '' },
                    { processingLockedAt: null },
                    { processingLockedAt: { lt: staleCutoff } }
                ]
            },
            data: {
                processingLockId: lockId,
                processingLockedAt: now,
                processingHeartbeatAt: now
            }
        });

        if (!res || res.count === 0) {
            return { acquired: false, lockId: '' };
        }
    } else {
        await prisma.knowledgeBook.update({
            where: { id: bookId },
            data: {
                processingLockId: lockId,
                processingLockedAt: now,
                processingHeartbeatAt: now
            }
        });
    }

    activeProcessingJobs.add(bookId);
    return { acquired: true, lockId };
}

async function refreshBookProcessingLock(bookId, lockId) {
    const now = new Date();
    if (typeof prisma.knowledgeBook?.updateMany === 'function') {
        await prisma.knowledgeBook.updateMany({
            where: { id: bookId, processingLockId: lockId },
            data: {
                processingLockedAt: now,
                processingHeartbeatAt: now
            }
        }).catch(() => {});
    }
}

async function releaseBookProcessingLock(bookId, lockId) {
    activeProcessingJobs.delete(bookId);
    if (!lockId) return;

    if (typeof prisma.knowledgeBook?.updateMany === 'function') {
        await prisma.knowledgeBook.updateMany({
            where: { id: bookId, processingLockId: lockId },
            data: {
                processingLockId: '',
                processingLockedAt: null
            }
        }).catch(() => {});
    } else {
        await prisma.knowledgeBook.update({
            where: { id: bookId },
            data: {
                processingLockId: '',
                processingLockedAt: null
            }
        }).catch(() => {});
    }
}

/**
 * Persist updated embedding vectors for a batch of chunks safely across both real Prisma MongoDB
 * and lightweight unit-test mocks.
 */
async function persistChunkEmbeddingsBatch(bookId, updates) {
    if (!Array.isArray(updates) || updates.length === 0) return;

    if (typeof prisma.knowledgeBookChunk?.update === 'function') {
        await Promise.all(
            updates.map(({ id, embedding }) =>
                prisma.knowledgeBookChunk.update({
                    where: { id },
                    data: { embedding }
                })
            )
        );
        return;
    }

    const allChunks = await prisma.knowledgeBookChunk.findMany({ where: { bookId } });
    const updateMap = new Map(updates.map(u => [u.id, u.embedding]));
    const rebuilt = allChunks.map(c => {
        const { id, createdAt, ...rest } = c;
        return {
            ...rest,
            embedding: updateMap.has(id) ? updateMap.get(id) : (c.embedding || [])
        };
    });
    await prisma.knowledgeBookChunk.deleteMany({ where: { bookId } });
    if (rebuilt.length > 0) {
        await prisma.knowledgeBookChunk.createMany({ data: rebuilt });
    }
}

/**
 * Execute one resumable, time-bounded step of the book processing state machine.
 *
 * Real persisted progress map:
 *  - 0–10%:  Uploaded & validated
 *  - 10–18%: Detecting PDF Type (per-page selectable text vs scanned image inspection)
 *  - 18–62%: OCR Processing (batched per-page PDF.js rendering + free Tesseract.js / self-hosted worker, saved after every page!)
 *            OR 12–40%: Extracting Text (normal searchable PDF, DOCX, TXT)
 *  - 62–68%: Preparing Content (cleaning, normalization, chapter heading detection)
 *  - 68–76%: Generating Chunks (overlapping chunks preserving page numbers)
 *  - 76–92%: Generating Embeddings (resumable batched embeddings, or transparent Text Fallback Mode with 0 vectors)
 *  - 92–100%: Indexing & Final Validation
 */
async function runBookProcessingStep(bookId, {
    timeBudgetMs = DEFAULT_STEP_TIME_BUDGET_MS,
    preloadedBuffer = null,
    forceReextract = false
} = {}) {
    const existingBook = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
    if (!existingBook) {
        const err = new Error('Reference book record not found.');
        err.status = 404;
        throw err;
    }

    if (!forceReextract && existingBook.processingStatus === PROCESSING_STATUSES.COMPLETED && existingBook.indexedChunks > 0) {
        return {
            book: existingBook,
            done: true,
            locked: false,
            alreadyCompleted: true,
            needsMoreSteps: false,
            reusedEmbeddings: 0,
            generatedEmbeddings: 0
        };
    }

    const lock = await acquireBookProcessingLock(bookId);
    if (!lock.acquired) {
        return {
            book: existingBook,
            done: false,
            locked: true,
            alreadyRunning: true,
            needsMoreSteps: true,
            reusedEmbeddings: 0,
            generatedEmbeddings: 0
        };
    }

    const stepStartedAt = Date.now();
    let reusedEmbeddings = 0;
    let generatedEmbeddings = 0;
    let cachedFileBuffer = preloadedBuffer ? normalizeBuffer(preloadedBuffer) : null;

    const getFileBuffer = async (targetBook) => {
        if (cachedFileBuffer && cachedFileBuffer.length > 0) return cachedFileBuffer;
        cachedFileBuffer = await loadBookBinaryFromParts(bookId, targetBook.totalParts || 0);
        return cachedFileBuffer;
    };

    try {
        let book = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
        if (!book) {
            throw new Error('Reference book record not found.');
        }

        let currentStage = forceReextract ? PROCESSING_STAGES.UPLOADED : inferProcessingStage(book);
        let inMemoryExtracted = null;

        const existingBookChunks = await prisma.knowledgeBookChunk.findMany({
            where: { bookId },
            select: {
                id: true,
                chunkIndex: true,
                chapter: true,
                chunkText: true,
                contentHash: true,
                embedding: true
            }
        });

        const existingPages = book.fileType === 'pdf' && !forceReextract
            ? await listBookPages(bookId)
            : [];

        if (currentStage === PROCESSING_STAGES.FAILED) {
            if (!forceReextract && existingBookChunks.length > 0) {
                currentStage = PROCESSING_STAGES.GENERATING_EMBEDDINGS;
            } else if (!forceReextract && existingPages.some(p => p.status === 'ocr_pending')) {
                currentStage = PROCESSING_STAGES.OCR_PROCESSING;
            } else {
                currentStage = PROCESSING_STAGES.UPLOADED;
            }
        }

        if (
            (currentStage === PROCESSING_STAGES.GENERATING_EMBEDDINGS || currentStage === PROCESSING_STAGES.INDEXING) &&
            existingBookChunks.length === 0
        ) {
            currentStage = existingPages.some(p => p.status === 'ocr_pending')
                ? PROCESSING_STAGES.OCR_PROCESSING
                : (existingPages.length > 0 ? PROCESSING_STAGES.PREPARING_CONTENT : PROCESSING_STAGES.UPLOADED);
        }

        book = await updateBookStatus(bookId, {
            processingError: '',
            processingAttempts: (book.processingAttempts || 0) + 1
        });

        // ============================================================
        // STAGE 1: PDF Type Detection OR Non-PDF Text Extraction
        // ============================================================
        if ([
            PROCESSING_STAGES.UPLOADED,
            PROCESSING_STAGES.DETECTING_PDF_TYPE,
            PROCESSING_STAGES.EXTRACTING_TEXT
        ].includes(currentStage)) {
            if (book.fileType === 'pdf') {
                // Resume directly to OCR/Chunking if pages were already analyzed & persisted!
                if (!forceReextract && existingPages.length > 0) {
                    const hasPendingOcr = existingPages.some(p => p.status === 'ocr_pending');
                    currentStage = hasPendingOcr ? PROCESSING_STAGES.OCR_PROCESSING : PROCESSING_STAGES.PREPARING_CONTENT;
                } else {
                    book = await updateBookStatus(bookId, {
                        processingStatus: PROCESSING_STATUSES.DETECTING_PDF_TYPE,
                        processingStage: PROCESSING_STAGES.DETECTING_PDF_TYPE,
                        processingProgress: 12,
                        ocrCurrentPhase: 'Detecting PDF type'
                    });

                    const fileBuffer = await getFileBuffer(book);
                    let lastProgressUpdateAt = Date.now();

                    let analysis;
                    try {
                        analysis = await analyzePdfPages(fileBuffer, {
                            onPageProgress: async ({ currentPage, totalPages }) => {
                                const now = Date.now();
                                if (totalPages > 0 && (now - lastProgressUpdateAt >= 1200 || currentPage === totalPages)) {
                                    lastProgressUpdateAt = now;
                                    const pct = Math.min(18, 12 + Math.round((currentPage / totalPages) * 6));
                                    await updateBookStatus(bookId, {
                                        processingStatus: PROCESSING_STATUSES.DETECTING_PDF_TYPE,
                                        processingStage: PROCESSING_STAGES.DETECTING_PDF_TYPE,
                                        processingProgress: pct,
                                        totalPages,
                                        ocrCurrentPhase: `Detecting PDF type (page ${currentPage}/${totalPages})`
                                    }).catch(() => {});
                                    await refreshBookProcessingLock(bookId, lock.lockId);
                                }
                            }
                        });
                    } catch (err) {
                        const msg = String(err?.message || 'corrupted or unsupported PDF structure');
                        if (/password-protected|encrypted/i.test(msg)) throw err;
                        throw new Error(`Unable to read this PDF (${msg}). Please re-export the PDF or upload a DOCX/TXT version.`);
                    }

                    await replaceInitialBookPages(bookId, analysis.pages);

                    if (analysis.ocrRequired) {
                        const engineInfo = getOcrEngineInfo();
                        book = await updateBookStatus(bookId, {
                            ocrRequired: true,
                            ocrUsed: false,
                            ocrStatus: 'required',
                            ocrEngine: engineInfo.primaryEngine,
                            totalPages: analysis.totalPages,
                            ocrTotalPages: analysis.ocrRequiredPageCount,
                            ocrProcessedPages: 0,
                            ocrFailedPages: 0,
                            extractedPagesCount: analysis.searchablePageCount,
                            textExtractedPages: analysis.searchablePageCount,
                            ocrCurrentPhase: `OCR required for ${analysis.ocrRequiredPageCount} of ${analysis.totalPages} pages`,
                            processingStatus: PROCESSING_STATUSES.OCR_REQUIRED,
                            processingStage: PROCESSING_STAGES.OCR_REQUIRED,
                            processingProgress: 18
                        });

                        currentStage = PROCESSING_STAGES.OCR_PROCESSING;

                        if (timeBudgetMs > 0 && (Date.now() - stepStartedAt) >= timeBudgetMs) {
                            return {
                                book,
                                done: false,
                                locked: false,
                                needsMoreSteps: true,
                                stage: PROCESSING_STAGES.OCR_REQUIRED,
                                progress: book.processingProgress,
                                reusedEmbeddings,
                                generatedEmbeddings
                            };
                        }
                    } else {
                        // Normal searchable PDF — no OCR needed
                        book = await updateBookStatus(bookId, {
                            ocrRequired: false,
                            ocrUsed: false,
                            ocrStatus: 'not_required',
                            ocrEngine: 'none',
                            totalPages: analysis.totalPages,
                            ocrTotalPages: 0,
                            ocrProcessedPages: 0,
                            ocrFailedPages: 0,
                            extractedPagesCount: analysis.searchablePageCount,
                            textExtractedPages: analysis.searchablePageCount,
                            ocrCurrentPhase: 'Extracting text from searchable PDF',
                            processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
                            processingStage: PROCESSING_STAGES.EXTRACTING_TEXT,
                            processingProgress: 35
                        });

                        currentStage = PROCESSING_STAGES.PREPARING_CONTENT;
                    }
                }
            } else {
                // DOCX / TXT extraction path (preserved cleanly)
                book = await updateBookStatus(bookId, {
                    processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
                    processingStage: PROCESSING_STAGES.EXTRACTING_TEXT,
                    processingProgress: 15,
                    ocrRequired: false,
                    ocrStatus: 'not_required',
                    ocrEngine: 'none',
                    ocrCurrentPhase: `Extracting text from ${String(book.fileType || '').toUpperCase()}`
                });

                const fileBuffer = await getFileBuffer(book);
                inMemoryExtracted = await extractBookDocument(fileBuffer, book.fileType);

                book = await updateBookStatus(bookId, {
                    ocrUsed: false,
                    ocrRequired: false,
                    ocrStatus: 'not_required',
                    totalPages: inMemoryExtracted.totalPages,
                    extractedPagesCount: inMemoryExtracted.pages.length,
                    textExtractedPages: inMemoryExtracted.pages.length,
                    processingStatus: PROCESSING_STATUSES.PREPARING_CONTENT,
                    processingStage: PROCESSING_STAGES.PREPARING_CONTENT,
                    processingProgress: 45,
                    ocrCurrentPhase: 'Preparing extracted content'
                });

                currentStage = PROCESSING_STAGES.CHUNKING;
            }
        }

        // ============================================================
        // STAGE 2: Resumable Batched OCR Processing (18% -> 62%)
        // ============================================================
        if ([PROCESSING_STAGES.OCR_REQUIRED, PROCESSING_STAGES.OCR_PROCESSING].includes(currentStage)) {
            let allPages = await listBookPages(bookId);

            // Guard: if a legacy book entered OCR stage without persisted pages, analyze first
            if (allPages.length === 0) {
                const fileBuffer = await getFileBuffer(book);
                const analysis = await analyzePdfPages(fileBuffer);
                await replaceInitialBookPages(bookId, analysis.pages);
                allPages = await listBookPages(bookId);
            }

            const pendingPages = allPages.filter(p => p.status === 'ocr_pending');

            if (pendingPages.length > 0) {
                const fileBuffer = await getFileBuffer(book);
                const initialStats = summarizeBookPages(allPages, book.totalPages);
                const initialPct = 18 + Math.round((initialStats.ocrProcessedPages / Math.max(1, initialStats.ocrTotalPages)) * 44);

                book = await updateBookStatus(bookId, {
                    ocrRequired: true,
                    ocrStatus: 'processing',
                    totalPages: initialStats.totalPages,
                    ocrTotalPages: initialStats.ocrTotalPages,
                    ocrProcessedPages: initialStats.ocrProcessedPages,
                    ocrFailedPages: initialStats.ocrFailedPages,
                    extractedPagesCount: initialStats.textExtractedPages,
                    textExtractedPages: initialStats.textExtractedPages,
                    ocrCurrentPhase: `Rendering pages (${initialStats.ocrProcessedPages}/${initialStats.ocrTotalPages} OCR done)`,
                    processingStatus: PROCESSING_STATUSES.OCR_PROCESSING,
                    processingStage: PROCESSING_STAGES.OCR_PROCESSING,
                    processingProgress: Math.min(61, Math.max(18, initialPct))
                });

                const elapsedMs = Date.now() - stepStartedAt;
                const remainingBudgetMs = timeBudgetMs > 0 ? Math.max(8000, timeBudgetMs - elapsedMs) : 0;
                const maxPagesPerBatch = timeBudgetMs > 0 ? DEFAULT_BATCH_PAGES : 0;
                const totalOcrTargets = Math.max(1, initialStats.ocrTotalPages);

                const ocrBatchResult = await runOcrOnPdfPages(
                    fileBuffer,
                    pendingPages.map(p => p.pageNumber),
                    {
                        bookId,
                        timeBudgetMs: remainingBudgetMs,
                        maxPagesPerBatch,
                        onPageStart: async ({ pageNumber, phase }) => {
                            const phaseText = phase === 'rendering'
                                ? `Rendering page ${pageNumber} of ${initialStats.totalPages}`
                                : `OCR processing page ${pageNumber} of ${initialStats.totalPages}`;
                            await updateBookStatus(bookId, {
                                processingStatus: PROCESSING_STATUSES.OCR_PROCESSING,
                                processingStage: PROCESSING_STAGES.OCR_PROCESSING,
                                ocrStatus: 'processing',
                                ocrCurrentPhase: phaseText
                            }).catch(() => {});
                            await refreshBookProcessingLock(bookId, lock.lockId);
                        },
                        onPageComplete: async (pageRes) => {
                            const cleaned = cleanOcrText(pageRes.text || '');
                            const isReadable = pageRes.ok && cleaned.length >= 10;

                            await saveBookPageOcrResult(bookId, pageRes.pageNumber, {
                                extractionMethod: 'ocr',
                                status: isReadable ? 'ocr_completed' : 'ocr_failed',
                                text: isReadable ? cleaned : '',
                                charCount: isReadable ? cleaned.length : 0,
                                ocrConfidence: Math.round(Number(pageRes.confidence) || 0),
                                attemptIncrement: Math.max(1, Number(pageRes.attempts) || 1),
                                ocrError: isReadable ? '' : String(pageRes.error || 'No legible text detected on this page.')
                            });

                            const refreshedPages = await listBookPages(bookId);
                            const stats = summarizeBookPages(refreshedPages, book.totalPages);
                            const pct = 18 + Math.round((stats.ocrProcessedPages / Math.max(1, stats.ocrTotalPages || totalOcrTargets)) * 44);

                            book = await updateBookStatus(bookId, {
                                ocrUsed: stats.ocrCompletedPages > 0,
                                ocrEngine: pageRes.engine || book.ocrEngine || getOcrEngineInfo().primaryEngine,
                                ocrStatus: stats.ocrPendingPages > 0 ? 'processing' : (stats.ocrFailedPages > 0 ? 'partial' : 'completed'),
                                totalPages: stats.totalPages,
                                ocrTotalPages: stats.ocrTotalPages,
                                ocrProcessedPages: stats.ocrProcessedPages,
                                ocrFailedPages: stats.ocrFailedPages,
                                extractedPagesCount: stats.textExtractedPages,
                                textExtractedPages: stats.textExtractedPages,
                                ocrCurrentPhase: `OCR processed ${stats.ocrProcessedPages} of ${stats.ocrTotalPages} scanned pages`,
                                processingStatus: PROCESSING_STATUSES.OCR_PROCESSING,
                                processingStage: PROCESSING_STAGES.OCR_PROCESSING,
                                processingProgress: Math.min(62, Math.max(18, pct))
                            });
                            await refreshBookProcessingLock(bookId, lock.lockId);
                        }
                    }
                );

                // Re-read persisted pages to see if more OCR batches remain
                allPages = await listBookPages(bookId);
                const stillPending = allPages.filter(p => p.status === 'ocr_pending');
                if (stillPending.length > 0 && (timeBudgetMs > 0 || ocrBatchResult.budgetExhausted)) {
                    return {
                        book,
                        done: false,
                        locked: false,
                        needsMoreSteps: true,
                        stage: PROCESSING_STAGES.OCR_PROCESSING,
                        progress: book.processingProgress,
                        reusedEmbeddings,
                        generatedEmbeddings
                    };
                }
            }

            // All OCR pages have been processed — validate we extracted usable text
            const finalOcrStats = summarizeBookPages(allPages, book.totalPages);
            if (finalOcrStats.textExtractedPages === 0) {
                await updateBookStatus(bookId, {
                    ocrStatus: 'failed',
                    ocrTotalPages: finalOcrStats.ocrTotalPages,
                    ocrProcessedPages: finalOcrStats.ocrProcessedPages,
                    ocrFailedPages: finalOcrStats.ocrFailedPages,
                    extractedPagesCount: 0,
                    textExtractedPages: 0,
                    ocrCurrentPhase: 'OCR failed — no readable text extracted'
                }).catch(() => {});

                throw new Error(
                    `OCR processed ${finalOcrStats.ocrProcessedPages} of ${finalOcrStats.totalPages} page(s), but no readable text could be extracted. Check scan clarity or click Retry OCR.`
                );
            }

            book = await updateBookStatus(bookId, {
                ocrRequired: finalOcrStats.ocrTotalPages > 0,
                ocrUsed: finalOcrStats.ocrCompletedPages > 0,
                ocrStatus: finalOcrStats.ocrTotalPages === 0
                    ? 'not_required'
                    : (finalOcrStats.ocrFailedPages > 0 ? 'partial' : 'completed'),
                totalPages: finalOcrStats.totalPages,
                ocrTotalPages: finalOcrStats.ocrTotalPages,
                ocrProcessedPages: finalOcrStats.ocrProcessedPages,
                ocrFailedPages: finalOcrStats.ocrFailedPages,
                extractedPagesCount: finalOcrStats.textExtractedPages,
                textExtractedPages: finalOcrStats.textExtractedPages,
                ocrCurrentPhase: 'Text extraction complete',
                processingStatus: PROCESSING_STATUSES.PREPARING_CONTENT,
                processingStage: PROCESSING_STAGES.PREPARING_CONTENT,
                processingProgress: 62
            });

            currentStage = PROCESSING_STAGES.PREPARING_CONTENT;
        }

        // ============================================================
        // STAGE 3 -> 4: Prepare Content (45-68%) & Generate Chunks (68-76%)
        // ============================================================
        if ([PROCESSING_STAGES.PREPARING_CONTENT, PROCESSING_STAGES.CHUNKING].includes(currentStage)) {
            let preparedPages;
            let detectedTotalPages = book.totalPages || 0;
            let ocrUsedFlag = Boolean(book.ocrUsed);

            if (inMemoryExtracted) {
                preparedPages = inMemoryExtracted.pages;
                detectedTotalPages = inMemoryExtracted.totalPages;
            } else if (book.fileType === 'pdf') {
                const persistedPages = await listBookPages(bookId);
                const usableRawPages = persistedPages
                    .filter(p => (p.status === 'text_extracted' || p.status === 'ocr_completed') && String(p.text || '').trim().length >= 10)
                    .sort((a, b) => a.pageNumber - b.pageNumber)
                    .map(p => ({
                        pageNumber: p.pageNumber,
                        chapter: p.chapter || '',
                        text: p.text
                    }));

                if (usableRawPages.length === 0) {
                    throw new Error('No extracted page text found for chunking. Please click Retry OCR.');
                }

                const prepared = prepareExtractedPages(usableRawPages, Math.max(book.totalPages || 0, persistedPages.length));
                preparedPages = prepared.pages;
                detectedTotalPages = prepared.totalPages;
                ocrUsedFlag = persistedPages.some(p => p.status === 'ocr_completed' && String(p.text || '').trim().length >= 10);

                book = await updateBookStatus(bookId, {
                    ocrUsed: ocrUsedFlag,
                    totalPages: detectedTotalPages,
                    extractedPagesCount: preparedPages.length,
                    textExtractedPages: preparedPages.length,
                    processingStatus: PROCESSING_STATUSES.PREPARING_CONTENT,
                    processingStage: PROCESSING_STAGES.PREPARING_CONTENT,
                    processingProgress: Math.max(45, book.processingProgress || 45),
                    ocrCurrentPhase: 'Cleaning and normalizing extracted text'
                });
            } else {
                const fileBuffer = await getFileBuffer(book);
                const extracted = await extractBookDocument(fileBuffer, book.fileType);
                preparedPages = extracted.pages;
                detectedTotalPages = extracted.totalPages;
            }

            book = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.GENERATING_CHUNKS,
                processingStage: PROCESSING_STAGES.CHUNKING,
                processingProgress: Math.max(52, book.ocrRequired ? 68 : 52),
                ocrCurrentPhase: 'Generating searchable chunks'
            });

            const chunks = chunkExtractedPages(preparedPages);
            if (chunks.length === 0) {
                throw new Error('Document extraction produced zero usable text chunks.');
            }

            // Look up reusable embeddings by contentHash ONLY if an embedding provider is active and dimensions match
            const detailedProvider = getDetailedProviderInfo();
            const expectedDimensions = detailedProvider.embeddingDimensions || 1536;
            const embeddingCache = new Map();

            if (detailedProvider.embeddingConfigured) {
                const uniqueHashes = Array.from(new Set(chunks.map(c => c.contentHash)));
                const existingEmbeddedChunks = await prisma.knowledgeBookChunk.findMany({
                    where: { contentHash: { in: uniqueHashes } },
                    select: { contentHash: true, embedding: true }
                });
                for (const existing of existingEmbeddedChunks) {
                    if (
                        Array.isArray(existing.embedding) &&
                        existing.embedding.length === expectedDimensions &&
                        !embeddingCache.has(existing.contentHash)
                    ) {
                        embeddingCache.set(existing.contentHash, existing.embedding);
                    }
                }
            }

            await prisma.knowledgeBookChunk.deleteMany({ where: { bookId } });

            let savedCount = 0;
            let preEmbeddedCount = 0;

            for (let i = 0; i < chunks.length; i += CHUNK_INSERT_BATCH_SIZE) {
                const batch = chunks.slice(i, i + CHUNK_INSERT_BATCH_SIZE);
                const docs = batch.map(c => {
                    const reusedVec = embeddingCache.get(c.contentHash);
                    if (reusedVec) preEmbeddedCount++;
                    return {
                        bookId,
                        technology: book.technology,
                        technologyNormalized: book.technologyNormalized,
                        bookTitle: book.title,
                        author: book.author,
                        edition: book.edition || '',
                        chapter: c.chapter || 'General Reference',
                        pageNumber: c.pageNumber || 1,
                        chunkIndex: c.chunkIndex,
                        chunkText: c.chunkText,
                        contentHash: c.contentHash,
                        embedding: reusedVec || [],
                        isActive: false
                    };
                });

                await prisma.knowledgeBookChunk.createMany({ data: docs });
                savedCount += docs.length;

                const pct = 68 + Math.round((savedCount / chunks.length) * 8);
                await updateBookStatus(bookId, {
                    totalChunks: chunks.length,
                    embeddedChunksCount: preEmbeddedCount,
                    processingProgress: Math.min(76, pct)
                });
            }

            reusedEmbeddings = preEmbeddedCount;

            book = await updateBookStatus(bookId, {
                ocrUsed: ocrUsedFlag,
                totalPages: detectedTotalPages,
                extractedPagesCount: preparedPages.length,
                textExtractedPages: preparedPages.length,
                totalChunks: chunks.length,
                embeddedChunksCount: preEmbeddedCount,
                processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                processingProgress: 76,
                ocrCurrentPhase: detailedProvider.embeddingConfigured
                    ? 'Generating vector embeddings'
                    : 'Text fallback indexing (no embedding API key)'
            });

            currentStage = PROCESSING_STAGES.GENERATING_EMBEDDINGS;

            if (timeBudgetMs > 0 && (Date.now() - stepStartedAt) >= timeBudgetMs) {
                return {
                    book,
                    done: false,
                    locked: false,
                    needsMoreSteps: true,
                    stage: currentStage,
                    progress: book.processingProgress,
                    reusedEmbeddings,
                    generatedEmbeddings
                };
            }
        }

        // ============================================================
        // STAGE 5: Generating Embeddings (76-92%) — Resumable Batched Execution
        // ============================================================
        if (currentStage === PROCESSING_STAGES.GENERATING_EMBEDDINGS) {
            const detailedProvider = getDetailedProviderInfo();
            const expectedDimensions = detailedProvider.embeddingDimensions || 1536;

            const persistedChunks = await prisma.knowledgeBookChunk.findMany({
                where: { bookId },
                select: {
                    id: true,
                    chunkIndex: true,
                    chapter: true,
                    chunkText: true,
                    contentHash: true,
                    embedding: true
                },
                orderBy: { chunkIndex: 'asc' }
            });

            if (!persistedChunks || persistedChunks.length === 0) {
                throw new Error('No extracted chunks found for embedding generation. Please retry processing.');
            }

            if (!detailedProvider.embeddingConfigured) {
                book = await updateBookStatus(bookId, {
                    totalChunks: persistedChunks.length,
                    embeddedChunksCount: 0,
                    embeddingMode: 'text_fallback',
                    embeddingModel: 'text-fallback',
                    embeddingDimensions: 0,
                    processingStatus: PROCESSING_STATUSES.INDEXING,
                    processingStage: PROCESSING_STAGES.INDEXING,
                    processingProgress: 92,
                    ocrCurrentPhase: 'Final indexing (Text Fallback Mode)'
                });
                currentStage = PROCESSING_STAGES.INDEXING;
            } else {
                const readyMap = new Map();
                const chunksMissingEmbedding = [];

                for (const chunk of persistedChunks) {
                    if (Array.isArray(chunk.embedding) && chunk.embedding.length === expectedDimensions) {
                        readyMap.set(chunk.contentHash, chunk.embedding);
                    } else {
                        chunksMissingEmbedding.push(chunk);
                    }
                }

                const localCopyUpdates = [];
                const stillNeedingApi = [];
                for (const chunk of chunksMissingEmbedding) {
                    const cachedVec = readyMap.get(chunk.contentHash);
                    if (cachedVec) {
                        localCopyUpdates.push({ id: chunk.id, embedding: cachedVec });
                        reusedEmbeddings++;
                    } else {
                        stillNeedingApi.push(chunk);
                    }
                }
                if (localCopyUpdates.length > 0) {
                    await persistChunkEmbeddingsBatch(bookId, localCopyUpdates);
                }

                let completedEmbeddedCount = persistedChunks.length - stillNeedingApi.length;
                if (reusedEmbeddings === 0 && completedEmbeddedCount > 0 && generatedEmbeddings === 0) {
                    reusedEmbeddings = completedEmbeddedCount;
                }

                for (let i = 0; i < stillNeedingApi.length; i += EMBEDDING_BATCH_SIZE) {
                    if (timeBudgetMs > 0 && i > 0 && (Date.now() - stepStartedAt) >= timeBudgetMs) {
                        const pct = 76 + Math.round((completedEmbeddedCount / persistedChunks.length) * 16);
                        book = await updateBookStatus(bookId, {
                            embeddedChunksCount: completedEmbeddedCount,
                            processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                            processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                            processingProgress: Math.min(91, pct),
                            ocrCurrentPhase: `Generating embeddings (${completedEmbeddedCount}/${persistedChunks.length})`
                        });
                        return {
                            book,
                            done: false,
                            locked: false,
                            needsMoreSteps: true,
                            stage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                            progress: book.processingProgress,
                            reusedEmbeddings,
                            generatedEmbeddings
                        };
                    }

                    const batch = stillNeedingApi.slice(i, i + EMBEDDING_BATCH_SIZE);
                    const inputs = batch.map(c =>
                        `${book.technology} | ${book.title} | ${c.chapter || 'General Reference'}\n${c.chunkText}`
                    );

                    const vectors = await generateEmbeddings(inputs, {
                        taskType: 'RETRIEVAL_DOCUMENT',
                        operation: 'embed_book'
                    });

                    if (!Array.isArray(vectors) || vectors.length !== batch.length) {
                        throw new Error('Embedding count mismatch from AI provider.');
                    }

                    const batchUpdates = batch.map((c, idx) => ({
                        id: c.id,
                        embedding: vectors[idx]
                    }));
                    await persistChunkEmbeddingsBatch(bookId, batchUpdates);

                    completedEmbeddedCount += batch.length;
                    generatedEmbeddings += batch.length;

                    const pct = 76 + Math.round((completedEmbeddedCount / persistedChunks.length) * 16);
                    book = await updateBookStatus(bookId, {
                        embeddedChunksCount: completedEmbeddedCount,
                        embeddingMode: 'vector',
                        processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                        processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                        processingProgress: Math.min(92, pct),
                        ocrCurrentPhase: `Generating embeddings (${completedEmbeddedCount}/${persistedChunks.length})`
                    });
                    await refreshBookProcessingLock(bookId, lock.lockId);
                }

                book = await updateBookStatus(bookId, {
                    embeddedChunksCount: persistedChunks.length,
                    embeddingMode: 'vector',
                    processingStatus: PROCESSING_STATUSES.INDEXING,
                    processingStage: PROCESSING_STAGES.INDEXING,
                    processingProgress: 92,
                    ocrCurrentPhase: 'Final indexing'
                });
                currentStage = PROCESSING_STAGES.INDEXING;
            }
        }

        // ============================================================
        // STAGE 6: Saving & Final Validation (92-100%)
        // ============================================================
        if (currentStage === PROCESSING_STAGES.INDEXING) {
            book = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.INDEXING,
                processingStage: PROCESSING_STAGES.INDEXING,
                processingProgress: 95,
                ocrCurrentPhase: 'Final indexing & activation'
            });

            const finalChunks = await prisma.knowledgeBookChunk.findMany({
                where: { bookId },
                select: { id: true, embedding: true }
            });

            if (!finalChunks || finalChunks.length === 0) {
                throw new Error('Final validation failed: zero chunks were saved in MongoDB.');
            }

            const detailedProvider = getDetailedProviderInfo();
            const isVectorMode = book.embeddingMode !== 'text_fallback' && detailedProvider.embeddingConfigured;

            let resolvedDimensions = 0;
            let actualVectorCount = 0;
            if (isVectorMode) {
                for (const c of finalChunks) {
                    if (Array.isArray(c.embedding) && c.embedding.length > 0) {
                        actualVectorCount++;
                        if (!resolvedDimensions) resolvedDimensions = c.embedding.length;
                    }
                }
                if (actualVectorCount === 0) {
                    throw new Error('Final validation failed: vector embeddings are missing on saved chunks.');
                }
            }

            await prisma.knowledgeBookChunk.updateMany({
                where: { bookId },
                data: { isActive: book.isEnabled !== false }
            });

            const completedBook = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.COMPLETED,
                processingStage: PROCESSING_STAGES.COMPLETED,
                processingProgress: 100,
                processingError: '',
                ocrCurrentPhase: 'Completed',
                indexedChunks: finalChunks.length,
                totalChunks: finalChunks.length,
                embeddedChunksCount: isVectorMode ? actualVectorCount : 0,
                embeddingMode: isVectorMode ? 'vector' : 'text_fallback',
                embeddingModel: isVectorMode
                    ? (detailedProvider.embeddingModel || getActiveProviderInfo().embeddingModel || 'embedding-model')
                    : 'text-fallback',
                embeddingDimensions: isVectorMode
                    ? (resolvedDimensions || detailedProvider.embeddingDimensions || 1536)
                    : 0,
                knowledgeVersion: (book.knowledgeVersion || 1) + 1,
                lastIndexedAt: new Date(),
                processingLockId: '',
                processingLockedAt: null
            });

            return {
                book: completedBook,
                done: true,
                locked: false,
                needsMoreSteps: false,
                stage: PROCESSING_STAGES.COMPLETED,
                progress: 100,
                reusedEmbeddings,
                generatedEmbeddings
            };
        }

        return {
            book,
            done: book.processingStatus === PROCESSING_STATUSES.COMPLETED,
            locked: false,
            needsMoreSteps: isInProgressStatus(book.processingStatus),
            stage: inferProcessingStage(book),
            progress: book.processingProgress || 0,
            reusedEmbeddings,
            generatedEmbeddings
        };
    } catch (err) {
        const safeErr = redactSecrets(err?.message || 'Unknown book processing error');
        console.error(`[BookProcessing] Book ${bookId} failed:`, safeErr);
        await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.FAILED,
            processingStage: PROCESSING_STAGES.FAILED,
            processingError: safeErr.slice(0, 1000),
            processingLockId: '',
            processingLockedAt: null
        }).catch(() => {});
        throw err;
    } finally {
        await releaseBookProcessingLock(bookId, lock.lockId);
    }
}

/**
 * Prepare a scanned/failed PDF book to retry OCR without duplicating already extracted pages
 * (unless forceFullOcr=true or no pages were previously saved).
 */
async function prepareRetryBookOcr(bookId, { forceFullOcr = false } = {}) {
    const existing = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
    if (!existing) {
        const err = new Error('Reference book not found.');
        err.status = 404;
        throw err;
    }

    if (String(existing.fileType || '').toLowerCase() !== 'pdf') {
        const err = new Error('Retry OCR is only applicable to PDF documents.');
        err.status = 400;
        throw err;
    }

    const pages = await listBookPages(bookId);
    const hasPersistedPages = pages.length > 0;
    const failedCount = pages.filter(p => p.status === 'ocr_failed').length;
    const pendingCount = pages.filter(p => p.status === 'ocr_pending').length;

    if (!forceFullOcr && hasPersistedPages && (failedCount > 0 || pendingCount > 0)) {
        const resetCount = await resetFailedOcrPages(bookId);
        const refreshed = await listBookPages(bookId);
        const stats = summarizeBookPages(refreshed, existing.totalPages);
        const pct = 18 + Math.round((stats.ocrProcessedPages / Math.max(1, stats.ocrTotalPages)) * 44);

        const updated = await updateBookStatus(bookId, {
            ocrRequired: true,
            ocrStatus: 'required',
            ocrTotalPages: stats.ocrTotalPages,
            ocrProcessedPages: stats.ocrProcessedPages,
            ocrFailedPages: 0,
            extractedPagesCount: stats.textExtractedPages,
            textExtractedPages: stats.textExtractedPages,
            ocrCurrentPhase: `Retrying OCR for ${stats.ocrPendingPages} page(s)`,
            processingStatus: PROCESSING_STATUSES.OCR_REQUIRED,
            processingStage: PROCESSING_STAGES.OCR_PROCESSING,
            processingProgress: Math.min(61, Math.max(18, pct)),
            processingError: '',
            processingLockId: '',
            processingLockedAt: null,
            processingAttempts: 0
        });

        return {
            book: updated,
            mode: 'retry_failed_pages',
            pagesQueued: stats.ocrPendingPages,
            resetFailedCount: resetCount
        };
    }

    // Full re-OCR from scratch
    await deleteBookPages(bookId);
    const updated = await updateBookStatus(bookId, {
        ocrRequired: true,
        ocrUsed: false,
        ocrStatus: 'required',
        ocrTotalPages: 0,
        ocrProcessedPages: 0,
        ocrFailedPages: 0,
        extractedPagesCount: 0,
        textExtractedPages: 0,
        ocrCurrentPhase: 'Queued for full OCR reprocessing',
        processingStatus: PROCESSING_STATUSES.UPLOADED,
        processingStage: PROCESSING_STAGES.UPLOADED,
        processingProgress: 10,
        processingError: '',
        processingLockId: '',
        processingLockedAt: null,
        processingAttempts: 0
    });

    return {
        book: updated,
        mode: 'full_reocr',
        pagesQueued: existing.totalPages || 0,
        resetFailedCount: 0
    };
}

/**
 * Execute full RAG ingestion pipeline synchronously to completion (used by `sync=true`, scripts, & tests).
 */
async function processBookById(bookId, { preloadedBuffer = null, forceReextract = true } = {}) {
    let totalReused = 0;
    let totalGenerated = 0;
    let lastResult = null;
    const maxIterations = 200;

    for (let step = 0; step < maxIterations; step++) {
        const res = await runBookProcessingStep(bookId, {
            timeBudgetMs: 0,
            preloadedBuffer: step === 0 ? preloadedBuffer : null,
            forceReextract: step === 0 ? forceReextract : false
        });
        lastResult = res;
        totalReused += res.reusedEmbeddings || 0;
        totalGenerated += res.generatedEmbeddings || 0;

        if (res.alreadyRunning) {
            return { alreadyRunning: true, book: res.book };
        }
        if (res.done || !res.needsMoreSteps) {
            return {
                book: res.book,
                reusedEmbeddings: totalReused,
                generatedEmbeddings: totalGenerated
            };
        }
    }

    return {
        book: lastResult?.book,
        reusedEmbeddings: totalReused,
        generatedEmbeddings: totalGenerated
    };
}

/**
 * Schedule processing safely:
 * - On Vercel Serverless / Lambda: NEVER rely on unawaited background promises (they are frozen after HTTP response!).
 *   Instead, clients drive the resumable `/process-step` endpoint until completion.
 * - On persistent Node servers: safely run the resumable step loop in background using the same MongoDB lease lock.
 */
function scheduleBookProcessing(bookId, preloadedBuffer = null) {
    if (isServerlessRuntime() || process.env.NODE_ENV === 'test') {
        return { scheduled: false, mode: 'resumable_step_endpoint' };
    }

    setImmediate(async () => {
        try {
            let step = 0;
            while (step < 300) {
                const res = await runBookProcessingStep(bookId, {
                    timeBudgetMs: DEFAULT_STEP_TIME_BUDGET_MS,
                    preloadedBuffer: step === 0 ? preloadedBuffer : null
                });
                if (res.done || res.locked || !res.needsMoreSteps) break;
                step++;
            }
        } catch (err) {
            console.error(`[BookProcessing Background Error] ${bookId}:`, err.message);
        }
    });

    return { scheduled: true, mode: 'local_background_worker' };
}

function deriveTitleFromFileName(fileName) {
    return String(fileName || 'Reference Book')
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || 'Reference Book';
}

/**
 * Create a new book record, store binary securely, and prepare for processing.
 */
async function createAndQueueBook({
    buffer,
    originalname,
    mimetype,
    title = '',
    author = '',
    edition = '',
    description = '',
    publicationYear = null,
    technology,
    uploadedBy = '',
    processSync = false
}) {
    const cleanTechnology = String(technology || '').trim();
    const technologyNormalized = normalizeTechnology(cleanTechnology);

    if (!cleanTechnology || !technologyNormalized) {
        const err = new Error('Technology/category is required.');
        err.status = 400;
        throw err;
    }

    const fileBuffer = normalizeBuffer(buffer);
    const validated = validateUploadedBookFile({ buffer: fileBuffer, originalname, mimetype });
    const cleanTitle = String(title || '').trim() || deriveTitleFromFileName(validated.fileName);
    const cleanAuthor = String(author || '').trim();

    const duplicate = await findDuplicateBook({
        fileHash: validated.fileHash,
        title: cleanTitle,
        author: cleanAuthor,
        edition,
        technologyNormalized
    });

    if (duplicate) {
        const err = new Error(
            duplicate.reason === 'file_hash'
                ? `Duplicate upload detected: this exact file already exists as "${duplicate.book.title}".`
                : `Duplicate book detected: "${duplicate.book.title}" already exists for ${duplicate.book.technology}.`
        );
        err.status = 409;
        err.duplicateBookId = duplicate.book.id;
        throw err;
    }

    const yearNum = publicationYear !== undefined && publicationYear !== null && String(publicationYear).trim() !== ''
        ? parseInt(publicationYear, 10)
        : null;

    const book = await prisma.knowledgeBook.create({
        data: {
            title: cleanTitle,
            author: cleanAuthor,
            edition: String(edition || '').trim(),
            description: String(description || '').trim(),
            publicationYear: Number.isFinite(yearNum) ? yearNum : null,
            technology: cleanTechnology,
            technologyNormalized,
            fileName: validated.fileName,
            fileType: validated.fileType,
            mimeType: validated.mimeType,
            fileSize: validated.fileSize,
            fileHash: validated.fileHash,
            isEnabled: true,
            processingStatus: PROCESSING_STATUSES.UPLOADED,
            processingStage: PROCESSING_STAGES.UPLOADED,
            processingProgress: 10,
            processingError: '',
            processingLockId: '',
            processingAttempts: 0,
            ocrRequired: false,
            ocrUsed: false,
            ocrStatus: 'not_required',
            ocrEngine: '',
            ocrTotalPages: 0,
            ocrProcessedPages: 0,
            ocrFailedPages: 0,
            textExtractedPages: 0,
            ocrCurrentPhase: 'Uploaded',
            uploadedBy: String(uploadedBy || '')
        }
    });

    const totalParts = await storeBookBinaryParts(book.id, fileBuffer);
    const savedBook = await updateBookStatus(book.id, {
        totalParts,
        processingStatus: PROCESSING_STATUSES.UPLOADED,
        processingStage: PROCESSING_STAGES.UPLOADED,
        processingProgress: 10
    });

    if (processSync) {
        const result = await processBookById(book.id, { preloadedBuffer: fileBuffer, forceReextract: true });
        return result.book;
    }

    scheduleBookProcessing(book.id, fileBuffer);
    return savedBook;
}

/**
 * Replace an existing book's uploaded file.
 * Skips redundant re-embedding if the file hash is unchanged and the book is already Completed!
 */
async function replaceBookFile(bookId, { buffer, originalname, mimetype, processSync = false }) {
    const existing = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
    if (!existing) {
        const err = new Error('Reference book not found.');
        err.status = 404;
        throw err;
    }

    const fileBuffer = normalizeBuffer(buffer);
    const validated = validateUploadedBookFile({ buffer: fileBuffer, originalname, mimetype });

    if (validated.fileHash === existing.fileHash && existing.processingStatus === PROCESSING_STATUSES.COMPLETED && existing.indexedChunks > 0) {
        return {
            book: existing,
            skippedReembedding: true,
            message: 'Uploaded file is identical to the currently indexed book. Existing embeddings were preserved.'
        };
    }

    const dupOther = await prisma.knowledgeBook.findFirst({
        where: {
            fileHash: validated.fileHash,
            id: { not: bookId }
        }
    });
    if (dupOther) {
        const err = new Error(`This file is already uploaded under "${dupOther.title}".`);
        err.status = 409;
        throw err;
    }

    await deleteBookPages(bookId);
    const totalParts = await storeBookBinaryParts(bookId, fileBuffer);
    const updated = await updateBookStatus(bookId, {
        fileName: validated.fileName,
        fileType: validated.fileType,
        mimeType: validated.mimeType,
        fileSize: validated.fileSize,
        fileHash: validated.fileHash,
        totalParts,
        processingStatus: PROCESSING_STATUSES.UPLOADED,
        processingStage: PROCESSING_STAGES.UPLOADED,
        processingProgress: 10,
        processingError: '',
        processingLockId: '',
        processingLockedAt: null,
        processingAttempts: 0,
        extractedPagesCount: 0,
        textExtractedPages: 0,
        embeddedChunksCount: 0,
        ocrRequired: false,
        ocrUsed: false,
        ocrStatus: 'not_required',
        ocrEngine: '',
        ocrTotalPages: 0,
        ocrProcessedPages: 0,
        ocrFailedPages: 0,
        ocrCurrentPhase: 'Uploaded'
    });

    if (processSync) {
        const result = await processBookById(bookId, { preloadedBuffer: fileBuffer, forceReextract: true });
        return { book: result.book, skippedReembedding: false };
    }

    scheduleBookProcessing(bookId, fileBuffer);
    return { book: updated, skippedReembedding: false };
}

/**
 * Compute deterministic knowledge base version hash for a technology (used for verification cache invalidation)
 */
async function getKnowledgeBaseVersion(technologiesNormalized) {
    const techList = Array.isArray(technologiesNormalized)
        ? technologiesNormalized.filter(Boolean)
        : [technologiesNormalized].filter(Boolean);

    if (techList.length === 0) return 'kb_empty';

    const activeBooks = await prisma.knowledgeBook.findMany({
        where: {
            technologyNormalized: { in: techList },
            isEnabled: true,
            processingStatus: PROCESSING_STATUSES.COMPLETED,
            indexedChunks: { gt: 0 }
        },
        select: {
            id: true,
            knowledgeVersion: true,
            fileHash: true
        },
        orderBy: { id: 'asc' }
    });

    if (!activeBooks || activeBooks.length === 0) {
        return 'kb_empty';
    }

    const sig = activeBooks
        .map(b => `${b.id}:v${b.knowledgeVersion || 1}:${String(b.fileHash || '').slice(0, 12)}`)
        .join('|');

    return `kb_${sha256(sig).slice(0, 16)}`;
}

module.exports = {
    PROCESSING_STATUSES,
    PROCESSING_STAGES,
    IN_PROGRESS_STATUS_LIST,
    IN_PROGRESS_STATUS_SET,
    FILE_PART_SIZE_BYTES,
    LOCK_TTL_MS,
    DEFAULT_STEP_TIME_BUDGET_MS,
    isServerlessRuntime,
    isInProgressStatus,
    inferProcessingStage,
    isBookProcessingStalled,
    listBookPages,
    deleteBookPages,
    storeBookBinaryParts,
    loadBookBinaryFromParts,
    findDuplicateBook,
    runBookProcessingStep,
    prepareRetryBookOcr,
    processBookById,
    scheduleBookProcessing,
    createAndQueueBook,
    replaceBookFile,
    getKnowledgeBaseVersion
};
