const prisma = require('../_config/prisma');
const { normalizeTechnology, getSupportedTechnologies } = require('../_utils/ragTechnology');
const { getDetailedProviderInfo } = require('../_services/aiProviderService');
const { redactSecrets } = require('../_services/aiUsageService');
const {
    getAtlasVectorIndexDefinition,
    ensureAtlasVectorSearchIndex,
    VECTOR_INDEX_NAME
} = require('../_services/vectorSearchService');
const {
    PROCESSING_STATUSES,
    PROCESSING_STAGES,
    IN_PROGRESS_STATUS_LIST,
    DEFAULT_STEP_TIME_BUDGET_MS,
    isServerlessRuntime,
    isInProgressStatus,
    inferProcessingStage,
    isBookProcessingStalled,
    createAndQueueBook,
    replaceBookFile,
    runBookProcessingStep,
    processBookById,
    scheduleBookProcessing,
    findDuplicateBook
} = require('../_services/bookProcessingService');
const {
    normalizeBuffer,
    validateUploadedBookFile,
    sanitizeFileName,
    sha256,
    MAX_BOOK_FILE_SIZE_BYTES
} = require('../_services/bookExtractorService');

function formatBook(book) {
    const inferredStage = inferProcessingStage(book);
    const stalled = isBookProcessingStalled(book);
    const inProgress = isInProgressStatus(book.processingStatus);
    const resolvedEmbeddingMode = book.embeddingMode ||
        (book.embeddingModel === 'text-fallback'
            ? 'text_fallback'
            : (book.embeddingDimensions > 0 ? 'vector' : (book.indexedChunks > 0 ? 'text_fallback' : '')));
    const resolvedEmbeddingDimensions = book.embeddingDimensions !== null && book.embeddingDimensions !== undefined
        ? Number(book.embeddingDimensions)
        : (resolvedEmbeddingMode === 'text_fallback' ? 0 : getDetailedProviderInfo().embeddingDimensions);

    return {
        id: book.id,
        title: book.title,
        author: book.author,
        edition: book.edition || '',
        description: book.description || '',
        publicationYear: book.publicationYear ?? null,
        technology: book.technology,
        technologyNormalized: book.technologyNormalized,
        fileName: book.fileName,
        fileType: book.fileType,
        fileSize: book.fileSize || 0,
        fileHash: book.fileHash,
        isEnabled: book.isEnabled !== false,
        processingStatus: book.processingStatus,
        processingStage: inferredStage,
        processingProgress: book.processingProgress || 0,
        processingError: book.processingError || '',
        processingAttempts: book.processingAttempts || 0,
        extractedPagesCount: book.extractedPagesCount || 0,
        embeddedChunksCount: book.embeddedChunksCount || 0,
        embeddingMode: resolvedEmbeddingMode,
        isStalled: stalled,
        canResume: (inProgress && stalled) || book.processingStatus === PROCESSING_STATUSES.FAILED,
        lastHeartbeatAt: book.processingHeartbeatAt || book.updatedAt || book.createdAt,
        ocrUsed: Boolean(book.ocrUsed),
        totalPages: book.totalPages || 0,
        totalChunks: book.totalChunks || 0,
        indexedChunks: book.indexedChunks || 0,
        embeddingModel: book.embeddingModel || '',
        embeddingDimensions: resolvedEmbeddingDimensions,
        knowledgeVersion: book.knowledgeVersion || 1,
        uploadedBy: book.uploadedBy || '',
        lastIndexedAt: book.lastIndexedAt,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
    };
}

/**
 * GET /api/admin/knowledge-base/status
 */
async function getKnowledgeBaseStatus(req, res) {
    try {
        const [technologies, totalBooks, activeBooks, totalChunks, failedBooks] = await Promise.all([
            getSupportedTechnologies(),
            prisma.knowledgeBook.count(),
            prisma.knowledgeBook.count({
                where: { isEnabled: true, processingStatus: PROCESSING_STATUSES.COMPLETED }
            }),
            prisma.knowledgeBookChunk.count(),
            prisma.knowledgeBook.count({ where: { processingStatus: PROCESSING_STATUSES.FAILED } })
        ]);

        const aiProvider = getDetailedProviderInfo();
        res.json({
            success: true,
            aiProvider,
            vectorIndex: {
                name: VECTOR_INDEX_NAME,
                collection: 'knowledge_book_chunks',
                definition: getAtlasVectorIndexDefinition()
            },
            limits: {
                maxFileSizeBytes: MAX_BOOK_FILE_SIZE_BYTES,
                allowedFormats: ['pdf', 'docx', 'txt']
            },
            summary: {
                totalBooks,
                activeBooks,
                totalChunks,
                failedBooks
            },
            technologies
        });
    } catch (err) {
        console.error('[KnowledgeBase Status Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to load knowledge base status.' });
    }
}

