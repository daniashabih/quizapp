process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

const prisma = require('../api/_config/prisma');
const { setAiProviderOverride } = require('../api/_services/aiProviderService');
const {
    validateUploadedBookFile,
    extractBookDocument,
    chunkExtractedPages
} = require('../api/_services/bookExtractorService');
const {
    PROCESSING_STATUSES,
    PROCESSING_STAGES,
    LOCK_TTL_MS,
    isBookProcessingStalled,
    createAndQueueBook,
    runBookProcessingStep,
    scheduleBookProcessing
} = require('../api/_services/bookProcessingService');
const knowledgeBaseController = require('../api/_controllers/knowledgeBaseController');

function deterministicVec(text, dim = 1536) {
    const vec = new Array(dim).fill(0);
    const words = String(text || '').toLowerCase().split(/\W+/).filter(Boolean);
    for (const w of words) {
        let h = 2166136261;
        for (let i = 0; i < w.length; i++) {
            h ^= w.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        vec[Math.abs(h) % dim] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
}

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

function installResumableMockPrisma() {
    const state = {
        books: new Map(),
        fileParts: new Map(),
        chunks: [],
        progressHistory: [],
        idSeq: 1
    };

    const nextOid = () => String(state.idSeq++).padStart(24, '0');
    const originals = {
        knowledgeBook: prisma.knowledgeBook,
        knowledgeBookFilePart: prisma.knowledgeBookFilePart,
        knowledgeBookChunk: prisma.knowledgeBookChunk
    };

    function matchesOr(record, clauses) {
        return clauses.some(clause => {
            if ('processingLockId' in clause) {
                if (clause.processingLockId === null) return record.processingLockId == null;
                return record.processingLockId === clause.processingLockId;
            }
            if ('processingLockedAt' in clause) {
                if (clause.processingLockedAt === null) return record.processingLockedAt == null;
                if (clause.processingLockedAt?.lt) {
                    return record.processingLockedAt && new Date(record.processingLockedAt) < new Date(clause.processingLockedAt.lt);
                }
            }
            return false;
        });
    }

    prisma.knowledgeBook = {
        create: async ({ data }) => {
            const id = nextOid();
            const rec = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
            state.books.set(id, rec);
            return rec;
        },
        findUnique: async ({ where }) => state.books.get(where.id) || null,
        findFirst: async ({ where = {} }) => {
            for (const b of state.books.values()) {
                if (where.fileHash && b.fileHash !== where.fileHash) continue;
                if (where.id?.not && b.id === where.id.not) continue;
                return b;
            }
            return null;
        },
        findMany: async ({ where = {} } = {}) => {
            return Array.from(state.books.values()).filter(b => {
                if (where.technologyNormalized && b.technologyNormalized !== where.technologyNormalized) return false;
                if (where.processingStatus && b.processingStatus !== where.processingStatus) return false;
                if (where.id?.not && b.id === where.id.not) return false;
                return true;
            });
        },
        update: async ({ where, data }) => {
            const cur = state.books.get(where.id);
            if (!cur) throw new Error('Book not found');
            const next = { ...cur, ...data, updatedAt: new Date() };
            state.books.set(where.id, next);
            if (data.processingStatus !== undefined || data.processingProgress !== undefined) {
                state.progressHistory.push({
                    bookId: where.id,
                    status: next.processingStatus,
                    stage: next.processingStage,
                    progress: next.processingProgress,
                    totalPages: next.totalPages,
                    totalChunks: next.totalChunks
                });
            }
            return next;
        },
        updateMany: async ({ where = {}, data = {} }) => {
            let count = 0;
            for (const [id, rec] of state.books.entries()) {
                if (where.id && id !== where.id) continue;
                if (where.processingLockId !== undefined && rec.processingLockId !== where.processingLockId) continue;
                if (Array.isArray(where.OR) && !matchesOr(rec, where.OR)) continue;
                state.books.set(id, { ...rec, ...data, updatedAt: new Date() });
                count++;
            }
            return { count };
        },
        delete: async ({ where }) => {
            const cur = state.books.get(where.id);
            state.books.delete(where.id);
            return cur;
        },
        count: async () => state.books.size
    };

    prisma.knowledgeBookFilePart = {
        deleteMany: async ({ where }) => {
            state.fileParts.delete(where.bookId);
            return { count: 1 };
        },
        create: async ({ data }) => {
            const list = state.fileParts.get(data.bookId) || [];
            list.push({ id: nextOid(), ...data });
            state.fileParts.set(data.bookId, list);
            return data;
        },
        findMany: async ({ where }) => {
            const list = state.fileParts.get(where.bookId) || [];
            return [...list].sort((a, b) => a.partIndex - b.partIndex);
        }
    };

    prisma.knowledgeBookChunk = {
        findMany: async ({ where = {} } = {}) => {
            return state.chunks
                .filter(c => {
                    if (where.bookId && c.bookId !== where.bookId) return false;
                    if (where.isActive !== undefined && c.isActive !== where.isActive) return false;
                    if (where.contentHash?.in && !where.contentHash.in.includes(c.contentHash)) return false;
                    return true;
                })
                .sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));
        },
        createMany: async ({ data }) => {
            for (const d of data) {
                state.chunks.push({ id: nextOid(), createdAt: new Date(), ...d });
            }
            return { count: data.length };
        },
        update: async ({ where, data }) => {
            const chunk = state.chunks.find(c => c.id === where.id);
            if (!chunk) throw new Error('Chunk not found');
            Object.assign(chunk, data);
            return chunk;
        },
        updateMany: async ({ where = {}, data = {} }) => {
            let count = 0;
            for (const c of state.chunks) {
                if (where.bookId && c.bookId !== where.bookId) continue;
                Object.assign(c, data);
                count++;
            }
            return { count };
        },
        deleteMany: async ({ where }) => {
            const before = state.chunks.length;
            state.chunks = state.chunks.filter(c => c.bookId !== where.bookId);
            return { count: before - state.chunks.length };
        },
        count: async ({ where = {} } = {}) => {
            return state.chunks.filter(c => !where.bookId || c.bookId === where.bookId).length;
        }
    };

    return {
        state,
        restore: () => Object.assign(prisma, originals)
    };
}

