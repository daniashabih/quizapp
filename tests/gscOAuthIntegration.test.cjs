const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.resolve(__dirname, '..');
const prisma = require('../api/_config/prisma');
const seoIntegration = require('../api/_services/seoIntegrationService');
const app = require('../api/index');

const TEST_DOMAIN = 'oauth-test.hangbug.com';

// Save original env & Prisma delegates so unit tests NEVER touch production MongoDB Atlas or env
const ORIG_ENV = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    SEO_TOKEN_ENCRYPTION_KEY: process.env.SEO_TOKEN_ENCRYPTION_KEY
};
const origFetch = global.fetch;
const origSeoProjectConfig = prisma.seoProjectConfig;
const origSeoIntegrationSnapshot = prisma.seoIntegrationSnapshot;

const mockDbConfigs = new Map();
const mockDbSnapshots = new Map();

function installMockPrisma() {
    mockDbConfigs.clear();
    mockDbSnapshots.clear();
    seoIntegration.clearDomainMemoryState();

    prisma.seoProjectConfig = {
        findUnique: async ({ where }) => mockDbConfigs.get(where.domain) || null,
        upsert: async ({ where, create, update }) => {
            const existing = mockDbConfigs.get(where.domain);
            const record = existing
                ? { ...existing, ...update, updatedAt: new Date() }
                : { id: 'mock-id', ...create, createdAt: new Date(), updatedAt: new Date() };
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
        },
        deleteMany: async ({ where }) => {
            const providers = where?.provider?.in || [];
            for (const p of providers) {
                mockDbSnapshots.delete(`${where.domain}::${p}`);
            }
            return { count: providers.length };
        }
    };
}

function restoreAll() {
    global.fetch = origFetch;
    prisma.seoProjectConfig = origSeoProjectConfig;
    prisma.seoIntegrationSnapshot = origSeoIntegrationSnapshot;
    for (const [k, v] of Object.entries(ORIG_ENV)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
    }
    seoIntegration.clearDomainMemoryState();
}

function makeFakeIdToken(email) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ email, email_verified: true })).toString('base64url');
    return `${header}.${payload}.fake-sig`;
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
                    try { json = JSON.parse(data); } catch { /* non-json */ }
                    resolve({ status: res.statusCode, headers: res.headers, text: data, json });
                });
            }
        );
        req.on('error', reject);
        req.end();
    });
}

test.beforeEach(() => {
    installMockPrisma();
    process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret-value';
    process.env.GOOGLE_REDIRECT_URI = 'https://www.hangbug.com/api/admin/seo/gsc/oauth/callback';
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    delete process.env.SEO_TOKEN_ENCRYPTION_KEY;
});

test.after(() => {
    restoreAll();
});

