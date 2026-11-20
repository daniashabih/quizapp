const { JWT } = require('google-auth-library');
const prisma = require('../_config/prisma');

const DEFAULT_DOMAIN = 'www.hangbug.com';
const DEFAULT_SITE_URL = 'https://www.hangbug.com';
const DEFAULT_GSC_PROPERTY = 'sc-domain:hangbug.com';
const DEFAULT_GA4_MEASUREMENT_ID = 'G-BSZBBFZZH0';
const DEFAULT_GA4_STREAM_ID = '16254821680';
const GSC_READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const VERIFIED_GSC_PERMISSION_LEVELS = new Set([
    'siteOwner',
    'siteFullUser',
    'siteRestrictedUser'
]);

// In-memory fallback stores if Prisma client is not yet regenerated or DB is offline in tests
const memoryConfigs = new Map();
const memorySnapshots = new Map();
const memoryVerifications = new Map();

function normalizeDomain(input) {
    const raw = String(input || DEFAULT_DOMAIN).trim().toLowerCase();
    return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || DEFAULT_DOMAIN;
}

function buildSiteUrl(domain) {
    const clean = normalizeDomain(domain);
    return `https://${clean}`;
}

/**
 * Normalizes a Search Console property identifier.
 * - Domain properties ALWAYS use the exact `sc-domain:<root-domain>` format (e.g. `sc-domain:hangbug.com`)
 *   and are NEVER converted into `http://...` or `https://...`.
 * - Bare domains without a scheme (e.g. `hangbug.com` or `www.hangbug.com`) are treated as Domain properties
 *   (`sc-domain:hangbug.com`), never `http://hangbug.com`.
 * - Explicit URL-prefix properties starting with `https://` or `http://` preserve their scheme and trailing slash.
 */
function normalizeGscPropertyIdentifier(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';

    if (/^sc-domain:/i.test(raw)) {
        let domainPart = raw
            .replace(/^sc-domain:\s*/i, '')
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '');
        if (domainPart === 'www.hangbug.com') {
            domainPart = 'hangbug.com';
        }
        return domainPart ? `sc-domain:${domainPart}` : DEFAULT_GSC_PROPERTY;
    }

    if (/^https?:\/\//i.test(raw)) {
        // Explicit URL-prefix property; never allow accidental http://hangbug.com when Hangbug uses sc-domain:hangbug.com
        try {
            const parsed = new URL(raw);
            if (!parsed.pathname || parsed.pathname === '/') {
                return `${parsed.protocol}//${parsed.host}/`;
            }
            return parsed.toString();
        } catch {
            return raw;
        }
    }

    // Bare domain (e.g. "hangbug.com"): format as Domain property sc-domain:hangbug.com, NEVER http://hangbug.com
    let bareDomain = raw.toLowerCase().replace(/\/.*$/, '');
    if (bareDomain === 'www.hangbug.com') {
        bareDomain = 'hangbug.com';
    }
    return bareDomain ? `sc-domain:${bareDomain}` : DEFAULT_GSC_PROPERTY;
}

function isLegacyHangbugUrlCandidate(rawProperty) {
    const s = String(rawProperty || '').trim().toLowerCase().replace(/\/+$/, '');
    return (
        !s
        || s === 'hangbug.com'
        || s === 'www.hangbug.com'
        || s === 'http://hangbug.com'
        || s === 'https://hangbug.com'
        || s === 'http://www.hangbug.com'
        || s === 'https://www.hangbug.com'
        || s === 'sc-domain:hangbug.com'
        || s === 'sc-domain:www.hangbug.com'
    );
}

function maskEmail(email) {
    const raw = String(email || '').trim();
    if (!raw || !raw.includes('@')) return '';
    const [local, host] = raw.split('@');
    if (local.length <= 3) return `***@${host}`;
    return `${local.slice(0, 3)}***@${host}`;
}

function isMaskedPlaceholder(value) {
    const s = String(value || '').trim();
    return s.startsWith('••••') || s === '********';
}

function getEnvDefaults(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    return {
        domain: cleanDomain,
        projectName: 'Hangbug',
        siteUrl: buildSiteUrl(cleanDomain),
        gscProperty: normalizeGscPropertyIdentifier(process.env.GSC_SITE_URL || DEFAULT_GSC_PROPERTY),
        ga4PropertyId: String(process.env.GA4_PROPERTY_ID || '').trim(),
        ga4MeasurementId: String(process.env.GA4_MEASUREMENT_ID || DEFAULT_GA4_MEASUREMENT_ID).trim(),
        googleServiceAccountEmail: String(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GSC_CLIENT_EMAIL || ''
        ).trim(),
        googlePrivateKey: String(
            process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GSC_PRIVATE_KEY || ''
        ).trim(),
        googleAccessToken: String(process.env.GSC_ACCESS_TOKEN || '').trim(),
        pagespeedApiKey: String(
            process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || ''
        ).trim(),
        keywordProvider: String(process.env.SEO_KEYWORD_PROVIDER || 'none').trim().toLowerCase(),
        keywordProviderKey: String(process.env.SEO_KEYWORD_PROVIDER_KEY || '').trim(),
        backlinkProvider: String(
            process.env.OPENPAGERANK_API_KEY ? 'openpagerank' : (process.env.SEO_BACKLINK_PROVIDER || 'none')
        ).trim().toLowerCase(),
        backlinkProviderKey: String(
            process.env.OPENPAGERANK_API_KEY || process.env.SEO_BACKLINK_PROVIDER_KEY || ''
        ).trim(),
        aiVisibilityProvider: String(process.env.SEO_AI_VISIBILITY_PROVIDER || 'none').trim().toLowerCase(),
        aiVisibilityProviderKey: String(process.env.SEO_AI_VISIBILITY_PROVIDER_KEY || '').trim(),
        crawlFrequency: 'daily',
        maxCrawlPages: 60
    };
}

