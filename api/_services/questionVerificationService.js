const prisma = require('../_config/prisma');
const Question = require('../_models/questionModel');
const { normalizeTechnology, resolveQuestionTechnologies } = require('../_utils/ragTechnology');
const {
    generateEmbeddings,
    evaluateQuestionWithEvidence,
    formatConciseExplanation,
    getActiveProviderInfo,
    getDetailedProviderInfo
} = require('./aiProviderService');
const { recordAiEvent } = require('./aiUsageService');
const {
    searchRelevantBookChunks,
    searchRelevantBookChunksByText
} = require('./vectorSearchService');
const { getKnowledgeBaseVersion, PROCESSING_STATUSES } = require('./bookProcessingService');
const { sha256 } = require('./bookExtractorService');

const VALID_VERIFICATION_STATUSES = new Set([
    'verified',
    'incorrect',
    'ambiguous',
    'insufficient_evidence'
]);

// In-flight deduplication map to prevent duplicate concurrent AI calls for the exact same question
const inFlightVerifications = new Map();

function normalizeOptionsList(options) {
    if (Array.isArray(options)) {
        return options.map(o => String(o ?? '').trim()).filter(Boolean);
    }
    if (typeof options === 'string') {
        try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) {
                return parsed.map(o => String(o ?? '').trim()).filter(Boolean);
            }
        } catch {
            return options.split(',').map(s => s.trim()).filter(Boolean);
        }
    }
    return [];
}