test('1. Google OAuth authorization builds minimum-scope offline URL with signed state & protects endpoint', async () => {
    const { authUrl, redirectUri, state } = seoIntegration.buildGscOAuthAuthorizationUrl({
        domain: TEST_DOMAIN,
        platform: 'web',
        userId: 'admin-1',
        userEmail: 'owner@hangbug.com'
    });

    assert.strictEqual(redirectUri, 'https://www.hangbug.com/api/admin/seo/gsc/oauth/callback');
    const parsed = new URL(authUrl);
    assert.strictEqual(parsed.origin, 'https://accounts.google.com');
    assert.strictEqual(parsed.searchParams.get('client_id'), 'test-client-id.apps.googleusercontent.com');
    assert.strictEqual(parsed.searchParams.get('redirect_uri'), redirectUri);
    assert.strictEqual(parsed.searchParams.get('response_type'), 'code');
    assert.strictEqual(parsed.searchParams.get('access_type'), 'offline');
    assert.strictEqual(parsed.searchParams.get('prompt'), 'consent select_account');
    assert.strictEqual(parsed.searchParams.get('include_granted_scopes'), 'false');

    const scopeParam = parsed.searchParams.get('scope') || '';
    assert.ok(scopeParam.includes('https://www.googleapis.com/auth/webmasters.readonly'), 'Must request webmasters.readonly');
    assert.ok(!/\bhttps:\/\/www\.googleapis\.com\/auth\/webmasters\b(?!\.readonly)/.test(scopeParam), 'Must NOT request read-write webmasters scope');

    const verifiedState = seoIntegration.verifyGscOAuthState(state);
    assert.strictEqual(verifiedState.domain, TEST_DOMAIN);
    assert.strictEqual(verifiedState.platform, 'web');
    assert.strictEqual(verifiedState.userId, 'admin-1');

    // HTTP endpoint checks: unauthorized rejected, admin allowed
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    try {
        const unauth = await requestApp(server, 'GET', `/api/admin/seo/gsc/oauth/authorize?domain=${TEST_DOMAIN}`);
        assert.strictEqual(unauth.status, 401);

        const adminRes = await requestApp(server, 'GET', `/api/admin/seo/gsc/oauth/authorize?domain=${TEST_DOMAIN}`, {
            Authorization: 'Bearer guest-admin-token'
        });
        assert.strictEqual(adminRes.status, 200);
        assert.strictEqual(adminRes.json.success, true);
        assert.ok(adminRes.json.authUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth?'));
        assert.strictEqual(adminRes.json.redirectUri, 'https://www.hangbug.com/api/admin/seo/gsc/oauth/callback');
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});

test('2 & 3. OAuth callback exchanges code, encrypts tokens at rest, and never exposes secrets to frontend', async () => {
    const calls = [];
    global.fetch = async (url, opts) => {
        calls.push({ url, method: opts?.method || 'GET', body: opts?.body });
        if (url === 'https://oauth2.googleapis.com/token') {
            return makeJsonResponse({
                access_token: 'ya29.super-secret-access-token',
                refresh_token: '1//super-secret-refresh-token',
                expires_in: 3600,
                scope: 'https://www.googleapis.com/auth/webmasters.readonly openid email',
                id_token: makeFakeIdToken('seo-owner@hangbug.com')
            });
        }
        if (url === 'https://www.googleapis.com/webmasters/v3/sites') {
            return makeJsonResponse({
                siteEntry: [
                    { siteUrl: 'sc-domain:hangbug.com', permissionLevel: 'siteOwner' },
                    { siteUrl: 'https://www.hangbug.com/', permissionLevel: 'siteFullUser' }
                ]
            });
        }
        throw new Error(`Unexpected fetch URL: ${url}`);
    };

    const { state } = seoIntegration.buildGscOAuthAuthorizationUrl({
        domain: TEST_DOMAIN,
        platform: 'web',
        userId: 'admin-1'
    });

    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    try {
        // Tampered state rejected cleanly
        const badStateRes = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/callback?code=abc&state=tampered');
        assert.strictEqual(badStateRes.status, 302);
        assert.ok(badStateRes.headers.location.includes('gsc_oauth=error'));

        // Valid callback redirects to SEO Settings
        const okRes = await requestApp(
            server,
            'GET',
            `/api/admin/seo/gsc/oauth/callback?code=auth-code-123&state=${encodeURIComponent(state)}`
        );
        assert.strictEqual(okRes.status, 302);
        assert.ok(okRes.headers.location.startsWith('/dashboard/seo/settings?gsc_oauth='));
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }

    // Verify encrypted token storage in DB
    const stored = mockDbConfigs.get(TEST_DOMAIN);
    assert.ok(stored, 'Config must be saved to storage');
    assert.ok(stored.gscOAuthAccessToken.startsWith('enc:v1:'), 'Access token must be encrypted at rest');
    assert.ok(stored.gscOAuthRefreshToken.startsWith('enc:v1:'), 'Refresh token must be encrypted at rest');
    assert.ok(!stored.gscOAuthAccessToken.includes('ya29.super-secret-access-token'));
    assert.ok(!stored.gscOAuthRefreshToken.includes('1//super-secret-refresh-token'));
    assert.strictEqual(seoIntegration.decryptSecret(stored.gscOAuthAccessToken), 'ya29.super-secret-access-token');
    assert.strictEqual(seoIntegration.decryptSecret(stored.gscOAuthRefreshToken), '1//super-secret-refresh-token');
    assert.strictEqual(stored.gscAccountEmail, 'seo-owner@hangbug.com');
    assert.strictEqual(stored.gscConnectionStatus, 'connected');

    // Verify sanitized client response NEVER leaks access token, refresh token, or client secret
    const sanitized = seoIntegration.sanitizeConfigForClient(stored);
    const serialized = JSON.stringify(sanitized);
    assert.strictEqual(sanitized.gscAccountEmail, 'seo-owner@hangbug.com');
    assert.strictEqual(sanitized.gscConnectionStatus, 'connected');
    assert.strictEqual(sanitized.gscConnectionStatusLabel, 'Connected');
    assert.strictEqual(sanitized.gscOAuthAccessToken, undefined);
    assert.strictEqual(sanitized.gscOAuthRefreshToken, undefined);
    assert.ok(!serialized.includes('ya29.super-secret-access-token'));
    assert.ok(!serialized.includes('1//super-secret-refresh-token'));
    assert.ok(!serialized.includes('test-client-secret-value'));
});

test('4. Access token automatically refreshes when expired and persists new encrypted token', async () => {
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.expired-token'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//valid-refresh-token'),
            gscOAuthTokenExpiry: new Date(Date.now() - 120000)
        },
        update: {}
    });

    let refreshCalled = false;
    global.fetch = async (url, opts) => {
        if (url === 'https://oauth2.googleapis.com/token') {
            refreshCalled = true;
            assert.ok(String(opts.body).includes('grant_type=refresh_token'));
            assert.ok(String(opts.body).includes('refresh_token=1%2F%2Fvalid-refresh-token'));
            return makeJsonResponse({
                access_token: 'ya29.fresh-refreshed-token',
                expires_in: 3600
            });
        }
        throw new Error(`Unexpected URL: ${url}`);
    };

    const result = await seoIntegration.getValidGscOAuthToken(TEST_DOMAIN);
    assert.strictEqual(refreshCalled, true);
    assert.strictEqual(result.refreshed, true);
    assert.strictEqual(result.accessToken, 'ya29.fresh-refreshed-token');

    const stored = mockDbConfigs.get(TEST_DOMAIN);
    assert.ok(stored.gscOAuthAccessToken.startsWith('enc:v1:'));
    assert.strictEqual(seoIntegration.decryptSecret(stored.gscOAuthAccessToken), 'ya29.fresh-refreshed-token');
    assert.strictEqual(stored.gscConnectionStatus, 'connected');
});

