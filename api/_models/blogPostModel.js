const prisma = require('../_config/prisma');
const { INITIAL_BLOG_ARTICLES } = require('./blogArticles/initialBlogArticles');

const BLOG_CATEGORIES = [
    { name: 'HTML', slug: 'html', description: 'Semantic markup, modern HTML5, and accessible structure.' },
    { name: 'CSS', slug: 'css', description: 'Responsive layouts, modern styling, Flexbox, and CSS Grid.' },
    { name: 'JavaScript', slug: 'javascript', description: 'Core syntax, asynchronous programming, DOM, and ES6+.' },
    { name: 'PHP', slug: 'php', description: 'Server-side scripting, syntax, functions, and backend foundations.' },
    { name: 'Laravel', slug: 'laravel', description: 'Modern PHP framework, MVC architecture, routing, and Eloquent.' },
    { name: 'MySQL', slug: 'mysql', description: 'Relational database management, SQL queries, joins, and indexing.' },
    { name: 'MongoDB', slug: 'mongodb', description: 'NoSQL document database, aggregations, and data modeling.' },
    { name: 'Flutter', slug: 'flutter', description: 'Cross-platform mobile apps, widget tree, and UI development.' },
    { name: 'Dart', slug: 'dart', description: 'Object-oriented programming language powering Flutter.' },
    { name: 'C#', slug: 'csharp', description: 'Type-safe object-oriented programming for .NET and backend services.' },
    { name: 'Web Development', slug: 'web-development', description: 'Full-stack engineering, performance, security, and protocols.' },
    { name: 'Programming Fundamentals', slug: 'programming-fundamentals', description: 'Algorithms, logic building, data structures, and problem-solving.' }
];

