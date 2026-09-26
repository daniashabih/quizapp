const prisma = require('../_config/prisma');

const normalizeCategory = (name) => {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
};

const Category = {
    normalize: normalizeCategory,

    create: async (name) => {
        const cleanName = String(name || '').trim();
        const result = await prisma.category.create({
            data: { name: cleanName }
        });
        return result.id;
    },

    findByName: async (name) => {
        const norm = normalizeCategory(name);
        const categories = await prisma.category.findMany();
        return categories.find(c => normalizeCategory(c.name) === norm) || null;
    },

    getAll: async () => {
        try {
            const [categories, questionCounts, allQuestionSessions] = await Promise.all([
                prisma.category.findMany({
                    orderBy: { name: 'asc' }
                }),
                prisma.question.groupBy({
                    by: ['category'],
                    _count: { _all: true }
                }).catch(() => []),
                prisma.question.findMany({
                    select: { category: true, session: true }
                }).catch(() => [])
            ]);

            const countMap = {};
            questionCounts.forEach(qc => {
                if (qc.category) {
                    const norm = normalizeCategory(qc.category);
                    countMap[norm] = (countMap[norm] || 0) + (qc._count._all || 0);
                }
            });

            const sessionMap = {};
            allQuestionSessions.forEach(q => {
                if (q.category) {
                    const norm = normalizeCategory(q.category);
                    if (!sessionMap[norm]) sessionMap[norm] = new Set();
                    sessionMap[norm].add(q.session || 1);
                }
            });

            return categories.map(cat => {
                const norm = normalizeCategory(cat.name);
                const sessions = sessionMap[norm] ? Array.from(sessionMap[norm]).sort((a, b) => a - b) : [];
                return {
                    ...cat,
                    questionCount: countMap[norm] || 0,
                    sessions: sessions
                };
            });
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

    delete: async (idOrName, deleteQuestions = true) => {
        let category = null;
        const cleanIdOrName = String(idOrName || '').trim();

        if (/^[0-9a-fA-F]{24}$/.test(cleanIdOrName)) {
            category = await prisma.category.findUnique({
                where: { id: cleanIdOrName }
            }).catch(() => null);
        }

        if (!category) {
            category = await Category.findByName(cleanIdOrName);
        }

        const catName = category ? category.name : cleanIdOrName;
        const catId = category ? category.id : (/^[0-9a-fA-F]{24}$/.test(cleanIdOrName) ? cleanIdOrName : null);

        if (catId) {
            await prisma.category.delete({
                where: { id: catId }
            }).catch(err => {
                console.warn('[Category Model] Could not delete category by ID:', err.message);
            });
        }

        let deletedQuestions = 0;
        if (deleteQuestions && catName) {
            const variations = Array.from(new Set([
                catName,
                catName.replace(/&/g, 'and'),
                catName.replace(/\band\b/gi, '&')
            ]));

            const qResult = await prisma.question.deleteMany({
                where: {
                    OR: variations.map(v => ({ category: { equals: v, mode: 'insensitive' } }))
                }
            }).catch(err => {
                console.warn('[Category Model] Could not delete questions for category:', err.message);
                return { count: 0 };
            });
            deletedQuestions = qResult?.count || 0;
        }

        return { success: true, name: catName, deletedQuestions };
    }
};

module.exports = Category;


