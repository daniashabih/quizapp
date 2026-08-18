const prisma = require('../_config/prisma');

const normalizeDifficulty = (diff) => {
    if (!diff) return 'beginner';
    const d = String(diff).toLowerCase().trim();
    if (d === 'easy' || d === 'beginner') return 'beginner';
    if (d === 'medium' || d === 'intermediate') return 'intermediate';
    if (d === 'hard' || d === 'expert' || d === 'advanced') return 'expert';
    return 'beginner';
};

const Question = {
    create: async (data) => {
        const { category, question_text, options, correct_answer, difficulty = 'beginner' } = data;
        const validOptions = Array.isArray(options) ? options : (typeof options === 'string' ? JSON.parse(options) : []);
        const result = await prisma.question.create({
            data: {
                category,
                questionText: question_text,
                options: validOptions,
                correctAnswer: correct_answer,
                difficulty: normalizeDifficulty(difficulty)
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
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    getFiltered: async ({ category, difficulty } = {}) => {
        const where = {};
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }
        if (difficulty) {
            where.difficulty = normalizeDifficulty(difficulty);
        }

        const rows = await prisma.question.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        
        return rows.map(r => ({
            ...r,
            question_text: r.questionText,
            correct_answer: r.correctAnswer,
            created_at: r.createdAt
        }));
    },

    delete: async (id) => {
        await prisma.question.delete({
            where: { id: parseInt(id, 10) }
        });
        return 1;
    },

    update: async (id, data) => {
        const { category, question_text, options, correct_answer, difficulty } = data;
        const validOptions = Array.isArray(options) ? options : (typeof options === 'string' ? JSON.parse(options) : []);
        await prisma.question.update({
            where: { id: parseInt(id, 10) },
            data: {
                category,
                questionText: question_text,
                options: validOptions,
                correctAnswer: correct_answer,
                difficulty: normalizeDifficulty(difficulty)
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
