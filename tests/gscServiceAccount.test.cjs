const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { JWT } = require('google-auth-library');

const ROOT = path.resolve(__dirname, '..');
const prisma = require('../api/_config/prisma');
const seoIntegration = require('../api/_services/seoIntegrationService');
const app = require('../api/index');

const TEST_DOMAIN = 'sa-test.hangbug.com';
const FAKE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nTEST_PRIVATE_KEY_BODY_ONLY\\n-----END PRIVATE KEY-----\\n';

const origFetch = global.fetch;
const origJwtGetAccessToken = JWT.prototype.getAccessToken;
const origSeoProjectConfig = prisma.seoProjectConfig;
const origSeoIntegrationSnapshot = prisma.seoIntegrationSnapshot;

const mockDbConfigs = new Map();
const mockDbSnapshots = new Map();

function installMocks() {
    mockDbConfigs.clear();
    mockDbSnapshots.clear();

    prisma.seoProjectConfig = {
        findUnique: async ({ where }) => mockDbConfigs.get(where.domain) || null,
        upsert: async ({ where, create, update }) => {
            const existing = mockDbConfigs.get(where.domain);
            const record = existing
                ? { ...existing, ...update, updatedAt: new Date() }
                : { id: 'mock-sa-id', ...create, createdAt: new Date(), updatedAt: new Date() };
            mockDbConfigs.set(where.domain, record);
            return record;
        }
    };

    prisma.seoIntegrationSnapshot = {
        findUnique: async ({ where }) => {
            const k = `${where.domain_provider.domain}::${where.domain_provider.provider}`;
            return mockDbSnapshots.get(k) || null;
        },
        upsert: async ({ where, create, update }) => {
            const k = `${where.domain_provider.domain}::${where.domain_provider.provider}`;
            const existing = mockDbSnapshots.get(k);
            const record = existing ? { ...existing, ...update } : { ...create };
            mockDbSnapshots.set(k, record);
            return record;
        }
    };
}

function restoreAll() {
    global.fetch = origFetch;
    JWT.prototype.getAccessToken = origJwtGetAccessToken;
    prisma.seoProjectConfig = origSeoProjectConfig;
    prisma.seoIntegrationSnapshot = origSeoIntegrationSnapshot;
}

function makeJsonResponse(body, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        text: async () => JSON.stringify(body)
    };
}

function requestApp(server, method, urlPath, headers = {}) {
    return new Promise((resolve, reject) => {
        const addr = server.address();
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: addr.port,
                path: urlPath,
                method,
                headers
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    let json = null;
                    try { json = JSON.parse(data); } catch { /* ignore */ }
                    resolve({ status: res.statusCode, headers: res.headers, text: data, json });
                });
            }
        );
        req.on('error', reject);
        req.end();
    });
}

test.beforeEach(() => {
    installMocks();
});

test.after(() => {
    restoreAll();
});

test('1. Service Account JSON storage parses client_email/private_key and never exposes private keys to client', async () => {
    const rawJson = JSON.stringify({
        type: 'service_account',
        client_email: 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com',
        private_key: FAKE_PRIVATE_KEY
    });

    const saved = await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'sc-domain:hangbug.com',
        googleServiceAccountJson: rawJson
    });

    assert.strictEqual(saved.googleServiceAccountEmail, 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com');
    assert.strictEqual(saved.googlePrivateKey, FAKE_PRIVATE_KEY);
    assert.strictEqual(saved.gscProperty, 'sc-domain:hangbug.com');

    // Invalid JSON rejected
    await assert.rejects(
        () => seoIntegration.saveProjectConfig(TEST_DOMAIN, { googleServiceAccountJson: '{not-valid-json' }),
        /Invalid Google Service Account JSON format/
    );

    // Masked placeholder preserves stored email and private key
    const updated = await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        googleServiceAccountEmail: '••••••••',
        googlePrivateKey: '••••••••'
    });
    assert.strictEqual(updated.googleServiceAccountEmail, 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com');
    assert.strictEqual(updated.googlePrivateKey, FAKE_PRIVATE_KEY);

    // Client sanitization strips private key and raw JSON completely
    const sanitized = seoIntegration.sanitizeConfigForClient(updated);
    const serialized = JSON.stringify(sanitized);
    assert.strictEqual(sanitized.hasGoogleServiceAccount, true);
    assert.strictEqual(sanitized.integrations.gscConnected, true);
    assert.strictEqual(sanitized.googlePrivateKey, undefined);
    assert.ok(sanitized.googleServiceAccountEmailMasked.includes('***@my-gcp-project.iam.gserviceaccount.com'));
    assert.ok(!serialized.includes('TEST_PRIVATE_KEY_BODY_ONLY'));
    assert.ok(!serialized.includes('BEGIN PRIVATE KEY'));
});

