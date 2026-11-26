const fs = require('fs');
const path = require('path');
const {
    ensureMarkdownParser,
    isMongoUriConfigured,
    buildArticleSeoTitle,
    formatSeoTitleWithBrand,
    formatGameSeoTitle,
    renderCompleteBlogArticleHtml,
    renderCompleteBlogIndexHtml,
    renderStaticFooterHtml,
    renderVisible404BodyHtml,
    applyHeadMetadata,
    findRelatedForArticle,
    deriveCategoriesFromArticles
} = require('../_utils/blogSeoRenderer');
const {
    GAMES_SEO_LIST,
    GAMES_SEO_MAP,
    TECH_SEO_KEYS,
    resolveStaticHeaderForPath,
    generatePublicBodyHtml,
    generateHomeBodyHtml,
    buildGameBodyHtml,
    buildLegalPageBodyHtml,
    buildPublicPageStructuredDataFallback,
    resolveCoreFallbackMeta,
    renderPublicPageHtml
} = require('../_utils/publicPageSeoRenderer');

const BASE_URL = 'https://www.hangbug.com';
const ROOT_DIR = path.resolve(__dirname, '../..');

const CORE_PUBLIC_ROUTES = [
    { loc: '/', changefreq: 'daily', priority: '1.0', lastmod: '2026-11-17T13:34:27.000Z' },
    { loc: '/technologies', changefreq: 'daily', priority: '0.9', lastmod: '2026-11-18T12:28:38.000Z' },
    { loc: '/games', changefreq: 'daily', priority: '0.9', lastmod: '2026-11-17T15:52:06.672Z' },
    { loc: '/leaderboard', changefreq: 'daily', priority: '0.8', lastmod: '2026-11-13T14:09:48.000Z' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7', lastmod: '2026-11-10T14:11:47.000Z' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7', lastmod: '2026-11-26T12:32:16.000Z' },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.6', lastmod: '2026-11-26T12:32:16.000Z' },
    { loc: '/terms', changefreq: 'monthly', priority: '0.6', lastmod: '2026-11-26T12:32:16.000Z' },
    { loc: '/blog', changefreq: 'daily', priority: '0.9', lastmod: '2026-11-18T17:14:26.781Z' }
];