test('5. Search Console property retrieval & verification supports sc-domain:hangbug.com and blocks unverified access', async () => {
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.live-token'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//live-refresh'),
            gscOAuthTokenExpiry: new Date(Date.now() + 3600000)
        },
        update: {}
    });

    global.fetch = async (url) => {
        if (url === 'https://www.googleapis.com/webmasters/v3/sites') {
            return makeJsonResponse({
                siteEntry: [
                    { siteUrl: 'sc-domain:hangbug.com', permissionLevel: 'siteOwner' },
                    { siteUrl: 'https://www.hangbug.com/', permissionLevel: 'siteFullUser' },
                    { siteUrl: 'https://unverified.example.com/', permissionLevel: 'siteUnverifiedUser' }
                ]
            });
        }
        throw new Error(`Unexpected URL: ${url}`);
    };

    const listed = await seoIntegration.listSearchConsoleProperties(TEST_DOMAIN);
    assert.strictEqual(listed.properties.length, 3);
    const domainProp = listed.properties.find(p => p.siteUrl === 'sc-domain:hangbug.com');
    assert.ok(domainProp, 'Must include sc-domain:hangbug.com');
    assert.strictEqual(domainProp.isDomainProperty, true);
    assert.strictEqual(domainProp.hasAccess, true);

    // Selecting verified domain property succeeds
    const verified = await seoIntegration.selectAndVerifySearchConsoleProperty(TEST_DOMAIN, 'sc-domain:hangbug.com');
    assert.strictEqual(verified.verified, true);
    assert.strictEqual(verified.property, 'sc-domain:hangbug.com');
    assert.strictEqual(verified.isDomainProperty, true);
    assert.strictEqual(verified.settings.gscPropertyVerified, true);

    // Selecting unverified property is rejected (never assume access)
    await assert.rejects(
        () => seoIntegration.selectAndVerifySearchConsoleProperty(TEST_DOMAIN, 'https://unverified.example.com/'),
        (err) => err.status === 403 && err.code === 'GSC_PROPERTY_ACCESS_DENIED'
    );

    // Selecting property absent from account is rejected
    await assert.rejects(
        () => seoIntegration.selectAndVerifySearchConsoleProperty(TEST_DOMAIN, 'sc-domain:not-mine.com'),
        (err) => err.status === 403 && err.code === 'GSC_PROPERTY_ACCESS_DENIED'
    );
});

