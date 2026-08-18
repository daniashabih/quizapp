const prisma = require('../_config/prisma');

const Result = {
    create: async (userId, category, score, total, percentage, session) => {
        const sessionNum = parseInt(session, 10) || 1;
        const result = await prisma.quizResult.create({
            data: {
                userId: String(userId),
                category: String(category || 'General').trim(),
                session: sessionNum,
                score: parseInt(score, 10) || 0,
                total: parseInt(total, 10) || 0,
                percentage: parseFloat(percentage) || 0
            }
        });
        return result.id;
    },

    findByUserId: async (userId) => {
        const rows = await prisma.quizResult.findMany({
            where: { userId: String(userId) },
            orderBy: { createdAt: 'desc' }
        });
        return rows.map(r => ({
            ...r,
            session: r.session || 1
        }));
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

