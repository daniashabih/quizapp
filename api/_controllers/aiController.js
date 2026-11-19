const Question = require('../_models/questionModel');
const prisma = require('../_config/prisma');
const {
    getRuntimeSettings,
    getActiveProviderInfo,
    getDetailedProviderInfo,
    fetchGroqModels,
    resolveAndValidateGroqModel,
    getGroqBaseUrl,
    GROQ_PREFERRED_MODELS,
    generateQuizQuestions,
    testAiIntegration,
    clearInMemoryAiCache,
    getMemoryCacheStats
} = require('../_services/aiProviderService');
const { getUsageSummary, redactSecrets } = require('../_services/aiUsageService');
const { getAtlasVectorIndexDefinition, VECTOR_INDEX_NAME } = require('../_services/vectorSearchService');
const { verifyQuestionWithBooks } = require('../_services/questionVerificationService');
const { PROCESSING_STATUSES } = require('../_services/bookProcessingService');

/**
 * POST /api/questions/generate (Admin)
 * Generate MCQs using the configured server AI provider.
 */
const generateQuestions = async (req, res) => {
    try {
        const { topic, count = 5, session = 1 } = req.body || {};
        const cleanTopic = String(topic || '').trim();
        const sessionNum = Math.max(1, parseInt(session, 10) || 1);

        if (!cleanTopic) {
            return res.status(400).json({ message: 'Topic is required.' });
        }

        const providerInfo = getActiveProviderInfo();
        if (!providerInfo.configured) {
            return res.status(503).json({
                message: 'AI provider is not configured on the server.'
            });
        }

        const generated = await generateQuizQuestions({
            topic: cleanTopic,
            count,
            session: sessionNum
        });

        const questions = Array.isArray(generated.questions) ? generated.questions : [];
        const savedIds = [];
        const seenNorm = new Set();
        let skippedDuplicates = 0;

        for (const q of questions) {
            const targetCategory = q.category || cleanTopic;
            const normText = Question.normalizeQuestionText(q.question_text);
            if (!normText || seenNorm.has(normText)) {
                skippedDuplicates++;
                continue;
            }
            const existingDuplicate = await Question.findDuplicate({
                category: targetCategory,
                question_text: q.question_text
            });
            if (existingDuplicate) {
                skippedDuplicates++;
                continue;
            }
            const id = await Question.create({
                ...q,
                category: targetCategory,
                session: sessionNum
            });
            seenNorm.add(normText);
            savedIds.push(id);
        }

        res.json({
            message: skippedDuplicates > 0
                ? `Successfully generated ${savedIds.length} questions (${skippedDuplicates} duplicate(s) skipped)`
                : `Successfully generated ${savedIds.length} questions`,
            count: savedIds.length,
            skipped: skippedDuplicates,
            provider: generated.provider,
            model: generated.modelUsed
        });
    } catch (error) {
        const safeMessage = redactSecrets(error?.message || 'Failed to generate questions. Check AI configuration or try again.');
        console.error('AI Generation Error:', safeMessage);
        if (error?.retryAfterSeconds) {
            res.set('Retry-After', String(error.retryAfterSeconds));
        }
        const status = error?.status && error.status !== 401 && error.status !== 403 ? error.status : 500;
        res.status(status).json({
            message: safeMessage,
            ...(error?.code ? { code: error.code } : {})
        });
    }
};

/**
 * GET /api/admin/ai/status
 * Inspect active AI configuration (never tokens), vector index & usage overview.
 */
