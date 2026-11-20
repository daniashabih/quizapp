process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createCanvas } = require('@napi-rs/canvas');
const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

const prisma = require('../api/_config/prisma');
const { setAiProviderOverride } = require('../api/_services/aiProviderService');
const {
    analyzePdfPages,
    terminateOcrWorker
} = require('../api/_services/ocrService');
const {
    extractBookDocument,
    chunkExtractedPages
} = require('../api/_services/bookExtractorService');
const {
    PROCESSING_STATUSES,
    PROCESSING_STAGES,
    LOCK_TTL_MS,
    createAndQueueBook,
    runBookProcessingStep
} = require('../api/_services/bookProcessingService');
const { searchRelevantBookChunksByText } = require('../api/_services/vectorSearchService');
const knowledgeBaseController = require('../api/_controllers/knowledgeBaseController');

/**
 * Render lines of text onto an in-memory canvas and encode as JPEG (simulates a real scanned book page).
 * Supports `lowQuality: true` to simulate yellowed paper, low contrast faded ink, and scanner speckle noise.
 */
function renderScannedPageJpeg(lines, { width = 1200, height = 1550, lowQuality = false } = {}) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background (pure white for clean scan, warm/greyish for low-quality scan)
    ctx.fillStyle = lowQuality ? '#DCD7C9' : '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (lowQuality) {
        // Simulated faint uneven illumination + deterministic scanner grain noise
        ctx.fillStyle = 'rgba(130, 125, 115, 0.08)';
        ctx.fillRect(0, 0, width, Math.floor(height * 0.45));
        let seed = 1337;
        const rand = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < 4500; i++) {
            const x = Math.floor(rand() * width);
            const y = Math.floor(rand() * height);
            ctx.fillStyle = rand() > 0.5 ? 'rgba(95,95,95,0.28)' : 'rgba(220,220,220,0.35)';
            ctx.fillRect(x, y, 2, 2);
        }
    }

    ctx.fillStyle = lowQuality ? '#6B6B6B' : '#111111';
    let y = 130;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isHeading = i === 0 || /^Chapter\s+\d+/i.test(line);
        ctx.font = isHeading ? 'bold 42px Arial, sans-serif' : '32px Arial, sans-serif';
        ctx.fillText(line, 90, y);
        y += isHeading ? 74 : 54;
    }

    return {
        jpegBuffer: canvas.toBuffer('image/jpeg', lowQuality ? 42 : 90),
        width,
        height
    };
}