async function getProjectConfig(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    const envDefaults = getEnvDefaults(cleanDomain);
    let dbRecord = null;

    try {
        if (prisma && prisma.seoProjectConfig && typeof prisma.seoProjectConfig.findUnique === 'function') {
            dbRecord = await prisma.seoProjectConfig.findUnique({
                where: { domain: cleanDomain }
            });
        }
    } catch {
        dbRecord = null;
    }

    if (!dbRecord && memoryConfigs.has(cleanDomain)) {
        dbRecord = memoryConfigs.get(cleanDomain);
    }

    const merged = {
        ...envDefaults,
        ...(dbRecord || {}),
        domain: cleanDomain,
        siteUrl: (dbRecord?.siteUrl || envDefaults.siteUrl).replace(/\/+$/, ''),
        gscProperty: normalizeGscPropertyIdentifier(dbRecord?.gscProperty || envDefaults.gscProperty || DEFAULT_GSC_PROPERTY),
        rawGscProperty: dbRecord?.gscProperty || envDefaults.gscProperty || DEFAULT_GSC_PROPERTY,
        ga4PropertyId: dbRecord?.ga4PropertyId || envDefaults.ga4PropertyId,
        ga4MeasurementId: dbRecord?.ga4MeasurementId || envDefaults.ga4MeasurementId,
        googleServiceAccountEmail: dbRecord?.googleServiceAccountEmail || envDefaults.googleServiceAccountEmail,
        googlePrivateKey: dbRecord?.googlePrivateKey || envDefaults.googlePrivateKey,
        googleAccessToken: dbRecord?.googleAccessToken || envDefaults.googleAccessToken,
        pagespeedApiKey: dbRecord?.pagespeedApiKey || envDefaults.pagespeedApiKey,
        keywordProvider: dbRecord?.keywordProvider || envDefaults.keywordProvider,
        keywordProviderKey: dbRecord?.keywordProviderKey || envDefaults.keywordProviderKey,
        backlinkProvider: dbRecord?.backlinkProvider || envDefaults.backlinkProvider,
        backlinkProviderKey: dbRecord?.backlinkProviderKey || envDefaults.backlinkProviderKey,
        aiVisibilityProvider: dbRecord?.aiVisibilityProvider || envDefaults.aiVisibilityProvider,
        aiVisibilityProviderKey: dbRecord?.aiVisibilityProviderKey || envDefaults.aiVisibilityProviderKey,
        crawlFrequency: dbRecord?.crawlFrequency || envDefaults.crawlFrequency,
        maxCrawlPages: Number(dbRecord?.maxCrawlPages) || envDefaults.maxCrawlPages
    };

    return merged;
}

function sanitizeConfigForClient(config, verificationInput = null) {
    const cleanDomain = normalizeDomain(config.domain);
    const verification = verificationInput || memoryVerifications.get(cleanDomain) || null;
    const hasGoogleServiceAccount = Boolean(config.googleServiceAccountEmail && config.googlePrivateKey);
    const hasGoogleCredentials = hasGoogleServiceAccount || Boolean(config.googleAccessToken);
    const resolvedProperty = verification?.selectedProperty
        || normalizeGscPropertyIdentifier(config.gscProperty)
        || DEFAULT_GSC_PROPERTY;

    // Do not display a successful connection merely because JSON credentials exist; require verified property access
    const gscPropertyVerified = verification ? Boolean(verification.propertyVerified) : false;
    const gscAuthStatus = verification?.authStatus
        || (hasGoogleCredentials ? 'Credentials Saved (Click Test GSC to verify)' : 'Not Configured');
    const ga4Configured = Boolean(hasGoogleCredentials && config.ga4PropertyId);

    return {
        domain: config.domain,
        projectName: config.projectName || 'Hangbug',
        siteUrl: config.siteUrl || buildSiteUrl(config.domain),
        gscProperty: resolvedProperty,
        gscAuthStatus,
        gscAuthenticated: Boolean(verification?.authenticated),
        gscPropertyVerified,
        gscPermissionLevel: verification?.permissionLevel || null,
        gscAvailableProperties: Array.isArray(verification?.availableProperties) ? verification.availableProperties : [],
        gscVerificationMessage: verification?.message || '',
        ga4PropertyId: config.ga4PropertyId || '',
        ga4MeasurementId: config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID,
        ga4StreamId: DEFAULT_GA4_STREAM_ID,
        googleServiceAccountEmail: config.googleServiceAccountEmail || '',
        googleServiceAccountEmailMasked: maskEmail(config.googleServiceAccountEmail),
        hasGoogleServiceAccount,
        hasGoogleAccessToken: Boolean(config.googleAccessToken),
        hasGoogleCredentials,
        hasPagespeedApiKey: Boolean(config.pagespeedApiKey),
        keywordProvider: config.keywordProvider || 'none',
        hasKeywordProviderKey: Boolean(config.keywordProviderKey),
        backlinkProvider: config.backlinkProvider || 'none',
        hasBacklinkProviderKey: Boolean(config.backlinkProviderKey),
        aiVisibilityProvider: config.aiVisibilityProvider || 'none',
        hasAiVisibilityProviderKey: Boolean(config.aiVisibilityProviderKey),
        crawlFrequency: config.crawlFrequency || 'daily',
        maxCrawlPages: Number(config.maxCrawlPages) || 60,
        integrations: {
            gscConnected: gscPropertyVerified,
            gscAuthenticated: Boolean(verification?.authenticated),
            gscPermissionLevel: verification?.permissionLevel || null,
            ga4Connected: ga4Configured,
            ga4TagMeasurementId: config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID,
            pagespeedReady: true,
            pagespeedHasKey: Boolean(config.pagespeedApiKey),
            keywordProviderConnected: config.keywordProvider !== 'none' && Boolean(config.keywordProviderKey),
            backlinkProviderConnected: config.backlinkProvider !== 'none' && Boolean(config.backlinkProviderKey),
            aiVisibilityConnected: config.aiVisibilityProvider !== 'none' && Boolean(config.aiVisibilityProviderKey)
        },
        updatedAt: config.updatedAt || null
    };
}

