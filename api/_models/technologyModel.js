const prisma = require('../_config/prisma');

// 1. Initial 6 Technology Categories
const INITIAL_TECH_CATEGORIES = [
    {
        id: 'cat_frontend',
        name: 'Frontend Development',
        slug: 'frontend-development',
        description: 'Client-side web interfaces, design systems, and responsive user experiences.',
        icon: 'Layout',
        order: 1,
        isEnabled: true
    },
    {
        id: 'cat_backend',
        name: 'Backend Development',
        slug: 'backend-development',
        description: 'Server architecture, APIs, application logic, and business workflows.',
        icon: 'Server',
        order: 2,
        isEnabled: true
    },
    {
        id: 'cat_database',
        name: 'Database',
        slug: 'database',
        description: 'Relational and NoSQL data modeling, complex queries, and aggregations.',
        icon: 'Database',
        order: 3,
        isEnabled: true
    },
    {
        id: 'cat_mobile',
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'Native and cross-platform mobile apps for iOS, Android, and beyond.',
        icon: 'Smartphone',
        order: 4,
        isEnabled: true
    },
    {
        id: 'cat_fundamentals',
        name: 'Programming Fundamentals',
        slug: 'programming-fundamentals',
        description: 'Core computer science foundations: algorithmic logic, OOP, and data structures.',
        icon: 'Cpu',
        order: 5,
        isEnabled: true
    },
    {
        id: 'cat_webdev',
        name: 'Web Development',
        slug: 'web-development',
        description: 'Full stack integration, modern web protocols, and client-server communication.',
        icon: 'Globe',
        order: 6,
        isEnabled: true
    },
    {
        id: 'cat_languages',
        name: 'Programming Languages',
        slug: 'programming-languages',
        description: 'Core programming languages, syntax paradigms, runtime environments, and typing systems.',
        icon: 'Code2',
        order: 7,
        isEnabled: true
    }
];

