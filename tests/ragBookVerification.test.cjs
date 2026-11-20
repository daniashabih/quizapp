process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createCanvas } = require('@napi-rs/canvas');
const prisma = require('../api/_config/prisma');
const { setAiProviderOverride } = require('../api/_services/aiProviderService');
const { terminateOcrWorker } = require('../api/_services/ocrService');
const {
    createAndQueueBook,
    replaceBookFile,
    processBookById,
    PROCESSING_STATUSES
} = require('../api/_services/bookProcessingService');
const {
    verifyQuestionWithBooks,
    approveVerificationCorrection
} = require('../api/_services/questionVerificationService');
const { validateUploadedBookFile } = require('../api/_services/bookExtractorService');
const { authMiddleware, adminMiddleware } = require('../api/_middlewares/authMiddleware');

// Deterministic bag-of-words projection to 1536 dimensions for semantic retrieval testing
function deterministicEmbed(text) {
    const dim = 1536;
    const vec = new Array(dim).fill(0);
    const words = String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9#<>]+/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2);
    for (const w of words) {
        let h = 2166136261;
        for (let i = 0; i < w.length; i++) {
            h ^= w.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        const idx = Math.abs(h) % dim;
        vec[idx] += 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
    return vec.map(v => v / norm);
}

// In-memory Prisma mock store so all 10 RAG scenarios run deterministically without mutating live Atlas data
function installMockPrisma() {
    const state = {
        books: new Map(),
        fileParts: new Map(),
        chunks: [],
        verifications: new Map(),
        history: [],
        questions: new Map(),
        idSeq: 1
    };

    const nextOid = () => String(state.idSeq++).padStart(24, '0');

    const originals = {
        knowledgeBook: prisma.knowledgeBook,
        knowledgeBookFilePart: prisma.knowledgeBookFilePart,
        knowledgeBookChunk: prisma.knowledgeBookChunk,
        questionVerification: prisma.questionVerification,
        questionCorrectionHistory: prisma.questionCorrectionHistory,
        question: prisma.question
    };

    prisma.knowledgeBook = {
        create: async ({ data }) => {
            const id = nextOid();
            const rec = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
            state.books.set(id, rec);
            return rec;
        },
        findUnique: async ({ where }) => state.books.get(where.id) || null,
        findFirst: async ({ where }) => {
            for (const b of state.books.values()) {
                if (where.fileHash && b.fileHash !== where.fileHash) continue;
                if (where.id?.not && b.id === where.id.not) continue;
                return b;
            }
            return null;
        },
        findMany: async ({ where = {} } = {}) => {
            return Array.from(state.books.values()).filter(b => {
                if (where.technologyNormalized) {
                    if (typeof where.technologyNormalized === 'string' && b.technologyNormalized !== where.technologyNormalized) return false;
                    if (where.technologyNormalized.in && !where.technologyNormalized.in.includes(b.technologyNormalized)) return false;
                }
                if (where.isEnabled !== undefined && b.isEnabled !== where.isEnabled) return false;
                if (where.processingStatus && b.processingStatus !== where.processingStatus) return false;
                if (where.indexedChunks?.gt !== undefined && !(b.indexedChunks > where.indexedChunks.gt)) return false;
                if (where.id?.not && b.id === where.id.not) return false;
                return true;
            });
        },
        update: async ({ where, data }) => {
            const cur = state.books.get(where.id);
            if (!cur) throw new Error('Book not found');
            const next = { ...cur, ...data, updatedAt: new Date() };
            state.books.set(where.id, next);
            return next;
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
        aggregateRaw: async () => {
            throw new Error('Mock Atlas $vectorSearch unavailable in offline unit test');
        },
        findMany: async ({ where = {} } = {}) => {
            return state.chunks.filter(c => {
                if (where.isActive !== undefined && c.isActive !== where.isActive) return false;
                if (where.bookId && c.bookId !== where.bookId) return false;
                if (where.contentHash?.in && !where.contentHash.in.includes(c.contentHash)) return false;
                if (where.technologyNormalized?.in && !where.technologyNormalized.in.includes(c.technologyNormalized)) return false;
                return true;
            });
        },
        createMany: async ({ data }) => {
            for (const d of data) {
                state.chunks.push({ id: nextOid(), createdAt: new Date(), ...d });
            }
            return { count: data.length };
        },
        updateMany: async ({ where, data }) => {
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
        count: async () => state.chunks.length
    };

    prisma.questionVerification = {
        findUnique: async ({ where }) => {
            if (where.id) {
                for (const v of state.verifications.values()) {
                    if (v.id === where.id) return v;
                }
                return null;
            }
            return state.verifications.get(where.cacheKey) || null;
        },
        upsert: async ({ where, update, create }) => {
            const existing = state.verifications.get(where.cacheKey);
            if (existing) {
                const next = {
                    ...existing,
                    ...update,
                    requestCount: (existing.requestCount || 1) + (update.requestCount?.increment || 0),
                    updatedAt: new Date()
                };
                state.verifications.set(where.cacheKey, next);
                return next;
            }
            const rec = { id: nextOid(), requestCount: 1, createdAt: new Date(), updatedAt: new Date(), ...create };
            state.verifications.set(where.cacheKey, rec);
            return rec;
        },
        update: async ({ where, data }) => {
            for (const [k, v] of state.verifications.entries()) {
                if (v.id === where.id) {
                    const next = {
                        ...v,
                        ...data,
                        requestCount: (v.requestCount || 1) + (data.requestCount?.increment || 0),
                        updatedAt: new Date()
                    };
                    state.verifications.set(k, next);
                    return next;
                }
            }
            throw new Error('Verification not found');
        },
        findMany: async () => Array.from(state.verifications.values())
    };

    prisma.questionCorrectionHistory = {
        create: async ({ data }) => {
            const rec = { id: nextOid(), createdAt: new Date(), ...data };
            state.history.push(rec);
            return rec;
        },
        findMany: async () => [...state.history]
    };

    prisma.question = {
        findUnique: async ({ where }) => state.questions.get(where.id) || null,
        update: async ({ where, data }) => {
            const cur = state.questions.get(where.id);
            if (!cur) throw new Error('Question not found');
            const next = { ...cur, ...data };
            state.questions.set(where.id, next);
            return next;
        },
        findMany: async () => Array.from(state.questions.values())
    };

    return {
        state,
        restore: () => {
            Object.assign(prisma, originals);
        }
    };
}

test('RAG Book Verification System: All 10 End-to-End Scenarios', async () => {
    const mockDb = installMockPrisma();
    let llmCallCount = 0;
    let embeddingCallCount = 0;

    setAiProviderOverride({
        provider: 'test-rag-provider',
        embeddingModel: 'test-embed-1536',
        verificationModel: 'test-verifier',
        embeddingDimensions: 1536,
        generateEmbeddings: async (texts) => {
            embeddingCallCount += texts.length;
            return texts.map(deterministicEmbed);
        },
        ocrPdfWithMultimodalAI: async () => ([
            {
                pageNumber: 1,
                text: 'Chapter 1 Scanned CSS Flexbox Guide\nIn CSS Flexbox, justify-content aligns flex items along the main axis, whereas align-items aligns items along the cross axis.'
            }
        ]),
        evaluateQuestionWithEvidence: async ({ questionText, options, originalCorrectAnswer, evidenceChunks }) => {
            llmCallCount++;
            const top = evidenceChunks[0];
            const combined = evidenceChunks.map(c => c.chunkText.toLowerCase()).join(' ');
            const q = questionText.toLowerCase();

            // Scenario 4: Ambiguous question
            if (q.includes('ambiguous') || (q.includes('declare a variable') && options.includes('let') && options.includes('const'))) {
                return {
                    verification_status: 'ambiguous',
                    original_correct_answer: originalCorrectAnswer,
                    verified_correct_answer: 'let',
                    explanation: 'In modern JavaScript, both let and const declare block-scoped variables. Because the question does not specify whether reassignment is required, more than one option fits the textbook definition.',
                    source_book: top.bookTitle,
                    source_author: top.author,
                    source_chapter: top.chapter,
                    source_page: String(top.pageNumber),
                    supporting_excerpt: top.chunkText.slice(0, 140),
                    issue_description: 'Both let and const declare variables in ES6 JavaScript.',
                    suggested_correction: 'Specify whether the variable needs to be reassigned.',
                    confidence: 0.88
                };
            }

            // Scenario 5: Out-of-book topic (must return insufficient_evidence)
            if (q.includes('quantum entanglement') || !evidenceChunks.length) {
                return {
                    verification_status: 'insufficient_evidence',
                    original_correct_answer: originalCorrectAnswer,
                    verified_correct_answer: '',
                    explanation: 'The uploaded reference books do not cover quantum entanglement or this topic. No answer can be verified from the book evidence.',
                    source_book: '',
                    source_author: '',
                    source_chapter: '',
                    source_page: '',
                    supporting_excerpt: '',
                    issue_description: 'Topic not covered in uploaded books.',
                    suggested_correction: '',
                    confidence: 0.15
                };
            }

            // Scenario 1: HTML anchor tag
            if (q.includes('hyperlink') && combined.includes('<a>')) {
                const bookAnswer = '<a>';
                const isMatch = originalCorrectAnswer === bookAnswer;
                return {
                    verification_status: isMatch ? 'verified' : 'incorrect',
                    original_correct_answer: originalCorrectAnswer,
                    verified_correct_answer: bookAnswer,
                    explanation: 'The HTML <a> (anchor) element creates a hyperlink to web pages, files, or email addresses using its href attribute. The <link> tag instead connects external resources like stylesheets.',
                    // Intentionally test grounding by returning exact book title
                    source_book: top.bookTitle,
                    source_author: 'Hallucinated Author Should Be Overridden',
                    source_chapter: 'Fake Chapter',
                    source_page: '9999',
                    supporting_excerpt: 'Fabricated quote not in chunk',
                    issue_description: isMatch ? '' : `Stored answer "${originalCorrectAnswer}" is wrong; HTML uses <a>.`,
                    suggested_correction: isMatch ? '' : 'Change correct answer to <a>.',
                    confidence: 0.96
                };
            }

            // Scenario 2 & 3: JavaScript strict equality ===
            if (q.includes('strict equality') && combined.includes('===')) {
                const bookAnswer = '===';
                const isMatch = originalCorrectAnswer === bookAnswer;
                return {
                    verification_status: isMatch ? 'verified' : 'incorrect',
                    original_correct_answer: originalCorrectAnswer,
                    verified_correct_answer: bookAnswer,
                    explanation: 'The strict equality operator (===) compares both value and data type without performing type coercion. The loose equality operator (==) converts operands before comparing them.',
                    source_book: top.bookTitle,
                    source_author: top.author,
                    source_chapter: top.chapter,
                    source_page: String(top.pageNumber),
                    supporting_excerpt: top.chunkText.slice(0, 160),
                    issue_description: isMatch ? '' : 'Database answer listed == instead of strict equality ===.',
                    suggested_correction: isMatch ? '' : 'Update correct answer to ===.',
                    confidence: 0.95
                };
            }

            // Scenario 7: Multiple books for JS (Event Loop book)
            if (q.includes('microtask') && combined.includes('promise callbacks')) {
                return {
                    verification_status: 'verified',
                    original_correct_answer: originalCorrectAnswer,
                    verified_correct_answer: 'Promise callbacks',
                    explanation: 'In the JavaScript event loop, Promise callbacks execute in the microtask queue before macrotasks like setTimeout. This ensures promise resolutions run immediately after the current call stack clears.',
                    source_book: top.bookTitle,
                    source_author: top.author,
                    source_chapter: top.chapter,
                    source_page: String(top.pageNumber),
                    supporting_excerpt: top.chunkText.slice(0, 150),
                    issue_description: '',
                    suggested_correction: '',
                    confidence: 0.93
                };
            }

            return {
                verification_status: 'insufficient_evidence',
                original_correct_answer: originalCorrectAnswer,
                verified_correct_answer: '',
                explanation: 'Retrieved chunks did not decisively confirm any option.',
                confidence: 0.2
            };
        }
    });

    try {
        // --- Scenario 1: Upload HTML reference book & verify HTML question + grounding check ---
        const htmlBookText = [
            'Chapter 1 HTML Hyperlinks and Anchors',
            'In HTML5, the <a> (anchor) element creates a hyperlink to another web page, section, or file using the href attribute.',
            'By contrast, the <link> element is placed inside <head> to link external CSS stylesheets.'
        ].join('\n\n');

        const htmlBook = await createAndQueueBook({
            buffer: Buffer.from(htmlBookText, 'utf8'),
            originalname: 'html-handbook.txt',
            mimetype: 'text/plain',
            title: 'HTML5 Definitive Reference',
            author: 'Jon Duckett',
            edition: '2nd Edition',
            publicationYear: 2024,
            technology: 'HTML',
            processSync: true
        });
        assert.equal(htmlBook.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(htmlBook.indexedChunks > 0, true);

        const htmlVerify = await verifyQuestionWithBooks({
            questionText: 'Which HTML tag creates a hyperlink?',
            options: ['<a>', '<link>', '<href>', '<url>'],
            correctAnswer: '<a>',
            technology: 'HTML',
            userSelectedAnswer: '<a>'
        });
        assert.equal(htmlVerify.verification.verification_status, 'verified');
        assert.equal(htmlVerify.verification.verified_correct_answer, '<a>');
        assert.equal(htmlVerify.verification.source_book, 'HTML5 Definitive Reference');
        // Verify anti-hallucination grounding overrides fabricated author/page/quote with real DB chunk metadata!
        assert.equal(htmlVerify.verification.source_author, 'Jon Duckett');
        assert.equal(htmlVerify.verification.source_page, '1');
        assert.ok(htmlVerify.verification.supporting_excerpt.includes('anchor'));
        assert.ok(htmlVerify.verification.explanation.includes('Your selected answer ("<a>") is correct'));

        // --- Scenario 1b: Minimal upload (only file + technology, auto-derives title from filename) ---
        const minimalBook = await createAndQueueBook({
            buffer: Buffer.from('Chapter 1 Bootstrap Grid\nBootstrap uses a 12-column responsive flexbox grid system.', 'utf8'),
            originalname: 'bootstrap_grid_handbook.txt',
            mimetype: 'text/plain',
            technology: 'Bootstrap',
            processSync: true
        });
        assert.equal(minimalBook.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(minimalBook.title, 'bootstrap grid handbook');
        assert.equal(minimalBook.author, '');

        // --- Scenario 2 & 3: Upload JS book, verify incorrect DB answer & require explicit admin approval ---
        const jsBookText = [
            'Chapter 2 JavaScript Operators and Variables',
            'JavaScript provides both let and const to declare block-scoped variables in ES6.',
            'The strict equality operator (===) checks both value and type without type coercion, while == performs loose equality coercion.'
        ].join('\n\n');

        const jsBook = await createAndQueueBook({
            buffer: Buffer.from(jsBookText, 'utf8'),
            originalname: 'javascript-guide.txt',
            mimetype: 'text/plain',
            title: 'JavaScript Fundamentals Guide',
            author: 'Kyle Simpson',
            edition: '3rd Edition',
            publicationYear: 2025,
            technology: 'JavaScript',
            processSync: true
        });
        assert.equal(jsBook.processingStatus, PROCESSING_STATUSES.COMPLETED);

        // Seed a question in mock DB with an INCORRECT stored answer ("==")
        const buggyQId = '000000000000000000000901';
        mockDb.state.questions.set(buggyQId, {
            id: buggyQId,
            category: 'JavaScript',
            session: 1,
            questionText: 'Which operator checks strict equality (value and type) in JavaScript?',
            options: JSON.stringify(['==', '===', '=', '!=']),
            correctAnswer: '==',
            explanation: ''
        });

        const wrongDbRes = await verifyQuestionWithBooks({
            questionId: buggyQId,
            questionText: 'Which operator checks strict equality (value and type) in JavaScript?',
            options: ['==', '===', '=', '!='],
            correctAnswer: '==',
            technology: 'JavaScript',
            userSelectedAnswer: '==='
        });
        assert.equal(wrongDbRes.verification.verification_status, 'incorrect');
        assert.equal(wrongDbRes.verification.original_correct_answer, '==');
        assert.equal(wrongDbRes.verification.verified_correct_answer, '===');
        // CRITICAL: DB question MUST NOT be auto-modified before admin approval!
        assert.equal(mockDb.state.questions.get(buggyQId).correctAnswer, '==');

        // Now admin explicitly approves correction
        const approval = await approveVerificationCorrection({
            reportId: wrongDbRes.verification.id,
            correctedAnswer: '===',
            notes: 'Confirmed from Kyle Simpson Chapter 2',
            adminUser: { id: 'admin1', name: 'Lead Admin', email: 'admin@hangbug.com' }
        });
        assert.equal(mockDb.state.questions.get(buggyQId).correctAnswer, '===');
        assert.equal(mockDb.state.history.length, 1);
        assert.equal(mockDb.state.history[0].previousCorrectAnswer, '==');
        assert.equal(mockDb.state.history[0].newCorrectAnswer, '===');
        assert.equal(approval.report.reviewStatus, 'approved');

        // --- Scenario 4: Ambiguous question ---
        const ambRes = await verifyQuestionWithBooks({
            questionText: 'Which keyword can declare a variable in JavaScript?',
            options: ['let', 'const', 'def', 'fn'],
            correctAnswer: 'let',
            technology: 'JavaScript'
        });
        assert.equal(ambRes.verification.verification_status, 'ambiguous');

        // --- Scenario 5: Question not present in any uploaded book ---
        const noBookRes = await verifyQuestionWithBooks({
            questionText: 'What is the main widget root in Flutter?',
            options: ['MaterialApp', 'Activity', 'ViewController', 'MainDiv'],
            correctAnswer: 'MaterialApp',
            technology: 'Flutter'
        });
        assert.equal(noBookRes.verification.verification_status, 'insufficient_evidence');
        assert.equal(noBookRes.verification.source_book, '');

        const outOfTopicRes = await verifyQuestionWithBooks({
            questionText: 'Explain quantum entanglement superposition states in JavaScript?',
            options: ['Qubit', 'Spin', 'Entangled', 'Photon'],
            correctAnswer: 'Qubit',
            technology: 'JavaScript'
        });
        assert.equal(outOfTopicRes.verification.verification_status, 'insufficient_evidence');

        // --- Scenario 6: Scanned PDF OCR support (real free PDF.js + Tesseract.js OCR, no Gemini API key) ---
        const scanCanvas = createCanvas(1100, 700);
        const scanCtx = scanCanvas.getContext('2d');
        scanCtx.fillStyle = '#FFFFFF';
        scanCtx.fillRect(0, 0, 1100, 700);
        scanCtx.fillStyle = '#111111';
        scanCtx.font = 'bold 38px Arial, sans-serif';
        scanCtx.fillText('Chapter 1 Scanned CSS Flexbox Guide', 70, 140);
        scanCtx.font = '30px Arial, sans-serif';
        scanCtx.fillText('In CSS Flexbox, justify-content aligns flex items', 70, 220);
        scanCtx.fillText('along the main axis, whereas align-items aligns', 70, 275);
        scanCtx.fillText('items along the cross axis.', 70, 330);
        const scanJpeg = scanCanvas.toBuffer('image/jpeg', 90);
        const drawOp = 'q\n612 0 0 390 0 200 cm\n/Im0 Do\nQ\n';
        const pdfParts = [Buffer.from('%PDF-1.4\n', 'latin1')];
        const pdfOffsets = [0];
        const pushObj = (id, body) => {
            pdfOffsets[id] = pdfParts.reduce((s, b) => s + b.length, 0);
            pdfParts.push(Buffer.from(`${id} 0 obj\n`, 'latin1'), Buffer.isBuffer(body) ? body : Buffer.from(body, 'latin1'), Buffer.from('\nendobj\n', 'latin1'));
        };
        pushObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
        pushObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
        pushObj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
        pushObj(4, Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width 1100 /Height 700 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${scanJpeg.length} >>\nstream\n`, 'latin1'), scanJpeg, Buffer.from('\nendstream', 'latin1')]));
        pushObj(5, `<< /Length ${drawOp.length} >>\nstream\n${drawOp}\nendstream`);
        const xrefStart = pdfParts.reduce((s, b) => s + b.length, 0);
        let xrefStr = `xref\n0 6\n0000000000 65535 f \n`;
        for (let i = 1; i <= 5; i++) xrefStr += `${String(pdfOffsets[i]).padStart(10, '0')} 00000 n \n`;
        xrefStr += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
        pdfParts.push(Buffer.from(xrefStr, 'latin1'));
        const scannedPdfBuf = Buffer.concat(pdfParts);

        const scannedBook = await createAndQueueBook({
            buffer: scannedPdfBuf,
            originalname: 'scanned-css-flexbox.pdf',
            mimetype: 'application/pdf',
            title: 'Scanned CSS Layout Manual',
            author: 'Rachel Andrew',
            technology: 'CSS',
            processSync: true
        });
        assert.equal(scannedBook.processingStatus, PROCESSING_STATUSES.COMPLETED);
        assert.equal(scannedBook.ocrUsed, true);
        assert.ok(scannedBook.indexedChunks >= 1);

        // --- Scenario 7: Multiple books for same technology ---
        const jsBook2Text = [
            'Chapter 6 Event Loop and Microtasks',
            'In JavaScript, Promise callbacks are queued in the microtask queue, which runs before macrotasks like setTimeout.'
        ].join('\n\n');
        await createAndQueueBook({
            buffer: Buffer.from(jsBook2Text, 'utf8'),
            originalname: 'js-async-patterns.txt',
            mimetype: 'text/plain',
            title: 'JavaScript Async Internals',
            author: 'Dr. Axel Rauschmayer',
            technology: 'JavaScript',
            processSync: true
        });

        const multiBookRes = await verifyQuestionWithBooks({
            questionText: 'Which callbacks run in the JavaScript microtask queue?',
            options: ['Promise callbacks', 'setTimeout', 'setInterval', 'DOM click'],
            correctAnswer: 'Promise callbacks',
            technology: 'JavaScript'
        });
        assert.equal(multiBookRes.verification.verification_status, 'verified');
        assert.equal(multiBookRes.verification.source_book, 'JavaScript Async Internals');

        // --- Scenario 8: Caching, Duplicate Upload Prevention, & Embedding Reuse ---
        const llmBeforeCache = llmCallCount;
        const cachedRepeat = await verifyQuestionWithBooks({
            questionText: 'Which callbacks run in the JavaScript microtask queue?',
            options: ['Promise callbacks', 'setTimeout', 'setInterval', 'DOM click'],
            correctAnswer: 'Promise callbacks',
            technology: 'JavaScript'
        });
        assert.equal(cachedRepeat.cached, true);
        assert.equal(llmCallCount, llmBeforeCache, 'Cached verification must not trigger a second AI call');

        // Duplicate upload rejection via SHA-256 hash
        await assert.rejects(
            () => createAndQueueBook({
                buffer: Buffer.from(htmlBookText, 'utf8'),
                originalname: 'html-handbook-copy.txt',
                mimetype: 'text/plain',
                title: 'Different Title Same File',
                author: 'Someone Else',
                technology: 'HTML',
                processSync: true
            }),
            /Duplicate upload detected/i
        );

        // Replace with identical file must skip re-embedding
        const embedBeforeReplace = embeddingCallCount;
        const replaceRes = await replaceBookFile(htmlBook.id, {
            buffer: Buffer.from(htmlBookText, 'utf8'),
            originalname: 'html-handbook.txt',
            mimetype: 'text/plain',
            processSync: true
        });
        assert.equal(replaceRes.skippedReembedding, true);
        assert.equal(embeddingCallCount, embedBeforeReplace);

        // Reprocessing book reuses existing embeddings by contentHash
        const embedBeforeRetry = embeddingCallCount;
        const retryResult = await processBookById(htmlBook.id);
        assert.equal(retryResult.generatedEmbeddings, 0);
        assert.ok(retryResult.reusedEmbeddings >= 1);
        assert.equal(embeddingCallCount, embedBeforeRetry);

        // --- Scenario 9: Unauthorized Admin Access & File Validation Security ---
        // 9a. Unauthenticated request blocked with 401
        let status401 = 200;
        await authMiddleware(
            { cookies: {}, headers: {} },
            { status(c) { status401 = c; return this; }, json() { return this; } },
            () => { status401 = 200; }
        );
        assert.equal(status401, 401);

        // 9b. Non-admin regular user blocked with 403
        let status403 = 200;
        adminMiddleware(
            { user: { id: 'u1', role: 'user' } },
            { status(c) { status403 = c; return this; }, json() { return this; } },
            () => { status403 = 200; }
        );
        assert.equal(status403, 403);

        // 9c. Invalid disguised executable / fake PDF rejected
        assert.throws(
            () => validateUploadedBookFile({
                buffer: Buffer.from('MZ\x90\x00not-a-pdf', 'latin1'),
                originalname: 'malware.pdf',
                mimetype: 'application/pdf'
            }),
            /Invalid PDF file signature/i
        );
        assert.throws(
            () => validateUploadedBookFile({
                buffer: Buffer.from('console.log(1)', 'utf8'),
                originalname: 'script.js',
                mimetype: 'application/javascript'
            }),
            /Unsupported file format/i
        );
    } finally {
        setAiProviderOverride(null);
        mockDb.restore();
    }
});
