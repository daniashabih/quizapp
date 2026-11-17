const fs = require('fs');
const path = require('path');

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

function buildSitemapXml(extraSlugs = [], extraBlogSlugs = []) {
    const today = new Date().toISOString().split('T')[0];
    const mergedSlugs = Array.from(
        new Set(
            [...GAME_SLUGS, ...(Array.isArray(extraSlugs) ? extraSlugs : [])]
                .filter(slug => slug && slug !== 'coding-memory-match')
        )
    );
    const mergedBlogSlugs = Array.from(
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
    try {
        const prisma = require('../_config/prisma');
        if (prisma) {
            if (prisma.game) {
                const dbGames = await Promise.race([
                    prisma.game.findMany({ where: { isPublished: true }, select: { slug: true } }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
                ]);
                if (Array.isArray(dbGames)) {
                    extraSlugs = dbGames.map(g => g.slug).filter(Boolean);
                }
            }
            if (prisma.blogPost) {
                const dbBlogPosts = await Promise.race([
                    prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true } }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
                ]);
                if (Array.isArray(dbBlogPosts)) {
                    extraBlogSlugs = dbBlogPosts.map(b => b.slug).filter(Boolean);
                }
            }
        }
    } catch {
        // Fallback to static GAME_SLUGS and BLOG_SLUGS if DB is offline
    }

    const xml = buildSitemapXml(extraSlugs, extraBlogSlugs);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
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

async function resolveAppRoute(pathname) {
    const clean = normalizePathname(pathname);
    if (!clean) {
        return { statusCode: 404, noindex: true, cleanPath: '/' };
    }

    if (isKnownAppRoute(clean)) {
        let meta = null;
        if (clean.startsWith('/blog/')) {
            const sub = clean.slice('/blog/'.length).toLowerCase();
            const article = getInitialBlogMap().get(sub);
            if (article) {
                meta = {
                    title: article.seoTitle || `${article.title} | Hangbug`,
                    description: article.seoDescription || article.excerpt || '',
                    canonicalPath: `/blog/${article.slug}`,
                    h1: article.title,
                    article
                };
            }
        }
        return {
            statusCode: 200,
            noindex: isNoindexAppRoute(clean),
            cleanPath: clean,
            meta
        };
    }

    // Dynamic DB check for newly created published blog posts & games
    try {
        const prisma = require('../_config/prisma');
        if (prisma) {
            if (clean.startsWith('/blog/')) {
                const sub = clean.slice('/blog/'.length).toLowerCase();
                if (sub && !sub.includes('/') && prisma.blogPost) {
                    const article = await withTimeout(
                        prisma.blogPost.findFirst({
                            where: { slug: sub, isPublished: true },
                            select: {
                                slug: true,
                                title: true,
                                excerpt: true,
                                seoTitle: true,
                                seoDescription: true,
                                category: true,
                                authorName: true,
                                publishedAt: true,
                                updatedAt: true
                            }
                        })
                    ).catch(() => null);

                    if (article) {
                        return {
                            statusCode: 200,
                            noindex: false,
                            cleanPath: `/blog/${article.slug}`,
                            meta: {
                                title: article.seoTitle || `${article.title} | Hangbug`,
                                description: article.seoDescription || article.excerpt || '',
                                canonicalPath: `/blog/${article.slug}`,
                                h1: article.title,
                                article
                            }
                        };
                    }
                }
            } else if (clean.startsWith('/games/')) {
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

    let html = baseHtml;

    if (resolution.statusCode === 404) {
        const errorTitle = '404: Page Not Found — HangBug';
        const errorDesc = "The page you are looking for doesn't exist, has been removed, or was moved to another URL.";

        html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtmlText(errorTitle)}</title>`);
        html = replaceOrInsertMeta(html, 'name', 'description', errorDesc);
        html = replaceOrInsertMeta(html, 'name', 'robots', 'noindex, nofollow');
        html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
        html = html.replace(/<meta\s+property="og:url"[^>]*>\s*/gi, '');
        html = html.replace(/<meta\s+name="twitter:url"[^>]*>\s*/gi, '');
        html = replaceOrInsertMeta(html, 'property', 'og:title', errorTitle);
        html = replaceOrInsertMeta(html, 'property', 'og:description', errorDesc);
        html = replaceOrInsertMeta(html, 'name', 'twitter:title', errorTitle);
        html = replaceOrInsertMeta(html, 'name', 'twitter:description', errorDesc);
        html = html.replace(/<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
        html = replaceRootFallbackHtml(
            html,
            '      <div id="seo-static-content" class="sr-only">\n        <h1>404 - Page Not Found</h1>\n        <p>The page or resource you are looking for does not exist on Hangbug.</p>\n      </div>'
        );
        return html;
    }

    const robotsDirective = resolution.noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    html = replaceOrInsertMeta(html, 'name', 'robots', robotsDirective);

    if (resolution.meta && resolution.meta.title) {
        const { title, description, canonicalPath, h1, article } = resolution.meta;
        const canonicalHref = `${BASE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;

        html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeHtmlText(title)}</title>`);
        if (description) {
            html = replaceOrInsertMeta(html, 'name', 'description', description);
            html = replaceOrInsertMeta(html, 'property', 'og:description', description);
            html = replaceOrInsertMeta(html, 'name', 'twitter:description', description);
        }
        if (/<link\s+rel="canonical"/i.test(html)) {
            html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, () => `<link rel="canonical" href="${escapeHtmlAttr(canonicalHref)}" />`);
        } else {
            html = html.replace('</head>', () => `    <link rel="canonical" href="${escapeHtmlAttr(canonicalHref)}" />\n  </head>`);
        }
        html = replaceOrInsertMeta(html, 'property', 'og:title', title);
        html = replaceOrInsertMeta(html, 'property', 'og:url', canonicalHref);
        html = replaceOrInsertMeta(html, 'name', 'twitter:title', title);
        html = replaceOrInsertMeta(html, 'name', 'twitter:url', canonicalHref);

        if (article) {
            html = replaceOrInsertMeta(html, 'property', 'og:type', 'article');
            const articleJsonLd = {
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'Article',
                        '@id': `${canonicalHref}#article`,
                        headline: article.title,
                        description: description || article.title,
                        datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
                        dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
                        author: {
                            '@type': 'Organization',
                            name: article.authorName || 'Hangbug Editorial Team'
                        },
                        publisher: { '@id': `${BASE_URL}/#organization` },
                        mainEntityOfPage: { '@id': `${canonicalHref}#webpage` }
                    }
                ]
            };
            const jsonLdTag = `<script id="hangbug-jsonld" type="application/ld+json">\n${JSON.stringify(articleJsonLd, null, 2)}\n    </script>`;
            if (/<script id="hangbug-jsonld"[^>]*>[\s\S]*?<\/script>/i.test(html)) {
                html = html.replace(/<script id="hangbug-jsonld"[^>]*>[\s\S]*?<\/script>/i, () => jsonLdTag);
            } else {
                html = html.replace('</head>', () => `    ${jsonLdTag}\n  </head>`);
            }
        }

        html = replaceRootFallbackHtml(
            html,
            `      <main id="seo-static-content" class="sr-only">\n        <h1>${escapeHtmlText(h1 || title)}</h1>\n        <p>${escapeHtmlText(description || '')}</p>\n      </main>`
        );
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
