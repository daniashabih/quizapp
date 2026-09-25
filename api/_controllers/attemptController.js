const Attempt = require('../_models/attemptModel');

function parseSafeJson(str, fallback) {
    if (!str) return fallback;
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

function formatAttempt(att) {
    if (!att) return null;
    return {
        id: att.id,
        userId: att.userId,
        category: att.category,
        session: att.session || 1,
        currentQuestionIndex: att.currentQuestionIndex || 0,
        answers: parseSafeJson(att.answers, {}),
        flaggedQuestions: parseSafeJson(att.flaggedQuestions, []),
        questionsSnapshot: parseSafeJson(att.questionsSnapshot, []),
        score: att.score || 0,
        totalQuestions: att.totalQuestions || 0,
        answeredCount: att.answeredCount || 0,
        progressPercentage: att.progressPercentage || 0,
        status: att.status || 'in_progress',
        startedAt: att.startedAt,
        lastSavedAt: att.lastSavedAt,
        completedAt: att.completedAt
    };
}

const attemptController = {
    /**
     * POST /api/attempts/start
     * Start a new attempt or return an existing in_progress attempt
     */
    startOrResumeAttempt: async (req, res) => {
        try {
            const userId = req.user.id;
            const { category, session, questionsSnapshot, totalQuestions, forceNew, checkOnly } = req.body;

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Category is required to start a quiz attempt.'
                });
            }

            const sessionNum = session === 'all' || session === 'All' ? 0 : (parseInt(session, 10) || 1);

            // If checkOnly requested, return active attempt without creating a new record
            if (checkOnly) {
                const existing = await Attempt.findActiveAttempt(userId, category, sessionNum);
                return res.status(200).json({
                    success: true,
                    hasActiveAttempt: !!existing,
                    isResumed: !!existing,
                    attempt: existing ? formatAttempt(existing) : null
                });
            }

            // Check if active in_progress attempt already exists
            if (!forceNew) {
                const existing = await Attempt.findActiveAttempt(userId, category, sessionNum);
                if (existing) {
                    return res.status(200).json({
                        success: true,
                        isResumed: true,
                        attempt: formatAttempt(existing)
                    });
                }
            }

            // Create new attempt
            const newAttempt = await Attempt.create({
                userId,
                category,
                session: sessionNum,
                questionsSnapshot: questionsSnapshot || [],
                totalQuestions: totalQuestions || (Array.isArray(questionsSnapshot) ? questionsSnapshot.length : 0)
            });

            return res.status(201).json({
                success: true,
                isResumed: false,
                attempt: formatAttempt(newAttempt)
            });
        } catch (error) {
            console.error('❌ Error in startOrResumeAttempt:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize quiz attempt',
                error: error.message
            });
        }
    },

    /**
     * GET /api/attempts/in-progress
     * Fetch all in-progress attempts for user dashboard
     */
    getInProgressAttempts: async (req, res) => {
        try {
            const userId = req.user.id;
            const attempts = await Attempt.findInProgressByUserId(userId);

            const formatted = attempts.map(att => ({
                id: att.id,
                category: att.category,
                session: att.session || 1,
                currentQuestionIndex: att.currentQuestionIndex || 0,
                answeredCount: att.answeredCount || Object.keys(parseSafeJson(att.answers, {})).length,
                totalQuestions: att.totalQuestions || 0,
                progressPercentage: att.progressPercentage || 0,
                startedAt: att.startedAt,
                lastSavedAt: att.lastSavedAt
            }));

            res.status(200).json({
                success: true,
                data: formatted
            });
        } catch (error) {
            console.error('❌ Error fetching in-progress attempts:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch in-progress quizzes',
                error: error.message
            });
        }
    },

    /**
     * GET /api/attempts/:id
     * Fetch full attempt data to resume
     */
    getAttemptById: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const attempt = await Attempt.findById(id, userId);
            if (!attempt) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found or unauthorized.'
                });
            }

            res.status(200).json({
                success: true,
                attempt: formatAttempt(attempt)
            });
        } catch (error) {
            console.error('❌ Error fetching attempt by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch attempt details',
                error: error.message
            });
        }
    },

    /**
     * PUT /api/attempts/:id
     * Auto-save / Manual Save quiz progress
     */
    updateAttemptProgress: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const {
                currentQuestionIndex,
                answers,
                flaggedQuestions,
                score,
                answeredCount,
                progressPercentage,
                status
            } = req.body;

            const updated = await Attempt.updateProgress(id, userId, {
                currentQuestionIndex,
                answers,
                flaggedQuestions,
                score,
                answeredCount,
                progressPercentage,
                status
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found or cannot be updated.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Quiz progress saved successfully.',
                lastSavedAt: updated.lastSavedAt,
                attempt: formatAttempt(updated)
            });
        } catch (error) {
            console.error('❌ Error updating attempt progress:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save quiz progress',
                error: error.message
            });
        }
    },

    /**
     * POST /api/attempts/:id/complete
     * Mark attempt as completed upon final quiz submission
     */
    completeAttempt: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { score, answeredCount, progressPercentage, answers } = req.body;

            const completed = await Attempt.complete(id, userId, {
                score,
                answeredCount,
                progressPercentage,
                answers
            });

            if (!completed) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Quiz attempt marked as completed.',
                attempt: formatAttempt(completed)
            });
        } catch (error) {
            console.error('❌ Error completing attempt:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to complete quiz attempt',
                error: error.message
            });
        }
    },

    /**
     * DELETE /api/attempts/:id
     * Discard / delete an unfinished attempt
     */
    discardAttempt: async (req, res) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const deleted = await Attempt.discard(id, userId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found or already deleted.'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Quiz attempt discarded successfully.'
            });
        } catch (error) {
            console.error('❌ Error discarding attempt:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to discard quiz attempt',
                error: error.message
            });
        }
    }
};

module.exports = attemptController;
