const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('1. Web SEO Redesign: Removes all Semrush copy/branding and enforces Hangbug green palette', () => {
    const seoDir = path.join(ROOT, 'src', 'components', 'seo');
    const componentFiles = fs.readdirSync(seoDir).map(f => path.join('src', 'components', 'seo', f));
    const allWebSeoFiles = ['src/pages/seo/SeoDashboard.jsx', ...componentFiles];

    for (const rel of allWebSeoFiles) {
        const content = read(rel);
        assert.ok(!/semrush/i.test(content), `${rel} must NOT contain Semrush branding or references`);
        assert.ok(!/#4F5BD5/i.test(content), `${rel} must NOT use Semrush indigo color #4F5BD5`);
    }

    const combined = allWebSeoFiles.map(read).join('\n');
    for (const hex of ['#193D35', '#2F806B', '#E5F2EC', '#F7F8F6', '#17221F', '#75817C', '#E4EAE6']) {
        assert.ok(combined.toUpperCase().includes(hex), `Redesigned SEO dashboard must use Hangbug color ${hex}`);
    }

    const seoDash = read('src/pages/seo/SeoDashboard.jsx');
    assert.ok(seoDash.includes('noindex: true'), 'SeoDashboard must remain noindex: true');

    const seoHeader = read('src/components/seo/SeoHeader.jsx');
    assert.ok(seoHeader.includes('<ThemeToggle'), 'SeoHeader must include ThemeToggle');
    assert.ok(!seoHeader.includes('variant="dropdown"'), 'SeoHeader must not use dropdown ThemeToggle');
});

test('2. Cross-Platform Navigation: All 12 Hangbug SEO sections exist on both Web and Mobile', () => {
    const requiredLabels = [
        'Overview',
        'Search Performance',
        'Keyword Research',
        'Website Audit',
        'Page Indexing',
        'Content Analysis',
        'Technical SEO',
        'Backlinks',
        'AI Visibility',
        'Competitors',
        'SEO Recommendations',
        'Settings'
    ];

    const webUtils = read('src/components/seo/seoUtils.js');
    const mobileTokens = read('mobile/lib/screens/admin/seo/widgets/seo_theme_tokens.dart');

    for (const label of requiredLabels) {
        assert.ok(webUtils.includes(label), `Web SEO navigation missing "${label}"`);
        assert.ok(mobileTokens.includes(label), `Mobile SEO navigation missing "${label}"`);
    }
});

test('3. Plain-English 6-Part Reports & Status Labels exist in Web and Mobile UI', () => {
    const webModal = read('src/components/seo/SeoIssueDetailModal.jsx');
    const mobileSheet = read('mobile/lib/screens/admin/seo/widgets/seo_issue_detail_sheet.dart');

    for (const doc of [webModal, mobileSheet]) {
        assert.ok(doc.includes('What is the issue?'), 'Must show "What is the issue?"');
        assert.ok(doc.includes('Why does it matter?'), 'Must show "Why does it matter?"');
        assert.ok(doc.includes('Affected Pages'), 'Must show Affected Pages');
        assert.ok(doc.includes('How serious is it?'), 'Must show "How serious is it?"');
        assert.ok(doc.includes('What should be done?'), 'Must show "What should be done?"');
        assert.ok(doc.includes('How can it be fixed?'), 'Must show "How can it be fixed?"');
    }
});

test('4. Backend SEO Integration Service: Date ranges, secret sanitization, and honest unconfigured states', () => {
    const integration = require('../api/_services/seoIntegrationService');

    const r7 = integration.resolveDateRange('7d');
    assert.strictEqual(r7.days, 7);
    assert.ok(r7.startDate < r7.endDate);
    assert.ok(r7.prevEndDate < r7.startDate);

    const rCustom = integration.resolveDateRange('custom', '2026-10-01', '2026-10-15');
    assert.strictEqual(rCustom.range, 'custom');
    assert.strictEqual(rCustom.days, 15);
    assert.strictEqual(rCustom.startDate, '2026-10-01');
    assert.strictEqual(rCustom.endDate, '2026-10-15');

    const sanitized = integration.sanitizeConfigForClient({
        domain: 'www.hangbug.com',
        googleServiceAccountEmail: 'seo-bot@my-project.iam.gserviceaccount.com',
        googlePrivateKey: '-----BEGIN PRIVATE KEY-----\nSECRET_KEY_VALUE',
        pagespeedApiKey: 'AIzaSecretPageSpeedKey'
    });
    assert.strictEqual(sanitized.googlePrivateKey, undefined, 'Private key must never be returned to client');
    assert.strictEqual(sanitized.pagespeedApiKey, undefined, 'API key must never be returned to client');
    assert.strictEqual(sanitized.hasGoogleServiceAccount, true);
    assert.strictEqual(sanitized.hasPagespeedApiKey, true);
    assert.ok(!JSON.stringify(sanitized).includes('SECRET_KEY_VALUE'));
    assert.ok(!JSON.stringify(sanitized).includes('AIzaSecretPageSpeedKey'));
});

test('5. Backend SEO Audit Engine & Routes: Runs deterministic audit without fake Google metrics', async () => {
    const auditService = require('../api/_services/seoAuditService');
    const seoController = require('../api/_controllers/seoController');

    assert.strictEqual(seoController.isKnownAppRoute('/dashboard/seo/technical'), true);
    assert.strictEqual(seoController.isNoindexAppRoute('/dashboard/seo/technical'), true);
    assert.ok(seoController.NOINDEX_EXACT_ROUTES instanceof Set, 'NOINDEX_EXACT_ROUTES must be exported');
    assert.ok(seoController.NOINDEX_EXACT_ROUTES.has('/leaderboard/full'), 'NOINDEX_EXACT_ROUTES must include /leaderboard/full');
    assert.ok(seoController.NOINDEX_EXACT_ROUTES.has('/certificate/view'), 'NOINDEX_EXACT_ROUTES must include /certificate/view');

    const corePaths = seoController.CORE_PUBLIC_ROUTES.map(r => r.loc);
    assert.ok(!corePaths.includes('/leaderboard/full'), 'CORE_PUBLIC_ROUTES must exclude auth-gated noindex /leaderboard/full');
    for (const p of corePaths) {
        assert.strictEqual(seoController.isNoindexAppRoute(p), false, `CORE_PUBLIC_ROUTES entry ${p} must not be noindex`);
    }

    const sitemapXml = seoController.buildSitemapXml();
    for (const noindexPath of seoController.NOINDEX_EXACT_ROUTES) {
        assert.ok(
            !sitemapXml.includes(`<loc>https://www.hangbug.com${noindexPath}</loc>`),
            `buildSitemapXml() must exclude noindex route ${noindexPath}`
        );
    }

    const run = await auditService.runFullSeoAudit({
        domain: 'www.hangbug.com',
        useLiveHttp: false
    });

    assert.ok(run.pagesScanned >= 15, `Expected >= 15 Hangbug pages scanned, got ${run.pagesScanned}`);
    assert.ok(run.overallScore >= 0 && run.overallScore <= 100, 'Overall SEO score must be 0–100');
    assert.strictEqual(run.scoreBreakdown.categories.length, 5, 'Health score must include all 5 categories');

    const catLabels = run.scoreBreakdown.categories.map(c => c.label);
    for (const expected of ['Technical SEO', 'On-page SEO', 'Content Quality', 'Indexing Health', 'Internal Linking']) {
        assert.ok(catLabels.includes(expected), `Missing health score category: ${expected}`);
    }

    assert.ok(Array.isArray(run.issues) && run.issues.length > 0, 'Audit must produce structured issues');
    const accidentalNoindexIssue = run.issues.find(i => i.id === 'accidental_noindex');
    assert.strictEqual(
        accidentalNoindexIssue,
        undefined,
        `Public audit must not raise accidental_noindex; got: ${JSON.stringify(accidentalNoindexIssue?.affectedUrls || [])}`
    );
    const titleTagIssue = run.issues.find(i => i.id === 'title_tag_issues');
    assert.strictEqual(
        titleTagIssue,
        undefined,
        `Public audit must not raise title_tag_issues; got: ${JSON.stringify(titleTagIssue?.affectedUrls || [])}`
    );
    assert.strictEqual(
        run.content.duplicateOrMissingTitles.length,
        0,
        `Expected zero duplicate/missing/suboptimal title issues, got: ${JSON.stringify(run.content.duplicateOrMissingTitles)}`
    );
    for (const issue of run.issues) {
        assert.ok(issue.whatIsIssue && issue.whyItMatters && issue.recommendedAction && issue.howToFix);
        assert.ok(['Critical', 'Needs attention', 'Good', 'Not checked'].includes(issue.status));
    }
});

test('6. Backend Competitor Validator blocks localhost/private domains', () => {
    const { isValidPublicDomain } = require('../api/_services/seoCompetitorService');
    assert.strictEqual(isValidPublicDomain('w3schools.com'), true);
    assert.strictEqual(isValidPublicDomain('https://codecademy.com/learn'), true);
    assert.strictEqual(isValidPublicDomain('localhost'), false);
    assert.strictEqual(isValidPublicDomain('127.0.0.1'), false);
    assert.strictEqual(isValidPublicDomain('192.168.1.1'), false);
});

test('7. Backend SEO Audit normalizes category counts and emits distinct labels/URLs for empty technology tracks', async () => {
    const auditService = require('../api/_services/seoAuditService');

    const enriched = auditService.enrichCategoriesWithQuestionCounts(
        [
            { id: '1', name: 'Agile and DevOps', isEnabled: true },
            { id: '2', name: 'C#', isEnabled: true },
            { id: '3', name: 'Material-UI', isEnabled: true },
            { id: '4', name: 'Mongo DB', isEnabled: true },
            { id: '5', name: 'React.js', isEnabled: true },
            { id: '6', name: 'React', isEnabled: true },
            { id: '7', name: 'CSS', isEnabled: true },
            { id: '8', name: 'Angular', isEnabled: true }
        ],
        [
            { category: 'Material UI', _count: { _all: 150 } },
            { category: 'MongoDB', _count: { _all: 350 } },
            { category: 'ReactJS', _count: { _all: 399 } }
        ]
    );

    const byName = new Map(enriched.map(c => [c.name, c.questionCount]));
    assert.strictEqual(byName.get('Agile and DevOps'), 0, 'Agile count must come from database question records');
    assert.strictEqual(byName.get('C#'), 0, 'C# in-memory questions must not be reported as database records');
    assert.strictEqual(byName.get('Material-UI'), 150);
    assert.strictEqual(byName.get('Mongo DB'), 350);
    assert.strictEqual(byName.get('React.js'), 399);
    assert.strictEqual(byName.get('React'), 399, 'React alias must resolve to the populated React.js track');
    assert.strictEqual(byName.get('CSS'), 0);
    assert.strictEqual(byName.get('Angular'), 0);

    const emptyCats = enriched.filter(c => c.isEnabled && c.questionCount === 0);
    const issue = auditService.buildEmptyTechCategoriesIssue(emptyCats, enriched);
    assert.strictEqual(issue.affectedCount, 4);
    assert.deepStrictEqual(
        issue.affectedUrls.map(u => u.label),
        [
            'Agile and DevOps (/technologies)',
            'C# (/technologies)',
            'CSS (/technologies/css)',
            'Angular (/technologies/angular)'
        ]
    );
    assert.deepStrictEqual(
        issue.affectedUrls.map(u => u.url),
        ['/technologies', '/technologies', '/technologies/css', '/technologies/angular']
    );

    // Legacy stored audit issues lacking `label` are hydrated cleanly
    const hydrated = auditService.hydrateAuditIssues([
        {
            id: 'empty_tech_categories_opportunity',
            affectedUrls: [
                { url: '/technologies', detail: 'Category "CSS" has 0 questions' },
                { url: '/technologies', detail: 'Category "Angular" has 0 questions' }
            ]
        }
    ]);
    assert.strictEqual(hydrated[0].affectedUrls[0].url, '/technologies/css');
    assert.strictEqual(hydrated[0].affectedUrls[0].label, 'CSS (/technologies/css)');
    assert.strictEqual(hydrated[0].affectedUrls[1].url, '/technologies');
    assert.strictEqual(hydrated[0].affectedUrls[1].label, 'Angular (/technologies)');

    // Recommendations propagate distinct labels instead of repeating /technologies
    const recs = await auditService.buildPrioritizedRecommendations('www.hangbug.com', { issues: [issue] });
    const rec = recs.items.find(r => r.recKey === 'audit_empty_tech_categories_opportunity');
    assert.ok(rec);
    assert.deepStrictEqual(rec.affectedPages, [
        'React (/technologies/react)',
        'CSS (/technologies/css)',
        'Angular (/technologies)'
    ]);

    // Web UI components must render formatAffectedUrlLabel
    const webAudit = read('src/components/seo/SeoAuditSection.jsx');
    const webModal = read('src/components/seo/SeoIssueDetailModal.jsx');
    const webUtils = read('src/components/seo/seoUtils.js');
    assert.ok(webUtils.includes('formatAffectedUrlLabel'));
    assert.ok(webAudit.includes('formatAffectedUrlLabel'));
    assert.ok(webModal.includes('formatAffectedUrlLabel'));
});

test('7. All public routes, tech tracks, games, and seeded articles have distinct 45–60 character titles', async () => {
    const seoConfigMod = await import(
        require('node:url').pathToFileURL(
            require('node:path').join(__dirname, '..', 'src', 'config', 'seoPagesConfig.js')
        ).href
    );
    const { SEO_PAGES_CONFIG, formatGameSeoTitle, formatBlogSeoTitle } = seoConfigMod;
    const { INITIAL_BLOG_ARTICLES } = require('../api/_models/blogArticles/initialBlogArticles');
    const { INITIAL_GAMES } = require('../api/_models/gameModel');
    const { buildArticleSeoTitle } = require('../api/_utils/blogSeoRenderer');

    assert.strictEqual(
        buildArticleSeoTitle({
            title: 'HTML Tutorial for Beginners: Learn HTML5 Step by Step',
            seoTitle: 'HTML Tutorial for Beginners: Learn HTML5 Step by | Hangbug'
        }),
        'HTML Tutorial for Beginners: Learn HTML5 | Hangbug',
        'Long article titles must end on a complete phrase rather than a dangling word'
    );
    assert.strictEqual(
        formatBlogSeoTitle(
            'HTML Tutorial for Beginners: Learn HTML5 Step by | Hangbug',
            'HTML Tutorial for Beginners: Learn HTML5 Step by Step'
        ),
        'HTML Tutorial for Beginners: Learn HTML5 | Hangbug',
        'Client-side blog titles must match the cleaned server-side title'
    );

    const seenTitles = new Set();

    for (const [key, entry] of Object.entries(SEO_PAGES_CONFIG)) {
        assert.ok(entry && entry.title, `Missing title for SEO_PAGES_CONFIG.${key}`);
        assert.ok(
            entry.title.length >= 45 && entry.title.length <= 60,
            `SEO_PAGES_CONFIG.${key} title length ${entry.title.length} outside 45–60: ${entry.title}`
        );
        assert.notStrictEqual(
            entry.title.toLowerCase(),
            String(entry.h1 || '').toLowerCase(),
            `SEO_PAGES_CONFIG.${key} title must differ from H1`
        );
        const lower = entry.title.toLowerCase();
        assert.ok(!seenTitles.has(lower), `Duplicate title in SEO_PAGES_CONFIG.${key}: ${entry.title}`);
        seenTitles.add(lower);
    }

    for (const game of INITIAL_GAMES) {
        const title = formatGameSeoTitle(game.title, game.category);
        assert.ok(
            title.length >= 45 && title.length <= 60,
            `Game ${game.slug} title length ${title.length} outside 45–60: ${title}`
        );
        const lower = title.toLowerCase();
        assert.ok(!seenTitles.has(lower), `Duplicate game title for ${game.slug}: ${title}`);
        seenTitles.add(lower);
    }

    for (const article of INITIAL_BLOG_ARTICLES) {
        const title = buildArticleSeoTitle(article);
        assert.strictEqual(title, formatBlogSeoTitle(article.seoTitle, article.title));
        assert.ok(
            title.length >= 45 && title.length <= 60,
            `Article ${article.slug} title length ${title.length} outside 45–60: ${title}`
        );
        const lower = title.toLowerCase();
        assert.ok(!seenTitles.has(lower), `Duplicate article title for ${article.slug}: ${title}`);
        seenTitles.add(lower);
    }
});

test('8. Structured Data SSR, Audit Validation & Web/Mobile JSON-LD Visibility Parity', async () => {
    const auditService = require('../api/_services/seoAuditService');
    const seoController = require('../api/_controllers/seoController');

    // Audit parser rejects empty or missing-@context JSON-LD
    const emptyJsonLd = auditService.extractHtmlSeoSignals(
        '<html><head><title>Sample Hangbug Page Title For Test</title><script type="application/ld+json">{}</script></head><body><h1>Heading</h1></body></html>',
        '/sample'
    );
    assert.strictEqual(emptyJsonLd.hasJsonLd, true);
    assert.strictEqual(emptyJsonLd.jsonLdValid, false, 'Empty JSON-LD object must be flagged invalid');

    // SSR injects #hangbug-jsonld for public routes and passes structured_data audit cleanly
    for (const p of ['/', '/technologies', '/technologies/javascript', '/games', '/games/code-puzzle', '/blog', '/about', '/contact']) {
        const res = await seoController.resolveAppRoute(p);
        const html = seoController.renderStatusHtml(res);
        assert.ok(
            /<script id="hangbug-jsonld" type="application\/ld\+json">[\s\S]*?"@context"\s*:\s*"https:\/\/schema\.org"[\s\S]*?<\/script>/i.test(html),
            `SSR output for ${p} must inject #hangbug-jsonld`
        );
    }

    const run = await auditService.runFullSeoAudit({
        domain: 'www.hangbug.com',
        useLiveHttp: false
    });
    const structuredDataGap = run.issues.find(i => i.id === 'structured_data_gaps');
    assert.strictEqual(
        structuredDataGap,
        undefined,
        `Public audit must have zero structured_data_gaps; got: ${JSON.stringify(structuredDataGap?.affectedUrls || [])}`
    );
    assert.strictEqual(run.technical.structuredData.status, 'Good');

    // Web & Mobile UI parity for JSON-LD inspection and schema list
    const webIndexing = read('src/components/seo/SeoIndexingSection.jsx');
    const mobilePrimary = read('mobile/lib/screens/admin/seo/widgets/seo_sections_primary.dart');
    const mobileSecondary = read('mobile/lib/screens/admin/seo/widgets/seo_sections_secondary.dart');

    assert.ok(webIndexing.includes('#hangbug-jsonld') && webIndexing.includes('jsonLdTypes'), 'Web SeoIndexingSection must display #hangbug-jsonld status');
    assert.ok(mobilePrimary.includes('JSON-LD:') && mobilePrimary.includes('jsonLdTypes'), 'Mobile SeoIndexingTab must display JSON-LD status');
    assert.ok(mobileSecondary.includes("map['schemasDetected']") && mobileSecondary.includes("map['affectedUrls']"), 'Mobile SeoTechnicalTab must display schemasDetected and affectedUrls');
});
