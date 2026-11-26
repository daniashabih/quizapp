const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveCoreFallbackMeta } = require('../api/_utils/publicPageSeoRenderer');
const { renderStatusHtml } = require('../api/_controllers/seoController');

const expectedDisclosure = {
    '/privacy-policy': [
        'Google Analytics 4',
        'Google AdSense',
        'Google Mobile Ads (AdMob)',
        'personalized',
        'Google Partner Sites policy',
        'support@hangbug.com'
    ],
    '/terms': [
        'Acceptable use',
        'certificate threshold',
        '80%',
        'Intellectual property',
        'limitation of liability'
    ],
    '/contact': [
        'Contact Hangbug Support',
        'support@hangbug.com'
    ]
};

for (const [pathname, disclosures] of Object.entries(expectedDisclosure)) {
    test(`${pathname} server-rendered public page includes its required disclosures`, () => {
        const meta = resolveCoreFallbackMeta(pathname);
        const html = renderStatusHtml({
            statusCode: 200,
            cleanPath: pathname,
            meta
        });

        for (const disclosure of disclosures) {
            assert.ok(html.toLowerCase().includes(disclosure.toLowerCase()), `Missing disclosure: ${disclosure}`);
        }
    });
}
