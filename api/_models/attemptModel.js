const prisma = require('../_config/prisma');

const Attempt = {
    /**
     * Find active in_progress attempt for user and quiz (category + session)
     */
    findActiveAttempt: async (userId, category, session) => {
        const sessionNum = session === 'all' || session === 'All' ? 0 : (parseInt(session, 10) || 1);
        const attempt = await prisma.quizAttempt.findFirst({
            where: {
                userId: String(userId),
                category: String(category || '').trim(),
                session: sessionNum,
                status: 'in_progress'
            },
            orderBy: { lastSavedAt: 'desc' }
        });
        return attempt;
    },

    /**
     * Create a new attempt
     */
    create: async ({ userId, category, session, questionsSnapshot, totalQuestions }) => {
        const sessionNum = session === 'all' || session === 'All' ? 0 : (parseInt(session, 10) || 1);
        const newAttempt = await prisma.quizAttempt.create({
            data: {
                userId: String(userId),
                category: String(category || 'General').trim(),
                session: sessionNum,
                currentQuestionIndex: 0,
                answers: '{}',
                flaggedQuestions: '[]',
                questionsSnapshot: typeof questionsSnapshot === 'string' ? questionsSnapshot : JSON.stringify(questionsSnapshot || []),
                score: 0,
                totalQuestions: parseInt(totalQuestions, 10) || (Array.isArray(questionsSnapshot) ? questionsSnapshot.length : 0),
                answeredCount: 0,
                progressPercentage: 0,
                status: 'in_progress',
                startedAt: new Date(),
                lastSavedAt: new Date()
            }
        });
        return newAttempt;
    },

    /**
     * Find attempt by ID, verified by userId
     */
    findById: async (id, userId) => {
        const attempt = await prisma.quizAttempt.findFirst({
            where: {
                id: String(id),
                userId: String(userId)
            }
        });
        return attempt;
    },

    /**
     * Get all in-progress attempts for user
     */
    findInProgressByUserId: async (userId) => {
        const attempts = await prisma.quizAttempt.findMany({
            where: {
                userId: String(userId),
                status: 'in_progress'
            },
            orderBy: { lastSavedAt: 'desc' }
        });
        return attempts;
    },

    /**
     * Update progress of an attempt
     */
    updateProgress: async (id, userId, data) => {
        const {
            currentQuestionIndex,
            answers,
            flaggedQuestions,
            score,
            answeredCount,
            progressPercentage,
            status
        } = data;

        const updateData = {
            lastSavedAt: new Date()
        };

        if (currentQuestionIndex !== undefined) {
            updateData.currentQuestionIndex = parseInt(currentQuestionIndex, 10) || 0;
        }
        if (answers !== undefined) {
            updateData.answers = typeof answers === 'string' ? answers : JSON.stringify(answers);
        }
        if (flaggedQuestions !== undefined) {
            updateData.flaggedQuestions = typeof flaggedQuestions === 'string' ? flaggedQuestions : JSON.stringify(flaggedQuestions);
        }
        if (score !== undefined) {
            updateData.score = parseInt(score, 10) || 0;
        }
        if (answeredCount !== undefined) {
            updateData.answeredCount = parseInt(answeredCount, 10) || 0;
        }
        if (progressPercentage !== undefined) {
            updateData.progressPercentage = parseFloat(progressPercentage) || 0;
        }
        if (status) {
            updateData.status = status;
        }

        const updated = await prisma.quizAttempt.updateMany({
            where: {
                id: String(id),
                userId: String(userId)
            },
            data: updateData
        });

        if (updated.count === 0) {
            return null;
        }

        return await prisma.quizAttempt.findUnique({ where: { id: String(id) } });
    },

    /**
     * Mark attempt as completed
     */
    complete: async (id, userId, data = {}) => {
        const { score, answeredCount, progressPercentage, answers } = data;
        const updateData = {
            status: 'completed',
            completedAt: new Date(),
            lastSavedAt: new Date()
        };

        if (score !== undefined) updateData.score = parseInt(score, 10) || 0;
        if (answeredCount !== undefined) updateData.answeredCount = parseInt(answeredCount, 10) || 0;
        if (progressPercentage !== undefined) updateData.progressPercentage = parseFloat(progressPercentage) || 0;
        if (answers !== undefined) updateData.answers = typeof answers === 'string' ? answers : JSON.stringify(answers);

        await prisma.quizAttempt.updateMany({
            where: {
                id: String(id),
                userId: String(userId)
            },
            data: updateData
        });

        return await prisma.quizAttempt.findUnique({ where: { id: String(id) } });
    },

    /**
     * Discard / delete an unfinished attempt
     */
    discard: async (id, userId) => {
        const deleted = await prisma.quizAttempt.deleteMany({
            where: {
                id: String(id),
                userId: String(userId)
            }
        });
        return deleted.count > 0;
    }
};

module.exports = Attempt;
