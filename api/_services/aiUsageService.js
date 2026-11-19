const prisma = require('../_config/prisma');

/**
 * Checked Hugging Face Inference Providers pricing & capabilities snapshot ($ per 1M tokens).
 * Inspected live via https://router.huggingface.co/v1/models & https://huggingface.co/api/models.
 */
const CHECKED_HF_MODEL_CATALOG = {
    'Qwen/Qwen3-30B-A3B-Instruct-2507': {
        role: 'chat_primary',
        inputPer1M: 0.09,
        outputPer1M: 0.30,
        contextLength: 262144,
        structuredOutput: true,
        providers: ['siliconflow', 'dekallm', 'nebius'],
        notes: 'Fast non-thinking 30B-A3B MoE instruct model; strong JSON compliance & code reasoning.'
    },
    'deepseek-ai/DeepSeek-V4-Flash': {
        role: 'chat_fallback',
        inputPer1M: 0.09,
        outputPer1M: 0.18,
        contextLength: 1048576,
        structuredOutput: true,
        providers: ['deepinfra', 'venice', 'wafer', 'siliconflow', 'parasail', 'mancer', 'azure', 'relace'],
        notes: 'High-redundancy checked fallback across 8 live providers with 1M context window.'
    },
    'deepseek-ai/DeepSeek-V4-Flash-0731': {
        role: 'chat_alternative',
        inputPer1M: 0.06,
        outputPer1M: 0.18,
        contextLength: 1048576,
        structuredOutput: true,
        providers: ['deepinfra', 'wafer', 'relace', 'nebius', 'parasail'],
        notes: 'Low-cost DeepSeek Flash variant with 18 live providers.'
    },
    'deepseek-ai/DeepSeek-V3.2': {
        role: 'chat_alternative',
        inputPer1M: 0.26,
        outputPer1M: 0.38,
        contextLength: 163840,
        structuredOutput: true,
        providers: ['deepinfra', 'siliconflow', 'digitalocean'],
        notes: 'DeepSeek V3.2 instruction model with JSON structured output support.'
    },
    'deepseek-ai/DeepSeek-V3-0324': {
        role: 'chat_alternative',
        inputPer1M: 0.24,
        outputPer1M: 0.90,
        contextLength: 163840,
        structuredOutput: true,
        providers: ['deepinfra', 'siliconflow'],
        notes: 'DeepSeek V3-0324 release with structured output.'
    },
    'deepseek-ai/DeepSeek-V3': {
        role: 'chat_legacy',
        inputPer1M: 0.32,
        outputPer1M: 0.89,
        contextLength: 163840,
        structuredOutput: false,
        providers: ['deepinfra'],
        notes: 'Single live provider on HF router without guaranteed structured output; superseded by DeepSeek-V4-Flash / V3.2.'
    },
    'Qwen/Qwen3-235B-A22B-Instruct-2507': {
        role: 'chat_high_accuracy',
        inputPer1M: 0.09,
        outputPer1M: 0.55,
        contextLength: 262144,
        structuredOutput: true,
        providers: ['deepinfra', 'parasail', 'venice'],
        notes: 'Large 235B-A22B MoE instruction model for complex reasoning.'
    },
    'Qwen/Qwen3-32B': {
        role: 'chat_alternative',
        inputPer1M: 0.08,
        outputPer1M: 0.28,
        contextLength: 40960,
        structuredOutput: true,
        providers: ['deepinfra', 'siliconflow', 'tenstorrent'],
        notes: 'Dense 32B Qwen3 model.'
    },
    'Qwen/Qwen3.5-9B': {
        role: 'chat_compact',
        inputPer1M: 0.10,
        outputPer1M: 0.15,
        contextLength: 262144,
        structuredOutput: true,
        providers: ['deepinfra', 'siliconflow', 'parasail', 'primeintellect', 'together'],
        notes: 'Compact low-latency Qwen 3.5 9B model.'
    },
    'BAAI/bge-large-en-v1.5': {
        role: 'embedding_primary',
        inputPer1M: 0.01,
        outputPer1M: 0,
        dimensions: 1024,
        maxTokens: 512,
        providers: ['hf-inference', 'deepinfra'],
        notes: 'Dedicated English retrieval embedding model (1024 dims); live on both hf-inference and deepinfra.'
    },
    'BAAI/bge-base-en-v1.5': {
        role: 'embedding_alternative',
        inputPer1M: 0.01,
        outputPer1M: 0,
        dimensions: 768,
        maxTokens: 512,
        providers: ['hf-inference', 'deepinfra'],
        notes: '768-dim BGE base embedding model.'
    },
    'BAAI/bge-small-en-v1.5': {
        role: 'embedding_compact',
        inputPer1M: 0.01,
        outputPer1M: 0,
        dimensions: 384,
        maxTokens: 512,
        providers: ['hf-inference'],
        notes: '384-dim lightweight BGE embedding model.'
    },
    'Qwen/Qwen3-Embedding-0.6B': {
        role: 'embedding_alternative',
        inputPer1M: 0.01,
        outputPer1M: 0,
        dimensions: 1024,
        maxTokens: 32768,
        providers: ['deepinfra'],
        notes: '1024-dim Qwen3 embedding model (live via deepinfra; hf-inference status=error).'
    },
    'intfloat/multilingual-e5-large-instruct': {
        role: 'embedding_multilingual',
        inputPer1M: 0.01,
        outputPer1M: 0,
        dimensions: 1024,
        maxTokens: 514,
        providers: ['hf-inference', 'deepinfra'],
        notes: '1024-dim multilingual instruct embedding model.'
    }
};

