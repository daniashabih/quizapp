const prisma = require('../_config/prisma');

const parseOptions = (opts) => {
    if (Array.isArray(opts)) return opts;
    if (typeof opts === 'string') {
        try { return JSON.parse(opts); } catch { return []; }
    }
    return [];
};

const Question = {
    create: async (data) => {
        const { category, session, question_text, options, correct_answer } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const sessionNum = parseInt(session, 10) || 1;
        const result = await prisma.question.create({
            data: {
                category,
                session: sessionNum,
                questionText: question_text,
                options: serializedOptions,
                correctAnswer: correct_answer
            }
        });
        return result.id;
    },

    getAll: async () => {
        const rows = await prisma.question.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return rows.map(r => ({
            ...r,
            session: r.session || 1,
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    getFiltered: async ({ category, session } = {}) => {
        const where = {};
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }
        if (session !== undefined && session !== null && session !== '' && !isNaN(parseInt(session, 10))) {
            where.session = parseInt(session, 10);
        }

        const rows = await prisma.question.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        
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
        const where = {};
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        const rows = await prisma.question.findMany({
            where,
            select: { session: true }
        });

        const sessionCountMap = {};
        rows.forEach(r => {
            const s = r.session || 1;
            sessionCountMap[s] = (sessionCountMap[s] || 0) + 1;
        });

        const sessions = Object.keys(sessionCountMap)
            .map(s => ({
                session: parseInt(s, 10),
                count: sessionCountMap[s]
            }))
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
        const { category, session, question_text, options, correct_answer } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const updateData = {
            category,
            questionText: question_text,
            options: serializedOptions,
            correctAnswer: correct_answer
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
    }
};

module.exports = Question;
