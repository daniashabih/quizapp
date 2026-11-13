const BASE_URL = 'https://www.hangbug.com';

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

function isKnownAppRoute(pathname) {
    if (!pathname || typeof pathname !== 'string') return false;
    const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
    if (KNOWN_EXACT_ROUTES.has(clean)) return true;
    if (clean.startsWith('/technologies/')) {
        const sub = clean.slice('/technologies/'.length);
        return TECH_SLUGS.has(sub);
    }
    if (clean.startsWith('/games/')) {
        const sub = clean.slice('/games/'.length);
        return GAME_SLUGS.includes(sub) || sub === 'coding-memory-match' || sub === 'csharp-complete-the-code' || sub === 'complete-the-code-csharp';
    }
    if (clean.startsWith('/blog/')) {
        const sub = clean.slice('/blog/'.length);
        return BLOG_SLUGS.includes(sub) || /^[a-z0-9-]+$/.test(sub);
    }
    if (clean.startsWith('/reset-password/')) return true;
    if (clean.startsWith('/api/')) return true;
    if (STATIC_PREFIXES.some(prefix => clean.startsWith(prefix))) return true;
    return false;
}

module.exports = {
    BASE_URL,
    PUBLIC_ROUTES,
    GAME_SLUGS,
    BLOG_SLUGS,
    buildSitemapXml,
    buildRobotsTxt,
    getDynamicSitemap,
    getRobotsTxt,
    isKnownAppRoute
};