function stripModelRoutingSuffix(modelId) {
    return String(modelId || '').split(':')[0].trim();
}

function redactSecrets(input) {
    return String(input || '')
        .replace(/\bhf_[A-Za-z0-9]{10,}\b/g, 'hf_[REDACTED]')
        .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, 'sk-[REDACTED]')
        .replace(/\bAIza[A-Za-z0-9_-]{15,}\b/g, 'AIza[REDACTED]')
        .replace(/Bearer\s+[A-Za-z0-9._-]{10,}/gi, 'Bearer [REDACTED]');
}

function estimateCostUsd(modelId, promptTokens = 0, completionTokens = 0) {
    const baseId = stripModelRoutingSuffix(modelId);
    const entry = CHECKED_HF_MODEL_CATALOG[baseId];
    if (!entry) return 0;
    const inCost = (Math.max(0, Number(promptTokens) || 0) / 1_000_000) * (entry.inputPer1M || 0);
    const outCost = (Math.max(0, Number(completionTokens) || 0) / 1_000_000) * (entry.outputPer1M || 0);
    return Number((inCost + outCost).toFixed(7));
}

function getUtcDateKey() {
    return new Date().toISOString().slice(0, 10);
}

const runtimeState = {
    startedAt: new Date().toISOString(),
    dayKey: getUtcDateKey(),
    daily: {
        externalRequests: 0,
        totalTokens: 0
    },
    totals: {
        totalRequests: 0,
        externalApiCalls: 0,
        chatCalls: 0,
        embeddingCalls: 0,
        cacheHits: 0,
        memoryCacheHits: 0,
        dbCacheHits: 0,
        deduplicatedHits: 0,
        fallbackCalls: 0,
        errors: 0,
        rateLimitErrors: 0,
        timeoutErrors: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0
    },
    byModel: {},
    byProvider: {},
    byOperation: {},
    recentEvents: []
};

function rollDayIfNeeded() {
    const today = getUtcDateKey();
    if (runtimeState.dayKey !== today) {
        runtimeState.dayKey = today;
        runtimeState.daily = { externalRequests: 0, totalTokens: 0 };
    }
}

function getBudgetConfig() {
    return {
        dailyRequestLimit: Math.max(0, parseInt(process.env.AI_DAILY_REQUEST_LIMIT || '0', 10) || 0),
        dailyTokenLimit: Math.max(0, parseInt(process.env.AI_DAILY_TOKEN_LIMIT || '0', 10) || 0)
    };
}

/**
 * Enforce optional daily request & token caps before issuing external HF/AI requests.
 */
function checkDailyBudget() {
    rollDayIfNeeded();
    const { dailyRequestLimit, dailyTokenLimit } = getBudgetConfig();
    if (dailyRequestLimit > 0 && runtimeState.daily.externalRequests >= dailyRequestLimit) {
        const err = new Error(`Daily AI request budget reached (${dailyRequestLimit} requests/day). Please try again tomorrow or increase AI_DAILY_REQUEST_LIMIT.`);
        err.status = 429;
        err.code = 'DAILY_REQUEST_LIMIT_EXCEEDED';
        throw err;
    }
    if (dailyTokenLimit > 0 && runtimeState.daily.totalTokens >= dailyTokenLimit) {
        const err = new Error(`Daily AI token budget reached (${dailyTokenLimit} tokens/day). Please try again tomorrow or increase AI_DAILY_TOKEN_LIMIT.`);
        err.status = 429;
        err.code = 'DAILY_TOKEN_LIMIT_EXCEEDED';
        throw err;
    }
}

