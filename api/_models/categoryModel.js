const prisma = require('../_config/prisma');

const Category = {
    create: async (name) => {
        const cleanName = String(name || '').trim();
        const result = await prisma.category.create({
            data: { name: cleanName }
        });
        return result.id;
    },

    findByName: async (name) => {
        const cleanName = String(name || '').trim().toLowerCase();
        const categories = await prisma.category.findMany();
        return categories.find(c => (c.name || '').toLowerCase() === cleanName) || null;
    },

    getAll: async () => {
        try {
            const [categories, questionCounts] = await Promise.all([
                prisma.category.findMany({
                    orderBy: { name: 'asc' }
                }),
                prisma.question.groupBy({
                    by: ['category'],
                    _count: { _all: true }
                }).catch(() => [])
            ]);

            const countMap = {};
            questionCounts.forEach(qc => {
                if (qc.category) {
                    countMap[qc.category.toLowerCase().trim()] = qc._count._all || 0;
                }
            });

            return categories.map(cat => ({
                ...cat,
                questionCount: countMap[(cat.name || '').toLowerCase().trim()] || 0
            }));
        } catch (err) {
            console.error('[Category Model Error]:', err);
            return await prisma.category.findMany({
                orderBy: { name: 'asc' }
            });
        }
    },

    update: async (id, name) => {
        const cleanName = String(name || '').trim();
        await prisma.category.update({
            where: { id: String(id) },
            data: { name: cleanName }
        });
        return 1;
    },

    delete: async (id) => {
        await prisma.category.delete({
            where: { id: String(id) }
        });
        return 1;
    }
};

module.exports = Category;

