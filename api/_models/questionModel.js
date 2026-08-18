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
        const { category, question_text, options, correct_answer } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        const result = await prisma.question.create({
            data: {
                category,
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
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    getFiltered: async ({ category } = {}) => {
        const where = {};
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }

        const rows = await prisma.question.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        
        return rows.map(r => ({
            ...r,
            options: parseOptions(r.options),
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    delete: async (id) => {
        await prisma.question.delete({
            where: { id: String(id) }
        });
        return 1;
    },

    update: async (id, data) => {
        const { category, question_text, options, correct_answer } = data;
        const serializedOptions = typeof options === 'string' ? options : JSON.stringify(Array.isArray(options) ? options : []);
        await prisma.question.update({
            where: { id: String(id) },
            data: {
                category,
                questionText: question_text,
                options: serializedOptions,
                correctAnswer: correct_answer
            }
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
