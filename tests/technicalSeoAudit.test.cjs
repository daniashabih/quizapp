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
    const publicPages = [
        { file: 'src/pages/Landing.jsx', title: 'Hangbug – Learn Programming, Practice Tech Quizzes & Earn Certificates' },
        { file: 'src/pages/quiz/Technologies.jsx', title: 'Choose Your Tech Stack — Programming & Framework Quizzes | Hangbug' },
        { file: 'src/pages/quiz/TechnologyDetail.jsx', title: 'Technology Quizzes & Coding Practice | Hangbug' },
        { file: 'src/pages/games/GamesHub.jsx', title: 'Coding & Typing Games for Developers — Hangbug Games Hub' },
        { file: 'src/pages/games/GamePlayer.jsx', title: 'Developer Typing Challenge' },
        { file: 'src/pages/leaderboard/Leaderboard.jsx', title: 'Global Developer Leaderboard & Rankings — Hangbug' },
        { file: 'src/pages/legal/AboutUs.jsx', title: 'About Hangbug – Technology Learning, Tech Quizzes & Skill Assessment Platform' },
        { file: 'src/pages/legal/ContactUs.jsx', title: 'Contact Support & Inquiries — Hangbug' },
        { file: 'src/pages/legal/PrivacyPolicy.jsx', title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy' },
        { file: 'src/pages/legal/TermsOfService.jsx', title: 'Terms of Service — Hangbug Platform Terms & Conditions' },
        { file: 'src/pages/certificates/CertificateView.jsx', title: 'Verify Developer Certificate — Hangbug Skill Verification' }
    ];

    for (const page of publicPages) {
        const content = readFile(page.file);
        assert.ok(content.includes('usePageSeo'), `${page.file} must invoke usePageSeo`);
        assert.ok(content.includes(page.title), `${page.file} must include expected title snippet: ${page.title}`);
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

test('4 & 5. Technical SEO: Dynamic sitemap.xml includes all public pages, technology tracks, and 18 games, excludes private/auth routes', () => {
    const sitemap = readFile('public/sitemap.xml');
    const distSitemap = readFile('dist/sitemap.xml');

    assert.ok(sitemap.startsWith('<?xml'), 'sitemap must be valid XML declaration');
    assert.ok(sitemap.includes('<urlset'), 'sitemap must have urlset root');

    // All core public pages
    const corePages = [
        'https://www.hangbug.com/',
        'https://www.hangbug.com/technologies',
        'https://www.hangbug.com/games',
        'https://www.hangbug.com/leaderboard',
        'https://www.hangbug.com/about',
        'https://www.hangbug.com/contact',
        'https://www.hangbug.com/privacy-policy',
        'https://www.hangbug.com/terms',
        'https://www.hangbug.com/technologies/html',
        'https://www.hangbug.com/technologies/css',
        'https://www.hangbug.com/technologies/javascript',
        'https://www.hangbug.com/technologies/php',
        'https://www.hangbug.com/technologies/laravel',
        'https://www.hangbug.com/technologies/mysql',
        'https://www.hangbug.com/technologies/flutter',
        'https://www.hangbug.com/technologies/dart'
    ];
    for (const url of corePages) {
        assert.ok(sitemap.includes(`<loc>${url}</loc>`), `sitemap must include core page: ${url}`);
    }

    // All 18 games
    const all18Games = [
        'code-puzzle', 'find-the-bug', 'output-predictor', 'code-scramble',
        'missing-code', 'logic-builder', 'sql-challenge', 'memory-match',
        'speed-typing', 'code-typing', 'sixty-second-challenge', 'error-free-typing',
        'syntax-typing', 'word-rain', 'csharp-oop-challenge', 'csharp-collections-challenge',
        'csharp-linq-challenge', 'csharp-exception-handling'
    ];
    for (const game of all18Games) {
        assert.ok(sitemap.includes(`<loc>https://www.hangbug.com/games/${game}</loc>`), `sitemap must include game: ${game}`);
    }

    // Excluded pages
    const excludedPages = [
        '/login', '/signup', '/register', '/forgot-password', '/reset-password',
        '/delete-account', '/account-deletion', '/data-deletion', '/dashboard',
        '/admin', '/quiz/start', '/quiz/result', '/privacy'
    ];
    for (const page of excludedPages) {
        assert.ok(!sitemap.includes(`<loc>https://www.hangbug.com${page}</loc>`), `sitemap must NOT include private/duplicate page: ${page}`);
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

    const officialTitle = 'Hangbug – Learn Programming, Practice Tech Quizzes & Earn Certificates';
    const officialDesc = 'Test your programming and web development skills with Hangbug. Practice interactive tech quizzes, play coding games, track your progress, and earn score-based certificates.';

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

test('19. Technical SEO: XML sitemap lastmod timestamps and complete public URL coverage', () => {
    const sitemap = readFile('public/sitemap.xml');
    assert.ok(sitemap.includes('<lastmod>'), 'sitemap.xml must declare <lastmod> timestamps');
    assert.ok(sitemap.includes('<loc>https://www.hangbug.com/certificate/view</loc>'), 'sitemap.xml must include /certificate/view');
    assert.ok(sitemap.includes('<loc>https://www.hangbug.com/games/complete-the-code</loc>'), 'sitemap.xml must include complete-the-code game');
    assert.ok(sitemap.includes('<loc>https://www.hangbug.com/games/csharp-quiz-challenge</loc>'), 'sitemap.xml must include csharp-quiz-challenge game');
});

test('20. Technical SEO: Vercel routing configuration, API protections, and alias 301 redirects', () => {
    const vercelConfig = JSON.parse(readFile('vercel.json'));
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
    assert.strictEqual(isKnownAppRoute('/about'), true, 'About page must be valid');
    assert.strictEqual(isKnownAppRoute('/contact'), true, 'Contact page must be valid');
    assert.strictEqual(isKnownAppRoute('/unknown-random-404-path'), false, 'Unknown path must not be a known route');
    assert.strictEqual(isKnownAppRoute('/technologies/fake-language'), false, 'Fake technology slug must not be a known route');
});