// 2. Initial 24 Technologies Across the 7 Categories
const INITIAL_TECHNOLOGIES = [
    // Frontend Development (6)
    {
        id: 'tech_html',
        categorySlug: 'frontend-development',
        name: 'HTML',
        slug: 'html',
        description: 'Structure web pages with semantic markup, modern HTML5 elements, and accessibility.',
        icon: 'html5',
        color: '#E34F26',
        badge: 'Core Web',
        supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'memory-match', 'code-typing', 'syntax-typing', 'speed-typing'],
        isEnabled: true,
        order: 1
    },
    {
        id: 'tech_css',
        categorySlug: 'frontend-development',
        name: 'CSS',
        slug: 'css',
        description: 'Style responsive layouts using Flexbox, CSS Grid, animations, and modern selectors.',
        icon: 'css3',
        color: '#1572B6',
        badge: 'Styling',
        supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'missing-code', 'memory-match', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 2
    },
    {
        id: 'tech_javascript',
        categorySlug: 'frontend-development',
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Dynamic scripting, ES6+ features, async/await, closures, and DOM events.',
        icon: 'javascript',
        color: '#F7DF1E',
        badge: 'Universal',
        supportedGames: ['output-predictor', 'code-scramble', 'logic-builder', 'code-puzzle', 'find-the-bug', 'missing-code', 'memory-match', 'speed-typing', 'code-typing', 'syntax-typing', 'sixty-second-challenge', 'error-free-typing', 'word-rain'],
        isEnabled: true,
        order: 3
    },
    {
        id: 'tech_bootstrap',
        categorySlug: 'frontend-development',
        name: 'Bootstrap',
        slug: 'bootstrap',
        description: 'Mobile-first component framework with 12-column grid and utility classes.',
        icon: 'bootstrap',
        color: '#7952B3',
        badge: 'CSS Framework',
        supportedGames: ['find-the-bug', 'missing-code', 'code-puzzle', 'memory-match', 'code-typing'],
        isEnabled: true,
        order: 4
    },
    {
        id: 'tech_jquery',
        categorySlug: 'frontend-development',
        name: 'jQuery',
        slug: 'jquery',
        description: 'Fast DOM traversal, event handling, animations, and AJAX shorthand.',
        icon: 'jquery',
        color: '#0769AD',
        badge: 'DOM Library',
        supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'code-typing', 'output-predictor'],
        isEnabled: true,
        order: 5
    },
    {
        id: 'tech_react',
        categorySlug: 'frontend-development',
        name: 'React.js',
        slug: 'react',
        description: 'Component-based UI development with JSX, virtual DOM, and reactive hooks.',
        icon: 'react',
        color: '#61DAFB',
        badge: 'UI Library',
        supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'missing-code', 'logic-builder', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 6
    },

    // Backend Development (5)
    {
        id: 'tech_php',
        categorySlug: 'backend-development',
        name: 'PHP',
        slug: 'php',
        description: 'Server-side language powering the web with strong typing, PDO, and Superglobals.',
        icon: 'php',
        color: '#777BB4',
        badge: 'Server',
        supportedGames: ['find-the-bug', 'missing-code', 'code-puzzle', 'output-predictor', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 7
    },
    {
        id: 'tech_laravel',
        categorySlug: 'backend-development',
        name: 'Laravel',
        slug: 'laravel',
        description: 'The PHP framework for Web Artisans with Eloquent ORM, Artisan CLI, and Blade.',
        icon: 'laravel',
        color: '#FF2D20',
        badge: 'MVC Framework',
        supportedGames: ['code-puzzle', 'find-the-bug', 'logic-builder', 'missing-code', 'code-typing'],
        isEnabled: true,
        order: 8
    },
    {
        id: 'tech_nodejs',
        categorySlug: 'backend-development',
        name: 'Node.js',
        slug: 'nodejs',
        description: 'Asynchronous event-driven JavaScript runtime for scalable network applications.',
        icon: 'nodejs',
        color: '#339933',
        badge: 'Runtime',
        supportedGames: ['output-predictor', 'code-puzzle', 'find-the-bug', 'code-scramble', 'code-typing', 'speed-typing'],
        isEnabled: true,
        order: 9
    },
    {
        id: 'tech_express',
        categorySlug: 'backend-development',
        name: 'Express.js',
        slug: 'express',
        description: 'Fast, unopinionated, minimalist web framework for Node.js RESTful APIs.',
        icon: 'express',
        color: '#68A063',
        badge: 'API Framework',
        supportedGames: ['find-the-bug', 'code-puzzle', 'missing-code', 'logic-builder', 'code-typing'],
        isEnabled: true,
        order: 10
    },
    {
        id: 'tech_python',
        categorySlug: 'backend-development',
        name: 'Python',
        slug: 'python',
        description: 'Readable, powerful syntax with versatile collections, list comprehensions, and OOP.',
        icon: 'python',
        color: '#3776AB',
        badge: 'Multi-paradigm',
        supportedGames: ['output-predictor', 'code-puzzle', 'find-the-bug', 'logic-builder', 'code-scramble', 'code-typing', 'speed-typing'],
        isEnabled: true,
        order: 11
    },

    // Database (3)
    {
        id: 'tech_mysql',
        categorySlug: 'database',
        name: 'MySQL',
        slug: 'mysql',
        description: 'World-renowned relational DBMS with transactional ACID guarantees and indexing.',
        icon: 'mysql',
        color: '#4479A1',
        badge: 'RDBMS',
        supportedGames: ['sql-challenge', 'output-predictor', 'code-puzzle', 'find-the-bug', 'code-typing'],
        isEnabled: true,
        order: 12
    },
    {
        id: 'tech_mongodb',
        categorySlug: 'database',
        name: 'MongoDB',
        slug: 'mongodb',
        description: 'Document database with flexible BSON schemas, aggregation pipelines, and indexing.',
        icon: 'mongodb',
        color: '#47A248',
        badge: 'NoSQL',
        supportedGames: ['sql-challenge', 'find-the-bug', 'output-predictor', 'code-puzzle', 'code-typing'],
        isEnabled: true,
        order: 13
    },
    {
        id: 'tech_sql',
        categorySlug: 'database',
        name: 'SQL',
        slug: 'sql',
        description: 'Declarative queries: SELECT, JOIN, GROUP BY, subqueries, and window functions.',
        icon: 'sql',
        color: '#00758F',
        badge: 'Query Language',
        supportedGames: ['sql-challenge', 'output-predictor', 'code-puzzle', 'find-the-bug', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 14
    },

    // Mobile Development (3)
    {
        id: 'tech_flutter',
        categorySlug: 'mobile-development',
        name: 'Flutter',
        slug: 'flutter',
        description: 'Google multi-platform UI framework using reactive widgets and high-speed rendering.',
        icon: 'flutter',
        color: '#02569B',
        badge: 'Cross-Platform',
        supportedGames: ['code-puzzle', 'find-the-bug', 'code-scramble', 'missing-code', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 15
    },
    {
        id: 'tech_dart',
        categorySlug: 'mobile-development',
        name: 'Dart',
        slug: 'dart',
        description: 'Client-optimized OOP language with sound null safety, async Streams, and records.',
        icon: 'dart',
        color: '#0175C2',
        badge: 'Language',
        supportedGames: ['code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble', 'code-typing', 'syntax-typing'],
        isEnabled: true,
        order: 16
    },
    {
        id: 'tech_android',
        categorySlug: 'mobile-development',
        name: 'Android Development',
        slug: 'android-development',
        description: 'Android SDK architectures, Activities, Intents, Jetpack Compose, and Gradle builds.',
        icon: 'android',
        color: '#3DDC84',
        badge: 'Mobile OS',
        supportedGames: ['find-the-bug', 'code-puzzle', 'output-predictor', 'code-typing', 'missing-code'],
        isEnabled: true,
        order: 17
    },

    // Programming Fundamentals (3)
    {
        id: 'tech_logic',
        categorySlug: 'programming-fundamentals',
        name: 'Programming Logic',
        slug: 'programming-logic',
        description: 'Boolean operators, truth tables, conditional branches, loops, and edge cases.',
        icon: 'binary',
        color: '#8B5CF6',
        badge: 'Foundations',
        supportedGames: ['logic-builder', 'output-predictor', 'code-scramble', 'code-puzzle', 'memory-match'],
        isEnabled: true,
        order: 18
    },
    {
        id: 'tech_oop',
        categorySlug: 'programming-fundamentals',
        name: 'Object-Oriented Programming (OOP)',
        slug: 'oop',
        description: 'Classes, inheritance, encapsulation, polymorphism, abstraction, and design patterns.',
        icon: 'box',
        color: '#EC4899',
        badge: 'Architecture',
        supportedGames: ['memory-match', 'find-the-bug', 'code-puzzle', 'output-predictor', 'logic-builder'],
        isEnabled: true,
        order: 19
    },
    {
        id: 'tech_dsa',
        categorySlug: 'programming-fundamentals',
        name: 'Data Structures & Algorithms',
        slug: 'dsa',
        description: 'Arrays, linked lists, stacks, queues, trees, Big-O notation, searching and sorting.',
        icon: 'network',
        color: '#F97316',
        badge: 'Algorithms',
        supportedGames: ['logic-builder', 'code-scramble', 'output-predictor', 'code-puzzle', 'memory-match'],
        isEnabled: true,
        order: 20
    },

    // Web Development (3)
    {
        id: 'tech_html_css',
        categorySlug: 'web-development',
        name: 'HTML & CSS',
        slug: 'html-css',
        description: 'Combined semantic structuring and visual presentation for accessible responsive websites.',
        icon: 'palette',
        color: '#E44D26',
        badge: 'Web Pair',
        supportedGames: ['code-puzzle', 'find-the-bug', 'missing-code', 'memory-match', 'code-typing', 'speed-typing'],
        isEnabled: true,
        order: 21
    },
    {
        id: 'tech_fullstack',
        categorySlug: 'web-development',
        name: 'Full Stack Development',
        slug: 'full-stack',
        description: 'Connecting frontend UI, server REST endpoints, database transactions, and auth state.',
        icon: 'layers',
        color: '#10B981',
        badge: 'End-to-End',
        supportedGames: ['logic-builder', 'code-puzzle', 'find-the-bug', 'output-predictor', 'code-typing'],
        isEnabled: true,
        order: 22
    },
    {
        id: 'tech_web_fundamentals',
        categorySlug: 'web-development',
        name: 'Web Development Fundamentals',
        slug: 'web-fundamentals',
        description: 'HTTP methods, status codes, REST conventions, CORS, cookies, headers, and DNS.',
        icon: 'compass',
        color: '#06B6D4',
        badge: 'Web Standards',
        supportedGames: ['memory-match', 'speed-typing', 'output-predictor', 'find-the-bug', 'code-puzzle'],
        isEnabled: true,
        order: 23
    },

    // Programming Languages (1)
    {
        id: 'tech_csharp',
        categorySlug: 'programming-languages',
        name: 'C#',
        slug: 'csharp',
        description: 'Practice C# programming through interactive coding games and challenges.',
        icon: 'csharp',
        color: '#9B4993',
        badge: 'Modern .NET',
        supportedGames: [
            'complete-the-code',
            'csharp-complete-the-code',
            'code-puzzle',
            'find-the-bug',
            'output-predictor',
            'code-scramble',
            'missing-code',
            'logic-builder',
            'csharp-oop-challenge',
            'csharp-collections-challenge',
            'csharp-linq-challenge',
            'csharp-exception-handling',
            'speed-typing',
            'syntax-typing',
            'code-typing',
            'error-free-typing'
        ],
        isEnabled: true,
        order: 24
    },
    {
        id: 'tech_devops',
        categorySlug: 'programming-fundamentals',
        name: 'Agile & DevOps',
        slug: 'agile-devops',
        description: 'Software development lifecycle, Agile methodologies (Scrum, XP, ASD, DSDM, FDD, Lean), CI/CD pipelines, automated testing, and DevOps tools.',
        icon: 'devops',
        color: '#007ACC',
        badge: 'Agile & DevOps',
        supportedGames: [
            'speed-typing',
            'syntax-typing',
            'code-typing',
            'error-free-typing',
            'sixty-second-challenge'
        ],
        isEnabled: true,
        order: 25
    }
];

// In-memory fallbacks when MongoDB Atlas is connecting or operating in test sandbox
let memCategories = JSON.parse(JSON.stringify(INITIAL_TECH_CATEGORIES));
let memTechnologies = JSON.parse(JSON.stringify(INITIAL_TECHNOLOGIES));
let memTechProgress = {}; // key: `${userId}_${techSlug}_${gameSlug}`

/**
 * Technology Model providing full CRUD and dynamic queries
 */
const TechnologyModel = {
    INITIAL_TECH_CATEGORIES,
    INITIAL_TECHNOLOGIES,

    // ==========================================
    // CATEGORY METHODS
    // ==========================================

    /**
     * Get all technology categories with their technologies and game statistics
     */
    getAllCategories: async ({ includeDisabled = false } = {}) => {
        try {
            let categories = await prisma.gameTechCategory.findMany({
                where: includeDisabled ? {} : { isEnabled: true },
                include: {
                    technologies: {
                        where: includeDisabled ? {} : { isEnabled: true },
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            });

            if (!categories || categories.length === 0) {
                // Auto-seed into DB if empty
                await TechnologyModel.seedInitialData().catch(() => {});
                categories = await prisma.gameTechCategory.findMany({
                    where: includeDisabled ? {} : { isEnabled: true },
                    include: {
                        technologies: {
                            where: includeDisabled ? {} : { isEnabled: true },
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                });
            }

            if (categories && categories.length > 0) {
                return categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug,
                    description: cat.description || '',
                    icon: cat.icon || 'Layout',
                    order: cat.order,
                    isEnabled: cat.isEnabled,
                    technologiesCount: cat.technologies ? cat.technologies.length : 0,
                    technologies: cat.technologies || []
                }));
            }
        } catch {
            // Memory fallback
        }

        // Return memory fallback
        let list = memCategories.slice();
        if (!includeDisabled) {
            list = list.filter(c => c.isEnabled);
        }
        return list.map(cat => {
            const techs = memTechnologies.filter(t => t.categorySlug === cat.slug && (includeDisabled || t.isEnabled));
            return {
                ...cat,
                technologiesCount: techs.length,
                technologies: techs
            };
        });
    },

    /**
     * Get single category by slug or ID
     */
    getCategoryBySlug: async (slugOrId) => {
        const clean = String(slugOrId || '').toLowerCase().trim();
        try {
            const cat = await prisma.gameTechCategory.findFirst({
                where: {
                    OR: [
                        { slug: clean },
                        { id: slugOrId }
                    ]
                },
                include: {
                    technologies: {
                        where: { isEnabled: true },
                        orderBy: { order: 'asc' }
                    }
                }
            });
            if (cat) return cat;
        } catch {
            // DB fallback
        }

        const cat = memCategories.find(c => c.slug === clean || c.id === slugOrId);
        if (!cat) return null;
        const techs = memTechnologies.filter(t => t.categorySlug === cat.slug && t.isEnabled);
        return { ...cat, technologies: techs };
    },

    /**
     * Create a new technology category (Admin)
     */
    createCategory: async (data) => {
        const name = String(data.name || '').trim();
        const slug = String(data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
        const description = String(data.description || '').trim();
        const icon = data.icon || 'Layout';
        const order = Number(data.order || (memCategories.length + 1));
        const isEnabled = data.isEnabled !== false;

        try {
            const created = await prisma.gameTechCategory.create({
                data: {
                    name,
                    slug,
                    description,
                    icon,
                    order,
                    isEnabled
                }
            });
            return created;
        } catch {
            // Memory fallback
        }

        const newCat = {
            id: `cat_${Date.now()}`,
            name,
            slug,
            description,
            icon,
            order,
            isEnabled,
            createdAt: new Date().toISOString()
        };
        memCategories.push(newCat);
        return newCat;
    },

    /**
     * Update an existing technology category (Admin)
     */
    updateCategory: async (idOrSlug, data) => {
        try {
            const existing = await prisma.gameTechCategory.findFirst({
                where: {
                    OR: [{ id: String(idOrSlug) }, { slug: String(idOrSlug) }]
                }
            });

            if (existing) {
                const updated = await prisma.gameTechCategory.update({
                    where: { id: existing.id },
                    data: {
                        name: data.name !== undefined ? String(data.name).trim() : existing.name,
                        slug: data.slug !== undefined ? String(data.slug).trim() : existing.slug,
                        description: data.description !== undefined ? String(data.description).trim() : existing.description,
                        icon: data.icon !== undefined ? data.icon : existing.icon,
                        order: data.order !== undefined ? Number(data.order) : existing.order,
                        isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : existing.isEnabled
                    }
                });
                return updated;
            }
        } catch {
            // DB fallback
        }

        const idx = memCategories.findIndex(c => c.id === idOrSlug || c.slug === idOrSlug);
        if (idx !== -1) {
            memCategories[idx] = {
                ...memCategories[idx],
                ...data,
                order: data.order !== undefined ? Number(data.order) : memCategories[idx].order,
                isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : memCategories[idx].isEnabled
            };
            return memCategories[idx];
        }
        return null;
    },

    /**
     * Delete a technology category (Admin)
     */
    deleteCategory: async (idOrSlug) => {
        try {
            const existing = await prisma.gameTechCategory.findFirst({
                where: {
                    OR: [{ id: String(idOrSlug) }, { slug: String(idOrSlug) }]
                }
            });
            if (existing) {
                await prisma.gameTechCategory.delete({ where: { id: existing.id } });
                return true;
            }
        } catch {
            // DB fallback
        }

        const initLen = memCategories.length;
        memCategories = memCategories.filter(c => c.id !== idOrSlug && c.slug !== idOrSlug);
        return memCategories.length < initLen;
    },

    // ==========================================
    // TECHNOLOGY METHODS
    // ==========================================

    /**
     * Get all technologies with optional category filter and game counts
     */
    getAllTechnologies: async ({ categorySlug, isEnabled = true, search = '', userId = null } = {}) => {
        try {
            const where = {};
            if (categorySlug && categorySlug !== 'all') {
                where.categorySlug = categorySlug;
            }
            if (isEnabled !== undefined && isEnabled !== null) {
                where.isEnabled = Boolean(isEnabled);
            }

            let techs = await prisma.gameTechnology.findMany({
                where,
                orderBy: { order: 'asc' }
            });

            if (!techs || techs.length === 0) {
                await TechnologyModel.seedInitialData().catch(() => {});
                techs = await prisma.gameTechnology.findMany({
                    where,
                    orderBy: { order: 'asc' }
                });
            }

            if (techs && techs.length > 0) {
                let userProgressMap = {};
                if (userId) {
                    const userProg = await prisma.userTechProgress.findMany({
                        where: { userId: String(userId), gameSlug: 'overall' }
                    }).catch(() => []);
                    userProg.forEach(p => { userProgressMap[p.technology] = p; });
                }

                if (search) {
                    const q = search.toLowerCase();
                    techs = techs.filter(t =>
                        t.name.toLowerCase().includes(q) ||
                        t.slug.toLowerCase().includes(q) ||
                        (t.description || '').toLowerCase().includes(q)
                    );
                }

                return techs.map(t => ({
                    ...t,
                    supportedGamesCount: (t.supportedGames || []).length,
                    userHighScore: userProgressMap[t.slug]?.highScore || 0,
                    userTotalPlays: userProgressMap[t.slug]?.totalPlays || 0,
                    userBestWpm: userProgressMap[t.slug]?.bestWpm || 0
                }));
            }
        } catch {
            // DB fallback
        }

        // Memory fallback
        let list = memTechnologies.slice();
        if (categorySlug && categorySlug !== 'all') {
            list = list.filter(t => t.categorySlug === categorySlug);
        }
        if (isEnabled !== undefined && isEnabled !== null) {
            list = list.filter(t => Boolean(t.isEnabled) === Boolean(isEnabled));
        }
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.slug.toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q)
            );
        }

        return list.map(t => {
            const progKey = `${userId}_${t.slug}_overall`;
            const prog = userId ? memTechProgress[progKey] : null;
            return {
                ...t,
                supportedGamesCount: (t.supportedGames || []).length,
                userHighScore: prog?.highScore || 0,
                userTotalPlays: prog?.totalPlays || 0,
                userBestWpm: prog?.bestWpm || 0
            };
        });
    },

    /**
     * Get single technology by slug with full details, supported games, and user progress
     */
    getTechnologyBySlug: async (slug, userId = null) => {
        const clean = String(slug || '').toLowerCase().trim();
        try {
            const tech = await prisma.gameTechnology.findUnique({
                where: { slug: clean },
                include: { category: true }
            });

            if (tech) {
                let userHighScore = 0;
                let userBestWpm = 0;
                let userBestAccuracy = 100;
                let userTotalPlays = 0;

                if (userId) {
                    const prog = await prisma.userTechProgress.findUnique({
                        where: {
                            userId_technology_gameSlug: {
                                userId: String(userId),
                                technology: clean,
                                gameSlug: 'overall'
                            }
                        }
                    }).catch(() => null);

                    if (prog) {
                        userHighScore = prog.highScore || 0;
                        userBestWpm = prog.bestWpm || 0;
                        userBestAccuracy = prog.bestAccuracy || 100;
                        userTotalPlays = prog.totalPlays || 0;
                    }
                }

                return {
                    ...tech,
                    supportedGamesCount: (tech.supportedGames || []).length,
                    userHighScore,
                    userBestWpm,
                    userBestAccuracy,
                    userTotalPlays
                };
            }
        } catch {
            // DB fallback
        }

        const tech = memTechnologies.find(t => t.slug === clean);
        if (!tech) return null;

        const cat = memCategories.find(c => c.slug === tech.categorySlug);
        const progKey = `${userId}_${clean}_overall`;
        const prog = userId ? memTechProgress[progKey] : null;

        return {
            ...tech,
            category: cat || null,
            supportedGamesCount: (tech.supportedGames || []).length,
            userHighScore: prog?.highScore || 0,
            userBestWpm: prog?.bestWpm || 0,
            userBestAccuracy: prog?.bestAccuracy || 100,
            userTotalPlays: prog?.totalPlays || 0
        };
    },

    /**
     * Create a new technology (Admin)
     */
    createTechnology: async (data) => {
        const name = String(data.name || '').trim();
        const slug = String(data.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
        const categorySlug = String(data.categorySlug || 'frontend-development').trim();
        const description = String(data.description || '').trim();
        const icon = data.icon || 'code';
        const color = data.color || '#10B981';
        const badge = data.badge || '';
        const supportedGames = Array.isArray(data.supportedGames) ? data.supportedGames : [];
        const isEnabled = data.isEnabled !== false;
        const order = Number(data.order || (memTechnologies.length + 1));

        try {
            // Find or link category
            let cat = await prisma.gameTechCategory.findUnique({ where: { slug: categorySlug } });
            if (!cat) {
                cat = await prisma.gameTechCategory.findFirst();
            }

            const created = await prisma.gameTechnology.create({
                data: {
                    name,
                    slug,
                    categoryId: cat.id,
                    categorySlug: cat.slug,
                    description,
                    icon,
                    color,
                    badge,
                    supportedGames,
                    isEnabled,
                    order
                }
            });
            return created;
        } catch {
            // Memory fallback
        }

        const newTech = {
            id: `tech_${Date.now()}`,
            name,
            slug,
            categorySlug,
            description,
            icon,
            color,
            badge,
            supportedGames,
            isEnabled,
            order,
            createdAt: new Date().toISOString()
        };
        memTechnologies.push(newTech);
        return newTech;
    },

    /**
     * Update an existing technology (Admin)
     */
    updateTechnology: async (idOrSlug, data) => {
        try {
            const existing = await prisma.gameTechnology.findFirst({
                where: {
                    OR: [{ id: String(idOrSlug) }, { slug: String(idOrSlug) }]
                }
            });

            if (existing) {
                const updated = await prisma.gameTechnology.update({
                    where: { id: existing.id },
                    data: {
                        name: data.name !== undefined ? String(data.name).trim() : existing.name,
                        slug: data.slug !== undefined ? String(data.slug).trim() : existing.slug,
                        categorySlug: data.categorySlug !== undefined ? String(data.categorySlug).trim() : existing.categorySlug,
                        description: data.description !== undefined ? String(data.description).trim() : existing.description,
                        icon: data.icon !== undefined ? data.icon : existing.icon,
                        color: data.color !== undefined ? data.color : existing.color,
                        badge: data.badge !== undefined ? data.badge : existing.badge,
                        supportedGames: Array.isArray(data.supportedGames) ? data.supportedGames : existing.supportedGames,
                        isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : existing.isEnabled,
                        order: data.order !== undefined ? Number(data.order) : existing.order
                    }
                });
                return updated;
            }
        } catch {
            // DB fallback
        }

        const idx = memTechnologies.findIndex(t => t.id === idOrSlug || t.slug === idOrSlug);
        if (idx !== -1) {
            memTechnologies[idx] = {
                ...memTechnologies[idx],
                ...data,
                supportedGames: Array.isArray(data.supportedGames) ? data.supportedGames : memTechnologies[idx].supportedGames,
                isEnabled: data.isEnabled !== undefined ? Boolean(data.isEnabled) : memTechnologies[idx].isEnabled,
                order: data.order !== undefined ? Number(data.order) : memTechnologies[idx].order
            };
            return memTechnologies[idx];
        }
        return null;
    },

    /**
     * Delete a technology (Admin)
     */
    deleteTechnology: async (idOrSlug) => {
        try {
            const existing = await prisma.gameTechnology.findFirst({
                where: {
                    OR: [{ id: String(idOrSlug) }, { slug: String(idOrSlug) }]
                }
            });
            if (existing) {
                await prisma.gameTechnology.delete({ where: { id: existing.id } });
                return true;
            }
        } catch {
            // DB fallback
        }

        const initLen = memTechnologies.length;
        memTechnologies = memTechnologies.filter(t => t.id !== idOrSlug && t.slug !== idOrSlug);
        return memTechnologies.length < initLen;
    },

    /**
     * Toggle technology enabled status (Admin)
     */
    toggleTechnology: async (idOrSlug) => {
        let existing = null;
        try {
            existing = await prisma.gameTechnology.findFirst({
                where: {
                    OR: [{ id: String(idOrSlug) }, { slug: String(idOrSlug) }]
                }
            });
        } catch {
            // DB fallback
        }
        if (!existing) {
            existing = memTechnologies.find(t => t.id === idOrSlug || t.slug === idOrSlug);
        }
        if (!existing) return null;
        return TechnologyModel.updateTechnology(existing.id, { isEnabled: !existing.isEnabled });
    },

    /**
     * Record technology-specific game score and progress
     */
    recordTechScore: async ({ userId, techSlug, gameSlug, difficulty, score, wpm = 0, accuracy = 100, durationSeconds = 0 }) => {
        if (!userId) return null;
        const cleanTech = String(techSlug || 'general').toLowerCase();
        const cleanGame = String(gameSlug || 'overall').toLowerCase();
        const numScore = Number(score || 0);
        const numWpm = Number(wpm || 0);
        const numAcc = Number(accuracy || 100);

        try {
            // 1. Overall technology progress record
            const existingOverall = await prisma.userTechProgress.findUnique({
                where: {
                    userId_technology_gameSlug: {
                        userId: String(userId),
                        technology: cleanTech,
                        gameSlug: 'overall'
                    }
                }
            }).catch(() => null);

            let isNewHighScore = false;
            let currentOverallHigh = existingOverall?.highScore || 0;
            if (numScore > currentOverallHigh) {
                isNewHighScore = true;
                currentOverallHigh = numScore;
            }

            await prisma.userTechProgress.upsert({
                where: {
                    userId_technology_gameSlug: {
                        userId: String(userId),
                        technology: cleanTech,
                        gameSlug: 'overall'
                    }
                },
                create: {
                    userId: String(userId),
                    technology: cleanTech,
                    gameSlug: 'overall',
                    difficulty: difficulty || 'All Levels',
                    highScore: numScore,
                    bestWpm: numWpm,
                    bestAccuracy: numAcc,
                    totalPlays: 1,
                    lastPlayedAt: new Date()
                },
                update: {
                    highScore: currentOverallHigh,
                    bestWpm: Math.max(existingOverall?.bestWpm || 0, numWpm),
                    bestAccuracy: Math.max(existingOverall?.bestAccuracy || 0, numAcc),
                    totalPlays: { increment: 1 },
                    lastPlayedAt: new Date()
                }
            });

            // 2. Specific game + technology progress record
            if (cleanGame !== 'overall') {
                const existingGameTech = await prisma.userTechProgress.findUnique({
                    where: {
                        userId_technology_gameSlug: {
                            userId: String(userId),
                            technology: cleanTech,
                            gameSlug: cleanGame
                        }
                    }
                }).catch(() => null);

                await prisma.userTechProgress.upsert({
                    where: {
                        userId_technology_gameSlug: {
                            userId: String(userId),
                            technology: cleanTech,
                            gameSlug: cleanGame
                        }
                    },
                    create: {
                        userId: String(userId),
                        technology: cleanTech,
                        gameSlug: cleanGame,
                        difficulty: difficulty || 'All Levels',
                        highScore: numScore,
                        bestWpm: numWpm,
                        bestAccuracy: numAcc,
                        totalPlays: 1,
                        lastPlayedAt: new Date()
                    },
                    update: {
                        highScore: Math.max(existingGameTech?.highScore || 0, numScore),
                        bestWpm: Math.max(existingGameTech?.bestWpm || 0, numWpm),
                        bestAccuracy: Math.max(existingGameTech?.bestAccuracy || 0, numAcc),
                        totalPlays: { increment: 1 },
                        lastPlayedAt: new Date()
                    }
                });
            }

            return {
                isNewHighScore,
                highScore: currentOverallHigh
            };
        } catch {
            // DB fallback to memory
        }

        const overallKey = `${userId}_${cleanTech}_overall`;
        const gameKey = `${userId}_${cleanTech}_${cleanGame}`;

        const existingOverall = memTechProgress[overallKey] || { highScore: 0, totalPlays: 0, bestWpm: 0, bestAccuracy: 100 };
        const isNewHighScore = numScore > existingOverall.highScore;
        const newHighScore = Math.max(existingOverall.highScore, numScore);

        memTechProgress[overallKey] = {
            userId: String(userId),
            technology: cleanTech,
            gameSlug: 'overall',
            highScore: newHighScore,
            bestWpm: Math.max(existingOverall.bestWpm || 0, numWpm),
            bestAccuracy: Math.max(existingOverall.bestAccuracy || 0, numAcc),
            totalPlays: (existingOverall.totalPlays || 0) + 1,
            lastPlayedAt: new Date().toISOString()
        };

        if (cleanGame !== 'overall') {
            const existingGame = memTechProgress[gameKey] || { highScore: 0, totalPlays: 0, bestWpm: 0, bestAccuracy: 100 };
            memTechProgress[gameKey] = {
                userId: String(userId),
                technology: cleanTech,
                gameSlug: cleanGame,
                highScore: Math.max(existingGame.highScore, numScore),
                bestWpm: Math.max(existingGame.bestWpm || 0, numWpm),
                bestAccuracy: Math.max(existingGame.bestAccuracy || 0, numAcc),
                totalPlays: (existingGame.totalPlays || 0) + 1,
                lastPlayedAt: new Date().toISOString()
            };
        }

        return {
            isNewHighScore,
            highScore: newHighScore
        };
    },

    /**
     * Get user's statistics across all technologies or for a specific technology
     */
    getUserTechStats: async (userId, techSlug = null) => {
        if (!userId) {
            return {
                totalPlays: 0,
                highScore: 0,
                technologiesPlayed: 0,
                perTech: {}
            };
        }

        const cleanTech = techSlug ? String(techSlug).toLowerCase().trim() : null;

        try {
            const where = { userId: String(userId) };
            if (cleanTech) {
                where.technology = cleanTech;
            }

            const records = await prisma.userTechProgress.findMany({ where });
            const perTech = {};
            let totalPlays = 0;
            let highestScore = 0;

            records.forEach(r => {
                if (r.gameSlug === 'overall') {
                    perTech[r.technology] = {
                        highScore: r.highScore || 0,
                        totalPlays: r.totalPlays || 0,
                        bestWpm: r.bestWpm || 0,
                        bestAccuracy: r.bestAccuracy || 100,
                        lastPlayedAt: r.lastPlayedAt
                    };
                    totalPlays += (r.totalPlays || 0);
                    if ((r.highScore || 0) > highestScore) highestScore = r.highScore;
                }
            });

            return {
                totalPlays,
                highScore: highestScore,
                technologiesPlayed: Object.keys(perTech).length,
                perTech
            };
        } catch {
            // DB fallback
        }

        // Memory fallback
        const perTech = {};
        let totalPlays = 0;
        let highestScore = 0;

        Object.keys(memTechProgress).forEach(key => {
            if (key.startsWith(`${userId}_`)) {
                const rec = memTechProgress[key];
                if (rec.gameSlug === 'overall' && (!cleanTech || rec.technology === cleanTech)) {
                    perTech[rec.technology] = {
                        highScore: rec.highScore || 0,
                        totalPlays: rec.totalPlays || 0,
                        bestWpm: rec.bestWpm || 0,
                        bestAccuracy: rec.bestAccuracy || 100,
                        lastPlayedAt: rec.lastPlayedAt
                    };
                    totalPlays += (rec.totalPlays || 0);
                    if ((rec.highScore || 0) > highestScore) highestScore = rec.highScore;
                }
            }
        });

        return {
            totalPlays,
            highScore: highestScore,
            technologiesPlayed: Object.keys(perTech).length,
            perTech
        };
    },

    /**
     * Get platform statistics for Admin Dashboard
     */
    getAdminStatistics: async () => {
        try {
            const [categories, technologies, totalChallenges, scores] = await Promise.all([
                TechnologyModel.getAllCategories({ includeDisabled: true }),
                TechnologyModel.getAllTechnologies({ isEnabled: null }),
                prisma.gameChallenge.count().catch(() => 0),
                prisma.gameScore.findMany({
                    select: { technology: true, gameSlug: true, difficulty: true, score: true, createdAt: true },
                    take: 500,
                    orderBy: { createdAt: 'desc' }
                }).catch(() => [])
            ]);

            const playsByTech = {};
            const playsByDifficulty = { Beginner: 0, Intermediate: 0, Advanced: 0, 'All Levels': 0 };

            scores.forEach(s => {
                const tech = s.technology || 'general';
                playsByTech[tech] = (playsByTech[tech] || 0) + 1;
                const diff = s.difficulty || 'All Levels';
                playsByDifficulty[diff] = (playsByDifficulty[diff] || 0) + 1;
            });

            return {
                totalCategories: categories.length,
                totalTechnologies: technologies.length,
                activeTechnologies: technologies.filter(t => t.isEnabled).length,
                totalChallenges,
                totalScoreSubmissions: scores.length,
                playsByTech,
                playsByDifficulty,
                recentScores: scores.slice(0, 10)
            };
        } catch (err) {
            return {
                totalCategories: memCategories.length,
                totalTechnologies: memTechnologies.length,
                activeTechnologies: memTechnologies.filter(t => t.isEnabled).length,
                totalChallenges: 120,
                totalScoreSubmissions: 0,
                playsByTech: {},
                playsByDifficulty: { Beginner: 0, Intermediate: 0, Advanced: 0, 'All Levels': 0 },
                recentScores: []
            };
        }
    },

    /**
     * Seed initial categories and technologies into MongoDB Atlas
     */
    seedInitialData: async () => {
        try {
            for (const cat of INITIAL_TECH_CATEGORIES) {
                await prisma.gameTechCategory.upsert({
                    where: { slug: cat.slug },
                    create: {
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description,
                        icon: cat.icon,
                        order: cat.order,
                        isEnabled: cat.isEnabled
                    },
                    update: {
                        name: cat.name,
                        description: cat.description,
                        icon: cat.icon,
                        order: cat.order,
                        isEnabled: cat.isEnabled
                    }
                });
            }

            const dbCategories = await prisma.gameTechCategory.findMany();
            const catMap = {};
            dbCategories.forEach(c => {
                catMap[c.slug] = c.id;
                catMap[c.name.toLowerCase().trim()] = c.id;
            });

            for (const tech of INITIAL_TECHNOLOGIES) {
                const catId = catMap[tech.categorySlug] || (tech.categorySlug === 'programming-languages' ? catMap['programming languages'] : null);
                if (catId) {
                    await prisma.gameTechnology.upsert({
                        where: { slug: tech.slug },
                        create: {
                            name: tech.name,
                            slug: tech.slug,
                            categoryId: catId,
                            categorySlug: tech.categorySlug,
                            description: tech.description,
                            icon: tech.icon,
                            color: tech.color,
                            badge: tech.badge,
                            supportedGames: tech.supportedGames,
                            isEnabled: tech.isEnabled,
                            order: tech.order
                        },
                        update: {
                            name: tech.name,
                            categoryId: catId,
                            categorySlug: tech.categorySlug,
                            description: tech.description,
                            icon: tech.icon,
                            color: tech.color,
                            badge: tech.badge,
                            supportedGames: tech.supportedGames,
                            isEnabled: tech.isEnabled,
                            order: tech.order
                        }
                    });
                }
            }
            return true;
        } catch (err) {
            // If connection fails, memory state is already initialized
            return false;
        }
    }
};

module.exports = TechnologyModel;
