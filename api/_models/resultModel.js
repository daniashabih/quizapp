const prisma = require('../_config/prisma');

const Result = {
    create: async (userId, category, score, total, percentage, session) => {
        const sessionNum = parseInt(session, 10) || 1;
        const normalizedCategory = String(category || 'General').trim();
        const normalizedScore = parseInt(score, 10) || 0;
        const normalizedTotal = parseInt(total, 10) || 0;
        const normalizedPercentage = parseFloat(percentage) || 0;

        // Guard against rapid duplicate submissions (same user, category, session, score, total within 30s)
        if (typeof prisma.quizResult.findFirst === 'function') {
            const recentWindow = new Date(Date.now() - 30 * 1000);
            const existing = await prisma.quizResult.findFirst({
                where: {
                    userId: String(userId),
                    category: normalizedCategory,
                    session: sessionNum,
                    score: normalizedScore,
                    total: normalizedTotal,
                    createdAt: { gte: recentWindow }
                },
                orderBy: { createdAt: 'desc' }
            });
            if (existing && existing.id) {
                return existing.id;
            }
        }

        const result = await prisma.quizResult.create({
            data: {
                userId: String(userId),
                category: normalizedCategory,
                session: sessionNum,
                score: normalizedScore,
                total: normalizedTotal,
                percentage: normalizedPercentage
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