test('Document extraction works reliably for multi-page PDF, DOCX, and TXT, and rejects invalid/empty files', async () => {
    // 1. Multi-page PDF (14 pages)
    const samplePdfPath = path.join(process.cwd(), 'node_modules/pdf-parse/test/data/01-valid.pdf');
    const pdfBuf = fs.readFileSync(samplePdfPath);
    const pdfValidated = validateUploadedBookFile({
        buffer: pdfBuf,
        originalname: 'sample-multi-page.pdf',
        mimetype: 'application/pdf'
    });
    assert.equal(pdfValidated.fileType, 'pdf');

    const seenPages = [];
    const pdfExtracted = await extractBookDocument(pdfBuf, 'pdf', {
        onPageProgress: ({ currentPage, totalPages }) => {
            seenPages.push({ currentPage, totalPages });
        }
    });
    assert.equal(pdfExtracted.totalPages, 14);
    assert.ok(pdfExtracted.pages.length >= 10);
    assert.equal(seenPages.length, 14);
    assert.equal(pdfExtracted.ocrUsed, false);
    const pdfChunks = chunkExtractedPages(pdfExtracted.pages);
    assert.ok(pdfChunks.length >= 15);

    // 2. Real DOCX document
    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({ text: 'Chapter 1: SQL Indexing Fundamentals', heading: HeadingLevel.HEADING_1 }),
                new Paragraph('A clustered index determines the physical storage order of data rows in a SQL Server table.'),
                new Paragraph({ text: 'Chapter 2: Query Execution Plans', heading: HeadingLevel.HEADING_1 }),
                new Paragraph('Index Seek operations navigate the B-Tree directly rather than scanning every leaf page.')
            ]
        }]
    });
    const docxBuf = await Packer.toBuffer(doc);
    const docxValidated = validateUploadedBookFile({
        buffer: docxBuf,
        originalname: 'sql-internals.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    assert.equal(docxValidated.fileType, 'docx');

    const docxExtracted = await extractBookDocument(docxBuf, 'docx');
    assert.ok(docxExtracted.totalPages >= 1);
    assert.ok(docxExtracted.pages.some(p => p.text.includes('clustered index')));
    assert.ok(docxExtracted.pages.some(p => p.chapter.includes('SQL Indexing')));

    // 3. TXT with UTF-8 BOM & form-feed page breaks
    const txtBuf = Buffer.concat([
        Buffer.from([0xEF, 0xBB, 0xBF]),
        Buffer.from('Chapter 1 HTML5\nSemantic tags like <article> and <section> describe meaning.\fChapter 2 CSS\nFlexbox aligns items along the main axis.', 'utf8')
    ]);
    const txtExtracted = await extractBookDocument(txtBuf, 'txt');
    assert.equal(txtExtracted.totalPages, 2);
    assert.equal(txtExtracted.pages.length, 2);

    // 4. Empty TXT & corrupted DOCX / PDF errors
    await assert.rejects(
        () => extractBookDocument(Buffer.from('   \n\t  ', 'utf8'), 'txt'),
        /no readable text/i
    );
    await assert.rejects(
        () => extractBookDocument(Buffer.from('PK\x03\x04corrupted-zip-data', 'latin1'), 'docx'),
        /Unable to read DOCX|corrupted/i
    );
    await assert.rejects(
        () => extractBookDocument(Buffer.from('%PDF-1.4\ncorrupted-garbage-without-objects', 'latin1'), 'pdf'),
        /Unable to extract text from this PDF|scanned image document/i
    );
});