test('2. Service Account JWT authentication uses webmasters.readonly scope and retrieves Search Console data', async () => {
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'sc-domain:hangbug.com',
        googleServiceAccountEmail: 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com',
        googlePrivateKey: FAKE_PRIVATE_KEY
    });

    const jwtInvocations = [];
    JWT.prototype.getAccessToken = async function mockGetAccessToken() {
        jwtInvocations.push({
            email: this.email,
            key: this.key,
            scopes: this.scopes
        });
        return { token: 'ya29.mock-service-account-token' };
    };

    const requestedUrls = [];
    global.fetch = async (url, opts) => {
        requestedUrls.push({ url, auth: opts?.headers?.Authorization });
        if (url.includes('/sitemaps')) {
            return makeJsonResponse({
                sitemap: [
                    {
                        path: 'https://www.hangbug.com/sitemap.xml',
                        errors: 0,
                        warnings: 0,
                        contents: [{ submitted: 50, indexed: 47 }]
                    }
                ]
            });
        }
        const body = JSON.parse(opts.body);
        const dims = (body.dimensions || []).join(',');
        if (dims === 'date') {
            return makeJsonResponse({
                rows: [
                    { keys: [body.startDate], clicks: 110, impressions: 2200, ctr: 0.05, position: 8.2 },
                    { keys: [body.endDate], clicks: 140, impressions: 2800, ctr: 0.05, position: 7.4 }
                ]
            });
        }
        if (dims === 'query,page') {
            return makeJsonResponse({
                rows: [
                    {
                        keys: ['hangbug javascript quiz', 'https://www.hangbug.com/technologies/javascript'],
                        clicks: 95,
                        impressions: 1100,
                        ctr: 0.0864,
                        position: 4.3
                    }
                ]
            });
        }
        if (dims === 'page') {
            return makeJsonResponse({
                rows: [
                    {
                        keys: ['https://www.hangbug.com/technologies/javascript'],
                        clicks: 160,
                        impressions: 2400,
                        ctr: 0.0667,
                        position: 5.5
                    }
                ]
            });
        }
        throw new Error(`Unexpected dimensions: ${dims}`);
    };

    const testResult = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'gsc');
    assert.strictEqual(testResult.ok, true);
    assert.strictEqual(testResult.provider, 'Google Search Console');
    assert.ok(testResult.message.includes('sc-domain:hangbug.com'));

    // Verify JWT authenticated with normalized private key and exact read-only scope
    assert.ok(jwtInvocations.length >= 1);
    assert.strictEqual(jwtInvocations[0].email, 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com');
    assert.ok(jwtInvocations[0].key.includes('\nTEST_PRIVATE_KEY_BODY_ONLY\n'), 'Escaped \\n must be converted to real newlines');
    assert.deepStrictEqual(jwtInvocations[0].scopes, ['https://www.googleapis.com/auth/webmasters.readonly']);

    // Verify sc-domain property encoding and bearer header
    assert.ok(requestedUrls.some(r => r.url.includes('sites/sc-domain%3Ahangbug.com/searchAnalytics/query')));
    assert.ok(requestedUrls.every(r => r.auth === 'Bearer ya29.mock-service-account-token'));

    // Verify Search Analytics metrics across date ranges
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const perf = await seoIntegration.fetchSearchConsolePerformance(config, seoIntegration.resolveDateRange('28d'));
    assert.strictEqual(perf.connected, true);
    assert.strictEqual(perf.summary.totalClicks, 250);
    assert.strictEqual(perf.summary.totalImpressions, 5000);
    assert.strictEqual(perf.topQueries.length, 1);
    assert.strictEqual(perf.topPages.length, 1);
    assert.strictEqual(perf.sitemaps.length, 1);
});

test('3. Property permission errors (HTTP 403) fail honestly without generating fake metrics', async () => {
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'https://www.hangbug.com/',
        googleServiceAccountEmail: 'unauthorized-sa@my-gcp-project.iam.gserviceaccount.com',
        googlePrivateKey: FAKE_PRIVATE_KEY
    });

    JWT.prototype.getAccessToken = async () => ({ token: 'ya29.mock-token' });
    global.fetch = async () => makeJsonResponse({
        error: {
            code: 403,
            message: 'User does not have sufficient permission for site \'https://www.hangbug.com/\'.'
        }
    }, 403);

    const testResult = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'gsc');
    assert.strictEqual(testResult.ok, false);
    assert.ok(testResult.message.includes('Service Account permissions'));

    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const perf = await seoIntegration.fetchSearchConsolePerformance(config, seoIntegration.resolveDateRange('7d'));
    assert.strictEqual(perf.connected, false);
    assert.strictEqual(perf.summary, null);
    assert.deepStrictEqual(perf.topQueries, []);
});

test('4. OAuth 2.0 GSC routes & UI are removed and Service Account UI is restored on Web and Mobile', async () => {
    // Confirm OAuth GSC endpoints no longer exist
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    try {
        const callbackUnauth = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/callback?code=x&state=y');
        assert.strictEqual(callbackUnauth.status, 401, 'Public OAuth callback route must be removed');

        const callbackRes = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/callback?code=x&state=y', {
            Authorization: 'Bearer guest-admin-token'
        });
        assert.strictEqual(callbackRes.status, 404, 'OAuth callback route must be removed');

        const authRes = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/authorize', {
            Authorization: 'Bearer guest-admin-token'
        });
        assert.strictEqual(authRes.status, 404, 'OAuth authorize route must be removed');
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }

    // Confirm Web & Mobile SEO Settings restored Service Account fields and removed OAuth Connect UI
    const webSettings = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoSettingsSection.jsx'), 'utf8');
    const mobileSettings = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_secondary.dart'), 'utf8');

    for (const [label, content] of [['Web SeoSettingsSection', webSettings], ['Mobile SeoSettingsTab', mobileSettings]]) {
        assert.ok(content.includes('Service Account Email'), `${label} must include Service Account Email`);
        assert.ok(content.includes('New Private Key'), `${label} must include New Private Key`);
        assert.ok(content.includes('Paste Full Google Service Account JSON'), `${label} must include Paste Full Google Service Account JSON`);
        assert.ok(content.includes('Test GSC'), `${label} must include Test GSC button`);
        assert.ok(!content.includes('Connect Google Account'), `${label} must NOT include OAuth Connect Google Account button`);
        assert.ok(!content.includes('Permission Revoked'), `${label} must NOT include OAuth Permission Revoked UI`);
    }
});
