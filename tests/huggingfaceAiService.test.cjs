process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    getActiveProviderInfo,
    getActiveEmbeddingDimensions,
    createChatCompletion,
    generateEmbeddings,
    evaluateQuestionWithEvidence,
    formatConciseExplanation,
    clearInMemoryAiCache,
    getMemoryCacheStats,
    setAiProviderOverride
} = require('../api/_services/aiProviderService');
const {
    redactSecrets,
    checkDailyBudget,
    recordAiEvent,
    getUsageSummary,
    resetRuntimeUsageForTests
} = require('../api/_services/aiUsageService');
const {
    getAtlasVectorIndexDefinition,
    ensureAtlasVectorSearchIndex
} = require('../api/_services/vectorSearchService');
const prisma = require('../api/_config/prisma');

test('Hugging Face configuration, model selection, and secret safety', () => {
    const savedEnv = {
        AI_PROVIDER: process.env.AI_PROVIDER,
        HF_TOKEN: process.env.HF_TOKEN,
        HF_CHAT_MODEL: process.env.HF_CHAT_MODEL,
        HF_FALLBACK_CHAT_MODEL: process.env.HF_FALLBACK_CHAT_MODEL,
        HF_EMBEDDING_MODEL: process.env.HF_EMBEDDING_MODEL,
        AI_EMBEDDING_DIMENSIONS: process.env.AI_EMBEDDING_DIMENSIONS,
        HF_EMBEDDING_DIMENSIONS: process.env.HF_EMBEDDING_DIMENSIONS
    };

    try {
        setAiProviderOverride(null);
        delete process.env.AI_PROVIDER;
        delete process.env.AI_EMBEDDING_DIMENSIONS;
        delete process.env.HF_EMBEDDING_DIMENSIONS;
        process.env.HF_TOKEN = 'hf_test_secret_token_should_never_leak_12345';
        delete process.env.HF_CHAT_MODEL;
        delete process.env.HF_FALLBACK_CHAT_MODEL;
        delete process.env.HF_EMBEDDING_MODEL;

        const info = getActiveProviderInfo();
        assert.equal(info.configured, true);
        assert.equal(info.provider, 'huggingface');
        assert.equal(info.verificationModel, 'Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest');
        assert.equal(info.fallbackModel, 'deepseek-ai/DeepSeek-V4-Flash:cheapest');
        assert.equal(info.embeddingModel, 'BAAI/bge-large-en-v1.5');
        assert.equal(info.embeddingDimensions, 1024);
        assert.equal(getActiveEmbeddingDimensions(), 1024);
        assert.equal(JSON.stringify(info).includes('hf_test_secret'), false);

        const indexDef = getAtlasVectorIndexDefinition();
        assert.equal(indexDef.definition.fields[0].numDimensions, 1024);
        assert.equal(indexDef.definition.fields[0].similarity, 'cosine');

        // Configurable models via environment variables
        process.env.HF_CHAT_MODEL = 'deepseek-ai/DeepSeek-V3.2:cheapest';
        process.env.HF_EMBEDDING_MODEL = 'BAAI/bge-base-en-v1.5';
        const customInfo = getActiveProviderInfo();
        assert.equal(customInfo.verificationModel, 'deepseek-ai/DeepSeek-V3.2:cheapest');
        assert.equal(customInfo.embeddingModel, 'BAAI/bge-base-en-v1.5');
        assert.equal(customInfo.embeddingDimensions, 768);

        // Secret redaction
        const redacted = redactSecrets('Upstream error with Bearer hf_test_secret_token_should_never_leak_12345');
        assert.equal(redacted.includes('hf_test_secret'), false);
        assert.ok(redacted.includes('[REDACTED]'));
    } finally {
        for (const [k, v] of Object.entries(savedEnv)) {
            if (v === undefined) delete process.env[k];
            else process.env[k] = v;
        }
    }
});

test('Concise 3-4 line explanation formatting strips reasoning tags and caps length', () => {
    const raw = [
        '<think>Internal reasoning chain that must not appear.</think>',
        'The HTML <section> element represents a standalone thematic grouping of content.',
        'It typically includes a heading such as <h1> through <h6> to identify its topic.',
        'Unlike <div>, <section> conveys semantic structure to browsers and screen readers.',
        'It should not be used solely as a generic styling wrapper.',
        'Extra line five that should be trimmed.'
    ].join('\n');

    const formatted = formatConciseExplanation(raw);
    assert.equal(formatted.includes('<think>'), false);
    const lines = formatted.split('\n').filter(Boolean);
    assert.equal(lines.length, 4);
    assert.ok(lines[0].includes('<section>'));
});