let memArticles = JSON.parse(JSON.stringify(INITIAL_BLOG_ARTICLES));

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const BlogPostModel = {
    BLOG_CATEGORIES,

    /**
     * Get published articles with filtering and pagination
     */
    getPublishedArticles: async ({ category, search, page = 1, limit = 9, tag } = {}) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));

        try {
            if (prisma && prisma.blogPost) {
                const where = { isPublished: true };

                if (category && category !== 'All' && category !== 'all') {
                    where.OR = [
                        { category: { equals: category, mode: 'insensitive' } },
                        { tags: { has: category } }
                    ];
                }

                if (search && search.trim()) {
                    const q = search.trim();
                    const searchConditions = [
                        { title: { contains: q, mode: 'insensitive' } },
                        { excerpt: { contains: q, mode: 'insensitive' } },
                        { content: { contains: q, mode: 'insensitive' } }
                    ];
                    where.AND = (where.AND || []).concat([{ OR: searchConditions }]);
                }

                if (tag && tag.trim()) {
                    where.tags = { has: tag.trim() };
                }

                const [total, articles] = await Promise.all([
                    prisma.blogPost.count({ where }),
                    prisma.blogPost.findMany({
                        where,
                        orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
                        skip: (pageNum - 1) * limitNum,
                        take: limitNum,
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            excerpt: true,
                            category: true,
                            tags: true,
                            difficulty: true,
                            readingTimeMinutes: true,
                            authorName: true,
                            authorRole: true,
                            authorAvatar: true,
                            coverGradient: true,
                            coverImage: true,
                            seoTitle: true,
                            seoDescription: true,
                            isFeatured: true,
                            viewsCount: true,
                            publishedAt: true,
                            createdAt: true
                        }
                    })
                ]);

                if (total > 0 || !category) {
                    return {
                        articles,
                        total,
                        page: pageNum,
                        limit: limitNum,
                        totalPages: Math.ceil(total / limitNum) || 1
                    };
                }
            }
        } catch {
            // DB fallback
        }

        // Memory Fallback
        let filtered = memArticles.filter(a => a.isPublished);

        if (category && category !== 'All' && category !== 'all') {
            const catLower = category.toLowerCase().trim();
            filtered = filtered.filter(a => 
                (a.category && a.category.toLowerCase() === catLower) ||
                (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase() === catLower))
            );
        }

        if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(a =>
                (a.title && a.title.toLowerCase().includes(q)) ||
                (a.excerpt && a.excerpt.toLowerCase().includes(q)) ||
                (a.content && a.content.toLowerCase().includes(q)) ||
                (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        if (tag && tag.trim()) {
            const tLower = tag.toLowerCase().trim();
            filtered = filtered.filter(a =>
                Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase() === tLower)
            );
        }

        filtered.sort((a, b) => (a.order || 999) - (b.order || 999));

        const total = filtered.length;
        const start = (pageNum - 1) * limitNum;
        const articles = filtered.slice(start, start + limitNum);

        return {
            articles,
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1
        };
    },

    /**
     * Get single article by slug with related articles
     */
    getBySlug: async (slug) => {
        if (!slug) return null;
        const safeSlug = String(slug).toLowerCase().trim();

        let article = null;
        let relatedArticles = [];

        try {
            if (prisma && prisma.blogPost) {
                article = await prisma.blogPost.findUnique({
                    where: { slug: safeSlug }
                });

                if (article) {
                    // Increment view count asynchronously
                    prisma.blogPost.update({
                        where: { slug: safeSlug },
                        data: { viewsCount: { increment: 1 } }
                    }).catch(() => {});

                    relatedArticles = await prisma.blogPost.findMany({
                        where: {
                            slug: { not: safeSlug },
                            isPublished: true,
                            OR: [
                                { category: article.category },
                                { tags: { hasSome: article.tags || [] } }
                            ]
                        },
                        take: 3,
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            excerpt: true,
                            category: true,
                            readingTimeMinutes: true,
                            coverGradient: true,
                            publishedAt: true
                        }
                    });

                    return { article, relatedArticles };
                }
            }
        } catch {
            // DB fallback
        }

        // Memory fallback
        article = memArticles.find(a => a.slug === safeSlug);
        if (!article) return null;

        article.viewsCount = (article.viewsCount || 0) + 1;

        relatedArticles = memArticles
            .filter(a => a.slug !== safeSlug && a.isPublished)
            .filter(a => a.category === article.category || (a.tags && article.tags && a.tags.some(t => article.tags.includes(t))))
            .slice(0, 3)
            .map(a => ({
                id: a.id,
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                category: a.category,
                readingTimeMinutes: a.readingTimeMinutes,
                coverGradient: a.coverGradient,
                publishedAt: a.publishedAt
            }));

        return { article, relatedArticles };
    },

    /**
     * Get featured article for blog hero section
     */
    getFeaturedArticle: async () => {
        try {
            if (prisma && prisma.blogPost) {
                const featured = await prisma.blogPost.findFirst({
                    where: { isPublished: true, isFeatured: true },
                    orderBy: { publishedAt: 'desc' }
                });
                if (featured) return featured;

                const latest = await prisma.blogPost.findFirst({
                    where: { isPublished: true },
                    orderBy: { publishedAt: 'desc' }
                });
                if (latest) return latest;
            }
        } catch {
            // DB fallback
        }

        return memArticles.find(a => a.isPublished && a.isFeatured) ||
            memArticles.find(a => a.isPublished) ||
            null;
    },

    /**
     * Get technology categories with count.
     * Rule: Only display categories that have published articles (count > 0).
     */
    getCategoriesWithCount: async () => {
        const counts = {};

        try {
            if (prisma && prisma.blogPost) {
                const groupCounts = await prisma.blogPost.groupBy({
                    by: ['category'],
                    where: { isPublished: true },
                    _count: { category: true }
                });

                if (Array.isArray(groupCounts) && groupCounts.length > 0) {
                    groupCounts.forEach(g => {
                        if (g.category) counts[g.category.toLowerCase()] = g._count.category;
                    });
                }
            }
        } catch {
            // DB fallback
        }

        if (Object.keys(counts).length === 0) {
            memArticles.filter(a => a.isPublished).forEach(a => {
                if (a.category) {
                    const key = a.category.toLowerCase();
                    counts[key] = (counts[key] || 0) + 1;
                }
            });
        }

        // Return only categories with count > 0
        const activeCategories = BLOG_CATEGORIES.map(cat => ({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            count: counts[cat.name.toLowerCase()] || counts[cat.slug.toLowerCase()] || 0
        })).filter(c => c.count > 0);

        return activeCategories;
    },

    /**
     * Admin: Get all articles (drafts & published) with pagination
     */
    getAdminArticles: async ({ search, category, status, page = 1, limit = 20 } = {}) => {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

        try {
            if (prisma && prisma.blogPost) {
                const where = {};
                if (status === 'published') where.isPublished = true;
                if (status === 'draft') where.isPublished = false;
                if (category && category !== 'All') where.category = category;
                if (search && search.trim()) {
                    where.OR = [
                        { title: { contains: search.trim(), mode: 'insensitive' } },
                        { slug: { contains: search.trim(), mode: 'insensitive' } }
                    ];
                }

                const [total, articles] = await Promise.all([
                    prisma.blogPost.count({ where }),
                    prisma.blogPost.findMany({
                        where,
                        orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
                        skip: (pageNum - 1) * limitNum,
                        take: limitNum
                    })
                ]);

                return {
                    articles,
                    total,
                    page: pageNum,
                    totalPages: Math.ceil(total / limitNum) || 1
                };
            }
        } catch {
            // DB fallback
        }

        let filtered = [...memArticles];
        if (status === 'published') filtered = filtered.filter(a => a.isPublished);
        if (status === 'draft') filtered = filtered.filter(a => !a.isPublished);
        if (category && category !== 'All') filtered = filtered.filter(a => a.category === category);
        if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q));
        }

        const total = filtered.length;
        const start = (pageNum - 1) * limitNum;
        return {
            articles: filtered.slice(start, start + limitNum),
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1
        };
    },

    /**
     * Admin: Create a new blog post
     */
    createArticle: async (data) => {
        const title = (data.title || '').trim();
        if (!title) throw new Error('Article title is required.');

        const slug = slugify(data.slug || title);
        const category = (data.category || 'Web Development').trim();
        const excerpt = (data.excerpt || '').trim();
        const content = (data.content || '').trim();
        const tags = Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        const readingTimeMinutes = parseInt(data.readingTimeMinutes, 10) || Math.max(3, Math.round(content.split(/\s+/).length / 200));

        const newPost = {
            slug,
            title,
            excerpt,
            content,
            category,
            tags,
            difficulty: data.difficulty || 'Beginner',
            readingTimeMinutes,
            authorName: data.authorName || 'Hangbug Editorial Team',
            authorRole: data.authorRole || 'Technical Educators & Full-Stack Developers',
            authorBio: data.authorBio || 'The Hangbug team creates practical programming quizzes and developer tutorials.',
            authorAvatar: data.authorAvatar || 'HB',
            coverGradient: data.coverGradient || 'gradient-indigo',
            coverImage: data.coverImage || '/branding/hangbug-logo-full.png',
            seoTitle: data.seoTitle || `${title} | Hangbug`,
            seoDescription: data.seoDescription || excerpt,
            seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords : tags,
            canonicalUrl: data.canonicalUrl || `https://www.hangbug.com/blog/${slug}`,
            relatedQuizCategory: data.relatedQuizCategory || category,
            relatedGameSlug: data.relatedGameSlug || 'code-puzzle',
            keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [],
            isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
            isFeatured: Boolean(data.isFeatured),
            viewsCount: 0,
            order: parseInt(data.order, 10) || (memArticles.length + 1),
            publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date()
        };

        try {
            if (prisma && prisma.blogPost) {
                const created = await prisma.blogPost.create({ data: newPost });
                memArticles.push(created);
                return created;
            }
        } catch {
            // DB fallback
        }

        newPost.id = 'article_' + Date.now();
        memArticles.push(newPost);
        return newPost;
    },

    /**
     * Admin: Update an existing article
     */
    updateArticle: async (id, data) => {
        const updateData = {};
        if (data.title !== undefined) updateData.title = data.title.trim();
        if (data.slug !== undefined) updateData.slug = slugify(data.slug);
        if (data.category !== undefined) updateData.category = data.category.trim();
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt.trim();
        if (data.content !== undefined) updateData.content = data.content.trim();
        if (data.tags !== undefined) {
            updateData.tags = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
        if (data.readingTimeMinutes !== undefined) updateData.readingTimeMinutes = parseInt(data.readingTimeMinutes, 10);
        if (data.authorName !== undefined) updateData.authorName = data.authorName;
        if (data.authorRole !== undefined) updateData.authorRole = data.authorRole;
        if (data.authorBio !== undefined) updateData.authorBio = data.authorBio;
        if (data.coverGradient !== undefined) updateData.coverGradient = data.coverGradient;
        if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
        if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
        if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
        if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl;
        if (data.relatedQuizCategory !== undefined) updateData.relatedQuizCategory = data.relatedQuizCategory;
        if (data.relatedGameSlug !== undefined) updateData.relatedGameSlug = data.relatedGameSlug;
        if (data.keyTakeaways !== undefined) {
            updateData.keyTakeaways = Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [];
        }
        if (data.isPublished !== undefined) updateData.isPublished = Boolean(data.isPublished);
        if (data.isFeatured !== undefined) updateData.isFeatured = Boolean(data.isFeatured);
        if (data.order !== undefined) updateData.order = parseInt(data.order, 10);

        try {
            if (prisma && prisma.blogPost) {
                const updated = await prisma.blogPost.update({
                    where: { id: String(id) },
                    data: updateData
                });
                const idx = memArticles.findIndex(a => a.id === id || a.slug === updateData.slug);
                if (idx !== -1) memArticles[idx] = { ...memArticles[idx], ...updated };
                return updated;
            }
        } catch {
            // DB fallback
        }

        const idx = memArticles.findIndex(a => a.id === id || a.slug === id);
        if (idx !== -1) {
            memArticles[idx] = { ...memArticles[idx], ...updateData, updatedAt: new Date() };
            return memArticles[idx];
        }

        throw new Error('Article not found.');
    },

    /**
     * Admin: Delete article
     */
    deleteArticle: async (id) => {
        try {
            if (prisma && prisma.blogPost) {
                await prisma.blogPost.delete({ where: { id: String(id) } });
            }
        } catch {
            // DB fallback
        }

        const idx = memArticles.findIndex(a => a.id === id || a.slug === id);
        if (idx !== -1) {
            memArticles.splice(idx, 1);
        }
        return { success: true };
    },

    /**
     * Admin: Toggle publish status
     */
    togglePublish: async (id) => {
        let current = memArticles.find(a => a.id === id || a.slug === id);
        let newStatus = current ? !current.isPublished : true;

        try {
            if (prisma && prisma.blogPost) {
                const dbPost = await prisma.blogPost.findUnique({ where: { id: String(id) } });
                if (dbPost) {
                    newStatus = !dbPost.isPublished;
                    const updated = await prisma.blogPost.update({
                        where: { id: String(id) },
                        data: { isPublished: newStatus }
                    });
                    if (current) current.isPublished = newStatus;
                    return updated;
                }
            }
        } catch {
            // DB fallback
        }

        if (current) {
            current.isPublished = newStatus;
            return current;
        }

        throw new Error('Article not found.');
    },

    /**
     * Seed or sync initial articles to MongoDB Atlas
     */
    seedArticles: async () => {
        memArticles = JSON.parse(JSON.stringify(INITIAL_BLOG_ARTICLES));

        let seededCount = 0;
        try {
            if (prisma && prisma.blogPost) {
                for (const article of INITIAL_BLOG_ARTICLES) {
                    await prisma.blogPost.upsert({
                        where: { slug: article.slug },
                        update: {
                            title: article.title,
                            excerpt: article.excerpt,
                            content: article.content,
                            category: article.category,
                            tags: article.tags,
                            difficulty: article.difficulty,
                            readingTimeMinutes: article.readingTimeMinutes,
                            authorName: article.authorName,
                            authorRole: article.authorRole,
                            authorBio: article.authorBio,
                            authorAvatar: article.authorAvatar,
                            coverGradient: article.coverGradient,
                            coverImage: article.coverImage,
                            seoTitle: article.seoTitle,
                            seoDescription: article.seoDescription,
                            seoKeywords: article.seoKeywords,
                            canonicalUrl: article.canonicalUrl,
                            relatedQuizCategory: article.relatedQuizCategory,
                            relatedGameSlug: article.relatedGameSlug,
                            keyTakeaways: article.keyTakeaways,
                            isPublished: article.isPublished,
                            isFeatured: article.isFeatured,
                            order: article.order
                        },
                        create: {
                            slug: article.slug,
                            title: article.title,
                            excerpt: article.excerpt,
                            content: article.content,
                            category: article.category,
                            tags: article.tags,
                            difficulty: article.difficulty,
                            readingTimeMinutes: article.readingTimeMinutes,
                            authorName: article.authorName,
                            authorRole: article.authorRole,
                            authorBio: article.authorBio,
                            authorAvatar: article.authorAvatar,
                            coverGradient: article.coverGradient,
                            coverImage: article.coverImage,
                            seoTitle: article.seoTitle,
                            seoDescription: article.seoDescription,
                            seoKeywords: article.seoKeywords,
                            canonicalUrl: article.canonicalUrl,
                            relatedQuizCategory: article.relatedQuizCategory,
                            relatedGameSlug: article.relatedGameSlug,
                            keyTakeaways: article.keyTakeaways,
                            isPublished: article.isPublished,
                            isFeatured: article.isFeatured,
                            order: article.order,
                            publishedAt: article.publishedAt
                        }
                    });
                    seededCount++;
                }
            }
        } catch {
            // DB fallback
        }

        return { success: true, count: seededCount || memArticles.length };
    }
};

module.exports = BlogPostModel;
