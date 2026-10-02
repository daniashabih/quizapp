const prisma = require('../_config/prisma');
const Setting = require('../_models/settingModel');
const Attempt = require('../_models/attemptModel');

function normalizeAnswer(val) {
    return String(val || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
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

            let computedScore = 0;
            let computedTotal = 0;

            const answerKeys = Object.keys(answers || {});

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

                computedTotal = questionMap.size > 0 ? questionMap.size : answerKeys.length;

                answerKeys.forEach(qId => {
                    const q = questionMap.get(qId);
                    if (q) {
                        const userSelection = answers[qId];
                        let chosenText = '';

                        let opts = q.options;
                        if (typeof opts === 'string') {
                            try { opts = JSON.parse(opts); } catch { opts = []; }
                        }

                        if (typeof userSelection === 'number' && Array.isArray(opts) && opts[userSelection] !== undefined) {
                            chosenText = String(opts[userSelection]);
                        } else {
                            chosenText = String(userSelection || '');
                        }

                        if (normalizeAnswer(chosenText) === normalizeAnswer(q.correctAnswer)) {
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

module.exports = quizController;
