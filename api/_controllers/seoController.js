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
    'csharp-exception-handling'
];

function buildSitemapXml(extraSlugs = []) {
    const mergedSlugs = Array.from(
        new Set(
            [...GAME_SLUGS, ...(Array.isArray(extraSlugs) ? extraSlugs : [])]
                .filter(slug => slug && slug !== 'coding-memory-match')
        )
    );

    const urls = [
        ...PUBLIC_ROUTES.map(r => `  <url>\n    <loc>${BASE_URL}${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`),
        ...mergedSlugs.map(slug => `  <url>\n    <loc>${BASE_URL}/games/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
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
    try {
        const prisma = require('../_config/prisma');
        if (prisma && prisma.game) {
            const dbGames = await Promise.race([
                prisma.game.findMany({ where: { isPublished: true }, select: { slug: true } }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
            ]);
            if (Array.isArray(dbGames)) {
                extraSlugs = dbGames.map(g => g.slug).filter(Boolean);
            }
        }
    } catch {
        // Fallback to static GAME_SLUGS if DB is offline
    }

    const xml = buildSitemapXml(extraSlugs);
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

module.exports = {
    BASE_URL,
    PUBLIC_ROUTES,
    GAME_SLUGS,
    buildSitemapXml,
    buildRobotsTxt,
    getDynamicSitemap,
    getRobotsTxt
};
