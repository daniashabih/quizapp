const prisma = require('../_config/prisma');
const Setting = require('../_models/settingModel');
const Attempt = require('../_models/attemptModel');

function normalizeAnswer(val) {
    return String(val || '')
        .trim()
        .toLowerCase()
        .replace(/^[a-d\d][\)\.\:\-]\s*/i, '')
        .replace(/\[\s*correct\s*\]|\(\s*correct\s*\)|\*+$/i, '')
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Authoritatively evaluates whether user's selected option is correct
 * against the trusted question definition in MongoDB.
 * Rejects fabricated values, ignores client-supplied isCorrect/score,
 * and fails safely if correct answer is missing/invalid in database.
 */
function evaluateAnswerCorrectness(userSelection, question) {
    if (!question) return false;
    const rawCorrect = String(question.correct_answer || question.correctAnswer || '').trim();
    if (!rawCorrect) return false;

    let opts = question.options;
    if (typeof opts === 'string') {
        try { opts = JSON.parse(opts); } catch { opts = []; }
    }
    if (!Array.isArray(opts) || opts.length === 0) return false;

    // Resolve user's chosen index and text
    let userIdx = -1;
    let userText = '';

    if (typeof userSelection === 'number') {
        userIdx = userSelection;
        if (opts[userIdx] !== undefined) userText = String(opts[userIdx]);
    } else if (typeof userSelection === 'string' && /^\d+$/.test(userSelection.trim())) {
        const parsed = parseInt(userSelection.trim(), 10);
        if (parsed >= 0 && parsed < opts.length) {
            userIdx = parsed;
            userText = String(opts[userIdx]);
        } else {
            userText = userSelection.trim();
        }
    } else if (userSelection && typeof userSelection === 'object') {
        if (typeof userSelection.selectedIndex === 'number') {
            userIdx = userSelection.selectedIndex;
            if (opts[userIdx] !== undefined) userText = String(opts[userIdx]);
        }
        if (!userText && userSelection.text) {
            userText = String(userSelection.text);
        }
    } else {
        userText = String(userSelection || '').trim();
    }

    if (userIdx === -1 && userText) {
        userIdx = opts.findIndex(o => normalizeAnswer(o) === normalizeAnswer(userText));
    }

    // Determine correct option index from database source of truth
    let correctIdx = -1;

    // 1. Direct normalized text match
    for (let i = 0; i < opts.length; i++) {
        if (normalizeAnswer(opts[i]) === normalizeAnswer(rawCorrect)) {
            correctIdx = i;
            break;
        }
    }

    // 2. Letter match: 'A', 'B', 'C', 'D'
    if (correctIdx === -1 && /^[a-d]$/i.test(rawCorrect)) {
        const idx = rawCorrect.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < opts.length) {
            correctIdx = idx;
        }
    }

    // 3. Digit index match: '0', '1', '2', '3'
    if (correctIdx === -1 && /^\d+$/.test(rawCorrect)) {
        const digit = parseInt(rawCorrect, 10);
        if (digit >= 0 && digit < opts.length) {
            correctIdx = digit;
        }
    }

    // If correct answer could not be verified in options, fail safely
    if (correctIdx === -1) {
        return false;
    }

    // Compare index and normalized text
    if (userIdx !== -1 && userIdx === correctIdx) {
        return true;
    }

    if (userText && normalizeAnswer(userText) === normalizeAnswer(opts[correctIdx])) {
        return true;
    }

    return false;
}