function normalizeTextForCache(str) {
    return String(str || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

/**
 * Resolve stored correct answer to an actual option string if stored as A/B/C/D or index
 */
function resolveAnswerText(options, rawAnswer) {
    const trimmed = String(rawAnswer || '').trim();
    if (!trimmed || !Array.isArray(options) || options.length === 0) return trimmed;

    const exact = options.find(o => o.trim() === trimmed);
    if (exact) return exact;

    const lower = trimmed.toLowerCase();
    const ci = options.find(o => o.trim().toLowerCase() === lower);
    if (ci) return ci;

    if (/^[a-d]$/i.test(trimmed)) {
        const idx = trimmed.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < options.length) return options[idx];
    }

    if (/^\d+$/.test(trimmed)) {
        const idx = parseInt(trimmed, 10);
        if (idx >= 0 && idx < options.length) return options[idx];
    }

    return trimmed;
}

function buildCacheKey({ questionText, options, originalCorrectAnswer, technologyNormalized, kbVersion }) {
    const payload = JSON.stringify({
        q: normalizeTextForCache(questionText),
        o: options.map(normalizeTextForCache),
        a: normalizeTextForCache(originalCorrectAnswer),
        t: technologyNormalized,
        kb: kbVersion
    });
    return sha256(payload);
}

/**
 * Append beginner-friendly feedback tailored to the user's selected answer (without breaking shared cache)
 */
function personalizeExplanationForUserSelection(baseResult, userSelectedAnswer, options) {
    const cleanSelected = resolveAnswerText(options, userSelectedAnswer);
    if (!cleanSelected || baseResult.verification_status === 'insufficient_evidence') {
        return baseResult;
    }

    const baseExplanation = String(baseResult.explanation || '').trim();
    const verifiedAns = String(baseResult.verified_correct_answer || '').trim();
    const alreadyMentionsSelection = baseExplanation.toLowerCase().includes('your selected answer');
    if (alreadyMentionsSelection) {
        return { ...baseResult, user_selected_answer: cleanSelected };
    }

    let selectionLine = '';
    if (baseResult.verification_status === 'ambiguous') {
        selectionLine = `Your selected answer ("${cleanSelected}") may be partially valid because the reference book indicates multiple options could apply to this wording.`;
    } else if (verifiedAns && normalizeTextForCache(cleanSelected) === normalizeTextForCache(verifiedAns)) {
        selectionLine = `Your selected answer ("${cleanSelected}") is correct according to the reference book.`;
    } else if (verifiedAns) {
        selectionLine = `Your selected answer ("${cleanSelected}") is incorrect because the reference book confirms "${verifiedAns}" as the right answer.`;
    }

    return {
        ...baseResult,
        user_selected_answer: cleanSelected,
        explanation: selectionLine ? `${baseExplanation}\n${selectionLine}` : baseExplanation
    };
}

/**
 * Strictly validate and ground AI verification output against retrieved book chunks.
 * Guarantees the AI NEVER invents book titles, authors, chapters, page numbers, or quotations.
 */
function groundVerificationResult({
    rawAiResult,
    evidenceChunks,
    originalCorrectAnswer,
    options
}) {
    let status = String(rawAiResult?.status ?? rawAiResult?.verification_status ?? '').trim().toLowerCase();
    if (status === 'correct') {
        status = 'verified';
    }
    if (!VALID_VERIFICATION_STATUSES.has(status)) {
        status = 'insufficient_evidence';
    }

    // Never claim verified/incorrect/ambiguous without actual retrieved book evidence
    if (!Array.isArray(evidenceChunks) || evidenceChunks.length === 0) {
        status = 'insufficient_evidence';
    }

    const rawSourceBook = rawAiResult?.sourceBook ?? rawAiResult?.source_book ?? '';
    const rawReason = String(rawAiResult?.reason ?? rawAiResult?.issue_description ?? '').trim();

    // Find the best matching retrieved chunk cited by the AI (or fall back to top-scoring retrieved chunk)
    let matchedChunk = evidenceChunks[0] || null;
    if (rawSourceBook && evidenceChunks.length > 1) {
        const targetBook = normalizeTextForCache(rawSourceBook);
        const found = evidenceChunks.find(c =>
            normalizeTextForCache(c.bookTitle) === targetBook ||
            normalizeTextForCache(c.bookTitle).includes(targetBook) ||
            targetBook.includes(normalizeTextForCache(c.bookTitle))
        );
        if (found) matchedChunk = found;
    }

    if (status === 'insufficient_evidence' || !matchedChunk) {
        const fallbackExplanation = formatConciseExplanation(rawAiResult?.explanation) ||
            'The uploaded reference books for this technology do not contain enough specific information to verify this question reliably.\nNo answer was guessed outside the uploaded book evidence.\nAsk an administrator to upload an additional reference textbook covering this topic.';
        return {
            verification_status: 'insufficient_evidence',
            original_correct_answer: originalCorrectAnswer,
            verified_correct_answer: '',
            explanation: fallbackExplanation,
            source_book: '',
            source_author: '',
            source_chapter: '',
            source_page: '',
            supporting_excerpt: '',
            issue_description: rawReason || 'Insufficient reference book coverage for this question.',
            suggested_correction: '',
            confidence: Math.min(0.4, Math.max(0, Number(rawAiResult?.confidence) || 0.2))
        };
    }

    // Ground verified_correct_answer to an actual option in the question
    const rawVerifiedAnswer = rawAiResult?.verifiedAnswer ?? rawAiResult?.verified_correct_answer ?? '';
    let verifiedAnswer = resolveAnswerText(options, rawVerifiedAnswer);
    const matchesOriginal = Boolean(
        verifiedAnswer &&
        originalCorrectAnswer &&
        normalizeTextForCache(verifiedAnswer) === normalizeTextForCache(originalCorrectAnswer)
    );
    const matchesProvidedOption = Boolean(
        verifiedAnswer &&
        Array.isArray(options) &&
        options.some(o => normalizeTextForCache(o) === normalizeTextForCache(verifiedAnswer))
    );

    if (status === 'verified' && !verifiedAnswer) {
        verifiedAnswer = originalCorrectAnswer;
    } else if (status === 'verified' && matchesProvidedOption && !matchesOriginal) {
        status = 'incorrect';
    }
    if (status === 'incorrect' && matchesOriginal) {
        status = 'verified';
    }

    // Ground supporting excerpt to actual text from retrieved chunks (never fabricated quotes)
    let excerpt = String(rawAiResult?.supportingExcerpt ?? rawAiResult?.supporting_excerpt ?? '').trim();
    const allChunkTextNorm = evidenceChunks.map(c => normalizeTextForCache(c.chunkText)).join(' ');
    if (excerpt) {
        const probe = normalizeTextForCache(excerpt).slice(0, 48);
        if (probe.length < 12 || !allChunkTextNorm.includes(probe)) {
            // Replace non-verbatim quote with actual excerpt from matchedChunk
            excerpt = matchedChunk.chunkText.slice(0, 340).trim();
        }
    } else {
        excerpt = matchedChunk.chunkText.slice(0, 340).trim();
    }

    const confidenceNum = Number(rawAiResult?.confidence);
    const boundedConfidence = Number.isFinite(confidenceNum)
        ? Number(Math.min(1, Math.max(0, confidenceNum)).toFixed(2))
        : Number(Math.min(0.95, Math.max(0.5, matchedChunk.score || 0.75)).toFixed(2));

    const explanation = formatConciseExplanation(rawAiResult?.explanation) ||
        `According to "${matchedChunk.bookTitle}", the correct answer is "${verifiedAnswer || originalCorrectAnswer}".\nReview the cited chapter and page excerpt below for the reference book definition.`;

    const resolvedPage = (matchedChunk.pageNumber !== null && matchedChunk.pageNumber !== undefined && Number(matchedChunk.pageNumber) > 0)
        ? String(matchedChunk.pageNumber)
        : '';

    return {
        verification_status: status,
        original_correct_answer: originalCorrectAnswer,
        verified_correct_answer: verifiedAnswer,
        explanation,
        // Strictly sourced from verified DB chunk metadata — NEVER hallucinated by LLM
        source_book: matchedChunk.bookTitle,
        source_author: matchedChunk.author,
        source_chapter: matchedChunk.chapter || 'General Reference',
        source_page: resolvedPage,
        supporting_excerpt: excerpt,
        issue_description: status === 'verified'
            ? ''
            : (rawReason ||
                (status === 'incorrect'
                    ? `Database answer "${originalCorrectAnswer}" conflicts with reference book evidence supporting "${verifiedAnswer}".`
                    : 'Multiple options may be valid or the question wording is ambiguous based on the reference book.')),
        suggested_correction: status === 'verified'
            ? ''
            : (String(rawAiResult?.suggested_correction || '').trim() ||
                (status === 'incorrect' && verifiedAnswer
                    ? `Update the database correct answer from "${originalCorrectAnswer}" to "${verifiedAnswer}".`
                    : 'Clarify the question wording or answer options so only one answer matches the textbook definition.')),
        confidence: boundedConfidence
    };
}

function formatVerificationResponse(record) {
    const internalStatus = record.verificationStatus || 'insufficient_evidence';
    const externalStatus = internalStatus === 'verified' ? 'correct' : internalStatus;
    const reasonText = internalStatus === 'verified'
        ? ''
        : (record.issueDescription || (internalStatus === 'insufficient_evidence' ? record.explanation : ''));

    return {
        id: record.id,
        question_id: record.questionId || '',
        technology: record.technology,
        // Structured JSON fields
        status: externalStatus,
        verifiedAnswer: record.verifiedCorrectAnswer || '',
        explanation: record.explanation,
        confidence: typeof record.confidence === 'number' ? record.confidence : 0,
        sourceBook: record.sourceBook || '',
        chapter: record.sourceChapter || '',
        page: record.sourcePage || '',
        supportingExcerpt: record.supportingExcerpt || '',
        reason: reasonText,
        // Legacy / DB-aligned fields preserved for full compatibility
        verification_status: internalStatus,
        original_correct_answer: record.originalCorrectAnswer,
        verified_correct_answer: record.verifiedCorrectAnswer || '',
        source_book: record.sourceBook || '',
        source_author: record.sourceAuthor || '',
        source_chapter: record.sourceChapter || '',
        source_page: record.sourcePage || '',
        supporting_excerpt: record.supportingExcerpt || '',
        issue_description: record.issueDescription || '',
        suggested_correction: record.suggestedCorrection || '',
        review_status: record.reviewStatus || 'pending',
        updated_at: record.updatedAt || record.createdAt
    };
}

/**
 * Main RAG Question Verification entry point
 */
async function verifyQuestionWithBooks({
    questionId = '',
    questionText,
    options,
    correctAnswer,
    technology,
    category,
    userSelectedAnswer = '',
    bypassCache = false
}) {
    const cleanTechnology = String(technology || category || '').trim();
    let cleanQuestionText = String(questionText || '').trim();
    let cleanOptions = normalizeOptionsList(options);
    let cleanCorrectAnswer = String(correctAnswer || '').trim();

    // If questionId is a MongoDB ObjectId, enrich authoritative question data from DB
    if (questionId && /^[0-9a-fA-F]{24}$/.test(String(questionId))) {
        try {
            const dbQuestion = await prisma.question.findUnique({
                where: { id: String(questionId) }
            });
            if (dbQuestion) {
                if (!cleanQuestionText) cleanQuestionText = dbQuestion.questionText;
                if (cleanOptions.length === 0) cleanOptions = normalizeOptionsList(dbQuestion.options);
                if (!cleanCorrectAnswer) cleanCorrectAnswer = dbQuestion.correctAnswer;
            }
        } catch {
            // Continue with request payload
        }
    }

    if (!cleanQuestionText) {
        const err = new Error('questionText is required for verification.');
        err.status = 400;
        throw err;
    }
    if (cleanQuestionText.length > 4000) {
        const err = new Error('questionText exceeds maximum allowed length (4000 characters).');
        err.status = 400;
        throw err;
    }
    if (cleanOptions.length < 2 || cleanOptions.length > 10) {
        const err = new Error('Between 2 and 10 answer options are required for verification.');
        err.status = 400;
        throw err;
    }
    if (!cleanTechnology || cleanTechnology.length > 120) {
        const err = new Error('A valid technology/category is required for verification.');
        err.status = 400;
        throw err;
    }

    cleanCorrectAnswer = resolveAnswerText(cleanOptions, cleanCorrectAnswer);
    const technologiesNormalized = resolveQuestionTechnologies(cleanTechnology, cleanQuestionText);
    const primaryTechNorm = technologiesNormalized[0] || normalizeTechnology(cleanTechnology);

    // Compute active knowledge-base version for cache key
    const kbVersion = await getKnowledgeBaseVersion(technologiesNormalized);

    // Check if there are any active completed books for this technology BEFORE invoking AI
    if (kbVersion === 'kb_empty') {
        const cacheKey = buildCacheKey({
            questionText: cleanQuestionText,
            options: cleanOptions,
            originalCorrectAnswer: cleanCorrectAnswer,
            technologyNormalized: primaryTechNorm,
            kbVersion
        });

        const insufficientPayload = {
            verification_status: 'insufficient_evidence',
            original_correct_answer: cleanCorrectAnswer,
            verified_correct_answer: '',
            explanation: `No active indexed reference books are currently available for ${cleanTechnology}. Hangbug only verifies answers using admin-uploaded textbooks rather than guessing. Ask an administrator to upload a ${cleanTechnology} reference book in AI Knowledge Base.`,
            source_book: '',
            source_author: '',
            source_chapter: '',
            source_page: '',
            supporting_excerpt: '',
            issue_description: `No active indexed reference books found for "${cleanTechnology}".`,
            suggested_correction: '',
            confidence: 0
        };

        const saved = await prisma.questionVerification.upsert({
            where: { cacheKey },
            update: {
                requestCount: { increment: 1 },
                lastRequestedAt: new Date()
            },
            create: {
                cacheKey,
                questionId: String(questionId || ''),
                technology: cleanTechnology,
                technologyNormalized: primaryTechNorm,
                questionText: cleanQuestionText,
                options: JSON.stringify(cleanOptions),
                originalCorrectAnswer: cleanCorrectAnswer,
                verifiedCorrectAnswer: '',
                verificationStatus: 'insufficient_evidence',
                explanation: insufficientPayload.explanation,
                sourceBook: '',
                sourceAuthor: '',
                sourceChapter: '',
                sourcePage: '',
                supportingExcerpt: '',
                issueDescription: insufficientPayload.issue_description,
                suggestedCorrection: '',
                confidence: 0,
                knowledgeBaseVersion: kbVersion,
                retrievedChunkIds: []
            }
        });

        return {
            cached: false,
            searchMode: 'no_active_books',
            provider: getActiveProviderInfo().provider,
            model: '',
            latencyMs: 0,
            verification: personalizeExplanationForUserSelection(
                formatVerificationResponse(saved),
                userSelectedAnswer,
                cleanOptions
            )
        };
    }

    const activeProvider = getActiveProviderInfo();
    const cacheKey = buildCacheKey({
        questionText: cleanQuestionText,
        options: cleanOptions,
        originalCorrectAnswer: cleanCorrectAnswer,
        technologyNormalized: primaryTechNorm,
        kbVersion
    });

    // 1. Check cache first to minimize AI API cost and latency
    if (!bypassCache) {
        const cachedRecord = await prisma.questionVerification.findUnique({
            where: { cacheKey }
        });
        if (cachedRecord) {
            await prisma.questionVerification.update({
                where: { id: cachedRecord.id },
                data: {
                    requestCount: { increment: 1 },
                    lastRequestedAt: new Date()
                }
            }).catch(() => {});

            recordAiEvent({
                operation: 'verify_question',
                provider: activeProvider.provider,
                model: activeProvider.verificationModel,
                cached: true,
                cacheLayer: 'db',
                latencyMs: 0
            });

            return {
                cached: true,
                searchMode: 'cache',
                provider: activeProvider.provider,
                model: activeProvider.verificationModel,
                latencyMs: 0,
                verification: personalizeExplanationForUserSelection(
                    formatVerificationResponse(cachedRecord),
                    userSelectedAnswer,
                    cleanOptions
                )
            };
        }
    }

    // 2. Deduplicate concurrent in-flight verification requests for the exact same cacheKey
    if (inFlightVerifications.has(cacheKey)) {
        const sharedResult = await inFlightVerifications.get(cacheKey);
        recordAiEvent({
            operation: 'verify_question',
            provider: sharedResult.provider || activeProvider.provider,
            model: sharedResult.model || activeProvider.verificationModel,
            cached: true,
            cacheLayer: 'deduplicated',
            latencyMs: 0
        });
        return {
            cached: true,
            deduplicated: true,
            searchMode: sharedResult.searchMode,
            provider: sharedResult.provider || activeProvider.provider,
            model: sharedResult.model || activeProvider.verificationModel,
            latencyMs: 0,
            verification: personalizeExplanationForUserSelection(
                sharedResult.verification,
                userSelectedAnswer,
                cleanOptions
            )
        };
    }

    const verificationPromise = (async () => {
        const startedAt = Date.now();
        const detailedProvider = getDetailedProviderInfo();
        if (!detailedProvider.chatConfigured) {
            const err = new Error('AI verification provider is not configured on the server.');
            err.status = 503;
            err.code = 'AI_PROVIDER_UNCONFIGURED';
            throw err;
        }

        let searchResult;
        if (detailedProvider.embeddingConfigured) {
            // 3. Embed question + options for semantic vector retrieval
            const queryText = [
                `Technology: ${cleanTechnology}`,
                `Question: ${cleanQuestionText}`,
                `Options: ${cleanOptions.join(' | ')}`
            ].join('\n');

            const [queryEmbedding] = await generateEmbeddings([queryText], {
                taskType: 'RETRIEVAL_QUERY',
                operation: 'embed_query'
            });

            // 4. Semantic search across active books for this technology via MongoDB Atlas Vector Search
            searchResult = await searchRelevantBookChunks({
                queryEmbedding,
                technologiesNormalized,
                limit: 6,
                minScore: parseFloat(process.env.VECTOR_SEARCH_MIN_SCORE || '0.25') || 0.25
            });
        } else {
            // Fallback retrieval over existing MongoDB chunks when only Groq chat is configured (no embedding API key)
            searchResult = await searchRelevantBookChunksByText({
                questionText: cleanQuestionText,
                options: cleanOptions,
                technologiesNormalized,
                limit: 6
            });
        }

        const evidenceChunks = searchResult.chunks || [];
        let grounded;
        let aiMeta = {
            provider: detailedProvider.chatProvider || activeProvider.provider,
            modelUsed: ''
        };

        if (evidenceChunks.length === 0) {
            grounded = groundVerificationResult({
                rawAiResult: {
                    status: 'insufficient_evidence',
                    reason: `No relevant passages found in uploaded ${cleanTechnology} reference books for this question.`,
                    confidence: 0.1
                },
                evidenceChunks: [],
                originalCorrectAnswer: cleanCorrectAnswer,
                options: cleanOptions
            });
        } else {
            // 5. Independently evaluate question against retrieved book evidence
            const rawAi = await evaluateQuestionWithEvidence({
                questionText: cleanQuestionText,
                options: cleanOptions,
                originalCorrectAnswer: cleanCorrectAnswer,
                technology: cleanTechnology,
                evidenceChunks
            });

            if (rawAi?._meta) {
                aiMeta = {
                    provider: rawAi._meta.provider || detailedProvider.chatProvider || activeProvider.provider,
                    modelUsed: rawAi._meta.modelUsed || detailedProvider.verificationModel || activeProvider.verificationModel
                };
            } else {
                aiMeta.modelUsed = detailedProvider.verificationModel || activeProvider.verificationModel;
            }

            // 6. Strictly ground citations & status against retrieved chunks
            grounded = groundVerificationResult({
                rawAiResult: rawAi,
                evidenceChunks,
                originalCorrectAnswer: cleanCorrectAnswer,
                options: cleanOptions
            });
        }

        // 7. Persist verification result for caching & Admin Verification Reports
        const saved = await prisma.questionVerification.upsert({
            where: { cacheKey },
            update: {
                verifiedCorrectAnswer: grounded.verified_correct_answer,
                verificationStatus: grounded.verification_status,
                explanation: grounded.explanation,
                sourceBook: grounded.source_book,
                sourceAuthor: grounded.source_author,
                sourceChapter: grounded.source_chapter,
                sourcePage: grounded.source_page,
                supportingExcerpt: grounded.supporting_excerpt,
                issueDescription: grounded.issue_description,
                suggestedCorrection: grounded.suggested_correction,
                confidence: grounded.confidence,
                retrievedChunkIds: evidenceChunks.map(c => c.id),
                requestCount: { increment: 1 },
                lastRequestedAt: new Date()
            },
            create: {
                cacheKey,
                questionId: String(questionId || ''),
                technology: cleanTechnology,
                technologyNormalized: primaryTechNorm,
                questionText: cleanQuestionText,
                options: JSON.stringify(cleanOptions),
                originalCorrectAnswer: grounded.original_correct_answer,
                verifiedCorrectAnswer: grounded.verified_correct_answer,
                verificationStatus: grounded.verification_status,
                explanation: grounded.explanation,
                sourceBook: grounded.source_book,
                sourceAuthor: grounded.source_author,
                sourceChapter: grounded.source_chapter,
                sourcePage: grounded.source_page,
                supportingExcerpt: grounded.supporting_excerpt,
                issueDescription: grounded.issue_description,
                suggestedCorrection: grounded.suggested_correction,
                confidence: grounded.confidence,
                knowledgeBaseVersion: kbVersion,
                retrievedChunkIds: evidenceChunks.map(c => c.id),
                reviewStatus: grounded.verification_status === 'verified' ? 'approved' : 'pending'
            }
        });

        return {
            searchMode: searchResult.searchMode,
            provider: aiMeta.provider,
            model: aiMeta.modelUsed,
            latencyMs: Date.now() - startedAt,
            verification: formatVerificationResponse(saved)
        };
    })();

    inFlightVerifications.set(cacheKey, verificationPromise);
    try {
        const result = await verificationPromise;
        return {
            cached: false,
            searchMode: result.searchMode,
            provider: result.provider,
            model: result.model,
            latencyMs: result.latencyMs,
            verification: personalizeExplanationForUserSelection(
                result.verification,
                userSelectedAnswer,
                cleanOptions
            )
        };
    } finally {
        inFlightVerifications.delete(cacheKey);
    }
}

/**
 * Admin approval workflow: explicitly approves a correction, updates the Question record in MongoDB,
 * and saves a permanent audit entry in QuestionCorrectionHistory.
 */
async function approveVerificationCorrection({
    reportId,
    correctedAnswer,
    correctedExplanation,
    notes = '',
    adminUser
}) {
    const cleanReportId = String(reportId || '').trim();
    if (!/^[0-9a-fA-F]{24}$/.test(cleanReportId)) {
        const err = new Error('Invalid verification report ID.');
        err.status = 400;
        throw err;
    }

    const report = await prisma.questionVerification.findUnique({ where: { id: cleanReportId } });
    if (!report) {
        const err = new Error('Verification report not found.');
        err.status = 404;
        throw err;
    }

    const parsedOptions = normalizeOptionsList(report.options);
    const chosenAnswer = resolveAnswerText(
        parsedOptions,
        correctedAnswer || report.verifiedCorrectAnswer
    );

    if (!chosenAnswer) {
        const err = new Error('A valid corrected answer must be provided before approving.');
        err.status = 400;
        throw err;
    }

    if (parsedOptions.length > 0 && !parsedOptions.some(o => normalizeTextForCache(o) === normalizeTextForCache(chosenAnswer))) {
        const err = new Error('Corrected answer must match one of the question options.');
        err.status = 400;
        throw err;
    }

    // Locate the target question in MongoDB (by questionId or fallback by category + normalized question text)
    let targetQuestion = null;
    if (report.questionId && /^[0-9a-fA-F]{24}$/.test(report.questionId)) {
        targetQuestion = await prisma.question.findUnique({
            where: { id: report.questionId }
        });
    }
    if (!targetQuestion) {
        targetQuestion = await Question.findDuplicate({
            category: report.technology,
            question_text: report.questionText
        });
        if (targetQuestion && /^[0-9a-fA-F]{24}$/.test(String(targetQuestion.id))) {
            targetQuestion = await prisma.question.findUnique({
                where: { id: String(targetQuestion.id) }
            });
        } else {
            targetQuestion = null;
        }
    }

    if (!targetQuestion) {
        const err = new Error('Original question record not found in MongoDB questions collection.');
        err.status = 404;
        throw err;
    }

    const previousAnswer = targetQuestion.correctAnswer;
    const previousExplanation = targetQuestion.explanation || '';
    const nextExplanation = correctedExplanation !== undefined && String(correctedExplanation).trim() !== ''
        ? String(correctedExplanation).trim()
        : (report.explanation || previousExplanation);

    // 1. Update original question in MongoDB
    await prisma.question.update({
        where: { id: targetQuestion.id },
        data: {
            correctAnswer: chosenAnswer,
            explanation: nextExplanation
        }
    });

    // 2. Maintain full audit history of previous answers and approved changes
    const historyEntry = await prisma.questionCorrectionHistory.create({
        data: {
            questionId: targetQuestion.id,
            verificationId: report.id,
            technology: targetQuestion.category || report.technology,
            questionText: targetQuestion.questionText,
            previousCorrectAnswer: previousAnswer,
            newCorrectAnswer: chosenAnswer,
            previousExplanation,
            newExplanation: nextExplanation,
            sourceBook: report.sourceBook || '',
            sourceChapter: report.sourceChapter || '',
            sourcePage: report.sourcePage || '',
            approvedBy: String(adminUser?.name || adminUser?.id || 'Admin'),
            approvedByEmail: String(adminUser?.email || ''),
            notes: String(notes || '').trim()
        }
    });

    // 3. Mark verification report as approved
    const updatedReport = await prisma.questionVerification.update({
        where: { id: report.id },
        data: {
            questionId: targetQuestion.id,
            verifiedCorrectAnswer: chosenAnswer,
            reviewStatus: 'approved',
            reviewedBy: String(adminUser?.name || adminUser?.email || 'Admin'),
            reviewedAt: new Date(),
            reviewNotes: String(notes || '').trim()
        }
    });

    return {
        report: updatedReport,
        historyEntry,
        updatedQuestionId: targetQuestion.id
    };
}

module.exports = {
    VALID_VERIFICATION_STATUSES,
    buildCacheKey,
    resolveAnswerText,
    groundVerificationResult,
    verifyQuestionWithBooks,
    approveVerificationCorrection
};
