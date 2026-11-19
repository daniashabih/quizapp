const prisma = require('../_config/prisma');
const { normalizeTechnology } = require('../_utils/ragTechnology');
const { generateEmbeddings, getActiveProviderInfo } = require('./aiProviderService');
const {
    validateUploadedBookFile,
    extractBookDocument,
    chunkExtractedPages,
    sha256
} = require('./bookExtractorService');

const FILE_PART_SIZE_BYTES = 2 * 1024 * 1024; // 2MB per MongoDB binary part (safe well under 16MB BSON cap)
const activeProcessingJobs = new Set();

const PROCESSING_STATUSES = {
    UPLOADED: 'Uploaded',
    PROCESSING: 'Processing',
    EXTRACTING_TEXT: 'Extracting Text',
    GENERATING_EMBEDDINGS: 'Generating Embeddings',
    INDEXING: 'Indexing',
    COMPLETED: 'Completed',
    FAILED: 'Failed'
};

/**
 * Store original uploaded file buffer securely in MongoDB Atlas `knowledge_book_file_parts`
 * (never placed in publicly accessible directories; works identically on Vercel serverless & Node servers).
 */
async function storeBookBinaryParts(bookId, buffer) {
    await prisma.knowledgeBookFilePart.deleteMany({ where: { bookId } });
    const totalParts = Math.max(1, Math.ceil(buffer.length / FILE_PART_SIZE_BYTES));

    for (let i = 0; i < totalParts; i++) {
        const start = i * FILE_PART_SIZE_BYTES;
        const end = Math.min(buffer.length, start + FILE_PART_SIZE_BYTES);
        const slice = buffer.subarray(start, end);
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
 * Reconstruct original book binary from MongoDB Atlas secure parts
 */
async function loadBookBinaryFromParts(bookId) {
    const parts = await prisma.knowledgeBookFilePart.findMany({
        where: { bookId },
        orderBy: { partIndex: 'asc' }
    });
    if (!parts || parts.length === 0) {
        throw new Error('Stored original book file could not be found. Please replace or re-upload the book.');
    }
    return Buffer.concat(parts.map(p => Buffer.from(p.data)));
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
        data: fields
    });
}

/**
 * Execute full RAG ingestion pipeline for a book:
 * Processing -> Extracting Text -> Generating Embeddings (reusing unchanged chunk embeddings) -> Indexing -> Completed / Failed
 */
async function processBookById(bookId, { preloadedBuffer = null } = {}) {
    if (activeProcessingJobs.has(bookId)) {
        return { alreadyRunning: true };
    }
    activeProcessingJobs.add(bookId);

    try {
        const book = await prisma.knowledgeBook.findUnique({ where: { id: bookId } });
        if (!book) {
            throw new Error('Reference book record not found.');
        }

        await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.PROCESSING,
            processingProgress: 10,
            processingError: ''
        });

        const fileBuffer = preloadedBuffer || await loadBookBinaryFromParts(bookId);

        // Step 1: Extract text (with OCR fallback for scanned PDFs)
        await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
            processingProgress: 25
        });

        const extracted = await extractBookDocument(fileBuffer, book.fileType);
        const chunks = chunkExtractedPages(extracted.pages);

        if (chunks.length === 0) {
            throw new Error('Document extraction produced zero usable text chunks.');
        }

        await updateBookStatus(bookId, {
            ocrUsed: extracted.ocrUsed,
            totalPages: extracted.totalPages,
            totalChunks: chunks.length,
            processingStatus: PROCESSING_STATUSES.GENERATING_EMBEDDINGS,
            processingProgress: 45
        });

        // Step 2: Reuse existing embeddings by contentHash to avoid redundant AI API costs
        const uniqueHashes = Array.from(new Set(chunks.map(c => c.contentHash)));
        const existingEmbeddedChunks = await prisma.knowledgeBookChunk.findMany({
            where: {
                contentHash: { in: uniqueHashes }
            },
            select: {
                contentHash: true,
                embedding: true
            }
        });

        const embeddingCache = new Map();
        for (const existing of existingEmbeddedChunks) {
            if (Array.isArray(existing.embedding) && existing.embedding.length > 0 && !embeddingCache.has(existing.contentHash)) {
                embeddingCache.set(existing.contentHash, existing.embedding);
            }
        }

        const chunksNeedingEmbedding = [];
        for (const chunk of chunks) {
            if (!embeddingCache.has(chunk.contentHash)) {
                chunksNeedingEmbedding.push(chunk);
            }
        }

        const providerInfo = getActiveProviderInfo();

        if (chunksNeedingEmbedding.length > 0) {
            // Embed in batches while updating live progress
            const batchSize = 32;
            for (let i = 0; i < chunksNeedingEmbedding.length; i += batchSize) {
                const batch = chunksNeedingEmbedding.slice(i, i + batchSize);
                const inputs = batch.map(c =>
                    `${book.technology} | ${book.title} | ${c.chapter}\n${c.chunkText}`
                );
                const vectors = await generateEmbeddings(inputs, { taskType: 'RETRIEVAL_DOCUMENT' });
                if (vectors.length !== batch.length) {
                    throw new Error('Embedding count mismatch from AI provider.');
                }
                for (let j = 0; j < batch.length; j++) {
                    embeddingCache.set(batch[j].contentHash, vectors[j]);
                }
                const pct = 45 + Math.round(((i + batch.length) / chunksNeedingEmbedding.length) * 35);
                await updateBookStatus(bookId, { processingProgress: Math.min(80, pct) });
            }
        }

        // Step 3: Index chunks in MongoDB Atlas vector collection
        await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.INDEXING,
            processingProgress: 85
        });

        // Replace old chunks atomically per book
        await prisma.knowledgeBookChunk.deleteMany({ where: { bookId } });

        const insertBatchSize = 50;
        let indexedCount = 0;
        for (let i = 0; i < chunks.length; i += insertBatchSize) {
            const batch = chunks.slice(i, i + insertBatchSize);
            const docs = batch.map(c => ({
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
                embedding: embeddingCache.get(c.contentHash) || [],
                isActive: book.isEnabled !== false
            }));

            await prisma.knowledgeBookChunk.createMany({ data: docs });
            indexedCount += docs.length;
        }

        const sampleVector = embeddingCache.values().next().value;
        const dimensions = Array.isArray(sampleVector) && sampleVector.length > 0
            ? sampleVector.length
            : providerInfo.embeddingDimensions;

        const completedBook = await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.COMPLETED,
            processingProgress: 100,
            processingError: '',
            indexedChunks: indexedCount,
            totalChunks: chunks.length,
            embeddingModel: providerInfo.embeddingModel || 'text-embedding-3-small',
            embeddingDimensions: dimensions,
            knowledgeVersion: (book.knowledgeVersion || 1) + 1,
            lastIndexedAt: new Date()
        });

        return {
            book: completedBook,
            reusedEmbeddings: chunks.length - chunksNeedingEmbedding.length,
            generatedEmbeddings: chunksNeedingEmbedding.length
        };
    } catch (err) {
        console.error(`[BookProcessing] Book ${bookId} failed:`, err.message);
        await updateBookStatus(bookId, {
            processingStatus: PROCESSING_STATUSES.FAILED,
            processingError: String(err.message || 'Unknown processing error').slice(0, 1000)
        }).catch(() => {});
        throw err;
    } finally {
        activeProcessingJobs.delete(bookId);
    }
}

