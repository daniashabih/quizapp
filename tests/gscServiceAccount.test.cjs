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
const origEnv = {
    GSC_SITE_URL: process.env.GSC_SITE_URL,
    GA4_PROPERTY_ID: process.env.GA4_PROPERTY_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
};

const mockDbConfigs = new Map();
const mockDbSnapshots = new Map();

function installMocks() {
    mockDbConfigs.clear();
    mockDbSnapshots.clear();
    delete process.env.GSC_SITE_URL;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

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
    for (const [k, v] of Object.entries(origEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
    }
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

test('1. Domain property identification: bare hangbug.com normalizes to sc-domain:hangbug.com and never to http://hangbug.com', async () => {
    assert.strictEqual(seoIntegration.normalizeGscPropertyIdentifier('hangbug.com'), 'sc-domain:hangbug.com');
    assert.strictEqual(seoIntegration.normalizeGscPropertyIdentifier('www.hangbug.com'), 'sc-domain:hangbug.com');
    assert.strictEqual(seoIntegration.normalizeGscPropertyIdentifier('sc-domain:hangbug.com'), 'sc-domain:hangbug.com');
    assert.strictEqual(seoIntegration.normalizeGscPropertyIdentifier('SC-DOMAIN:https://hangbug.com/'), 'sc-domain:hangbug.com');
    assert.strictEqual(seoIntegration.normalizeGscPropertyIdentifier('https://www.hangbug.com'), 'https://www.hangbug.com/');

    const rawJson = JSON.stringify({
        type: 'service_account',
        client_email: 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com',
        private_key: FAKE_PRIVATE_KEY
    });

    // Even if user entered bare "hangbug.com", it is stored as "sc-domain:hangbug.com"
    const saved = await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'hangbug.com',
        googleServiceAccountJson: rawJson
    });

    assert.strictEqual(saved.googleServiceAccountEmail, 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com');
    assert.strictEqual(saved.googlePrivateKey, FAKE_PRIVATE_KEY);
    assert.strictEqual(saved.gscProperty, 'sc-domain:hangbug.com');

    // Do NOT display gscConnected: true merely because JSON credentials exist before property verification
    const unverifiedSanitized = seoIntegration.sanitizeConfigForClient(saved);
    const serialized = JSON.stringify(unverifiedSanitized);
    assert.strictEqual(unverifiedSanitized.hasGoogleServiceAccount, true);
    assert.strictEqual(unverifiedSanitized.integrations.gscConnected, false, 'Must not report connected before sites.list verification');
    assert.strictEqual(unverifiedSanitized.googlePrivateKey, undefined);
    assert.ok(!serialized.includes('TEST_PRIVATE_KEY_BODY_ONLY'));
    assert.ok(!serialized.includes('BEGIN PRIVATE KEY'));
});

test('2. Sites API (sites.list) property listing, permissionLevel verification, and Search Analytics API with sc-domain:hangbug.com', async () => {
    // Save with legacy "http://hangbug.com" to verify auto-resolution to sc-domain:hangbug.com via sites.list
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'http://hangbug.com',
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
        requestedUrls.push({ url, method: opts?.method || 'GET', auth: opts?.headers?.Authorization });

        if (url === 'https://www.googleapis.com/webmasters/v3/sites') {
            return makeJsonResponse({
                siteEntry: [
                    { siteUrl: 'sc-domain:hangbug.com', permissionLevel: 'siteFullUser' },
                    { siteUrl: 'https://other-site.example.com/', permissionLevel: 'siteRestrictedUser' }
                ]
            });
        }
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
    assert.strictEqual(testResult.authenticated, true);
    assert.strictEqual(testResult.property, 'sc-domain:hangbug.com');
    assert.strictEqual(testResult.permissionLevel, 'siteFullUser');
    assert.strictEqual(testResult.availableProperties.length, 2);
    assert.ok(testResult.message.includes('sc-domain:hangbug.com'));
    assert.ok(testResult.message.includes('siteFullUser'));

    // Verify JWT authenticated with normalized private key and exact read-only scope
    assert.ok(jwtInvocations.length >= 1);
    assert.strictEqual(jwtInvocations[0].email, 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com');
    assert.ok(jwtInvocations[0].key.includes('\nTEST_PRIVATE_KEY_BODY_ONLY\n'));
    assert.deepStrictEqual(jwtInvocations[0].scopes, ['https://www.googleapis.com/auth/webmasters.readonly']);

    // Verify sites.list was called first and Search Analytics used exact sc-domain%3Ahangbug.com (never http://hangbug.com)
    assert.ok(requestedUrls.some(r => r.url === 'https://www.googleapis.com/webmasters/v3/sites'));
    assert.ok(requestedUrls.some(r => r.url === 'https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Ahangbug.com/searchAnalytics/query'));
    assert.ok(!requestedUrls.some(r => r.url.includes('http%3A%2F%2Fhangbug.com')));
    assert.ok(requestedUrls.every(r => r.auth === 'Bearer ya29.mock-service-account-token'));

    // Verify URL-prefix property selection uses exact URL from sites.list when explicitly chosen
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'https://other-site.example.com'
    });
    const configUrlPrefix = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const verUrlPrefix = await seoIntegration.verifySearchConsoleServiceAccount(configUrlPrefix);
    assert.strictEqual(verUrlPrefix.propertyVerified, true);
    assert.strictEqual(verUrlPrefix.selectedProperty, 'https://other-site.example.com/');
    assert.strictEqual(verUrlPrefix.permissionLevel, 'siteRestrictedUser');
});

