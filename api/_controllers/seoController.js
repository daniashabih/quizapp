const fs = require('fs');
const path = require('path');
const {
    ensureMarkdownParser,
    isMongoUriConfigured,
    renderCompleteBlogArticleHtml,
    renderCompleteBlogIndexHtml,
    renderVisible404BodyHtml,
    applyHeadMetadata,
    findRelatedForArticle,
    deriveCategoriesFromArticles
} = require('../_utils/blogSeoRenderer');

const BASE_URL = 'https://www.hangbug.com';
const ROOT_DIR = path.resolve(__dirname, '../..');

const CORE_PUBLIC_ROUTES = [
    { loc: '/', changefreq: 'daily', priority: '1.0', lastmod: '2026-11-17T13:34:27.000Z' },
    { loc: '/technologies', changefreq: 'daily', priority: '0.9', lastmod: '2026-11-18T12:28:38.000Z' },
    { loc: '/games', changefreq: 'daily', priority: '0.9', lastmod: '2026-11-17T15:52:06.672Z' },
    { loc: '/leaderboard', changefreq: 'daily', priority: '0.8', lastmod: '2026-11-13T14:09:48.000Z' },
    { loc: '/leaderboard/full', changefreq: 'daily', priority: '0.7', lastmod: '2026-11-18T12:00:00.000Z' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7', lastmod: '2026-11-10T14:11:47.000Z' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7', lastmod: '2026-11-13T14:09:48.000Z' },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.6', lastmod: '2026-11-13T14:51:33.000Z' },
    { loc: '/terms', changefreq: 'monthly', priority: '0.6', lastmod: '2026-11-10T14:11:47.000Z' },
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
    { slug: 'programming-fundamentals', matchers: ['programming fundamentals', 'programming logic', 'oop', 'dsa'], defaultPopulated: true, fallbackLastmod: '2026-11-18T12:28:38.000Z' }
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
                            const qMap = new Map(
                                qStats.map(q => [
                                    String(q.category || '').toLowerCase(),
                                    {
                                        count: q._count?.id || 0,
                                        latestQuestionAt: q._max?.createdAt || null
                                    }
                                ])
                            );
                            categoriesWithStats = cats.map(c => {
                                const stat = qMap.get(String(c.name || '').toLowerCase());
                                return {
                                    name: c.name,
                                    isEnabled: c.isEnabled !== false,
                                    questionCount: stat ? stat.count : 0,
                                    latestQuestionAt: stat ? stat.latestQuestionAt : null
                                };
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
    // Aliases
    'reactjs', 'react.js', 'js', 'html5', 'css3', 'fundamentals', 'programming-logic'
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

let cachedSpaShellHtml = null;
let cachedInitialBlogMap = null;

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

                        return {
                            statusCode: 200,
                            noindex: false,
                            cleanPath: `/blog/${article.slug}`,
                            fromDb: true,
                            meta: {
                                title: article.seoTitle || `${article.title} | Hangbug`,
                                description: article.seoDescription || article.excerpt || '',
                                canonicalPath: `/blog/${article.slug}`,
                                h1: article.title,
                                article,
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
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: `/blog/${fallbackArticle.slug}`,
                fromDb: false,
                meta: {
                    title: fallbackArticle.seoTitle || `${fallbackArticle.title} | Hangbug`,
                    description: fallbackArticle.seoDescription || fallbackArticle.excerpt || '',
                    canonicalPath: `/blog/${fallbackArticle.slug}`,
                    h1: fallbackArticle.title,
                    article: fallbackArticle,
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
                        return {
                            statusCode: 200,
                            noindex: false,
                            cleanPath: `/games/${game.slug}`,
                            fromDb: true,
                            meta: {
                                title: `${game.title} — ${game.category === 'Typing Games' ? 'Developer Typing Challenge' : 'Interactive Coding Game'} | Hangbug`,
                                description: game.description || '',
                                canonicalPath: `/games/${game.slug}`,
                                h1: game.title
                            }
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
            const targetSlug = aliasMeta.baseSlug || sub;
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: clean,
                fromDb: false,
                meta: {
                    title: `${aliasMeta.title} — ${aliasMeta.category === 'Typing Games' ? 'Developer Typing Challenge' : 'Interactive Coding Game'} | Hangbug`,
                    description: `${aliasMeta.description} Practice interactive coding challenges on Hangbug.`,
                    canonicalPath: `/games/${targetSlug}`,
                    h1: aliasMeta.title
                }
            };
        }

        const fallbackGame = (GameModel.INITIAL_GAMES || []).find(g => g.slug === sub && g.isPublished !== false);
        if (fallbackGame) {
            return {
                statusCode: 200,
                noindex: false,
                cleanPath: `/games/${fallbackGame.slug}`,
                fromDb: false,
                meta: {
                    title: `${fallbackGame.title} — ${fallbackGame.category === 'Typing Games' ? 'Developer Typing Challenge' : 'Interactive Coding Game'} | Hangbug`,
                    description: `${fallbackGame.description} Practice interactive coding challenges on Hangbug.`,
                    canonicalPath: `/games/${fallbackGame.slug}`,
                    h1: fallbackGame.title
                }
            };
        }
    }

    if (isKnownAppRoute(clean)) {
        return {
            statusCode: 200,
            noindex: isNoindexAppRoute(clean),
            cleanPath: clean,
            meta: null
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
            ? '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="robots" content="noindex, nofollow" /><title>404: Page Not Found — HangBug</title></head><body><h1>404 — Page Not Found</h1></body></html>'
            : '<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Hangbug</title></head><body><div id="root"></div></body></html>';
    }

    if (resolution.statusCode === 404) {
        const errorTitle = '404: Page Not Found — HangBug';
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

    if (resolution.meta && resolution.meta.title) {
        const { title, description, canonicalPath, h1 } = resolution.meta;
        const canonicalHref = `${BASE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;

        return applyHeadMetadata(html, {
            title,
            description,
            canonicalUrl: canonicalHref,
            robots: robotsDirective,
            ogType: 'website',
            bodyHtml: `<main class="max-w-4xl mx-auto px-4 py-16"><h1>${escapeHtmlText(h1 || title)}</h1><p>${escapeHtmlText(description || '')}</p></main>`
        });
    } else if (resolution.noindex) {
        // Private / auth / dashboard routes: remove homepage canonical & homepage JSON-LD
        html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
        html = html.replace(/<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
        html = replaceRootFallbackHtml(html, '');
    }

    return html;
}

module.exports = {
    BASE_URL,
    CORE_PUBLIC_ROUTES,
    PUBLIC_ROUTES,
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
    resolveAppRoute,
    findPrerenderedFile,
    renderStatusHtml
};