test('6. Search Analytics API fetches clicks, impressions, CTR, position, queries, pages, countries, devices across 7d/28d/3m/6m', async () => {
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscProperty: 'sc-domain:hangbug.com',
            gscPropertyVerified: true,
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.analytics-token'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//analytics-refresh'),
            gscOAuthTokenExpiry: new Date(Date.now() + 3600000)
        },
        update: {}
    });

    const requestedUrls = [];
    global.fetch = async (url, opts) => {
        requestedUrls.push(url);
        if (url.includes('/sitemaps')) {
            return makeJsonResponse({
                sitemap: [{ path: 'https://www.hangbug.com/sitemap.xml', contents: [{ submitted: 45, indexed: 42 }], errors: 0, warnings: 0 }]
            });
        }
        const body = JSON.parse(opts.body);
        const dims = (body.dimensions || []).join(',');
        if (dims === 'date') {
            return makeJsonResponse({
                rows: [
                    { keys: [body.startDate], clicks: 120, impressions: 2400, ctr: 0.05, position: 8.4 },
                    { keys: [body.endDate], clicks: 180, impressions: 3000, ctr: 0.06, position: 7.2 }
                ]
            });
        }
        if (dims === 'query,page') {
            return makeJsonResponse({
                rows: [
                    { keys: ['javascript quiz online', 'https://www.hangbug.com/technologies/javascript'], clicks: 85, impressions: 1200, ctr: 0.0708, position: 5.1 }
                ]
            });
        }
        if (dims === 'page') {
            return makeJsonResponse({
                rows: [
                    { keys: ['https://www.hangbug.com/technologies/javascript'], clicks: 150, impressions: 2500, ctr: 0.06, position: 6.2 }
                ]
            });
        }
        if (dims === 'country') {
            return makeJsonResponse({
                rows: [
                    { keys: ['usa'], clicks: 140, impressions: 2200, ctr: 0.0636, position: 6.5 },
                    { keys: ['pak'], clicks: 90, impressions: 1400, ctr: 0.0643, position: 7.1 }
                ]
            });
        }
        if (dims === 'device') {
            return makeJsonResponse({
                rows: [
                    { keys: ['MOBILE'], clicks: 180, impressions: 3400, ctr: 0.0529, position: 7.4 },
                    { keys: ['DESKTOP'], clicks: 120, impressions: 2000, ctr: 0.06, position: 6.8 }
                ]
            });
        }
        throw new Error(`Unexpected dimensions: ${dims}`);
    };

    // Verify all 4 date presets resolve properly
    assert.strictEqual(seoIntegration.resolveDateRange('7d').days, 7);
    assert.strictEqual(seoIntegration.resolveDateRange('28d').days, 28);
    assert.strictEqual(seoIntegration.resolveDateRange('3m').days, 90);
    assert.strictEqual(seoIntegration.resolveDateRange('6m').days, 180);

    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const data = await seoIntegration.fetchSearchConsolePerformance(config, seoIntegration.resolveDateRange('28d'));

    assert.strictEqual(data.connected, true);
    assert.strictEqual(data.property, 'sc-domain:hangbug.com');
    assert.ok(requestedUrls.some(u => u.includes('sites/sc-domain%3Ahangbug.com/searchAnalytics/query')), 'Must URL-encode sc-domain:hangbug.com');
    assert.strictEqual(data.summary.totalClicks, 300);
    assert.strictEqual(data.summary.totalImpressions, 5400);
    assert.strictEqual(data.summary.averageCtr, 5.56);
    assert.strictEqual(data.topQueries.length, 1);
    assert.strictEqual(data.topQueries[0].keyword, 'javascript quiz online');
    assert.strictEqual(data.topPages.length, 1);
    assert.strictEqual(data.topPages[0].path, '/technologies/javascript');
    assert.strictEqual(data.countryPerformance.length, 2);
    assert.strictEqual(data.countryPerformance[0].countryName, 'United States');
    assert.strictEqual(data.devicePerformance.length, 2);
    assert.strictEqual(data.devicePerformance[0].label, 'Mobile');
    assert.strictEqual(data.devicePerformance[0].clicksSharePct, 60);
    assert.ok(data.syncedAt, 'Must record last successful synchronization timestamp');
});