function escapePdfText(str) {
    return String(str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Build a genuine, spec-compliant multi-page PDF 1.4 binary in memory.
 * Each page spec can be:
 *  - `{ type: 'scanned', lines: [...], lowQuality?: boolean }` -> embedded JPEG XObject ONLY (ZERO text layer!)
 *  - `{ type: 'text', lines: [...] }` -> selectable Helvetica PDF text layer (NO raster image!)
 *  - `{ type: 'blank_image' }` -> blank white raster JPEG image (simulates unreadable/blank scanned page)
 */
function buildSyntheticPdf(pageSpecs) {
    const objects = [];
    const addObj = (body) => {
        const id = objects.length + 1;
        objects.push({ id, body });
        return id;
    };

    const catalogId = addObj(''); // 1
    const pagesId = addObj(''); // 2
    const fontId = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'); // 3
    const pageIds = [];

    for (const spec of pageSpecs) {
        if (spec.type === 'text') {
            const lines = Array.isArray(spec.lines) ? spec.lines : [];
            const ops = ['BT', '/F1 14 Tf', '50 740 Td', '20 TL'];
            for (const line of lines) {
                ops.push(`(${escapePdfText(line)}) Tj T*`);
            }
            ops.push('ET');
            const streamStr = ops.join('\n');
            const contentId = addObj(
                Buffer.concat([
                    Buffer.from(`<< /Length ${Buffer.byteLength(streamStr, 'latin1')} >>\nstream\n`, 'latin1'),
                    Buffer.from(streamStr, 'latin1'),
                    Buffer.from('\nendstream', 'latin1')
                ])
            );
            const pageId = addObj(
                `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
            );
            pageIds.push(pageId);
        } else {
            const rendered = spec.type === 'blank_image'
                ? renderScannedPageJpeg([], { width: 800, height: 1000, lowQuality: false })
                : renderScannedPageJpeg(spec.lines || [], { lowQuality: Boolean(spec.lowQuality) });

            const imgId = addObj(
                Buffer.concat([
                    Buffer.from(
                        `<< /Type /XObject /Subtype /Image /Width ${rendered.width} /Height ${rendered.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${rendered.jpegBuffer.length} >>\nstream\n`,
                        'latin1'
                    ),
                    rendered.jpegBuffer,
                    Buffer.from('\nendstream', 'latin1')
                ])
            );

            const drawStream = 'q\n612 0 0 792 0 0 cm\n/Im0 Do\nQ\n';
            const contentId = addObj(
                Buffer.concat([
                    Buffer.from(`<< /Length ${Buffer.byteLength(drawStream, 'latin1')} >>\nstream\n`, 'latin1'),
                    Buffer.from(drawStream, 'latin1'),
                    Buffer.from('\nendstream', 'latin1')
                ])
            );
            const pageId = addObj(
                `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>`
            );
            pageIds.push(pageId);
        }
    }

    objects[catalogId - 1].body = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1].body = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

    const parts = [Buffer.from('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n', 'latin1')];
    const offsets = [0];
    let byteOffset = parts[0].length;

    for (const obj of objects) {
        offsets.push(byteOffset);
        const header = Buffer.from(`${obj.id} 0 obj\n`, 'latin1');
        const bodyBuf = Buffer.isBuffer(obj.body) ? obj.body : Buffer.from(obj.body, 'latin1');
        const footer = Buffer.from('\nendobj\n', 'latin1');
        parts.push(header, bodyBuf, footer);
        byteOffset += header.length + bodyBuf.length + footer.length;
    }

    const xrefOffset = byteOffset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    parts.push(Buffer.from(xref, 'latin1'));

    return Buffer.concat(parts);
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

function installFullMockPrisma() {
    const state = {
        books: new Map(),
        fileParts: new Map(),
        pages: new Map(),
        chunks: [],
        progressHistory: [],
        idSeq: 1
    };

    const nextOid = () => String(state.idSeq++).padStart(24, '0');
    const originals = {
        knowledgeBook: prisma.knowledgeBook,
        knowledgeBookFilePart: prisma.knowledgeBookFilePart,
        knowledgeBookPage: prisma.knowledgeBookPage,
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
                if (where.isEnabled !== undefined && b.isEnabled !== where.isEnabled) return false;
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
            if (data.processingStatus !== undefined || data.processingProgress !== undefined || data.ocrProcessedPages !== undefined) {
                state.progressHistory.push({
                    bookId: where.id,
                    status: next.processingStatus,
                    stage: next.processingStage,
                    progress: next.processingProgress,
                    ocrProcessedPages: next.ocrProcessedPages,
                    ocrFailedPages: next.ocrFailedPages,
                    textExtractedPages: next.textExtractedPages,
                    ocrCurrentPhase: next.ocrCurrentPhase
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

    prisma.knowledgeBookPage = {
        findMany: async ({ where = {} } = {}) => {
            const list = state.pages.get(where.bookId) || [];
            return list
                .filter(p => !where.status || p.status === where.status)
                .sort((a, b) => a.pageNumber - b.pageNumber);
        },
        findUnique: async ({ where }) => {
            const key = where?.bookId_pageNumber;
            if (!key) return null;
            const list = state.pages.get(key.bookId) || [];
            return list.find(p => p.pageNumber === key.pageNumber) || null;
        },
        createMany: async ({ data }) => {
            for (const rec of data) {
                const list = state.pages.get(rec.bookId) || [];
                list.push({ id: nextOid(), createdAt: new Date(), updatedAt: new Date(), ...rec });
                state.pages.set(rec.bookId, list);
            }
            return { count: data.length };
        },
        create: async ({ data }) => {
            const list = state.pages.get(data.bookId) || [];
            const rec = { id: nextOid(), createdAt: new Date(), updatedAt: new Date(), ...data };
            list.push(rec);
            state.pages.set(data.bookId, list);
            return rec;
        },
        update: async ({ where, data }) => {
            const key = where?.bookId_pageNumber;
            const list = state.pages.get(key.bookId) || [];
            const idx = list.findIndex(p => p.pageNumber === key.pageNumber);
            if (idx === -1) throw new Error('Page not found');
            list[idx] = { ...list[idx], ...data, updatedAt: new Date() };
            return list[idx];
        },
        updateMany: async ({ where = {}, data = {} }) => {
            const list = state.pages.get(where.bookId) || [];
            let count = 0;
            for (let i = 0; i < list.length; i++) {
                if (where.status && list[i].status !== where.status) continue;
                list[i] = { ...list[i], ...data, updatedAt: new Date() };
                count++;
            }
            return { count };
        },
        deleteMany: async ({ where }) => {
            const prev = (state.pages.get(where.bookId) || []).length;
            state.pages.delete(where.bookId);
            return { count: prev };
        }
    };

    prisma.knowledgeBookChunk = {
        findMany: async ({ where = {} } = {}) => {
            return state.chunks
                .filter(c => {
                    if (where.bookId && c.bookId !== where.bookId) return false;
                    if (where.isActive !== undefined && c.isActive !== where.isActive) return false;
                    if (where.contentHash?.in && !where.contentHash.in.includes(c.contentHash)) return false;
                    if (where.technologyNormalized?.in && !where.technologyNormalized.in.includes(c.technologyNormalized)) return false;
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

function withGroqOnlyEnv(fn) {
    const envKeys = ['AI_PROVIDER', 'GROQ_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'EMBEDDING_PROVIDER', 'OCR_WORKER_URL'];
    const snapshot = {};
    for (const k of envKeys) snapshot[k] = process.env[k];

    return (async () => {
        try {
            setAiProviderOverride(null);
            process.env.AI_PROVIDER = 'groq';
            process.env.GROQ_API_KEY = 'gsk_test_groq_ocr_key_999999';
            delete process.env.OPENAI_API_KEY;
            delete process.env.GEMINI_API_KEY;
            delete process.env.GOOGLE_API_KEY;
            delete process.env.EMBEDDING_PROVIDER;
            delete process.env.OCR_WORKER_URL;
            return await fn();
        } finally {
            for (const [k, v] of Object.entries(snapshot)) {
                if (v === undefined) delete process.env[k];
                else process.env[k] = v;
            }
        }
    })();
}

test('1. Multi-page Scanned PDF: Real free OCR in Groq-only Text Fallback Mode preserves page numbers, chunks, 0 vectors, and search results', async () => {
    const mockDb = installFullMockPrisma();
    try {
        await withGroqOnlyEnv(async () => {
            const scannedPdf = buildSyntheticPdf([
                {
                    type: 'scanned',
                    lines: [
                        'Chapter 1 Relational Normalization',
                        'First Normal Form eliminates repeating groups in relational tables.',
                        'Every column must contain atomic indivisible values.'
                    ]
                },
                {
                    type: 'scanned',
                    lines: [
                        'Chapter 2 Foreign Key Constraints',
                        'Referential integrity ensures foreign keys reference valid primary keys.',
                        'Cascading deletes automatically remove orphaned child rows.'
                    ]
                },
                {
                    type: 'scanned',
                    lines: [
                        'Chapter 3 Clustered Indexing',
                        'A clustered index sorts and stores the actual data rows in a B-Tree.',
                        'Each database table can have only one clustered index.'
                    ]
                }
            ]);

            // Verify PDF has ZERO selectable text before OCR
            const analysis = await analyzePdfPages(scannedPdf);
            assert.equal(analysis.documentType, 'scanned_pdf');
            assert.equal(analysis.ocrRequired, true);
            assert.equal(analysis.totalPages, 3);
            assert.equal(analysis.ocrRequiredPageCount, 3);
            assert.equal(analysis.searchablePageCount, 0);

            const book = await createAndQueueBook({
                buffer: scannedPdf,
                originalname: 'scanned-sql-fundamentals.pdf',
                mimetype: 'application/pdf',
                title: 'Scanned SQL Fundamentals',
                author: 'C. J. Date',
                technology: 'SQL Server',
                processSync: true
            });

            assert.equal(book.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(book.processingProgress, 100);
            assert.equal(book.ocrRequired, true);
            assert.equal(book.ocrUsed, true);
            assert.equal(book.ocrEngine, 'tesseract.js');
            assert.equal(book.totalPages, 3);
            assert.equal(book.ocrProcessedPages, 3);
            assert.equal(book.textExtractedPages, 3);
            assert.equal(book.ocrFailedPages, 0);
            assert.ok(book.indexedChunks >= 3);
            // Text fallback mode invariants: NEVER fake vectors!
            assert.equal(book.embeddingMode, 'text_fallback');
            assert.equal(book.embeddedChunksCount, 0);
            assert.equal(book.embeddingDimensions, 0);

            const savedChunks = mockDb.state.chunks.filter(c => c.bookId === book.id);
            const pageNumbers = Array.from(new Set(savedChunks.map(c => c.pageNumber))).sort((a, b) => a - b);
            assert.deepEqual(pageNumbers, [1, 2, 3]);
            assert.ok(savedChunks.every(c => c.isActive === true && c.embedding.length === 0));

            // Verify real Knowledge Base text search retrieves exact OCR-extracted page chunks
            const searchRes = await searchRelevantBookChunksByText({
                questionText: 'How many clustered index can a table have in B-Tree?',
                options: ['Only one', 'Unlimited'],
                technologiesNormalized: [book.technologyNormalized]
            });
            assert.equal(searchRes.searchMode, 'text_fallback');
            assert.ok(searchRes.chunks.length >= 1);
            assert.equal(searchRes.chunks[0].pageNumber, 3);
            assert.match(searchRes.chunks[0].chunkText, /clustered index/i);

            // Verify controller search endpoint also works end-to-end
            const apiRes = createMockRes();
            await knowledgeBaseController.searchKnowledgeBase(
                { query: { q: 'Referential integrity foreign keys', technology: 'SQL Server' } },
                apiRes
            );
            assert.equal(apiRes.statusCode, 200);
            assert.equal(apiRes.body.success, true);
            assert.ok(apiRes.body.results.length >= 1);
            assert.equal(apiRes.body.results[0].pageNumber, 2);
        });
    } finally {
        mockDb.restore();
    }
});

test('2. Normal Searchable PDF: Skips OCR completely, extracts all pages fast, and preserves page numbers', async () => {
    const mockDb = installFullMockPrisma();
    try {
        await withGroqOnlyEnv(async () => {
            const samplePdfBuf = fs.readFileSync(path.join(process.cwd(), 'node_modules/pdf-parse/test/data/02-valid.pdf'));
            const book = await createAndQueueBook({
                buffer: samplePdfBuf,
                originalname: 'normal-searchable.pdf',
                mimetype: 'application/pdf',
                title: 'Normal Searchable Guide',
                technology: 'JavaScript',
                processSync: true
            });

            assert.equal(book.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(book.ocrRequired, false);
            assert.equal(book.ocrUsed, false);
            assert.equal(book.ocrTotalPages, 0);
            assert.equal(book.totalPages, 5);
            assert.ok(book.indexedChunks >= 5);
            assert.equal(book.embeddedChunksCount, 0);
        });
    } finally {
        mockDb.restore();
    }
});

test('3. Mixed PDF (Searchable + Scanned pages): Extracts text-layer pages directly and runs OCR ONLY on scanned pages', async () => {
    const mockDb = installFullMockPrisma();
    try {
        await withGroqOnlyEnv(async () => {
            const mixedPdf = buildSyntheticPdf([
                {
                    type: 'text',
                    lines: [
                        'Chapter 1 JavaScript Closures',
                        'A closure bundles a function together with references to its lexical environment.',
                        'Inner functions retain access to outer scope variables after the outer function returns.'
                    ]
                },
                {
                    type: 'scanned',
                    lines: [
                        'Chapter 2 Event Loop Microtasks',
                        'Promise callbacks execute inside the microtask queue before setTimeout macrotasks.',
                        'Understanding event loop ordering prevents asynchronous race conditions.'
                    ]
                },
                {
                    type: 'text',
                    lines: [
                        'Chapter 3 Prototype Inheritance',
                        'Objects inherit properties and methods through the prototype chain using Object.create.'
                    ]
                },
                {
                    type: 'scanned',
                    lines: [
                        'Chapter 4 Strict Equality Operator',
                        'The triple equals operator compares value and data type without coercion.'
                    ]
                }
            ]);

            const analysis = await analyzePdfPages(mixedPdf);
            assert.equal(analysis.documentType, 'mixed_pdf');
            assert.equal(analysis.ocrRequired, true);
            assert.equal(analysis.searchablePageCount, 2);
            assert.equal(analysis.ocrRequiredPageCount, 2);
            assert.equal(analysis.pages[0].needsOcr, false);
            assert.equal(analysis.pages[1].needsOcr, true);
            assert.equal(analysis.pages[2].needsOcr, false);
            assert.equal(analysis.pages[3].needsOcr, true);

            const book = await createAndQueueBook({
                buffer: mixedPdf,
                originalname: 'mixed-js-handbook.pdf',
                mimetype: 'application/pdf',
                title: 'Mixed JS Handbook',
                technology: 'JavaScript',
                processSync: true
            });

            assert.equal(book.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(book.ocrRequired, true);
            assert.equal(book.ocrUsed, true);
            assert.equal(book.totalPages, 4);
            assert.equal(book.ocrTotalPages, 2);
            assert.equal(book.ocrProcessedPages, 2);
            assert.equal(book.textExtractedPages, 4);
            assert.equal(book.ocrFailedPages, 0);

            const persistedPages = mockDb.state.pages.get(book.id);
            assert.equal(persistedPages[0].extractionMethod, 'text');
            assert.equal(persistedPages[0].ocrAttempts, 0);
            assert.equal(persistedPages[1].extractionMethod, 'ocr');
            assert.ok(persistedPages[1].ocrAttempts >= 1);
            assert.equal(persistedPages[2].extractionMethod, 'text');
            assert.equal(persistedPages[2].ocrAttempts, 0);
            assert.equal(persistedPages[3].extractionMethod, 'ocr');
            assert.ok(persistedPages[3].ocrAttempts >= 1);

            const chunks = mockDb.state.chunks.filter(c => c.bookId === book.id);
            const pages = Array.from(new Set(chunks.map(c => c.pageNumber))).sort((a, b) => a - b);
            assert.deepEqual(pages, [1, 2, 3, 4]);

            // Search finds both searchable text page (1) and scanned OCR page (2)
            const textHit = await searchRelevantBookChunksByText({
                questionText: 'What does a closure bundle with lexical environment?',
                technologiesNormalized: [book.technologyNormalized]
            });
            assert.equal(textHit.chunks[0].pageNumber, 1);

            const ocrHit = await searchRelevantBookChunksByText({
                questionText: 'Where do Promise callbacks execute in the microtask queue?',
                technologiesNormalized: [book.technologyNormalized]
            });
            assert.equal(ocrHit.chunks[0].pageNumber, 2);
        });
    } finally {
        mockDb.restore();
    }
});

test('4. DOCX and TXT extraction remain fully intact and searchable', async () => {
    const mockDb = installFullMockPrisma();
    try {
        await withGroqOnlyEnv(async () => {
            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({ text: 'Chapter 1 Semantic HTML', heading: HeadingLevel.HEADING_1 }),
                        new Paragraph('The article element represents a self-contained composition in a web document.')
                    ]
                }]
            });
            const docxBuf = await Packer.toBuffer(doc);
            const docxBook = await createAndQueueBook({
                buffer: docxBuf,
                originalname: 'html-reference.docx',
                mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                technology: 'HTML',
                processSync: true
            });
            assert.equal(docxBook.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(docxBook.ocrRequired, false);
            assert.ok(docxBook.indexedChunks >= 1);

            const txtBuf = Buffer.from(
                'Chapter 1 Python Dictionaries\nDictionaries map hashable keys to values with average O(1) lookup.\fChapter 2 List Comprehensions\nList comprehensions construct new lists concisely.',
                'utf8'
            );
            const txtBook = await createAndQueueBook({
                buffer: txtBuf,
                originalname: 'python-basics.txt',
                mimetype: 'text/plain',
                technology: 'Python',
                processSync: true
            });
            assert.equal(txtBook.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(txtBook.totalPages, 2);
            assert.ok(txtBook.indexedChunks >= 2);
        });
    } finally {
        mockDb.restore();
    }
});

test('5. Large Scanned PDF (10 pages): Batched resumable OCR saves progress per batch, recovers from stale lock, and avoids duplicate page extraction', async () => {
    const mockDb = installFullMockPrisma();
    const prevBatchPages = process.env.OCR_BATCH_PAGES;
    process.env.OCR_BATCH_PAGES = '3';
    try {
        await withGroqOnlyEnv(async () => {
            const pageSpecs = [];
            for (let p = 1; p <= 10; p++) {
                pageSpecs.push({
                    type: 'scanned',
                    lines: [
                        `Chapter ${p} Distributed Systems Pattern ${p}`,
                        `Page ${p} explains consistent hashing and partition tolerance token ${p * 111}.`,
                        `Replication factor ensures durability across availability zones.`
                    ]
                });
            }
            const largeScannedPdf = buildSyntheticPdf(pageSpecs);

            const book = await createAndQueueBook({
                buffer: largeScannedPdf,
                originalname: 'large-scanned-systems.pdf',
                mimetype: 'application/pdf',
                title: 'Large Scanned Distributed Systems',
                technology: 'Azure',
                processSync: false
            });

            // Drive step-by-step with bounded timeBudgetMs so it executes in multiple resumable batches!
            const step1 = await runBookProcessingStep(book.id, { timeBudgetMs: 12000 });
            assert.equal(step1.done, false, '10-page scanned PDF must pause cleanly across resumable batches');
            assert.equal(step1.needsMoreSteps, true);
            assert.ok(step1.book.ocrProcessedPages >= 1 && step1.book.ocrProcessedPages <= 3);

            const processedAfterStep1 = step1.book.ocrProcessedPages;

            // Simulate a Vercel timeout / crashed worker lock mid-OCR
            await prisma.knowledgeBook.update({
                where: { id: book.id },
                data: {
                    processingLockId: 'lock_crashed_mid_ocr',
                    processingLockedAt: new Date(Date.now() - LOCK_TTL_MS - 5000),
                    processingHeartbeatAt: new Date(Date.now() - LOCK_TTL_MS - 5000)
                }
            });

            // Resume via controller processBookStep until completed!
            let current = { done: false, book: step1.book };
            let steps = 1;
            while (!current.done && steps < 15) {
                const res = createMockRes();
                await knowledgeBaseController.processBookStep(
                    { params: { id: book.id }, body: { timeBudgetMs: 15000 }, query: {} },
                    res
                );
                assert.equal(res.statusCode, 200);
                current = res.body;
                steps++;
            }

            assert.equal(current.done, true);
            assert.equal(current.book.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(current.book.totalPages, 10);
            assert.equal(current.book.ocrProcessedPages, 10);
            assert.equal(current.book.textExtractedPages, 10);
            assert.equal(current.book.ocrFailedPages, 0);
            assert.equal(current.book.indexedVectors, 0);
            assert.ok(steps >= 4, `Expected >= 4 resumable batches for 10 pages @ 3/batch, got ${steps} steps`);

            // Verify ZERO duplicate page extraction across all 10 pages!
            const persistedPages = mockDb.state.pages.get(book.id);
            assert.equal(persistedPages.length, 10);
            for (const pg of persistedPages) {
                assert.equal(pg.status, 'ocr_completed');
                assert.ok(pg.ocrAttempts <= 2, `Page ${pg.pageNumber} should not be duplicated across batches (attempts=${pg.ocrAttempts})`);
            }

            // Verify page 10 content is searchable with exact page number 10
            const hit = await searchRelevantBookChunksByText({
                questionText: 'consistent hashing partition tolerance token 1110',
                technologiesNormalized: [book.technologyNormalized]
            });
            assert.ok(hit.chunks.length >= 1);
            assert.equal(hit.chunks[0].pageNumber, 10);
            assert.ok(processedAfterStep1 < 10);
        });
    } finally {
        if (prevBatchPages === undefined) delete process.env.OCR_BATCH_PAGES;
        else process.env.OCR_BATCH_PAGES = prevBatchPages;
        mockDb.restore();
    }
});

test('6. Low-quality scanned page & Retry OCR action: Preprocessing rescues faded/noisy scan and Retry OCR re-runs only failed pages', async () => {
    const mockDb = installFullMockPrisma();
    try {
        await withGroqOnlyEnv(async () => {
            const lowQualityPdf = buildSyntheticPdf([
                {
                    type: 'scanned',
                    lowQuality: true,
                    lines: [
                        'Chapter 1 MongoDB Aggregation Pipeline',
                        'The match stage filters documents early to reduce memory usage.',
                        'The group stage computes summary metrics across matched documents.'
                    ]
                },
                {
                    type: 'blank_image'
                }
            ]);

            const book = await createAndQueueBook({
                buffer: lowQualityPdf,
                originalname: 'low-quality-mongo-scan.pdf',
                mimetype: 'application/pdf',
                title: 'Low Quality Scanned MongoDB Notes',
                technology: 'MongoDB',
                processSync: true
            });

            // Page 1 (faded noisy scan) must succeed; Page 2 (blank image) is honestly recorded as ocr_failed!
            assert.equal(book.processingStatus, PROCESSING_STATUSES.COMPLETED);
            assert.equal(book.ocrRequired, true);
            assert.equal(book.ocrUsed, true);
            assert.equal(book.totalPages, 2);
            assert.equal(book.ocrProcessedPages, 2);
            assert.equal(book.textExtractedPages, 1);
            assert.equal(book.ocrFailedPages, 1);
            assert.equal(book.ocrStatus, 'partial');

            const chunks = mockDb.state.chunks.filter(c => c.bookId === book.id);
            assert.ok(chunks.length >= 1);
            assert.equal(chunks[0].pageNumber, 1);
            assert.match(chunks[0].chunkText, /aggregation|pipeline|match|group/i);

            // Verify formatted book flags canRetryOcr = true because ocrFailedPages === 1
            const detailRes = createMockRes();
            await knowledgeBaseController.getBookDetails({ params: { id: book.id } }, detailRes);
            assert.equal(detailRes.body.book.canRetryOcr, true);
            assert.equal(detailRes.body.book.ocrFailedPages, 1);
            assert.equal(detailRes.body.book.indexedVectors, 0);

            // Trigger Retry OCR via controller -> must queue ONLY the 1 failed page, NOT re-OCR page 1!
            const page1AttemptsBefore = mockDb.state.pages.get(book.id).find(p => p.pageNumber === 1).ocrAttempts;
            const retryRes = createMockRes();
            await knowledgeBaseController.retryBookOcr(
                { params: { id: book.id }, body: {}, query: {} },
                retryRes
            );
            assert.equal(retryRes.statusCode, 202);
            assert.equal(retryRes.body.mode, 'retry_failed_pages');
            assert.equal(retryRes.body.pagesQueued, 1);

            const stepRes = createMockRes();
            await knowledgeBaseController.processBookStep(
                { params: { id: book.id }, body: {}, query: {} },
                stepRes
            );
            assert.equal(stepRes.body.done, true);
            const page1AttemptsAfter = mockDb.state.pages.get(book.id).find(p => p.pageNumber === 1).ocrAttempts;
            assert.equal(page1AttemptsAfter, page1AttemptsBefore, 'Retry OCR must NOT duplicate OCR on already completed page 1');
        });
    } finally {
        mockDb.restore();
        await terminateOcrWorker();
    }
});
