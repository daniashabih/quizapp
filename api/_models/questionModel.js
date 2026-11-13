const prisma = require('../_config/prisma');
const { AGILE_DEVOPS_QUESTIONS, AGILE_DEVOPS_SESSIONS } = require('./agileDevopsQuestionsData');
const { CSHARP_QUIZ_QUESTIONS, CSHARP_QUIZ_SESSIONS } = require('./csharpQuizQuestionsData');

const parseOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') {
        try { return JSON.parse(opts); } catch { return []; }
    }
    return [];
};

const getCategoryVariations = (category) => {
    if (!category) return [];
    const clean = String(category).trim();
    const lower = clean.toLowerCase();
    if (lower === 'c#' || lower === 'csharp' || lower === 'c sharp') {
        return ['C#', 'csharp', 'c sharp', 'CSharp'];
    }
    const withAnd = clean.replace(/&/g, 'and');
    const withAmp = clean.replace(/\band\b/gi, '&');
    return Array.from(new Set([clean, withAnd, withAmp]));
};

const Question = {
    create: async (data) => {
        const { category, session, question_text, options, correct_answer, explanation } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const sessionNum = parseInt(session, 10) || 1;
        const result = await prisma.question.create({
            data: {
                category,
                session: sessionNum,
                questionText: question_text,
                options: serializedOptions,
                correctAnswer: correct_answer,
                explanation: explanation || ''
            }
        });
        return result.id;
    },

    getAll: async () => {
        let rows = [];
        try {
            rows = await prisma.question.findMany({
                orderBy: { createdAt: 'desc' }
            });
        } catch {
            // DB fallback
        }

        const existingIds = new Set(rows.map(r => r.id));
        const merged = rows.map(r => ({
            ...r,
            session: r.session || 1,
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            explanation: r.explanation || '',
            created_at: r.createdAt
        }));

        for (const q of AGILE_DEVOPS_QUESTIONS) {
            if (!existingIds.has(q.id)) {
                merged.push({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: q.sessionTitle,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                });
            }
        }

        for (const q of CSHARP_QUIZ_QUESTIONS) {
            if (!existingIds.has(q.id)) {
                merged.push({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: CSHARP_QUIZ_SESSIONS[q.session] || `Session ${q.session}`,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                });
            }
        }

        return merged;
    },

    getFiltered: async ({ category, session } = {}) => {
        let rows = [];
        try {
            const where = {};
            if (category) {
                const variations = getCategoryVariations(category);
                if (variations.length > 1) {
                    where.OR = variations.map(v => ({ category: { equals: v, mode: 'insensitive' } }));
                } else {
                    where.category = { equals: category, mode: 'insensitive' };
                }
            }
            if (session !== undefined && session !== null && session !== '' && session !== 'all' && !isNaN(parseInt(session, 10)) && parseInt(session, 10) > 0) {
                where.session = parseInt(session, 10);
            }

            rows = await prisma.question.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
        } catch {
            // DB fallback
        }

        const isAgileDevOps = category && (
            category.toLowerCase().includes('agile') ||
            category.toLowerCase().includes('devops')
        );

        const isCSharp = category && (
            category.toLowerCase() === 'c#' ||
            category.toLowerCase() === 'csharp' ||
            category.toLowerCase() === 'c sharp'
        );

        if (rows.length === 0 && (isAgileDevOps || isCSharp || !category)) {
            let filtered = isCSharp ? CSHARP_QUIZ_QUESTIONS : AGILE_DEVOPS_QUESTIONS;
            if (session !== undefined && session !== null && session !== '' && session !== 'all' && !isNaN(parseInt(session, 10)) && parseInt(session, 10) > 0) {
                const sNum = parseInt(session, 10);
                filtered = filtered.filter(q => q.session === sNum);
            }
            if (isAgileDevOps || isCSharp) {
                return filtered.map(q => ({
                    id: q.id,
                    category: q.category,
                    session: q.session,
                    sessionTitle: isCSharp ? (CSHARP_QUIZ_SESSIONS[q.session] || `Session ${q.session}`) : q.sessionTitle,
                    options: parseOptions(q.options),
                    question_text: q.questionText,
                    correct_answer: q.correctAnswer,
                    explanation: q.explanation || '',
                    created_at: new Date()
                }));
            }
        }

        return rows.map(r => ({
            ...r,
            session: r.session || 1,
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    getSessionsByCategory: async (category) => {
        const isAgileDevOps = category && (
            category.toLowerCase().includes('agile') ||
            category.toLowerCase().includes('devops')
        );

        const isCSharp = category && (
            category.toLowerCase() === 'c#' ||
            category.toLowerCase() === 'csharp' ||
            category.toLowerCase() === 'c sharp'
        );

        let rows = [];
        try {
            const where = {};
            if (category) {
                const variations = getCategoryVariations(category);
                if (variations.length > 1) {
                    where.OR = variations.map(v => ({ category: { equals: v, mode: 'insensitive' } }));
                } else {
                    where.category = { equals: category, mode: 'insensitive' };
                }
            }

            rows = await prisma.question.findMany({
                where,
                select: { session: true }
            });
        } catch {
            // DB fallback
        }

        const sessionCountMap = {};
        rows.forEach(r => {
            const s = r.session || 1;
            sessionCountMap[s] = (sessionCountMap[s] || 0) + 1;
        });

        if (isAgileDevOps && Object.keys(sessionCountMap).length < 16) {
            for (let s = 1; s <= 16; s++) {
                const count = AGILE_DEVOPS_QUESTIONS.filter(q => q.session === s).length;
                sessionCountMap[s] = Math.max(sessionCountMap[s] || 0, count);
            }
        }

        if (isCSharp && Object.keys(sessionCountMap).length < 3) {
            for (let s = 1; s <= 3; s++) {
                const count = CSHARP_QUIZ_QUESTIONS.filter(q => q.session === s).length;
                sessionCountMap[s] = Math.max(sessionCountMap[s] || 0, count);
            }
        }

        const sessions = Object.keys(sessionCountMap)
            .map(s => {
                const sNum = parseInt(s, 10);
                let title = `Session ${sNum}`;
                if (isAgileDevOps && AGILE_DEVOPS_SESSIONS[sNum]) {
                    title = AGILE_DEVOPS_SESSIONS[sNum];
                } else if (isCSharp && CSHARP_QUIZ_SESSIONS[sNum]) {
                    title = CSHARP_QUIZ_SESSIONS[sNum];
                }
                return {
                    session: sNum,
                    title,
                    count: sessionCountMap[s]
                };
            })
            .sort((a, b) => a.session - b.session);

        // If no sessions found yet, return default Session 1 with 0 questions
        if (sessions.length === 0) {
            return [{ session: 1, count: 0 }];
        }

        return sessions;
    },

    delete: async (id) => {
        await prisma.question.delete({
            where: { id: String(id) }
        });
        return 1;
    },

    update: async (id, data) => {
        const { category, session, question_text, options, correct_answer, explanation } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const updateData = {
            category,
            questionText: question_text,
            options: serializedOptions,
            correctAnswer: correct_answer,
            ...(explanation !== undefined ? { explanation: explanation || '' } : {})
        };
        if (session !== undefined && session !== null && !isNaN(parseInt(session, 10))) {
            updateData.session = parseInt(session, 10);
        }

        await prisma.question.update({
            where: { id: String(id) },
            data: updateData
        });
        return 1;
    },

    getRecentCount: async (days = 3) => {
        try {
            const date = new Date();
            date.setDate(date.getDate() - days);
            const count = await prisma.question.count({
                where: {
                    createdAt: {
                        gte: date
                    }
                }
            });
            return count;
        } catch {
            return AGILE_DEVOPS_QUESTIONS.length;
        }
    }
};

module.exports = Question;
