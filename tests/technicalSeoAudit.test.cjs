const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to read file
function readFile(relPath) {
    return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

test('1. Technical SEO: Unique titles and meta descriptions for public pages', () => {
    const seoConfigContent = readFile('src/config/seoPagesConfig.js');
    const publicPages = [
        { file: 'src/pages/Landing.jsx', title: 'Interactive Coding Quizzes, Free Practice & Certificates' },
        { file: 'src/pages/quiz/Technologies.jsx', title: 'SEO_PAGES_CONFIG.technologies.title', configTitle: 'All Tech Quizzes: Free Interactive Practice & Certificates' },
        { file: 'src/pages/quiz/TechnologyDetail.jsx', title: 'Free Interactive Tech Quiz Practice & Certificates | Hangbug' },
        { file: 'src/pages/games/GamesHub.jsx', title: 'Free Interactive Coding Games & Typing Practice | Hangbug' },
        { file: 'src/pages/games/GamePlayer.jsx', title: 'formatGameSeoTitle(', configTitle: 'Developer Typing Challenge' },
        { file: 'src/pages/leaderboard/Leaderboard.jsx', title: 'Global Developer Leaderboard & Rankings — Hangbug' },
        { file: 'src/pages/legal/AboutUs.jsx', title: 'About Hangbug: Free Interactive Quizzes & Certificates' },
        { file: 'src/pages/legal/ContactUs.jsx', title: 'Contact Support & Inquiries — Hangbug Coding Quiz Platform' },
        { file: 'src/pages/legal/PrivacyPolicy.jsx', title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy' },
        { file: 'src/pages/legal/TermsOfService.jsx', title: 'Terms of Service — Hangbug Platform Terms & Conditions' },
        { file: 'src/pages/certificates/CertificateView.jsx', title: 'Free Coding Certificates: Earn & Verify Online | Hangbug' }
    ];

    for (const page of publicPages) {
        const content = readFile(page.file);
        assert.ok(content.includes('usePageSeo'), `${page.file} must invoke usePageSeo`);
        assert.ok(content.includes(page.title), `${page.file} must include expected title snippet: ${page.title}`);
        if (page.configTitle) {
            assert.ok(seoConfigContent.includes(page.configTitle), `src/config/seoPagesConfig.js must include expected title snippet: ${page.configTitle}`);
        }
    }
});

test('2. Technical SEO: Canonical URLs use official .com domain', () => {
    const hookCode = readFile('src/hooks/usePageSeo.js');
    assert.ok(hookCode.includes("const BASE_URL = 'https://www.hangbug.com'"), 'usePageSeo must declare BASE_URL https://www.hangbug.com');
    assert.ok(hookCode.includes('canonicalLink.setAttribute(\'href\', canonicalHref)'), 'usePageSeo must set canonical href');

    const indexHtml = readFile('index.html');
    assert.ok(!indexHtml.includes('<link rel="canonical"'), 'index.html must not hardcode canonical link (dynamic per-page)');
});

test('3. Technical SEO: robots.txt properly configured with User-agent, Allow, Disallow and Sitemap', () => {
    const publicRobots = readFile('public/robots.txt');
    const distRobots = readFile('dist/robots.txt');

    assert.ok(publicRobots.includes('User-agent: *'), 'robots.txt must declare User-agent: *');
    assert.ok(publicRobots.includes('Allow: /'), 'robots.txt must allow root');
    assert.ok(publicRobots.includes('Allow: /favicon.ico'), 'robots.txt must explicitly allow /favicon.ico');
    assert.ok(publicRobots.includes('Allow: /favicon-32x32.png'), 'robots.txt must explicitly allow /favicon-32x32.png');
    assert.ok(publicRobots.includes('Allow: /favicon-48x48.png'), 'robots.txt must explicitly allow /favicon-48x48.png');
    assert.ok(publicRobots.includes('Allow: /apple-touch-icon.png'), 'robots.txt must explicitly allow /apple-touch-icon.png');
    assert.ok(publicRobots.includes('Allow: /branding/'), 'robots.txt must explicitly allow /branding/');
    assert.ok(publicRobots.includes('User-agent: Googlebot-Image'), 'robots.txt must declare User-agent: Googlebot-Image');
    assert.ok(publicRobots.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
    assert.ok(publicRobots.includes('Disallow: /admin/'), 'robots.txt must disallow /admin/');
    assert.ok(publicRobots.includes('Disallow: /dashboard/'), 'robots.txt must disallow /dashboard/');
    assert.ok(publicRobots.includes('Disallow: /login'), 'robots.txt must disallow /login');
    assert.ok(publicRobots.includes('Disallow: /signup'), 'robots.txt must disallow /signup');
    assert.ok(publicRobots.includes('Disallow: /register'), 'robots.txt must disallow /register');
    assert.ok(publicRobots.includes('Disallow: /forgot-password'), 'robots.txt must disallow /forgot-password');
    assert.ok(publicRobots.includes('Disallow: /reset-password'), 'robots.txt must disallow /reset-password');
    assert.ok(publicRobots.includes('Sitemap: https://www.hangbug.com/sitemap.xml'), 'robots.txt must link to canonical sitemap');

    assert.strictEqual(publicRobots, distRobots, 'public/robots.txt and dist/robots.txt must match');
});

test('4 & 5. Technical SEO: Dynamic sitemap.xml includes valid indexable pages, populated tech guides, and 14 published games, excludes private/empty/redirect routes', () => {
    const sitemap = readFile('public/sitemap.xml');
    const distSitemap = readFile('dist/sitemap.xml');

    assert.ok(sitemap.startsWith('<?xml'), 'sitemap must be valid XML declaration');
    assert.ok(sitemap.includes('<urlset'), 'sitemap must have urlset root');

    // All valid core & populated technology public pages
    const corePages = [
        'https://www.hangbug.com/',
        'https://www.hangbug.com/technologies',
        'https://www.hangbug.com/games',
        'https://www.hangbug.com/leaderboard',
        'https://www.hangbug.com/about',
        'https://www.hangbug.com/contact',
        'https://www.hangbug.com/privacy-policy',
        'https://www.hangbug.com/terms',
        'https://www.hangbug.com/blog',
        'https://www.hangbug.com/technologies/html',
        'https://www.hangbug.com/technologies/javascript',
        'https://www.hangbug.com/technologies/react',
        'https://www.hangbug.com/technologies/php',
        'https://www.hangbug.com/technologies/laravel',
        'https://www.hangbug.com/technologies/mysql',
        'https://www.hangbug.com/technologies/mongodb',
        'https://www.hangbug.com/technologies/dart',
        'https://www.hangbug.com/technologies/python'
    ];
    for (const url of corePages) {
        assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap must include core page: ${url}`);
    }

    // All 14 published DB games
    const published14Games = [
        'code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble',
        'missing-code', 'logic-builder', 'sql-challenge', 'memory-match',
        'speed-typing', 'code-typing', 'sixty-second-challenge', 'error-free-typing',
        'syntax-typing', 'word-rain'
    ];
    for (const game of published14Games) {
        assert.ok(sitemap.includes(`<loc>https://www.hangbug.com/games/${game}</loc>`), `sitemap must include game: ${game}`);
    }

    // Excluded private, auth, redirect, empty tech, and non-DB game pages
    const excludedPages = [
        '/login', '/signup', '/register', '/forgot-password', '/reset-password',
        '/delete-account', '/account-deletion', '/data-deletion', '/dashboard',
        '/admin', '/quiz/start', '/quiz/result', '/privacy',
        '/resources', '/certificate/view',
        '/technologies/css', '/technologies/flutter', '/technologies/programming-fundamentals',
        '/games/csharp-oop-challenge', '/games/csharp-collections-challenge',
        '/games/csharp-linq-challenge', '/games/csharp-exception-handling',
        '/games/complete-the-code', '/games/csharp-quiz-challenge',
        '/games/coding-memory-match'
    ];
    for (const page of excludedPages) {
        assert.ok(!sitemap.includes(`<loc>https://www.hangbug.com${page}</loc>`), `sitemap must NOT include excluded page: ${page}`);
    }

    assert.strictEqual(sitemap, distSitemap, 'public/sitemap.xml and dist/sitemap.xml must match');
});

test('6. Technical SEO: Appropriate robots meta directives (noindex) applied to private pages', () => {
    const privatePages = [
        'src/pages/NotFound.jsx',
        'src/pages/auth/Auth.jsx',
        'src/pages/auth/ForgotPassword.jsx',
        'src/pages/auth/ResetPassword.jsx',
        'src/pages/legal/DeleteAccount.jsx',
        'src/pages/quiz/Quiz.jsx',
        'src/pages/quiz/Result.jsx',
        'src/pages/dashboard/UserDashboard.jsx',
        'src/pages/certificates/Certificates.jsx',
        'src/pages/profile/Profile.jsx',
        'src/pages/settings/Settings.jsx',
        'src/pages/admin/AdminDashboard.jsx',
        'src/pages/seo/SeoDashboard.jsx',
        'src/layouts/DashboardLayout.jsx'
    ];

    for (const file of privatePages) {
        const content = readFile(file);
        assert.ok(content.includes('noindex: true'), `${file} must specify noindex: true`);
    }
});

test('7 & 8. Technical SEO: Open Graph and Twitter/X card metadata support', () => {
    const hookCode = readFile('src/hooks/usePageSeo.js');
    assert.ok(hookCode.includes('og:title'), 'usePageSeo must manage og:title');
    assert.ok(hookCode.includes('og:description'), 'usePageSeo must manage og:description');
    assert.ok(hookCode.includes('og:url'), 'usePageSeo must manage og:url');
    assert.ok(hookCode.includes('og:type'), 'usePageSeo must manage og:type');
    assert.ok(hookCode.includes('og:image'), 'usePageSeo must manage og:image');
    assert.ok(hookCode.includes('og:image:alt'), 'usePageSeo must manage og:image:alt');
    assert.ok(hookCode.includes('og:site_name'), 'usePageSeo must manage og:site_name');

    assert.ok(hookCode.includes('twitter:card'), 'usePageSeo must manage twitter:card');
    assert.ok(hookCode.includes('twitter:title'), 'usePageSeo must manage twitter:title');
    assert.ok(hookCode.includes('twitter:description'), 'usePageSeo must manage twitter:description');
    assert.ok(hookCode.includes('twitter:image'), 'usePageSeo must manage twitter:image');
    assert.ok(hookCode.includes('twitter:image:alt'), 'usePageSeo must manage twitter:image:alt');

    const indexHtml = readFile('index.html');
    assert.ok(indexHtml.includes('property="og:image:alt"'), 'index.html must declare og:image:alt');
    assert.ok(indexHtml.includes('name="twitter:image:alt"'), 'index.html must declare twitter:image:alt');
    assert.ok(indexHtml.includes('name="robots"'), 'index.html must declare default robots directive');
});

test('9. Technical SEO: HTML lang, viewport and charset attributes', () => {
    const indexHtml = readFile('index.html');
    assert.ok(indexHtml.includes('<html lang="en">'), 'index.html must declare lang="en"');
    assert.ok(indexHtml.includes('<meta charset="UTF-8" />') || indexHtml.includes('<meta charset="UTF-8">'), 'index.html must declare charset="UTF-8"');
    assert.ok(indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0"'), 'index.html must declare responsive viewport');
});

test('10. Technical SEO: Semantic HTML5 elements (<header>, <main>, <nav>, <footer>)', () => {
    const navbar = readFile('src/components/Navbar.jsx');
    assert.ok(navbar.includes('<header') && navbar.includes('</header>'), 'Navbar must use <header>');
    assert.ok(navbar.includes('<nav') && navbar.includes('</nav>'), 'Navbar must use <nav>');

    const footer = readFile('src/components/Footer.jsx');
    assert.ok(footer.includes('<footer') && footer.includes('</footer>'), 'Footer must use <footer>');

    const landing = readFile('src/pages/Landing.jsx');
    assert.ok(landing.includes('<main') && landing.includes('</main>'), 'Landing must use <main>');

    const tech = readFile('src/pages/quiz/Technologies.jsx');
    assert.ok(tech.includes('<main') && tech.includes('</main>'), 'Technologies must use <main>');

    const gamesHub = readFile('src/pages/games/GamesHub.jsx');
    assert.ok(gamesHub.includes('<main') && gamesHub.includes('</main>'), 'GamesHub must use <main>');

    const gamePlayer = readFile('src/pages/games/GamePlayer.jsx');
    assert.ok(gamePlayer.includes('<main') && gamePlayer.includes('</main>'), 'GamePlayer must use <main>');

    const aboutUs = readFile('src/pages/legal/AboutUs.jsx');
    assert.ok(aboutUs.includes('<main') && aboutUs.includes('</main>'), 'AboutUs must use <main>');

    const contactUs = readFile('src/pages/legal/ContactUs.jsx');
    assert.ok(contactUs.includes('<main') && contactUs.includes('</main>'), 'ContactUs must use <main>');

    const certView = readFile('src/pages/certificates/CertificateView.jsx');
    assert.ok(certView.includes('<main') && certView.includes('</main>'), 'CertificateView must use <main>');
});

test('11. Technical SEO: Proper heading hierarchy', () => {
    const splash = readFile('src/components/SplashScreen.jsx');
    assert.ok(!splash.includes('<h1'), 'SplashScreen must not contain an <h1> tag');

    const landing = readFile('src/pages/Landing.jsx');
    assert.ok(landing.includes('<motion.h1') || landing.includes('<h1'), 'Landing must have an h1');
    assert.ok(landing.includes('<h2'), 'Landing must have an h2 before h3');

    const aboutUs = readFile('src/pages/legal/AboutUs.jsx');
    assert.ok(aboutUs.includes('<h1'), 'AboutUs must have an h1');
    assert.ok(aboutUs.includes('<h2'), 'AboutUs must have an h2');

    const certView = readFile('src/pages/certificates/CertificateView.jsx');
    assert.ok(certView.includes('<h1'), 'CertificateView must have an h1');
    assert.ok(certView.includes('<h2'), 'CertificateView must have an h2');
});

test('12. Technical SEO: Descriptive image alt attributes', () => {
    const brandLogo = readFile('src/components/BrandLogo.jsx');
    assert.ok(brandLogo.includes('alt="HangBug developer platform logo icon"'), 'BrandLogo icon must have descriptive alt');
    assert.ok(brandLogo.includes('alt="HangBug developer platform logo"'), 'BrandLogo compact must have descriptive alt');

    const splash = readFile('src/components/SplashScreen.jsx');
    assert.ok(splash.includes('alt="HangBug developer platform emblem"'), 'SplashScreen emblem must have descriptive alt');

    const leaderboard = readFile('src/components/Leaderboard.jsx');
    assert.ok(leaderboard.includes('profile avatar'), 'Leaderboard avatars must have descriptive alt');
});

test('13. Technical SEO: Important public pages have crawlable links and valid routes', () => {
    const navbar = readFile('src/components/Navbar.jsx');
    assert.ok(navbar.includes("path: '/'"), 'Navbar must link to home');
    assert.ok(navbar.includes("path: '/technologies'"), 'Navbar must link to /technologies');
    assert.ok(navbar.includes("path: '/games'"), 'Navbar must link to /games');
    assert.ok(navbar.includes("path: '/leaderboard'"), 'Navbar must link to /leaderboard');

    const footer = readFile('src/components/Footer.jsx');
    assert.ok(footer.includes('to="/games"'), 'Footer must link to /games');
    assert.ok(footer.includes('to="/technologies"'), 'Footer must link to /technologies');
    assert.ok(footer.includes('to="/leaderboard"'), 'Footer must link to /leaderboard');
    assert.ok(footer.includes('to="/about"'), 'Footer must link to /about');
    assert.ok(footer.includes('to="/contact"'), 'Footer must link to /contact');
    assert.ok(footer.includes('to="/privacy-policy"'), 'Footer must link to /privacy-policy');
    assert.ok(footer.includes('to="/terms"'), 'Footer must link to /terms');

    const appJsx = readFile('src/App.jsx');
    assert.ok(appJsx.includes('<Route path="/technologies/:slug" element={<TechnologyDetail />} />'), 'App.jsx must route /technologies/:slug to TechnologyDetail');
});

test('14 & 15. Technical SEO: Permanent redirects and status codes in vercel.json & Express', () => {
    const vercelConfig = JSON.parse(readFile('vercel.json'));
    assert.ok(Array.isArray(vercelConfig.redirects), 'vercel.json must have redirects array');

    const privacyRedirect = vercelConfig.redirects.find(r => r.source === '/privacy');
    assert.ok(privacyRedirect && privacyRedirect.destination === '/privacy-policy' && privacyRedirect.permanent === true, 'vercel.json must permanently redirect /privacy to /privacy-policy');

    const accountDeletionRedirect = vercelConfig.redirects.find(r => r.source === '/account-deletion');
    assert.ok(accountDeletionRedirect && accountDeletionRedirect.destination === '/delete-account' && accountDeletionRedirect.permanent === true, 'vercel.json must permanently redirect /account-deletion to /delete-account');

    const memoryMatchRedirect = vercelConfig.redirects.find(r => r.source === '/games/coding-memory-match');
    assert.ok(memoryMatchRedirect && memoryMatchRedirect.destination === '/games/memory-match' && memoryMatchRedirect.permanent === true, 'vercel.json must permanently redirect /games/coding-memory-match to /games/memory-match');

    const apiIndex = readFile('api/index.js');
    assert.ok(apiIndex.includes("res.redirect(301, '/privacy-policy')"), 'Express must 301 redirect /privacy to /privacy-policy');
    assert.ok(apiIndex.includes("res.redirect(301, '/games/memory-match')"), 'Express must 301 redirect /games/coding-memory-match to /games/memory-match');
    assert.ok(apiIndex.includes("res.redirect(301, '/technologies')"), 'Express must 301 redirect legacy quiz routes to /technologies');
    assert.ok(apiIndex.includes("app.get('/robots.txt', getRobotsTxt)"), 'Express must serve /robots.txt');
    assert.ok(apiIndex.includes("app.get('/sitemap.xml', getDynamicSitemap)"), 'Express must serve /sitemap.xml');

    const { getRobotsTxt } = require('../api/_controllers/seoController');

    let robotsStatus = 0;
    let robotsBody = '';
    const robotsHeaders = {};
    getRobotsTxt({}, {
        setHeader: (k, v) => { robotsHeaders[k] = v; },
        status: (code) => ({ send: (body) => { robotsStatus = code; robotsBody = body; } })
    });
    assert.strictEqual(robotsStatus, 200, 'getRobotsTxt must return HTTP 200');
    assert.ok(robotsHeaders['Content-Type'].includes('text/plain'), 'getRobotsTxt must set Content-Type text/plain');
    assert.ok(robotsBody.includes('Sitemap: https://www.hangbug.com/sitemap.xml'), 'getRobotsTxt must include Sitemap URL');
});

test('16. Google Search Logo & Favicon: Square favicon assets (32x32, 48x48, 180x180, 192x192, ico) exist and are linked in index.html', () => {
    const requiredAssets = [
        { rel: 'public/favicon.ico', dist: 'dist/favicon.ico' },
        { rel: 'public/favicon-32x32.png', dist: 'dist/favicon-32x32.png', width: 32, height: 32 },
        { rel: 'public/favicon-48x48.png', dist: 'dist/favicon-48x48.png', width: 48, height: 48 },
        { rel: 'public/favicon.png', dist: 'dist/favicon.png', width: 192, height: 192 },
        { rel: 'public/apple-touch-icon.png', dist: 'dist/apple-touch-icon.png', width: 180, height: 180 },
        { rel: 'public/branding/hangbug-logo-full.png', dist: 'dist/branding/hangbug-logo-full.png', width: 1024, height: 1024 }
    ];

    for (const asset of requiredAssets) {
        const pubPath = path.join(ROOT_DIR, asset.rel);
        const distPath = path.join(ROOT_DIR, asset.dist);
        assert.ok(fs.existsSync(pubPath), `${asset.rel} must exist`);
        assert.ok(fs.existsSync(distPath), `${asset.dist} must exist in production dist`);

        if (asset.width && asset.height) {
            const buf = fs.readFileSync(pubPath);
            const w = buf.readUInt32BE(16);
            const h = buf.readUInt32BE(20);
            assert.strictEqual(w, asset.width, `${asset.rel} width must be ${asset.width}px`);
            assert.strictEqual(h, asset.height, `${asset.rel} height must be ${asset.height}px`);
            assert.strictEqual(w, h, `${asset.rel} must be square`);
        }
    }

    const indexHtml = readFile('index.html');
    assert.ok(indexHtml.includes('href="/favicon.ico"'), 'index.html must reference /favicon.ico');
    assert.ok(indexHtml.includes('href="/favicon-48x48.png"') && indexHtml.includes('sizes="48x48"'), 'index.html must reference /favicon-48x48.png with sizes="48x48"');
    assert.ok(indexHtml.includes('href="/favicon-32x32.png"') && indexHtml.includes('sizes="32x32"'), 'index.html must reference /favicon-32x32.png with sizes="32x32"');
    assert.ok(indexHtml.includes('href="/apple-touch-icon.png"'), 'index.html must reference /apple-touch-icon.png');
});

test('17. Structured Data (JSON-LD): Valid Organization, WebSite, SoftwareApplication, and BreadcrumbList schemas without fake ratings', () => {
    const indexHtml = readFile('index.html');
    const match = indexHtml.match(/<script id="hangbug-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(match && match[1], 'index.html must contain initial #hangbug-jsonld script');

    const parsed = JSON.parse(match[1]);
    assert.strictEqual(parsed['@context'], 'https://schema.org');
    assert.ok(Array.isArray(parsed['@graph']), 'JSON-LD must contain @graph array');

    const org = parsed['@graph'].find(n => n['@type'] === 'Organization');
    assert.ok(org, 'JSON-LD must include Organization schema');
    assert.strictEqual(org.name, 'Hangbug');
    assert.strictEqual(org.url, 'https://www.hangbug.com/');
    assert.strictEqual(org.logo?.url, 'https://www.hangbug.com/branding/hangbug-logo-full.png');

    const site = parsed['@graph'].find(n => n['@type'] === 'WebSite');
    assert.ok(site, 'JSON-LD must include WebSite schema');
    assert.strictEqual(site.name, 'Hangbug');
    assert.strictEqual(site.url, 'https://www.hangbug.com/');

    const app = parsed['@graph'].find(n => n['@type'] === 'SoftwareApplication');
    assert.ok(app, 'JSON-LD must include SoftwareApplication schema');
    assert.strictEqual(app.name, 'Hangbug');
    assert.strictEqual(app.applicationCategory, 'EducationalApplication');
    assert.ok(!app.aggregateRating && !app.review, 'SoftwareApplication schema must NOT include fake ratings or reviews');

    const breadcrumb = parsed['@graph'].find(n => n['@type'] === 'BreadcrumbList');
    assert.ok(breadcrumb, 'JSON-LD must include BreadcrumbList schema');
    assert.ok(Array.isArray(breadcrumb.itemListElement) && breadcrumb.itemListElement.length >= 1, 'BreadcrumbList must have itemListElement');
});

test('18. Brand Identity & AI Overview Accuracy: Official Hangbug title, meta description, and crawlable product explanations', () => {
    const indexHtml = readFile('index.html');
    const landing = readFile('src/pages/Landing.jsx');
    const about = readFile('src/pages/legal/AboutUs.jsx');

    const officialTitle = 'Interactive Coding Quizzes, Free Practice & Certificates';
    const officialDesc = 'Learn programming, practice interactive technology quizzes, play coding games, track your progress, and earn score-based certificates with Hangbug.';

    assert.ok(indexHtml.includes(`<title>${officialTitle}</title>`), 'index.html must use official Hangbug title');
    assert.ok(indexHtml.includes(`content="${officialDesc}"`), 'index.html must use official Hangbug meta description');
    assert.ok(!indexHtml.includes('Debug Your Knowledge'), 'index.html must not use ambiguous Debug Your Knowledge tagline');
    assert.ok(!landing.includes('Debug Your Knowledge'), 'Landing.jsx must not use ambiguous Debug Your Knowledge tagline');
    assert.ok(!about.includes('Debug Your Knowledge'), 'AboutUs.jsx must not use ambiguous Debug Your Knowledge tagline');

    // Verify crawlable HTML headings on Landing and About pages
    assert.ok(landing.includes('What is Hangbug?'), 'Landing.jsx must include What is Hangbug? heading');
    assert.ok(landing.includes('Technology Quiz Categories Covered'), 'Landing.jsx must include Technology Quiz Categories Covered heading');
    assert.ok(landing.includes('How Hangbug Works for Students'), 'Landing.jsx must include How Hangbug Works heading');
    assert.ok(about.includes('What is Hangbug?'), 'AboutUs.jsx must include What is Hangbug? heading');
    assert.ok(about.includes('How Hangbug Works'), 'AboutUs.jsx must include How Hangbug Works heading');
});

test('19. Technical SEO: XML sitemap accurate ISO 8601 lastmod timestamps and strict indexable URL coverage', () => {
    const sitemap = readFile('public/sitemap.xml');
    const lastmodMatches = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
    assert.ok(lastmodMatches.length >= 30, 'sitemap.xml must declare <lastmod> timestamps for all URLs');
    const uniqueDates = new Set(lastmodMatches);
    assert.ok(uniqueDates.size > 1, 'sitemap.xml must NOT stamp every URL with the exact same date');
    for (const lm of lastmodMatches) {
        assert.ok(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(lm), `lastmod must be valid ISO 8601 UTC: ${lm}`);
    }
    assert.ok(!sitemap.includes('<loc>https://www.hangbug.com/certificate/view</loc>'), 'sitemap.xml must exclude noindex /certificate/view');
    assert.ok(!sitemap.includes('<loc>https://www.hangbug.com/resources</loc>'), 'sitemap.xml must exclude redirected /resources');
});

test('20. Technical SEO: Vercel routing configuration, API protections, and alias 301 redirects', () => {
    const vercelConfig = JSON.parse(readFile('vercel.json'));
    assert.strictEqual(vercelConfig.trailingSlash, false, 'vercel.json must disable trailing slashes to prevent duplicate URLs');
    assert.ok(vercelConfig.functions && vercelConfig.functions['api/index.js'], 'vercel.json must configure api/index.js function');
    assert.ok(vercelConfig.functions['api/index.js'].includeFiles.includes('api/**'), 'includeFiles must bundle api/**');

    const apiRewrite = vercelConfig.rewrites.find(r => r.source === '/api/(.*)');
    assert.ok(apiRewrite && apiRewrite.destination === '/api/index.js', 'vercel.json must rewrite /api/(.*) to /api/index.js');

    const sitemapRedirect = vercelConfig.redirects.find(r => r.source === '/sitemap');
    assert.ok(sitemapRedirect && sitemapRedirect.destination === '/sitemap.xml' && sitemapRedirect.permanent === true, 'vercel.json must 301 redirect /sitemap to /sitemap.xml');

    const robotsRedirect = vercelConfig.redirects.find(r => r.source === '/robots');
    assert.ok(robotsRedirect && robotsRedirect.destination === '/robots.txt' && robotsRedirect.permanent === true, 'vercel.json must 301 redirect /robots to /robots.txt');

    const reactjsRedirect = vercelConfig.redirects.find(r => r.source === '/technologies/reactjs');
    assert.ok(reactjsRedirect && reactjsRedirect.destination === '/technologies/react' && reactjsRedirect.permanent === true, 'vercel.json must 301 redirect /technologies/reactjs to /technologies/react');
});

test('21. Technical SEO: Web App Manifest and Icon Configuration', () => {
    const manifestPath = path.join(ROOT_DIR, 'public/manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'public/manifest.json must exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.short_name, 'Hangbug');
    assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 4, 'manifest must declare icons array');

    const indexHtml = readFile('index.html');
    assert.ok(indexHtml.includes('rel="manifest" href="/manifest.json"'), 'index.html must reference manifest.json');
});

test('22. Technical SEO: Route Validation for Soft 404 Prevention', () => {
    const { isKnownAppRoute } = require('../api/_controllers/seoController');
    assert.strictEqual(isKnownAppRoute('/'), true, 'Home route must be valid');
    assert.strictEqual(isKnownAppRoute('/technologies'), true, 'Technologies route must be valid');
    assert.strictEqual(isKnownAppRoute('/technologies/react'), true, 'Technology slug must be valid');
    assert.strictEqual(isKnownAppRoute('/games/memory-match'), true, 'Game slug must be valid');
    assert.strictEqual(isKnownAppRoute('/games/csharp-code-puzzle'), true, 'Valid C# game alias slug must be valid');
    assert.strictEqual(isKnownAppRoute('/blog/html-tutorial-for-beginners'), true, 'Valid blog slug must be valid');
    assert.strictEqual(isKnownAppRoute('/about'), true, 'About page must be valid');
    assert.strictEqual(isKnownAppRoute('/contact'), true, 'Contact page must be valid');
    assert.strictEqual(isKnownAppRoute('/unknown-random-404-path'), false, 'Unknown path must not be a known route');
    assert.strictEqual(isKnownAppRoute('/technologies/fake-language'), false, 'Fake technology slug must not be a known route');
    assert.strictEqual(isKnownAppRoute('/technologies/html/extra'), false, 'Nested unknown tech subpath must not be a known route');
    assert.strictEqual(isKnownAppRoute('/blog/fake-nonexistent-article'), false, 'Fake blog slug must not be a known route');
    assert.strictEqual(isKnownAppRoute('/games/fake-nonexistent-game'), false, 'Fake game slug must not be a known route');
});

test('23. Technical SEO Audit: Pre-rendered static pages exist with unique titles and meta descriptions', () => {
    const publicRoutes = [
        'dist/index.html',
        'dist/technologies/index.html',
        'dist/games/index.html',
        'dist/leaderboard/index.html',
        'dist/about/index.html',
        'dist/contact/index.html',
        'dist/privacy-policy/index.html',
        'dist/terms/index.html',
        'dist/blog/index.html',
        'dist/technologies/html/index.html',
        'dist/technologies/javascript/index.html',
        'dist/technologies/react/index.html',
        'dist/games/code-puzzle/index.html'
    ];

    const titles = new Set();
    const descriptions = new Set();

    for (const file of publicRoutes) {
        assert.ok(fs.existsSync(path.join(ROOT_DIR, file)), `${file} must exist in production build`);
        const content = readFile(file);

        const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
        assert.ok(titleMatch && titleMatch[1], `${file} must have a non-empty <title> tag`);
        const title = titleMatch[1].trim();
        assert.ok(!titles.has(title), `Duplicate title found: "${title}" in ${file}`);
        titles.add(title);

        const descMatch = content.match(/<meta\s+name="description"\s+content="([\s\S]*?)"\s*\/?>/);
        assert.ok(descMatch && descMatch[1], `${file} must have a non-empty <meta name="description"> tag`);
        const desc = descMatch[1].trim();
        assert.ok(!descriptions.has(desc), `Duplicate meta description found: "${desc}" in ${file}`);
        descriptions.add(desc);
    }
});

test('24. Technical SEO Audit: Pages have <h1> headings that are distinct from their <title> tags', () => {
    const samplePages = [
        'dist/index.html',
        'dist/about/index.html',
        'dist/technologies/index.html',
        'dist/games/index.html',
        'dist/leaderboard/index.html',
        'dist/contact/index.html',
        'dist/privacy-policy/index.html',
        'dist/terms/index.html'
    ];

    for (const file of samplePages) {
        const content = readFile(file);
        const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
        const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);

        assert.ok(titleMatch, `${file} must contain a title tag`);
        assert.ok(h1Match, `${file} must contain an h1 tag`);

        const title = titleMatch[1].replace(/&amp;/g, '&').trim();
        const h1 = h1Match[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();

        assert.notStrictEqual(h1.toLowerCase(), title.toLowerCase(), `${file} <h1> must NOT duplicate its <title>`);
    }
});

test('25. Technical SEO Audit: Word count exceeds 200 words on all pre-rendered public pages', () => {
    const samplePages = [
        'dist/index.html',
        'dist/about/index.html',
        'dist/technologies/index.html',
        'dist/games/index.html',
        'dist/leaderboard/index.html',
        'dist/contact/index.html',
        'dist/privacy-policy/index.html',
        'dist/terms/index.html'
    ];

    for (const file of samplePages) {
        const content = readFile(file);
        const rootMatch = content.match(/<div id="root">([\s\S]*?)<\/div>/);
        assert.ok(rootMatch, `${file} must contain #root with static content`);
        const plainText = rootMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = plainText.split(' ').filter(Boolean).length;
        assert.ok(wordCount >= 200, `${file} must contain at least 200 words of crawlable content, got ${wordCount}`);
    }
});

test('26. Technical SEO Audit: Schema.org structured data contains valid Google-compliant offers for SoftwareApplication', () => {
    const filesWithAppSchema = ['dist/index.html', 'dist/games/code-puzzle/index.html'];

    for (const file of filesWithAppSchema) {
        const content = readFile(file);
        const match = content.match(/<script id="hangbug-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
        assert.ok(match, `${file} must contain JSON-LD script`);

        const parsed = JSON.parse(match[1]);
        const app = parsed['@graph'].find(n => n['@type'] === 'SoftwareApplication');
        assert.ok(app, `${file} must include SoftwareApplication in @graph`);
        assert.ok(app.offers, 'SoftwareApplication must include offers object for Google rich snippet compliance');
        assert.strictEqual(app.offers['@type'], 'Offer');
        assert.strictEqual(app.offers.price, '0');
        assert.strictEqual(app.offers.priceCurrency, 'USD');
    }
});

test('27. Technical SEO Audit: llms.txt and llms-full.txt exist and are properly configured', () => {
    const publicLlms = path.join(ROOT_DIR, 'public/llms.txt');
    const distLlms = path.join(ROOT_DIR, 'dist/llms.txt');
    const publicLlmsFull = path.join(ROOT_DIR, 'public/llms-full.txt');
    const distLlmsFull = path.join(ROOT_DIR, 'dist/llms-full.txt');

    assert.ok(fs.existsSync(publicLlms), 'public/llms.txt must exist');
    assert.ok(fs.existsSync(distLlms), 'dist/llms.txt must exist');
    assert.ok(fs.existsSync(publicLlmsFull), 'public/llms-full.txt must exist');
    assert.ok(fs.existsSync(distLlmsFull), 'dist/llms-full.txt must exist');

    const content = fs.readFileSync(publicLlms, 'utf8');
    assert.ok(content.startsWith('# Hangbug'), 'llms.txt must start with H1 project name');
    assert.ok(content.includes('https://www.hangbug.com'), 'llms.txt must reference official URLs');
    assert.ok(content.includes('## Technology Quiz Tracks'), 'llms.txt must include quiz tracks');
    assert.ok(content.includes('## Developer Games'), 'llms.txt must include developer games');

    // Verify vercel.json headers for llms.txt
    const vercelConfig = JSON.parse(readFile('vercel.json'));
    const llmsHeader = vercelConfig.headers.find(h => h.source === '/llms.txt');
    assert.ok(llmsHeader, 'vercel.json must have headers configuration for /llms.txt');
    const contentType = llmsHeader.headers.find(h => h.key === 'Content-Type');
    assert.ok(contentType && contentType.value.includes('text/markdown'), 'vercel.json must serve /llms.txt as text/markdown');
});

test('28. Homepage SEO Verification: Metadata, H1 hierarchy, canonical, Open Graph, JSON-LD, internal links, and image SEO', async () => {
    const { validateStructuredData } = await import(
        require('node:url').pathToFileURL(path.join(ROOT_DIR, 'src', 'utils', 'structuredData.js')).href
    );

    const expectedTitle = 'Interactive Coding Quizzes, Free Practice & Certificates';
    const expectedDesc = 'Learn programming, practice interactive technology quizzes, play coding games, track your progress, and earn score-based certificates with Hangbug.';
    const expectedH1 = 'Learn Programming, Practice Tech Quizzes & Earn Certificates';

    const distHome = readFile('dist/index.html');
    const landing = readFile('src/pages/Landing.jsx');
    const footer = readFile('src/components/Footer.jsx');
    const navbar = readFile('src/components/Navbar.jsx');
    const brandLogo = readFile('src/components/BrandLogo.jsx');
    const techLogo = readFile('src/components/TechLogo.jsx');
    const splashScreen = readFile('src/components/SplashScreen.jsx');

    // 1. Homepage title, meta description, canonical, and Open Graph
    assert.ok(distHome.includes(`<title>${expectedTitle}</title>`), 'dist/index.html must have updated title');
    assert.ok(distHome.includes(`name="description" content="${expectedDesc}"`), 'dist/index.html must have updated meta description');
    assert.ok(distHome.includes('<link rel="canonical" href="https://www.hangbug.com/" />'), 'dist/index.html must have homepage canonical');
    assert.ok(distHome.includes(`<meta property="og:title" content="${expectedTitle}" />`), 'dist/index.html must have matching og:title');
    assert.ok(distHome.includes(`<meta property="og:description" content="${expectedDesc}" />`), 'dist/index.html must have matching og:description');
    assert.ok(distHome.includes('<meta property="og:url" content="https://www.hangbug.com/" />'), 'dist/index.html must have homepage og:url');

    // 2. Single H1 hierarchy
    const h1Matches = distHome.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) || [];
    assert.strictEqual(h1Matches.length, 1, 'dist/index.html must have exactly one <h1>');
    assert.strictEqual(h1Matches[0].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim(), expectedH1);
    const landingH1Count = (landing.match(/<(?:motion\.)?h1\b/g) || []).length;
    assert.strictEqual(landingH1Count, 1, 'Landing.jsx must have exactly one <h1>');

    // 3. Balanced root container (no orphaned </div> from prerendering)
    const bodyMatch = distHome.match(/<body[^>]*>([\s\S]*)<\/body>/);
    assert.ok(bodyMatch, 'dist/index.html must contain body');
    const openDivs = (bodyMatch[1].match(/<div\b/g) || []).length;
    const closeDivs = (bodyMatch[1].match(/<\/div>/g) || []).length;
    assert.strictEqual(openDivs, closeDivs, 'dist/index.html body must have balanced <div> tags');

    // 4. Crawlable internal SEO links in static HTML and React homepage
    const requiredLinks = [
        '/technologies',
        '/technologies/html',
        '/technologies/css',
        '/technologies/javascript',
        '/technologies/react',
        '/technologies/php',
        '/technologies/laravel',
        '/technologies/mysql',
        '/technologies/mongodb',
        '/technologies/flutter',
        '/technologies/dart',
        '/technologies/python',
        '/technologies/programming-fundamentals',
        '/games',
        '/about',
        '/contact',
        '/blog'
    ];
    for (const href of requiredLinks) {
        assert.ok(distHome.includes(`href="${href}"`), `dist/index.html must include crawlable link to ${href}`);
        const combinedHomepageReact = landing + navbar + footer;
        assert.ok(
            combinedHomepageReact.includes(`"${href}"`) || combinedHomepageReact.includes(`/technologies/\${tech.slug}`),
            `Homepage React components must link to ${href}`
        );
    }

    // 5. Image SEO: descriptive alt, dimensions, loading attributes
    assert.ok(brandLogo.includes('width={512}') && brandLogo.includes('height={512}'), 'BrandLogo mark must define explicit dimensions');
    assert.ok(brandLogo.includes('width={615}') && brandLogo.includes('height={212}'), 'BrandLogo compact must define explicit dimensions');
    assert.ok(brandLogo.includes('loading={loading}') && brandLogo.includes('decoding="async"'), 'BrandLogo must manage loading and async decoding');
    assert.ok(splashScreen.includes('width={512}') && splashScreen.includes('height={512}'), 'SplashScreen logo must define explicit dimensions');
    assert.ok(techLogo.includes('technology icon') && techLogo.includes('width={') && techLogo.includes('height={'), 'TechLogo must define descriptive alt and explicit dimensions');

    // 6. Structured data validation for Organization & WebSite without fake ratings/reviews
    const jsonLdMatch = distHome.match(/<script id="hangbug-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLdMatch && jsonLdMatch[1], 'dist/index.html must contain JSON-LD');
    const jsonLd = JSON.parse(jsonLdMatch[1]);
    const validation = validateStructuredData(jsonLd);
    assert.strictEqual(validation.valid, true, `Homepage JSON-LD validation failed: ${validation.errors.join('; ')}`);

    const websiteNode = jsonLd['@graph'].find(n => n['@type'] === 'WebSite');
    assert.ok(websiteNode && websiteNode.alternateName === 'HangBug', 'WebSite alternateName must be concise brand name HangBug');
});

test('29. Soft 404 Prevention: Vercel rewrites, pre-rendered blog/404 artifacts, NotFound UI, and Express HTTP status codes', async () => {
    const http = require('node:http');
    const vercelConfig = JSON.parse(readFile('vercel.json'));
    const spaRewrite = vercelConfig.rewrites.find(r => r.destination && r.destination.includes('__hangbug_route'));
    assert.ok(spaRewrite, 'vercel.json catch-all rewrite must route unmatched paths through /api/index.js?__hangbug_route=/$1');
    assert.ok(!vercelConfig.rewrites.some(r => r.destination === '/index.html'), 'vercel.json must NOT blindly rewrite unmatched URLs to /index.html with HTTP 200');
    assert.ok(vercelConfig.functions['api/index.js'].includeFiles.includes('dist/404.html'), 'vercel.json must include dist/404.html for serverless fallback');

    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'dist/404.html')), 'dist/404.html must exist');
    const static404 = readFile('dist/404.html');
    assert.ok(static404.includes('noindex, nofollow'), 'dist/404.html must include noindex, nofollow');
    assert.ok(!static404.includes('<link rel="canonical"'), 'dist/404.html must NOT contain a homepage canonical link');

    assert.ok(fs.existsSync(path.join(ROOT_DIR, 'dist/blog/html-tutorial-for-beginners/index.html')), 'Pre-rendered blog post must exist');
    const blogHtml = readFile('dist/blog/html-tutorial-for-beginners/index.html');
    assert.ok(blogHtml.includes('HTML Tutorial for Beginners'), 'Pre-rendered blog post must contain article title');

    const notFoundComponent = readFile('src/pages/NotFound.jsx');
    assert.ok(notFoundComponent.includes('Oops! Lost in the Code?') && notFoundComponent.includes('noindex: true'), 'NotFound component must preserve UI and set noindex: true');

    const blogDetailComponent = readFile('src/pages/blog/BlogDetail.jsx');
    assert.ok(blogDetailComponent.includes('return <NotFound />;'), 'BlogDetail must render NotFound when article is missing');

    const app = require('../api/index.js');
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    try {
        const { port } = server.address();
        const requestRoute = (reqPath) => new Promise((resolve, reject) => {
            const req = http.get(`http://127.0.0.1:${port}${reqPath}`, (res) => {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
            });
            req.on('error', reject);
        });

        const okRoutes = [
            '/',
            '/technologies',
            '/technologies/html',
            '/blog',
            '/blog/html-tutorial-for-beginners',
            '/games',
            '/games/code-puzzle',
            '/games/csharp-code-puzzle',
            '/api/index.js?__hangbug_route=/login'
        ];
        for (const r of okRoutes) {
            const res = await requestRoute(r);
            assert.strictEqual(res.status, 200, `${r} must return HTTP 200, got ${res.status}`);
        }

        const csharpAliasRes = await requestRoute('/games/csharp-code-puzzle');
        assert.strictEqual(csharpAliasRes.status, 200, '/games/csharp-code-puzzle must return HTTP 200');
        assert.ok(csharpAliasRes.body.includes('C# Code Puzzle'), '/games/csharp-code-puzzle must render C# Code Puzzle title');
        assert.ok(csharpAliasRes.body.includes('<link rel="canonical" href="https://www.hangbug.com/games/code-puzzle"'), '/games/csharp-code-puzzle must canonicalize to /games/code-puzzle');

        for (const trailingRoute of ['/blog/', '/technologies/', '/blog/html-tutorial-for-beginners/']) {
            const trRes = await requestRoute(trailingRoute);
            assert.strictEqual(trRes.status, 301, `${trailingRoute} must 301 redirect trailing slash`);
            assert.strictEqual(trRes.headers.location, trailingRoute.slice(0, -1), `${trailingRoute} must redirect to ${trailingRoute.slice(0, -1)}`);
        }

        const notFoundRoutes = [
            '/technologies/invalid-tech-slug',
            '/blog/invalid-blog-slug',
            '/games/invalid-game-slug',
            '/this-page-does-not-exist-404',
            '/api/index.js?__hangbug_route=/technologies/invalid-tech-slug',
            '/api/index.js?__hangbug_route=/blog/invalid-blog-slug',
            '/api/index.js?__hangbug_route=/games/invalid-game-slug',
            '/api/index.js?__hangbug_route=/unknown-url-check'
        ];
        for (const r of notFoundRoutes) {
            const res = await requestRoute(r);
            assert.strictEqual(res.status, 404, `${r} must return HTTP 404, got ${res.status}`);
            assert.strictEqual(res.headers.location, undefined, `${r} must NOT redirect`);
            assert.strictEqual(res.headers['x-robots-tag'], 'noindex, nofollow', `${r} must emit X-Robots-Tag: noindex, nofollow`);
            assert.ok(res.body.includes('noindex, nofollow'), `${r} HTML must declare noindex, nofollow`);
            assert.ok(!res.body.includes('<link rel="canonical" href="https://www.hangbug.com/"'), `${r} HTML must NOT contain homepage canonical`);
        }
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('30. Internal Linking & Orphan Prevention Audit: Zero broken/redirect public links & complete cross-linking', async () => {
    const landing = readFile('src/pages/Landing.jsx');
    const footer = readFile('src/components/Footer.jsx');
    const gamePlayer = readFile('src/pages/games/GamePlayer.jsx');
    const blogList = readFile('src/pages/blog/BlogList.jsx');
    const blogDetail = readFile('src/pages/blog/BlogDetail.jsx');
    const techDetail = readFile('src/pages/quiz/TechnologyDetail.jsx');
    const leaderboardPage = readFile('src/pages/leaderboard/Leaderboard.jsx');
    const seoConfig = readFile('src/config/seoPagesConfig.js');

    // 1. No public links to auth-gated/noindex /leaderboard/full
    assert.ok(!footer.includes('to="/leaderboard/full"'), 'Footer.jsx must NOT link to auth-gated noindex /leaderboard/full');
    assert.ok(!landing.includes('to="/leaderboard/full"'), 'Landing.jsx must NOT link to auth-gated noindex /leaderboard/full');
    assert.ok(!seoConfig.includes("to: '/leaderboard/full'"), 'seoPagesConfig.js must NOT link to /leaderboard/full');
    const seoController = require('../api/_controllers/seoController');
    assert.ok(
        !seoController.CORE_PUBLIC_ROUTES.some(r => r.loc === '/leaderboard/full'),
        'seoController.CORE_PUBLIC_ROUTES must NOT include auth-gated noindex /leaderboard/full'
    );

    // 2. Footer covers all 14 core DB games and 6 published blog articles cleanly
    const requiredFooterGames = [
        'code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble',
        'missing-code', 'logic-builder', 'sql-challenge', 'memory-match',
        'speed-typing', 'code-typing', 'sixty-second-challenge', 'error-free-typing',
        'syntax-typing', 'word-rain'
    ];
    for (const gameSlug of requiredFooterGames) {
        assert.ok(footer.includes(`to="/games/${gameSlug}"`), `Footer.jsx must link to /games/${gameSlug}`);
    }

    // 3. GamePlayer maps every technology safely without broken /technologies/:slug URLs
    assert.ok(!gamePlayer.includes('to={`/technologies/${selectedTechnology}`}'), 'GamePlayer.jsx must NOT emit unvalidated /technologies/${selectedTechnology} links');
    assert.ok(gamePlayer.includes('resolveGameTechnologyGuide'), 'GamePlayer.jsx must use resolveGameTechnologyGuide');

    // 4. Crawlable anchor elements used for primary page transitions
    assert.ok(!leaderboardPage.includes('onClick={() => navigate('), 'Leaderboard.jsx Back to Top 5 control must use Link instead of onClick navigate');

    // 5. TechnologyDetail and BlogList avoid duplicate navigation bloat
    assert.ok(techDetail.includes('resolveGameTechnologyGuide'), 'TechnologyDetail.jsx must connect each technology track with its related study guide');
    assert.ok(blogList.includes('featuredArticle.slug'), 'BlogList.jsx must prevent duplicating the featured article in the initial grid');
    assert.ok(blogDetail.includes('sanitizeBlogInternalPath'), 'BlogDetail.jsx must sanitize internal markdown links against unpublished slugs');

    // 6. Runtime BlogPostModel & blogSeoRenderer sanitize legacy DB links and supply fallback related articles
    const BlogPostModel = require('../api/_models/blogPostModel');
    const laravelData = await BlogPostModel.getBySlug('laravel-basics-mvc-architecture', { incrementView: false });
    assert.ok(laravelData && laravelData.article, 'Laravel article must resolve');
    assert.ok(!laravelData.article.content.includes('mysql-database-tutorial-beginners'), 'Laravel article must not expose broken 404 link to mysql-database-tutorial-beginners');

    const blogSeoRenderer = require('../api/_utils/blogSeoRenderer');
    const legacyContent = '- Pair with [MySQL Database Tutorial](https://www.hangbug.com/blog/mysql-database-tutorial-beginners).';
    const sanitizedHtml = blogSeoRenderer.renderMarkdownToHtml(legacyContent, new Set(['html-tutorial-for-beginners', 'laravel-basics-mvc-architecture']));
    assert.ok(!sanitizedHtml.includes('mysql-database-tutorial-beginners'), 'renderMarkdownToHtml must rewrite unpublished blog links');
    assert.ok(sanitizedHtml.includes('href="/technologies/mysql"'), 'renderMarkdownToHtml must remap mysql-database-tutorial-beginners to /technologies/mysql');

    const distHome = readFile('dist/index.html');
    const distGames = readFile('dist/games/index.html');
    const distBlog = readFile('dist/blog/index.html');
    assert.ok(distHome.includes('prerender-seo-footer'), 'dist/index.html must include shared static footer links');
    assert.ok(distGames.includes('href="/games/code-scramble"') && distGames.includes('href="/games/word-rain"'), 'dist/games/index.html must link all published games');
    assert.ok(!distBlog.includes('href="/blog?category='), 'dist/blog/index.html must not emit duplicate query-string category URLs');
    const htmlCardMatches = distBlog.match(/href="\/blog\/html-tutorial-for-beginners"/g) || [];
    assert.ok(htmlCardMatches.length <= 2, `dist/blog/index.html must minimize duplicate links to /blog/html-tutorial-for-beginners (found ${htmlCardMatches.length})`);
});

test('31. Structured Data Coverage: Public pages pass schemaType/breadcrumbs/article/itemList to usePageSeo() and SSR injects #hangbug-jsonld', async () => {
    const publicSchemaPages = [
        { file: 'src/pages/Landing.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'includeApplicationSchema:'] },
        { file: 'src/pages/quiz/Technologies.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'itemList:'] },
        { file: 'src/pages/quiz/TechnologyDetail.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:'] },
        { file: 'src/pages/games/GamesHub.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'includeApplicationSchema:', 'itemList:'] },
        { file: 'src/pages/games/GamePlayer.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'softwareApplication:'] },
        { file: 'src/pages/blog/BlogList.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'itemList:'] },
        { file: 'src/pages/blog/BlogDetail.jsx', checks: ["schemaType: 'Article'", 'article:', 'breadcrumbs:'] },
        { file: 'src/pages/leaderboard/Leaderboard.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:', 'disableStructuredData:'] },
        { file: 'src/pages/legal/AboutUs.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:'] },
        { file: 'src/pages/legal/ContactUs.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:'] },
        { file: 'src/pages/legal/PrivacyPolicy.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:'] },
        { file: 'src/pages/legal/TermsOfService.jsx', checks: ["schemaType: 'WebPage'", 'breadcrumbs:'] }
    ];

    for (const page of publicSchemaPages) {
        const content = readFile(page.file);
        for (const snippet of page.checks) {
            assert.ok(content.includes(snippet), `${page.file} must pass ${snippet} to usePageSeo()`);
        }
    }

    for (const noindexFile of ['src/pages/auth/Auth.jsx', 'src/pages/certificates/CertificateView.jsx', 'src/pages/legal/DeleteAccount.jsx']) {
        const content = readFile(noindexFile);
        assert.ok(content.includes('disableStructuredData: true'), `${noindexFile} must pass disableStructuredData: true`);
    }

    const { validateStructuredData } = await import(
        require('node:url').pathToFileURL(path.join(ROOT_DIR, 'src', 'utils', 'structuredData.js')).href
    );
    const seoController = require('../api/_controllers/seoController');

    const indexableSsrRoutes = [
        '/',
        '/technologies',
        '/technologies/javascript',
        '/games',
        '/games/code-puzzle',
        '/leaderboard',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
        '/blog',
        '/blog/html-tutorial-for-beginners'
    ];

    for (const routePath of indexableSsrRoutes) {
        const resolution = await seoController.resolveAppRoute(routePath);
        assert.strictEqual(resolution.statusCode, 200, `${routePath} must resolve with 200`);
        assert.strictEqual(resolution.noindex, false, `${routePath} must be indexable`);
        const html = seoController.renderStatusHtml(resolution);
        const match = html.match(/<script id="hangbug-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/i);
        assert.ok(match && match[1], `${routePath} SSR HTML must inject #hangbug-jsonld`);
        const parsed = JSON.parse(match[1]);
        const validation = validateStructuredData(parsed);
        assert.strictEqual(validation.valid, true, `${routePath} SSR JSON-LD invalid: ${validation.errors.join('; ')}`);
    }

    const noindexResolution = await seoController.resolveAppRoute('/login');
    const noindexHtml = seoController.renderStatusHtml(noindexResolution);
    assert.ok(!/<script id="hangbug-jsonld"/i.test(noindexHtml), '/login noindex SSR HTML must omit #hangbug-jsonld');
});

test('29. CTR Title Messaging: core and technology titles highlight interactive quizzes, free practice, and certificates', async () => {
    const { SEO_PAGES_CONFIG, TECHNOLOGY_SEO_SLUGS } = await import(
        require('node:url').pathToFileURL(path.join(ROOT_DIR, 'src', 'config', 'seoPagesConfig.js')).href
    );
    const { buildTechnologyQuizFallbackTitle } = require('../api/_utils/publicPageSeoRenderer');

    const assertCtrMessaging = (label, title) => {
        assert.ok(title.length >= 45 && title.length <= 60, `${label} title length ${title.length} outside 45–60: ${title}`);
        assert.ok(/\bfree\b/i.test(title), `${label} title must mention Free: ${title}`);
        assert.ok(/\bquiz(zes)?\b/i.test(title), `${label} title must mention Quiz/Quizzes: ${title}`);
        assert.ok(/\bcertificates?\b/i.test(title), `${label} title must mention Certificate(s): ${title}`);
        assert.ok(/\binteractive\b/i.test(title), `${label} title must mention Interactive: ${title}`);
    };

    assertCtrMessaging('home', SEO_PAGES_CONFIG.home.title);
    assert.ok(/\bpractice\b/i.test(SEO_PAGES_CONFIG.home.title), 'home title must mention Practice');
    assertCtrMessaging('technologies', SEO_PAGES_CONFIG.technologies.title);
    assert.ok(/\bpractice\b/i.test(SEO_PAGES_CONFIG.technologies.title), 'technologies title must mention Practice');
    assertCtrMessaging('about', SEO_PAGES_CONFIG.about.title);

    for (const slug of TECHNOLOGY_SEO_SLUGS) {
        assertCtrMessaging(`technology ${slug}`, SEO_PAGES_CONFIG[slug].title);
    }

    for (const name of ['C#', 'Node.js', 'SQL Server', 'Material UI', 'Programming Logic']) {
        const fallback = buildTechnologyQuizFallbackTitle(name);
        assert.ok(fallback.length <= 60, `Fallback title for ${name} must be <= 60 chars: ${fallback}`);
        assert.ok(/free/i.test(fallback) && /quiz/i.test(fallback) && /certificate/i.test(fallback), `Fallback title for ${name} must highlight free quiz + certificate: ${fallback}`);
    }
});
