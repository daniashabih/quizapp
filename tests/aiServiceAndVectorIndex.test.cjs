process.env.NODE_ENV = 'test';
process.env.HANGBUG_ALLOW_AI_TEST_OVERRIDE = '1';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const prisma = require('../api/_config/prisma');
const aiProviderService = require('../api/_services/aiProviderService');
const aiUsageService = require('../api/_services/aiUsageService');
const vectorSearchService = require('../api/_services/vectorSearchService');

const ROOT_DIR = path.resolve(__dirname, '..');

function collectFiles(relativeDir, extensions) {
    const startDir = path.join(ROOT_DIR, relativeDir);
    if (!fs.existsSync(startDir)) return [];

    const results = [];
    const stack = [startDir];

    while (stack.length > 0) {
        const currentDir = stack.pop();
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'build' || entry.name === 'dist') {
                continue;
            }
            const fullPath = path.join(currentDir, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (!extensions || extensions.includes(ext)) {
                    results.push(fullPath);
                }
            }
        }
    }

    return results;
}

test('aiProviderService has no Hugging Face defaults and uses 1536-dim baseline', () => {
    const envKeys = [
        'AI_PROVIDER',
        'OPENAI_API_KEY',
        'GEMINI_API_KEY',
        'GOOGLE_API_KEY',
        'AI_EMBEDDING_DIMENSIONS',
        'HF_TOKEN',
        'HUGGINGFACE_API_KEY',
        'HF_API_KEY',
    ];
    const previousEnv = {};
    for (const key of envKeys) {
        previousEnv[key] = process.env[key];
        delete process.env[key];
    }

    try {
        aiProviderService.setAiProviderOverride(null);
        assert.equal(aiProviderService.DEFAULT_EMBEDDING_DIMENSIONS, 1536);
        assert.equal(aiProviderService.getActiveEmbeddingDimensions(), 1536);

        const info = aiProviderService.getActiveProviderInfo();
        assert.deepEqual(info, {
            configured: false,
            provider: null,
            embeddingModel: '',
            verificationModel: '',
            embeddingDimensions: 1536,
        });

        const settings = aiProviderService.getRuntimeSettings();
        assert.equal(typeof settings, 'object');
        assert.notEqual(settings, null);
    } finally {
        for (const [key, value] of Object.entries(previousEnv)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('formatConciseExplanation and in-memory AI cache utilities work without provider calls', () => {
    const raw = [
        'Line one explains the primary rule clearly.',
        'Line two adds book-backed technical context.',
        'Line three clarifies why the distractor is incorrect.',
        'Line four confirms the final takeaway.',
        'Line five should be trimmed or condensed.',
    ].join(' ');

    const concise = aiProviderService.formatConciseExplanation(raw);
    assert.equal(typeof concise, 'string');
    assert.ok(concise.length > 0);
    assert.ok(concise.split(/\r?\n/).length <= 4);

    aiProviderService.clearInMemoryAiCache();
    const stats = aiProviderService.getMemoryCacheStats();
    assert.equal(typeof stats, 'object');
    assert.notEqual(stats, null);
});

test('aiUsageService tracks generic token and cache telemetry safely', async () => {
    aiUsageService.resetRuntimeUsageForTests();

    const budget = aiUsageService.checkDailyBudget();
    assert.equal(budget, undefined);
    assert.equal(aiUsageService.redactSecrets('Plain diagnostic message'), 'Plain diagnostic message');
    assert.equal(aiUsageService.redactSecrets('Authorization: Bearer secret_token_123456'), 'Authorization: Bearer [REDACTED]');

    aiUsageService.recordAiEvent({
        operation: 'verify_question',
        provider: 'unconfigured',
        model: 'none',
        cached: false,
        cacheLayer: 'none',
        promptTokens: 120,
        completionTokens: 45,
        totalTokens: 165,
        latencyMs: 25,
        status: 'ok',
    });

    const summary = await aiUsageService.getUsageSummary();
    assert.equal(typeof summary, 'object');
    assert.notEqual(summary, null);
    assert.equal(summary.totals.totalRequests, 1);
    assert.equal(summary.totals.totalTokens, 165);
    assert.equal(Object.hasOwn(summary, 'estimatedCostUsd'), false);
    assert.equal(Object.hasOwn(summary, 'fallbackCalls'), false);

    aiUsageService.resetRuntimeUsageForTests();
});

test('vectorSearchService.ensureAtlasVectorSearchIndex creates collection before vector index creation', async () => {
    const originalRunCommandRaw = prisma.$runCommandRaw;
    const originalAggregateRaw = prisma.knowledgeBookChunk.aggregateRaw;
    const commands = [];

    prisma.$runCommandRaw = async (cmd) => {
        commands.push(cmd);
        if (cmd.create) {
            return { ok: 1 };
        }
        if (cmd.createSearchIndexes === 'knowledge_book_chunks') {
            return { ok: 1, indexesCreated: [{ name: vectorSearchService.VECTOR_INDEX_NAME }] };
        }
        return { ok: 1 };
    };

    prisma.knowledgeBookChunk.aggregateRaw = async () => [];

    try {
        const result = await vectorSearchService.ensureAtlasVectorSearchIndex(1536);
        assert.equal(result.success, true);
        assert.equal(result.created, true);
        assert.equal(result.dimensions, 1536);
        const createCollectionIdx = commands.findIndex((cmd) => cmd.create === 'knowledge_book_chunks');
        const createIndexIdx = commands.findIndex((cmd) => cmd.createSearchIndexes === 'knowledge_book_chunks');
        assert.ok(createCollectionIdx !== -1);
        assert.ok(createIndexIdx > createCollectionIdx);
    } finally {
        prisma.$runCommandRaw = originalRunCommandRaw;
        prisma.knowledgeBookChunk.aggregateRaw = originalAggregateRaw;
    }
});

test('codebase contains zero Hugging Face integration references', () => {
    const forbiddenPattern = new RegExp(
        [
            'huggingface',
            'router\\.huggingface',
            'hf-inference',
            'deepinfra',
            '\\bHF_TOKEN\\b',
            '\\bHF_API_KEY\\b',
            '\\bHUGGINGFACE_API_KEY\\b',
            '\\bHF_CHAT_MODEL\\b',
            '\\bHF_FALLBACK_MODEL\\b',
            '\\bHF_EMBEDDING_MODEL\\b',
            '\\bHF_[A-Z0-9_]+\\b',
            '\\bcheckAiModels\\b',
            'models/check',
        ].join('|'),
        'i'
    );

    const filesToScan = [
        ...collectFiles('api', ['.js', '.cjs', '.mjs']),
        ...collectFiles('src', ['.js', '.jsx', '.ts', '.tsx']),
        ...collectFiles('mobile/lib', ['.dart']),
        ...collectFiles('tests', ['.js', '.cjs', '.mjs']),
        path.join(ROOT_DIR, '.env.example'),
        path.join(ROOT_DIR, 'package.json'),
    ];

    const matches = [];
    for (const filePath of filesToScan) {
        if (path.resolve(filePath) === path.resolve(__filename)) {
            continue;
        }
        if (!fs.existsSync(filePath)) continue;
        const content = fs.readFileSync(filePath, 'utf8');
        if (forbiddenPattern.test(content)) {
            matches.push(path.relative(ROOT_DIR, filePath));
        }
    }

    assert.deepEqual(matches, []);
});
