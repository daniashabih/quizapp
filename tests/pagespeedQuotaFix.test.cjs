const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const ROOT = path.resolve(__dirname, '..');
const prisma = require('../api/_config/prisma');
const seoIntegration = require('../api/_services/seoIntegrationService');
const seoDashboardController = require('../api/_controllers/seoDashboardController');

const TEST_DOMAIN = 'www.hangbug.com';
const VALID_TEST_API_KEY = 'AIzaSyTestHangbugPageSpeedKey583797351490';

const origFetch = global.fetch;
const origSeoProjectConfig = prisma.seoProjectConfig;
const origSeoIntegrationSnapshot = prisma.seoIntegrationSnapshot;
const origEnv = {
    PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY,
    GOOGLE_PAGESPEED_API_KEY: process.env.GOOGLE_PAGESPEED_API_KEY,
    GOOGLE_CLOUD_PROJECT_NUMBER: process.env.GOOGLE_CLOUD_PROJECT_NUMBER
};

const mockDbConfigs = new Map();
const mockDbSnapshots = new Map();

function installMocks() {
    mockDbConfigs.clear();
    mockDbSnapshots.clear();
    seoIntegration.resetPageSpeedState();
    delete process.env.PAGESPEED_API_KEY;
    delete process.env.GOOGLE_PAGESPEED_API_KEY;
    delete process.env.GOOGLE_CLOUD_PROJECT_NUMBER;

    prisma.seoProjectConfig = {
        findUnique: async ({ where }) => mockDbConfigs.get(where.domain) || null,
        upsert: async ({ where, create, update }) => {
            const existing = mockDbConfigs.get(where.domain);
            const record = existing
                ? { ...existing, ...update, updatedAt: new Date() }
                : { id: 'mock-psi-cfg-id', ...create, createdAt: new Date(), updatedAt: new Date() };
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
    prisma.seoProjectConfig = origSeoProjectConfig;
    prisma.seoIntegrationSnapshot = origSeoIntegrationSnapshot;
    seoIntegration.resetPageSpeedState();
    for (const [k, v] of Object.entries(origEnv)) {
        if (v === undefined) delete process.env[k];
        else process.env[k] = v;
    }
}

function makeLighthousePayload({
    url = 'https://www.hangbug.com/',
    strategy = 'mobile',
    performance = 0.92,
    accessibility = 0.96,
    bestPractices = 0.95,
    seo = 1.0,
    lcpMs = 1750,
    clsVal = 0.02,
    tbtMs = 95,
    fcpMs = 1100,
    ttfbMs = 240
} = {}) {
    return {
        id: url,
        loadingExperience: {
            metrics: {
                INTERACTION_TO_NEXT_PAINT: { percentile: 110 }
            }
        },
        lighthouseResult: {
            requestedUrl: url,
            finalUrl: url,
            configSettings: { formFactor: strategy },
            categories: {
                performance: { score: performance },
                accessibility: { score: accessibility },
                'best-practices': { score: bestPractices },
                seo: { score: seo }
            },
            audits: {
                'largest-contentful-paint': { numericValue: lcpMs, displayValue: `${(lcpMs / 1000).toFixed(1)} s` },
                'cumulative-layout-shift': { numericValue: clsVal, displayValue: String(clsVal) },
                'first-contentful-paint': { numericValue: fcpMs, displayValue: `${(fcpMs / 1000).toFixed(1)} s` },
                'total-blocking-time': { numericValue: tbtMs, displayValue: `${tbtMs} ms` },
                'server-response-time': { numericValue: ttfbMs, displayValue: `${ttfbMs} ms` },
                'speed-index': { numericValue: 1600, displayValue: '1.6 s' },
                viewport: { title: 'Has a <meta name="viewport"> tag', score: 1 },
                'font-size': { title: 'Document uses legible font sizes', score: 1 },
                'tap-targets': { title: 'Tap targets are sized appropriately', score: 1 },
                'modern-image-formats': { title: 'Serve images in next-gen formats', score: 1 }
            }
        }
    };
}

function makeJsonResponse(body, status = 200, headersMap = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: {
            get: (name) => headersMap[String(name || '').toLowerCase()] ?? null
        },
        text: async () => JSON.stringify(body)
    };
}

function createMockRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
    return res;
}