test('7. Invalid credentials mark connection expired and fail cleanly without exposing secrets', async () => {
    // Missing server OAuth env vars
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    assert.throws(
        () => seoIntegration.buildGscOAuthAuthorizationUrl({ domain: TEST_DOMAIN }),
        (err) => err.code === 'GSC_OAUTH_NOT_CONFIGURED'
    );

    // Invalid OAuth client during token refresh
    process.env.GOOGLE_CLIENT_ID = 'bad-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'bad-client-secret';
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscProperty: 'sc-domain:hangbug.com',
            gscPropertyVerified: true,
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.old'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//refresh'),
            gscOAuthTokenExpiry: new Date(Date.now() - 10000)
        },
        update: {}
    });

    global.fetch = async () => makeJsonResponse({
        error: 'invalid_client',
        error_description: 'The OAuth client was not found.'
    }, 401);

    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const perf = await seoIntegration.fetchSearchConsolePerformance(config, seoIntegration.resolveDateRange('7d'));
    assert.strictEqual(perf.connected, false);
    assert.strictEqual(perf.connectionStatus, 'expired');
    assert.strictEqual(perf.connectionStatusLabel, 'Connection Expired');
    assert.strictEqual(perf.summary, null, 'Must never return fake metrics');
});

test('8. Revoked authorization marks status as Permission Revoked and clears dead access token', async () => {
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscProperty: 'sc-domain:hangbug.com',
            gscPropertyVerified: true,
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.revoked'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//revoked-refresh'),
            gscOAuthTokenExpiry: new Date(Date.now() - 10000)
        },
        update: {}
    });

    global.fetch = async () => makeJsonResponse({
        error: 'invalid_grant',
        error_description: 'Token has been expired or revoked.'
    }, 400);

    const testRes = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'gsc');
    assert.strictEqual(testRes.ok, false);
    assert.strictEqual(testRes.status, 'revoked');
    assert.strictEqual(testRes.statusLabel, 'Permission Revoked');

    const stored = mockDbConfigs.get(TEST_DOMAIN);
    assert.strictEqual(stored.gscConnectionStatus, 'revoked');
    assert.strictEqual(stored.gscOAuthAccessToken, '');
});