test('3. Missing property and insufficient permissionLevel handling return clear client_email instructions without running Search Analytics', async () => {
    const saEmail = 'hangbug-seo@my-gcp-project.iam.gserviceaccount.com';
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        gscProperty: 'sc-domain:hangbug.com',
        googleServiceAccountEmail: saEmail,
        googlePrivateKey: FAKE_PRIVATE_KEY
    });

    JWT.prototype.getAccessToken = async () => ({ token: 'ya29.mock-token' });

    // Case A: sc-domain:hangbug.com is missing from sites.list
    let searchAnalyticsCalled = false;
    global.fetch = async (url) => {
        if (url === 'https://www.googleapis.com/webmasters/v3/sites') {
            return makeJsonResponse({ siteEntry: [] });
        }
        if (url.includes('/searchAnalytics/query')) {
            searchAnalyticsCalled = true;
        }
        return makeJsonResponse({}, 403);
    };

    const missingRes = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'gsc');
    assert.strictEqual(missingRes.ok, false);
    assert.strictEqual(missingRes.authenticated, true);
    assert.strictEqual(missingRes.property, 'sc-domain:hangbug.com');
    assert.strictEqual(missingRes.permissionLevel, null);
    assert.strictEqual(searchAnalyticsCalled, false, 'Must not call Search Analytics when property is missing from sites.list');
    assert.ok(missingRes.message.includes(saEmail), 'Error message must include service account client_email');
    assert.ok(missingRes.message.includes('Users and permissions'), 'Error message must instruct adding to Search Console Users and permissions');
    assert.ok(missingRes.message.includes('sc-domain:hangbug.com'));

    // Case B: sc-domain:hangbug.com is in sites.list but permissionLevel is siteUnverifiedUser
    global.fetch = async (url) => {
        if (url === 'https://www.googleapis.com/webmasters/v3/sites') {
            return makeJsonResponse({
                siteEntry: [
                    { siteUrl: 'sc-domain:hangbug.com', permissionLevel: 'siteUnverifiedUser' }
                ]
            });
        }
        if (url.includes('/searchAnalytics/query')) {
            searchAnalyticsCalled = true;
        }
        return makeJsonResponse({}, 403);
    };

    const unverifiedRes = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'gsc');
    assert.strictEqual(unverifiedRes.ok, false);
    assert.strictEqual(unverifiedRes.authenticated, true);
    assert.strictEqual(unverifiedRes.property, 'sc-domain:hangbug.com');
    assert.strictEqual(unverifiedRes.permissionLevel, 'siteUnverifiedUser');
    assert.strictEqual(searchAnalyticsCalled, false, 'Must not call Search Analytics when permissionLevel is siteUnverifiedUser');
    assert.ok(unverifiedRes.message.includes('siteUnverifiedUser'));
    assert.ok(unverifiedRes.message.includes(saEmail));
});

