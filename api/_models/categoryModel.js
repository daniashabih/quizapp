const prisma = require('../_config/prisma');
const { AGILE_DEVOPS_QUESTIONS } = require('./agileDevopsQuestionsData');

const normalizeCategory = (name) => {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
};

const DEFAULT_CATEGORIES = [
    { name: 'HTML', sessions: [1, 2, 3] },
    { name: 'CSS', sessions: [1, 2, 3] },
    { name: 'JavaScript', sessions: [1, 2, 3] },
    { name: 'TypeScript', sessions: [1, 2, 3] },
    { name: 'React.js', sessions: [1, 2, 3] },
    { name: 'Next.js', sessions: [1, 2, 3] },
    { name: 'Angular', sessions: [1, 2, 3] },
    { name: 'Vue', sessions: [1, 2, 3] },
    { name: 'Node.js', sessions: [1, 2, 3] },
    { name: 'Express.js', sessions: [1, 2, 3] },
    { name: 'MongoDB', sessions: [1, 2, 3] },
    { name: 'SQL', sessions: [1, 2, 3] },
    { name: 'SQL Server', sessions: [1, 2, 3] },
    { name: 'PHP', sessions: [1, 2, 3] },
    { name: 'Laravel', sessions: [1, 2, 3] },
    { name: 'Python', sessions: [1, 2, 3] },
    { name: 'Django', sessions: [1, 2, 3] },
    { name: 'Flutter', sessions: [1, 2, 3] },
    { name: 'Dart', sessions: [1, 2, 3] },
    { name: 'Git', sessions: [1, 2, 3] },
    { name: 'GitHub', sessions: [1, 2, 3] },
    { name: 'Tailwind CSS', sessions: [1, 2, 3] },
    { name: 'Bootstrap', sessions: [1, 2, 3] },
    { name: 'WordPress', sessions: [1, 2, 3] },
    { name: 'Docker', sessions: [1, 2, 3] },
    { name: 'Agile & DevOps', sessions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], questionCount: AGILE_DEVOPS_QUESTIONS.length },
    { name: 'Azure', sessions: [1, 2, 3] },
    { name: 'SEO', sessions: [1, 2, 3] },
    { name: 'Power BI', sessions: [1, 2, 3] },
    { name: 'Excel', sessions: [1, 2, 3] },
    { name: 'C#', sessions: [1, 2, 3] }
];

const Category = {
    normalize: normalizeCategory,

    create: async (name, isEnabled = true) => {
        const cleanName = String(name || '').trim();
        const result = await prisma.category.create({
            data: {
                name: cleanName,
                isEnabled: isEnabled !== false
            }
        });
        return result.id;
    },

    findByName: async (name) => {
        const norm = normalizeCategory(name);
        try {
            const categories = await prisma.category.findMany();
            const found = categories.find(c => normalizeCategory(c.name) === norm);
            if (found) return found;
        } catch {
            // DB fallback
        }
        const defaultMatch = DEFAULT_CATEGORIES.find(c => normalizeCategory(c.name) === norm);
        if (defaultMatch) {
            return {
                id: `mem_cat_${norm.replace(/[^a-z0-9]/g, '_')}`,
                name: defaultMatch.name,
                isEnabled: true
            };
        }
        return null;
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

            // Ensure Agile & DevOps is fully populated in countMap & sessionMap
            const agileNorm = normalizeCategory('Agile & DevOps');
            countMap[agileNorm] = Math.max(countMap[agileNorm] || 0, AGILE_DEVOPS_QUESTIONS.length);
            if (!sessionMap[agileNorm]) sessionMap[agileNorm] = new Set();
            for (let s = 1; s <= 16; s++) {
                sessionMap[agileNorm].add(s);
            }

            const list = categories.map(cat => {
                const norm = normalizeCategory(cat.name);
                const sessions = sessionMap[norm] ? Array.from(sessionMap[norm]).sort((a, b) => a - b) : [];
                return {
                    id: cat.id,
                    name: cat.name,
                    isEnabled: cat.isEnabled !== false,
                    questionCount: countMap[norm] || 0,
                    sessions: sessions.length > 0 ? sessions : [1]
                };
            });

            // If Agile & DevOps was not in categories, append it
            const hasAgile = list.some(c => normalizeCategory(c.name) === agileNorm);
            if (!hasAgile) {
                list.push({
                    id: 'cat_agile_devops',
                    name: 'Agile & DevOps',
                    isEnabled: true,
                    questionCount: AGILE_DEVOPS_QUESTIONS.length,
                    sessions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                });
            }

            return list;
        } catch (err) {
            console.error('[Category Model Fallback]:', err.message);
            return DEFAULT_CATEGORIES.map((cat, idx) => ({
                id: `mem_cat_${idx + 1}`,
                name: cat.name,
                isEnabled: true,
                questionCount: cat.questionCount !== undefined ? cat.questionCount : (cat.name.includes('Agile') ? AGILE_DEVOPS_QUESTIONS.length : 25),
                sessions: cat.sessions
            }));
        }
    },

    update: async (id, dataOrName) => {
        const updateData = {};
        if (typeof dataOrName === 'string') {
            updateData.name = String(dataOrName).trim();
        } else if (typeof dataOrName === 'object' && dataOrName !== null) {
            if (dataOrName.name !== undefined) {
                updateData.name = String(dataOrName.name).trim();
            }
            if (dataOrName.isEnabled !== undefined) {
                updateData.isEnabled = Boolean(dataOrName.isEnabled);
            }
        }

        try {
            await prisma.category.update({
                where: { id: String(id) },
                data: updateData
            });
        } catch {
            // DB fallback
        }
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
            const res = await prisma.question.deleteMany({
                where: {
                    category: { equals: catName, mode: 'insensitive' }
                }
            }).catch(() => ({ count: 0 }));
            deletedQuestions = res.count || 0;
        }

        return {
            name: catName,
            deletedQuestions
        };
    }
};

module.exports = Category;