/**
 * Trigger background non-blocking processing so admin uploads return immediately
 */
function scheduleBookProcessing(bookId, preloadedBuffer = null) {
    setImmediate(() => {
        processBookById(bookId, { preloadedBuffer }).catch(err => {
            console.error(`[BookProcessing Background Error] ${bookId}:`, err.message);
        });
    });
}

/**
 * Create a new book record, store binary securely, and enqueue processing
 */
async function createAndQueueBook({
    buffer,
    originalname,
    mimetype,
    title,
    author,
    edition = '',
    description = '',
    publicationYear = null,
    technology,
    uploadedBy = '',
    processSync = false
}) {
    const cleanTitle = String(title || '').trim();
    const cleanAuthor = String(author || '').trim();
    const cleanTechnology = String(technology || '').trim();
    const technologyNormalized = normalizeTechnology(cleanTechnology);

    if (!cleanTitle) {
        const err = new Error('Book title is required.');
        err.status = 400;
        throw err;
    }
    if (!cleanAuthor) {
        const err = new Error('Book author is required.');
        err.status = 400;
        throw err;
    }
    if (!cleanTechnology || !technologyNormalized) {
        const err = new Error('Technology/category is required.');
        err.status = 400;
        throw err;
    }

    const validated = validateUploadedBookFile({ buffer, originalname, mimetype });

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
                : `Duplicate book metadata detected: "${duplicate.book.title}" by ${duplicate.book.author} already exists for ${duplicate.book.technology}.`
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
            processingProgress: 5,
            uploadedBy: String(uploadedBy || '')
        }
    });

    const totalParts = await storeBookBinaryParts(book.id, buffer);
    await updateBookStatus(book.id, { totalParts });

    if (processSync) {
        const result = await processBookById(book.id, { preloadedBuffer: buffer });
        return result.book;
    }

    scheduleBookProcessing(book.id, buffer);
    return { ...book, totalParts };
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

    const validated = validateUploadedBookFile({ buffer, originalname, mimetype });

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

    const totalParts = await storeBookBinaryParts(bookId, buffer);
    const updated = await updateBookStatus(bookId, {
        fileName: validated.fileName,
        fileType: validated.fileType,
        mimeType: validated.mimeType,
        fileSize: validated.fileSize,
        fileHash: validated.fileHash,
        totalParts,
        processingStatus: PROCESSING_STATUSES.UPLOADED,
        processingProgress: 5,
        processingError: ''
    });

    if (processSync) {
        const result = await processBookById(bookId, { preloadedBuffer: buffer });
        return { book: result.book, skippedReembedding: false };
    }

    scheduleBookProcessing(bookId, buffer);
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
    FILE_PART_SIZE_BYTES,
    storeBookBinaryParts,
    loadBookBinaryFromParts,
    findDuplicateBook,
    processBookById,
    scheduleBookProcessing,
    createAndQueueBook,
    replaceBookFile,
    getKnowledgeBaseVersion
};