test('4. Settings UI displays Authentication Status, Service Account Email, Available Properties, Selected Property, Permission Level, and Test Result', async () => {
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    try {
        const callbackUnauth = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/callback?code=x&state=y');
        assert.strictEqual(callbackUnauth.status, 401);

        const callbackRes = await requestApp(server, 'GET', '/api/admin/seo/gsc/oauth/callback?code=x&state=y', {
            Authorization: 'Bearer guest-admin-token'
        });
        assert.strictEqual(callbackRes.status, 404);
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }

    const webSettings = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoSettingsSection.jsx'), 'utf8');
    const mobileSettings = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_secondary.dart'), 'utf8');

    for (const [label, content] of [['Web SeoSettingsSection', webSettings], ['Mobile SeoSettingsTab', mobileSettings]]) {
        assert.ok(content.includes('Authentication Status'), `${label} must display Authentication Status`);
        assert.ok(content.includes('Service Account Email'), `${label} must display Service Account Email`);
        assert.ok(content.includes('Available Search Console Properties'), `${label} must display Available Search Console Properties`);
        assert.ok(content.includes('Selected Property'), `${label} must display Selected Property`);
        assert.ok(content.includes('Google Permission Level'), `${label} must display Google Permission Level`);
        assert.ok(content.includes('Test Connection Result'), `${label} must display Test Connection Result`);
        assert.ok(content.includes('New Private Key'), `${label} must include New Private Key input`);
        assert.ok(content.includes('Paste Full Google Service Account JSON'), `${label} must include Paste Full Google Service Account JSON`);
        assert.ok(content.includes('sc-domain:hangbug.com'), `${label} must reference sc-domain:hangbug.com`);
        assert.ok(content.includes('Measurement ID'), `${label} must display GA4 Measurement ID`);
        assert.ok(content.includes('Numeric Property ID'), `${label} must display GA4 Numeric Property ID`);
        assert.ok(content.includes('Test GA4 Connection'), `${label} must include Test GA4 Connection button`);
        assert.ok(!content.includes('Connect Google Account'), `${label} must NOT include OAuth Connect Google Account button`);
    }
});