function bumpBucket(map, key, { requests = 0, tokens = 0, cost = 0, errors = 0, cacheHits = 0 }) {
    if (!key) return;
    if (!map[key]) {
        map[key] = { requests: 0, tokens: 0, estimatedCostUsd: 0, errors: 0, cacheHits: 0 };
    }
    map[key].requests += requests;
    map[key].tokens += tokens;
    map[key].estimatedCostUsd = Number((map[key].estimatedCostUsd + cost).toFixed(7));
    map[key].errors += errors;
    map[key].cacheHits += cacheHits;
}

/**
 * Record an AI operation (live call, cache hit, fallback, or error) without blocking the caller.
 */
function recordAiEvent({
    operation = 'chat',
    provider = '',
    model = '',
    cached = false,
    cacheLayer = '',
    fallbackUsed = false,
    promptTokens = 0,
    completionTokens = 0,
    totalTokens = 0,
    latencyMs = 0,
    status = 'ok',
    errorMessage = '',
    errorStatus = null
}) {
    rollDayIfNeeded();

    const pTokens = Math.max(0, Number(promptTokens) || 0);
    const cTokens = Math.max(0, Number(completionTokens) || 0);
    const tTokens = Math.max(pTokens + cTokens, Number(totalTokens) || 0);
    const cost = cached ? 0 : estimateCostUsd(model, pTokens, cTokens);

    runtimeState.totals.totalRequests += 1;

    if (cached) {
        runtimeState.totals.cacheHits += 1;
        if (cacheLayer === 'memory') runtimeState.totals.memoryCacheHits += 1;
        if (cacheLayer === 'db') runtimeState.totals.dbCacheHits += 1;
        if (cacheLayer === 'deduplicated') runtimeState.totals.deduplicatedHits += 1;
    } else {
        runtimeState.totals.externalApiCalls += 1;
        runtimeState.daily.externalRequests += 1;
        if (operation === 'embed_book' || operation === 'embed_query' || operation === 'embedding') {
            runtimeState.totals.embeddingCalls += 1;
        } else {
            runtimeState.totals.chatCalls += 1;
        }
    }

    if (fallbackUsed) runtimeState.totals.fallbackCalls += 1;
    if (status === 'error') {
        runtimeState.totals.errors += 1;
        if (errorStatus === 429) runtimeState.totals.rateLimitErrors += 1;
        if (errorStatus === 504 || /timeout|timed out|abort/i.test(errorMessage)) {
            runtimeState.totals.timeoutErrors += 1;
        }
    }

    runtimeState.totals.promptTokens += pTokens;
    runtimeState.totals.completionTokens += cTokens;
    runtimeState.totals.totalTokens += tTokens;
    runtimeState.daily.totalTokens += tTokens;
    runtimeState.totals.estimatedCostUsd = Number((runtimeState.totals.estimatedCostUsd + cost).toFixed(7));

    const cleanModel = stripModelRoutingSuffix(model) || 'unknown';
    bumpBucket(runtimeState.byModel, cleanModel, {
        requests: 1,
        tokens: tTokens,
        cost,
        errors: status === 'error' ? 1 : 0,
        cacheHits: cached ? 1 : 0
    });
    bumpBucket(runtimeState.byProvider, provider || 'unknown', {
        requests: 1,
        tokens: tTokens,
        cost,
        errors: status === 'error' ? 1 : 0,
        cacheHits: cached ? 1 : 0
    });
    bumpBucket(runtimeState.byOperation, operation, {
        requests: 1,
        tokens: tTokens,
        cost,
        errors: status === 'error' ? 1 : 0,
        cacheHits: cached ? 1 : 0
    });

    const sanitizedEvent = {
        timestamp: new Date().toISOString(),
        operation,
        provider: provider || 'unknown',
        model: model || '',
        cached: Boolean(cached),
        cacheLayer: cacheLayer || '',
        fallbackUsed: Boolean(fallbackUsed),
        promptTokens: pTokens,
        completionTokens: cTokens,
        totalTokens: tTokens,
        estimatedCostUsd: cost,
        latencyMs: Math.max(0, Math.round(Number(latencyMs) || 0)),
        status,
        ...(status === 'error' && errorMessage ? { error: redactSecrets(errorMessage).slice(0, 220) } : {})
    };

    runtimeState.recentEvents.unshift(sanitizedEvent);
    if (runtimeState.recentEvents.length > 50) {
        runtimeState.recentEvents.length = 50;
    }

    // Best-effort non-migrating MongoDB telemetry persistence for serverless visibility across invocations
    if (process.env.NODE_ENV !== 'test' && typeof prisma?.$runCommandRaw === 'function') {
        prisma.$runCommandRaw({
            insert: 'ai_usage_logs',
            documents: [{
                ...sanitizedEvent,
                dayKey: runtimeState.dayKey,
                createdAt: new Date()
            }]
        }).catch(() => {});
    }

    return sanitizedEvent;
}

