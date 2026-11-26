const prisma = require('../_config/prisma');

const normalizeCategory = (name) => {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/\band\b/g, '&')
        .replace(/\s+/g, ' ');
};

const DEFAULT_CATEGORIES = [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Angular',
    'Vue', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'SQL Server', 'PHP',
    'Laravel', 'Python', 'Django', 'Flutter', 'Dart', 'Git', 'GitHub',
    'Tailwind CSS', 'Bootstrap', 'WordPress', 'Docker', 'Agile & DevOps',
    'Azure', 'SEO', 'Power BI', 'Excel', 'C#', 'Material UI',
    'PHP, XML JSON, Laravel, MySQL, JavaScript'
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
        const defaultMatch = DEFAULT_CATEGORIES.find(c => normalizeCategory(c) === norm);
        if (defaultMatch) {
            return {
                id: `mem_cat_${norm.replace(/[^a-z0-9]/g, '_')}`,
                name: defaultMatch,
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
                }),
                prisma.question.findMany({
                    select: { category: true, session: true }
                })
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

            const list = categories.map(cat => {
                const norm = normalizeCategory(cat.name);
                const sessions = sessionMap[norm]
                    ? Array.from(sessionMap[norm]).sort((a, b) => a - b)
                    : [];
                return {
                    id: cat.id,
                    name: cat.name,
                    isEnabled: cat.isEnabled !== false,
                    questionCount: countMap[norm] || 0,
                    sessions
                };
            });

            return list;
        } catch (err) {
            console.error('[Category Model Error]:', err.message);
            throw err;
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