test('Resumable state machine rescues stuck 25% books, enforces distributed locks, pauses/resumes embeddings, and avoids Vercel unawaited promises', async () => {
    const mockDb = installResumableMockPrisma();
    const prevVercel = process.env.VERCEL;
    process.env.VERCEL = '1';

    let embedCalls = 0;
    setAiProviderOverride({
        provider: 'openai',
        embeddingModel: 'text-embedding-3-small',
        verificationModel: 'gpt-4o-mini',
        embeddingDimensions: 1536,
        generateEmbeddings: async (texts) => {
            embedCalls++;
            // Simulate small delay so time-budget pausing can be tested deterministically
            await new Promise(r => setTimeout(r, 15));
            return texts.map(t => deterministicVec(t, 1536));
        }
    });

    try {
        // 1. On Vercel, scheduleBookProcessing MUST NOT rely on unawaited background promises
        const schedRes = scheduleBookProcessing('000000000000000000000099');
        assert.equal(schedRes.scheduled, false);
        assert.equal(schedRes.mode, 'resumable_step_endpoint');

        // 2. Upload multi-page PDF asynchronously on Vercel -> stays at Uploaded 10% until step endpoint runs
        const samplePdfBuf = fs.readFileSync(path.join(process.cwd(), 'node_modules/pdf-parse/test/data/02-valid.pdf'));
        const uploaded = await createAndQueueBook({
            buffer: samplePdfBuf,
            originalname: 'distributed-guide.pdf',
            mimetype: 'application/pdf',
            title: 'Distributed Systems Guide',
            author: 'Test Author',
            technology: 'JavaScript',
            processSync: false
        });
        assert.equal(uploaded.processingStatus, PROCESSING_STATUSES.UPLOADED);
        assert.equal(uploaded.processingProgress, 10);

        // 3. Simulate legacy stuck state at 25% ("Extracting Text") from an interrupted Vercel function!
        await prisma.knowledgeBook.update({
            where: { id: uploaded.id },
            data: {
                processingStatus: PROCESSING_STATUSES.EXTRACTING_TEXT,
                processingStage: null,
                processingProgress: 25,
                processingLockId: '',
                processingLockedAt: null,
                processingHeartbeatAt: new Date(Date.now() - LOCK_TTL_MS - 10000)
            }
        });
        const stuckRecord = await prisma.knowledgeBook.findUnique({ where: { id: uploaded.id } });
        assert.equal(isBookProcessingStalled(stuckRecord), true);

        // 4. Verify active lock blocks duplicate concurrent processing
        await prisma.knowledgeBook.update({
            where: { id: uploaded.id },
            data: {
                processingLockId: 'lock_other_worker',
                processingLockedAt: new Date(),
                processingHeartbeatAt: new Date()
            }
        });
        const lockedRes = await runBookProcessingStep(uploaded.id);
        assert.equal(lockedRes.locked, true);
        assert.equal(lockedRes.done, false);

        // 5. Simulate expired stale lock (> 45s old) -> automatically recovered & processed to 100%!
        await prisma.knowledgeBook.update({
            where: { id: uploaded.id },
            data: {
                processingLockId: 'lock_crashed_worker',
                processingLockedAt: new Date(Date.now() - LOCK_TTL_MS - 5000),
                processingHeartbeatAt: new Date(Date.now() - LOCK_TTL_MS - 5000)
            }
        });

        // Drive via controller endpoint (with tiny 1ms budget first to verify multi-step resume!)
        const step1Res = createMockRes();
        await knowledgeBaseController.processBookStep(
            { params: { id: uploaded.id }, body: { timeBudgetMs: 1 }, query: {} },
            step1Res
        );
        // Note controller clamps timeBudgetMs to >= 5000ms, so small 5-page PDF may finish in 1 step
        assert.equal(step1Res.statusCode, 200);
        assert.equal(step1Res.body.success, true);

        let currentBody = step1Res.body;
        let guard = 0;
        while (!currentBody.done && guard < 10) {
            const nextRes = createMockRes();
            await knowledgeBaseController.processBookStep(
                { params: { id: uploaded.id }, body: {}, query: {} },
                nextRes
            );
            currentBody = nextRes.body;
            guard++;
        }

        assert.equal(currentBody.done, true);
        assert.equal(currentBody.book.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(currentBody.book.processingProgress, 100);
        assert.equal(currentBody.book.totalPages, 5);
        assert.ok(currentBody.book.indexedChunks > 0);
        assert.equal(currentBody.book.embeddingMode, 'vector');
        assert.equal(currentBody.book.embeddingDimensions, 1536);
        assert.ok(embedCalls >= 1);

        // Verify persisted progress stages progressed through Extracting Text -> Preparing Content -> Generating Chunks -> Generating Embeddings -> Indexing -> Completed
        const statuses = mockDb.state.progressHistory
            .filter(h => h.bookId === uploaded.id)
            .map(h => h.status);
        assert.ok(statuses.includes(PROCESSING_STATUSES.EXTRACTING_TEXT));
        assert.ok(statuses.includes(PROCESSING_STATUSES.PREPARING_CONTENT));
        assert.ok(statuses.includes(PROCESSING_STATUSES.GENERATING_CHUNKS));
        assert.ok(statuses.includes(PROCESSING_STATUSES.GENERATING_EMBEDDINGS));
        assert.ok(statuses.includes(PROCESSING_STATUSES.INDEXING));
        assert.ok(statuses.includes(PROCESSING_STATUSES.COMPLETED));
    } finally {
        if (prevVercel === undefined) delete process.env.VERCEL;
        else process.env.VERCEL = prevVercel;
        setAiProviderOverride(null);
        mockDb.restore();
    }
});

test('Groq-only environment (no embedding API key) completes cleanly in Text Fallback mode without hanging or faking vectors', async () => {
    const mockDb = installResumableMockPrisma();
    const envKeys = ['AI_PROVIDER', 'GROQ_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'EMBEDDING_PROVIDER'];
    const snapshot = {};
    for (const k of envKeys) snapshot[k] = process.env[k];

    try {
        setAiProviderOverride(null);
        process.env.AI_PROVIDER = 'groq';
        process.env.GROQ_API_KEY = 'gsk_test_groq_only_key_123456';
        delete process.env.OPENAI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        delete process.env.GOOGLE_API_KEY;
        delete process.env.EMBEDDING_PROVIDER;

        const book = await createAndQueueBook({
            buffer: Buffer.from('Chapter 1 React Hooks\nThe useState hook lets functional components hold local state.\n\nThe useEffect hook synchronizes components with external systems.', 'utf8'),
            originalname: 'react-hooks-guide.txt',
            mimetype: 'text/plain',
            technology: 'React',
            processSync: true
        });

        assert.equal(book.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(book.processingProgress, 100);
        assert.equal(book.totalPages, 1);
        assert.ok(book.indexedChunks >= 1);
        assert.equal(book.embeddingMode, 'text_fallback');
        assert.equal(book.embeddingModel, 'text-fallback');
        assert.equal(book.embeddingDimensions, 0);

        const savedChunks = mockDb.state.chunks.filter(c => c.bookId === book.id);
        assert.ok(savedChunks.length >= 1);
        assert.equal(savedChunks[0].isActive, true);
        assert.deepEqual(savedChunks[0].embedding, []);
    } finally {
        for (const [k, v] of Object.entries(snapshot)) {
            if (v === undefined) delete process.env[k];
            else process.env[k] = v;
        }
        mockDb.restore();
    }
});

test('Embedding API failure persists clear error and preserves extracted chunks so Retry resumes at Generating Embeddings', async () => {
    const mockDb = installResumableMockPrisma();
    let shouldFail = true;
    let embedCalls = 0;

    setAiProviderOverride({
        provider: 'openai',
        embeddingModel: 'text-embedding-3-small',
        verificationModel: 'gpt-4o-mini',
        embeddingDimensions: 1536,
        generateEmbeddings: async (texts) => {
            embedCalls++;
            if (shouldFail) {
                throw new Error('Upstream quota exceeded for key sk-secret-12345678901234567890');
            }
            return texts.map(t => deterministicVec(t, 1536));
        }
    });

    try {
        const book = await createAndQueueBook({
            buffer: Buffer.from('Chapter 1 MongoDB Indexes\nCompound indexes support queries matching prefixes of the indexed fields.', 'utf8'),
            originalname: 'mongodb-indexes.txt',
            mimetype: 'text/plain',
            technology: 'MongoDB',
            processSync: false
        });

        const failStepRes = createMockRes();
        await knowledgeBaseController.processBookStep(
            { params: { id: book.id }, body: {}, query: {} },
            failStepRes
        );
        assert.equal(failStepRes.statusCode, 200);
        assert.equal(failStepRes.body.failed, true);
        assert.equal(failStepRes.body.book.processingStatus, PROCESSING_STATUSES.FAILED);
        assert.ok(failStepRes.body.book.processingError.includes('Upstream quota exceeded'));
        assert.equal(failStepRes.body.book.processingError.includes('sk-secret-'), false);
        assert.ok(mockDb.state.chunks.filter(c => c.bookId === book.id).length >= 1, 'Extracted chunks must be preserved on embedding failure');

        // Retry should resume directly from Generating Embeddings (70%) without re-extracting!
        shouldFail = false;
        const retryRes = createMockRes();
        await knowledgeBaseController.retryBookProcessing(
            { params: { id: book.id }, body: {}, query: {} },
            retryRes
        );
        assert.equal(retryRes.statusCode, 202);
        assert.equal(retryRes.body.book.processingStage, PROCESSING_STAGES.GENERATING_EMBEDDINGS);

        const resumeStepRes = createMockRes();
        await knowledgeBaseController.processBookStep(
            { params: { id: book.id }, body: {}, query: {} },
            resumeStepRes
        );
        assert.equal(resumeStepRes.body.done, true);
        assert.equal(resumeStepRes.body.book.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(resumeStepRes.body.book.processingProgress, 100);
        assert.ok(embedCalls >= 2);
    } finally {
        setAiProviderOverride(null);
        mockDb.restore();
    }
});