/**
 * Aggregate runtime + persistent MongoDB usage stats for Admin AI Controls.
 */
async function getUsageSummary() {
    rollDayIfNeeded();
    const budget = getBudgetConfig();

    const total = runtimeState.totals.totalRequests;
    const cacheHitRate = total > 0
        ? Number(((runtimeState.totals.cacheHits / total) * 100).toFixed(1))
        : 0;

    let persistentDbStats = {
        cachedVerificationsCount: 0,
        totalVerificationRequests: 0,
        indexedBooksCount: 0,
        totalIndexedChunks: 0,
        loggedApiEventsCount: 0,
        persistentTokensTotal: 0,
        persistentEstimatedCostUsd: 0
    };

    const hasDbUri = Boolean(String(process.env.MONGODB_URI || '').trim());

    try {
        if ((hasDbUri || process.env.NODE_ENV !== 'test') && typeof prisma?.questionVerification?.findMany === 'function') {
            const [verifications, books] = await Promise.all([
                prisma.questionVerification.findMany({
                    select: { requestCount: true }
                }),
                typeof prisma?.knowledgeBook?.findMany === 'function'
                    ? prisma.knowledgeBook.findMany({
                        select: { indexedChunks: true, processingStatus: true }
                    })
                    : Promise.resolve([])
            ]);

            persistentDbStats.cachedVerificationsCount = verifications.length;
            persistentDbStats.totalVerificationRequests = verifications.reduce(
                (sum, r) => sum + (Number(r.requestCount) || 1),
                0
            );
            persistentDbStats.indexedBooksCount = books.filter(b => b.processingStatus === 'Completed').length;
            persistentDbStats.totalIndexedChunks = books.reduce(
                (sum, b) => sum + (Number(b.indexedChunks) || 0),
                0
            );
        }

        if (process.env.NODE_ENV !== 'test' && typeof prisma?.$runCommandRaw === 'function') {
            const agg = await prisma.$runCommandRaw({
                aggregate: 'ai_usage_logs',
                pipeline: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            tokens: { $sum: { $ifNull: ['$totalTokens', 0] } },
                            cost: { $sum: { $ifNull: ['$estimatedCostUsd', 0] } }
                        }
                    }
                ],
                cursor: {}
            }).catch(() => null);
            const firstBatch = agg?.cursor?.firstBatch;
            if (Array.isArray(firstBatch) && firstBatch[0]) {
                persistentDbStats.loggedApiEventsCount = Number(firstBatch[0].count) || 0;
                persistentDbStats.persistentTokensTotal = Number(firstBatch[0].tokens) || 0;
                persistentDbStats.persistentEstimatedCostUsd = Number((Number(firstBatch[0].cost) || 0).toFixed(6));
            }
        }
    } catch {
        // Keep runtime stats even if DB query is unavailable
    }

    return {
        startedAt: runtimeState.startedAt,
        dayKey: runtimeState.dayKey,
        dailyUsage: {
            ...runtimeState.daily,
            requestLimit: budget.dailyRequestLimit,
            tokenLimit: budget.dailyTokenLimit
        },
        totals: {
            ...runtimeState.totals,
            cacheHitRatePercent: cacheHitRate
        },
        byModel: runtimeState.byModel,
        byProvider: runtimeState.byProvider,
        byOperation: runtimeState.byOperation,
        recentEvents: runtimeState.recentEvents.slice(0, 25),
        persistentDbStats,
        pricingCatalog: CHECKED_HF_MODEL_CATALOG
    };
}

function resetRuntimeUsageForTests() {
    runtimeState.startedAt = new Date().toISOString();
    runtimeState.dayKey = getUtcDateKey();
    runtimeState.daily = { externalRequests: 0, totalTokens: 0 };
    runtimeState.totals = {
        totalRequests: 0,
        externalApiCalls: 0,
        chatCalls: 0,
        embeddingCalls: 0,
        cacheHits: 0,
        memoryCacheHits: 0,
        dbCacheHits: 0,
        deduplicatedHits: 0,
        fallbackCalls: 0,
        errors: 0,
        rateLimitErrors: 0,
        timeoutErrors: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0
    };
    runtimeState.byModel = {};
    runtimeState.byProvider = {};
    runtimeState.byOperation = {};
    runtimeState.recentEvents = [];
}

module.exports = {
    CHECKED_HF_MODEL_CATALOG,
    stripModelRoutingSuffix,
    redactSecrets,
    estimateCostUsd,
    checkDailyBudget,
    recordAiEvent,
    getUsageSummary,
    resetRuntimeUsageForTests
};