const TECHNOLOGY_GUIDE_CONFIGS = [
    { slug: 'html', matchers: ['html', 'html & css'], defaultPopulated: true, fallbackLastmod: '2026-11-10T13:23:06.010Z' },
    { slug: 'css', matchers: ['css', 'html & css'], defaultPopulated: true, fallbackLastmod: '2026-11-18T12:28:38.000Z' },
    { slug: 'javascript', matchers: ['javascript', 'php, xml json, laravel, mysql, javascript'], defaultPopulated: true, fallbackLastmod: '2026-11-17T19:00:28.190Z' },
    { slug: 'react', matchers: ['react.js', 'react'], defaultPopulated: true, fallbackLastmod: '2026-11-19T11:52:22.776Z' },
    { slug: 'php', matchers: ['php', 'php, xml json, laravel, mysql, javascript'], defaultPopulated: true, fallbackLastmod: '2026-11-17T19:00:28.190Z' },
    { slug: 'laravel', matchers: ['laravel', 'php, xml json, laravel, mysql, javascript'], defaultPopulated: true, fallbackLastmod: '2026-11-17T19:00:28.190Z' },
    { slug: 'mysql', matchers: ['mysql', 'sql', 'sql server', 'php, xml json, laravel, mysql, javascript'], defaultPopulated: true, fallbackLastmod: '2026-11-17T19:00:28.190Z' },
    { slug: 'mongodb', matchers: ['mongodb', 'mongo db'], defaultPopulated: true, fallbackLastmod: '2026-11-19T11:52:22.776Z' },
    { slug: 'flutter', matchers: ['flutter'], defaultPopulated: true, fallbackLastmod: '2026-11-18T12:28:38.000Z' },
    { slug: 'dart', matchers: ['dart'], defaultPopulated: true, fallbackLastmod: '2026-11-11T12:35:09.075Z' },
    { slug: 'python', matchers: ['python'], defaultPopulated: true, fallbackLastmod: '2026-08-18T11:28:57.074Z' },
    { slug: 'programming-fundamentals', matchers: ['programming fundamentals', 'programming logic', 'oop', 'dsa'], defaultPopulated: true, fallbackLastmod: '2026-11-18T12:28:38.000Z' },
    { slug: 'typescript', matchers: ['typescript', 'ts'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'nextjs', matchers: ['next.js', 'nextjs', 'next js'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'docker', matchers: ['docker'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'sql', matchers: ['sql'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'tailwindcss', matchers: ['tailwind css', 'tailwindcss', 'tailwind'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'git', matchers: ['git'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'github', matchers: ['github'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'angular', matchers: ['angular', 'angularjs', 'angular js'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'vue', matchers: ['vue', 'vue.js', 'vuejs', 'vue js'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'django', matchers: ['django'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'bootstrap', matchers: ['bootstrap'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' },
    { slug: 'wordpress', matchers: ['wordpress', 'word press'], defaultPopulated: false, fallbackLastmod: '2026-11-25T12:00:00.000Z' }
];

const PUBLIC_ROUTES = [
    ...CORE_PUBLIC_ROUTES,
    ...TECHNOLOGY_GUIDE_CONFIGS
        .filter(t => t.defaultPopulated)
        .map(t => ({
            loc: `/technologies/${t.slug}`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: t.fallbackLastmod
        }))
];

const GAME_SLUGS = [
    'code-puzzle',
    'find-the-bug',
    'output-predictor',
    'code-scramble',
    'missing-code',
    'logic-builder',
    'sql-challenge',
    'memory-match',
    'speed-typing',
    'code-typing',
    'sixty-second-challenge',
    'error-free-typing',
    'syntax-typing',
    'word-rain',
    'csharp-oop-challenge',
    'csharp-collections-challenge',
    'csharp-linq-challenge',
    'csharp-exception-handling',
    'complete-the-code',
    'csharp-quiz-challenge'
];

const RUNTIME_EXTRA_GAME_SLUGS = new Set([
    'csharp-oop-challenge',
    'csharp-collections-challenge',
    'csharp-linq-challenge',
    'csharp-exception-handling',
    'complete-the-code',
    'csharp-quiz-challenge'
]);

const DEFAULT_GAME_LASTMODS = {
    'code-puzzle': '2026-11-19T09:31:24.862Z',
    'find-the-bug': '2026-11-19T09:32:03.978Z',
    'output-predictor': '2026-11-10T19:39:12.387Z',
    'code-scramble': '2026-11-02T10:06:19.372Z',
    'missing-code': '2026-11-02T10:06:19.372Z',
    'logic-builder': '2026-11-02T10:06:19.372Z',
    'sql-challenge': '2026-11-02T10:06:19.372Z',
    'memory-match': '2026-11-10T19:40:09.568Z',
    'speed-typing': '2026-11-07T13:43:42.301Z',
    'code-typing': '2026-11-02T10:06:19.372Z',
    'sixty-second-challenge': '2026-11-07T13:45:08.860Z',
    'error-free-typing': '2026-11-02T10:06:19.372Z',
    'syntax-typing': '2026-11-06T12:31:24.352Z',
    'word-rain': '2026-11-17T15:52:06.672Z',
    'csharp-oop-challenge': '2026-11-18T12:00:00.000Z',
    'csharp-collections-challenge': '2026-11-18T12:00:00.000Z',
    'csharp-linq-challenge': '2026-11-18T12:00:00.000Z',
    'csharp-exception-handling': '2026-11-18T12:00:00.000Z',
    'complete-the-code': '2026-11-18T12:00:00.000Z',
    'csharp-quiz-challenge': '2026-11-18T12:00:00.000Z'
};

const BLOG_SLUGS = [
    'html-tutorial-for-beginners',
    'css-basics-beginners-guide',
    'javascript-fundamentals-beginners-guide',
    'php-programming-beginners-guide',
    'laravel-basics-mvc-architecture',
    'flutter-dart-mobile-app-development'
];

const DEFAULT_BLOG_LASTMODS = {
    'html-tutorial-for-beginners': '2026-11-18T17:14:26.781Z',
    'css-basics-beginners-guide': '2026-11-18T11:20:16.158Z',
    'javascript-fundamentals-beginners-guide': '2026-11-18T11:20:14.512Z',
    'php-programming-beginners-guide': '2026-11-18T11:20:16.092Z',
    'laravel-basics-mvc-architecture': '2026-11-18T11:20:16.347Z',
    'flutter-dart-mobile-app-development': '2026-11-18T11:20:14.814Z'
};

const REDIRECT_OR_EXCLUDED_SITEMAP_PATHS = new Set([
    '/resources',
    '/privacy',
    '/account-deletion',
    '/data-deletion',
    '/quizzes',
    '/quiz',
    '/technologies/level',
    '/technologies/reactjs',
    '/technologies/react.js',
    '/technologies/js',
    '/technologies/html5',
    '/technologies/css3',
    '/technologies/fundamentals',
    '/technologies/programming-logic',
    '/games/coding-memory-match',
    '/games/csharp-complete-the-code',
    '/games/complete-the-code-csharp',
    '/seo',
    '/admin/seo',
    '/certificates',
    '/profile',
    '/settings'
]);

function escapeXml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toIsoLastmod(value, fallback = '2026-11-18T12:00:00.000Z') {
    if (value) {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }
    if (fallback) {
        const parsedFallback = new Date(fallback);
        if (!Number.isNaN(parsedFallback.getTime())) {
            return parsedFallback.toISOString();
        }
    }
    return '2026-11-18T12:00:00.000Z';
}

function resolvePopulatedTechnologyRoutes(categoriesWithStats = []) {
    if (!Array.isArray(categoriesWithStats) || categoriesWithStats.length === 0) {
        return TECHNOLOGY_GUIDE_CONFIGS
            .filter(t => t.defaultPopulated)
            .map(t => ({
                loc: `/technologies/${t.slug}`,
                changefreq: 'weekly',
                priority: '0.8',
                lastmod: t.fallbackLastmod
            }));
    }

    const activeCategories = categoriesWithStats.filter(
        c => c && c.isEnabled !== false && Number(c.questionCount || 0) > 0
    );

    const routes = [];
    for (const guide of TECHNOLOGY_GUIDE_CONFIGS) {
        const matched = activeCategories.filter(cat => {
            const cName = String(cat.name || '').toLowerCase();
            return guide.matchers.some(m => cName === m || cName.includes(m));
        });
        if (matched.length === 0) continue;

        let latestMs = 0;
        for (const cat of matched) {
            const ts = cat.latestQuestionAt || cat.updatedAt || cat.createdAt;
            if (ts) {
                const ms = new Date(ts).getTime();
                if (!Number.isNaN(ms) && ms > latestMs) latestMs = ms;
            }
        }

        routes.push({
            loc: `/technologies/${guide.slug}`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: latestMs > 0 ? new Date(latestMs).toISOString() : guide.fallbackLastmod
        });
    }
    return routes;
}

function buildSitemapXml(extraSlugs = [], extraBlogSlugs = [], options = {}) {
    const routeLastmodOverrides = options?.routeLastmodOverrides || {};

    const techRoutes = Array.isArray(options?.techEntriesOverride)
        ? options.techEntriesOverride
        : Array.isArray(options?.categoriesWithStats)
            ? resolvePopulatedTechnologyRoutes(options.categoriesWithStats)
            : TECHNOLOGY_GUIDE_CONFIGS
                  .filter(t => t.defaultPopulated)
                  .map(t => ({
                      loc: `/technologies/${t.slug}`,
                      changefreq: 'weekly',
                      priority: '0.8',
                      lastmod: t.fallbackLastmod
                  }));

    const gameEntries = Array.isArray(options?.gameEntriesOverride)
        ? options.gameEntriesOverride
              .filter(g => g && g.slug && !GAME_ALIAS_SLUGS.has(String(g.slug).toLowerCase()))
              .map(g => ({
                  slug: String(g.slug).trim().toLowerCase(),
                  lastmod: toIsoLastmod(g.updatedAt || g.createdAt, DEFAULT_GAME_LASTMODS[g.slug] || '2026-11-02T10:06:19.372Z')
              }))
        : Array.from(
              new Set(
                  [...GAME_SLUGS, ...(Array.isArray(extraSlugs) ? extraSlugs : [])]
                      .map(s => String(s || '').trim().toLowerCase())
                      .filter(slug => slug && !GAME_ALIAS_SLUGS.has(slug))
              )
          ).map(slug => ({
              slug,
              lastmod: DEFAULT_GAME_LASTMODS[slug] || '2026-11-02T10:06:19.372Z'
          }));

    const blogEntries = Array.isArray(options?.blogEntriesOverride)
        ? options.blogEntriesOverride
              .filter(b => b && b.slug)
              .map(b => ({
                  slug: String(b.slug).trim().toLowerCase(),
                  lastmod: toIsoLastmod(b.updatedAt || b.publishedAt || b.createdAt, DEFAULT_BLOG_LASTMODS[b.slug] || '2026-11-18T11:20:16.000Z')
              }))
        : Array.isArray(options?.blogSlugsOverride)
            ? Array.from(new Set(options.blogSlugsOverride.filter(Boolean))).map(slug => ({
                  slug: String(slug).trim().toLowerCase(),
                  lastmod: DEFAULT_BLOG_LASTMODS[slug] || '2026-11-18T11:20:16.000Z'
              }))
            : Array.from(
                  new Set(
                      [...BLOG_SLUGS, ...(Array.isArray(extraBlogSlugs) ? extraBlogSlugs : [])]
                          .map(s => String(s || '').trim().toLowerCase())
                          .filter(Boolean)
                  )
              ).map(slug => ({
                  slug,
                  lastmod: DEFAULT_BLOG_LASTMODS[slug] || '2026-11-18T11:20:16.000Z'
              }));

    // Derive aggregate hub lastmods from actual content if not explicitly overridden
    const latestGameMs = gameEntries.reduce((max, g) => Math.max(max, new Date(g.lastmod).getTime() || 0), 0);
    const latestBlogMs = blogEntries.reduce((max, b) => Math.max(max, new Date(b.lastmod).getTime() || 0), 0);
    const latestTechMs = techRoutes.reduce((max, t) => Math.max(max, new Date(t.lastmod).getTime() || 0), 0);

    const resolvedCoreRoutes = CORE_PUBLIC_ROUTES.map(r => {
        let lastmod = routeLastmodOverrides[r.loc] || r.lastmod;
        if (!routeLastmodOverrides[r.loc]) {
            if (r.loc === '/games' && latestGameMs > 0) {
                lastmod = new Date(latestGameMs).toISOString();
            } else if (r.loc === '/blog' && latestBlogMs > 0) {
                lastmod = new Date(latestBlogMs).toISOString();
            } else if (r.loc === '/technologies' && latestTechMs > 0) {
                lastmod = new Date(latestTechMs).toISOString();
            }
        }
        return { ...r, lastmod: toIsoLastmod(lastmod, r.lastmod) };
    });

    const rawEntries = [
        ...resolvedCoreRoutes,
        ...techRoutes.map(t => ({
            loc: t.loc,
            lastmod: toIsoLastmod(t.lastmod),
            changefreq: t.changefreq || 'weekly',
            priority: t.priority || '0.8'
        })),
        ...gameEntries.map(g => ({
            loc: `/games/${g.slug}`,
            lastmod: toIsoLastmod(g.lastmod),
            changefreq: 'weekly',
            priority: '0.8'
        })),
        ...blogEntries.map(b => ({
            loc: `/blog/${b.slug}`,
            lastmod: toIsoLastmod(b.lastmod),
            changefreq: 'weekly',
            priority: '0.8'
        }))
    ];

    const seenLocs = new Set();
    const urls = [];
    for (const entry of rawEntries) {
        const cleanPath = normalizePathname(entry.loc);
        if (!cleanPath) continue;
        if (REDIRECT_OR_EXCLUDED_SITEMAP_PATHS.has(cleanPath)) continue;
        if (isNoindexAppRoute(cleanPath)) continue;

        const fullLoc = `${BASE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
        if (seenLocs.has(fullLoc)) continue;
        seenLocs.add(fullLoc);

        urls.push(
            `  <url>\n    <loc>${escapeXml(fullLoc)}</loc>\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n    <changefreq>${escapeXml(entry.changefreq)}</changefreq>\n    <priority>${escapeXml(entry.priority)}</priority>\n  </url>`
        );
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function buildRobotsTxt() {
    return `# Hangbug Robots Policy
# https://www.hangbug.com

User-agent: *
Allow: /
Allow: /favicon.ico
Allow: /favicon-32x32.png
Allow: /favicon-48x48.png
Allow: /favicon.png
Allow: /apple-touch-icon.png
Allow: /branding/

# Disallow private user dashboards, admin pages, authentication endpoints and APIs
Disallow: /api/
Disallow: /admin
Disallow: /admin/
Disallow: /dashboard
Disallow: /dashboard/
Disallow: /login
Disallow: /signup
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /reset-password/
Disallow: /delete-account
Disallow: /account-deletion
Disallow: /data-deletion
Disallow: /quiz/start
Disallow: /quiz/result

User-agent: Googlebot-Image
Allow: /favicon.ico
Allow: /favicon-32x32.png
Allow: /favicon-48x48.png
Allow: /favicon.png
Allow: /apple-touch-icon.png
Allow: /branding/

# Canonical Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

async function getDynamicSitemap(req, res) {
    let gameEntriesOverride = null;
    let blogEntriesOverride = null;
    let categoriesWithStats = null;

    try {
        if (isMongoUriConfigured(process.env.MONGODB_URI)) {
            const prisma = require('../_config/prisma');
            if (prisma) {
                if (prisma.game && typeof prisma.game.findMany === 'function') {
                    try {
                        const gameQueries = [
                            typeof prisma.game.count === 'function' ? prisma.game.count() : Promise.resolve(null),
                            prisma.game.findMany({
                                where: { isPublished: true },
                                select: { slug: true, updatedAt: true, createdAt: true },
                                orderBy: { order: 'asc' }
                            })
                        ];
                        const [totalGames, dbGames] = await Promise.race([
                            Promise.all(gameQueries),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
                        ]);
                        if ((totalGames === null || totalGames > 0) && Array.isArray(dbGames) && (totalGames !== null || dbGames.length > 0)) {
                            gameEntriesOverride = dbGames.filter(g => g && g.slug);
                        }
                    } catch {
                        // Fallback to default game slugs
                    }
                }
                if (prisma.blogPost && typeof prisma.blogPost.findMany === 'function') {
                    try {
                        const [totalBlogs, dbBlogPosts] = await Promise.race([
                            Promise.all([
                                typeof prisma.blogPost.count === 'function' ? prisma.blogPost.count() : Promise.resolve(1),
                                prisma.blogPost.findMany({
                                    where: { isPublished: true },
                                    select: { slug: true, updatedAt: true, publishedAt: true, createdAt: true },
                                    orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }]
                                })
                            ]),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
                        ]);
                        if (totalBlogs > 0 && Array.isArray(dbBlogPosts)) {
                            blogEntriesOverride = dbBlogPosts.filter(b => b && b.slug);
                        }
                    } catch {
                        // Fallback to default blog slugs
                    }
                }
                if (prisma.category && prisma.question && typeof prisma.category.findMany === 'function' && typeof prisma.question.groupBy === 'function') {
                    try {
                        const [cats, qStats] = await Promise.race([
                            Promise.all([
                                prisma.category.findMany(),
                                prisma.question.groupBy({
                                    by: ['category'],
                                    _count: { id: true },
                                    _max: { createdAt: true }
                                })
                            ]),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
                        ]);
                        if (Array.isArray(cats) && Array.isArray(qStats)) {
                            const { resolveCategoryQuestionStats } = require('../_utils/categoryMatching');
                            const { AGILE_DEVOPS_QUESTIONS } = require('../_models/agileDevopsQuestionsData');
                            const { CSHARP_QUIZ_QUESTIONS } = require('../_models/csharpQuizQuestionsData');
                            categoriesWithStats = resolveCategoryQuestionStats(cats, qStats, {
                                'Agile & DevOps': AGILE_DEVOPS_QUESTIONS.length,
                                'C#': CSHARP_QUIZ_QUESTIONS.length
                            });
                        }
                    } catch {
                        // Fallback to default populated technology routes
                    }
                }
            }
        }
    } catch {
        // Fallback to deterministic defaults if DB is offline
    }

    const xml = buildSitemapXml([], [], {
        gameEntriesOverride,
        blogEntriesOverride,
        categoriesWithStats
    });
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=43200');
    return res.status(200).send(xml);
}

function getRobotsTxt(req, res) {
    const robots = buildRobotsTxt();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(robots);
}

const STATIC_PREFIXES = [
    '/assets',
    '/branding',
    '/.well-known',
    '/favicon',
    '/apple-touch-icon',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
    '/ads.txt',
    '/app-ads.txt',
    '/manifest.json'
];

const KNOWN_EXACT_ROUTES = new Set([
    '/',
    '/technologies',
    '/games',
    '/blog',
    '/leaderboard',
    '/leaderboard/full',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/delete-account',
    '/certificate/view',
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/admin',
    '/admin/knowledge-base',
    '/admin/verification-reports',
    '/admin/ai-controls',
    '/dashboard',
    '/dashboard/technologies',
    '/dashboard/quizzes',
    '/dashboard/certificates',
    '/dashboard/leaderboard',
    '/dashboard/leaderboard/full',
    '/dashboard/profile',
    '/dashboard/settings',
    '/dashboard/seo',
    '/dashboard/admin',
    '/quiz/start',
    '/quiz/result'
]);

const TECH_SLUGS = new Set([
    'html', 'css', 'javascript', 'react', 'php', 'laravel',
    'mysql', 'mongodb', 'flutter', 'dart', 'python', 'programming-fundamentals',
    'typescript', 'nextjs', 'docker', 'sql', 'tailwindcss', 'git',
    'github', 'angular', 'vue', 'django', 'bootstrap', 'wordpress',
    // Aliases
    'reactjs', 'react.js', 'js', 'html5', 'css3', 'fundamentals', 'programming-logic',
    'ts', 'next.js', 'next', 'tailwind', 'tailwind-css', 'angularjs', 'vuejs', 'vue.js'
]);

const GAME_ALIAS_SLUGS = new Set([
    'coding-memory-match',
    'csharp-complete-the-code',
    'complete-the-code-csharp',
    'quiz-challenge-csharp',
    'csharp-quiz',
    'csharp-code-puzzle',
    'code-puzzle-csharp',
    'find-the-bug-csharp',
    'csharp-find-the-bug',
    'csharp-output-predictor',
    'output-predictor-csharp',
    'csharp-code-scramble',
    'code-scramble-csharp',
    'csharp-missing-code',
    'missing-code-csharp',
    'csharp-logic-builder',
    'logic-builder-csharp',
    'csharp-speed-typing',
    'csharp-syntax-typing',
    'csharp-code-typing',
    'csharp-accuracy-challenge'
]);

const NOINDEX_EXACT_ROUTES = new Set([
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/delete-account',
    '/account-deletion',
    '/data-deletion',
    '/certificate/view',
    '/leaderboard/full',
    '/admin',
    '/admin/knowledge-base',
    '/admin/verification-reports',
    '/admin/ai-controls',
    '/dashboard',
    '/dashboard/technologies',
    '/dashboard/quizzes',
    '/dashboard/certificates',
    '/dashboard/leaderboard',
    '/dashboard/leaderboard/full',
    '/dashboard/profile',
    '/dashboard/settings',
    '/dashboard/seo',
    '/dashboard/admin',
    '/quiz/start',
    '/quiz/result'
]);

const SEO_DASHBOARD_SECTION_META = {
    overview: {
        title: 'SEO Overview & Organic Growth Studio — Hangbug',
        h1: 'SEO Overview & Organic Growth Studio'
    },
    'search-performance': {
        title: 'SEO Search Performance Analytics — Hangbug Studio',
        h1: 'SEO Search Performance Analytics'
    },
    keywords: {
        title: 'SEO Keyword Research & Topic Rankings — Hangbug',
        h1: 'SEO Keyword Research & Topic Rankings'
    },
    audit: {
        title: 'SEO Website Technical & On-Page Audit — Hangbug',
        h1: 'SEO Website Technical & On-Page Audit'
    },
    indexing: {
        title: 'SEO Page Indexing & Coverage Monitor — Hangbug',
        h1: 'SEO Page Indexing & Coverage Monitor'
    },
    content: {
        title: 'SEO Content Quality & Heading Analysis — Hangbug',
        h1: 'SEO Content Quality & Heading Analysis'
    },
    technical: {
        title: 'SEO Technical Core Web Vitals & Schema — Hangbug',
        h1: 'SEO Technical Core Web Vitals & Schema'
    },
    backlinks: {
        title: 'SEO Backlink Authority & Domain Profile — Hangbug',
        h1: 'SEO Backlink Authority & Domain Profile'
    },
    'ai-visibility': {
        title: 'SEO AI Search Visibility & Citations — Hangbug',
        h1: 'SEO AI Search Visibility & Citations'
    },
    competitors: {
        title: 'SEO Competitor Benchmarking & Gap Analysis — Hangbug',
        h1: 'SEO Competitor Benchmarking & Gap Analysis'
    },
    recommendations: {
        title: 'SEO Actionable Growth Recommendations — Hangbug',
        h1: 'SEO Actionable Growth Recommendations'
    },
    settings: {
        title: 'SEO Dashboard Integrations & Settings — Hangbug',
        h1: 'SEO Dashboard Integrations & Settings'
    }
};

const NOINDEX_ROUTE_META = {
    '/login': {
        title: 'Sign In to Your Developer Account — Hangbug Quizzes',
        description: 'Sign in to your Hangbug developer account to save quiz progress, track streaks, and earn verified programming certificates.',
        h1: 'Sign In to Your Hangbug Coding Account'
    },
    '/register': {
        title: 'Sign Up Free: Coding Quizzes & Certificates | Hangbug',
        description: 'Create your free Hangbug account to practice technology quizzes, play coding games, and build verifiable software engineering credentials.',
        h1: 'Create Your Free Hangbug Developer Account'
    },
    '/signup': {
        title: 'Sign Up Free: Coding Quizzes & Certificates | Hangbug',
        description: 'Create your free Hangbug account to practice technology quizzes, play coding games, and build verifiable software engineering credentials.',
        h1: 'Create Your Free Hangbug Developer Account'
    },
    '/forgot-password': {
        title: 'Forgot Password Recovery — Hangbug Developer Account',
        description: 'Request a secure password reset link for your Hangbug developer account.',
        h1: 'Reset Access to Your Hangbug Account'
    },
    '/reset-password': {
        title: 'Set New Account Password — Hangbug Account Recovery',
        description: 'Set a new secure password for your Hangbug developer account.',
        h1: 'Create a New Account Password'
    },
    '/delete-account': {
        title: 'Account Deletion & Data Removal Request — Hangbug',
        description: 'Permanently delete your Hangbug developer account, quiz history, and associated personal data.',
        h1: 'Delete Your Hangbug Account & Data'
    },
    '/account-deletion': {
        title: 'Account Deletion & Data Removal Request — Hangbug',
        description: 'Permanently delete your Hangbug developer account, quiz history, and associated personal data.',
        h1: 'Delete Your Hangbug Account & Data'
    },
    '/data-deletion': {
        title: 'Account Deletion & Data Removal Request — Hangbug',
        description: 'Permanently delete your Hangbug developer account, quiz history, and associated personal data.',
        h1: 'Delete Your Hangbug Account & Data'
    },
    '/certificate/view': {
        title: 'Free Coding Certificates: Earn & Verify Online | Hangbug',
        description: 'Verify the authenticity of Hangbug developer completion certificates by credential ID.',
        h1: 'Hangbug Developer Certificate Verification & Credential Lookup'
    },
    '/leaderboard/full': {
        title: 'Full Global Developer Leaderboard Directory — Hangbug',
        description: 'View complete ranked developer standings, accuracy percentages, and completed quiz totals on Hangbug.',
        h1: 'All Ranked Developer Performers Worldwide'
    },
    '/quiz/start': {
        title: 'Interactive Quiz Session in Progress — Hangbug',
        description: 'Complete focused multiple-choice technical quiz questions with instant verification and explanations.',
        h1: 'Active Coding Quiz Practice Session'
    },
    '/quiz/result': {
        title: 'Coding Quiz Performance & Answer Results — Hangbug',
        description: 'Review your quiz score, accuracy metrics, and detailed answer explanations on Hangbug.',
        h1: 'Your Coding Quiz Performance & Explanations'
    },
    '/dashboard': {
        title: 'Developer Overview & Learning Progress — Hangbug',
        description: 'Track completed technology quizzes, daily coding streaks, earned certificates, and skill accuracy.',
        h1: 'Your Hangbug Learning Progress & Quiz History'
    },
    '/dashboard/technologies': {
        title: 'Dashboard Practice Quizzes & Tech Tracks — Hangbug',
        description: 'Browse programming language and framework tracks inside your Hangbug dashboard.',
        h1: 'Dashboard Technology Quizzes & Practice Tracks'
    },
    '/dashboard/quizzes': {
        title: 'Active Dashboard Quiz Practice Sessions — Hangbug',
        description: 'Resume in-progress quizzes and review recent practice assessments on Hangbug.',
        h1: 'Your In-Progress & Completed Coding Quizzes'
    },
    '/dashboard/certificates': {
        title: 'My Verified Programming Certificates — Hangbug',
        description: 'Download and share your earned score-based technology completion certificates.',
        h1: 'My Earned Certificates & Verified Credentials'
    },
    '/dashboard/leaderboard': {
        title: 'Dashboard Developer Standings & Ranks — Hangbug',
        description: 'Compare quiz accuracy, completed sessions, and community standings.',
        h1: 'Top 5 Performers — Global Developer Leaderboard'
    },
    '/dashboard/leaderboard/full': {
        title: 'Full Dashboard Developer Leaderboard Ranks — Hangbug',
        description: 'Explore complete global developer leaderboard rankings.',
        h1: 'All Ranked Developer Performers Worldwide'
    },
    '/dashboard/profile': {
        title: 'Developer Profile & Coding Credentials — Hangbug',
        description: 'Manage your public developer profile, bio, and completed skill tracks on Hangbug.',
        h1: 'Developer Profile & Skill Mastery Overview'
    },
    '/dashboard/settings': {
        title: 'Account Theme Settings & Preferences — Hangbug',
        description: 'Update your Hangbug theme, notification preferences, and account security settings.',
        h1: 'Account Settings & Security Preferences'
    },
    '/dashboard/seo': {
        title: SEO_DASHBOARD_SECTION_META.overview.title,
        description: 'Inspect Hangbug search health, canonical coverage, structured data, and editorial SEO audits.',
        h1: SEO_DASHBOARD_SECTION_META.overview.h1
    },
    '/admin': {
        title: 'Admin Console: Questions & Platform Control — Hangbug',
        description: 'Manage Hangbug quizzes, coding games, blog tutorials, AI verification, and platform settings.',
        h1: 'Hangbug Platform & Content Administration'
    },
    '/admin/knowledge-base': {
        title: 'Admin Knowledge Base & PDF RAG Library — Hangbug',
        description: 'Manage indexed AI knowledge base documentation and training entries.',
        h1: 'AI Knowledge Base Management'
    },
    '/admin/verification-reports': {
        title: 'Admin AI Verification Reports & Audits — Hangbug',
        description: 'Inspect automated question quality checks and verification reports.',
        h1: 'AI Question Verification Reports'
    },
    '/admin/ai-controls': {
        title: 'Admin AI Models, Embeddings & Usage — Hangbug',
        description: 'Configure AI generation providers, rate limits, and model usage telemetry.',
        h1: 'AI Models, Providers & Usage Controls'
    },
    '/dashboard/admin': {
        title: 'Dashboard Admin Controls & Site Operations — Hangbug',
        description: 'Manage Hangbug quizzes, coding games, blog tutorials, and platform operations.',
        h1: 'Hangbug Platform & Content Operations'
    }
};

let cachedSpaShellHtml = null;
let cachedInitialBlogMap = null;
let cachedSeoConfigModule = null;
let cachedStructuredDataModule = null;

async function ensureFrontendSeoModules() {
    if (!cachedSeoConfigModule) {
        try {
            cachedSeoConfigModule = await import('../../src/config/seoPagesConfig.js');
        } catch {
            cachedSeoConfigModule = null;
        }
    }
    if (!cachedStructuredDataModule) {
        try {
            cachedStructuredDataModule = await import('../../src/utils/structuredData.js');
        } catch {
            cachedStructuredDataModule = null;
        }
    }
    return {
        seoConfig: cachedSeoConfigModule,
        structuredData: cachedStructuredDataModule
    };
}

function buildGameDescriptiveH1(title, category) {
    const cleanTitle = String(title || 'Coding Challenge').trim();
    const descriptor = category === 'Typing Games'
        ? 'Developer Typing Speed & Accuracy Challenge'
        : 'Interactive Coding Practice Game';
    return `${cleanTitle}: ${descriptor}`;
}

function buildSsrStructuredData(structuredData, options = {}) {
    if (structuredData && typeof structuredData.buildPageStructuredData === 'function') {
        const built = structuredData.buildPageStructuredData(options);
        if (built) return built;
    }
    return buildPublicPageStructuredDataFallback({
        title: options.title,
        description: options.description,
        canonicalPath: options.canonicalPath,
        includeApplicationSchema: options.includeApplicationSchema,
        softwareApplication: options.softwareApplication
    });
}

function buildGameRouteMeta(canonicalSlug, game, structuredData, descriptionText = null) {
    const cleanCanonicalSlug = String(canonicalSlug || game.slug || '').trim().toLowerCase();
    const gameTitle = formatGameSeoTitle(game.title, game.category);
    const gameDesc = descriptionText !== null ? descriptionText : (game.description || '');
    const canonicalPath = `/games/${cleanCanonicalSlug}`;
    const richGameMeta = GAMES_SEO_MAP.get(cleanCanonicalSlug);
    const softwareApplication = {
        slug: cleanCanonicalSlug,
        name: game.title,
        category: game.category,
        description: gameDesc
    };
    const jsonLd = buildSsrStructuredData(structuredData, {
        title: gameTitle,
        description: gameDesc,
        canonicalPath,
        schemaType: 'WebPage',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Games', path: '/games' },
            { name: game.title || 'Coding Game', path: canonicalPath }
        ],
        includeApplicationSchema: true,
        softwareApplication
    });

    return {
        isGame: true,
        canonicalSlug: cleanCanonicalSlug,
        name: game.title,
        category: game.category,
        title: gameTitle,
        description: gameDesc,
        canonicalPath,
        h1: richGameMeta ? richGameMeta.h1 : buildGameDescriptiveH1(game.title, game.category),
        h2s: [`How ${game.title} Works`, 'Skills and Concepts Trained'],
        h3s: ['Interactive Practice & Instant Feedback'],
        internalLinks: [
            { label: 'Explore All Coding Games', to: '/games' },
            { label: 'Browse Technology Quizzes', to: '/technologies' }
        ],
        includeApplicationSchema: true,
        softwareApplication,
        jsonLd
    };
}

function ensureDistinctH1(rawH1, title) {
    const cleanTitle = String(title || '').trim();
    let candidate = String(rawH1 || '').trim();
    if (!candidate || (cleanTitle && candidate.toLowerCase() === cleanTitle.toLowerCase())) {
        const stripped = cleanTitle
            .replace(/^Hangbug\s*[–—\-|:]\s*/i, '')
            .replace(/\s*[|–—-]\s*Hangbug$/i, '')
            .trim();
        candidate = stripped && stripped.toLowerCase() !== cleanTitle.toLowerCase()
            ? stripped
            : (cleanTitle ? `${cleanTitle} — Developer Guide` : 'Hangbug Developer Practice Platform');
    }
    if (cleanTitle && candidate.toLowerCase() === cleanTitle.toLowerCase()) {
        return `${candidate} Overview`;
    }
    return candidate;
}

function resolveNoindexRouteMeta(cleanPath) {
    if (cleanPath.startsWith('/dashboard/seo')) {
        const section = cleanPath.slice('/dashboard/seo'.length).replace(/^\/+/, '');
        const secMeta = SEO_DASHBOARD_SECTION_META[section] || SEO_DASHBOARD_SECTION_META.overview;
        return {
            ...NOINDEX_ROUTE_META['/dashboard/seo'],
            title: secMeta.title,
            h1: secMeta.h1
        };
    }
    if (NOINDEX_ROUTE_META[cleanPath]) {
        return NOINDEX_ROUTE_META[cleanPath];
    }
    if (cleanPath.startsWith('/reset-password/')) {
        return NOINDEX_ROUTE_META['/reset-password'];
    }
    if (cleanPath.startsWith('/dashboard/')) {
        return NOINDEX_ROUTE_META['/dashboard'];
    }
    if (cleanPath.startsWith('/admin/')) {
        return NOINDEX_ROUTE_META['/admin'];
    }
    return null;
}

function resolveConfigPageMeta(cleanPath, seoConfig, structuredData) {
    if (!seoConfig || !seoConfig.SEO_PAGES_CONFIG) {
        return resolveCoreFallbackMeta(cleanPath);
    }
    const allConfigs = Object.entries(seoConfig.SEO_PAGES_CONFIG);

    let cfg = null;
    if (cleanPath.startsWith('/technologies/')) {
        const sub = cleanPath.slice('/technologies/'.length);
        if (typeof seoConfig.getTechnologySeoBySlug === 'function') {
            cfg = seoConfig.getTechnologySeoBySlug(sub);
        }
    } else {
        for (const [key, entry] of allConfigs) {
            if (key === 'resources') continue;
            if (entry && entry.path === cleanPath) {
                cfg = entry;
                break;
            }
        }
    }

    if (!cfg || !cfg.title) return null;

    const canonicalPath = cfg.path || cleanPath;
    const h1 = ensureDistinctH1(cfg.h1, cfg.title);

    let breadcrumbs;
    let itemList = null;
    if (cleanPath.startsWith('/technologies/') && cfg.name) {
        breadcrumbs = [
            { name: 'Home', path: '/' },
            { name: 'Technologies', path: '/technologies' },
            { name: `${cfg.name} Quizzes`, path: canonicalPath }
        ];
    } else if (canonicalPath === '/technologies') {
        breadcrumbs = [
            { name: 'Home', path: '/' },
            { name: 'Technologies', path: '/technologies' }
        ];
        if (typeof seoConfig.getTechnologySeoBySlug === 'function') {
            const techItems = TECH_SEO_KEYS
                .map(slug => seoConfig.getTechnologySeoBySlug(slug))
                .filter(Boolean)
                .map(t => ({
                    name: `${t.name} Quizzes`,
                    url: `https://www.hangbug.com${t.path}`,
                    description: t.description
                }));
            if (techItems.length > 0) {
                itemList = {
                    name: 'Hangbug Technology Quiz Tracks',
                    description: cfg.description || '',
                    items: techItems
                };
            }
        }
    } else if (canonicalPath === '/games') {
        breadcrumbs = [
            { name: 'Home', path: '/' },
            { name: 'Games', path: '/games' }
        ];
        if (Array.isArray(GAMES_SEO_LIST) && GAMES_SEO_LIST.length > 0) {
            itemList = {
                name: 'Hangbug Coding & Typing Games',
                description: cfg.description || '',
                items: GAMES_SEO_LIST.map(g => ({
                    name: g.name,
                    url: `https://www.hangbug.com/games/${g.slug}`,
                    description: g.description
                }))
            };
        }
    }

    const jsonLd = buildSsrStructuredData(structuredData, {
        title: cfg.title,
        description: cfg.description || '',
        canonicalPath,
        schemaType: 'WebPage',
        breadcrumbs,
        includeApplicationSchema: canonicalPath === '/' || canonicalPath === '/games',
        itemList
    });

    return {
        title: cfg.title,
        description: cfg.description || '',
        canonicalPath,
        h1,
        primaryKeyword: cfg.primaryKeyword || '',
        secondaryKeywords: Array.isArray(cfg.secondaryKeywords) ? cfg.secondaryKeywords : [],
        introContent: cfg.introContent || cfg.description || '',
        h2s: Array.isArray(cfg.h2s) ? cfg.h2s : [],
        h3s: Array.isArray(cfg.h3s) ? cfg.h3s : [],
        internalLinks: Array.isArray(cfg.internalLinks) ? cfg.internalLinks : [],
        includeApplicationSchema: canonicalPath === '/' || canonicalPath === '/games',
        jsonLd
    };
}

function renderSemanticPageBodyHtml(meta) {
    const h1Text = ensureDistinctH1(meta.h1, meta.title);
    const intro = meta.introContent || meta.description || '';
    const h2s = Array.isArray(meta.h2s) ? meta.h2s : [];
    const h3s = Array.isArray(meta.h3s) ? meta.h3s : [];
    const links = Array.isArray(meta.internalLinks) ? meta.internalLinks : [];

    const sectionsHtml = h2s.length > 0
        ? h2s.map(h2 => `<section class="space-y-2"><h2 class="text-xl font-bold">${escapeHtmlText(h2)}</h2><p class="text-sm leading-relaxed">${escapeHtmlText(intro)}</p></section>`).join('\n')
        : '';

    const subSectionsHtml = h3s.length > 0
        ? `<section class="space-y-2">${h3s.map(h3 => `<h3 class="text-base font-semibold">${escapeHtmlText(h3)}</h3>`).join('\n')}</section>`
        : '';

    const linksHtml = links.length > 0
        ? `<nav aria-label="Related resources" class="pt-4 border-t"><ul class="flex flex-wrap gap-3">${links.filter(l => l && l.to && l.label).map(l => `<li><a href="${escapeHtmlAttr(l.to)}"${l.rel ? ` rel="${escapeHtmlAttr(l.rel)}"` : ''}>${escapeHtmlText(l.label)}</a></li>`).join('\n')}</ul></nav>`
        : '';

    return `<main class="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <h1 class="text-3xl font-extrabold">${escapeHtmlText(h1Text)}</h1>
        ${intro ? `<p class="text-base leading-relaxed">${escapeHtmlText(intro)}</p>` : ''}
        ${sectionsHtml}
        ${subSectionsHtml}
        ${linksHtml}
    </main>`;
}

function normalizePathname(pathname) {
    if (!pathname || typeof pathname !== 'string') return '';
    let decoded = pathname.split('?')[0].split('#')[0];
    try {
        decoded = decodeURIComponent(decoded);
    } catch {
        // Keep raw if malformed percent-encoding
    }
    const collapsed = decoded.replace(/\/{2,}/g, '/');
    return collapsed === '/' ? '/' : (collapsed.replace(/\/+$/, '') || '/');
}

function isNoindexAppRoute(pathname) {
    const clean = normalizePathname(pathname);
    if (!clean) return false;
    if (NOINDEX_EXACT_ROUTES.has(clean)) return true;
    if (clean.startsWith('/reset-password/')) return true;
    if (clean.startsWith('/dashboard/')) return true;
    if (clean.startsWith('/admin/')) return true;
    return false;
}

function getInitialBlogMap() {
    if (cachedInitialBlogMap) return cachedInitialBlogMap;
    try {
        const { INITIAL_BLOG_ARTICLES } = require('../_models/blogArticles/initialBlogArticles');
        cachedInitialBlogMap = new Map(
            (INITIAL_BLOG_ARTICLES || []).map(article => [String(article.slug).toLowerCase(), article])
        );
    } catch {
        cachedInitialBlogMap = new Map();
    }
    return cachedInitialBlogMap;
}

function isKnownAppRoute(pathname) {
    const clean = normalizePathname(pathname);
    if (!clean) return false;
    if (KNOWN_EXACT_ROUTES.has(clean)) return true;
    if (clean.startsWith('/technologies/')) {
        const sub = clean.slice('/technologies/'.length);
        if (!sub || sub.includes('/')) return false;
        return TECH_SLUGS.has(sub.toLowerCase());
    }
    if (clean.startsWith('/games/')) {
        const sub = clean.slice('/games/'.length);
        if (!sub || sub.includes('/')) return false;
        const lower = sub.toLowerCase();
        return GAME_SLUGS.includes(lower) || RUNTIME_EXTRA_GAME_SLUGS.has(lower) || GAME_ALIAS_SLUGS.has(lower);
    }
    if (clean.startsWith('/blog/')) {
        const sub = clean.slice('/blog/'.length);
        if (!sub || sub.includes('/')) return false;
        return BLOG_SLUGS.includes(sub.toLowerCase());
    }
    if (clean.startsWith('/reset-password/')) {
        const token = clean.slice('/reset-password/'.length);
        return Boolean(token) && !token.includes('/');
    }
    if (clean.startsWith('/dashboard/seo/')) {
        const sub = clean.slice('/dashboard/seo/'.length);
        return Boolean(sub) && !sub.includes('/');
    }
    if (clean.startsWith('/api/')) return true;
    if (STATIC_PREFIXES.some(prefix => clean.startsWith(prefix))) return true;
    return false;
}

function escapeHtmlAttr(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeHtmlText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function loadSpaShellHtml() {
    if (cachedSpaShellHtml && process.env.NODE_ENV === 'production') {
        return cachedSpaShellHtml;
    }

    const candidates = [
        path.join(ROOT_DIR, 'api', '_generated', 'spa-shell.html'),
        path.join(ROOT_DIR, 'dist', 'index.html'),
        path.join(ROOT_DIR, 'index.html')
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            const content = fs.readFileSync(candidate, 'utf8');
            if (process.env.NODE_ENV === 'production') {
                cachedSpaShellHtml = content;
            }
            return content;
        }
    }
    return null;
}

function findPrerenderedFile(pathname) {
    const clean = normalizePathname(pathname);
    if (!clean || clean.startsWith('/api')) return null;

    const candidates = clean === '/'
        ? [path.join(ROOT_DIR, 'dist', 'index.html')]
        : [
            path.join(ROOT_DIR, 'dist', clean.replace(/^\//, ''), 'index.html'),
            path.join(ROOT_DIR, 'dist', `${clean.replace(/^\//, '')}.html`)
        ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }
    return null;
}

async function withTimeout(promise, ms = 1500) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
}

async function resolveBlogIndexMeta() {
    let articles = [];
    let featuredArticle = null;
    let categories = [];
    let total = 0;
    let fromDb = false;

    try {
        if (isMongoUriConfigured(process.env.MONGODB_URI)) {
            const prisma = require('../_config/prisma');
            if (prisma && prisma.blogPost) {
                const totalInDb = await withTimeout(prisma.blogPost.count(), 2500);
                if (totalInDb > 0) {
                    fromDb = true;
                    const dbPublished = await withTimeout(
                        prisma.blogPost.findMany({
                            where: { isPublished: true },
                            orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
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
                                isPublished: true,
                                viewsCount: true,
                                publishedAt: true,
                                createdAt: true
                            }
                        }),
                        2500
                    );
                    total = dbPublished.length;
                    articles = dbPublished.slice(0, 9);
                    featuredArticle = dbPublished.find(a => a.isFeatured) || dbPublished[0] || null;
                    categories = deriveCategoriesFromArticles(dbPublished);
                }
            }
        }
    } catch {
        // Fallback below
    }

    if (!fromDb) {
        const { INITIAL_BLOG_ARTICLES } = require('../_models/blogArticles/initialBlogArticles');
        const published = (INITIAL_BLOG_ARTICLES || []).filter(a => a && a.slug && a.isPublished !== false);
        total = published.length;
        articles = published.slice(0, 9);
        featuredArticle = published.find(a => a.isFeatured) || published[0] || null;
        categories = deriveCategoriesFromArticles(published);
    }

    return {
        fromDb,
        meta: {
            isBlogIndex: true,
            blogListData: {
                articles,
                featuredArticle,
                categories,
                total
            }
        }
    };
}

async function resolveAppRoute(pathname) {
    await ensureMarkdownParser();
    const { seoConfig, structuredData } = await ensureFrontendSeoModules();
    const clean = normalizePathname(pathname);
    if (!clean) {
        return { statusCode: 404, noindex: true, cleanPath: '/' };
    }

    // Blog index (/blog) — resolve actual published blog catalog
    if (clean === '/blog') {
        const blogIndex = await resolveBlogIndexMeta();
        return {
            statusCode: 200,
            noindex: false,
            cleanPath: '/blog',
            fromDb: blogIndex.fromDb,
            meta: blogIndex.meta
        };
    }

    // Blog detail (/blog/:slug) — check MongoDB FIRST so unpublished/edited/new DB articles are authoritative
    if (clean.startsWith('/blog/')) {
        const sub = clean.slice('/blog/'.length).toLowerCase();
        if (!sub || sub.includes('/')) {
            return { statusCode: 404, noindex: true, cleanPath: clean };
        }

        let dbChecked = false;
        let dbPopulated = false;

        try {
            if (isMongoUriConfigured(process.env.MONGODB_URI)) {
                const prisma = require('../_config/prisma');
                if (prisma && prisma.blogPost) {
                    const article = await withTimeout(
                        prisma.blogPost.findFirst({
                            where: { slug: sub }
                        }),
                        2500
                    );
                    dbChecked = true;

                    if (article) {
                        if (article.isPublished !== true) {
                            return {
                                statusCode: 404,
                                noindex: true,
                                cleanPath: clean,
                                fromDb: true
                            };
                        }

                        const relatedArticles = await withTimeout(
                            prisma.blogPost.findMany({
                                where: {
                                    slug: { not: sub },
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
                            }),
                            2000
                        ).catch(() => []);

                        const canonicalSlug = String(article.slug || sub).trim().toLowerCase();
                        const normalizedArticle = { ...article, slug: canonicalSlug };
                        return {
                            statusCode: 200,
                            noindex: false,
                            cleanPath: `/blog/${canonicalSlug}`,
                            fromDb: true,
                            meta: {
                                title: buildArticleSeoTitle(normalizedArticle),
                                description: normalizedArticle.seoDescription || normalizedArticle.excerpt || '',
                                canonicalPath: `/blog/${canonicalSlug}`,
                                h1: normalizedArticle.title,
                                article: normalizedArticle,
                                relatedArticles
                            }
                        };
                    }

                    const totalInDb = await withTimeout(prisma.blogPost.count(), 2000).catch(() => 0);
                    dbPopulated = totalInDb > 0;
                }
            }
        } catch {
            // DB unreachable — allow fallback only when DB is offline/unconfigured
            dbChecked = false;
        }

        if (dbChecked && dbPopulated) {
            return {
                statusCode: 404,
                noindex: true,
                cleanPath: clean,
                fromDb: true
            };
        }

        const fallbackArticle = getInitialBlogMap().get(sub);
        if (fallbackArticle && fallbackArticle.isPublished !== false) {
            const { INITIAL_BLOG_ARTICLES } = require('../_models/blogArticles/initialBlogArticles');
            const relatedArticles = findRelatedForArticle(fallbackArticle, INITIAL_BLOG_ARTICLES || []);
            const canonicalFallbackSlug = String(fallbackArticle.slug || sub).trim().toLowerCase();
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: `/blog/${canonicalFallbackSlug}`,
                fromDb: false,
                meta: {
                    title: buildArticleSeoTitle(fallbackArticle),
                    description: fallbackArticle.seoDescription || fallbackArticle.excerpt || '',
                    canonicalPath: `/blog/${canonicalFallbackSlug}`,
                    h1: fallbackArticle.title,
                    article: { ...fallbackArticle, slug: canonicalFallbackSlug },
                    relatedArticles
                }
            };
        }

        return {
            statusCode: 404,
            noindex: true,
            cleanPath: clean
        };
    }

    // Check DB first for /games/:slug so unpublished DB games return 404 and dynamic DB games work
    if (clean.startsWith('/games/')) {
        const sub = clean.slice('/games/'.length).toLowerCase();
        if (!sub || sub.includes('/')) {
            return { statusCode: 404, noindex: true, cleanPath: clean };
        }
        try {
            if (isMongoUriConfigured(process.env.MONGODB_URI)) {
                const prisma = require('../_config/prisma');
                if (prisma && prisma.game) {
                    const game = await withTimeout(
                        prisma.game.findFirst({
                            where: { slug: sub },
                            select: {
                                slug: true,
                                title: true,
                                description: true,
                                category: true,
                                isPublished: true
                            }
                        })
                    ).catch(() => null);

                    if (game) {
                        if (game.isPublished !== true) {
                            return {
                                statusCode: 404,
                                noindex: true,
                                cleanPath: clean,
                                fromDb: true
                            };
                        }
                        const GameModelRef = require('../_models/gameModel');
                        const aliasForDbSlug = GameModelRef.GAME_ALIASES && GameModelRef.GAME_ALIASES[sub];
                        const canonicalSlug = (aliasForDbSlug && aliasForDbSlug.baseSlug) || String(game.slug || sub).trim().toLowerCase();
                        return {
                            statusCode: 200,
                            noindex: false,
                            cleanPath: `/games/${canonicalSlug}`,
                            fromDb: true,
                            meta: buildGameRouteMeta(canonicalSlug, game, structuredData, game.description || '')
                        };
                    }
                }
            }
        } catch {
            // Fall through to model fallback / alias resolution if DB check fails
        }

        const GameModel = require('../_models/gameModel');
        const aliasMeta = GameModel.GAME_ALIASES && GameModel.GAME_ALIASES[sub];
        if (aliasMeta) {
            const targetSlug = String(aliasMeta.baseSlug || sub).trim().toLowerCase();
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: clean,
                fromDb: false,
                meta: buildGameRouteMeta(
                    targetSlug,
                    aliasMeta,
                    structuredData,
                    `${aliasMeta.description} Practice interactive coding challenges on Hangbug.`
                )
            };
        }

        const fallbackGame = (GameModel.INITIAL_GAMES || []).find(g => g.slug === sub && g.isPublished !== false);
        if (fallbackGame) {
            const canonicalFallbackSlug = String(fallbackGame.slug || sub).trim().toLowerCase();
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: `/games/${canonicalFallbackSlug}`,
                fromDb: false,
                meta: buildGameRouteMeta(
                    canonicalFallbackSlug,
                    fallbackGame,
                    structuredData,
                    `${fallbackGame.description} Practice interactive coding challenges on Hangbug.`
                )
            };
        }
    }

    if (isKnownAppRoute(clean)) {
        const noindex = isNoindexAppRoute(clean);
        const meta = noindex
            ? resolveNoindexRouteMeta(clean)
            : resolveConfigPageMeta(clean, seoConfig, structuredData);

        return {
            statusCode: 200,
            noindex,
            cleanPath: clean,
            meta
        };
    }

    return {
        statusCode: 404,
        noindex: true,
        cleanPath: clean
    };
}

function replaceOrInsertMeta(html, attrName, attrValue, content) {
    const safeContent = escapeHtmlAttr(content);
    const regex = new RegExp(`<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
    const altRegex = new RegExp(`<meta\\s+content="[^"]*"\\s+${attrName}="${attrValue}"\\s*\\/?>`, 'i');
    const tag = `<meta ${attrName}="${attrValue}" content="${safeContent}" />`;

    if (regex.test(html)) {
        return html.replace(regex, () => tag);
    }
    if (altRegex.test(html)) {
        return html.replace(altRegex, () => tag);
    }
    return html.replace('</head>', () => `    ${tag}\n  </head>`);
}

function replaceRootFallbackHtml(html, innerHtml) {
    if (/<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/.test(html)) {
        return html.replace(
            /<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/,
            () => `<div id="root">\n${innerHtml}\n    </div>`
        );
    }
    return html;
}

function renderStatusHtml(resolution = { statusCode: 404, noindex: true }) {
    const baseHtml = loadSpaShellHtml();
    if (!baseHtml) {
        return resolution.statusCode === 404
            ? '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="robots" content="noindex, nofollow" /><title>404 Page Not Found — Hangbug Programming Quizzes</title></head><body><h1>Oops! Lost in the Code? — Page Could Not Be Found</h1></body></html>'
            : '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Hangbug</title></head><body><div id="root"></div></body></html>';
    }

    if (resolution.statusCode === 404) {
        const errorTitle = '404 Page Not Found — Hangbug Programming Quizzes';
        const errorDesc = "The page you are looking for doesn't exist, has been removed, or was moved to another URL.";

        return applyHeadMetadata(baseHtml, {
            title: errorTitle,
            description: errorDesc,
            robots: 'noindex, nofollow',
            omitCanonical: true,
            jsonLd: null,
            bodyHtml: renderVisible404BodyHtml()
        });
    }

    if (resolution.meta && resolution.meta.article) {
        return renderCompleteBlogArticleHtml(
            baseHtml,
            resolution.meta.article,
            resolution.meta.relatedArticles || []
        );
    }

    if (resolution.meta && resolution.meta.isBlogIndex) {
        return renderCompleteBlogIndexHtml(baseHtml, resolution.meta.blogListData || {});
    }

    let html = baseHtml;
    const robotsDirective = resolution.noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    html = replaceOrInsertMeta(html, 'name', 'robots', robotsDirective);

    if (resolution.noindex) {
        if (resolution.meta && resolution.meta.title) {
            const bodyHtml = renderSemanticPageBodyHtml(resolution.meta);
            return applyHeadMetadata(html, {
                title: resolution.meta.title,
                description: resolution.meta.description || '',
                robots: 'noindex, nofollow',
                omitCanonical: true,
                jsonLd: null,
                bodyHtml
            });
        }

        // Private / auth / dashboard routes: remove homepage canonical & homepage JSON-LD
        html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
        html = html.replace(/<meta\s+property="og:url"[^>]*>\s*/gi, '');
        html = html.replace(/<meta\s+name="twitter:url"[^>]*>\s*/gi, '');
        html = html.replace(/<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
        html = replaceRootFallbackHtml(html, '');
        return html;
    }

    const indexablePath = resolution.cleanPath || '/';
    const resolvedMeta = (resolution.meta && resolution.meta.title)
        ? resolution.meta
        : resolveCoreFallbackMeta(indexablePath);

    if (resolvedMeta && resolvedMeta.title) {
        const canonicalPath = resolvedMeta.canonicalPath || indexablePath;
        const legalBodyHtml = buildLegalPageBodyHtml(canonicalPath, resolvedMeta);
        const resolvedBodyHtml = legalBodyHtml || (resolvedMeta.isGame
            ? buildGameBodyHtml(
                {
                    slug: resolvedMeta.canonicalSlug || canonicalPath.replace(/^\/games\//, ''),
                    name: resolvedMeta.name || resolvedMeta.title,
                    category: resolvedMeta.category || 'Coding Games',
                    description: resolvedMeta.description || ''
                },
                {
                    canonicalSlug: resolvedMeta.canonicalSlug,
                    title: resolvedMeta.title,
                    h1: resolvedMeta.h1,
                    description: resolvedMeta.description
                }
            )
            : (canonicalPath === '/'
                ? generateHomeBodyHtml({ ...resolvedMeta, h1: ensureDistinctH1(resolvedMeta.h1, resolvedMeta.title) })
                : generatePublicBodyHtml({ ...resolvedMeta, h1: ensureDistinctH1(resolvedMeta.h1, resolvedMeta.title) }));

        const resolvedJsonLd = resolvedMeta.jsonLd || buildSsrStructuredData(cachedStructuredDataModule, {
            title: resolvedMeta.title,
            description: resolvedMeta.description || '',
            canonicalPath,
            schemaType: 'WebPage',
            includeApplicationSchema: Boolean(resolvedMeta.includeApplicationSchema || canonicalPath === '/' || canonicalPath === '/games'),
            softwareApplication: resolvedMeta.softwareApplication || null
        });

        return renderPublicPageHtml(baseHtml, {
            path: indexablePath,
            canonicalPath,
            title: resolvedMeta.title,
            description: resolvedMeta.description || '',
            robots: robotsDirective,
            ogType: 'website',
            omitCanonical: false,
            omitJsonLd: false,
            includeApplicationSchema: Boolean(resolvedMeta.includeApplicationSchema || canonicalPath === '/' || canonicalPath === '/games'),
            softwareApplication: resolvedMeta.softwareApplication || null,
            jsonLd: resolvedJsonLd,
            staticHeaderHtml: resolveStaticHeaderForPath(canonicalPath),
            staticFooterHtml: renderStaticFooterHtml(),
            bodyHtml: resolvedBodyHtml
        });
    }

    // Defensive canonical enforcement for any indexable route without explicit metadata
    return renderPublicPageHtml(baseHtml, {
        path: indexablePath,
        canonicalPath: indexablePath,
        title: 'Hangbug — Interactive Tech Quizzes & Coding Games',
        robots: robotsDirective,
        omitCanonical: false,
        omitJsonLd: false,
        staticHeaderHtml: resolveStaticHeaderForPath(indexablePath),
        staticFooterHtml: renderStaticFooterHtml()
    });
}

module.exports = {
    BASE_URL,
    CORE_PUBLIC_ROUTES,
    PUBLIC_ROUTES,
    NOINDEX_EXACT_ROUTES,
    TECHNOLOGY_GUIDE_CONFIGS,
    GAME_SLUGS,
    RUNTIME_EXTRA_GAME_SLUGS,
    GAME_ALIAS_SLUGS,
    BLOG_SLUGS,
    TECH_SLUGS,
    resolvePopulatedTechnologyRoutes,
    toIsoLastmod,
    buildSitemapXml,
    buildRobotsTxt,
    getDynamicSitemap,
    getRobotsTxt,
    normalizePathname,
    isKnownAppRoute,
    isNoindexAppRoute,
    buildGameDescriptiveH1,
    ensureDistinctH1,
    resolveAppRoute,
    findPrerenderedFile,
    renderStatusHtml
};