test('Hugging Face embeddings: hf-inference, deepinfra fallback, normalization, and memory cache', async () => {
    const savedEnv = {
        HF_TOKEN: process.env.HF_TOKEN,
        AI_PROVIDER: process.env.AI_PROVIDER,
        HF_EMBEDDING_MODEL: process.env.HF_EMBEDDING_MODEL,
        HF_EMBEDDING_PROVIDER: process.env.HF_EMBEDDING_PROVIDER,
        HF_MAX_RETRIES: process.env.HF_MAX_RETRIES
    };
    const originalFetch = global.fetch;

    try {
        setAiProviderOverride(null);
        clearInMemoryAiCache();
        resetRuntimeUsageForTests();
        process.env.AI_PROVIDER = 'huggingface';
        process.env.HF_TOKEN = 'hf_test_token_9876543210';
        process.env.HF_EMBEDDING_MODEL = 'BAAI/bge-large-en-v1.5';
        process.env.HF_EMBEDDING_PROVIDER = 'auto';
        process.env.HF_MAX_RETRIES = '2';

        let fetchCalls = 0;
        const unitVec = new Array(1024).fill(0);
        unitVec[0] = 3;
        unitVec[1] = 4;

        global.fetch = async (url, init) => {
            fetchCalls++;
            const urlStr = String(url);
            if (urlStr.includes('hf-inference')) {
                // Verify BGE query prefix was applied for RETRIEVAL_QUERY
                const body = JSON.parse(init.body);
                assert.ok(body.inputs[0].startsWith('Represent this sentence for searching relevant passages: '));
                return new Response(JSON.stringify([unitVec]), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }
            throw new Error(`Unexpected URL: ${urlStr}`);
        };

        const [v1] = await generateEmbeddings(['Explain HTML section tag'], { taskType: 'RETRIEVAL_QUERY' });
        assert.equal(v1.length, 1024);
        assert.ok(Math.abs(v1[0] - 0.6) < 1e-6);
        assert.ok(Math.abs(v1[1] - 0.8) < 1e-6);
        assert.equal(fetchCalls, 1);

        // Second identical request should hit memory cache with 0 external calls
        const [v2] = await generateEmbeddings(['Explain HTML section tag'], { taskType: 'RETRIEVAL_QUERY' });
        assert.deepEqual(v2, v1);
        assert.equal(fetchCalls, 1);
        assert.equal(getMemoryCacheStats().embeddingEntries, 1);

        // Test fallback from hf-inference (503) to deepinfra OpenAI-compatible embeddings endpoint
        clearInMemoryAiCache();
        let sawDeepInfraFallback = false;
        global.fetch = async (url) => {
            const urlStr = String(url);
            if (urlStr.includes('hf-inference')) {
                return new Response('Model is currently loading', { status: 503 });
            }
            if (urlStr.includes('router.huggingface.co/deepinfra/v1/openai/embeddings')) {
                sawDeepInfraFallback = true;
                return new Response(JSON.stringify({
                    data: [{ index: 0, embedding: unitVec }],
                    usage: { prompt_tokens: 12, total_tokens: 12 }
                }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }
            throw new Error(`Unexpected URL: ${urlStr}`);
        };

        const [v3] = await generateEmbeddings(['Fallback embedding test'], { taskType: 'RETRIEVAL_DOCUMENT' });
        assert.equal(sawDeepInfraFallback, true);
        assert.equal(v3.length, 1024);
    } finally {
        global.fetch = originalFetch;
        clearInMemoryAiCache();
        for (const [k, v] of Object.entries(savedEnv)) {
            if (v === undefined) delete process.env[k];
            else process.env[k] = v;
        }
    }
});

test('Daily AI usage budget enforcement & usage telemetry summary', async () => {
    const savedLimit = process.env.AI_DAILY_REQUEST_LIMIT;
    try {
        resetRuntimeUsageForTests();
        process.env.AI_DAILY_REQUEST_LIMIT = '2';

        recordAiEvent({
            operation: 'verify_question',
            provider: 'huggingface',
            model: 'Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest',
            promptTokens: 300,
            completionTokens: 120,
            latencyMs: 420
        });
        recordAiEvent({
            operation: 'verify_question',
            provider: 'huggingface',
            model: 'Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest',
            cached: true,
            cacheLayer: 'db',
            latencyMs: 2
        });
        checkDailyBudget(); // Only 1 external request counted so far!

        recordAiEvent({
            operation: 'embed_query',
            provider: 'huggingface',
            model: 'BAAI/bge-large-en-v1.5',
            promptTokens: 40,
            latencyMs: 110
        });

        assert.throws(() => checkDailyBudget(), /Daily AI request budget reached/i);

        const summary = await getUsageSummary();
        assert.equal(summary.totals.totalRequests, 3);
        assert.equal(summary.totals.externalApiCalls, 2);
        assert.equal(summary.totals.cacheHits, 1);
        assert.ok(summary.totals.estimatedCostUsd > 0);
    } finally {
        if (savedLimit === undefined) delete process.env.AI_DAILY_REQUEST_LIMIT;
        else process.env.AI_DAILY_REQUEST_LIMIT = savedLimit;
        resetRuntimeUsageForTests();
    }
});

test('Hugging Face chat completion: primary Qwen model, DeepSeek fallback, and strict JSON verification', async () => {
    const savedEnv = {
        HF_TOKEN: process.env.HF_TOKEN,
        AI_PROVIDER: process.env.AI_PROVIDER,
        HF_CHAT_MODEL: process.env.HF_CHAT_MODEL,
        HF_FALLBACK_CHAT_MODEL: process.env.HF_FALLBACK_CHAT_MODEL,
        HF_MAX_RETRIES: process.env.HF_MAX_RETRIES
    };
    const originalFetch = global.fetch;

    try {
        setAiProviderOverride(null);
        clearInMemoryAiCache();
        resetRuntimeUsageForTests();
        process.env.AI_PROVIDER = 'huggingface';
        process.env.HF_TOKEN = 'hf_test_chat_token_123456';
        process.env.HF_CHAT_MODEL = 'Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest';
        process.env.HF_FALLBACK_CHAT_MODEL = 'deepseek-ai/DeepSeek-V4-Flash:cheapest';
        process.env.HF_MAX_RETRIES = '2';

        const calledModels = [];
        global.fetch = async (url, init) => {
            const body = JSON.parse(init.body);
            calledModels.push(body.model);
            if (body.model === 'Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest') {
                return new Response(JSON.stringify({ error: { message: 'Provider temporarily unavailable' } }), {
                    status: 503,
                    headers: { 'content-type': 'application/json' }
                });
            }
            return new Response(JSON.stringify({
                id: 'chatcmpl-hf-test',
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: 'deepseek-ai/DeepSeek-V4-Flash',
                choices: [{
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: JSON.stringify({
                            verification_status: 'verified',
                            original_correct_answer: '<section>',
                            verified_correct_answer: '<section>',
                            explanation: 'The HTML <section> element defines a thematic grouping of content.\nIt typically begins with a heading element like <h2>.\nUse <section> for semantic document structure rather than generic styling.',
                            source_book: 'HTML5 Semantics Guide',
                            source_author: 'MDN Contributors',
                            source_chapter: 'Chapter 3 Semantic Elements',
                            source_page: '42',
                            supporting_excerpt: 'The <section> HTML element represents a generic standalone section of a document.',
                            issue_description: '',
                            suggested_correction: '',
                            confidence: 0.94
                        })
                    },
                    finish_reason: 'stop'
                }],
                usage: { prompt_tokens: 210, completion_tokens: 95, total_tokens: 305 }
            }), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        };

        const result = await evaluateQuestionWithEvidence({
            questionText: 'Which HTML5 tag represents a standalone thematic section of a document?',
            options: ['<section>', '<div>', '<span>', '<break>'],
            originalCorrectAnswer: '<section>',
            technology: 'HTML',
            evidenceChunks: [{
                bookTitle: 'HTML5 Semantics Guide',
                author: 'MDN Contributors',
                edition: '1st Edition',
                chapter: 'Chapter 3 Semantic Elements',
                pageNumber: 42,
                score: 0.89,
                chunkText: 'The <section> HTML element represents a generic standalone section of a document, which does not have a more specific semantic element to represent it.'
            }]
        });

        assert.ok(calledModels.includes('Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest'));
        assert.ok(calledModels.includes('deepseek-ai/DeepSeek-V4-Flash:cheapest'));
        assert.equal(result.verification_status, 'verified');
        assert.equal(result.verified_correct_answer, '<section>');
        assert.equal(result._meta.fallbackUsed, true);
        assert.equal(result._meta.provider, 'huggingface');

        // Verify auth failures (401) do NOT trigger fallback
        calledModels.length = 0;
        global.fetch = async (url, init) => {
            const body = JSON.parse(init.body);
            calledModels.push(body.model);
            return new Response(JSON.stringify({ error: { message: 'Invalid HF token' } }), {
                status: 401,
                headers: { 'content-type': 'application/json' }
            });
        };
        await assert.rejects(
            () => createChatCompletion({
                messages: [{ role: 'user', content: 'Test auth' }],
                useCache: false
            }),
            /authentication failed/i
        );
        assert.deepEqual(calledModels, ['Qwen/Qwen3-30B-A3B-Instruct-2507:cheapest']);
    } finally {
        global.fetch = originalFetch;
        clearInMemoryAiCache();
        for (const [k, v] of Object.entries(savedEnv)) {
            if (v === undefined) delete process.env[k];
            else process.env[k] = v;
        }
    }
});

test('ensureAtlasVectorSearchIndex creates collection before createSearchIndexes to avoid NamespaceNotFound', async () => {
    const origRunCommandRaw = prisma.$runCommandRaw;
    const origAggregateRaw = prisma.knowledgeBookChunk.aggregateRaw;
    const commands = [];

    try {
        prisma.knowledgeBookChunk.aggregateRaw = async () => [];
        prisma.$runCommandRaw = async (cmd) => {
            commands.push(cmd);
            if (cmd.create === 'knowledge_book_chunks') {
                return { ok: 1 };
            }
            if (cmd.createSearchIndexes === 'knowledge_book_chunks') {
                return { ok: 1, indexesCreated: ['book_chunks_vector_index'] };
            }
            throw new Error(`Unexpected command: ${JSON.stringify(cmd)}`);
        };

        const res = await ensureAtlasVectorSearchIndex(1024);
        assert.equal(res.success, true);
        assert.equal(res.created, true);
        assert.equal(res.dimensions, 1024);
        assert.equal(commands[0].create, 'knowledge_book_chunks');
        assert.equal(commands[1].createSearchIndexes, 'knowledge_book_chunks');

        // Verify already-synced index detection via $listSearchIndexes
        prisma.knowledgeBookChunk.aggregateRaw = async () => ([{
            name: 'book_chunks_vector_index',
            status: 'READY',
            latestDefinition: {
                fields: [{ type: 'vector', path: 'embedding', numDimensions: 1024, similarity: 'cosine' }]
            }
        }]);
        const synced = await ensureAtlasVectorSearchIndex(1024);
        assert.equal(synced.success, true);
        assert.equal(synced.alreadyExists, true);
    } finally {
        prisma.$runCommandRaw = origRunCommandRaw;
        prisma.knowledgeBookChunk.aggregateRaw = origAggregateRaw;
    }
});

test('Security check: HF_TOKEN and secret keys are never exposed in Web or Mobile client source', () => {
    const scanDirs = [
        path.join(__dirname, '..', 'src'),
        path.join(__dirname, '..', 'mobile', 'lib')
    ];

    const forbiddenPatterns = [/HF_TOKEN/, /VITE_HF_/, /hf_[A-Za-z0-9]{15,}/];

    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (/\.(js|jsx|ts|tsx|dart)$/.test(entry.name)) {
                const content = fs.readFileSync(full, 'utf8');
                for (const pat of forbiddenPatterns) {
                    assert.equal(
                        pat.test(content),
                        false,
                        `Forbidden token reference matched ${pat} in ${full}`
                    );
                }
            }
        }
    }

    for (const dir of scanDirs) {
        if (fs.existsSync(dir)) walk(dir);
    }
});
