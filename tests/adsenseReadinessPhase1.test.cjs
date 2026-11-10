const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

test('1. robots.txt verification: exists in public and dist with valid directives', () => {
    const publicRobots = fs.readFileSync(path.join(ROOT_DIR, 'public', 'robots.txt'), 'utf8');
    const distRobots = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'robots.txt'), 'utf8');

    assert.ok(publicRobots.includes('User-agent: *'), 'public/robots.txt must declare User-agent');
    assert.ok(publicRobots.includes('Allow: /'), 'public/robots.txt must allow root');
    assert.ok(publicRobots.includes('Sitemap: https://www.hangbug.com/sitemap.xml'), 'public/robots.txt must link to sitemap');

    assert.strictEqual(publicRobots, distRobots, 'dist/robots.txt must match public/robots.txt');
});

test('2. sitemap.xml verification: valid XML, includes public pages, excludes auth/utility URLs', () => {
    const publicSitemap = fs.readFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), 'utf8');
    const distSitemap = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'sitemap.xml'), 'utf8');

    assert.ok(publicSitemap.startsWith('<?xml'), 'sitemap must start with XML declaration');
    assert.ok(publicSitemap.includes('<urlset'), 'sitemap must contain urlset root tag');

    // Must include core public pages
    const requiredPages = [
        'https://www.hangbug.com/',
        'https://www.hangbug.com/technologies',
        'https://www.hangbug.com/games',
        'https://www.hangbug.com/leaderboard',
        'https://www.hangbug.com/about',
        'https://www.hangbug.com/contact',
        'https://www.hangbug.com/privacy-policy',
        'https://www.hangbug.com/terms',
        'https://www.hangbug.com/games/code-puzzle',
        'https://www.hangbug.com/games/find-the-bug'
    ];

    for (const url of requiredPages) {
        assert.ok(publicSitemap.includes(`<loc>${url}</loc>`), `sitemap must include ${url}`);
    }

    // Must NOT include authentication or account utility pages
    const prohibitedPages = [
        'https://www.hangbug.com/login',
        'https://www.hangbug.com/signup',
        'https://www.hangbug.com/register',
        'https://www.hangbug.com/forgot-password',
        'https://www.hangbug.com/reset-password',
        'https://www.hangbug.com/delete-account',
        'https://www.hangbug.com/account-deletion'
    ];

    for (const badUrl of prohibitedPages) {
        assert.ok(!publicSitemap.includes(`<loc>${badUrl}</loc>`), `sitemap must NOT include auth/utility url: ${badUrl}`);
    }

    assert.strictEqual(publicSitemap, distSitemap, 'dist/sitemap.xml must match public/sitemap.xml');
});

test('3. vercel.json verification: headers and rewrites protect static files', () => {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));

    const robotsHeader = vercelConfig.headers.find(h => h.source === '/robots.txt');
    assert.ok(robotsHeader, 'vercel.json must have headers for /robots.txt');
    const robotsContentType = robotsHeader.headers.find(h => h.key === 'Content-Type');
    assert.ok(robotsContentType.value.includes('text/plain'), '/robots.txt must be text/plain');

    const sitemapHeader = vercelConfig.headers.find(h => h.source === '/sitemap.xml');
    assert.ok(sitemapHeader, 'vercel.json must have headers for /sitemap.xml');
    const sitemapContentType = sitemapHeader.headers.find(h => h.key === 'Content-Type');
    assert.ok(sitemapContentType.value.includes('application/xml'), '/sitemap.xml must be application/xml');

    // Rewrite check: must not blindly rewrite /(.*) to index.html without preserving robots/sitemap/static
    const spaRewrite = vercelConfig.rewrites.find(r => r.destination === '/index.html');
    assert.ok(spaRewrite, 'must have an SPA rewrite to index.html');
    assert.notStrictEqual(spaRewrite.source, '/(.*)', 'SPA rewrite must not be unconstrained /(.*) that overrides static files');
});

test('4. Canonical tag verification: removed from index.html head', () => {
    const srcIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const distIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'index.html'), 'utf8');

    assert.ok(!srcIndexHtml.includes('<link rel="canonical"'), 'index.html must not contain hardcoded canonical');
    assert.ok(!distIndexHtml.includes('<link rel="canonical"'), 'dist/index.html must not contain hardcoded canonical');
});

test('5. usePageSeo hook verification: exists and handles title, meta description, and canonical', () => {
    const hookCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'hooks', 'usePageSeo.js'), 'utf8');

    assert.ok(hookCode.includes('document.title = title'), 'hook must update document.title');
    assert.ok(hookCode.includes("meta[name=\"description\"]"), 'hook must update meta description');
    assert.ok(hookCode.includes("link[rel=\"canonical\"]"), 'hook must manage canonical tag');
    assert.ok(hookCode.includes("https://www.hangbug.com"), 'hook must use canonical base domain');
});

