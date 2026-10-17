const prisma = require('../_config/prisma');

function normalizeAnswer(val) {
    return String(val || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
}

function parseSafeJson(str, fallback) {
    if (!str) return fallback;
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

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
            status
        } = data;

        const existing = await prisma.quizAttempt.findFirst({
            where: {
                id: String(id),
                userId: String(userId)
            }
        });

        if (!existing) return null;
        if (existing.status === 'completed') {
            return existing; // Cannot modify already completed attempt
        }

        const existingAnswers = parseSafeJson(existing.answers, {});
        const incomingAnswers = parseSafeJson(answers, answers || {});

        // Strict requirement: An already-recorded answer cannot be overwritten during the same attempt
        const mergedAnswers = { ...existingAnswers };
        if (incomingAnswers && typeof incomingAnswers === 'object') {
            for (const [qId, incomingVal] of Object.entries(incomingAnswers)) {
                if (mergedAnswers[qId] === undefined || mergedAnswers[qId] === null) {
                    mergedAnswers[qId] = incomingVal;
                }
            }
        }

        // Validate scoring authoritatively on backend
        const snapshot = parseSafeJson(existing.questionsSnapshot, []);
        let computedScore = 0;
        const answerKeys = Object.keys(mergedAnswers);

        if (Array.isArray(snapshot) && snapshot.length > 0) {
            snapshot.forEach(q => {
                const userSelection = mergedAnswers[q.id || q._id];
                if (userSelection !== undefined && userSelection !== null) {
                    let opts = q.options;
                    if (typeof opts === 'string') {
                        try { opts = JSON.parse(opts); } catch { opts = []; }
                    }
                    let chosenText = '';
                    if (typeof userSelection === 'number' && Array.isArray(opts) && opts[userSelection] !== undefined) {
                        chosenText = String(opts[userSelection]);
                    } else if (userSelection && typeof userSelection === 'object' && typeof userSelection.selectedIndex === 'number' && Array.isArray(opts)) {
                        chosenText = String(opts[userSelection.selectedIndex]);
                    } else {
                        chosenText = String(userSelection || '');
                    }
                    const correct = q.correct_answer || q.correctAnswer || '';
                    if (normalizeAnswer(chosenText) === normalizeAnswer(correct)) {
                        computedScore++;
                    }
                }
            });
        } else if (answerKeys.length > 0) {
            const dbQuestions = await prisma.question.findMany({
                where: { id: { in: answerKeys } }
            });
            dbQuestions.forEach(q => {
                const userSelection = mergedAnswers[q.id];
                if (userSelection !== undefined && userSelection !== null) {
                    let opts = q.options;
                    if (typeof opts === 'string') {
                        try { opts = JSON.parse(opts); } catch { opts = []; }
                    }
                    let chosenText = '';
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
        }

        const totalQ = existing.totalQuestions || (Array.isArray(snapshot) ? snapshot.length : answerKeys.length);
        const computedAnsweredCount = answerKeys.length;
        const computedProgressPercent = totalQ > 0 ? Math.round((computedAnsweredCount / totalQ) * 100) : 0;

        const updateData = {
            answers: JSON.stringify(mergedAnswers),
            score: computedScore,
            answeredCount: computedAnsweredCount,
            progressPercentage: computedProgressPercent,
            lastSavedAt: new Date()
        };

        if (currentQuestionIndex !== undefined) {
            updateData.currentQuestionIndex = parseInt(currentQuestionIndex, 10) || 0;
        }
        if (flaggedQuestions !== undefined) {
            updateData.flaggedQuestions = typeof flaggedQuestions === 'string' ? flaggedQuestions : JSON.stringify(flaggedQuestions);
        }
        if (status && status !== 'completed') {
            updateData.status = status;
        }

        await prisma.quizAttempt.update({
            where: { id: String(id) },
            data: updateData
        });

        return await prisma.quizAttempt.findUnique({ where: { id: String(id) } });
    },

    /**
     * Mark attempt as completed
     */
    complete: async (id, userId, data = {}) => {
        const existing = await prisma.quizAttempt.findFirst({
            where: {
                id: String(id),
                userId: String(userId)
            }
        });
        if (!existing) return null;
        if (existing.status === 'completed') {
            return existing;
        }

        const existingAnswers = parseSafeJson(existing.answers, {});
        const incomingAnswers = parseSafeJson(data.answers, data.answers || {});

        const mergedAnswers = { ...existingAnswers };
        if (incomingAnswers && typeof incomingAnswers === 'object') {
            for (const [qId, incomingVal] of Object.entries(incomingAnswers)) {
                if (mergedAnswers[qId] === undefined || mergedAnswers[qId] === null) {
                    mergedAnswers[qId] = incomingVal;
                }
            }
        }

        const snapshot = parseSafeJson(existing.questionsSnapshot, []);
        let computedScore = 0;
        const answerKeys = Object.keys(mergedAnswers);

        if (Array.isArray(snapshot) && snapshot.length > 0) {
            snapshot.forEach(q => {
                const userSelection = mergedAnswers[q.id || q._id];
                if (userSelection !== undefined && userSelection !== null) {
                    let opts = q.options;
                    if (typeof opts === 'string') {
                        try { opts = JSON.parse(opts); } catch { opts = []; }
                    }
                    let chosenText = '';
                    if (typeof userSelection === 'number' && Array.isArray(opts) && opts[userSelection] !== undefined) {
                        chosenText = String(opts[userSelection]);
                    } else if (userSelection && typeof userSelection === 'object' && typeof userSelection.selectedIndex === 'number' && Array.isArray(opts)) {
                        chosenText = String(opts[userSelection.selectedIndex]);
                    } else {
                        chosenText = String(userSelection || '');
                    }
                    const correct = q.correct_answer || q.correctAnswer || '';
                    if (normalizeAnswer(chosenText) === normalizeAnswer(correct)) {
                        computedScore++;
                    }
                }
            });
        }

        const totalQ = existing.totalQuestions || (Array.isArray(snapshot) ? snapshot.length : answerKeys.length);
        const computedAnsweredCount = answerKeys.length;
        const computedProgressPercent = totalQ > 0 ? Math.round((computedAnsweredCount / totalQ) * 100) : 0;

        await prisma.quizAttempt.update({
            where: { id: String(id) },
            data: {
                status: 'completed',
                answers: JSON.stringify(mergedAnswers),
                score: computedScore,
                answeredCount: computedAnsweredCount,
                progressPercentage: computedProgressPercent,
                completedAt: new Date(),
                lastSavedAt: new Date()
            }
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
