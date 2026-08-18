const prisma = require('../_config/prisma');

const Result = {
    create: async (userId, category, score, total, percentage, difficulty) => {
        const result = await prisma.quizResult.create({
            data: {
                userId: String(userId),
                category: String(category || 'General').trim(),
                score: parseInt(score, 10) || 0,
                total: parseInt(total, 10) || 0,
                percentage: parseFloat(percentage) || 0,
                difficulty: String(difficulty || 'beginner').toLowerCase()
            }
        });
        return result.id;
    },

    findByUserId: async (userId) => {
        return await prisma.quizResult.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' }
        });
    },

    getStatisticsByUserId: async (userId) => {
        const results = await prisma.quizResult.groupBy({
            by: ['category'],
            where: { userId: String(userId) },
            _max: { percentage: true },
            _count: { _all: true }
        });
        
        return results.map(r => ({
            category: r.category,
            best_score: r._max.percentage,
            attempts: r._count._all
        }));
    }
};

module.exports = Result;