async function saveProjectConfig(domain, updates = {}) {
    const cleanDomain = normalizeDomain(domain);
    const current = await getProjectConfig(cleanDomain);

    const next = {
        domain: cleanDomain,
        projectName: updates.projectName !== undefined ? String(updates.projectName).trim() || 'Hangbug' : current.projectName,
        siteUrl: updates.siteUrl !== undefined ? String(updates.siteUrl).trim().replace(/\/+$/, '') || buildSiteUrl(cleanDomain) : current.siteUrl,
        gscProperty: updates.gscProperty !== undefined
            ? (normalizeGscPropertyIdentifier(updates.gscProperty) || DEFAULT_GSC_PROPERTY)
            : (normalizeGscPropertyIdentifier(current.gscProperty) || DEFAULT_GSC_PROPERTY),
        ga4PropertyId: updates.ga4PropertyId !== undefined ? String(updates.ga4PropertyId).trim() : current.ga4PropertyId,
        ga4MeasurementId: updates.ga4MeasurementId !== undefined ? String(updates.ga4MeasurementId).trim() || DEFAULT_GA4_MEASUREMENT_ID : current.ga4MeasurementId,
        googleServiceAccountEmail: updates.googleServiceAccountEmail !== undefined
            ? (isMaskedPlaceholder(updates.googleServiceAccountEmail) ? current.googleServiceAccountEmail : String(updates.googleServiceAccountEmail).trim())
            : current.googleServiceAccountEmail,
        googlePrivateKey: updates.googlePrivateKey !== undefined
            ? (updates.clearGooglePrivateKey ? '' : (isMaskedPlaceholder(updates.googlePrivateKey) || !String(updates.googlePrivateKey).trim() ? current.googlePrivateKey : String(updates.googlePrivateKey).trim()))
            : current.googlePrivateKey,
        googleAccessToken: updates.googleAccessToken !== undefined
            ? (updates.clearGoogleAccessToken ? '' : (isMaskedPlaceholder(updates.googleAccessToken) || !String(updates.googleAccessToken).trim() ? current.googleAccessToken : String(updates.googleAccessToken).trim()))
            : current.googleAccessToken,
        pagespeedApiKey: updates.pagespeedApiKey !== undefined
            ? (updates.clearPagespeedApiKey ? '' : (isMaskedPlaceholder(updates.pagespeedApiKey) || !String(updates.pagespeedApiKey).trim() ? current.pagespeedApiKey : String(updates.pagespeedApiKey).trim()))
            : current.pagespeedApiKey,
        keywordProvider: updates.keywordProvider !== undefined ? String(updates.keywordProvider).trim().toLowerCase() : current.keywordProvider,
        keywordProviderKey: updates.keywordProviderKey !== undefined
            ? (updates.clearKeywordProviderKey ? '' : (isMaskedPlaceholder(updates.keywordProviderKey) || !String(updates.keywordProviderKey).trim() ? current.keywordProviderKey : String(updates.keywordProviderKey).trim()))
            : current.keywordProviderKey,
        backlinkProvider: updates.backlinkProvider !== undefined ? String(updates.backlinkProvider).trim().toLowerCase() : current.backlinkProvider,
        backlinkProviderKey: updates.backlinkProviderKey !== undefined
            ? (updates.clearBacklinkProviderKey ? '' : (isMaskedPlaceholder(updates.backlinkProviderKey) || !String(updates.backlinkProviderKey).trim() ? current.backlinkProviderKey : String(updates.backlinkProviderKey).trim()))
            : current.backlinkProviderKey,
        aiVisibilityProvider: updates.aiVisibilityProvider !== undefined ? String(updates.aiVisibilityProvider).trim().toLowerCase() : current.aiVisibilityProvider,
        aiVisibilityProviderKey: updates.aiVisibilityProviderKey !== undefined
            ? (updates.clearAiVisibilityProviderKey ? '' : (isMaskedPlaceholder(updates.aiVisibilityProviderKey) || !String(updates.aiVisibilityProviderKey).trim() ? current.aiVisibilityProviderKey : String(updates.aiVisibilityProviderKey).trim()))
            : current.aiVisibilityProviderKey,
        crawlFrequency: ['hourly', 'daily', 'weekly', 'manual'].includes(updates.crawlFrequency) ? updates.crawlFrequency : current.crawlFrequency,
        maxCrawlPages: updates.maxCrawlPages !== undefined ? Math.min(120, Math.max(10, parseInt(updates.maxCrawlPages, 10) || 60)) : current.maxCrawlPages
    };

    // Allow pasting full Google Service Account JSON directly
    if (updates.googleServiceAccountJson && String(updates.googleServiceAccountJson).trim()) {
        try {
            const parsedJson = JSON.parse(String(updates.googleServiceAccountJson).trim());
            if (parsedJson.client_email) next.googleServiceAccountEmail = String(parsedJson.client_email).trim();
            if (parsedJson.private_key) next.googlePrivateKey = String(parsedJson.private_key).trim();
        } catch {
            throw new Error('Invalid Google Service Account JSON format.');
        }
    }

    try {
        if (prisma && prisma.seoProjectConfig && typeof prisma.seoProjectConfig.upsert === 'function') {
            const saved = await prisma.seoProjectConfig.upsert({
                where: { domain: cleanDomain },
                create: next,
                update: {
                    projectName: next.projectName,
                    siteUrl: next.siteUrl,
                    gscProperty: next.gscProperty,
                    ga4PropertyId: next.ga4PropertyId,
                    ga4MeasurementId: next.ga4MeasurementId,
                    googleServiceAccountEmail: next.googleServiceAccountEmail,
                    googlePrivateKey: next.googlePrivateKey,
                    googleAccessToken: next.googleAccessToken,
                    pagespeedApiKey: next.pagespeedApiKey,
                    keywordProvider: next.keywordProvider,
                    keywordProviderKey: next.keywordProviderKey,
                    backlinkProvider: next.backlinkProvider,
                    backlinkProviderKey: next.backlinkProviderKey,
                    aiVisibilityProvider: next.aiVisibilityProvider,
                    aiVisibilityProviderKey: next.aiVisibilityProviderKey,
                    crawlFrequency: next.crawlFrequency,
                    maxCrawlPages: next.maxCrawlPages
                }
            });
            return saved;
        }
    } catch {
        // Fallback to in-memory store
    }

    const memRecord = { ...next, updatedAt: new Date().toISOString() };
    memoryConfigs.set(cleanDomain, memRecord);
    return memRecord;
}

async function saveSnapshot(domain, provider, data, source = '') {
    const cleanDomain = normalizeDomain(domain);
    const dataJson = JSON.stringify(data || {});
    const now = new Date();
    const key = `${cleanDomain}::${provider}`;
    memorySnapshots.set(key, {
        domain: cleanDomain,
        provider,
        data,
        source,
        syncedAt: now.toISOString()
    });

    try {
        if (prisma && prisma.seoIntegrationSnapshot && typeof prisma.seoIntegrationSnapshot.upsert === 'function') {
            await prisma.seoIntegrationSnapshot.upsert({
                where: {
                    domain_provider: {
                        domain: cleanDomain,
                        provider
                    }
                },
                create: {
                    domain: cleanDomain,
                    provider,
                    dataJson,
                    source,
                    syncedAt: now
                },
                update: {
                    dataJson,
                    source,
                    syncedAt: now
                }
            });
        }
    } catch {
        // Safe fallback already cached in memory
    }
}

