const Question = require('../_models/questionModel');
const prisma = require('../_config/prisma');
const {
    getHfConfig,
    getActiveProviderInfo,
    generateQuizQuestions,
    inspectHuggingFaceModels,
    testAiIntegration,
    clearInMemoryAiCache,
    getMemoryCacheStats
} = require('../_services/aiProviderService');
const { getUsageSummary, CHECKED_HF_MODEL_CATALOG } = require('../_services/aiUsageService');
const { getAtlasVectorIndexDefinition, VECTOR_INDEX_NAME } = require('../_services/vectorSearchService');
const { verifyQuestionWithBooks } = require('../_services/questionVerificationService');
const { PROCESSING_STATUSES } = require('../_services/bookProcessingService');

/**
 * POST /api/questions/generate (Admin)
 * Generate MCQs using the reusable AI Provider Service (Hugging Face default).
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
                message: 'AI provider not configured. Set HF_TOKEN (recommended), OPENAI_API_KEY, or GEMINI_API_KEY on the server.'
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
            model: generated.modelUsed,
            fallbackUsed: Boolean(generated.fallbackUsed)
        });
    } catch (error) {
        console.error('AI Generation Error:', error.message);
        res.status(error.status || 500).json({
            message: error.message || 'Failed to generate questions. Check AI configuration or try again.'
        });
    }
};

/**
 * GET /api/admin/ai/status
 * Inspect active AI provider, configured models (never tokens), vector index & usage overview.
 */
const getAiStatus = async (req, res) => {
    try {
        const providerInfo = getActiveProviderInfo();
        const hfCfg = getHfConfig();

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

        const dimensionMismatchBooks = activeBooks.filter(
            b => b.embeddingDimensions && b.embeddingDimensions !== providerInfo.embeddingDimensions
        );

        res.json({
            success: true,
            aiProvider: providerInfo,
            config: {
                baseUrl: hfCfg.baseUrl,
                chatModel: providerInfo.verificationModel,
                fallbackChatModel: providerInfo.fallbackModel,
                embeddingModel: providerInfo.embeddingModel,
                embeddingProvider: hfCfg.embeddingProvider,
                embeddingFallbackProvider: hfCfg.embeddingFallbackProvider,
                embeddingDimensions: providerInfo.embeddingDimensions,
                timeoutMs: hfCfg.timeoutMs,
                maxRetries: hfCfg.maxRetries,
                cacheTtlMs: hfCfg.cacheTtlMs,
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
            usage,
            checkedModelCatalog: CHECKED_HF_MODEL_CATALOG
        });
    } catch (err) {
        console.error('[Admin AI Status Error]:', err);
        res.status(500).json({ success: false, message: err.message || 'Failed to load AI status.' });
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
 * GET /api/admin/ai/models/check
 * Live inspection of Hugging Face Inference Providers availability & pricing for configured models.
 */
const checkAiModels = async (req, res) => {
    try {
        const forceRefresh = String(req.query?.refresh || '') === 'true';
        const report = await inspectHuggingFaceModels({ forceRefresh });
        res.json({
            success: true,
            ...report
        });
    } catch (err) {
        console.error('[Admin AI Model Check Error]:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Failed to inspect Hugging Face model availability.'
        });
    }
};

/**
 * POST /api/admin/ai/test
 * Test configured Hugging Face chat model, fallback model, embedding model, or book-grounded verification.
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
            model
        });

        res.json({
            success: true,
            result
        });
    } catch (err) {
        console.error('[Admin AI Test Error]:', err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'AI diagnostic test failed.'
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
        res.status(500).json({ success: false, message: err.message || 'Failed to clear AI cache.' });
    }
};

module.exports = {
    generateQuestions,
    getAiStatus,
    getAiUsage,
    checkAiModels,
    testAiModels,
    clearAiCache
};