test('9. Disconnect revokes token remotely, clears stored credentials, and resets status to Not Connected', async () => {
    await prisma.seoProjectConfig.upsert({
        where: { domain: TEST_DOMAIN },
        create: {
            domain: TEST_DOMAIN,
            gscAccountEmail: 'admin@hangbug.com',
            gscProperty: 'sc-domain:hangbug.com',
            gscPropertyVerified: true,
            gscConnectionStatus: 'connected',
            gscOAuthAccessToken: seoIntegration.encryptSecret('ya29.active'),
            gscOAuthRefreshToken: seoIntegration.encryptSecret('1//active-refresh'),
            gscOAuthTokenExpiry: new Date(Date.now() + 3600000),
            gscAvailablePropertiesJson: JSON.stringify([{ siteUrl: 'sc-domain:hangbug.com', permissionLevel: 'siteOwner', hasAccess: true }])
        },
        update: {}
    });

    let revokeUrl = '';
    global.fetch = async (url) => {
        revokeUrl = url;
        return makeJsonResponse({}, 200);
    };

    const res = await seoIntegration.disconnectSearchConsole(TEST_DOMAIN);
    assert.strictEqual(res.disconnected, true);
    assert.strictEqual(res.revokedRemotely, true);
    assert.ok(revokeUrl.startsWith('https://oauth2.googleapis.com/revoke?token='));

    const stored = mockDbConfigs.get(TEST_DOMAIN);
    assert.strictEqual(stored.gscOAuthAccessToken, '');
    assert.strictEqual(stored.gscOAuthRefreshToken, '');
    assert.strictEqual(stored.gscAccountEmail, '');
    assert.strictEqual(stored.gscConnectionStatus, 'not_connected');
    assert.strictEqual(stored.gscPropertyVerified, false);
    assert.strictEqual(res.settings.gscConnectionStatusLabel, 'Not Connected');
    assert.strictEqual(res.settings.integrations.gscConnected, false);
});

test('10. Cross-Platform UI: Removes Service Account inputs and exposes OAuth 2.0 controls on Web and Mobile', () => {
    const webSettings = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoSettingsSection.jsx'), 'utf8');
    const mobileSettings = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_secondary.dart'), 'utf8');
    const webSearchPerf = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoSearchPerformanceSection.jsx'), 'utf8');
    const mobileSearchPerf = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_primary.dart'), 'utf8');

    for (const [name, content] of [['Web SeoSettingsSection', webSettings], ['Mobile SeoSettingsTab', mobileSettings]]) {
        assert.ok(!content.includes('Service Account Email'), `${name} must NOT include Service Account Email input`);
        assert.ok(!content.includes('New Private Key'), `${name} must NOT include New Private Key input`);
        assert.ok(!content.includes('Paste Full Google Service Account JSON'), `${name} must NOT include Service Account JSON textarea`);
        assert.ok(content.includes('Google Search Console Integration'), `${name} must display Google Search Console Integration panel`);
        assert.ok(content.includes('Connect Google Account'), `${name} must include Connect Google Account button`);
        assert.ok(content.includes('Test Connection'), `${name} must include Test Connection button`);
        assert.ok(content.includes('Refresh Data'), `${name} must include Refresh Data button`);
        assert.ok(content.includes('Disconnect'), `${name} must include Disconnect button`);
    }

    for (const statusLabel of ['Connected', 'Not Connected', 'Connection Expired', 'Permission Revoked']) {
        assert.ok(webSettings.includes(statusLabel), `Web settings must support status "${statusLabel}"`);
    }

    for (const [name, content] of [['Web SearchPerformance', webSearchPerf], ['Mobile SearchPerformance', mobileSearchPerf]]) {
        assert.ok(content.includes('Top Queries'), `${name} must display Top Queries`);
        assert.ok(content.includes('Top Pages'), `${name} must display Top Pages`);
        assert.ok(content.includes('Country Performance'), `${name} must display Country Performance`);
        assert.ok(content.includes('Device Performance'), `${name} must display Device Performance`);
    }
});
