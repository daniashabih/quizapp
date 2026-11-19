const prisma = require('../_config/prisma');

function redactSecrets(input) {
    let text = String(input || '')
        .replace(/\bgsk_[A-Za-z0-9_-]{10,}/g, 'gsk_[REDACTED]')
        .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, 'sk-[REDACTED]')
        .replace(/\bAIza[A-Za-z0-9_-]{15,}\b/g, 'AIza[REDACTED]')
        .replace(/Bearer\s+[A-Za-z0-9._-]{10,}/gi, 'Bearer [REDACTED]')
        .replace(/([?&]key=)[^&\s]+/gi, '$1[REDACTED]');

    for (const envKey of ['GROQ_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY']) {
        const secretVal = String(process.env[envKey] || '').trim();
        if (secretVal.length >= 8 && text.includes(secretVal)) {
            text = text.split(secretVal).join('[REDACTED]');
        }
    }
    return text;
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
        errors: 0,
        rateLimitErrors: 0,
        timeoutErrors: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
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
 * Enforce optional daily request & token caps before issuing external AI requests.
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

function bumpBucket(map, key, { requests = 0, tokens = 0, errors = 0, cacheHits = 0 }) {
    if (!key) return;
    if (!map[key]) {
        map[key] = { requests: 0, tokens: 0, errors: 0, cacheHits: 0 };
    }
    map[key].requests += requests;
    map[key].tokens += tokens;
    map[key].errors += errors;
    map[key].cacheHits += cacheHits;
}

/**
 * Record an AI operation (live call, cache hit, or error) without blocking the caller.
 */
function recordAiEvent({
    operation = 'chat',
    provider = '',
    model = '',
    cached = false,
    cacheLayer = '',
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

    const cleanModel = String(model || '').trim() || 'unknown';
    bumpBucket(runtimeState.byModel, cleanModel, {
        requests: 1,
        tokens: tTokens,
        errors: status === 'error' ? 1 : 0,
        cacheHits: cached ? 1 : 0
    });
    bumpBucket(runtimeState.byProvider, provider || 'unknown', {
        requests: 1,
        tokens: tTokens,
        errors: status === 'error' ? 1 : 0,
        cacheHits: cached ? 1 : 0
    });
    bumpBucket(runtimeState.byOperation, operation, {
        requests: 1,
        tokens: tTokens,
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
        promptTokens: pTokens,
        completionTokens: cTokens,
        totalTokens: tTokens,
        latencyMs: Math.max(0, Math.round(Number(latencyMs) || 0)),
        status,
        ...(status === 'error' && errorMessage ? { error: redactSecrets(errorMessage).slice(0, 220) } : {})
    };

    runtimeState.recentEvents.unshift(sanitizedEvent);
    if (runtimeState.recentEvents.length > 50) {
        runtimeState.recentEvents.length = 50;
    }

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
        persistentTokensTotal: 0
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
                            tokens: { $sum: { $ifNull: ['$totalTokens', 0] } }
                        }
                    }
                ],
                cursor: {}
            }).catch(() => null);
            const firstBatch = agg?.cursor?.firstBatch;
            if (Array.isArray(firstBatch) && firstBatch[0]) {
                persistentDbStats.loggedApiEventsCount = Number(firstBatch[0].count) || 0;
                persistentDbStats.persistentTokensTotal = Number(firstBatch[0].tokens) || 0;
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
        persistentDbStats
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
        errors: 0,
        rateLimitErrors: 0,
        timeoutErrors: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
    };
    runtimeState.byModel = {};
    runtimeState.byProvider = {};
    runtimeState.byOperation = {};
    runtimeState.recentEvents = [];
}

module.exports = {
    redactSecrets,
    checkDailyBudget,
    recordAiEvent,
    getUsageSummary,
    resetRuntimeUsageForTests
};