/**
 * GET /api/admin/knowledge-base/books
 */
async function listBooks(req, res) {
    try {
        const { technology, status, search, enabled } = req.query || {};
        const where = {};

        if (technology && technology !== 'all') {
            where.technologyNormalized = normalizeTechnology(technology);
        }
        if (status && status !== 'all') {
            where.processingStatus = String(status);
        }
        if (enabled === 'true') where.isEnabled = true;
        if (enabled === 'false') where.isEnabled = false;

        let books = await prisma.knowledgeBook.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        const cleanSearch = String(search || '').trim().toLowerCase();
        if (cleanSearch) {
            books = books.filter(b =>
                String(b.title || '').toLowerCase().includes(cleanSearch) ||
                String(b.author || '').toLowerCase().includes(cleanSearch) ||
                String(b.technology || '').toLowerCase().includes(cleanSearch) ||
                String(b.description || '').toLowerCase().includes(cleanSearch) ||
                String(b.fileName || '').toLowerCase().includes(cleanSearch)
            );
        }

        const [technologies, allBooksSummary] = await Promise.all([
            getSupportedTechnologies(),
            prisma.knowledgeBook.findMany({
                select: {
                    isEnabled: true,
                    processingStatus: true,
                    totalPages: true,
                    indexedChunks: true
                }
            })
        ]);

        const summary = {
            totalBooks: allBooksSummary.length,
            activeBooks: allBooksSummary.filter(b => b.isEnabled && b.processingStatus === PROCESSING_STATUSES.COMPLETED).length,
            processingBooks: allBooksSummary.filter(b => IN_PROGRESS_STATUS_LIST.includes(b.processingStatus)).length,
            failedBooks: allBooksSummary.filter(b => b.processingStatus === PROCESSING_STATUSES.FAILED).length,
            totalPages: allBooksSummary.reduce((sum, b) => sum + (b.totalPages || 0), 0),
            totalIndexedChunks: allBooksSummary.reduce((sum, b) => sum + (b.indexedChunks || 0), 0)
        };

        res.json({
            success: true,
            books: books.map(formatBook),
            summary,
            technologies,
            aiProvider: getDetailedProviderInfo()
        });
    } catch (err) {
        console.error('[KnowledgeBase List Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch reference books.' });
    }
}

/**
 * GET /api/admin/knowledge-base/books/:id
 */
async function getBookDetails(req, res) {
    try {
        const { id } = req.params;
        const book = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Reference book not found.' });
        }

        const sampleChunks = await prisma.knowledgeBookChunk.findMany({
            where: { bookId: book.id },
            select: {
                id: true,
                chapter: true,
                pageNumber: true,
                chunkIndex: true,
                chunkText: true,
                createdAt: true
            },
            orderBy: { chunkIndex: 'asc' },
            take: 10
        });

        res.json({
            success: true,
            book: formatBook(book),
            sampleChunks
        });
    } catch (err) {
        console.error('[KnowledgeBase Detail Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch book details.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books
 * Multipart book upload (PDF, DOCX, TXT)
 */
async function uploadBook(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'Please attach a PDF, DOCX, or TXT reference book file.' });
        }

        const { title, author, edition, description, publicationYear, technology } = req.body || {};
        const processSync = String(req.query?.sync || req.body?.sync || '') === 'true';

        const book = await createAndQueueBook({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            title,
            author,
            edition,
            description,
            publicationYear,
            technology,
            uploadedBy: req.user?.email || req.user?.name || req.user?.id || 'admin',
            processSync
        });

        res.status(processSync ? 201 : 202).json({
            success: true,
            requiresStepProcessing: !processSync,
            processingMode: isServerlessRuntime() ? 'resumable_step_endpoint' : 'background_and_step',
            message: processSync
                ? 'Reference book uploaded and indexed successfully.'
                : 'Reference book uploaded! Starting document extraction and indexing...',
            book: formatBook(book)
        });
    } catch (err) {
        console.error('[KnowledgeBase Upload Error]:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Failed to upload reference book.',
            ...(err.duplicateBookId ? { duplicateBookId: err.duplicateBookId } : {})
        });
    }
}