async function getSnapshot(domain, provider) {
    const cleanDomain = normalizeDomain(domain);
    try {
        if (prisma && prisma.seoIntegrationSnapshot && typeof prisma.seoIntegrationSnapshot.findUnique === 'function') {
            const row = await prisma.seoIntegrationSnapshot.findUnique({
                where: {
                    domain_provider: {
                        domain: cleanDomain,
                        provider
                    }
                }
            });
            if (row && row.dataJson) {
                return {
                    data: JSON.parse(row.dataJson),
                    source: row.source || provider,
                    syncedAt: row.syncedAt ? new Date(row.syncedAt).toISOString() : null
                };
            }
        }
    } catch {
        // Fallback below
    }

    const mem = memorySnapshots.get(`${cleanDomain}::${provider}`);
    if (mem) {
        return {
            data: mem.data,
            source: mem.source,
            syncedAt: mem.syncedAt
        };
    }
    return null;
}

function resolveDateRange(range = '28d', customStart = '', customEnd = '') {
    const now = new Date();
    // GSC search data usually trails by ~2 days; align end date cleanly to yesterday/today
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let end = new Date(today);
    end.setUTCDate(end.getUTCDate() - 1);

    let days = 28;
    if (range === '7d') days = 7;
    else if (range === '28d') days = 28;
    else if (range === '3m') days = 90;
    else if (range === '6m') days = 180;
    else if (range === 'custom' && customStart && customEnd) {
        const parsedStart = new Date(`${customStart}T00:00:00Z`);
        const parsedEnd = new Date(`${customEnd}T00:00:00Z`);
        if (!Number.isNaN(parsedStart.getTime()) && !Number.isNaN(parsedEnd.getTime()) && parsedStart <= parsedEnd) {
            const diffDays = Math.max(1, Math.round((parsedEnd - parsedStart) / 86400000) + 1);
            const prevEnd = new Date(parsedStart);
            prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
            const prevStart = new Date(prevEnd);
            prevStart.setUTCDate(prevStart.getUTCDate() - (diffDays - 1));
            return {
                range: 'custom',
                days: diffDays,
                startDate: parsedStart.toISOString().slice(0, 10),
                endDate: parsedEnd.toISOString().slice(0, 10),
                prevStartDate: prevStart.toISOString().slice(0, 10),
                prevEndDate: prevEnd.toISOString().slice(0, 10)
            };
        }
    }

    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const prevEnd = new Date(start);
    prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setUTCDate(prevStart.getUTCDate() - (days - 1));

    return {
        range: ['7d', '28d', '3m', '6m'].includes(range) ? range : '28d',
        days,
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        prevStartDate: prevStart.toISOString().slice(0, 10),
        prevEndDate: prevEnd.toISOString().slice(0, 10)
    };
}

async function getGoogleAccessToken(config, scopes) {
    if (config.googleServiceAccountEmail && config.googlePrivateKey) {
        const privateKey = String(config.googlePrivateKey).replace(/\\n/g, '\n');
        const client = new JWT({
            email: config.googleServiceAccountEmail,
            key: privateKey,
            scopes
        });
        const tokenRes = await client.getAccessToken();
        const token = typeof tokenRes === 'string' ? tokenRes : tokenRes?.token;
        if (!token) {
            throw new Error('Failed to mint Google OAuth2 access token from Service Account credentials.');
        }
        return token;
    }

    if (config.googleAccessToken) {
        return config.googleAccessToken;
    }

    return null;
}

function classifySearchIntent(query = '') {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return 'Informational';
    if (/\bhangbug\b|\blogin\b|\bsign in\b|\bcertificate verify\b/.test(q)) return 'Navigational';
    if (/\b(free|online|tool|platform|quiz app|practice test|certification|download|playground)\b/.test(q)) {
        return 'Transactional';
    }
    if (/\b(best|top|vs|compare|comparison|review|alternative)\b/.test(q)) return 'Commercial';
    return 'Informational';
}

function pctDelta(current, previous) {
    if (previous === null || previous === undefined || previous === 0) return null;
    return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        const text = await res.text();
        let json = null;
        try {
            json = JSON.parse(text);
        } catch {
            json = { raw: text };
        }
        if (!res.ok) {
            const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = json;
            throw err;
        }
        return json;
    } finally {
        clearTimeout(timer);
    }
}

