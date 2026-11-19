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
