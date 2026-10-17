const prisma = require('../_config/prisma');

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
                    if (evaluateAnswerCorrectness(userSelection, q)) {
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
                    if (evaluateAnswerCorrectness(userSelection, q)) {
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
                    if (evaluateAnswerCorrectness(userSelection, q)) {
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

Attempt.evaluateAnswerCorrectness = evaluateAnswerCorrectness;
module.exports = Attempt;