async function fetchSearchConsolePerformance(config, dateRange) {
    const gscProperty = config.gscProperty || (config.siteUrl ? `${config.siteUrl}/` : '');
    const hasCreds = Boolean((config.googleServiceAccountEmail && config.googlePrivateKey) || config.googleAccessToken);

    if (!hasCreds || !gscProperty) {
        return {
            connected: false,
            source: 'Google Search Console',
            property: gscProperty || null,
            dateRange,
            comparisonAvailable: false,
            reason: 'Google Search Console is not connected yet. Add your Google Service Account JSON (or OAuth token) and verified GSC Property URL in Settings to load real search clicks, impressions, CTR, average position, queries, and sitemap indexing data.',
            summary: null,
            timeseries: [],
            topQueries: [],
            topPages: [],
            decliningPages: [],
            sitemaps: [],
            syncedAt: null
        };
    }

    try {
        const token = await getGoogleAccessToken(config, ['https://www.googleapis.com/auth/webmasters.readonly']);
        const encodedSite = encodeURIComponent(gscProperty);
        const searchApiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
        const sitemapsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const [currDaily, prevDaily, queryRowsRes, currPageRowsRes, prevPageRowsRes, sitemapsRes] = await Promise.all([
            fetchJsonWithTimeout(searchApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['date'],
                    rowLimit: 500
                })
            }),
            fetchJsonWithTimeout(searchApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startDate: dateRange.prevStartDate,
                    endDate: dateRange.prevEndDate,
                    dimensions: ['date'],
                    rowLimit: 500
                })
            }),
            fetchJsonWithTimeout(searchApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['query', 'page'],
                    rowLimit: 100
                })
            }),
            fetchJsonWithTimeout(searchApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['page'],
                    rowLimit: 60
                })
            }),
            fetchJsonWithTimeout(searchApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    startDate: dateRange.prevStartDate,
                    endDate: dateRange.prevEndDate,
                    dimensions: ['page'],
                    rowLimit: 60
                })
            }),
            fetchJsonWithTimeout(sitemapsUrl, { method: 'GET', headers }).catch(() => ({ sitemap: [] }))
        ]);

        const timeseries = (currDaily.rows || []).map(r => ({
            date: r.keys?.[0] || '',
            clicks: Number(r.clicks || 0),
            impressions: Number(r.impressions || 0),
            ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
            position: Number((r.position || 0).toFixed(1))
        }));

        const prevSeries = (prevDaily.rows || []).map(r => ({
            date: r.keys?.[0] || '',
            clicks: Number(r.clicks || 0),
            impressions: Number(r.impressions || 0),
            ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
            position: Number((r.position || 0).toFixed(1))
        }));

        const sumMetrics = (rows) => {
            const clicks = rows.reduce((s, r) => s + r.clicks, 0);
            const impressions = rows.reduce((s, r) => s + r.impressions, 0);
            const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
            const weightedPos = impressions > 0
                ? Number((rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions).toFixed(1))
                : (rows.length > 0 ? Number((rows.reduce((s, r) => s + r.position, 0) / rows.length).toFixed(1)) : 0);
            return { clicks, impressions, ctr, position: weightedPos };
        };

        const currentTotals = sumMetrics(timeseries);
        const previousTotals = sumMetrics(prevSeries);
        const comparisonAvailable = prevSeries.length > 0;

        const topQueries = (queryRowsRes.rows || []).map(r => {
            const keyword = r.keys?.[0] || '';
            const landingPage = r.keys?.[1] || '/';
            let pathOnly = landingPage;
            try {
                pathOnly = new URL(landingPage).pathname || '/';
            } catch {
                // Keep raw
            }
            return {
                keyword,
                intent: classifySearchIntent(keyword),
                position: Number((r.position || 0).toFixed(1)),
                impressions: Number(r.impressions || 0),
                clicks: Number(r.clicks || 0),
                ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
                landingPage: pathOnly,
                fullUrl: landingPage,
                source: 'Google Search Console',
                isEstimated: false
            };
        });

        const prevPageMap = new Map();
        for (const r of (prevPageRowsRes.rows || [])) {
            const u = r.keys?.[0] || '';
            prevPageMap.set(u, {
                clicks: Number(r.clicks || 0),
                impressions: Number(r.impressions || 0),
                ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
                position: Number((r.position || 0).toFixed(1))
            });
        }

        const topPages = (currPageRowsRes.rows || []).map(r => {
            const fullUrl = r.keys?.[0] || '';
            let pagePath = fullUrl;
            try {
                pagePath = new URL(fullUrl).pathname || '/';
            } catch {
                // Keep raw
            }
            const clicks = Number(r.clicks || 0);
            const impressions = Number(r.impressions || 0);
            const ctr = Number(((r.ctr || 0) * 100).toFixed(2));
            const position = Number((r.position || 0).toFixed(1));
            const prev = prevPageMap.get(fullUrl);
            const clicksChangePct = prev ? pctDelta(clicks, prev.clicks) : null;
            const impressionsChangePct = prev ? pctDelta(impressions, prev.impressions) : null;

            return {
                url: fullUrl,
                path: pagePath,
                clicks,
                impressions,
                ctr,
                position,
                previousClicks: prev ? prev.clicks : null,
                previousImpressions: prev ? prev.impressions : null,
                clicksChangePct,
                impressionsChangePct
            };
        });

        const decliningPages = topPages
            .filter(p => (p.clicksChangePct !== null && p.clicksChangePct <= -10) || (p.impressionsChangePct !== null && p.impressionsChangePct <= -15))
            .sort((a, b) => (a.clicksChangePct ?? 0) - (b.clicksChangePct ?? 0));

        const sitemaps = (sitemapsRes.sitemap || []).map(sm => ({
            path: sm.path,
            lastSubmitted: sm.lastSubmitted || null,
            lastDownloaded: sm.lastDownloaded || null,
            isPending: Boolean(sm.isPending),
            isSitemapsIndex: Boolean(sm.isSitemapsIndex),
            warnings: Number(sm.warnings || 0),
            errors: Number(sm.errors || 0),
            contents: Array.isArray(sm.contents) ? sm.contents : []
        }));

        const result = {
            connected: true,
            source: 'Google Search Console (Verified)',
            property: gscProperty,
            dateRange,
            comparisonAvailable,
            reason: null,
            summary: {
                totalClicks: currentTotals.clicks,
                totalImpressions: currentTotals.impressions,
                averageCtr: currentTotals.ctr,
                averagePosition: currentTotals.position,
                rankingKeywordsCount: topQueries.length,
                previousClicks: previousTotals.clicks,
                previousImpressions: previousTotals.impressions,
                previousCtr: previousTotals.ctr,
                previousPosition: previousTotals.position,
                clicksChangePct: comparisonAvailable ? pctDelta(currentTotals.clicks, previousTotals.clicks) : null,
                impressionsChangePct: comparisonAvailable ? pctDelta(currentTotals.impressions, previousTotals.impressions) : null,
                ctrDelta: comparisonAvailable ? Number((currentTotals.ctr - previousTotals.ctr).toFixed(2)) : null,
                positionDelta: comparisonAvailable ? Number((previousTotals.position - currentTotals.position).toFixed(1)) : null
            },
            timeseries: timeseries.map((point, idx) => ({
                ...point,
                previousClicks: prevSeries[idx]?.clicks ?? null,
                previousImpressions: prevSeries[idx]?.impressions ?? null
            })),
            topQueries,
            topPages,
            decliningPages,
            sitemaps,
            syncedAt: new Date().toISOString()
        };

        await saveSnapshot(config.domain, `gsc_${dateRange.range}`, result, 'Google Search Console API');
        return result;
    } catch (err) {
        return {
            connected: false,
            error: true,
            source: 'Google Search Console',
            property: gscProperty,
            dateRange,
            comparisonAvailable: false,
            reason: `Google Search Console API request failed: ${err.message}. Check your Service Account permissions for ${gscProperty} in Google Search Console.`,
            summary: null,
            timeseries: [],
            topQueries: [],
            topPages: [],
            decliningPages: [],
            sitemaps: [],
            syncedAt: null
        };
    }
}

async function inspectUrlInSearchConsole(config, targetUrl) {
    const gscProperty = config.gscProperty || (config.siteUrl ? `${config.siteUrl}/` : '');
    const hasCreds = Boolean((config.googleServiceAccountEmail && config.googlePrivateKey) || config.googleAccessToken);

    if (!hasCreds || !gscProperty) {
        return {
            gscConnected: false,
            reason: 'Google Search Console API is not connected; showing live Hangbug crawlability inspection only.'
        };
    }

    try {
        const token = await getGoogleAccessToken(config, ['https://www.googleapis.com/auth/webmasters.readonly']);
        const data = await fetchJsonWithTimeout('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inspectionUrl: targetUrl,
                siteUrl: gscProperty,
                languageCode: 'en-US'
            })
        }, 12000);

        const idx = data?.inspectionResult?.indexStatusResult || {};
        return {
            gscConnected: true,
            verdict: idx.verdict || 'VERDICT_UNSPECIFIED',
            coverageState: idx.coverageState || '',
            indexingState: idx.indexingState || '',
            robotsTxtState: idx.robotsTxtState || '',
            pageFetchState: idx.pageFetchState || '',
            lastCrawlTime: idx.lastCrawlTime || null,
            googleCanonical: idx.googleCanonical || '',
            userCanonical: idx.userCanonical || '',
            crawledAs: idx.crawledAs || ''
        };
    } catch (err) {
        return {
            gscConnected: true,
            error: err.message
        };
    }
}