/**
 * POST /api/admin/knowledge-base/books/init-upload
 * Chunked upload initiator for large books (>3MB on Vercel Serverless)
 */
async function initChunkedUpload(req, res) {
    try {
        const {
            title,
            author,
            edition = '',
            description = '',
            publicationYear = null,
            technology,
            fileName,
            fileType,
            mimeType,
            fileSize,
            fileHash,
            totalParts
        } = req.body || {};

        const derivedTitle = String(fileName || 'Reference Book')
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim() || 'Reference Book';
        const cleanTitle = String(title || '').trim() || derivedTitle;
        const cleanAuthor = String(author || '').trim();
        const cleanTech = String(technology || '').trim();
        const technologyNormalized = normalizeTechnology(cleanTech);
        const cleanExt = String(fileType || '').toLowerCase().replace('.', '');

        if (!cleanTech || !technologyNormalized) {
            return res.status(400).json({ success: false, message: 'Technology/category is required.' });
        }
        if (!['pdf', 'docx', 'txt'].includes(cleanExt)) {
            return res.status(400).json({ success: false, message: 'Only PDF, DOCX, and TXT files are supported.' });
        }
        if (Number(fileSize) <= 0 || Number(fileSize) > MAX_BOOK_FILE_SIZE_BYTES) {
            return res.status(413).json({
                success: false,
                message: `File size must be between 1 byte and ${Math.round(MAX_BOOK_FILE_SIZE_BYTES / (1024 * 1024))} MB.`
            });
        }

        const safeHash = String(fileHash || '').trim() || sha256(`${cleanTitle}:${cleanAuthor}:${fileName}:${fileSize}:${Date.now()}`);
        const duplicate = await findDuplicateBook({
            fileHash: safeHash,
            title: cleanTitle,
            author: cleanAuthor,
            edition,
            technologyNormalized
        });
        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: duplicate.reason === 'file_hash'
                    ? `Duplicate upload detected: this file already exists as "${duplicate.book.title}".`
                    : `Duplicate book metadata detected: "${duplicate.book.title}" already exists for ${duplicate.book.technology}.`
            });
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
                technology: cleanTech,
                technologyNormalized,
                fileName: sanitizeFileName(fileName),
                fileType: cleanExt,
                mimeType: String(mimeType || 'application/octet-stream'),
                fileSize: Number(fileSize) || 0,
                fileHash: safeHash,
                totalParts: Number(totalParts) || 1,
                isEnabled: true,
                processingStatus: PROCESSING_STATUSES.UPLOADED,
                processingStage: PROCESSING_STAGES.UPLOADED,
                processingProgress: 5,
                processingError: '',
                processingLockId: '',
                processingHeartbeatAt: new Date(),
                uploadedBy: req.user?.email || req.user?.name || 'admin'
            }
        });

        res.status(201).json({ success: true, book: formatBook(book) });
    } catch (err) {
        console.error('[KnowledgeBase Init Chunked Upload Error]:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to initialize upload.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books/:id/upload-part
 */
async function uploadBookPart(req, res) {
    try {
        const { id } = req.params;
        const partIndex = parseInt(req.body?.partIndex ?? req.query?.partIndex, 10);
        if (!req.file?.buffer || isNaN(partIndex) || partIndex < 0) {
            return res.status(400).json({ success: false, message: 'Valid partIndex and file chunk are required.' });
        }

        const book = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book record not found.' });
        }

        await prisma.knowledgeBookFilePart.upsert({
            where: {
                bookId_partIndex: { bookId: book.id, partIndex }
            },
            update: { data: req.file.buffer },
            create: {
                bookId: book.id,
                partIndex,
                data: req.file.buffer
            }
        });

        res.json({ success: true, partIndex });
    } catch (err) {
        console.error('[KnowledgeBase Upload Part Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to upload file chunk.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books/:id/finalize-upload
 */
async function finalizeChunkedUpload(req, res) {
    try {
        const { id } = req.params;
        const book = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book record not found.' });
        }

        const parts = await prisma.knowledgeBookFilePart.findMany({
            where: { bookId: book.id },
            orderBy: { partIndex: 'asc' }
        });

        if (parts.length === 0) {
            return res.status(400).json({ success: false, message: 'No uploaded file chunks found.' });
        }
        if (book.totalParts > 0 && parts.length < book.totalParts) {
            return res.status(400).json({
                success: false,
                message: `Incomplete file upload: received ${parts.length} of ${book.totalParts} parts. Please retry the upload.`
            });
        }

        const fullBuffer = Buffer.concat(parts.map(p => normalizeBuffer(p.data)));
        const validated = validateUploadedBookFile({
            buffer: fullBuffer,
            originalname: book.fileName,
            mimetype: book.mimeType
        });

        const dupHash = await prisma.knowledgeBook.findFirst({
            where: { fileHash: validated.fileHash, id: { not: book.id } }
        });
        if (dupHash) {
            await prisma.knowledgeBookFilePart.deleteMany({ where: { bookId: book.id } }).catch(() => {});
            await prisma.knowledgeBook.delete({ where: { id: book.id } }).catch(() => {});
            return res.status(409).json({
                success: false,
                message: `Duplicate upload detected: this exact file already exists as "${dupHash.title}".`
            });
        }

        const updated = await prisma.knowledgeBook.update({
            where: { id: book.id },
            data: {
                fileHash: validated.fileHash,
                fileSize: validated.fileSize,
                totalParts: parts.length,
                processingStatus: PROCESSING_STATUSES.UPLOADED,
                processingStage: PROCESSING_STAGES.UPLOADED,
                processingProgress: 10,
                processingError: '',
                processingLockId: '',
                processingLockedAt: null,
                processingHeartbeatAt: new Date()
            }
        });

        const processSync = String(req.query?.sync || req.body?.sync || '') === 'true';
        if (processSync) {
            const result = await processBookById(book.id, { preloadedBuffer: fullBuffer, forceReextract: true });
            return res.json({ success: true, book: formatBook(result.book) });
        }

        scheduleBookProcessing(book.id, fullBuffer);
        res.status(202).json({
            success: true,
            requiresStepProcessing: true,
            processingMode: isServerlessRuntime() ? 'resumable_step_endpoint' : 'background_and_step',
            message: 'Upload finalized. Starting document extraction and indexing...',
            book: formatBook(updated)
        });
    } catch (err) {
        console.error('[KnowledgeBase Finalize Upload Error]:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to finalize upload.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books/:id/process-step
 * POST /api/admin/knowledge-base/books/:id/resume
 * Executes one resumable, lock-protected, time-bounded processing step (Vercel-safe).
 */
async function processBookStep(req, res) {
    try {
        const { id } = req.params;
        const requestedBudget = parseInt(req.body?.timeBudgetMs ?? req.query?.timeBudgetMs ?? '', 10);
        const timeBudgetMs = Number.isFinite(requestedBudget)
            ? Math.min(30000, Math.max(5000, requestedBudget))
            : DEFAULT_STEP_TIME_BUDGET_MS;
        const forceReextract = Boolean(req.body?.forceReextract || req.query?.forceReextract === 'true');

        const result = await runBookProcessingStep(String(id), {
            timeBudgetMs,
            forceReextract
        });

        res.json({
            success: true,
            done: Boolean(result.done),
            locked: Boolean(result.locked),
            alreadyCompleted: Boolean(result.alreadyCompleted),
            needsMoreSteps: Boolean(result.needsMoreSteps),
            stage: result.stage || inferProcessingStage(result.book),
            progress: result.progress ?? result.book?.processingProgress ?? 0,
            reusedEmbeddings: result.reusedEmbeddings || 0,
            generatedEmbeddings: result.generatedEmbeddings || 0,
            book: formatBook(result.book)
        });
    } catch (err) {
        if (err?.status === 404) {
            return res.status(404).json({ success: false, message: err.message || 'Reference book not found.' });
        }

        console.error('[KnowledgeBase Process Step Error]:', redactSecrets(err?.message || 'Processing error'));
        const failedBook = await prisma.knowledgeBook.findUnique({ where: { id: String(req.params.id) } }).catch(() => null);
        if (failedBook) {
            return res.status(200).json({
                success: false,
                done: true,
                failed: true,
                needsMoreSteps: false,
                message: failedBook.processingError || err.message || 'Book processing failed.',
                book: formatBook(failedBook)
            });
        }

        res.status(err.status || 500).json({
            success: false,
            done: true,
            failed: true,
            message: err.message || 'Failed to process reference book step.'
        });
    }
}

/**
 * PUT /api/admin/knowledge-base/books/:id
 * Update metadata & keep chunks synchronized
 */
async function updateBookMetadata(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reference book not found.' });
        }

        const { title, author, edition, description, publicationYear, technology } = req.body || {};
        const nextTitle = title !== undefined ? String(title).trim() : existing.title;
        const nextAuthor = author !== undefined ? String(author).trim() : existing.author;
        const nextEdition = edition !== undefined ? String(edition).trim() : (existing.edition || '');
        const nextDescription = description !== undefined ? String(description).trim() : (existing.description || '');
        const nextTech = technology !== undefined ? String(technology).trim() : existing.technology;
        const nextTechNorm = normalizeTechnology(nextTech);
        const yearNum = publicationYear !== undefined
            ? (String(publicationYear).trim() === '' ? null : parseInt(publicationYear, 10))
            : existing.publicationYear;

        if (!nextTitle || !nextTechNorm) {
            return res.status(400).json({ success: false, message: 'Title and technology are required.' });
        }

        const updated = await prisma.knowledgeBook.update({
            where: { id: existing.id },
            data: {
                title: nextTitle,
                author: nextAuthor,
                edition: nextEdition,
                description: nextDescription,
                publicationYear: Number.isFinite(yearNum) ? yearNum : null,
                technology: nextTech,
                technologyNormalized: nextTechNorm,
                knowledgeVersion: (existing.knowledgeVersion || 1) + 1
            }
        });

        await prisma.knowledgeBookChunk.updateMany({
            where: { bookId: existing.id },
            data: {
                bookTitle: nextTitle,
                author: nextAuthor,
                edition: nextEdition,
                technology: nextTech,
                technologyNormalized: nextTechNorm
            }
        });

        res.json({
            success: true,
            message: 'Reference book metadata updated.',
            book: formatBook(updated)
        });
    } catch (err) {
        console.error('[KnowledgeBase Update Metadata Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to update book metadata.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books/:id/replace
 * Replace uploaded file for an existing book
 */
async function replaceBook(req, res) {
    try {
        const { id } = req.params;
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'Please attach a replacement PDF, DOCX, or TXT file.' });
        }

        const processSync = String(req.query?.sync || req.body?.sync || '') === 'true';
        const result = await replaceBookFile(String(id), {
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            processSync
        });

        res.status(result.skippedReembedding || processSync ? 200 : 202).json({
            success: true,
            skippedReembedding: Boolean(result.skippedReembedding),
            requiresStepProcessing: !result.skippedReembedding && !processSync,
            message: result.message || 'Replacement book uploaded and queued for indexing.',
            book: formatBook(result.book)
        });
    } catch (err) {
        console.error('[KnowledgeBase Replace Error]:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to replace book file.' });
    }
}

/**
 * PATCH /api/admin/knowledge-base/books/:id/toggle
 * Enable or disable a book & sync chunk active flags immediately
 */
async function toggleBookEnabled(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reference book not found.' });
        }

        const nextEnabled = req.body?.isEnabled !== undefined ? Boolean(req.body.isEnabled) : !existing.isEnabled;

        const updated = await prisma.knowledgeBook.update({
            where: { id: existing.id },
            data: {
                isEnabled: nextEnabled,
                knowledgeVersion: (existing.knowledgeVersion || 1) + 1
            }
        });

        await prisma.knowledgeBookChunk.updateMany({
            where: { bookId: existing.id },
            data: { isActive: nextEnabled }
        });

        res.json({
            success: true,
            message: nextEnabled ? `"${updated.title}" enabled for AI verification.` : `"${updated.title}" disabled.`,
            book: formatBook(updated)
        });
    } catch (err) {
        console.error('[KnowledgeBase Toggle Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to toggle book status.' });
    }
}