test('5. GA4 Data API: validates numeric Property ID 561909161, rejects G-BSZBBFZZH0 as Property ID, and retrieves all 11 metrics & breakdowns across 7d/28d/90d/12m', async () => {
    // Reject Measurement ID used as Property ID
    const badCheck = seoIntegration.validateAndNormalizeGa4PropertyId('G-BSZBBFZZH0');
    assert.strictEqual(badCheck.valid, false);
    assert.strictEqual(badCheck.errorCategory, 'invalid_property_id');
    assert.ok(badCheck.message.includes('frontend Measurement ID'));

    await assert.rejects(
        () => seoIntegration.saveProjectConfig(TEST_DOMAIN, { ga4PropertyId: 'G-BSZBBFZZH0' }),
        /frontend Measurement ID/
    );

    // Valid numeric Property ID
    const goodCheck = seoIntegration.validateAndNormalizeGa4PropertyId('561909161');
    assert.strictEqual(goodCheck.valid, true);
    assert.strictEqual(goodCheck.propertyId, '561909161');
    assert.strictEqual(goodCheck.resourceName, 'properties/561909161');

    // Date filters: 7d, 28d, 90d/3m, 12m
    assert.strictEqual(seoIntegration.resolveDateRange('7d').days, 7);
    assert.strictEqual(seoIntegration.resolveDateRange('28d').days, 28);
    assert.strictEqual(seoIntegration.resolveDateRange('90d').days, 90);
    assert.strictEqual(seoIntegration.resolveDateRange('3m').days, 90);
    assert.strictEqual(seoIntegration.resolveDateRange('12m').days, 365);

    // Save config with numeric GA4 Property ID 561909161 and existing Service Account
    const saved = await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        ga4PropertyId: '561909161',
        ga4MeasurementId: 'G-BSZBBFZZH0',
        googleServiceAccountEmail: 'hangbug-seo-service@hangbug.iam.gserviceaccount.com',
        googlePrivateKey: FAKE_PRIVATE_KEY
    });

    // Before live API call, ga4Connected must be false
    const preSanitized = seoIntegration.sanitizeConfigForClient(saved);
    assert.strictEqual(preSanitized.integrations.ga4Connected, false, 'Must only show Connected after real runReport succeeds');

    const jwtScopes = [];
    JWT.prototype.getAccessToken = async function mockGa4Jwt() {
        jwtScopes.push(this.scopes);
        return { token: 'ya29.mock-ga4-token' };
    };

    const calledEndpoints = [];
    global.fetch = async (url, opts) => {
        calledEndpoints.push(url);
        const body = JSON.parse(opts.body);
        const dim = body.dimensions?.[0]?.name || 'totals';

        if (dim === 'totals') {
            return makeJsonResponse({
                rows: [{
                    metricValues: [
                        { value: '236' }, // activeUsers
                        { value: '237' }, // totalUsers
                        { value: '453' }, // sessions
                        { value: '239' }, // newUsers
                        { value: '7377' }, // screenPageViews
                        { value: '0.3156' }, // bounceRate
                        { value: '206302' }, // userEngagementDuration
                        { value: '310' }, // engagedSessions
                        { value: '0.6843' } // engagementRate
                    ]
                }]
            });
        }
        if (dim === 'date') {
            return makeJsonResponse({
                rows: [{
                    dimensionValues: [{ value: '20261119' }],
                    metricValues: [{ value: '25' }, { value: '18' }, { value: '20' }, { value: '340' }]
                }]
            });
        }
        if (dim === 'landingPagePlusQueryString') {
            return makeJsonResponse({
                rows: [{
                    dimensionValues: [{ value: '/technologies/javascript' }],
                    metricValues: [{ value: '120' }, { value: '85' }, { value: '940' }, { value: '0.22' }, { value: '0.78' }]
                }]
            });
        }
        if (dim === 'sessionDefaultChannelGroup') {
            return makeJsonResponse({
                rows: [
                    { dimensionValues: [{ value: 'Direct' }], metricValues: [{ value: '247' }, { value: '167' }, { value: '166' }, { value: '4100' }, { value: '0.562' }] },
                    { dimensionValues: [{ value: 'Organic Search' }], metricValues: [{ value: '151' }, { value: '68' }, { value: '68' }, { value: '2800' }, { value: '0.887' }] }
                ]
            });
        }
        if (dim === 'country') {
            return makeJsonResponse({
                rows: [
                    { dimensionValues: [{ value: 'Pakistan' }], metricValues: [{ value: '145' }, { value: '146' }, { value: '361' }] },
                    { dimensionValues: [{ value: 'United States' }], metricValues: [{ value: '40' }, { value: '40' }, { value: '40' }] }
                ]
            });
        }
        if (dim === 'deviceCategory') {
            return makeJsonResponse({
                rows: [
                    { dimensionValues: [{ value: 'desktop' }], metricValues: [{ value: '207' }, { value: '404' }, { value: '6786' }] },
                    { dimensionValues: [{ value: 'mobile' }], metricValues: [{ value: '30' }, { value: '50' }, { value: '591' }] }
                ]
            });
        }
        return makeJsonResponse({ rows: [] });
    };

    const testRes = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'ga4');
    assert.strictEqual(testRes.ok, true);
    assert.strictEqual(testRes.propertyId, '561909161');
    assert.strictEqual(testRes.resourceName, 'properties/561909161');
    assert.strictEqual(testRes.measurementId, 'G-BSZBBFZZH0');
    assert.deepStrictEqual(jwtScopes[0], ['https://www.googleapis.com/auth/analytics.readonly']);
    assert.ok(calledEndpoints.every(u => u === 'https://analyticsdata.googleapis.com/v1beta/properties/561909161:runReport'));

    assert.strictEqual(testRes.summary.activeUsers, 236);
    assert.strictEqual(testRes.summary.totalUsers, 237);
    assert.strictEqual(testRes.summary.sessions, 453);
    assert.strictEqual(testRes.summary.newUsers, 239);
    assert.strictEqual(testRes.summary.pageViews, 7377);
    assert.strictEqual(testRes.summary.bounceRate, 31.6);
    assert.ok(testRes.summary.avgEngagementTimeFormatted.includes('m'));
    assert.strictEqual(testRes.summary.organicSessions, 151);

    // After successful runReport, sanitizeConfigForClient reports ga4Connected: true
    const postSanitized = seoIntegration.sanitizeConfigForClient(saved);
    assert.strictEqual(postSanitized.integrations.ga4Connected, true);
    assert.strictEqual(postSanitized.ga4ConnectionStatus, 'Connected');
});