async function fetchGa4Performance(config, dateRange) {
    const measurementId = config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID;
    const hasCreds = Boolean((config.googleServiceAccountEmail && config.googlePrivateKey) || config.googleAccessToken);
    const propertyId = String(config.ga4PropertyId || '').replace(/^properties\//, '').trim();

    if (!hasCreds || !propertyId) {
        return {
            connected: false,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            tagVerified: true,
            source: 'Google Analytics 4',
            reason: `GA4 tracking tag (${measurementId}) is installed on Hangbug, but the GA4 Property ID and Google Service Account credentials are not connected yet for server-side reporting.`,
            summary: null,
            topLandingPages: [],
            dailyTraffic: [],
            syncedAt: null
        };
    }

    try {
        const token = await getGoogleAccessToken(config, ['https://www.googleapis.com/auth/analytics.readonly']);
        const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const organicFilter = {
            filter: {
                fieldName: 'sessionDefaultChannelGroup',
                stringFilter: {
                    matchType: 'EXACT',
                    value: 'Organic Search'
                }
            }
        };

        const [dailyRes, landingRes] = await Promise.all([
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [
                        { startDate: dateRange.startDate, endDate: dateRange.endDate, name: 'current' },
                        { startDate: dateRange.prevStartDate, endDate: dateRange.prevEndDate, name: 'previous' }
                    ],
                    dimensions: [{ name: 'date' }],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'engagedSessions' },
                        { name: 'engagementRate' }
                    ],
                    dimensionFilter: organicFilter,
                    orderBys: [{ dimension: { dimensionName: 'date' } }]
                })
            }),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'landingPagePlusQueryString' }],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'engagementRate' }
                    ],
                    dimensionFilter: organicFilter,
                    limit: 25
                })
            })
        ]);

        const dailyMap = new Map();
        let currSessions = 0;
        let currUsers = 0;
        let currEngaged = 0;
        let prevSessions = 0;
        let prevUsers = 0;

        for (const row of (dailyRes.rows || [])) {
            const rawDate = row.dimensionValues?.[0]?.value || '';
            const formattedDate = rawDate.length === 8
                ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
                : rawDate;
            const dateRangeName = row.dimensionValues?.[1]?.value || 'current';
            const sessions = Number(row.metricValues?.[0]?.value || 0);
            const users = Number(row.metricValues?.[1]?.value || 0);
            const engaged = Number(row.metricValues?.[2]?.value || 0);

            if (dateRangeName === 'previous') {
                prevSessions += sessions;
                prevUsers += users;
            } else {
                currSessions += sessions;
                currUsers += users;
                currEngaged += engaged;
                dailyMap.set(formattedDate, {
                    date: formattedDate,
                    organicSessions: sessions,
                    organicUsers: users,
                    engagedSessions: engaged
                });
            }
        }

        const topLandingPages = (landingRes.rows || []).map(row => ({
            path: row.dimensionValues?.[0]?.value || '/',
            sessions: Number(row.metricValues?.[0]?.value || 0),
            users: Number(row.metricValues?.[1]?.value || 0),
            engagementRate: Number((Number(row.metricValues?.[2]?.value || 0) * 100).toFixed(1))
        }));

        const result = {
            connected: true,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId,
            tagVerified: true,
            source: 'Google Analytics 4 Data API (Verified)',
            reason: null,
            summary: {
                organicSessions: currSessions,
                organicUsers: currUsers,
                engagedSessions: currEngaged,
                engagementRate: currSessions > 0 ? Number(((currEngaged / currSessions) * 100).toFixed(1)) : 0,
                sessionsChangePct: pctDelta(currSessions, prevSessions),
                usersChangePct: pctDelta(currUsers, prevUsers)
            },
            dailyTraffic: Array.from(dailyMap.values()),
            topLandingPages,
            syncedAt: new Date().toISOString()
        };

        await saveSnapshot(config.domain, `ga4_${dateRange.range}`, result, 'Google Analytics 4 Data API');
        return result;
    } catch (err) {
        return {
            connected: false,
            error: true,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId,
            tagVerified: true,
            source: 'Google Analytics 4',
            reason: `GA4 Data API request failed: ${err.message}. Ensure the Service Account has Viewer access to GA4 Property ${propertyId}.`,
            summary: null,
            topLandingPages: [],
            dailyTraffic: [],
            syncedAt: null
        };
    }
}

function classifyCwvMetric(metric, numericValue) {
    if (numericValue === null || numericValue === undefined || Number.isNaN(numericValue)) return 'Not checked';
    if (metric === 'lcp') return numericValue <= 2500 ? 'Good' : numericValue <= 4000 ? 'Needs attention' : 'Critical';
    if (metric === 'cls') return numericValue <= 0.1 ? 'Good' : numericValue <= 0.25 ? 'Needs attention' : 'Critical';
    if (metric === 'inp' || metric === 'tbt') return numericValue <= 200 ? 'Good' : numericValue <= 500 ? 'Needs attention' : 'Critical';
    if (metric === 'fcp') return numericValue <= 1800 ? 'Good' : numericValue <= 3000 ? 'Needs attention' : 'Critical';
    if (metric === 'ttfb') return numericValue <= 800 ? 'Good' : numericValue <= 1800 ? 'Needs attention' : 'Critical';
    return 'Good';
}