/**
 * POST /api/admin/knowledge-base/books/:id/retry
 * Retry processing a failed, stalled, or completed (re-index) book safely.
 */
async function retryBookProcessing(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reference book not found.' });
        }

        const processSync = String(req.query?.sync || req.body?.sync || '') === 'true';
        const forceReextract = Boolean(
            req.body?.forceReextract ||
            req.query?.forceReextract === 'true' ||
            req.body?.mode === 'reindex'
        );

        const existingChunks = await prisma.knowledgeBookChunk.findMany({
            where: { bookId: existing.id },
            select: { id: true }
        });

        const canResumeFromEmbeddings = !forceReextract &&
            existingChunks.length > 0 &&
            existing.processingStatus !== PROCESSING_STATUSES.COMPLETED;

        const nextStage = canResumeFromEmbeddings
            ? PROCESSING_STAGES.GENERATING_EMBEDDINGS
            : PROCESSING_STAGES.UPLOADED;
        const nextStatus = canResumeFromEmbeddings
            ? PROCESSING_STATUSES.GENERATING_EMBEDDINGS
            : PROCESSING_STATUSES.UPLOADED;
        const nextProgress = canResumeFromEmbeddings
            ? Math.max(70, Math.min(89, existing.processingProgress || 70))
            : 10;

        const updated = await prisma.knowledgeBook.update({
            where: { id: existing.id },
            data: {
                processingStatus: nextStatus,
                processingStage: nextStage,
                processingProgress: nextProgress,
                processingError: '',
                processingLockId: '',
                processingLockedAt: null,
                processingHeartbeatAt: new Date(),
                processingAttempts: 0
            }
        });

        if (processSync) {
            const result = await processBookById(existing.id, { forceReextract: !canResumeFromEmbeddings });
            return res.json({
                success: true,
                message: 'Book re-processed successfully.',
                reusedEmbeddings: result.reusedEmbeddings,
                generatedEmbeddings: result.generatedEmbeddings,
                book: formatBook(result.book)
            });
        }

        scheduleBookProcessing(existing.id);
        res.status(202).json({
            success: true,
            requiresStepProcessing: true,
            message: canResumeFromEmbeddings
                ? 'Resuming embedding generation from saved chunks...'
                : 'Re-processing started.',
            book: formatBook(updated)
        });
    } catch (err) {
        console.error('[KnowledgeBase Retry Error]:', err);
        res.status(err.status || 500).json({ success: false, message: err.message || 'Failed to retry book processing.' });
    }
}