test.beforeEach(() => {
    installMocks();
});

test.after(() => {
    restoreAll();
});

test('1. Valid API key configuration (PAGESPEED_API_KEY): Server-side only, never exposed in frontend or responses, never logged, project & API verified', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    process.env.GOOGLE_CLOUD_PROJECT_NUMBER = '583797351490';

    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const keyInfo = seoIntegration.resolvePageSpeedApiKey(config);

    assert.strictEqual(keyInfo.hasKey, true);
    assert.strictEqual(keyInfo.source, 'env:PAGESPEED_API_KEY');
    assert.strictEqual(keyInfo.key, VALID_TEST_API_KEY);

    const validation = seoIntegration.validatePageSpeedApiKey(keyInfo.key);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errorCategory, null);

    // Ensure sanitizeConfigForClient never exposes the raw key
    const sanitized = seoIntegration.sanitizeConfigForClient(config);
    const serialized = JSON.stringify(sanitized);
    assert.strictEqual(sanitized.pagespeedApiKey, undefined);
    assert.strictEqual(sanitized.hasPagespeedApiKey, true);
    assert.strictEqual(sanitized.pagespeedApiKeySource, 'env:PAGESPEED_API_KEY');
    assert.strictEqual(sanitized.integrations.pagespeedHasKey, true);
    assert.ok(!serialized.includes(VALID_TEST_API_KEY), 'API response must never contain PAGESPEED_API_KEY');

    // Ensure redaction scrubs any raw key occurrence from error logs or URLs
    const dirtyUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https%3A%2F%2Fwww.hangbug.com%2F&key=${VALID_TEST_API_KEY}`;
    const redacted = seoIntegration.redactPageSpeedApiKey(dirtyUrl, VALID_TEST_API_KEY);
    assert.ok(!redacted.includes(VALID_TEST_API_KEY), 'Redacted string must never contain the complete API key');
    assert.ok(redacted.includes('[REDACTED_API_KEY]'));

    // Verify frontend bundle files never read or expose PAGESPEED_API_KEY secret
    const frontendTech = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoTechnicalSection.jsx'), 'utf8');
    assert.ok(!frontendTech.includes(VALID_TEST_API_KEY));
    assert.ok(!frontendTech.includes('import.meta.env.VITE_PAGESPEED_API_KEY'));
});

test('2. Real homepage audit (https://www.hangbug.com/): Sends authenticated server-side request with PAGESPEED_API_KEY', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    let capturedRequestUrl = null;
    global.fetch = async (url) => {
        capturedRequestUrl = url;
        return makeJsonResponse(makeLighthousePayload({
            url: 'https://www.hangbug.com/',
            strategy: 'mobile',
            performance: 0.94
        }));
    };

    const result = await seoIntegration.runPageSpeedInsights(config, 'https://www.hangbug.com/', 'mobile', {
        throttleMs: 0
    });

    assert.ok(capturedRequestUrl, 'Should call Google PageSpeed Insights API');
    const parsedApiCall = new URL(capturedRequestUrl);
    assert.strictEqual(parsedApiCall.origin + parsedApiCall.pathname, 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    assert.strictEqual(parsedApiCall.searchParams.get('url'), 'https://www.hangbug.com/');
    assert.strictEqual(parsedApiCall.searchParams.get('strategy'), 'mobile');
    assert.strictEqual(parsedApiCall.searchParams.get('key'), VALID_TEST_API_KEY);

    assert.strictEqual(result.fromCache, false);
    assert.strictEqual(result.mobile.url, 'https://www.hangbug.com/');
    assert.strictEqual(result.mobile.path, '/');
    assert.strictEqual(result.mobile.scores.performance, 94);
    assert.strictEqual(result.mobile.coreWebVitals.lcp.status, 'Good');

    // Ensure returned payload never contains the raw API key
    assert.ok(!JSON.stringify(result).includes(VALID_TEST_API_KEY));
});

test('3. Mobile audit & 4. Desktop audit: Both strategies are audited, cached independently by URL & strategy, and preserved together', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    const calls = [];
    global.fetch = async (url) => {
        const u = new URL(url);
        const strategy = u.searchParams.get('strategy');
        const target = u.searchParams.get('url');
        calls.push({ target, strategy });

        return makeJsonResponse(makeLighthousePayload({
            url: target,
            strategy,
            performance: strategy === 'mobile' ? 0.89 : 0.98
        }));
    };

    // 3. Mobile audit on prioritized technology page
    const mobileRes = await seoIntegration.runPageSpeedInsights(
        config,
        '/technologies/javascript',
        'mobile',
        { throttleMs: 0 }
    );
    assert.strictEqual(mobileRes.mobile.strategy, 'mobile');
    assert.strictEqual(mobileRes.mobile.url, 'https://www.hangbug.com/technologies/javascript');
    assert.strictEqual(mobileRes.mobile.scores.performance, 89);

    // 4. Desktop audit on the same prioritized technology page
    const desktopRes = await seoIntegration.runPageSpeedInsights(
        config,
        '/technologies/javascript',
        'desktop',
        { throttleMs: 0 }
    );
    assert.strictEqual(desktopRes.desktop.strategy, 'desktop');
    assert.strictEqual(desktopRes.desktop.url, 'https://www.hangbug.com/technologies/javascript');
    assert.strictEqual(desktopRes.desktop.scores.performance, 98);

    // Verify both mobile and desktop are preserved in byPath & byUrl cache for /technologies/javascript
    const entry = desktopRes.byPath['/technologies/javascript'];
    assert.ok(entry, 'Expected cached entry for /technologies/javascript');
    assert.strictEqual(entry.mobile.scores.performance, 89);
    assert.strictEqual(entry.desktop.scores.performance, 98);
    assert.strictEqual(calls.length, 2);
});

test('5. Cache retrieval (24-hour TTL): Returns cached report without calling Google API and allows forced manual refresh', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    let apiCallCount = 0;
    global.fetch = async (url) => {
        apiCallCount++;
        return makeJsonResponse(makeLighthousePayload({
            url: new URL(url).searchParams.get('url'),
            strategy: 'mobile',
            performance: apiCallCount === 1 ? 0.91 : 0.95
        }));
    };

    // First run fetches live and caches for 24h
    const first = await seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 });
    assert.strictEqual(apiCallCount, 1);
    assert.strictEqual(first.fromCache, false);
    assert.strictEqual(first.mobile.scores.performance, 91);

    const ttlMs = Date.parse(first.mobile.expiresAt) - Date.parse(first.mobile.checkedAt);
    assert.ok(ttlMs >= 24 * 60 * 60 * 1000, 'Cache TTL must be at least 24 hours');

    // Second run within 24 hours retrieves from cache without calling Google API
    const second = await seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 });
    assert.strictEqual(apiCallCount, 1, 'Must NOT call Google API when valid 24h cache exists');
    assert.strictEqual(second.fromCache, true);
    assert.strictEqual(second.cacheStatus, 'cached');
    assert.strictEqual(second.mobile.scores.performance, 91);

    // Manual refresh with confirmation (forceRefresh: true) fetches fresh data
    const refreshed = await seoIntegration.runPageSpeedInsights(config, '/', 'mobile', {
        forceRefresh: true,
        throttleMs: 0
    });
    assert.strictEqual(apiCallCount, 2, 'Manual forceRefresh must trigger a fresh API request');
    assert.strictEqual(refreshed.fromCache, false);
    assert.strictEqual(refreshed.mobile.scores.performance, 95);
});

test('6. Duplicate request prevention: Simultaneous requests for the same URL and strategy share a single Google API call', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    let networkCalls = 0;
    global.fetch = async (url) => {
        networkCalls++;
        await new Promise((r) => setTimeout(r, 40));
        return makeJsonResponse(makeLighthousePayload({
            url: new URL(url).searchParams.get('url'),
            strategy: 'mobile',
            performance: 0.93
        }));
    };

    const [resA, resB, resC] = await Promise.all([
        seoIntegration.runPageSpeedInsights(config, '/games/memory-match', 'mobile', { throttleMs: 0 }),
        seoIntegration.runPageSpeedInsights(config, '/games/memory-match', 'mobile', { throttleMs: 0 }),
        seoIntegration.runPageSpeedInsights(config, '/games/memory-match', 'mobile', { throttleMs: 0 })
    ]);

    assert.strictEqual(networkCalls, 1, 'Simultaneous duplicate requests must trigger only 1 outbound Google API request');
    assert.strictEqual(resA.mobile.scores.performance, 93);
    assert.strictEqual(resB.mobile.scores.performance, 93);
    assert.strictEqual(resC.mobile.scores.performance, 93);
    assert.ok(resB.deduplicated || resC.deduplicated, 'Concurrent duplicate requests must be marked deduplicated');
});

test('7. HTTP 429 handling: Distinguishes daily quota exhaustion (project 583797351490) vs requests-per-minute limit, never retries daily quota, and preserves cached reports without zero scores', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    // Seed a cached homepage report first so we can verify cached reports remain available when quota is exhausted
    global.fetch = async () => makeJsonResponse(makeLighthousePayload({
        url: 'https://www.hangbug.com/',
        strategy: 'mobile',
        performance: 0.90
    }));
    await seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 });

    // Now simulate Google's exact HTTP 429 daily quota exhaustion error for project 583797351490 on a new URL
    let dailyQuotaAttempts = 0;
    global.fetch = async () => {
        dailyQuotaAttempts++;
        return makeJsonResponse({
            error: {
                code: 429,
                message: "Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com' for consumer 'project_number:583797351490'.",
                status: 'RESOURCE_EXHAUSTED',
                details: [
                    {
                        '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
                        reason: 'RATE_LIMIT_EXCEEDED',
                        domain: 'googleapis.com',
                        metadata: {
                            quota_unit: '1/d/{project}',
                            quota_limit: 'defaultPerDayPerProject',
                            service: 'pagespeedonline.googleapis.com',
                            consumer: 'projects/583797351490'
                        }
                    }
                ]
            }
        }, 429);
    };

    const req = {
        body: {
            domain: TEST_DOMAIN,
            url: '/blog',
            strategy: 'mobile'
        }
    };
    const res = createMockRes();
    await seoDashboardController.runPageSpeed(req, res);

    assert.strictEqual(res.statusCode, 429);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.errorCategory, 'daily_quota_exceeded');
    assert.strictEqual(res.body.isQuotaError, true);
    assert.strictEqual(res.body.isDailyQuota, true);
    assert.strictEqual(res.body.projectNumber, '583797351490');
    assert.strictEqual(
        res.body.userMessage,
        'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.'
    );
    assert.ok(res.body.nextRetryAt, 'Must provide nextRetryAt timestamp when daily quota resets');
    assert.strictEqual(dailyQuotaAttempts, 1, 'Must NOT retry a daily quota exhaustion error');

    // Previously cached homepage report must still be intact and never converted into 0 score
    assert.strictEqual(res.body.hasCachedReport, true);
    assert.strictEqual(res.body.pagespeed.mobile.scores.performance, 90);
    assert.notStrictEqual(res.body.pagespeed.mobile.scores.performance, 0);

    // Subsequent call while daily quota is exhausted must NOT hit Google API at all
    const resSecond = createMockRes();
    await seoDashboardController.runPageSpeed(req, resSecond);
    assert.strictEqual(resSecond.statusCode, 429);
    assert.strictEqual(resSecond.body.errorCategory, 'daily_quota_exceeded');
    assert.strictEqual(dailyQuotaAttempts, 1, 'Daily quota lockout must prevent repeated API calls before reset');

    // Also verify requests-per-minute rate limit classification & exponential backoff retry
    seoIntegration.resetPageSpeedState();
    mockDbSnapshots.clear();
    let rpmAttempts = 0;
    global.fetch = async () => {
        rpmAttempts++;
        if (rpmAttempts === 1) {
            return makeJsonResponse({
                error: {
                    code: 429,
                    message: "Quota exceeded for quota metric 'Queries' and limit 'Queries per minute' of service 'pagespeedonline.googleapis.com'.",
                    status: 'RESOURCE_EXHAUSTED'
                }
            }, 429, { 'retry-after': '1' });
        }
        return makeJsonResponse(makeLighthousePayload({
            url: 'https://www.hangbug.com/blog',
            strategy: 'mobile',
            performance: 0.88
        }));
    };

    const rpmRecovered = await seoIntegration.runPageSpeedInsights(config, '/blog', 'mobile', {
        throttleMs: 0,
        baseBackoffMs: 10,
        maxRetries: 2
    });
    assert.strictEqual(rpmAttempts, 2, 'Temporary per-minute rate limit should retry with exponential backoff');
    assert.strictEqual(rpmRecovered.mobile.scores.performance, 88);
});

test('8. Invalid API key handling & API disabled / wrong project verification', async () => {
    // 8a. Malformed key format rejected before calling Google
    process.env.PAGESPEED_API_KEY = 'bad_short_key';
    let config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    let fetchCalled = false;
    global.fetch = async () => {
        fetchCalled = true;
        return makeJsonResponse({});
    };

    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'invalid_api_key');
            assert.strictEqual(err.status, 400);
            return true;
        }
    );
    assert.strictEqual(fetchCalled, false, 'Must not call Google with a malformed API key');

    // 8b. Google returns API_KEY_INVALID
    process.env.PAGESPEED_API_KEY = 'AIzaSyInvalidKeyRejectedByGoogle123456';
    config = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    global.fetch = async () => makeJsonResponse({
        error: {
            code: 400,
            message: 'API key not valid. Please pass a valid API key.',
            status: 'INVALID_ARGUMENT',
            details: [{ reason: 'API_KEY_INVALID', domain: 'googleapis.com' }]
        }
    }, 400);

    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'invalid_api_key');
            assert.strictEqual(err.retryable, false);
            assert.ok(!err.message.includes('AIzaSyInvalidKeyRejectedByGoogle123456'));
            return true;
        }
    );

    // 8c. PageSpeed Insights API disabled in Google Cloud project
    global.fetch = async () => makeJsonResponse({
        error: {
            code: 403,
            message: 'PageSpeed Insights API has not been used in project 583797351490 before or it is disabled.',
            status: 'PERMISSION_DENIED',
            details: [
                {
                    reason: 'SERVICE_DISABLED',
                    metadata: {
                        consumer: 'projects/583797351490',
                        service: 'pagespeedonline.googleapis.com'
                    }
                }
            ]
        }
    }, 403);

    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(config, '/', 'mobile', { throttleMs: 0 }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'api_disabled');
            assert.strictEqual(err.apiEnabled, false);
            assert.strictEqual(err.projectNumber, '583797351490');
            return true;
        }
    );
});

test('9. Missing API key handling & Invalid URL handling', async () => {
    delete process.env.PAGESPEED_API_KEY;
    delete process.env.GOOGLE_PAGESPEED_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    let googleCalled = false;
    global.fetch = async () => {
        googleCalled = true;
        return makeJsonResponse({});
    };

    const req = {
        body: {
            domain: TEST_DOMAIN,
            url: '/',
            strategy: 'mobile'
        }
    };
    const res = createMockRes();
    await seoDashboardController.runPageSpeed(req, res);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.errorCategory, 'missing_api_key');
    assert.strictEqual(googleCalled, false, 'Must NEVER send unauthenticated requests to Google shared project 583797351490 when key is missing');
    assert.ok(res.body.userMessage.includes('PAGESPEED_API_KEY'));

    // Also test invalid URL handling
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const updatedConfig = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(updatedConfig, 'https://evil-external-site.com/', 'mobile', { throttleMs: 0 }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'invalid_url');
            assert.strictEqual(err.status, 400);
            return true;
        }
    );
});

test('10. Request throttling, network error backoff, prioritized URLs, and no automatic PageSpeed run on dashboard load', async () => {
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const config = await seoIntegration.getProjectConfig(TEST_DOMAIN);

    // 10a. Network error with exponential backoff
    let netAttempts = 0;
    global.fetch = async () => {
        netAttempts++;
        throw new Error('fetch failed: ETIMEDOUT connecting to pagespeedonline.googleapis.com');
    };

    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(config, '/', 'mobile', {
            throttleMs: 0,
            baseBackoffMs: 5,
            maxRetries: 1
        }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'network_error');
            assert.strictEqual(err.status, 503);
            assert.ok(err.nextRetryAt);
            return true;
        }
    );
    assert.strictEqual(netAttempts, 2, 'Network error should retry up to maxRetries with exponential backoff');

    // 10b. Request throttling per-minute limit
    seoIntegration.resetPageSpeedState();
    mockDbSnapshots.clear();
    global.fetch = async (url) => makeJsonResponse(makeLighthousePayload({
        url: new URL(url).searchParams.get('url'),
        strategy: 'mobile',
        performance: 0.91
    }));

    await seoIntegration.runPageSpeedInsights(config, '/', 'mobile', {
        throttleMs: 0,
        maxRequestsPerMinute: 1
    });

    await assert.rejects(
        () => seoIntegration.runPageSpeedInsights(config, '/technologies', 'mobile', {
            throttleMs: 0,
            maxRequestsPerMinute: 1,
            maxRetries: 0
        }),
        (err) => {
            assert.strictEqual(err.errorCategory, 'rate_limit_exceeded');
            assert.strictEqual(err.status, 429);
            assert.ok(err.nextRetryAt);
            return true;
        }
    );

    // 10c. Opening SEO dashboard does NOT trigger live PageSpeed API requests and returns prioritized auditable URLs
    let psiApiCalledOnDashboardLoad = false;
    global.fetch = async (url) => {
        if (String(url).includes('pagespeedonline.googleapis.com')) {
            psiApiCalledOnDashboardLoad = true;
        }
        return makeJsonResponse({}, 200);
    };

    const dashView = seoIntegration.buildPageSpeedDashboardView({
        config,
        pagespeedSnap: await seoIntegration.getSnapshot(TEST_DOMAIN, 'pagespeed')
    });
    assert.strictEqual(psiApiCalledOnDashboardLoad, false, 'Opening SEO dashboard must NEVER automatically run PageSpeed audits');
    assert.ok(Array.isArray(dashView.auditableUrls) && dashView.auditableUrls.length >= 10);

    const categories = new Set(dashView.auditableUrls.map((u) => u.category));
    assert.ok(categories.has('Homepage'), 'Must prioritize Homepage');
    assert.ok(categories.has('Important Technology Pages'), 'Must prioritize Important Technology Pages');
    assert.ok(categories.has('Published Blog Articles'), 'Must prioritize Published Blog Articles');
    assert.ok(categories.has('Important Public Game Pages'), 'Must prioritize Important Public Game Pages');
});

test('11. Test PageSpeed Connection tests both Mobile & Desktop live for https://www.hangbug.com/, updates accurate connection status, and never exposes API key', async () => {
    // Unconfigured state
    delete process.env.PAGESPEED_API_KEY;
    delete process.env.GOOGLE_PAGESPEED_API_KEY;
    const unconfiguredCfg = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const unconfiguredSanitized = seoIntegration.sanitizeConfigForClient(unconfiguredCfg);
    assert.strictEqual(unconfiguredSanitized.pagespeedConnected, false);
    assert.strictEqual(unconfiguredSanitized.pagespeedConnectionStatus, 'Not Configured');

    // Configured but not tested yet
    process.env.PAGESPEED_API_KEY = VALID_TEST_API_KEY;
    const configuredCfg = await seoIntegration.getProjectConfig(TEST_DOMAIN);
    const configuredSanitized = seoIntegration.sanitizeConfigForClient(configuredCfg);
    assert.strictEqual(configuredSanitized.hasPagespeedApiKey, true);
    assert.strictEqual(configuredSanitized.pagespeedConnected, false);
    assert.strictEqual(configuredSanitized.pagespeedConnectionStatus, 'Configured (Not Tested)');

    // Seed a stale/cached mobile report first to verify Test Connection forces live API calls for BOTH mobile & desktop
    global.fetch = async () => makeJsonResponse(makeLighthousePayload({
        url: 'https://www.hangbug.com/',
        strategy: 'mobile',
        performance: 0.71
    }));
    await seoIntegration.runPageSpeedInsights(configuredCfg, 'https://www.hangbug.com/', 'mobile', { throttleMs: 0 });

    const liveCalls = [];
    global.fetch = async (url) => {
        const parsed = new URL(url);
        const strategy = parsed.searchParams.get('strategy');
        liveCalls.push({
            endpoint: `${parsed.origin}${parsed.pathname}`,
            target: parsed.searchParams.get('url'),
            strategy,
            key: parsed.searchParams.get('key')
        });
        return makeJsonResponse(makeLighthousePayload({
            url: 'https://www.hangbug.com/',
            strategy,
            performance: strategy === 'mobile' ? 0.84 : 0.97
        }));
    };

    const testResult = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'pagespeed', {
        throttleMs: 0
    });

    assert.strictEqual(testResult.ok, true);
    assert.strictEqual(testResult.connectionStatus, 'Connected');
    assert.strictEqual(testResult.apiEnabled, true);
    assert.strictEqual(testResult.fromCache, false);
    assert.strictEqual(testResult.targetUrl, 'https://www.hangbug.com/');
    assert.deepStrictEqual(testResult.testedStrategies, ['mobile', 'desktop']);
    assert.strictEqual(testResult.mobilePerformance, 84);
    assert.strictEqual(testResult.desktopPerformance, 97);
    assert.ok(!JSON.stringify(testResult).includes(VALID_TEST_API_KEY), 'Connection test response must never expose API key');

    assert.strictEqual(liveCalls.length, 2, 'Test PageSpeed Connection must test BOTH mobile and desktop live');
    assert.ok(liveCalls.every((c) => c.endpoint === 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'));
    assert.ok(liveCalls.every((c) => c.target === 'https://www.hangbug.com/'));
    assert.ok(liveCalls.every((c) => c.key === VALID_TEST_API_KEY));
    assert.ok(liveCalls.some((c) => c.strategy === 'mobile'));
    assert.ok(liveCalls.some((c) => c.strategy === 'desktop'));

    const postSnap = await seoIntegration.getSnapshot(TEST_DOMAIN, 'pagespeed');
    const postSanitized = seoIntegration.sanitizeConfigForClient(configuredCfg, null, null, null, postSnap);
    assert.strictEqual(postSanitized.pagespeedConnected, true);
    assert.strictEqual(postSanitized.pagespeedConnectionStatus, 'Connected');
    assert.strictEqual(postSanitized.pagespeedApiEnabled, true);
    assert.strictEqual(postSanitized.pagespeedMobilePerformance, 84);
    assert.strictEqual(postSanitized.pagespeedDesktopPerformance, 97);

    // Meaningful errors from testIntegrationConnection for API disabled & invalid key
    global.fetch = async () => makeJsonResponse({
        error: {
            code: 403,
            message: 'PageSpeed Insights API has not been used in project 123456 before or it is disabled.',
            status: 'PERMISSION_DENIED',
            details: [{ reason: 'SERVICE_DISABLED', metadata: { consumer: 'projects/123456' } }]
        }
    }, 403);
    const disabledRes = await seoIntegration.testIntegrationConnection(TEST_DOMAIN, 'pagespeed', { throttleMs: 0 });
    assert.strictEqual(disabledRes.ok, false);
    assert.strictEqual(disabledRes.errorCategory, 'api_disabled');
    assert.strictEqual(disabledRes.connectionStatus, 'API Not Enabled');
    assert.strictEqual(disabledRes.apiEnabled, false);

    // Verify Web & Mobile UI do not hardcode "PageSpeed: Ready" and expose "Test PageSpeed Connection"
    const webOverview = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoOverviewSection.jsx'), 'utf8');
    const webSettings = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoSettingsSection.jsx'), 'utf8');
    const webTechnical = fs.readFileSync(path.join(ROOT, 'src/components/seo/SeoTechnicalSection.jsx'), 'utf8');
    const mobilePrimary = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_primary.dart'), 'utf8');
    const mobileSecondary = fs.readFileSync(path.join(ROOT, 'mobile/lib/screens/admin/seo/widgets/seo_sections_secondary.dart'), 'utf8');

    assert.ok(!webOverview.includes('PageSpeed: Ready'), 'Web Overview must display real status instead of hardcoded PageSpeed: Ready');
    assert.ok(!mobilePrimary.includes('PageSpeed: Ready'), 'Mobile Overview must display real status instead of hardcoded PageSpeed: Ready');
    assert.ok(webSettings.includes('Test PageSpeed Connection'));
    assert.ok(webTechnical.includes('Test PageSpeed Connection'));
    assert.ok(mobileSecondary.includes('Test PageSpeed Connection'));
});