test('6. GA4 Error Handling covers Missing Permission, API Disabled, Invalid Property ID, Invalid Credentials, Quota, and No Reporting Data', async () => {
    await seoIntegration.saveProjectConfig(TEST_DOMAIN, {
        ga4PropertyId: '561909161',
        googleServiceAccountEmail: 'hangbug-seo-service@hangbug.iam.gserviceaccount.com',
        googlePrivateKey: FAKE_PRIVATE_KEY
    });

    JWT.prototype.getAccessToken = async () => ({ token: 'ya29.mock-ga4-token' });

    // 1. Missing service account permission (403 PERMISSION_DENIED)
    global.fetch = async () => makeJsonResponse({
        error: { code: 403, status: 'PERMISSION_DENIED', message: 'User does not have sufficient permissions for this property.' }
    }, 403);
    let res = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'ga4');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.errorCategory, 'missing_permission');
    assert.ok(res.message.includes('Viewer'));

    // 2. Google Analytics Data API disabled (403 SERVICE_DISABLED)
    global.fetch = async () => makeJsonResponse({
        error: { code: 403, status: 'PERMISSION_DENIED', message: 'Google Analytics Data API has not been used in project 123 before or it is disabled.' }
    }, 403);
    res = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'ga4');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.errorCategory, 'api_disabled');
    assert.ok(res.message.includes('analyticsdata.googleapis.com'));

    // 3. API quota exceeded (429 RESOURCE_EXHAUSTED)
    global.fetch = async () => makeJsonResponse({
        error: { code: 429, status: 'RESOURCE_EXHAUSTED', message: 'Exhausted property tokens for a project per hour.' }
    }, 429);
    res = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'ga4');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.errorCategory, 'quota_exceeded');

    // 4. Invalid JSON credentials
    JWT.prototype.getAccessToken = async () => {
        throw new Error('error:1E08010C:DECODER routines::unsupported');
    };
    res = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'ga4');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.errorCategory, 'invalid_credentials');

    // 5. No available reporting data (0 rows)
    JWT.prototype.getAccessToken = async () => ({ token: 'ya29.mock-ga4-token' });
    global.fetch = async () => makeJsonResponse({ rows: [], rowCount: 0 });
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const emptyPerf = await seoIntegration.fetchGa4Performance(config, seoIntegration.resolveDateRange('7d'));
    assert.strictEqual(emptyPerf.connected, true);
    assert.strictEqual(emptyPerf.hasData, false);
    assert.ok(emptyPerf.noDataMessage.includes('no available reporting data'));
});