/**
 * DELETE /api/admin/knowledge-base/books/:id
 */
async function deleteBook(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma.knowledgeBook.findUnique({ where: { id: String(id) } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Reference book not found.' });
        }

        // Explicitly clean up chunks & binary parts before deleting parent book
        await Promise.all([
            prisma.knowledgeBookChunk.deleteMany({ where: { bookId: existing.id } }),
            prisma.knowledgeBookFilePart.deleteMany({ where: { bookId: existing.id } })
        ]);
        await prisma.knowledgeBook.delete({ where: { id: existing.id } });

        res.json({
            success: true,
            message: `"${existing.title}" and all its indexed vector chunks were deleted.`
        });
    } catch (err) {
        console.error('[KnowledgeBase Delete Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to delete reference book.' });
    }
}

/**
 * POST /api/admin/knowledge-base/setup-vector-index
 * Convenience endpoint for admins to trigger Atlas Vector Search index creation
 */
async function setupVectorIndex(req, res) {
    try {
        const result = await ensureAtlasVectorSearchIndex();
        res.status(result.success ? 200 : 202).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getKnowledgeBaseStatus,
    listBooks,
    getBookDetails,
    uploadBook,
    initChunkedUpload,
    uploadBookPart,
    finalizeChunkedUpload,
    processBookStep,
    updateBookMetadata,
    replaceBook,
    toggleBookEnabled,
    retryBookProcessing,
    deleteBook,
    setupVectorIndex
};