const getAiStatus = async (req, res) => {
    try {
        const providerInfo = getActiveProviderInfo();
        const detailedProvider = getDetailedProviderInfo();
        const runtime = getRuntimeSettings();

        const [usage, activeBooks] = await Promise.all([
            getUsageSummary(),
            prisma.knowledgeBook.findMany({
                where: {
                    processingStatus: PROCESSING_STATUSES.COMPLETED
                },
                select: {
                    id: true,
                    title: true,
                    technology: true,
                    embeddingModel: true,
                    embeddingDimensions: true,
                    isEnabled: true
                }
            }).catch(() => [])
        ]);

        let modelValidation = null;
        if (detailedProvider.chatProvider === 'groq') {
            try {
                const resolved = await resolveAndValidateGroqModel(detailedProvider.verificationModel, { forceRefresh: false });
                modelValidation = {
                    valid: true,
                    validated: resolved.validated,
                    resolvedModel: resolved.modelId,
                    availableChatModelsCount: resolved.availableModels.length
                };
            } catch (valErr) {
                modelValidation = {
                    valid: false,
                    validated: true,
                    resolvedModel: detailedProvider.verificationModel,
                    error: redactSecrets(valErr?.message || 'Groq model validation failed.')
                };
            }
        }

        const dimensionMismatchBooks = activeBooks.filter(
            b => b.embeddingDimensions && b.embeddingDimensions !== providerInfo.embeddingDimensions
        );

        res.json({
            success: true,
            aiProvider: providerInfo,
            providers: {
                chatProvider: detailedProvider.chatProvider,
                embeddingProvider: detailedProvider.embeddingProvider,
                chatConfigured: detailedProvider.chatConfigured,
                embeddingConfigured: detailedProvider.embeddingConfigured,
                groqBaseUrl: detailedProvider.chatProvider === 'groq' ? detailedProvider.groqBaseUrl : ''
            },
            ...(modelValidation ? { modelValidation } : {}),
            config: {
                chatModel: providerInfo.verificationModel || '',
                embeddingModel: providerInfo.embeddingModel || '',
                embeddingDimensions: providerInfo.embeddingDimensions,
                timeoutMs: runtime.timeoutMs,
                maxRetries: runtime.maxRetries,
                cacheTtlMs: runtime.cacheTtlMs,
                verifyRateLimitMax: parseInt(process.env.AI_VERIFY_RATE_LIMIT_MAX || '40', 10) || 40,
                adminTestRateLimitMax: parseInt(process.env.AI_ADMIN_TEST_RATE_LIMIT_MAX || '30', 10) || 30,
                vectorSearchMinScore: parseFloat(process.env.VECTOR_SEARCH_MIN_SCORE || '0.25') || 0.25
            },
            vectorIndex: {
                name: VECTOR_INDEX_NAME,
                collection: 'knowledge_book_chunks',
                dimensions: providerInfo.embeddingDimensions,
                definition: getAtlasVectorIndexDefinition(providerInfo.embeddingDimensions),
                dimensionMismatchCount: dimensionMismatchBooks.length,
                dimensionMismatchBooks: dimensionMismatchBooks.map(b => ({
                    id: b.id,
                    title: b.title,
                    technology: b.technology,
                    embeddingModel: b.embeddingModel,
                    embeddingDimensions: b.embeddingDimensions
                }))
            },
            cache: getMemoryCacheStats(),
            usage
        });
    } catch (err) {
        const safeMessage = redactSecrets(err?.message || 'Failed to load AI status.');
        console.error('[Admin AI Status Error]:', safeMessage);
        res.status(500).json({ success: false, message: safeMessage });
    }
};

/**
 * GET /api/admin/ai/models
 * Retrieve and validate available Groq models from `https://api.groq.com/openai/v1/models`.
 */