test('6. Route-specific SEO metadata applied across all specified public pages', () => {
    const pages = [
        { file: 'src/pages/Landing.jsx', title: 'Hangbug – Learn Programming, Practice Tech Quizzes & Earn Certificates' },
        { file: 'src/pages/legal/AboutUs.jsx', title: 'About Hangbug – Technology Learning, Tech Quizzes & Skill Assessment Platform' },
        { file: 'src/pages/legal/ContactUs.jsx', title: 'Contact Support & Inquiries — Hangbug' },
        { file: 'src/pages/legal/PrivacyPolicy.jsx', title: 'Privacy Policy — Hangbug Data Protection & Cookie Policy' },
        { file: 'src/pages/legal/TermsOfService.jsx', title: 'Terms of Service — Hangbug Platform Terms & Conditions' },
        { file: 'src/pages/quiz/Technologies.jsx', title: 'Choose Your Tech Stack — Programming & Framework Quizzes | Hangbug' },
        { file: 'src/pages/games/GamesHub.jsx', title: 'Coding & Typing Games for Developers — Hangbug Games Hub' },
        { file: 'src/pages/leaderboard/Leaderboard.jsx', title: 'Global Developer Leaderboard & Rankings — Hangbug' }
    ];

    for (const page of pages) {
        const content = fs.readFileSync(path.join(ROOT_DIR, page.file), 'utf8');
        assert.ok(content.includes('usePageSeo'), `${page.file} must import and use usePageSeo`);
        assert.ok(content.includes(page.title), `${page.file} must specify unique title: ${page.title}`);
    }
});

test('7. 404 Page verification: NotFound component exists and is routed in App.jsx', () => {
    const notFoundCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'NotFound.jsx'), 'utf8');
    assert.ok(notFoundCode.includes('404'), 'NotFound must display 404');
    assert.ok(notFoundCode.includes('Return to Home'), 'NotFound must include return to home button');

    const appCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.jsx'), 'utf8');
    assert.ok(appCode.includes('import NotFound from "./pages/NotFound"'), 'App.jsx must import NotFound');
    assert.ok(appCode.includes('<Route path="*" element={<NotFound />} />'), 'App.jsx must route * to <NotFound />');
    assert.ok(!appCode.includes('<Route path="*" element={<Navigate to="/" replace />} />'), 'App.jsx must not redirect * to /');
});

test('8. Empty category filtering verification: Technologies and Landing filter out 0-question tracks', () => {
    const techCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'quiz/Technologies.jsx'), 'utf8');
    assert.ok(
        techCode.includes('Number(c.questionCount || 0) > 0') || techCode.includes('c.questionCount > 0'),
        'Technologies.jsx must filter out categories where questionCount <= 0'
    );

    const landingCode = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'Landing.jsx'), 'utf8');
    assert.ok(
        landingCode.includes('Number(t.questionCount || 0) > 0') || landingCode.includes('t.questionCount > 0'),
        'Landing.jsx must filter out categories with 0 questions'
    );

    const categoryControllerCode = fs.readFileSync(path.join(ROOT_DIR, 'api', '_controllers', 'categoryController.js'), 'utf8');
    assert.ok(categoryControllerCode.includes('hasQuestionsOnly'), 'categoryController must support filtering categories by active questions');
});

test('9. AdSense publisher ID verification: meta tag, script tag, ads.txt, and app-ads.txt use ca-pub-2412757543318629', () => {
    const srcIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    const distIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'index.html'), 'utf8');
    const publicAdsTxt = fs.readFileSync(path.join(ROOT_DIR, 'public', 'ads.txt'), 'utf8');
    const distAdsTxt = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'ads.txt'), 'utf8');
    const publicAppAdsTxt = fs.readFileSync(path.join(ROOT_DIR, 'public', 'app-ads.txt'), 'utf8');
    const distAppAdsTxt = fs.readFileSync(path.join(ROOT_DIR, 'dist', 'app-ads.txt'), 'utf8');

    const expectedMeta = '<meta name="google-adsense-account" content="ca-pub-2412757543318629">';
    const expectedScript = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2412757543318629';
    const expectedAdsTxt = 'google.com, pub-2412757543318629, DIRECT, f08c47fec0942fa0';

    assert.ok(srcIndexHtml.includes(expectedMeta), 'index.html must contain the AdSense meta tag for ca-pub-2412757543318629');
    assert.ok(srcIndexHtml.includes(expectedScript), 'index.html must load adsbygoogle.js with client=ca-pub-2412757543318629');
    assert.ok(!srcIndexHtml.includes('6869652365081842'), 'index.html must not contain old publisher ID');

    assert.ok(distIndexHtml.includes(expectedMeta), 'dist/index.html must contain the AdSense meta tag for ca-pub-2412757543318629');
    assert.ok(distIndexHtml.includes(expectedScript), 'dist/index.html must load adsbygoogle.js with client=ca-pub-2412757543318629');

    assert.ok(publicAdsTxt.includes(expectedAdsTxt), 'public/ads.txt must authorize pub-2412757543318629');
    assert.strictEqual(publicAdsTxt.trim(), expectedAdsTxt, 'public/ads.txt must contain only the single official publisher declaration');
    assert.strictEqual(publicAdsTxt.trim(), distAdsTxt.trim(), 'dist/ads.txt must match public/ads.txt');

    assert.ok(publicAppAdsTxt.includes(expectedAdsTxt), 'public/app-ads.txt must authorize pub-2412757543318629');
    assert.strictEqual(publicAppAdsTxt.trim(), distAppAdsTxt.trim(), 'dist/app-ads.txt must match public/app-ads.txt');

    // Verify vercel.json headers and rewrites for /ads.txt
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'vercel.json'), 'utf8'));
    const adsTxtHeader = vercelConfig.headers.find(h => h.source === '/ads.txt');
    assert.ok(adsTxtHeader, 'vercel.json must configure explicit headers for /ads.txt');
    const adsContentType = adsTxtHeader.headers.find(h => h.key === 'Content-Type');
    assert.ok(adsContentType && adsContentType.value.includes('text/plain'), '/ads.txt header must specify text/plain');

    const spaRewrite = vercelConfig.rewrites.find(r => r.destination === '/index.html');
    assert.ok(spaRewrite.source.includes('ads\\.txt'), 'SPA rewrite must exclude ads.txt from being rewritten to /index.html');
});
