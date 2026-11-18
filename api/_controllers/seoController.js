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

const PUBLIC_ROUTES = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/technologies', changefreq: 'daily', priority: '0.9' },
    { loc: '/games', changefreq: 'daily', priority: '0.9' },
    { loc: '/leaderboard', changefreq: 'daily', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: '0.6' },
    { loc: '/terms', changefreq: 'monthly', priority: '0.6' },
    { loc: '/certificate/view', changefreq: 'monthly', priority: '0.7' },
    { loc: '/blog', changefreq: 'daily', priority: '0.9' },
    { loc: '/resources', changefreq: 'monthly', priority: '0.7' },
    { loc: '/technologies/html', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/css', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/javascript', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/react', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/php', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/laravel', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/mysql', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/mongodb', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/flutter', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/dart', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/python', changefreq: 'weekly', priority: '0.8' },
    { loc: '/technologies/programming-fundamentals', changefreq: 'weekly', priority: '0.8' }
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

const BLOG_SLUGS = [
    'html-tutorial-for-beginners',
    'css-basics-beginners-guide',
    'javascript-fundamentals-beginners-guide',
    'php-programming-beginners-guide',
    'laravel-basics-mvc-architecture',
    'flutter-dart-mobile-app-development',
    'csharp-programming-beginners-guide',
    'mysql-database-tutorial-beginners',
    'programming-interview-questions-beginners',
    'improve-programming-skills-coding-practice'
];

function buildSitemapXml(extraSlugs = [], extraBlogSlugs = [], options = {}) {
    const today = new Date().toISOString().split('T')[0];
    const mergedSlugs = Array.from(
        new Set(
            [...GAME_SLUGS, ...(Array.isArray(extraSlugs) ? extraSlugs : [])]
                .filter(slug => slug && slug !== 'coding-memory-match')
        )
    );
    const mergedBlogSlugs = Array.isArray(options?.blogSlugsOverride)
        ? Array.from(new Set(options.blogSlugsOverride.filter(Boolean)))
        : Array.from(
              new Set(
                  [...BLOG_SLUGS, ...(Array.isArray(extraBlogSlugs) ? extraBlogSlugs : [])]
                      .filter(Boolean)
              )
          );

    const urls = [
        ...PUBLIC_ROUTES.map(r => `  <url>\n    <loc>${BASE_URL}${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`),
        ...mergedSlugs.map(slug => `  <url>\n    <loc>${BASE_URL}/games/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`),
        ...mergedBlogSlugs.map(slug => `  <url>\n    <loc>${BASE_URL}/blog/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
    ];

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
    let extraSlugs = [];
    let extraBlogSlugs = [];
    let blogSlugsOverride = null;
    try {
        if (isMongoUriConfigured(process.env.MONGODB_URI)) {
            const prisma = require('../_config/prisma');
            if (prisma) {
                if (prisma.game) {
                    const dbGames = await Promise.race([
                        prisma.game.findMany({ where: { isPublished: true }, select: { slug: true } }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
                    ]);
                    if (Array.isArray(dbGames)) {
                        extraSlugs = dbGames.map(g => g.slug).filter(Boolean);
                    }
                }
                if (prisma.blogPost) {
                    const [totalBlogs, dbBlogPosts] = await Promise.race([
                        Promise.all([
                            prisma.blogPost.count(),
                            prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true } })
                        ]),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
                    ]);
                    if (totalBlogs > 0 && Array.isArray(dbBlogPosts)) {
                        blogSlugsOverride = dbBlogPosts.map(b => b.slug).filter(Boolean);
                    }
                }
            }
        }
    } catch {
        // Fallback to static GAME_SLUGS and BLOG_SLUGS if DB is offline
    }

    const xml = buildSitemapXml(extraSlugs, extraBlogSlugs, { blogSlugsOverride });
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
    '/resources',
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
        return GAME_SLUGS.includes(lower) || GAME_ALIAS_SLUGS.has(lower);
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

    if (isKnownAppRoute(clean)) {
        return {
            statusCode: 200,
            noindex: isNoindexAppRoute(clean),
            cleanPath: clean,
            meta: null
        };
    }

    // Dynamic DB check for newly created published games
    try {
        if (isMongoUriConfigured(process.env.MONGODB_URI)) {
            const prisma = require('../_config/prisma');
            if (prisma && clean.startsWith('/games/')) {
                const sub = clean.slice('/games/'.length).toLowerCase();
                if (sub && !sub.includes('/') && prisma.game) {
                    const game = await withTimeout(
                        prisma.game.findFirst({
                            where: { slug: sub, isPublished: true },
                            select: {
                                slug: true,
                                title: true,
                                description: true,
                                category: true
                            }
                        })
                    ).catch(() => null);

                    if (game) {
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
        }
    } catch {
        // Safe fallback to 404 when slug is unknown and DB check fails
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
    PUBLIC_ROUTES,
    GAME_SLUGS,
    GAME_ALIAS_SLUGS,
    BLOG_SLUGS,
    TECH_SLUGS,
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