const quizController = {
    /**
     * POST /api/quizzes/submit
     * Authoritative backend assessment evaluation
     */
    submitQuiz: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Authentication required' });
            }

            const {
                category,
                session = 1,
                answers = {},
                attemptId,
                score: legacyScore,
                total: legacyTotal,
                percentage: legacyPercentage
            } = req.body;

            if (!category) {
                return res.status(400).json({ success: false, message: 'Category is required' });
            }

            const sessionNum = session === 'all' || session === 'All' ? 0 : (parseInt(session, 10) || 1);

            // 1. Fetch Central Settings from MongoDB Atlas
            const settings = await Setting.get();
            const passingScore = settings.passingScore || 70;
            const certificatePassingScore = settings.certificatePassingScore || 80;
            const certificateEnabled = settings.certificateEnabled !== false;

            // 2. Prevent duplicate submission if attempt already completed
            if (attemptId) {
                const existingAttempt = await Attempt.findById(attemptId, userId);
                if (existingAttempt && existingAttempt.status === 'completed') {
                    const existingResult = await prisma.quizResult.findFirst({
                        where: {
                            userId: String(userId),
                            category: String(category).trim(),
                            session: sessionNum
                        },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (existingResult) {
                        const passed = existingResult.percentage >= passingScore;
                        const certificateEligible = certificateEnabled && (existingResult.percentage >= certificatePassingScore);
                        const certId = certificateEligible ? `HB-CERT-${existingResult.id.slice(-6).toUpperCase()}` : null;
                        const certData = certificateEligible ? {
                            id: certId,
                            resultId: existingResult.id,
                            category: String(category).trim(),
                            score: existingResult.percentage,
                            percentage: existingResult.percentage,
                            learnerName: req.user.name || 'Verified Learner',
                            date: new Date(existingResult.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                            verificationUrl: `https://hangbug.vercel.app/certificate/view?id=${certId}`
                        } : null;

                        return res.status(200).json({
                            success: true,
                            message: 'Quiz result retrieved (previously submitted).',
                            resultId: existingResult.id,
                            score: existingResult.score,
                            total: existingResult.total,
                            percentage: existingResult.percentage,
                            passed,
                            passingScore,
                            certificateEligible,
                            certificatePassingScore,
                            certificateId: certId,
                            certificate: certData
                        });
                    }
                }
            }

            // 3. Merge locked answers from attempt if available
            let effectiveAnswers = { ...(answers || {}) };
            if (attemptId) {
                const attemptRecord = await Attempt.findById(attemptId, userId);
                if (attemptRecord) {
                    let attAnswers = attemptRecord.answers;
                    if (typeof attAnswers === 'string') {
                        try { attAnswers = JSON.parse(attAnswers); } catch { attAnswers = {}; }
                    }
                    if (attAnswers && typeof attAnswers === 'object') {
                        // Original recorded selections in attempt cannot be overwritten
                        effectiveAnswers = { ...effectiveAnswers, ...attAnswers };
                    }
                }
            }

            let computedScore = 0;
            let computedTotal = 0;

            const answerKeys = Object.keys(effectiveAnswers);

            if (answerKeys.length > 0) {
                // Fetch actual questions from database to evaluate authoritatively
                const questions = await prisma.question.findMany({
                    where: {
                        id: { in: answerKeys }
                    }
                });

                // Map by ID
                const questionMap = new Map();
                questions.forEach(q => questionMap.set(q.id, q));

                // If some questions were not found by ID (or IDs were numeric indexes), fallback to category query
                if (questions.length < answerKeys.length) {
                    const categoryQuery = {
                        category: { equals: String(category).trim(), mode: 'insensitive' }
                    };
                    if (sessionNum > 0) {
                        categoryQuery.session = sessionNum;
                    }
                    const catQuestions = await prisma.question.findMany({ where: categoryQuery });
                    catQuestions.forEach(q => questionMap.set(q.id, q));
                }

                // Determine total questions authoritatively
                const categoryQuery = {
                    category: { equals: String(category).trim(), mode: 'insensitive' }
                };
                if (sessionNum > 0) {
                    categoryQuery.session = sessionNum;
                }
                const totalInDb = await prisma.question.count({ where: categoryQuery });
                computedTotal = totalInDb > 0 ? totalInDb : (questionMap.size > 0 ? questionMap.size : answerKeys.length);

                answerKeys.forEach(qId => {
                    const q = questionMap.get(qId);
                    if (q) {
                        // Verify question belongs to active quiz category
                        if (category) {
                            const expectedCat = String(category).trim().toLowerCase();
                            const qCat = String(q.category || '').trim().toLowerCase();
                            if (qCat !== expectedCat && !qCat.includes(expectedCat) && !expectedCat.includes(qCat)) {
                                console.warn(`[Quiz Submit] Question ${qId} category mismatch: expected ${category}, got ${q.category}`);
                                return;
                            }
                        }

                        const userSelection = effectiveAnswers[qId];
                        if (evaluateAnswerCorrectness(userSelection, q)) {
                            computedScore++;
                        }
                    }
                });
            } else if (legacyScore !== undefined && legacyTotal !== undefined) {
                // Backward compatibility fallback for legacy client payload
                computedScore = parseInt(legacyScore, 10) || 0;
                computedTotal = parseInt(legacyTotal, 10) || 1;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz answers or result payload required for submission.'
                });
            }

            const computedPercentage = computedTotal > 0
                ? Math.round((computedScore / computedTotal) * 100)
                : (parseFloat(legacyPercentage) || 0);

            const passed = computedPercentage >= passingScore;
            const certificateEligible = certificateEnabled && (computedPercentage >= certificatePassingScore);

            // 2. Persist official result to MongoDB Atlas
            const result = await prisma.quizResult.create({
                data: {
                    userId: String(userId),
                    category: String(category).trim(),
                    session: sessionNum,
                    score: computedScore,
                    total: computedTotal,
                    percentage: computedPercentage
                }
            });

            // 3. Mark in_progress attempt as completed if attemptId provided
            if (attemptId) {
                await Attempt.complete(attemptId, userId, {
                    score: computedScore,
                    answeredCount: answerKeys.length,
                    progressPercentage: computedPercentage,
                    answers: typeof answers === 'string' ? answers : JSON.stringify(answers)
                }).catch(err => {
                    console.warn('[QuizController Warning] Could not mark attempt as complete:', err.message);
                });
            }

            const certId = certificateEligible
                ? `HB-CERT-${result.id.slice(-6).toUpperCase()}`
                : null;

            const certificateData = certificateEligible
                ? {
                    id: certId,
                    resultId: result.id,
                    category: String(category).trim(),
                    score: computedPercentage,
                    percentage: computedPercentage,
                    learnerName: req.user.name || 'Verified Learner',
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                    verificationUrl: `https://hangbug.vercel.app/certificate/view?id=${certId}`
                }
                : null;

            return res.status(201).json({
                success: true,
                message: passed ? 'Quiz passed successfully!' : 'Quiz completed.',
                resultId: result.id,
                score: computedScore,
                total: computedTotal,
                percentage: computedPercentage,
                passed,
                passingScore,
                certificateEligible,
                certificatePassingScore,
                certificateId: certId,
                certificate: certificateData
            });

        } catch (error) {
            console.error('[Submit Quiz Error]:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to evaluate and save quiz result',
                error: error.message
            });
        }
    }
};

quizController.evaluateAnswerCorrectness = evaluateAnswerCorrectness;
module.exports = quizController;