async function runPageSpeedInsights(config, targetUrl, strategy = 'mobile') {
    const allowedOrigin = (config.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
    let safeUrl = targetUrl || allowedOrigin;
    if (safeUrl.startsWith('/')) {
        safeUrl = `${allowedOrigin}${safeUrl}`;
    }

    let parsed;
    try {
        parsed = new URL(safeUrl);
    } catch {
        throw new Error('Invalid target URL for PageSpeed check.');
    }

    const allowedHost = normalizeDomain(config.domain);
    const targetHost = normalizeDomain(parsed.hostname);
    if (targetHost !== allowedHost && targetHost !== 'www.hangbug.com' && targetHost !== 'hangbug.com') {
        throw new Error(`PageSpeed checks are restricted to your configured domain (${allowedHost}).`);
    }

    const cleanStrategy = strategy === 'desktop' ? 'desktop' : 'mobile';
    const params = new URLSearchParams({
        url: parsed.toString(),
        strategy: cleanStrategy
    });
    params.append('category', 'performance');
    params.append('category', 'accessibility');
    params.append('category', 'best-practices');
    params.append('category', 'seo');
    if (config.pagespeedApiKey) {
        params.append('key', config.pagespeedApiKey);
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;
    const data = await fetchJsonWithTimeout(apiUrl, { method: 'GET' }, 30000);
    const lhr = data?.lighthouseResult || {};
    const cats = lhr.categories || {};
    const audits = lhr.audits || {};

    const lcpMs = audits['largest-contentful-paint']?.numericValue ?? null;
    const clsVal = audits['cumulative-layout-shift']?.numericValue ?? null;
    const fcpMs = audits['first-contentful-paint']?.numericValue ?? null;
    const tbtMs = audits['total-blocking-time']?.numericValue ?? null;
    const ttfbMs = audits['server-response-time']?.numericValue ?? null;
    const speedIndexMs = audits['speed-index']?.numericValue ?? null;

    // Extract field INP if CrUX metrics exist
    const fieldMetrics = data?.loadingExperience?.metrics || {};
    const inpFieldMs = fieldMetrics?.INTERACTION_TO_NEXT_PAINT?.percentile ?? null;

    const extractAuditPass = (id) => {
        const a = audits[id];
        if (!a) return null;
        return {
            id,
            title: a.title || id,
            score: a.score,
            passed: a.score === 1 || a.score === null,
            displayValue: a.displayValue || '',
            description: a.description || ''
        };
    };

    const result = {
        url: parsed.toString(),
        strategy: cleanStrategy,
        source: 'Google PageSpeed Insights / Lighthouse',
        checkedAt: new Date().toISOString(),
        scores: {
            performance: cats.performance?.score !== undefined ? Math.round(cats.performance.score * 100) : null,
            accessibility: cats.accessibility?.score !== undefined ? Math.round(cats.accessibility.score * 100) : null,
            bestPractices: cats['best-practices']?.score !== undefined ? Math.round(cats['best-practices'].score * 100) : null,
            seo: cats.seo?.score !== undefined ? Math.round(cats.seo.score * 100) : null
        },
        coreWebVitals: {
            lcp: {
                label: 'Largest Contentful Paint (LCP)',
                valueMs: lcpMs !== null ? Math.round(lcpMs) : null,
                displayValue: audits['largest-contentful-paint']?.displayValue || (lcpMs !== null ? `${(lcpMs / 1000).toFixed(2)} s` : 'Unavailable'),
                status: classifyCwvMetric('lcp', lcpMs)
            },
            cls: {
                label: 'Cumulative Layout Shift (CLS)',
                value: clsVal !== null ? Number(clsVal.toFixed(3)) : null,
                displayValue: audits['cumulative-layout-shift']?.displayValue || (clsVal !== null ? String(clsVal.toFixed(3)) : 'Unavailable'),
                status: classifyCwvMetric('cls', clsVal)
            },
            inp: {
                label: inpFieldMs !== null ? 'Interaction to Next Paint (INP - Field)' : 'Total Blocking Time (TBT - Lab INP proxy)',
                valueMs: inpFieldMs !== null ? Math.round(inpFieldMs) : (tbtMs !== null ? Math.round(tbtMs) : null),
                displayValue: inpFieldMs !== null ? `${Math.round(inpFieldMs)} ms` : (audits['total-blocking-time']?.displayValue || 'Unavailable'),
                status: classifyCwvMetric('inp', inpFieldMs !== null ? inpFieldMs : tbtMs),
                isProxy: inpFieldMs === null
            },
            fcp: {
                label: 'First Contentful Paint (FCP)',
                valueMs: fcpMs !== null ? Math.round(fcpMs) : null,
                displayValue: audits['first-contentful-paint']?.displayValue || 'Unavailable',
                status: classifyCwvMetric('fcp', fcpMs)
            },
            ttfb: {
                label: 'Time to First Byte (TTFB)',
                valueMs: ttfbMs !== null ? Math.round(ttfbMs) : null,
                displayValue: audits['server-response-time']?.displayValue || 'Unavailable',
                status: classifyCwvMetric('ttfb', ttfbMs)
            },
            speedIndex: {
                label: 'Speed Index',
                valueMs: speedIndexMs !== null ? Math.round(speedIndexMs) : null,
                displayValue: audits['speed-index']?.displayValue || 'Unavailable'
            }
        },
        mobileUsability: {
            viewport: extractAuditPass('viewport'),
            fontSize: extractAuditPass('font-size'),
            tapTargets: extractAuditPass('tap-targets')
        },
        imageOptimization: [
            extractAuditPass('modern-image-formats'),
            extractAuditPass('uses-optimized-images'),
            extractAuditPass('uses-responsive-images'),
            extractAuditPass('offscreen-images')
        ].filter(Boolean)
    };

    const existingSnap = await getSnapshot(config.domain, 'pagespeed');
    const byStrategy = { ...(existingSnap?.data || {}), [cleanStrategy]: result };
    await saveSnapshot(config.domain, 'pagespeed', byStrategy, 'Google PageSpeed Insights API');

    return byStrategy;
}

async function getBacklinksData(config) {
    const imported = await getSnapshot(config.domain, 'gsc_backlinks');
    if (imported?.data) {
        return {
            connected: true,
            isEstimated: false,
            source: imported.source || 'Google Search Console Links Export',
            syncedAt: imported.syncedAt,
            reason: null,
            ...imported.data
        };
    }

    if (config.backlinkProvider === 'openpagerank' && config.backlinkProviderKey) {
        try {
            const targetDomain = normalizeDomain(config.domain).replace(/^www\./, '');
            const res = await fetchJsonWithTimeout(
                `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(targetDomain)}`,
                {
                    method: 'GET',
                    headers: { 'API-OPR': config.backlinkProviderKey }
                },
                8000
            );
            const entry = Array.isArray(res?.response) ? res.response[0] : null;
            if (entry) {
                const data = {
                    connected: true,
                    isEstimated: true,
                    source: 'OpenPageRank API (Estimated)',
                    syncedAt: new Date().toISOString(),
                    reason: null,
                    summary: {
                        referringDomains: null,
                        totalBacklinks: null,
                        domainRankScore: entry.page_rank_decimal ?? entry.page_rank_integer ?? null,
                        globalRank: entry.rank ? Number(entry.rank) : null
                    },
                    referringDomainsList: [],
                    topAnchors: [],
                    note: 'OpenPageRank provides domain authority ranking; detailed referring domain URLs require a GSC Links export.'
                };
                await saveSnapshot(config.domain, 'backlink_opr', data, 'OpenPageRank API');
                return data;
            }
        } catch (err) {
            return {
                connected: false,
                error: true,
                isEstimated: true,
                source: 'OpenPageRank API',
                reason: `Backlink provider error: ${err.message}`,
                summary: null,
                referringDomainsList: [],
                topAnchors: []
            };
        }
    }

    return {
        connected: false,
        isEstimated: false,
        source: 'Backlinks',
        syncedAt: null,
        reason: 'Google Search Console does not expose external backlinks via its public Search Analytics API, and no external backlink provider is connected. Import your verified GSC Links export or configure OpenPageRank in Settings to inspect referring domains and backlinks.',
        summary: null,
        referringDomainsList: [],
        topAnchors: []
    };
}

async function importGscBacklinks(domain, items = []) {
    const cleanItems = (Array.isArray(items) ? items : [])
        .map(row => ({
            referringDomain: String(row.referringDomain || row.domain || '').trim(),
            linksCount: Math.max(1, parseInt(row.linksCount || row.links || '1', 10) || 1),
            targetPage: String(row.targetPage || row.target || '/').trim(),
            anchorText: String(row.anchorText || row.anchor || '').trim()
        }))
        .filter(r => Boolean(r.referringDomain));

    if (cleanItems.length === 0) {
        throw new Error('Provide at least one valid referring domain row.');
    }

    const totalBacklinks = cleanItems.reduce((sum, r) => sum + r.linksCount, 0);
    const uniqueDomains = new Set(cleanItems.map(r => r.referringDomain.toLowerCase()));
    const anchorCounts = {};
    cleanItems.forEach(r => {
        if (r.anchorText) {
            anchorCounts[r.anchorText] = (anchorCounts[r.anchorText] || 0) + r.linksCount;
        }
    });

    const payload = {
        summary: {
            referringDomains: uniqueDomains.size,
            totalBacklinks,
            domainRankScore: null,
            globalRank: null
        },
        referringDomainsList: cleanItems.slice(0, 100),
        topAnchors: Object.entries(anchorCounts)
            .map(([anchor, count]) => ({ anchor, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20)
    };

    await saveSnapshot(domain, 'gsc_backlinks', payload, 'Google Search Console Links Export (Imported)');
    return payload;
}

async function getAiVisibilityData(config, readinessChecks = []) {
    const snap = await getSnapshot(config.domain, 'ai_visibility');
    if (snap?.data && snap.data.connected) {
        return {
            ...snap.data,
            readinessChecks,
            syncedAt: snap.syncedAt
        };
    }

    return {
        connected: false,
        source: 'AI Search Visibility',
        syncedAt: null,
        explanation: 'Live citation and brand-mention counts across ChatGPT, Google AI Overviews, Google AI Mode, Gemini, and Perplexity require a connected AI search monitoring provider. Hangbug does not display simulated zeros—below are your verified AI crawler and structured-data readiness checks.',
        platforms: [
            {
                id: 'chatgpt',
                name: 'ChatGPT (OpenAI Search)',
                status: 'Not connected',
                mentions: null,
                citedPages: null,
                reason: 'Requires a connected AI citation tracking provider.'
            },
            {
                id: 'ai-overviews',
                name: 'Google AI Overviews',
                status: 'Not connected',
                mentions: null,
                citedPages: null,
                reason: 'Requires SERP AI Overview monitoring integration.'
            },
            {
                id: 'gemini',
                name: 'Google Gemini',
                status: 'Not connected',
                mentions: null,
                citedPages: null,
                reason: 'Requires a connected AI citation tracking provider.'
            },
            {
                id: 'perplexity',
                name: 'Perplexity & Other AI Engines',
                status: 'Not connected',
                mentions: null,
                citedPages: null,
                reason: 'Requires a connected AI citation tracking provider.'
            }
        ],
        readinessChecks
    };
}

async function testIntegrationConnection(domain, target) {
    const config = await getProjectConfig(domain);
    const dateRange = resolveDateRange('7d');

    if (target === 'gsc') {
        const res = await fetchSearchConsolePerformance(config, dateRange);
        return {
            ok: Boolean(res.connected),
            provider: 'Google Search Console',
            message: res.connected
                ? `Connected to ${res.property}. Found ${res.topQueries.length} queries and ${res.sitemaps.length} sitemap(s).`
                : res.reason
        };
    }
    if (target === 'ga4') {
        const res = await fetchGa4Performance(config, dateRange);
        return {
            ok: Boolean(res.connected),
            provider: 'Google Analytics 4',
            message: res.connected
                ? `Connected to GA4 Property ${res.propertyId} (${res.measurementId}).`
                : res.reason
        };
    }
    if (target === 'pagespeed') {
        const res = await runPageSpeedInsights(config, config.siteUrl, 'mobile');
        const perf = res?.mobile?.scores?.performance;
        return {
            ok: perf !== null && perf !== undefined,
            provider: 'Google PageSpeed Insights',
            message: perf !== null && perf !== undefined
                ? `Live Lighthouse mobile check succeeded for ${config.siteUrl} (Performance: ${perf}/100).`
                : 'PageSpeed Insights responded without a performance score.'
        };
    }
    if (target === 'backlinks') {
        const res = await getBacklinksData(config);
        return {
            ok: Boolean(res.connected),
            provider: 'Backlink Provider',
            message: res.connected
                ? `Connected to ${res.source}.`
                : res.reason
        };
    }

    return { ok: false, provider: target, message: 'Unknown integration target.' };
}

module.exports = {
    DEFAULT_DOMAIN,
    DEFAULT_SITE_URL,
    DEFAULT_GA4_MEASUREMENT_ID,
    DEFAULT_GA4_STREAM_ID,
    normalizeDomain,
    buildSiteUrl,
    getProjectConfig,
    sanitizeConfigForClient,
    saveProjectConfig,
    saveSnapshot,
    getSnapshot,
    resolveDateRange,
    fetchSearchConsolePerformance,
    inspectUrlInSearchConsole,
    fetchGa4Performance,
    runPageSpeedInsights,
    getBacklinksData,
    importGscBacklinks,
    getAiVisibilityData,
    testIntegrationConnection,
    classifySearchIntent
};