const getAiModels = async (req, res) => {
    try {
        const forceRefresh = String(req.query?.refresh || '') === '1' || String(req.query?.refresh || '').toLowerCase() === 'true';
        const detailed = getDetailedProviderInfo();

        if (!detailed.groqConfigured && detailed.chatProvider !== 'groq') {
            return res.json({
                success: true,
                provider: detailed.chatProvider || detailed.provider,
                configuredModel: detailed.verificationModel || '',
                resolvedModel: detailed.verificationModel || '',
                modelValid: Boolean(detailed.verificationModel),
                recommendedModels: GROQ_PREFERRED_MODELS,
                models: [],
                message: 'Live model catalog endpoint is active for Groq when GROQ_API_KEY is configured.'
            });
        }

        const catalog = await fetchGroqModels({ forceRefresh });
        let modelValid = true;
        let validationError = '';
        let resolvedModel = detailed.verificationModel;

        try {
            const check = await resolveAndValidateGroqModel(detailed.groqConfiguredModel || '', { forceRefresh: false });
            resolvedModel = check.modelId;
        } catch (err) {
            modelValid = false;
            validationError = redactSecrets(err?.message || 'Configured Groq model is unavailable.');
        }

        res.json({
            success: true,
            provider: 'groq',
            baseUrl: getGroqBaseUrl(),
            configuredModel: detailed.groqConfiguredModel || resolvedModel,
            resolvedModel,
            modelValid,
            ...(validationError ? { validationError } : {}),
            recommendedModels: GROQ_PREFERRED_MODELS,
            cached: catalog.cached,
            fetchedAt: catalog.fetchedAt,
            models: catalog.chatModels
        });
    } catch (err) {
        const safeMessage = redactSecrets(err?.message || 'Failed to fetch AI models.');
        console.error('[Admin AI Models Error]:', safeMessage);
        if (err?.retryAfterSeconds) {
            res.set('Retry-After', String(err.retryAfterSeconds));
        }
        const status = err?.status && err.status !== 401 && err.status !== 403 ? err.status : 502;
        res.status(status).json({
            success: false,
            message: safeMessage,
            ...(err?.code ? { code: err.code } : {})
        });
    }
};

/**
 * GET /api/admin/ai/usage
 */
const getAiUsage = async (req, res) => {
    try {
        const usage = await getUsageSummary();
        res.json({
            success: true,
            aiProvider: getActiveProviderInfo(),
            cache: getMemoryCacheStats(),
            usage
        });
    } catch (err) {
        console.error('[Admin AI Usage Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to load AI usage metrics.' });
    }
};

/**
 * POST /api/admin/ai/test
 * Test configured server AI chat, embedding, or book-grounded RAG verification.
 */
const testAiModels = async (req, res) => {
    try {
        const {
            mode = 'chat',
            prompt = '',
            model = '',
            questionText = '',
            options = [],
            correctAnswer = '',
            technology = 'HTML',
            bypassCache = true
        } = req.body || {};

        const cleanMode = String(mode || 'chat').trim().toLowerCase();
        if (!['chat', 'embedding', 'verification', 'models'].includes(cleanMode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid test mode. Supported modes: chat, embedding, verification, models.'
            });
        }

        if (cleanMode === 'verification') {
            const qText = String(questionText || prompt || '').trim();
            const qOpts = Array.isArray(options) && options.length >= 2
                ? options
                : ['<section>', '<div>', '<span>', '<header>'];
            const qAns = String(correctAnswer || qOpts[0]).trim();
            const result = await verifyQuestionWithBooks({
                questionText: qText,
                options: qOpts,
                correctAnswer: qAns,
                technology: String(technology || 'HTML').trim(),
                bypassCache: Boolean(bypassCache)
            });
            return res.json({
                success: true,
                mode: 'verification',
                ...result
            });
        }

        const result = await testAiIntegration({
            mode: cleanMode,
            prompt,
            model: String(model || '').trim().slice(0, 120)
        });

        res.json({
            success: true,
            result
        });
    } catch (err) {
        const safeMessage = redactSecrets(err?.message || 'AI diagnostic test failed.');
        console.error('[Admin AI Test Error]:', safeMessage);
        if (err?.retryAfterSeconds) {
            res.set('Retry-After', String(err.retryAfterSeconds));
        }
        const status = err?.status && err.status !== 401 && err.status !== 403 ? err.status : 500;
        res.status(status).json({
            success: false,
            message: safeMessage,
            ...(err?.code ? { code: err.code } : {})
        });
    }
};

/**
 * POST /api/admin/ai/cache/clear
 */
const clearAiCache = async (req, res) => {
    try {
        const cleared = clearInMemoryAiCache();
        res.json({
            success: true,
            message: `Cleared ${cleared.clearedEmbeddings} cached embeddings and ${cleared.clearedChats} cached completions from memory.`,
            ...cleared
        });
    } catch (err) {
        res.status(500).json({ success: false, message: redactSecrets(err?.message || 'Failed to clear AI cache.') });
    }
};

module.exports = {
    generateQuestions,
    getAiStatus,
    getAiModels,
    getAiUsage,
    testAiModels,
    clearAiCache
};
