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
    chunkExtractedPages,
    sha256
} = require('./bookExtractorService');

const FILE_PART_SIZE_BYTES = 2 * 1024 * 1024; // 2MB per MongoDB binary part (safe well under 16MB BSON cap)
const LOCK_TTL_MS = 45 * 1000; // 45s lease expiry so interrupted Vercel functions recover automatically
const DEFAULT_STEP_TIME_BUDGET_MS = 18 * 1000; // 18s per step (well within Vercel maxDuration & client timeouts)
const EMBEDDING_BATCH_SIZE = 20;
const CHUNK_INSERT_BATCH_SIZE = 50;

const activeProcessingJobs = new Set();

const PROCESSING_STATUSES = {
    UPLOADED: 'Uploaded',
    PROCESSING: 'Processing',
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

function inferProcessingStage(book) {
    if (!book) return PROCESSING_STAGES.UPLOADED;
    if (book.processingStatus === PROCESSING_STATUSES.COMPLETED) {
        return PROCESSING_STAGES.COMPLETED;
    }

    const explicit = String(book.processingStage || '').trim().toLowerCase();
    const validActiveStages = new Set([
        PROCESSING_STAGES.UPLOADED,
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
        // Unlocked in-progress book (e.g. newly uploaded awaiting step, or legacy stuck record)
        return !lastMs || (nowMs - lastMs) > 5000;
    }

    if (!lastMs) return true;
    return (nowMs - lastMs) > LOCK_TTL_MS;
}

/**
 * Store original uploaded file buffer securely in MongoDB Atlas `knowledge_book_file_parts`
 * (never placed in publicly accessible directories; works identically on Vercel serverless & Node servers).
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
        // Lightweight unit-test Prisma mock fallback
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

    // Fallback for lightweight unit-test mocks that do not implement knowledgeBookChunk.update
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
 * Stage progress map (real persisted work):
 *  - 0–10%:  Uploaded & validated
 *  - 10–35%: Extracting Text (PDF/DOCX/TXT + OCR fallback)
 *  - 35–50%: Preparing Content (counting pages, cleaning, chapter detection)
 *  - 50–70%: Generating Chunks (chunking + persisting chunks + reusing cached embeddings)
 *  - 70–90%: Generating Embeddings (resumable batched embeddings, or transparent text-fallback if no embedding key)
 *  - 90–100%: Indexing (final validation + activating chunks in MongoDB Atlas)
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

    try {
        let book = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
        if (!book) {
            throw new Error('Reference book record not found.');
        }

        let currentStage = forceReextract ? PROCESSING_STAGES.UPLOADED : inferProcessingStage(book);

        // If resuming from failed/legacy state, inspect whether chunks were already persisted
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

        if (currentStage === PROCESSING_STAGES.FAILED) {
            currentStage = existingBookChunks.length > 0 && !forceReextract
                ? PROCESSING_STAGES.GENERATING_EMBEDDINGS
                : PROCESSING_STAGES.UPLOADED;
        }

        // Guard: cannot run embedding or indexing stage if no chunks exist yet in DB
        if (
            (currentStage === PROCESSING_STAGES.GENERATING_EMBEDDINGS || currentStage === PROCESSING_STAGES.INDEXING) &&
            existingBookChunks.length === 0
        ) {
            currentStage = PROCESSING_STAGES.UPLOADED;
        }

        book = await updateBookStatus(bookId, {
            processingError: '',
            processingAttempts: (book.processingAttempts || 0) + 1
        });

        // ============================================================
        // STAGES 1 -> 4: Extract Text (10-35%), Prepare Content (35-50%), Generate & Persist Chunks (50-70%)
        // ============================================================
        if ([
            PROCESSING_STAGES.UPLOADED,
            PROCESSING_STAGES.EXTRACTING_TEXT,
            PROCESSING_STAGES.PREPARING_CONTENT,
            PROCESSING_STAGES.CHUNKING
        ].includes(currentStage)) {
            book = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
                processingStage: PROCESSING_STAGES.EXTRACTING_TEXT,
                processingProgress: 12
            });

            const fileBuffer = preloadedBuffer
                ? normalizeBuffer(preloadedBuffer)
                : await loadBookBinaryFromParts(bookId, book.totalParts || 0);

            let lastProgressUpdateAt = Date.now();
            let lastRecordedProgress = 12;

            const extracted = await extractBookDocument(fileBuffer, book.fileType, {
                onPageProgress: async ({ currentPage, totalPages }) => {
                    const now = Date.now();
                    if (totalPages > 0 && (now - lastProgressUpdateAt >= 1500 || currentPage === totalPages)) {
                        const pct = Math.min(35, Math.max(12, 12 + Math.round((currentPage / totalPages) * 23)));
                        if (pct > lastRecordedProgress || currentPage === totalPages) {
                            lastProgressUpdateAt = now;
                            lastRecordedProgress = pct;
                            await updateBookStatus(bookId, {
                                processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
                                processingStage: PROCESSING_STAGES.EXTRACTING_TEXT,
                                processingProgress: pct,
                                totalPages,
                                extractedPagesCount: currentPage
                            }).catch(() => {});
                            await refreshBookProcessingLock(bookId, lock.lockId);
                        }
                    }
                }
            });

            // Stage 3: Counting pages & preparing content (35-50%)
            book = await updateBookStatus(bookId, {
                ocrUsed: extracted.ocrUsed,
                totalPages: extracted.totalPages,
                extractedPagesCount: extracted.pages.length,
                processingStatus: PROCESSING_STATUSES.PREPARING_CONTENT,
                processingStage: PROCESSING_STAGES.PREPARING_CONTENT,
                processingProgress: 45
            });

            // Stage 4: Generating text chunks (50-70%)
            book = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.GENERATING_CHUNKS,
                processingStage: PROCESSING_STAGES.CHUNKING,
                processingProgress: 52
            });

            const chunks = chunkExtractedPages(extracted.pages);
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

            // Replace chunks atomically for this book (saved with isActive: false until final validation)
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

                const pct = 52 + Math.round((savedCount / chunks.length) * 18);
                await updateBookStatus(bookId, {
                    totalChunks: chunks.length,
                    embeddedChunksCount: preEmbeddedCount,
                    processingProgress: Math.min(70, pct)
                });
            }

            reusedEmbeddings = preEmbeddedCount;

            book = await updateBookStatus(bookId, {
                totalPages: extracted.totalPages,
                extractedPagesCount: extracted.pages.length,
                totalChunks: chunks.length,
                embeddedChunksCount: preEmbeddedCount,
                processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                processingProgress: 70
            });

            currentStage = PROCESSING_STAGES.GENERATING_EMBEDDINGS;

            // If we already spent most of the serverless step time budget on a huge PDF,
            // pause cleanly here — chunks are persisted in MongoDB so the next step starts straight at 70%!
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
        // STAGE 5: Generating Embeddings (70-90%) — Resumable Batched Execution
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
                // No external embedding API key configured (e.g., Groq-only chat environment).
                // Chunks are already extracted and persisted; index cleanly in Text Fallback mode
                // so RAG verification via lexical retrieval works immediately, without faking vectors.
                book = await updateBookStatus(bookId, {
                    totalChunks: persistedChunks.length,
                    embeddedChunksCount: 0,
                    embeddingMode: 'text_fallback',
                    embeddingModel: 'text-fallback',
                    embeddingDimensions: 0,
                    processingStatus: PROCESSING_STATUSES.INDEXING,
                    processingStage: PROCESSING_STAGES.INDEXING,
                    processingProgress: 90
                });
                currentStage = PROCESSING_STAGES.INDEXING;
            } else {
                // Group chunks by embedding readiness
                const readyMap = new Map();
                const chunksMissingEmbedding = [];

                for (const chunk of persistedChunks) {
                    if (Array.isArray(chunk.embedding) && chunk.embedding.length === expectedDimensions) {
                        readyMap.set(chunk.contentHash, chunk.embedding);
                    } else {
                        chunksMissingEmbedding.push(chunk);
                    }
                }

                // First copy any duplicate contentHash embeddings already present within this book
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
                    // Check step time budget before starting next embedding batch
                    if (timeBudgetMs > 0 && i > 0 && (Date.now() - stepStartedAt) >= timeBudgetMs) {
                        const pct = 70 + Math.round((completedEmbeddedCount / persistedChunks.length) * 20);
                        book = await updateBookStatus(bookId, {
                            embeddedChunksCount: completedEmbeddedCount,
                            processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                            processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                            processingProgress: Math.min(89, pct)
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

                    const pct = 70 + Math.round((completedEmbeddedCount / persistedChunks.length) * 20);
                    book = await updateBookStatus(bookId, {
                        embeddedChunksCount: completedEmbeddedCount,
                        embeddingMode: 'vector',
                        processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
                        processingStage: PROCESSING_STAGES.GENERATING_EMBEDDINGS,
                        processingProgress: Math.min(90, pct)
                    });
                    await refreshBookProcessingLock(bookId, lock.lockId);
                }

                book = await updateBookStatus(bookId, {
                    embeddedChunksCount: persistedChunks.length,
                    embeddingMode: 'vector',
                    processingStatus: PROCESSING_STATUSES.INDEXING,
                    processingStage: PROCESSING_STAGES.INDEXING,
                    processingProgress: 90
                });
                currentStage = PROCESSING_STAGES.INDEXING;
            }
        }

        // ============================================================
        // STAGE 6: Saving Vectors & Final Validation (90-100%)
        // ============================================================
        if (currentStage === PROCESSING_STAGES.INDEXING) {
            book = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.INDEXING,
                processingStage: PROCESSING_STAGES.INDEXING,
                processingProgress: 94
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
            if (isVectorMode) {
                const sampleChunkWithVec = finalChunks.find(c => Array.isArray(c.embedding) && c.embedding.length > 0);
                if (!sampleChunkWithVec) {
                    throw new Error('Final validation failed: vector embeddings are missing on saved chunks.');
                }
                resolvedDimensions = sampleChunkWithVec.embedding.length;
            }

            // Activate all validated chunks for RAG search
            await prisma.knowledgeBookChunk.updateMany({
                where: { bookId },
                data: { isActive: book.isEnabled !== false }
            });

            const completedBook = await updateBookStatus(bookId, {
                processingStatus: PROCESSING_STATUSES.COMPLETED,
                processingStage: PROCESSING_STAGES.COMPLETED,
                processingProgress: 100,
                processingError: '',
                indexedChunks: finalChunks.length,
                totalChunks: finalChunks.length,
                embeddedChunksCount: isVectorMode ? finalChunks.length : 0,
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
 * Execute full RAG ingestion pipeline synchronously to completion (used by `sync=true`, scripts, & tests).
 */
async function processBookById(bookId, { preloadedBuffer = null, forceReextract = true } = {}) {
    let totalReused = 0;
    let totalGenerated = 0;
    let lastResult = null;
    const maxIterations = 25;

    for (let step = 0; step < maxIterations; step++) {
        const res = await runBookProcessingStep(bookId, {
            timeBudgetMs: 0, // Run without artificial pause when explicitly invoked synchronously
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
            while (step < 30) {
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

    // If identical file hash and already indexed cleanly, avoid regenerating embeddings unnecessarily
    if (validated.fileHash === existing.fileHash && existing.processingStatus === PROCESSING_STATUSES.COMPLETED && existing.indexedChunks > 0) {
        return {
            book: existing,
            skippedReembedding: true,
            message: 'Uploaded file is identical to the currently indexed book. Existing embeddings were preserved.'
        };
    }

    // Check duplicate against OTHER books
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
        embeddedChunksCount: 0
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
    storeBookBinaryParts,
    loadBookBinaryFromParts,
    findDuplicateBook,
    runBookProcessingStep,
    processBookById,
    scheduleBookProcessing,
    createAndQueueBook,
    replaceBookFile,
    getKnowledgeBaseVersion
};
