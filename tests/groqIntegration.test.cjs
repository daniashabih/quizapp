process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../api/_config/prisma');
const aiProviderService = require('../api/_services/aiProviderService');
const aiUsageService = require('../api/_services/aiUsageService');
const questionVerificationService = require('../api/_services/questionVerificationService');
const verificationController = require('../api/_controllers/verificationController');
const aiController = require('../api/_controllers/aiController');

function saveEnv(keys) {
    const snapshot = {};
    for (const key of keys) {
        snapshot[key] = process.env[key];
    }
    return snapshot;
}

function restoreEnv(snapshot) {
    for (const [key, val] of Object.entries(snapshot)) {
        if (val === undefined) delete process.env[key];
        else process.env[key] = val;
    }
}

function createMockRes() {
    return {
        statusCode: 200,
        headers: {},
        body: null,
        set(k, v) {
            this.headers[k] = v;
            return this;
        },
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

function installVerificationMockDb() {
    const state = {
        books: new Map(),
        chunks: [],
        verifications: new Map(),
        history: [],
        questions: new Map(),
        idSeq: 1
    };

    const nextOid = () => String(state.idSeq++).padStart(24, '0');
    const originals = {
        knowledgeBook: prisma.knowledgeBook,
        knowledgeBookChunk: prisma.knowledgeBookChunk,
        questionVerification: prisma.questionVerification,
        questionCorrectionHistory: prisma.questionCorrectionHistory,
        question: prisma.question
    };

    prisma.knowledgeBook = {
        findMany: async ({ where = {} } = {}) => {
            return Array.from(state.books.values()).filter(b => {
                if (where.technologyNormalized?.in && !where.technologyNormalized.in.includes(b.technologyNormalized)) return false;
                if (where.isEnabled !== undefined && b.isEnabled !== where.isEnabled) return false;
                if (where.processingStatus && b.processingStatus !== where.processingStatus) return false;
                if (where.indexedChunks?.gt !== undefined && !(b.indexedChunks > where.indexedChunks.gt)) return false;
                return true;
            });
        }
    };

    prisma.knowledgeBookChunk = {
        aggregateRaw: async () => {
            throw new Error('Atlas vectorSearch unavailable in offline unit test');
        },
        findMany: async ({ where = {} } = {}) => {
            return state.chunks.filter(c => {
                if (where.isActive !== undefined && c.isActive !== where.isActive) return false;
                if (where.technologyNormalized?.in && !where.technologyNormalized.in.includes(c.technologyNormalized)) return false;
                return true;
            });
        },
        count: async ({ where = {} } = {}) => {
            return state.chunks.filter(c => {
                if (where.isActive !== undefined && c.isActive !== where.isActive) return false;
                if (where.technologyNormalized?.in && !where.technologyNormalized.in.includes(c.technologyNormalized)) return false;
                return true;
            }).length;
        }
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
        restore: () => Object.assign(prisma, originals)
    };
}

test('Groq API configuration, secret redaction, and split provider resolution', () => {
    const envKeys = [
        'AI_PROVIDER',
        'EMBEDDING_PROVIDER',
        'GROQ_API_KEY',
        'GROQ_MODEL',
        'GROQ_BASE_URL',
        'OPENAI_API_KEY',
        'GEMINI_API_KEY'
    ];
    const snapshot = saveEnv(envKeys);

    try {
        aiProviderService.setAiProviderOverride(null);
        delete process.env.OPENAI_API_KEY;
        delete process.env.GEMINI_API_KEY;
        delete process.env.EMBEDDING_PROVIDER;
        process.env.AI_PROVIDER = 'groq';
        process.env.GROQ_API_KEY = 'gsk_test_secret_token_1234567890';
        process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';

        const active = aiProviderService.getActiveProviderInfo();
        assert.equal(active.configured, true);
        assert.equal(active.provider, 'groq');
        assert.equal(active.verificationModel, 'llama-3.3-70b-versatile');
        assert.equal(active.embeddingModel, '');

        const detailed = aiProviderService.getDetailedProviderInfo();
        assert.equal(detailed.chatProvider, 'groq');
        assert.equal(detailed.chatConfigured, true);
        assert.equal(detailed.embeddingProvider, null);
        assert.equal(detailed.embeddingConfigured, false);
        assert.equal(detailed.groqBaseUrl, 'https://api.groq.com/openai/v1');

        // With OpenAI also configured, Groq handles chat/verification while OpenAI handles embeddings
        process.env.OPENAI_API_KEY = 'sk-test-openai-secret-1234567890';
        const splitDetailed = aiProviderService.getDetailedProviderInfo();
        assert.equal(splitDetailed.chatProvider, 'groq');
        assert.equal(splitDetailed.embeddingProvider, 'openai');
        assert.equal(splitDetailed.embeddingConfigured, true);
        assert.equal(splitDetailed.embeddingModel, 'text-embedding-3-small');

        // Ensure Groq secret tokens are always redacted
        const redacted = aiUsageService.redactSecrets(
            'Error calling Groq with key gsk_test_secret_token_1234567890 and Bearer gsk_another_token_987654321'
        );
        assert.equal(redacted.includes('gsk_test_secret'), false);
        assert.equal(redacted.includes('gsk_another_token'), false);
        assert.ok(redacted.includes('[REDACTED]'));
    } finally {
        restoreEnv(snapshot);
    }
});

test('Groq models endpoint retrieval, model validation, and unavailable model rejection', async () => {
    const envKeys = ['AI_PROVIDER', 'GROQ_API_KEY', 'GROQ_MODEL', 'GROQ_BASE_URL', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    const snapshot = saveEnv(envKeys);
    const originalFetch = global.fetch;

    try {
        aiProviderService.setAiProviderOverride(null);
        aiProviderService.clearInMemoryAiCache();
        process.env.AI_PROVIDER = 'groq';
        process.env.GROQ_API_KEY = 'gsk_models_test_key_1234567890';
        delete process.env.GROQ_MODEL;
        delete process.env.OPENAI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        let modelsFetchCount = 0;
        global.fetch = async (url, opts) => {
            if (url === 'https://api.groq.com/openai/v1/models') {
                modelsFetchCount++;
                assert.equal(opts.headers.Authorization, 'Bearer gsk_models_test_key_1234567890');
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => ({
                        data: [
                            { id: 'whisper-large-v3', owned_by: 'OpenAI', active: true },
                            { id: 'llama-3.1-8b-instant', owned_by: 'Meta', active: true, context_window: 131072 },
                            { id: 'llama-3.3-70b-versatile', owned_by: 'Meta', active: true, context_window: 131072 },
                            { id: 'openai/gpt-oss-120b', owned_by: 'OpenAI', active: true, context_window: 131072 }
                        ]
                    })
                };
            }
            throw new Error(`Unexpected URL: ${url}`);
        };

        const catalog = await aiProviderService.fetchGroqModels({ forceRefresh: true });
        assert.equal(modelsFetchCount, 1);
        assert.equal(catalog.models.length, 4);
        assert.equal(catalog.chatModels.some(m => m.id === 'whisper-large-v3'), false);
        assert.equal(catalog.chatModels.some(m => m.id === 'llama-3.3-70b-versatile'), true);

        // Cached subsequent fetch should not call network again
        const cachedCatalog = await aiProviderService.fetchGroqModels();
        assert.equal(cachedCatalog.cached, true);
        assert.equal(modelsFetchCount, 1);

        // Auto-select preferred technical model
        const autoSelected = await aiProviderService.resolveAndValidateGroqModel('');
        assert.equal(autoSelected.modelId, 'llama-3.3-70b-versatile');
        assert.equal(autoSelected.validated, true);

        // Explicit valid GROQ_MODEL
        process.env.GROQ_MODEL = 'openai/gpt-oss-120b';
        const explicitSelected = await aiProviderService.resolveAndValidateGroqModel();
        assert.equal(explicitSelected.modelId, 'openai/gpt-oss-120b');

        // Explicit unavailable GROQ_MODEL must reject cleanly
        process.env.GROQ_MODEL = 'decommissioned-model-xyz';
        await assert.rejects(
            () => aiProviderService.resolveAndValidateGroqModel(),
            (err) => err.code === 'AI_MODEL_UNAVAILABLE' && err.status === 400
        );

        // Admin models controller endpoint
        process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';
        const req = { query: { refresh: '1' } };
        const res = createMockRes();
        await aiController.getAiModels(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.provider, 'groq');
        assert.equal(res.body.modelValid, true);
        assert.equal(res.body.resolvedModel, 'llama-3.3-70b-versatile');
    } finally {
        global.fetch = originalFetch;
        aiProviderService.clearInMemoryAiCache();
        restoreEnv(snapshot);
    }
});

test('Groq RAG verification workflow: correct, incorrect, insufficient_evidence, anti-hallucination, deduplication, and admin approval/rejection', async () => {
    const envKeys = ['AI_PROVIDER', 'GROQ_API_KEY', 'GROQ_MODEL', 'GROQ_BASE_URL', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    const snapshot = saveEnv(envKeys);
    const originalFetch = global.fetch;
    const mockDb = installVerificationMockDb();

    try {
        aiProviderService.setAiProviderOverride(null);
        aiProviderService.clearInMemoryAiCache();
        aiUsageService.resetRuntimeUsageForTests();

        process.env.AI_PROVIDER = 'groq';
        process.env.GROQ_API_KEY = 'gsk_rag_workflow_secret_key_999';
        process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';
        delete process.env.OPENAI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        // Seed existing reference book & chunk in MongoDB mock (preserving KB data)
        const bookId = '000000000000000000000101';
        mockDb.state.books.set(bookId, {
            id: bookId,
            title: 'Eloquent JavaScript',
            author: 'Marijn Haverbeke',
            technology: 'JavaScript',
            technologyNormalized: 'javascript',
            isEnabled: true,
            processingStatus: 'Completed',
            indexedChunks: 1,
            knowledgeVersion: 1,
            fileHash: 'abc123def456'
        });
        mockDb.state.chunks.push({
            id: '000000000000000000000201',
            bookId,
            technology: 'JavaScript',
            technologyNormalized: 'javascript',
            bookTitle: 'Eloquent JavaScript',
            author: 'Marijn Haverbeke',
            edition: '4th Edition',
            chapter: 'Chapter 1: Values, Types, and Operators',
            pageNumber: 18,
            chunkIndex: 0,
            chunkText: 'The strict equality operator (===) compares values without automatic type conversion, while == performs type coercion before comparison.',
            isActive: true
        });

        const wrongQuestionId = '000000000000000000000301';
        mockDb.state.questions.set(wrongQuestionId, {
            id: wrongQuestionId,
            category: 'JavaScript',
            session: 1,
            questionText: 'Which JavaScript operator checks strict equality without type conversion?',
            options: JSON.stringify(['==', '===', '=', '!=']),
            correctAnswer: '==',
            explanation: ''
        });

        let groqChatCalls = 0;
        global.fetch = async (url, opts) => {
            if (url === 'https://api.groq.com/openai/v1/models') {
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => ({
                        data: [{ id: 'llama-3.3-70b-versatile', owned_by: 'Meta', active: true, context_window: 131072 }]
                    })
                };
            }

            if (url === 'https://api.groq.com/openai/v1/chat/completions') {
                groqChatCalls++;
                const body = JSON.parse(opts.body);
                assert.equal(body.model, 'llama-3.3-70b-versatile');
                assert.deepEqual(body.response_format, { type: 'json_object' });
                const userContent = body.messages.find(m => m.role === 'user')?.content || '';

                if (userContent.includes('strict equality')) {
                    const isWrongStored = userContent.includes('Database Stored Correct Answer: ==');
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => ({
                            id: 'chatcmpl-1',
                            model: 'llama-3.3-70b-versatile',
                            choices: [{
                                message: {
                                    // Include <think> block to verify resilient JSON extraction
                                    content: '<think>Checking retrieved excerpt.</think>' + JSON.stringify({
                                        status: isWrongStored ? 'incorrect' : 'correct',
                                        verifiedAnswer: '===',
                                        explanation: 'The strict equality operator === compares both value and type.\nIt avoids implicit type coercion performed by ==.\nTherefore === is the correct strict equality operator.\nUse === for predictable comparisons.',
                                        confidence: 0.96,
                                        sourceBook: 'Eloquent JavaScript',
                                        chapter: 'Hallucinated Chapter 99',
                                        page: '999',
                                        supportingExcerpt: 'Hallucinated quote that is not in the book excerpt.',
                                        reason: isWrongStored ? 'Stored answer == performs type coercion instead of strict equality.' : ''
                                    })
                                }
                            }],
                            usage: { prompt_tokens: 210, completion_tokens: 85, total_tokens: 295 }
                        })
                    };
                }

                if (userContent.includes('declare a block-scoped variable')) {
                    return {
                        ok: true,
                        status: 200,
                        headers: new Headers(),
                        json: async () => ({
                            id: 'chatcmpl-amb',
                            model: 'llama-3.3-70b-versatile',
                            choices: [{
                                message: {
                                    content: JSON.stringify({
                                        status: 'ambiguous',
                                        verifiedAnswer: 'let',
                                        explanation: 'Both let and const declare block-scoped variables in modern JavaScript.\nThe question does not state whether reassignment is needed.\nAs a result, multiple options match the reference book.',
                                        confidence: 0.82,
                                        sourceBook: 'Eloquent JavaScript',
                                        chapter: 'Chapter 1: Values, Types, and Operators',
                                        page: '18',
                                        supportingExcerpt: 'The strict equality operator (===) compares values',
                                        reason: 'Both let and const declare block-scoped variables without specifying reassignment.'
                                    })
                                }
                            }],
                            usage: { prompt_tokens: 180, completion_tokens: 70, total_tokens: 250 }
                        })
                    };
                }

                return {
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => ({
                        id: 'chatcmpl-2',
                        model: 'llama-3.3-70b-versatile',
                        choices: [{
                            message: {
                                content: JSON.stringify({
                                    status: 'insufficient_evidence',
                                    verifiedAnswer: '',
                                    explanation: 'The retrieved excerpt does not cover this topic.',
                                    confidence: 0.15,
                                    sourceBook: '',
                                    chapter: '',
                                    page: '',
                                    supportingExcerpt: '',
                                    reason: 'No supporting passage found.'
                                })
                            }
                        }],
                        usage: { prompt_tokens: 150, completion_tokens: 40, total_tokens: 190 }
                    })
                };
            }
            throw new Error(`Unexpected URL: ${url}`);
        };

        // 1. Verify question with incorrect stored answer -> detects incorrect, grounds chapter/page/excerpt to DB chunk, does NOT auto-overwrite DB!
        const incorrectRes = await questionVerificationService.verifyQuestionWithBooks({
            questionId: wrongQuestionId,
            questionText: 'Which JavaScript operator checks strict equality without type conversion?',
            options: ['==', '===', '=', '!='],
            correctAnswer: '==',
            technology: 'JavaScript',
            userSelectedAnswer: '==='
        });

        assert.equal(incorrectRes.provider, 'groq');
        assert.equal(incorrectRes.model, 'llama-3.3-70b-versatile');
        assert.equal(incorrectRes.verification.status, 'incorrect');
        assert.equal(incorrectRes.verification.verification_status, 'incorrect');
        assert.equal(incorrectRes.verification.verifiedAnswer, '===');
        assert.equal(incorrectRes.verification.sourceBook, 'Eloquent JavaScript');
        assert.equal(incorrectRes.verification.chapter, 'Chapter 1: Values, Types, and Operators');
        assert.equal(incorrectRes.verification.page, '18');
        assert.ok(incorrectRes.verification.supportingExcerpt.includes('strict equality operator (===)'));
        assert.equal(incorrectRes.verification.explanation.split('\n').length <= 5, true);
        assert.ok(incorrectRes.verification.reason.includes('type coercion'));
        // Original question must NOT be auto-overwritten
        assert.equal(mockDb.state.questions.get(wrongQuestionId).correctAnswer, '==');

        // 2. Duplicate verification request hits DB cache without calling Groq again
        const callsBeforeDup = groqChatCalls;
        const cachedRes = await questionVerificationService.verifyQuestionWithBooks({
            questionId: wrongQuestionId,
            questionText: 'Which JavaScript operator checks strict equality without type conversion?',
            options: ['==', '===', '=', '!='],
            correctAnswer: '==',
            technology: 'JavaScript'
        });
        assert.equal(cachedRes.cached, true);
        assert.equal(groqChatCalls, callsBeforeDup);

        // 3. Admin rejects (dismisses) then approves correction cleanly
        const dismissRes = createMockRes();
        await verificationController.dismissReport(
            { params: { id: incorrectRes.verification.id }, body: { notes: 'Reviewing' }, user: { name: 'Admin' } },
            dismissRes
        );
        assert.equal(dismissRes.statusCode, 200);
        assert.equal(dismissRes.body.report.reviewStatus, 'dismissed');
        assert.equal(mockDb.state.questions.get(wrongQuestionId).correctAnswer, '==');

        const approveRes = createMockRes();
        await verificationController.approveReportCorrection(
            {
                params: { id: incorrectRes.verification.id },
                body: { correctedAnswer: '===', notes: 'Approved from Eloquent JS p.18' },
                user: { id: 'admin1', name: 'Lead Admin', email: 'admin@hangbug.com' }
            },
            approveRes
        );
        assert.equal(approveRes.statusCode, 200);
        assert.equal(mockDb.state.questions.get(wrongQuestionId).correctAnswer, '===');
        assert.equal(mockDb.state.history.length, 1);

        // 4. Verify question with correct stored answer -> returns status: 'correct' & verification_status: 'verified'
        const correctRes = await questionVerificationService.verifyQuestionWithBooks({
            questionText: 'Which JavaScript operator checks strict equality without type conversion?',
            options: ['==', '===', '=', '!='],
            correctAnswer: '===',
            technology: 'JavaScript'
        });
        assert.equal(correctRes.verification.status, 'correct');
        assert.equal(correctRes.verification.verification_status, 'verified');
        assert.equal(correctRes.verification.verifiedAnswer, '===');

        // 5. Ambiguous question -> returns status: 'ambiguous' and reason
        const ambRes = await questionVerificationService.verifyQuestionWithBooks({
            questionText: 'Which keyword can declare a block-scoped variable with strict equality examples?',
            options: ['let', 'const', 'var', 'function'],
            correctAnswer: 'let',
            technology: 'JavaScript'
        });
        assert.equal(ambRes.verification.status, 'ambiguous');
        assert.ok(ambRes.verification.reason.includes('block-scoped'));

        // 6. Verify question without relevant evidence -> returns insufficient_evidence without calling LLM unnecessarily
        const callsBeforeMissing = groqChatCalls;
        const insuffRes = await questionVerificationService.verifyQuestionWithBooks({
            questionText: 'How does Kubernetes Pod scheduling work?',
            options: ['kube-scheduler', 'kubelet', 'etcd', 'coredns'],
            correctAnswer: 'kube-scheduler',
            technology: 'Docker'
        });
        assert.equal(insuffRes.verification.status, 'insufficient_evidence');
        assert.equal(insuffRes.verification.sourceBook, '');
        assert.ok(insuffRes.verification.reason.length > 0);
        assert.equal(groqChatCalls, callsBeforeMissing);

        // 7. Admin diagnostic test endpoint (chat & models modes)
        const chatDiagRes = createMockRes();
        await aiController.testAiModels({
            body: { mode: 'chat', prompt: 'Explain === in JS.' }
        }, chatDiagRes);
        assert.equal(chatDiagRes.statusCode, 200);
        assert.equal(chatDiagRes.body.success, true);
        assert.equal(chatDiagRes.body.result.provider, 'groq');

        const modelsDiagRes = createMockRes();
        await aiController.testAiModels({
            body: { mode: 'models' }
        }, modelsDiagRes);
        assert.equal(modelsDiagRes.statusCode, 200);
        assert.equal(modelsDiagRes.body.result.validated, true);
        assert.equal(modelsDiagRes.body.result.resolvedModel, 'llama-3.3-70b-versatile');

        // 8. Request validation checks (bad question payload & bad report ID)
        const badReqRes = createMockRes();
        await verificationController.verifyQuestion({
            body: { questionText: '', options: ['OnlyOne'], technology: 'JavaScript' },
            user: { id: 'u1', role: 'user' }
        }, badReqRes);
        assert.equal(badReqRes.statusCode, 400);
        assert.equal(badReqRes.body.success, false);

        const badIdRes = createMockRes();
        await verificationController.approveReportCorrection({
            params: { id: 'not-an-object-id' },
            body: { correctedAnswer: '===' },
            user: { id: 'admin1', role: 'admin' }
        }, badIdRes);
        assert.equal(badIdRes.statusCode, 400);
        assert.equal(badIdRes.body.success, false);
    } finally {
        global.fetch = originalFetch;
        aiProviderService.clearInMemoryAiCache();
        mockDb.restore();
        restoreEnv(snapshot);
    }
});

test('Groq error resilience: 429 quota/rate limit, invalid API key, timeout, and no silent success', async () => {
    const envKeys = ['AI_PROVIDER', 'GROQ_API_KEY', 'GROQ_MODEL', 'AI_REQUEST_TIMEOUT_MS', 'AI_MAX_RETRIES', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    const snapshot = saveEnv(envKeys);
    const originalFetch = global.fetch;
    const mockDb = installVerificationMockDb();

    try {
        aiProviderService.setAiProviderOverride(null);
        aiProviderService.clearInMemoryAiCache();
        process.env.AI_PROVIDER = 'groq';
        process.env.GROQ_API_KEY = 'gsk_invalid_or_limited_secret_key_777';
        process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';
        process.env.AI_MAX_RETRIES = '1';
        delete process.env.OPENAI_API_KEY;
        delete process.env.GEMINI_API_KEY;

        const bookId = '000000000000000000000401';
        mockDb.state.books.set(bookId, {
            id: bookId,
            title: 'HTML5 Reference',
            author: 'Duckett',
            technology: 'HTML',
            technologyNormalized: 'html',
            isEnabled: true,
            processingStatus: 'Completed',
            indexedChunks: 1,
            knowledgeVersion: 1,
            fileHash: 'htmlhash1'
        });
        mockDb.state.chunks.push({
            id: '000000000000000000000402',
            bookId,
            technology: 'HTML',
            technologyNormalized: 'html',
            bookTitle: 'HTML5 Reference',
            author: 'Duckett',
            chapter: 'Chapter 1',
            pageNumber: 5,
            chunkIndex: 0,
            chunkText: 'The HTML <section> tag defines a thematic grouping of content.',
            isActive: true
        });

        // Case A: HTTP 429 Quota Exhausted with Retry-After -> returns 429, does NOT save report
        global.fetch = async (url) => {
            if (url === 'https://api.groq.com/openai/v1/models') {
                return {
                    ok: true,
                    status: 200,
                    headers: new Headers(),
                    json: async () => ({
                        data: [{ id: 'llama-3.3-70b-versatile', active: true }]
                    })
                };
            }
            return {
                ok: false,
                status: 429,
                headers: new Headers({ 'retry-after': '12' }),
                text: async () => JSON.stringify({ error: { message: 'Tokens per day quota exceeded' } })
            };
        };

        const rateRes = createMockRes();
        await verificationController.verifyQuestion({
            body: {
                questionText: 'Which HTML tag defines a thematic section?',
                options: ['<section>', '<div>', '<span>', '<p>'],
                correctAnswer: '<section>',
                technology: 'HTML'
            },
            user: { id: 'u1', role: 'user' }
        }, rateRes);

        assert.equal(rateRes.statusCode, 429);
        assert.equal(rateRes.body.success, false);
        assert.equal(rateRes.headers['Retry-After'], '12');
        assert.equal(mockDb.state.verifications.size, 0, 'Failed 429 request must never be marked verified');

        // Case B: Invalid Groq API key (upstream 401) -> maps safely to 502 (never logs out client with 401 and never leaks key)
        aiProviderService.clearInMemoryAiCache();
        global.fetch = async () => ({
            ok: false,
            status: 401,
            headers: new Headers(),
            text: async () => JSON.stringify({ error: { message: 'Invalid API key gsk_invalid_or_limited_secret_key_777' } })
        });

        const authRes = createMockRes();
        await verificationController.verifyQuestion({
            body: {
                questionText: 'Which HTML tag defines a thematic section?',
                options: ['<section>', '<div>', '<span>', '<p>'],
                correctAnswer: '<section>',
                technology: 'HTML'
            },
            user: { id: 'u1', role: 'user' }
        }, authRes);

        assert.equal(authRes.statusCode, 502);
        assert.equal(authRes.body.success, false);
        assert.equal(authRes.body.message.includes('gsk_invalid'), false);
        assert.equal(mockDb.state.verifications.size, 0, 'Failed auth request must never be marked verified');

        // Case C: Request timeout -> maps to 504
        aiProviderService.clearInMemoryAiCache();
        global.fetch = async () => {
            const abortErr = new Error('The operation was aborted');
            abortErr.name = 'AbortError';
            throw abortErr;
        };

        const timeoutRes = createMockRes();
        await verificationController.verifyQuestion({
            body: {
                questionText: 'Which HTML tag defines a thematic section?',
                options: ['<section>', '<div>', '<span>', '<p>'],
                correctAnswer: '<section>',
                technology: 'HTML'
            },
            user: { id: 'u1', role: 'user' }
        }, timeoutRes);

        assert.equal(timeoutRes.statusCode, 504);
        assert.equal(timeoutRes.body.success, false);
        assert.equal(mockDb.state.verifications.size, 0, 'Timed out request must never be marked verified');
    } finally {
        global.fetch = originalFetch;
        aiProviderService.clearInMemoryAiCache();
        mockDb.restore();
        restoreEnv(snapshot);
    }
});
