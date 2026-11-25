const crypto = require('crypto');
const { JWT } = require('google-auth-library');
const prisma = require('../_config/prisma');

const DEFAULT_DOMAIN = 'www.hangbug.com';
const DEFAULT_SITE_URL = 'https://www.hangbug.com';
const DEFAULT_GSC_PROPERTY = 'sc-domain:hangbug.com';
const DEFAULT_GA4_PROPERTY_ID = '561909161';
const DEFAULT_GA4_MEASUREMENT_ID = 'G-BSZBBFZZH0';
const DEFAULT_GA4_STREAM_ID = '16254821680';
const GSC_READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GA4_READONLY_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const OPENPAGERANK_API_BASE_URL = 'https://openpagerank.keywordseverywhere.com';
const OPENPAGERANK_BULK_ENDPOINT = `${OPENPAGERANK_API_BASE_URL}/v1/domains/bulk`;
const OPENPAGERANK_USAGE_ENDPOINT = `${OPENPAGERANK_API_BASE_URL}/v1/usage`;
const OPENPAGERANK_CLEARED_SENTINEL = '__CLEARED__';
const OPENPAGERANK_STATUS = {
    CONNECTED: 'Connected',
    INVALID_KEY: 'Invalid API Key',
    QUOTA_EXCEEDED: 'Quota Exceeded',
    UNAVAILABLE: 'Provider Unavailable',
    NOT_CONFIGURED: 'Not Configured'
};
const PAGESPEED_API_SERVICE = 'pagespeedonline.googleapis.com';
const PAGESPEED_EXPECTED_PROJECT_NUMBER = '583797351490';
const PAGESPEED_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours minimum cache TTL
const PAGESPEED_DEFAULT_THROTTLE_MS = 1200;
const PAGESPEED_DEFAULT_MAX_RPM = 15;
const PAGESPEED_DEFAULT_MAX_RETRIES = 2;
const PAGESPEED_DEFAULT_BACKOFF_MS = 600;
const PAGESPEED_QUOTA_EXHAUSTED_MESSAGE =
    'Google PageSpeed API daily quota has been reached. Previously cached reports are still available. Please try again after the quota resets.';

const VERIFIED_GSC_PERMISSION_LEVELS = new Set([
    'siteOwner',
    'siteFullUser',
    'siteRestrictedUser'
]);

// In-memory fallback stores if Prisma client is not yet regenerated or DB is offline in tests
const memoryConfigs = new Map();
const memorySnapshots = new Map();
const memoryVerifications = new Map();
const memoryGa4Verifications = new Map();
const memoryOprVerifications = new Map();
const memoryPageSpeedVerifications = new Map();
const memoryPageSpeedQuotaStates = new Map();
const pageSpeedSnapshotLocks = new Map();
const inFlightPageSpeedRequests = new Map();
const pageSpeedRequestTimestamps = [];
let lastPageSpeedRequestAt = 0;
let pageSpeedThrottleChain = Promise.resolve();

async function withPageSpeedSnapshotLock(domain, fn) {
    const cleanDomain = normalizeDomain(domain);
    const prev = pageSpeedSnapshotLocks.get(cleanDomain) || Promise.resolve();
    let release;
    const next = new Promise((resolve) => {
        release = resolve;
    });
    pageSpeedSnapshotLocks.set(cleanDomain, next);
    await prev;
    try {
        return await fn();
    } finally {
        release();
        if (pageSpeedSnapshotLocks.get(cleanDomain) === next) {
            pageSpeedSnapshotLocks.delete(cleanDomain);
        }
    }
}

function normalizeDomain(input) {
    const raw = String(input || DEFAULT_DOMAIN).trim().toLowerCase();
    return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || DEFAULT_DOMAIN;
}

function normalizeRootDomain(input) {
    const clean = normalizeDomain(input)
        .replace(/:\d+$/, '')
        .replace(/^www\./i, '');
    return clean || 'hangbug.com';
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

/**
 * Validates and normalizes a GA4 numeric Property ID.
 * - Strips optional `properties/` prefix.
 * - Rejects frontend Measurement IDs (`G-XXXX`) and non-numeric strings.
 * - Returns `{ valid, propertyId, resourceName, errorCategory, message }`.
 */
function validateAndNormalizeGa4PropertyId(rawInput, measurementId = DEFAULT_GA4_MEASUREMENT_ID) {
    const raw = String(rawInput ?? '').trim();
    if (!raw) {
        return {
            valid: false,
            propertyId: '',
            resourceName: '',
            errorCategory: 'invalid_property_id',
            message: `GA4 Numeric Property ID is not configured. Enter your numeric GA4 Property ID (e.g. ${DEFAULT_GA4_PROPERTY_ID}); keep Measurement ID (${measurementId}) for frontend tracking only.`
        };
    }

    const stripped = raw.replace(/^properties\//i, '').trim();
    if (/^G-[A-Z0-9]+$/i.test(stripped) || /^UA-\d+/i.test(stripped)) {
        return {
            valid: false,
            propertyId: stripped,
            resourceName: '',
            errorCategory: 'invalid_property_id',
            message: `Invalid GA4 Property ID: "${raw}" is a frontend Measurement ID (used only for browser gtag tracking). Enter the numeric GA4 Property ID (e.g. ${DEFAULT_GA4_PROPERTY_ID}).`
        };
    }

    if (!/^\d+$/.test(stripped)) {
        return {
            valid: false,
            propertyId: stripped,
            resourceName: '',
            errorCategory: 'invalid_property_id',
            message: `Invalid GA4 Property ID "${raw}". A GA4 Property ID must be numeric (e.g. ${DEFAULT_GA4_PROPERTY_ID}) and resolves to properties/NUMERIC_PROPERTY_ID.`
        };
    }

    return {
        valid: true,
        propertyId: stripped,
        resourceName: `properties/${stripped}`,
        errorCategory: null,
        message: ''
    };
}

function formatDurationSeconds(totalSeconds) {
    const sec = Math.max(0, Math.round(Number(totalSeconds) || 0));
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
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

function resolvePageSpeedApiKey(config = {}) {
    const envPrimary = String(process.env.PAGESPEED_API_KEY || '').trim();
    const dbKey = String(config?.pagespeedApiKey || '').trim();
    const envLegacy = String(process.env.GOOGLE_PAGESPEED_API_KEY || '').trim();

    let key = '';
    let source = 'none';

    if (envPrimary && !isMaskedPlaceholder(envPrimary)) {
        key = envPrimary;
        source = 'env:PAGESPEED_API_KEY';
    } else if (dbKey && !isMaskedPlaceholder(dbKey)) {
        key = dbKey;
        source = 'settings:seo_project_configs';
    } else if (envLegacy && !isMaskedPlaceholder(envLegacy)) {
        key = envLegacy;
        source = 'env:GOOGLE_PAGESPEED_API_KEY';
    }

    const fingerprint = key
        ? crypto.createHash('sha256').update(key).digest('hex').slice(0, 12)
        : '';

    return {
        key,
        hasKey: Boolean(key),
        source,
        fingerprint
    };
}

function redactPageSpeedApiKey(input, rawKey = '') {
    let text = String(input ?? '');
    if (!text) return '';

    const candidates = [
        rawKey,
        process.env.PAGESPEED_API_KEY,
        process.env.GOOGLE_PAGESPEED_API_KEY
    ]
        .map((v) => String(v || '').trim())
        .filter((v) => v.length >= 6);

    for (const secret of candidates) {
        text = text.split(secret).join('[REDACTED_API_KEY]');
    }

    // Also scrub any key=... query parameter or AIza... token if present in error messages
    text = text.replace(/([?&]key=)[^&\s"']+/gi, '$1[REDACTED_API_KEY]');
    text = text.replace(/\bAIza[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_API_KEY]');
    return text;
}

function resolveOpenPageRankApiKey(config = {}, overrideKey = undefined) {
    if (overrideKey !== undefined && overrideKey !== null) {
        const trimmedOverride = String(overrideKey).trim();
        if (trimmedOverride && !isMaskedPlaceholder(trimmedOverride)) {
            return {
                key: trimmedOverride,
                hasKey: true,
                source: 'override'
            };
        }
    }

    const dbKey = String(config?.backlinkProviderKey || '').trim();
    if (dbKey === OPENPAGERANK_CLEARED_SENTINEL) {
        return {
            key: '',
            hasKey: false,
            source: 'none'
        };
    }

    if (dbKey && !isMaskedPlaceholder(dbKey)) {
        const envKey = String(process.env.OPENPAGERANK_API_KEY || '').trim();
        return {
            key: dbKey,
            hasKey: true,
            source: dbKey === envKey ? 'env:OPENPAGERANK_API_KEY' : 'settings:seo_project_configs'
        };
    }

    const envPrimary = String(process.env.OPENPAGERANK_API_KEY || '').trim();
    if (envPrimary && !isMaskedPlaceholder(envPrimary)) {
        return {
            key: envPrimary,
            hasKey: true,
            source: 'env:OPENPAGERANK_API_KEY'
        };
    }

    const envLegacy = String(process.env.SEO_BACKLINK_PROVIDER_KEY || '').trim();
    if (envLegacy && !isMaskedPlaceholder(envLegacy)) {
        return {
            key: envLegacy,
            hasKey: true,
            source: 'env:SEO_BACKLINK_PROVIDER_KEY'
        };
    }

    return {
        key: '',
        hasKey: false,
        source: 'none'
    };
}

function redactOpenPageRankApiKey(input, rawKey = '') {
    let text = String(input ?? '');
    if (!text) return '';

    const candidates = [
        rawKey,
        process.env.OPENPAGERANK_API_KEY,
        process.env.SEO_BACKLINK_PROVIDER_KEY
    ]
        .map((v) => String(v || '').trim())
        .filter((v) => v.length >= 6 && v !== OPENPAGERANK_CLEARED_SENTINEL);

    for (const secret of candidates) {
        text = text.split(secret).join('[REDACTED_OPR_KEY]');
    }

    text = text.replace(/\bopr_(?:live|test)_[a-zA-Z0-9_-]+/gi, '[REDACTED_OPR_KEY]');
    text = text.replace(/(Authorization:\s*Bearer\s+)[^\s"']+/gi, '$1[REDACTED_OPR_KEY]');
    return text;
}

function getEnvDefaults(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    return {
        domain: cleanDomain,
        projectName: 'Hangbug',
        siteUrl: buildSiteUrl(cleanDomain),
        gscProperty: normalizeGscPropertyIdentifier(process.env.GSC_SITE_URL || DEFAULT_GSC_PROPERTY),
        ga4PropertyId: String(process.env.GA4_PROPERTY_ID || DEFAULT_GA4_PROPERTY_ID).replace(/^properties\//i, '').trim(),
        ga4MeasurementId: String(process.env.GA4_MEASUREMENT_ID || DEFAULT_GA4_MEASUREMENT_ID).trim(),
        googleServiceAccountEmail: String(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GSC_CLIENT_EMAIL || ''
        ).trim(),
        googlePrivateKey: String(
            process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.GSC_PRIVATE_KEY || ''
        ).trim(),
        googleAccessToken: String(process.env.GSC_ACCESS_TOKEN || '').trim(),
        pagespeedApiKey: String(
            process.env.PAGESPEED_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY || ''
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

    const dbBacklinkKey = dbRecord?.backlinkProviderKey !== undefined && dbRecord?.backlinkProviderKey !== null
        ? String(dbRecord.backlinkProviderKey).trim()
        : '';
    let resolvedBacklinkKey;
    let resolvedBacklinkProvider;

    if (dbBacklinkKey === OPENPAGERANK_CLEARED_SENTINEL) {
        resolvedBacklinkKey = OPENPAGERANK_CLEARED_SENTINEL;
        resolvedBacklinkProvider = 'none';
    } else if (dbBacklinkKey) {
        resolvedBacklinkKey = dbBacklinkKey;
        resolvedBacklinkProvider = (dbRecord?.backlinkProvider && dbRecord.backlinkProvider !== 'none')
            ? dbRecord.backlinkProvider
            : 'openpagerank';
    } else {
        resolvedBacklinkKey = envDefaults.backlinkProviderKey;
        resolvedBacklinkProvider = resolvedBacklinkKey
            ? 'openpagerank'
            : (dbRecord?.backlinkProvider || envDefaults.backlinkProvider);
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
        pagespeedApiKey: String(process.env.PAGESPEED_API_KEY || '').trim() || dbRecord?.pagespeedApiKey || envDefaults.pagespeedApiKey,
        keywordProvider: dbRecord?.keywordProvider || envDefaults.keywordProvider,
        keywordProviderKey: dbRecord?.keywordProviderKey || envDefaults.keywordProviderKey,
        backlinkProvider: resolvedBacklinkProvider,
        backlinkProviderKey: resolvedBacklinkKey,
        aiVisibilityProvider: dbRecord?.aiVisibilityProvider || envDefaults.aiVisibilityProvider,
        aiVisibilityProviderKey: dbRecord?.aiVisibilityProviderKey || envDefaults.aiVisibilityProviderKey,
        crawlFrequency: dbRecord?.crawlFrequency || envDefaults.crawlFrequency,
        maxCrawlPages: Number(dbRecord?.maxCrawlPages) || envDefaults.maxCrawlPages
    };

    return merged;
}

function mapPageSpeedErrorCategoryToStatus(errorCategory) {
    if (errorCategory === 'missing_api_key') return 'Not Configured';
    if (errorCategory === 'invalid_api_key') return 'Invalid API Key';
    if (errorCategory === 'api_disabled') return 'API Not Enabled';
    if (errorCategory === 'daily_quota_exceeded' || errorCategory === 'rate_limit_exceeded') return 'Quota Exceeded';
    return 'Connection Error';
}

function resolvePageSpeedConnectionStatus({
    config = {},
    keyInfo = null,
    pagespeedSnap = null,
    verificationInput = null
} = {}) {
    const cleanDomain = normalizeDomain(config?.domain || DEFAULT_DOMAIN);
    const psiKeyInfo = keyInfo || resolvePageSpeedApiKey(config);
    const memSnap = memorySnapshots.get(`${cleanDomain}::pagespeed`) || null;
    const snapObj = (verificationInput && verificationInput.data)
        ? verificationInput
        : (pagespeedSnap || memSnap || null);
    const snapData = snapObj?.data || {};
    const directVer = (
        verificationInput
        && !verificationInput.data
        && (verificationInput.connectionStatus !== undefined || verificationInput.connected !== undefined)
    )
        ? verificationInput
        : null;

    const matchesKey = (entry) => Boolean(
        entry
        && (!entry.keyFingerprint || !psiKeyInfo.fingerprint || entry.keyFingerprint === psiKeyInfo.fingerprint)
    );

    const rawMemQuota = memoryPageSpeedQuotaStates.get(cleanDomain) || null;
    const rawSnapQuota = snapData.quotaState || null;
    const candidateQuota = matchesKey(rawMemQuota)
        ? rawMemQuota
        : (matchesKey(rawSnapQuota) ? rawSnapQuota : null);
    const quotaResetPassed = candidateQuota?.nextRetryAt && Date.now() >= Date.parse(candidateQuota.nextRetryAt);
    const activeQuota = candidateQuota && !quotaResetPassed ? candidateQuota : null;

    const memVer = memoryPageSpeedVerifications.get(cleanDomain) || null;
    const snapVer = snapData.connectionVerification || null;
    const candidateVer = directVer
        || (matchesKey(memVer) ? memVer : (matchesKey(snapVer) ? snapVer : null));

    const rawLastError = snapData.lastError || null;
    const matchingLastError = matchesKey(rawLastError) ? rawLastError : null;

    const mobilePerf = typeof candidateVer?.mobilePerformance === 'number'
        ? candidateVer.mobilePerformance
        : (typeof snapData.mobile?.scores?.performance === 'number' ? snapData.mobile.scores.performance : null);
    const desktopPerf = typeof candidateVer?.desktopPerformance === 'number'
        ? candidateVer.desktopPerformance
        : (typeof snapData.desktop?.scores?.performance === 'number' ? snapData.desktop.scores.performance : null);

    if (!psiKeyInfo.hasKey) {
        return {
            connected: false,
            connectionStatus: 'Not Configured',
            apiEnabled: null,
            errorCategory: 'missing_api_key',
            quotaExhausted: false,
            nextRetryAt: null,
            lastTestedAt: candidateVer?.checkedAt || matchingLastError?.detectedAt || null,
            mobilePerformance: mobilePerf,
            desktopPerformance: desktopPerf,
            isError: true,
            message: 'PAGESPEED_API_KEY is not configured on the backend environment variables.'
        };
    }

    if (activeQuota?.exhausted) {
        return {
            connected: false,
            connectionStatus: 'Quota Exceeded',
            apiEnabled: true,
            errorCategory: activeQuota.errorCategory || 'daily_quota_exceeded',
            quotaExhausted: true,
            nextRetryAt: activeQuota.nextRetryAt || null,
            lastTestedAt: activeQuota.detectedAt || candidateVer?.checkedAt || null,
            mobilePerformance: mobilePerf,
            desktopPerformance: desktopPerf,
            isError: true,
            message: activeQuota.userMessage || PAGESPEED_QUOTA_EXHAUSTED_MESSAGE
        };
    }

    const verTime = candidateVer?.checkedAt ? Date.parse(candidateVer.checkedAt) || 0 : 0;
    const errTime = matchingLastError?.detectedAt ? Date.parse(matchingLastError.detectedAt) || 0 : 0;

    if (candidateVer && (!matchingLastError || verTime >= errTime)) {
        const isConn = Boolean(candidateVer.connected);
        const statusLabel = candidateVer.connectionStatus
            || (isConn ? 'Connected' : mapPageSpeedErrorCategoryToStatus(candidateVer.errorCategory));
        return {
            connected: isConn,
            connectionStatus: statusLabel,
            apiEnabled: candidateVer.apiEnabled !== undefined ? candidateVer.apiEnabled : (isConn ? true : null),
            errorCategory: isConn ? null : (candidateVer.errorCategory || null),
            quotaExhausted: false,
            nextRetryAt: candidateVer.nextRetryAt || null,
            lastTestedAt: candidateVer.checkedAt || null,
            mobilePerformance: mobilePerf,
            desktopPerformance: desktopPerf,
            isError: !isConn,
            message: candidateVer.message || ''
        };
    }

    if (matchingLastError?.errorCategory) {
        const cat = matchingLastError.errorCategory;
        return {
            connected: false,
            connectionStatus: mapPageSpeedErrorCategoryToStatus(cat),
            apiEnabled: cat === 'api_disabled' ? false : (cat === 'daily_quota_exceeded' || cat === 'rate_limit_exceeded' ? true : null),
            errorCategory: cat,
            quotaExhausted: Boolean(matchingLastError.isDailyQuota),
            nextRetryAt: matchingLastError.nextRetryAt || null,
            lastTestedAt: matchingLastError.detectedAt || null,
            mobilePerformance: mobilePerf,
            desktopPerformance: desktopPerf,
            isError: true,
            message: matchingLastError.userMessage || matchingLastError.message || ''
        };
    }

    return {
        connected: false,
        connectionStatus: 'Configured (Not Tested)',
        apiEnabled: null,
        errorCategory: null,
        quotaExhausted: false,
        nextRetryAt: null,
        lastTestedAt: null,
        mobilePerformance: mobilePerf,
        desktopPerformance: desktopPerf,
        isError: false,
        message: 'PAGESPEED_API_KEY is configured on the backend. Click "Test PageSpeed Connection" to verify Mobile and Desktop API access.'
    };
}

function sanitizeConfigForClient(config, verificationInput = null, ga4VerificationInput = null, oprVerificationInput = null, pagespeedVerificationInput = null) {
    const cleanDomain = normalizeDomain(config.domain);
    const verification = verificationInput || memoryVerifications.get(cleanDomain) || null;
    const ga4Verification = ga4VerificationInput || memoryGa4Verifications.get(cleanDomain) || null;
    const oprVerification = oprVerificationInput || memoryOprVerifications.get(cleanDomain) || null;
    const psiKeyInfo = resolvePageSpeedApiKey(config);
    const oprKeyInfo = resolveOpenPageRankApiKey(config);
    const psiConn = resolvePageSpeedConnectionStatus({
        config,
        keyInfo: psiKeyInfo,
        pagespeedSnap: pagespeedVerificationInput?.data ? pagespeedVerificationInput : null,
        verificationInput: pagespeedVerificationInput
    });
    const psiQuotaState = psiConn.quotaExhausted
        ? { exhausted: true, nextRetryAt: psiConn.nextRetryAt }
        : (memoryPageSpeedQuotaStates.get(cleanDomain) || null);
    const hasGoogleServiceAccount = Boolean(config.googleServiceAccountEmail && config.googlePrivateKey);
    const hasGoogleCredentials = hasGoogleServiceAccount || Boolean(config.googleAccessToken);
    const resolvedProperty = verification?.selectedProperty
        || normalizeGscPropertyIdentifier(config.gscProperty)
        || DEFAULT_GSC_PROPERTY;

    // Do not display a successful connection merely because JSON credentials exist; require verified property access
    const gscPropertyVerified = verification ? Boolean(verification.propertyVerified) : false;
    const gscAuthStatus = verification?.authStatus
        || (hasGoogleCredentials ? 'Credentials Saved (Click Test GSC to verify)' : 'Not Configured');

    const rawGa4Prop = String(config.ga4PropertyId || '').replace(/^properties\//i, '').trim();
    const ga4VerifiedConnected = ga4Verification ? Boolean(ga4Verification.connected) : false;
    const ga4ConnectionStatus = ga4VerifiedConnected
        ? 'Connected'
        : ga4Verification?.errorCategory
            ? 'Connection Error'
            : (hasGoogleCredentials && rawGa4Prop ? 'Configured (Click Test GA4 Connection to verify)' : 'Not Connected');

    // Only show Connected after a successful real OpenPageRank API request
    const openPageRankStatus = !oprKeyInfo.hasKey
        ? OPENPAGERANK_STATUS.NOT_CONFIGURED
        : (oprVerification?.connectionStatus || OPENPAGERANK_STATUS.NOT_CONFIGURED);
    const openPageRankConnected = openPageRankStatus === OPENPAGERANK_STATUS.CONNECTED;

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
        ga4PropertyId: rawGa4Prop,
        ga4ResourceName: rawGa4Prop ? `properties/${rawGa4Prop}` : '',
        ga4MeasurementId: config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID,
        ga4StreamId: DEFAULT_GA4_STREAM_ID,
        ga4Connected: ga4VerifiedConnected,
        ga4ConnectionStatus,
        ga4LastSyncedAt: ga4Verification?.syncedAt || null,
        ga4VerificationMessage: ga4Verification?.message || '',
        ga4ErrorCategory: ga4Verification?.errorCategory || null,
        googleServiceAccountEmail: config.googleServiceAccountEmail || '',
        googleServiceAccountEmailMasked: maskEmail(config.googleServiceAccountEmail),
        hasGoogleServiceAccount,
        hasGoogleAccessToken: Boolean(config.googleAccessToken),
        hasGoogleCredentials,
        hasPagespeedApiKey: psiKeyInfo.hasKey,
        pagespeedApiKeySource: psiKeyInfo.source,
        pagespeedConnected: psiConn.connected,
        pagespeedConnectionStatus: psiConn.connectionStatus,
        pagespeedApiEnabled: psiConn.apiEnabled,
        pagespeedLastTestedAt: psiConn.lastTestedAt,
        pagespeedMobilePerformance: psiConn.mobilePerformance,
        pagespeedDesktopPerformance: psiConn.desktopPerformance,
        pagespeedVerificationMessage: psiConn.message,
        pagespeedErrorCategory: psiConn.errorCategory,
        pagespeedQuotaExhausted: Boolean(psiConn.quotaExhausted || psiQuotaState?.exhausted),
        pagespeedNextRetryAt: psiConn.nextRetryAt || psiQuotaState?.nextRetryAt || null,
        keywordProvider: config.keywordProvider || 'none',
        hasKeywordProviderKey: Boolean(config.keywordProviderKey),
        backlinkProvider: oprKeyInfo.hasKey ? 'openpagerank' : (config.backlinkProvider || 'none'),
        hasBacklinkProviderKey: oprKeyInfo.hasKey,
        hasOpenPageRankApiKey: oprKeyInfo.hasKey,
        openPageRankKeySource: oprKeyInfo.source,
        openPageRankStatus,
        openPageRankConnected,
        openPageRankMessage: oprVerification?.message || '',
        openPageRankLastSyncedAt: oprVerification?.syncedAt || null,
        openPageRankAsOf: oprVerification?.asOf || null,
        openPageRankQuota: oprVerification?.quota || null,
        aiVisibilityProvider: config.aiVisibilityProvider || 'none',
        hasAiVisibilityProviderKey: Boolean(config.aiVisibilityProviderKey),
        crawlFrequency: config.crawlFrequency || 'daily',
        maxCrawlPages: Number(config.maxCrawlPages) || 60,
        integrations: {
            gscConnected: gscPropertyVerified,
            gscAuthenticated: Boolean(verification?.authenticated),
            gscPermissionLevel: verification?.permissionLevel || null,
            ga4Connected: ga4VerifiedConnected,
            ga4ConnectionStatus,
            ga4PropertyId: rawGa4Prop,
            ga4ResourceName: rawGa4Prop ? `properties/${rawGa4Prop}` : '',
            ga4LastSyncedAt: ga4Verification?.syncedAt || null,
            ga4TagMeasurementId: config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID,
            pagespeedConnected: psiConn.connected,
            pagespeedConnectionStatus: psiConn.connectionStatus,
            pagespeedApiEnabled: psiConn.apiEnabled,
            pagespeedLastTestedAt: psiConn.lastTestedAt,
            pagespeedMobilePerformance: psiConn.mobilePerformance,
            pagespeedDesktopPerformance: psiConn.desktopPerformance,
            pagespeedErrorCategory: psiConn.errorCategory,
            pagespeedVerificationMessage: psiConn.message,
            pagespeedReady: psiKeyInfo.hasKey && !psiConn.quotaExhausted && psiConn.connectionStatus !== 'Invalid API Key' && psiConn.connectionStatus !== 'API Not Enabled',
            pagespeedHasKey: psiKeyInfo.hasKey,
            pagespeedKeySource: psiKeyInfo.source,
            pagespeedQuotaExhausted: Boolean(psiConn.quotaExhausted || psiQuotaState?.exhausted),
            pagespeedNextRetryAt: psiConn.nextRetryAt || psiQuotaState?.nextRetryAt || null,
            keywordProviderConnected: config.keywordProvider !== 'none' && Boolean(config.keywordProviderKey),
            backlinkProviderConnected: openPageRankConnected,
            openPageRankConnected,
            openPageRankStatus,
            aiVisibilityConnected: config.aiVisibilityProvider !== 'none' && Boolean(config.aiVisibilityProviderKey)
        },
        updatedAt: config.updatedAt || null
    };
}

async function saveProjectConfig(domain, updates = {}) {
    const cleanDomain = normalizeDomain(domain);
    const current = await getProjectConfig(cleanDomain);

    const rawOprKeyUpdate = updates.openPageRankApiKey !== undefined
        ? updates.openPageRankApiKey
        : updates.backlinkProviderKey;
    const shouldClearOprKey = Boolean(
        updates.clearOpenPageRankApiKey
        || updates.removeOpenPageRankApiKey
        || updates.clearBacklinkProviderKey
    );

    let nextBacklinkKey = current.backlinkProviderKey;
    let nextBacklinkProvider = updates.backlinkProvider !== undefined
        ? String(updates.backlinkProvider).trim().toLowerCase()
        : current.backlinkProvider;

    if (shouldClearOprKey) {
        nextBacklinkKey = OPENPAGERANK_CLEARED_SENTINEL;
        nextBacklinkProvider = 'none';
        memoryOprVerifications.delete(cleanDomain);
    } else if (rawOprKeyUpdate !== undefined) {
        const trimmedKey = String(rawOprKeyUpdate || '').trim();
        if (trimmedKey && !isMaskedPlaceholder(trimmedKey)) {
            nextBacklinkKey = trimmedKey;
            nextBacklinkProvider = 'openpagerank';
            memoryOprVerifications.delete(cleanDomain);
        }
    }

    if (updates.pagespeedApiKey !== undefined || updates.clearPagespeedApiKey) {
        memoryPageSpeedVerifications.delete(cleanDomain);
        memoryPageSpeedQuotaStates.delete(cleanDomain);
    }

    const next = {
        domain: cleanDomain,
        projectName: updates.projectName !== undefined ? String(updates.projectName).trim() || 'Hangbug' : current.projectName,
        siteUrl: updates.siteUrl !== undefined ? String(updates.siteUrl).trim().replace(/\/+$/, '') || buildSiteUrl(cleanDomain) : current.siteUrl,
        gscProperty: updates.gscProperty !== undefined
            ? (normalizeGscPropertyIdentifier(updates.gscProperty) || DEFAULT_GSC_PROPERTY)
            : (normalizeGscPropertyIdentifier(current.gscProperty) || DEFAULT_GSC_PROPERTY),
        ga4PropertyId: current.ga4PropertyId,
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
        backlinkProvider: nextBacklinkProvider,
        backlinkProviderKey: nextBacklinkKey,
        aiVisibilityProvider: updates.aiVisibilityProvider !== undefined ? String(updates.aiVisibilityProvider).trim().toLowerCase() : current.aiVisibilityProvider,
        aiVisibilityProviderKey: updates.aiVisibilityProviderKey !== undefined
            ? (updates.clearAiVisibilityProviderKey ? '' : (isMaskedPlaceholder(updates.aiVisibilityProviderKey) || !String(updates.aiVisibilityProviderKey).trim() ? current.aiVisibilityProviderKey : String(updates.aiVisibilityProviderKey).trim()))
            : current.aiVisibilityProviderKey,
        crawlFrequency: ['hourly', 'daily', 'weekly', 'manual'].includes(updates.crawlFrequency) ? updates.crawlFrequency : current.crawlFrequency,
        maxCrawlPages: updates.maxCrawlPages !== undefined ? Math.min(120, Math.max(10, parseInt(updates.maxCrawlPages, 10) || 60)) : current.maxCrawlPages
    };

    if (updates.ga4PropertyId !== undefined) {
        const rawGa4 = String(updates.ga4PropertyId).trim();
        if (rawGa4) {
            const check = validateAndNormalizeGa4PropertyId(rawGa4, next.ga4MeasurementId);
            if (!check.valid) {
                throw new Error(check.message);
            }
            next.ga4PropertyId = check.propertyId;
        } else {
            next.ga4PropertyId = '';
        }
    }

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
    else if (range === '3m' || range === '90d') days = 90;
    else if (range === '6m') days = 180;
    else if (range === '12m' || range === '1y') days = 365;
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
        range: ['7d', '28d', '3m', '90d', '6m', '12m'].includes(range) ? range : '28d',
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
            err.retryAfter = res.headers && typeof res.headers.get === 'function'
                ? res.headers.get('retry-after')
                : null;
            throw err;
        }
        return json;
    } finally {
        clearTimeout(timer);
    }
}

async function listSearchConsoleSites(token) {
    const data = await fetchJsonWithTimeout('https://www.googleapis.com/webmasters/v3/sites', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }, 10000);

    const rawEntries = Array.isArray(data?.siteEntry) ? data.siteEntry : [];
    return rawEntries
        .filter((entry) => entry && entry.siteUrl)
        .map((entry) => {
            const siteUrl = String(entry.siteUrl).trim();
            const permissionLevel = String(entry.permissionLevel || 'siteUnverifiedUser').trim();
            const isDomainProperty = siteUrl.toLowerCase().startsWith('sc-domain:');
            const hasAccess = VERIFIED_GSC_PERMISSION_LEVELS.has(permissionLevel);
            return {
                siteUrl,
                permissionLevel,
                isDomainProperty,
                hasAccess
            };
        })
        .sort((a, b) => {
            if (a.siteUrl.toLowerCase() === DEFAULT_GSC_PROPERTY) return -1;
            if (b.siteUrl.toLowerCase() === DEFAULT_GSC_PROPERTY) return 1;
            if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
            if (a.isDomainProperty !== b.isDomainProperty) return a.isDomainProperty ? -1 : 1;
            return a.siteUrl.localeCompare(b.siteUrl);
        });
}

function resolvePropertyAgainstSitesList(rawConfiguredProperty, sites = []) {
    const raw = String(rawConfiguredProperty || '').trim();
    const normalized = normalizeGscPropertyIdentifier(raw) || DEFAULT_GSC_PROPERTY;
    const domainEntry = sites.find((s) => s.siteUrl.toLowerCase() === DEFAULT_GSC_PROPERTY) || null;

    // 1. If a URL-prefix property was explicitly configured and exists in sites.list, use its exact URL from Google's Sites API
    if (/^https?:\/\//i.test(raw)) {
        const cleanRaw = raw.replace(/\/+$/, '').toLowerCase();
        const urlPrefixMatch = sites.find(
            (s) => !s.isDomainProperty && s.siteUrl.replace(/\/+$/, '').toLowerCase() === cleanRaw
        );
        if (urlPrefixMatch) {
            return {
                targetProperty: urlPrefixMatch.siteUrl,
                matchedEntry: urlPrefixMatch,
                hasDomainProperty: Boolean(domainEntry)
            };
        }

        // If the configured value was a legacy Hangbug URL (e.g. http://hangbug.com or https://www.hangbug.com/)
        // and the account's actual property in sites.list is the Domain property sc-domain:hangbug.com, use sc-domain:hangbug.com
        if (isLegacyHangbugUrlCandidate(raw)) {
            if (domainEntry) {
                return {
                    targetProperty: domainEntry.siteUrl,
                    matchedEntry: domainEntry,
                    hasDomainProperty: true
                };
            }
            if (/^http:\/\/(www\.)?hangbug\.com\/?$/i.test(raw)) {
                return {
                    targetProperty: DEFAULT_GSC_PROPERTY,
                    matchedEntry: null,
                    hasDomainProperty: false
                };
            }
        }

        return {
            targetProperty: normalized,
            matchedEntry: null,
            hasDomainProperty: Boolean(domainEntry)
        };
    }

    // 2. Domain property (e.g. sc-domain:hangbug.com or bare hangbug.com normalized to sc-domain:hangbug.com)
    const exactMatch = sites.find((s) => s.siteUrl.toLowerCase() === normalized.toLowerCase()) || null;
    if (exactMatch) {
        return {
            targetProperty: exactMatch.siteUrl,
            matchedEntry: exactMatch,
            hasDomainProperty: Boolean(domainEntry)
        };
    }

    return {
        targetProperty: normalized,
        matchedEntry: null,
        hasDomainProperty: Boolean(domainEntry)
    };
}

async function verifySearchConsoleServiceAccount(config) {
    const cleanDomain = normalizeDomain(config.domain);
    const saEmail = String(config.googleServiceAccountEmail || '').trim();
    const hasCreds = Boolean((saEmail && config.googlePrivateKey) || config.googleAccessToken);
    const candidateInput = config.rawGscProperty || config.gscProperty || DEFAULT_GSC_PROPERTY;
    const defaultTarget = /^http:\/\/(www\.)?hangbug\.com\/?$/i.test(String(candidateInput).trim())
        ? DEFAULT_GSC_PROPERTY
        : (normalizeGscPropertyIdentifier(candidateInput) || DEFAULT_GSC_PROPERTY);

    if (!hasCreds) {
        const unconfigured = {
            authenticated: false,
            authStatus: 'Not Configured',
            serviceAccountEmail: saEmail,
            availableProperties: [],
            selectedProperty: defaultTarget,
            permissionLevel: null,
            propertyVerified: false,
            hasDomainProperty: false,
            message: 'Google Search Console is not connected yet. Paste your Google Service Account JSON key in Settings and grant its client_email access in Google Search Console.'
        };
        memoryVerifications.set(cleanDomain, unconfigured);
        return unconfigured;
    }

    let token;
    try {
        token = await getGoogleAccessToken(config, [GSC_READONLY_SCOPE]);
        if (!token) {
            throw new Error('No access token returned from Service Account credentials.');
        }
    } catch (authErr) {
        const failedAuth = {
            authenticated: false,
            authStatus: 'Authentication Failed',
            serviceAccountEmail: saEmail,
            availableProperties: [],
            selectedProperty: defaultTarget,
            permissionLevel: null,
            propertyVerified: false,
            hasDomainProperty: false,
            message: `Google Service Account authentication failed: ${authErr.message}. Verify your Service Account Email and Private Key JSON.`
        };
        memoryVerifications.set(cleanDomain, failedAuth);
        return failedAuth;
    }

    let sites = [];
    try {
        sites = await listSearchConsoleSites(token);
    } catch (sitesErr) {
        const failedSites = {
            authenticated: false,
            authStatus: 'Authentication Failed',
            serviceAccountEmail: saEmail,
            availableProperties: [],
            selectedProperty: defaultTarget,
            permissionLevel: null,
            propertyVerified: false,
            hasDomainProperty: false,
            message: `Google Search Console Sites API (sites.list) request failed: ${sitesErr.message}. Ensure the Google Search Console API is enabled in your Google Cloud project.`
        };
        memoryVerifications.set(cleanDomain, failedSites);
        return failedSites;
    }

    const { targetProperty, matchedEntry, hasDomainProperty } = resolvePropertyAgainstSitesList(candidateInput, sites);

    if (!matchedEntry) {
        const emailLabel = saEmail || 'your service account client_email';
        const availableSummary = sites.length > 0
            ? ` Accessible properties returned by sites.list: ${sites.map((s) => `${s.siteUrl} (${s.permissionLevel})`).join(', ')}.`
            : ' Google Search Console sites.list returned 0 accessible properties for this service account.';
        const missingMsg = `Property "${targetProperty}" was not found in Google Search Console sites.list for service account "${emailLabel}". Open Google Search Console -> Settings -> Users and permissions for property "${targetProperty}" (Domain property hangbug.com) and add "${emailLabel}" with Restricted or Full permission.${availableSummary}`;

        const missingResult = {
            authenticated: true,
            authStatus: 'Authenticated',
            serviceAccountEmail: saEmail,
            availableProperties: sites,
            selectedProperty: targetProperty,
            permissionLevel: null,
            propertyVerified: false,
            hasDomainProperty,
            token,
            message: missingMsg
        };
        memoryVerifications.set(cleanDomain, { ...missingResult, token: undefined });
        return missingResult;
    }

    if (!matchedEntry.hasAccess) {
        const emailLabel = saEmail || 'service account';
        const insufficientMsg = `Service account "${emailLabel}" has insufficient Google Search Console permission level "${matchedEntry.permissionLevel}" for property "${matchedEntry.siteUrl}". Please grant Restricted (siteRestrictedUser) or Full (siteFullUser) permission in Google Search Console -> Settings -> Users and permissions.`;

        const insufficientResult = {
            authenticated: true,
            authStatus: 'Authenticated',
            serviceAccountEmail: saEmail,
            availableProperties: sites,
            selectedProperty: matchedEntry.siteUrl,
            permissionLevel: matchedEntry.permissionLevel,
            propertyVerified: false,
            hasDomainProperty,
            token,
            message: insufficientMsg
        };
        memoryVerifications.set(cleanDomain, { ...insufficientResult, token: undefined });
        return insufficientResult;
    }

    // Persist canonical property identifier from sites.list (e.g. sc-domain:hangbug.com) if config had a legacy value
    if (config.gscProperty !== matchedEntry.siteUrl) {
        config.gscProperty = matchedEntry.siteUrl;
        config.rawGscProperty = matchedEntry.siteUrl;
        if (memoryConfigs.has(cleanDomain)) {
            memoryConfigs.set(cleanDomain, {
                ...memoryConfigs.get(cleanDomain),
                gscProperty: matchedEntry.siteUrl
            });
        }
    }

    const verifiedResult = {
        authenticated: true,
        authStatus: 'Authenticated',
        serviceAccountEmail: saEmail,
        availableProperties: sites,
        selectedProperty: matchedEntry.siteUrl,
        permissionLevel: matchedEntry.permissionLevel,
        propertyVerified: true,
        hasDomainProperty,
        token,
        message: `Authenticated as ${saEmail || 'Service Account'}. Verified ${matchedEntry.permissionLevel} access to ${matchedEntry.siteUrl}.`
    };
    memoryVerifications.set(cleanDomain, { ...verifiedResult, token: undefined });
    return verifiedResult;
}

async function fetchSearchConsolePerformance(config, dateRange) {
    const verification = await verifySearchConsoleServiceAccount(config);
    const gscProperty = verification.selectedProperty;

    if (!verification.authenticated || !verification.propertyVerified) {
        return {
            connected: false,
            authenticated: verification.authenticated,
            authStatus: verification.authStatus,
            serviceAccountEmail: verification.serviceAccountEmail,
            source: 'Google Search Console',
            property: gscProperty || DEFAULT_GSC_PROPERTY,
            permissionLevel: verification.permissionLevel,
            availableProperties: verification.availableProperties,
            dateRange,
            comparisonAvailable: false,
            reason: verification.message,
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
        const token = verification.token;
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
            authenticated: true,
            authStatus: 'Authenticated',
            serviceAccountEmail: verification.serviceAccountEmail,
            source: 'Google Search Console (Verified)',
            property: gscProperty,
            permissionLevel: verification.permissionLevel,
            availableProperties: verification.availableProperties,
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
        const saEmail = verification.serviceAccountEmail || config.googleServiceAccountEmail || 'service account';
        return {
            connected: false,
            authenticated: verification.authenticated,
            authStatus: verification.authStatus,
            serviceAccountEmail: saEmail,
            error: true,
            source: 'Google Search Console',
            property: gscProperty,
            permissionLevel: verification.permissionLevel,
            availableProperties: verification.availableProperties,
            dateRange,
            comparisonAvailable: false,
            reason: `Google Search Console API request failed for property "${gscProperty}": ${err.message}. Ensure service account "${saEmail}" is added in Google Search Console -> Settings -> Users and permissions for "${gscProperty}".`,
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
    const verification = await verifySearchConsoleServiceAccount(config);
    const gscProperty = verification.selectedProperty;

    if (!verification.authenticated || !verification.propertyVerified) {
        return {
            gscConnected: false,
            property: gscProperty,
            permissionLevel: verification.permissionLevel,
            reason: verification.message || 'Google Search Console API is not connected; showing live Hangbug crawlability inspection only.'
        };
    }

    try {
        const token = verification.token;
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
            property: gscProperty,
            permissionLevel: verification.permissionLevel,
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
            gscConnected: false,
            property: gscProperty,
            permissionLevel: verification.permissionLevel,
            error: err.message
        };
    }
}

function classifyGa4ApiError(err, { propertyId, serviceAccountEmail, measurementId = DEFAULT_GA4_MEASUREMENT_ID } = {}) {
    const rawMsg = String(err?.message || '').trim();
    const lower = rawMsg.toLowerCase();
    const status = Number(err?.status || 0);
    const payloadStr = JSON.stringify(err?.payload || {}).toLowerCase();
    const saLabel = serviceAccountEmail || 'configured service account';
    const propLabel = propertyId ? `properties/${propertyId}` : 'your GA4 property';

    if (
        err?.isCredentialError
        || lower.includes('private_key')
        || lower.includes('decoder routines')
        || lower.includes('pem')
        || lower.includes('invalid_grant')
        || lower.includes('invalid_client')
        || lower.includes('failed to mint google oauth2 access token')
    ) {
        return {
            errorCategory: 'invalid_credentials',
            message: `Invalid Google Service Account JSON credentials: ${rawMsg}. Verify your Service Account Email and Private Key in Settings.`
        };
    }

    if (
        (status === 403 || lower.includes('403'))
        && (
            lower.includes('service_disabled')
            || payloadStr.includes('service_disabled')
            || lower.includes('analyticsdata.googleapis.com')
            || lower.includes('has not been used in project')
            || lower.includes('is disabled')
        )
    ) {
        return {
            errorCategory: 'api_disabled',
            message: `Google Analytics Data API is disabled in the Service Account's Google Cloud project. Open Google Cloud Console -> APIs & Services -> Library and enable "Google Analytics Data API" (analyticsdata.googleapis.com).`
        };
    }

    if (
        status === 403
        || lower.includes('permission')
        || lower.includes('sufficient permissions')
        || payloadStr.includes('permission_denied')
    ) {
        return {
            errorCategory: 'missing_permission',
            message: `Missing service account permission: Service account "${saLabel}" does not have Viewer access to GA4 property ${propLabel}. Open Google Analytics -> Admin -> Property Access Management for property ${propertyId || ''} and grant "${saLabel}" at least the Viewer role.`
        };
    }

    if (
        status === 429
        || lower.includes('quota')
        || lower.includes('rate limit')
        || lower.includes('resource_exhausted')
        || payloadStr.includes('resource_exhausted')
    ) {
        return {
            errorCategory: 'quota_exceeded',
            message: `Google Analytics Data API quota exceeded for ${propLabel}: ${rawMsg}. Please wait a few minutes before retrying.`
        };
    }

    if (
        status === 400
        || status === 404
        || lower.includes('invalid_argument')
        || lower.includes('not found')
        || lower.includes('property')
    ) {
        return {
            errorCategory: 'invalid_property_id',
            message: `Invalid GA4 Property ID (${propLabel}): ${rawMsg}. Verify the numeric Property ID in Google Analytics -> Admin -> Property Details (never use the Measurement ID ${measurementId}).`
        };
    }

    return {
        errorCategory: 'api_error',
        message: `GA4 Data API request failed for ${propLabel}: ${rawMsg}`
    };
}

async function fetchGa4Performance(config, dateRange) {
    const cleanDomain = normalizeDomain(config.domain);
    const measurementId = config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID;
    const saEmail = String(config.googleServiceAccountEmail || '').trim();
    const hasCreds = Boolean((saEmail && config.googlePrivateKey) || config.googleAccessToken);
    const propCheck = validateAndNormalizeGa4PropertyId(config.ga4PropertyId, measurementId);

    if (!hasCreds) {
        const reason = `GA4 tracking tag (${measurementId}) is active on Hangbug, but Google Service Account JSON credentials are not configured yet for server-side GA4 Data API reporting.`;
        memoryGa4Verifications.set(cleanDomain, {
            connected: false,
            propertyId: propCheck.propertyId,
            resourceName: propCheck.resourceName,
            measurementId,
            serviceAccountEmail: saEmail,
            errorCategory: 'invalid_credentials',
            syncedAt: null,
            message: reason
        });
        return {
            connected: false,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId: propCheck.propertyId,
            resourceName: propCheck.resourceName,
            serviceAccountEmail: saEmail,
            errorCategory: 'invalid_credentials',
            tagVerified: true,
            source: 'Google Analytics 4',
            reason,
            summary: null,
            topLandingPages: [],
            trafficSources: [],
            countries: [],
            devices: [],
            dailyTraffic: [],
            syncedAt: null
        };
    }

    if (!propCheck.valid) {
        memoryGa4Verifications.set(cleanDomain, {
            connected: false,
            propertyId: propCheck.propertyId,
            resourceName: '',
            measurementId,
            serviceAccountEmail: saEmail,
            errorCategory: propCheck.errorCategory,
            syncedAt: null,
            message: propCheck.message
        });
        return {
            connected: false,
            error: true,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId: propCheck.propertyId,
            resourceName: '',
            serviceAccountEmail: saEmail,
            errorCategory: propCheck.errorCategory,
            tagVerified: true,
            source: 'Google Analytics 4',
            reason: propCheck.message,
            summary: null,
            topLandingPages: [],
            trafficSources: [],
            countries: [],
            devices: [],
            dailyTraffic: [],
            syncedAt: null
        };
    }

    const propertyId = propCheck.propertyId;
    const resourceName = propCheck.resourceName;

    try {
        let token;
        try {
            token = await getGoogleAccessToken(config, [GA4_READONLY_SCOPE]);
            if (!token) {
                throw new Error('Failed to mint Google Analytics Data API access token from Service Account JSON.');
            }
        } catch (credErr) {
            credErr.isCredentialError = true;
            throw credErr;
        }

        const endpoint = `https://analyticsdata.googleapis.com/v1beta/${resourceName}:runReport`;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const [
            totalsCurrRes,
            totalsPrevRes,
            dailyRes,
            landingRes,
            sourcesRes,
            countriesRes,
            devicesRes
        ] = await Promise.all([
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'totalUsers' },
                        { name: 'sessions' },
                        { name: 'newUsers' },
                        { name: 'screenPageViews' },
                        { name: 'bounceRate' },
                        { name: 'userEngagementDuration' },
                        { name: 'engagedSessions' },
                        { name: 'engagementRate' }
                    ]
                })
            }),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.prevStartDate, endDate: dateRange.prevEndDate }],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'totalUsers' },
                        { name: 'sessions' },
                        { name: 'newUsers' },
                        { name: 'screenPageViews' }
                    ]
                })
            }).catch(() => ({ rows: [] })),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'date' }],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'engagedSessions' },
                        { name: 'screenPageViews' }
                    ],
                    orderBys: [{ dimension: { dimensionName: 'date' } }]
                })
            }).catch(() => ({ rows: [] })),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'landingPagePlusQueryString' }],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'screenPageViews' },
                        { name: 'bounceRate' },
                        { name: 'engagementRate' }
                    ],
                    limit: 25
                })
            }).catch(() => ({ rows: [] })),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'newUsers' },
                        { name: 'screenPageViews' },
                        { name: 'engagementRate' }
                    ],
                    limit: 15
                })
            }).catch(() => ({ rows: [] })),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'country' }],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'totalUsers' },
                        { name: 'sessions' }
                    ],
                    limit: 20
                })
            }).catch(() => ({ rows: [] })),
            fetchJsonWithTimeout(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    dateRanges: [{ startDate: dateRange.startDate, endDate: dateRange.endDate }],
                    dimensions: [{ name: 'deviceCategory' }],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'sessions' },
                        { name: 'screenPageViews' }
                    ],
                    limit: 10
                })
            }).catch(() => ({ rows: [] }))
        ]);

        const currRow = totalsCurrRes?.rows?.[0]?.metricValues || [];
        const prevRow = totalsPrevRes?.rows?.[0]?.metricValues || [];

        const activeUsers = Number(currRow[0]?.value || 0);
        const totalUsers = Number(currRow[1]?.value || 0);
        const sessions = Number(currRow[2]?.value || 0);
        const newUsers = Number(currRow[3]?.value || 0);
        const pageViews = Number(currRow[4]?.value || 0);
        const bounceRate = Number((Number(currRow[5]?.value || 0) * 100).toFixed(1));
        const engagementDurationSec = Number(currRow[6]?.value || 0);
        const engagedSessions = Number(currRow[7]?.value || 0);
        const engagementRate = currRow[8]?.value !== undefined
            ? Number((Number(currRow[8].value) * 100).toFixed(1))
            : (sessions > 0 ? Number(((engagedSessions / sessions) * 100).toFixed(1)) : 0);

        const avgEngagementTimeSec = activeUsers > 0
            ? Number((engagementDurationSec / activeUsers).toFixed(1))
            : (sessions > 0 ? Number((engagementDurationSec / sessions).toFixed(1)) : 0);
        const avgEngagementTimeFormatted = formatDurationSeconds(avgEngagementTimeSec);

        const prevActiveUsers = prevRow.length > 0 ? Number(prevRow[0]?.value || 0) : null;
        const prevTotalUsers = prevRow.length > 0 ? Number(prevRow[1]?.value || 0) : null;
        const prevSessions = prevRow.length > 0 ? Number(prevRow[2]?.value || 0) : null;

        const dailyTraffic = (dailyRes.rows || []).map((row) => {
            const rawDate = row.dimensionValues?.[0]?.value || '';
            const formattedDate = rawDate.length === 8
                ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
                : rawDate;
            const s = Number(row.metricValues?.[0]?.value || 0);
            const u = Number(row.metricValues?.[1]?.value || 0);
            const eng = Number(row.metricValues?.[2]?.value || 0);
            const pv = Number(row.metricValues?.[3]?.value || 0);
            return {
                date: formattedDate,
                sessions: s,
                activeUsers: u,
                organicSessions: s,
                organicUsers: u,
                engagedSessions: eng,
                pageViews: pv
            };
        });

        const topLandingPages = (landingRes.rows || []).map((row) => {
            const p = row.dimensionValues?.[0]?.value || '/';
            const s = Number(row.metricValues?.[0]?.value || 0);
            const u = Number(row.metricValues?.[1]?.value || 0);
            const pv = Number(row.metricValues?.[2]?.value || 0);
            const br = Number((Number(row.metricValues?.[3]?.value || 0) * 100).toFixed(1));
            const er = Number((Number(row.metricValues?.[4]?.value || 0) * 100).toFixed(1));
            return {
                path: p,
                sessions: s,
                users: u,
                activeUsers: u,
                pageViews: pv,
                bounceRate: br,
                engagementRate: er
            };
        });

        const rawSources = (sourcesRes.rows || []).map((row) => ({
            channel: row.dimensionValues?.[0]?.value || 'Unassigned',
            sessions: Number(row.metricValues?.[0]?.value || 0),
            activeUsers: Number(row.metricValues?.[1]?.value || 0),
            newUsers: Number(row.metricValues?.[2]?.value || 0),
            pageViews: Number(row.metricValues?.[3]?.value || 0),
            engagementRate: Number((Number(row.metricValues?.[4]?.value || 0) * 100).toFixed(1))
        }));
        const totalSourceSessions = rawSources.reduce((acc, r) => acc + r.sessions, 0) || sessions;
        const trafficSources = rawSources.map((r) => ({
            ...r,
            sharePct: totalSourceSessions > 0 ? Number(((r.sessions / totalSourceSessions) * 100).toFixed(1)) : 0
        }));

        const organicChannel = trafficSources.find((s) => s.channel.toLowerCase() === 'organic search');
        const organicSessions = organicChannel ? organicChannel.sessions : sessions;
        const organicUsers = organicChannel ? organicChannel.activeUsers : activeUsers;

        const rawCountries = (countriesRes.rows || []).map((row) => ({
            country: row.dimensionValues?.[0]?.value || 'Unknown',
            activeUsers: Number(row.metricValues?.[0]?.value || 0),
            totalUsers: Number(row.metricValues?.[1]?.value || 0),
            sessions: Number(row.metricValues?.[2]?.value || 0)
        }));
        const totalCountryUsers = rawCountries.reduce((acc, c) => acc + c.activeUsers, 0) || activeUsers;
        const countries = rawCountries.map((c) => ({
            ...c,
            sharePct: totalCountryUsers > 0 ? Number(((c.activeUsers / totalCountryUsers) * 100).toFixed(1)) : 0
        }));

        const rawDevices = (devicesRes.rows || []).map((row) => {
            const dev = String(row.dimensionValues?.[0]?.value || 'other').toLowerCase();
            return {
                device: dev,
                label: dev.charAt(0).toUpperCase() + dev.slice(1),
                activeUsers: Number(row.metricValues?.[0]?.value || 0),
                sessions: Number(row.metricValues?.[1]?.value || 0),
                pageViews: Number(row.metricValues?.[2]?.value || 0)
            };
        });
        const totalDeviceSessions = rawDevices.reduce((acc, d) => acc + d.sessions, 0) || sessions;
        const devices = rawDevices.map((d) => ({
            ...d,
            sharePct: totalDeviceSessions > 0 ? Number(((d.sessions / totalDeviceSessions) * 100).toFixed(1)) : 0
        }));

        const hasData = Boolean(totalUsers > 0 || sessions > 0 || pageViews > 0);
        const syncedAt = new Date().toISOString();

        const result = {
            connected: true,
            hasData,
            noDataMessage: hasData
                ? null
                : `Connected to GA4 property ${resourceName}, but no available reporting data was found for ${dateRange.startDate} to ${dateRange.endDate}.`,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId,
            resourceName,
            serviceAccountEmail: saEmail,
            tagVerified: true,
            source: 'Google Analytics 4 Data API (Verified)',
            reason: null,
            summary: {
                activeUsers,
                totalUsers,
                sessions,
                newUsers,
                pageViews,
                bounceRate,
                avgEngagementTimeSec,
                avgEngagementTimeFormatted,
                engagedSessions,
                engagementRate,
                organicSessions,
                organicUsers,
                sessionsChangePct: pctDelta(sessions, prevSessions),
                usersChangePct: pctDelta(activeUsers, prevActiveUsers),
                totalUsersChangePct: pctDelta(totalUsers, prevTotalUsers)
            },
            dailyTraffic,
            topLandingPages,
            trafficSources,
            countries,
            devices,
            syncedAt
        };

        memoryGa4Verifications.set(cleanDomain, {
            connected: true,
            propertyId,
            resourceName,
            measurementId,
            serviceAccountEmail: saEmail,
            errorCategory: null,
            syncedAt,
            message: `Connected to GA4 Property ${resourceName} (Tag: ${measurementId}).`
        });

        await saveSnapshot(config.domain, `ga4_${dateRange.range}`, result, 'Google Analytics 4 Data API');
        return result;
    } catch (err) {
        const classified = classifyGa4ApiError(err, {
            propertyId,
            serviceAccountEmail: saEmail,
            measurementId
        });

        memoryGa4Verifications.set(cleanDomain, {
            connected: false,
            propertyId,
            resourceName,
            measurementId,
            serviceAccountEmail: saEmail,
            errorCategory: classified.errorCategory,
            syncedAt: null,
            message: classified.message
        });

        return {
            connected: false,
            error: true,
            errorCategory: classified.errorCategory,
            measurementId,
            streamId: DEFAULT_GA4_STREAM_ID,
            propertyId,
            resourceName,
            serviceAccountEmail: saEmail,
            tagVerified: true,
            source: 'Google Analytics 4',
            reason: classified.message,
            summary: null,
            topLandingPages: [],
            trafficSources: [],
            countries: [],
            devices: [],
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

function validatePageSpeedApiKey(rawKey) {
    const key = String(rawKey ?? '').trim();
    if (!key) {
        return {
            valid: false,
            errorCategory: 'missing_api_key',
            httpStatus: 400,
            userMessage:
                'Google PageSpeed API key (PAGESPEED_API_KEY) is not configured on the backend. Add PAGESPEED_API_KEY to your server environment variables to run authenticated PageSpeed Insights audits.',
            message:
                'PAGESPEED_API_KEY is missing. Configure PAGESPEED_API_KEY in backend environment variables (or SEO Settings) before running live PageSpeed audits.'
        };
    }

    if (isMaskedPlaceholder(key) || /\s/.test(key) || key.length < 16 || key.length > 128 || !/^[A-Za-z0-9_-]+$/.test(key)) {
        return {
            valid: false,
            errorCategory: 'invalid_api_key',
            httpStatus: 400,
            userMessage:
                'The configured Google PageSpeed API key (PAGESPEED_API_KEY) is invalid. Verify that a valid Google Cloud API key is set on the backend.',
            message:
                'Invalid PAGESPEED_API_KEY format. Expected a valid server-side Google Cloud API key.'
        };
    }

    return {
        valid: true,
        errorCategory: null,
        httpStatus: 200,
        userMessage: '',
        message: ''
    };
}

function validateAndNormalizePageSpeedUrl(config = {}, targetUrl = '') {
    const allowedOrigin = String(config?.siteUrl || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
    const rawTarget = String(targetUrl ?? '').trim();
    let candidate = rawTarget || `${allowedOrigin}/`;

    if (/\s/.test(candidate)) {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: 'Invalid URL for PageSpeed audit. URLs cannot contain spaces.',
            message: 'Invalid target URL for PageSpeed check (contains whitespace).'
        };
    }

    if (/^(javascript|data|mailto|tel|ftp|file):/i.test(candidate)) {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: 'Invalid URL scheme for PageSpeed audit. Only HTTP/HTTPS Hangbug URLs are allowed.',
            message: 'Invalid target URL protocol for PageSpeed check.'
        };
    }

    if (candidate.startsWith('/')) {
        if (candidate.startsWith('//')) {
            return {
                valid: false,
                errorCategory: 'invalid_url',
                httpStatus: 400,
                canonicalUrl: '',
                normalizedPath: '',
                userMessage: 'Invalid protocol-relative URL for PageSpeed audit.',
                message: 'Invalid target URL for PageSpeed check.'
            };
        }
        candidate = `${allowedOrigin}${candidate}`;
    } else if (!/^https?:\/\//i.test(candidate)) {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: 'Invalid target URL for PageSpeed audit. Select a Hangbug page path (e.g. / or /technologies) or a full https://www.hangbug.com URL.',
            message: 'Invalid target URL for PageSpeed check.'
        };
    }

    let parsed;
    try {
        parsed = new URL(candidate);
    } catch {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: 'Invalid target URL for PageSpeed audit.',
            message: 'Invalid target URL for PageSpeed check.'
        };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: 'Invalid URL protocol for PageSpeed audit.',
            message: 'Invalid target URL protocol for PageSpeed check.'
        };
    }

    const allowedHost = normalizeDomain(config?.domain || DEFAULT_DOMAIN);
    const targetHost = normalizeDomain(parsed.hostname);
    if (
        !targetHost
        || (targetHost !== allowedHost && targetHost !== 'www.hangbug.com' && targetHost !== 'hangbug.com')
    ) {
        return {
            valid: false,
            errorCategory: 'invalid_url',
            httpStatus: 400,
            canonicalUrl: '',
            normalizedPath: '',
            userMessage: `PageSpeed checks are restricted to your configured Hangbug domain (${allowedHost}).`,
            message: `PageSpeed checks are restricted to your configured domain (${allowedHost}).`
        };
    }

    const cleanPathname = !parsed.pathname || parsed.pathname === '/'
        ? '/'
        : parsed.pathname.replace(/\/+$/, '');
    const canonicalUrl = `${parsed.origin}${cleanPathname}`;

    return {
        valid: true,
        errorCategory: null,
        httpStatus: 200,
        canonicalUrl,
        normalizedPath: cleanPathname,
        userMessage: '',
        message: ''
    };
}

function extractGoogleProjectNumberFromError(err) {
    const details = err?.payload?.error?.details;
    if (Array.isArray(details)) {
        for (const item of details) {
            const consumer = String(item?.metadata?.consumer || '');
            const consumerMatch = consumer.match(/projects\/(\d+)/i) || consumer.match(/project_number:(\d+)/i);
            if (consumerMatch) {
                return consumerMatch[1];
            }
        }
    }

    const rawText = `${err?.message || ''} ${JSON.stringify(err?.payload || {})}`;
    const match =
        rawText.match(/project_number:(\d{6,20})/i)
        || rawText.match(/projects\/(\d{6,20})/i)
        || rawText.match(/\bproject\s+(\d{6,20})\b/i);
    return match ? match[1] : null;
}

function computeNextDailyQuotaResetIso(nowInput = new Date(), retryAfterHeader = null) {
    const now = nowInput instanceof Date ? nowInput : new Date(nowInput);
    if (retryAfterHeader !== null && retryAfterHeader !== undefined && String(retryAfterHeader).trim() !== '') {
        const raw = String(retryAfterHeader).trim();
        if (/^\d+$/.test(raw)) {
            const secs = Math.max(1, parseInt(raw, 10));
            return new Date(now.getTime() + secs * 1000).toISOString();
        }
        const parsedDate = new Date(raw);
        if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() > now.getTime()) {
            return parsedDate.toISOString();
        }
    }

    // Google Cloud daily API quotas reset at midnight Pacific Time (America/Los_Angeles, UTC-8 / UTC-7)
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 8, 0, 0, 0));
    if (nextReset.getTime() <= now.getTime()) {
        nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    return nextReset.toISOString();
}

function computeNextRateLimitRetryIso(nowInput = new Date(), retryAfterHeader = null, fallbackSeconds = 60) {
    const now = nowInput instanceof Date ? nowInput : new Date(nowInput);
    if (retryAfterHeader !== null && retryAfterHeader !== undefined && String(retryAfterHeader).trim() !== '') {
        const raw = String(retryAfterHeader).trim();
        if (/^\d+$/.test(raw)) {
            const secs = Math.max(1, parseInt(raw, 10));
            return new Date(now.getTime() + secs * 1000).toISOString();
        }
        const parsedDate = new Date(raw);
        if (!Number.isNaN(parsedDate.getTime()) && parsedDate.getTime() > now.getTime()) {
            return parsedDate.toISOString();
        }
    }
    return new Date(now.getTime() + fallbackSeconds * 1000).toISOString();
}

function classifyPageSpeedApiError(err, context = {}) {
    const rawKey = context.rawKey || '';
    const rawMsg = redactPageSpeedApiKey(err?.message || '', rawKey).trim();
    const lower = rawMsg.toLowerCase();
    const status = Number(err?.status || err?.httpStatus || 0);
    const redactedPayloadStr = redactPageSpeedApiKey(JSON.stringify(err?.payload || {}), rawKey);
    const payloadLower = redactedPayloadStr.toLowerCase();
    const detectedProject = extractGoogleProjectNumberFromError(err) || context.detectedProjectNumber || null;
    const explicitExpectedProject = String(
        context.expectedProjectNumber
        || process.env.GOOGLE_CLOUD_PROJECT_NUMBER
        || process.env.PAGESPEED_PROJECT_NUMBER
        || ''
    ).trim();
    const expectedProject = explicitExpectedProject || PAGESPEED_EXPECTED_PROJECT_NUMBER;

    if (err?.errorCategory === 'missing_api_key') {
        return {
            errorCategory: 'missing_api_key',
            httpStatus: 400,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: null,
            projectVerified: false,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage:
                err.userMessage
                || 'Google PageSpeed API key (PAGESPEED_API_KEY) is not configured on the backend. Add PAGESPEED_API_KEY to your server environment variables to run authenticated PageSpeed Insights audits.',
            message: rawMsg || 'PAGESPEED_API_KEY is missing on the backend.'
        };
    }

    if (err?.errorCategory === 'invalid_url') {
        return {
            errorCategory: 'invalid_url',
            httpStatus: 400,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: true,
            projectVerified: true,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage: err.userMessage || rawMsg || 'Invalid target URL for PageSpeed audit.',
            message: rawMsg || 'Invalid target URL for PageSpeed check.'
        };
    }

    if (
        err?.errorCategory === 'invalid_api_key'
        || lower.includes('api key not valid')
        || lower.includes('api key expired')
        || lower.includes('api_key_invalid')
        || payloadLower.includes('api_key_invalid')
        || payloadLower.includes('api_key_expired')
        || payloadLower.includes('keyinvalid')
        || payloadLower.includes('keyexpired')
        || payloadLower.includes('api_key_service_blocked')
        || payloadLower.includes('api_key_http_referrer_blocked')
        || payloadLower.includes('api_key_ip_address_blocked')
        || payloadLower.includes('iprefererblocked')
        || ((lower.includes('referer') || lower.includes('referrer')) && lower.includes('blocked'))
        || lower.includes('bad api key')
    ) {
        const projectSuffix = explicitExpectedProject
            ? ` for Google Cloud project ${explicitExpectedProject}`
            : '';
        return {
            errorCategory: 'invalid_api_key',
            httpStatus: status === 403 ? 403 : 400,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: null,
            projectVerified: false,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage:
                `The configured Google PageSpeed API key (PAGESPEED_API_KEY) is invalid or restricted. Verify that PAGESPEED_API_KEY is a valid backend API key${projectSuffix} with PageSpeed Insights API permitted.`,
            message: `Invalid Google PageSpeed API key: ${rawMsg || 'API_KEY_INVALID'}`
        };
    }

    // If an explicit expected project number is enforced and the error consumer belongs to a different Google Cloud project
    if (
        context.enforceProjectMatch
        && expectedProject
        && detectedProject
        && detectedProject !== expectedProject
    ) {
        return {
            errorCategory: 'invalid_api_key',
            httpStatus: 403,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: null,
            projectVerified: false,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage:
                `The configured PAGESPEED_API_KEY belongs to Google Cloud project ${detectedProject}, which does not match the expected project ${expectedProject}.`,
            message:
                `Google Cloud project mismatch: key belongs to project ${detectedProject}, expected project ${expectedProject}.`
        };
    }

    // API disabled in Google Cloud project
    if (
        err?.errorCategory === 'api_disabled'
        || (
            (status === 403 || lower.includes('403') || payloadLower.includes('permission_denied'))
            && (
                lower.includes('service_disabled')
                || payloadLower.includes('service_disabled')
                || payloadLower.includes('accessnotconfigured')
                || lower.includes('has not been used in project')
                || lower.includes('is disabled')
                || (lower.includes('pagespeedonline.googleapis.com') && lower.includes('enable'))
            )
        )
    ) {
        const projLabel = detectedProject || explicitExpectedProject || null;
        const projPhrase = projLabel ? ` in Google Cloud project ${projLabel}` : '';
        return {
            errorCategory: 'api_disabled',
            httpStatus: 403,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: false,
            projectVerified: !detectedProject || detectedProject === expectedProject,
            projectNumber: projLabel || expectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage:
                `PageSpeed Insights API (${PAGESPEED_API_SERVICE}) is not enabled${projPhrase}. Enable "PageSpeed Insights API" in Google Cloud Console -> APIs & Services -> Library.`,
            message:
                `PageSpeed Insights API (${PAGESPEED_API_SERVICE}) is disabled${projLabel ? ` for Google Cloud project ${projLabel}` : ''}: ${rawMsg}`
        };
    }

    // Daily quota exhausted vs Requests-per-minute limit
    const isQuotaOr429 =
        status === 429
        || err?.errorCategory === 'daily_quota_exceeded'
        || err?.errorCategory === 'rate_limit_exceeded'
        || lower.includes('quota exceeded')
        || lower.includes('rate limit')
        || lower.includes('too many requests')
        || payloadLower.includes('resource_exhausted')
        || payloadLower.includes('ratelimitexceeded')
        || payloadLower.includes('dailylimitexceeded')
        || payloadLower.includes('quotaexceeded')
        || payloadLower.includes('userratelimitexceeded');

    if (isQuotaOr429) {
        const isPerMinuteOnly =
            err?.errorCategory === 'rate_limit_exceeded'
            || (
                !lower.includes('per day')
                && !payloadLower.includes('perday')
                && !payloadLower.includes('1/d/')
                && !payloadLower.includes('dailylimitexceeded')
                && (
                    lower.includes('per minute')
                    || lower.includes('per 100 seconds')
                    || lower.includes('per second')
                    || lower.includes('requests-per-minute')
                    || payloadLower.includes('perminute')
                    || payloadLower.includes('1/min/')
                    || payloadLower.includes('100s')
                )
            );

        const isDaily =
            err?.errorCategory === 'daily_quota_exceeded'
            || (
                !isPerMinuteOnly
                && (
                    lower.includes('queries per day')
                    || lower.includes('per day')
                    || lower.includes('daily quota')
                    || payloadLower.includes('defaultperdayperproject')
                    || payloadLower.includes('queriesperday')
                    || payloadLower.includes('1/d/{project}')
                    || payloadLower.includes('dailylimitexceeded')
                )
            );

        const projLabel = detectedProject || expectedProject;
        if (isDaily) {
            const nextRetryAt = err?.nextRetryAt || computeNextDailyQuotaResetIso(new Date(), err?.retryAfter);
            return {
                errorCategory: 'daily_quota_exceeded',
                httpStatus: 429,
                retryable: false,
                isQuotaError: true,
                isDailyQuota: true,
                apiEnabled: true,
                projectVerified: !detectedProject || detectedProject === expectedProject,
                projectNumber: projLabel,
                expectedProjectNumber: expectedProject,
                quotaMetric: 'Queries',
                quotaLimit: 'Queries per day',
                serviceName: PAGESPEED_API_SERVICE,
                nextRetryAt,
                userMessage: PAGESPEED_QUOTA_EXHAUSTED_MESSAGE,
                message:
                    rawMsg
                    || `Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service '${PAGESPEED_API_SERVICE}' (Project: ${projLabel}).`
            };
        }

        const nextRetryAt = err?.nextRetryAt || computeNextRateLimitRetryIso(new Date(), err?.retryAfter, 60);
        return {
            errorCategory: 'rate_limit_exceeded',
            httpStatus: 429,
            retryable: true,
            isQuotaError: true,
            isDailyQuota: false,
            apiEnabled: true,
            projectVerified: !detectedProject || detectedProject === expectedProject,
            projectNumber: projLabel,
            expectedProjectNumber: expectedProject,
            quotaMetric: 'Queries',
            quotaLimit: 'Queries per minute',
            serviceName: PAGESPEED_API_SERVICE,
            nextRetryAt,
            userMessage:
                'Google PageSpeed API requests-per-minute rate limit has been reached. Previously cached reports remain available. Please wait briefly before retrying.',
            message:
                rawMsg
                || `Requests-per-minute rate limit reached for service '${PAGESPEED_API_SERVICE}'.`
        };
    }

    // Invalid URL rejected by Google PageSpeed upstream
    if (
        status === 400
        && (
            lower.includes('invalid url')
            || lower.includes('invalid_argument')
            || payloadLower.includes('invalid_argument')
            || lower.includes('dns_failure')
            || lower.includes('unable to resolve')
        )
    ) {
        return {
            errorCategory: 'invalid_url',
            httpStatus: 400,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: true,
            projectVerified: true,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage: `Google PageSpeed Insights could not resolve the target URL: ${rawMsg}`,
            message: `Invalid target URL for PageSpeed check: ${rawMsg}`
        };
    }

    // Other HTTP 4xx errors from Google PageSpeed API
    if (status >= 400 && status < 500) {
        return {
            errorCategory: 'api_error',
            httpStatus: status,
            retryable: false,
            isQuotaError: false,
            isDailyQuota: false,
            apiEnabled: null,
            projectVerified: null,
            projectNumber: detectedProject,
            expectedProjectNumber: expectedProject,
            nextRetryAt: null,
            userMessage: rawMsg || `Google PageSpeed Insights API returned HTTP ${status}.`,
            message: `PageSpeed Insights API error (HTTP ${status}): ${rawMsg || 'Request rejected'}`
        };
    }

    // Network errors, timeouts, or upstream 5xx errors
    const nextRetryAt = computeNextRateLimitRetryIso(new Date(), err?.retryAfter, 30);
    return {
        errorCategory: 'network_error',
        httpStatus: status >= 500 && status < 600 ? status : 503,
        retryable: true,
        isQuotaError: false,
        isDailyQuota: false,
        apiEnabled: null,
        projectVerified: null,
        projectNumber: detectedProject,
        expectedProjectNumber: expectedProject,
        nextRetryAt,
        userMessage:
            'A network error or timeout occurred while contacting Google PageSpeed Insights. Previously cached reports are still available.',
        message: `PageSpeed Insights network/upstream error: ${rawMsg || 'Network request failed'}`
    };
}

function getPrioritizedAuditableUrls(config = {}, latestAudit = null, pagespeedSnapData = null) {
    const siteUrl = String(config?.siteUrl || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
    const byUrl = pagespeedSnapData?.byUrl || {};
    const byPath = pagespeedSnapData?.byPath || {};

    const buildEntry = (pathStr, label, category, priority) => {
        const cleanPath = !pathStr || pathStr === '/' ? '/' : pathStr.replace(/\/+$/, '');
        const fullUrl = `${siteUrl}${cleanPath}`;
        const urlCache = byUrl[fullUrl] || byPath[cleanPath] || (
            cleanPath === '/' && (pagespeedSnapData?.mobile?.url === fullUrl || pagespeedSnapData?.desktop?.url === fullUrl)
                ? {
                    mobile: pagespeedSnapData?.mobile?.url === fullUrl ? pagespeedSnapData.mobile : null,
                    desktop: pagespeedSnapData?.desktop?.url === fullUrl ? pagespeedSnapData.desktop : null
                }
                : null
        );
        const mobileCached = urlCache?.mobile || null;
        const desktopCached = urlCache?.desktop || null;
        return {
            path: cleanPath,
            url: fullUrl,
            label,
            category,
            priority,
            hasMobileCache: Boolean(mobileCached),
            hasDesktopCache: Boolean(desktopCached),
            mobilePerformance: typeof mobileCached?.scores?.performance === 'number' ? mobileCached.scores.performance : null,
            desktopPerformance: typeof desktopCached?.scores?.performance === 'number' ? desktopCached.scores.performance : null,
            lastAuditedAt: mobileCached?.checkedAt || desktopCached?.checkedAt || null
        };
    };

    const items = [];
    const seenPaths = new Set();
    const addUnique = (pathStr, label, category, priority) => {
        const cleanPath = !pathStr || pathStr === '/' ? '/' : pathStr.replace(/\/+$/, '');
        if (seenPaths.has(cleanPath)) return;
        seenPaths.add(cleanPath);
        items.push(buildEntry(cleanPath, label, category, priority));
    };

    // Priority 1: Homepage
    addUnique('/', '/ (Homepage)', 'Homepage', 1);

    // Priority 2: Important Technology Pages
    addUnique('/technologies', '/technologies (Technologies Hub)', 'Important Technology Pages', 2);
    const defaultTechPages = [
        ['/technologies/javascript', 'JavaScript Quiz & Track (/technologies/javascript)'],
        ['/technologies/react', 'React.js Quiz & Track (/technologies/react)'],
        ['/technologies/python', 'Python Quiz & Track (/technologies/python)'],
        ['/technologies/html', 'HTML5 Quiz & Track (/technologies/html)'],
        ['/technologies/css', 'CSS3 Quiz & Track (/technologies/css)'],
        ['/technologies/php', 'PHP Quiz & Track (/technologies/php)'],
        ['/technologies/laravel', 'Laravel Quiz & Track (/technologies/laravel)'],
        ['/technologies/mysql', 'MySQL Quiz & Track (/technologies/mysql)'],
        ['/technologies/mongodb', 'MongoDB Quiz & Track (/technologies/mongodb)'],
        ['/technologies/csharp', 'C# & .NET Quiz & Track (/technologies/csharp)'],
        ['/technologies/flutter', 'Flutter Quiz & Track (/technologies/flutter)'],
        ['/technologies/dart', 'Dart Quiz & Track (/technologies/dart)']
    ];
    for (const [p, lbl] of defaultTechPages) {
        addUnique(p, lbl, 'Important Technology Pages', 2);
    }

    const inventory = latestAudit?.summary?.urlInventory || [];
    for (const inv of inventory) {
        if (inv?.path && inv.path.startsWith('/technologies/')) {
            addUnique(inv.path, `${inv.title || inv.path} (${inv.path})`, 'Important Technology Pages', 2);
        }
    }

    // Priority 3: Published Blog Articles
    addUnique('/blog', '/blog (Tutorials & Articles Hub)', 'Published Blog Articles', 3);
    const articles = latestAudit?.summary?.contentReport?.bestPerformingArticles || [];
    for (const art of articles.slice(0, 20)) {
        if (art?.slug) {
            const p = `/blog/${art.slug}`;
            addUnique(p, `${art.title || art.slug} (${p})`, 'Published Blog Articles', 3);
        }
    }
    for (const inv of inventory) {
        if (inv?.path && inv.path.startsWith('/blog/')) {
            addUnique(inv.path, `${inv.title || inv.path} (${inv.path})`, 'Published Blog Articles', 3);
        }
    }

    // Priority 4: Important Public Game Pages
    addUnique('/games', '/games (Interactive Coding Games Hub)', 'Important Public Game Pages', 4);
    const defaultGamePages = [
        ['/games/memory-match', 'Coding Memory Match (/games/memory-match)'],
        ['/games/code-jumble', 'Code Jumble (/games/code-jumble)'],
        ['/games/bug-hunter', 'Bug Hunter (/games/bug-hunter)'],
        ['/games/syntax-sprint', 'Syntax Sprint (/games/syntax-sprint)'],
        ['/games/sql-builder', 'SQL Query Builder (/games/sql-builder)'],
        ['/games/output-predictor', 'Output Predictor (/games/output-predictor)']
    ];
    for (const [p, lbl] of defaultGamePages) {
        addUnique(p, lbl, 'Important Public Game Pages', 4);
    }
    for (const inv of inventory) {
        if (inv?.path && inv.path.startsWith('/games/')) {
            addUnique(inv.path, `${inv.title || inv.path} (${inv.path})`, 'Important Public Game Pages', 4);
        }
    }

    return items;
}

function isPageSpeedEntryFresh(entry, cacheTtlMs = PAGESPEED_CACHE_TTL_MS, nowMs = Date.now()) {
    if (!entry || !entry.checkedAt) return false;
    const checkedMs = Date.parse(entry.checkedAt);
    if (Number.isNaN(checkedMs)) return false;
    return nowMs - checkedMs < cacheTtlMs;
}

function buildPageSpeedDashboardView({ config = {}, pagespeedSnap = null, latestAudit = null } = {}) {
    const cleanDomain = normalizeDomain(config?.domain || DEFAULT_DOMAIN);
    const siteUrl = String(config?.siteUrl || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
    const homepageUrl = `${siteUrl}/`;
    const snapData = pagespeedSnap?.data || {};
    const keyInfo = resolvePageSpeedApiKey(config);

    const byUrl = { ...(snapData.byUrl || {}) };
    const byPath = { ...(snapData.byPath || {}) };

    // Ensure any legacy top-level mobile/desktop snapshots are indexed in byUrl/byPath
    for (const strat of ['mobile', 'desktop']) {
        const legacy = snapData[strat];
        if (legacy && legacy.url) {
            let normPath = '/';
            try {
                const u = new URL(legacy.url);
                normPath = !u.pathname || u.pathname === '/' ? '/' : u.pathname.replace(/\/+$/, '');
            } catch {
                normPath = '/';
            }
            const canonUrl = `${siteUrl}${normPath}`;
            if (!byUrl[canonUrl]) byUrl[canonUrl] = { url: canonUrl, path: normPath, mobile: null, desktop: null };
            if (!byUrl[canonUrl][strat]) byUrl[canonUrl][strat] = legacy;
            if (!byPath[normPath]) byPath[normPath] = { url: canonUrl, path: normPath, mobile: null, desktop: null };
            if (!byPath[normPath][strat]) byPath[normPath][strat] = legacy;
        }
    }

    const homeEntry = byUrl[homepageUrl] || byPath['/'] || null;
    const mobileReport = snapData.mobile || homeEntry?.mobile || null;
    const desktopReport = snapData.desktop || homeEntry?.desktop || null;

    const memQuota = memoryPageSpeedQuotaStates.get(cleanDomain) || null;
    const rawQuota = memQuota || snapData.quotaState || null;
    let quotaState = null;
    if (rawQuota) {
        const resetPassed = rawQuota.nextRetryAt && Date.now() >= Date.parse(rawQuota.nextRetryAt);
        const keyChanged = rawQuota.keyFingerprint && keyInfo.fingerprint && rawQuota.keyFingerprint !== keyInfo.fingerprint;
        if (!resetPassed && !keyChanged) {
            quotaState = {
                exhausted: Boolean(rawQuota.exhausted),
                errorCategory: rawQuota.errorCategory || null,
                userMessage: rawQuota.userMessage || (rawQuota.exhausted ? PAGESPEED_QUOTA_EXHAUSTED_MESSAGE : null),
                message: rawQuota.message || null,
                projectNumber: rawQuota.projectNumber || null,
                detectedAt: rawQuota.detectedAt || null,
                nextRetryAt: rawQuota.nextRetryAt || null
            };
        }
    }

    const rawLastError = snapData.lastError || null;
    const lastErrorKeyChanged = rawLastError?.keyFingerprint && keyInfo.fingerprint && rawLastError.keyFingerprint !== keyInfo.fingerprint;
    const lastError = lastErrorKeyChanged ? null : rawLastError;
    const connStatus = resolvePageSpeedConnectionStatus({
        config,
        keyInfo,
        pagespeedSnap: { data: snapData, syncedAt: pagespeedSnap?.syncedAt }
    });
    const hasAnyCachedReport = Boolean(
        mobileReport
        || desktopReport
        || Object.values(byUrl).some((entry) => Boolean(entry?.mobile || entry?.desktop))
    );

    const mobilePerf = typeof mobileReport?.scores?.performance === 'number' ? mobileReport.scores.performance : null;
    const desktopPerf = typeof desktopReport?.scores?.performance === 'number' ? desktopReport.scores.performance : null;
    const lastAuditedAt =
        snapData.lastAuditedAt
        || mobileReport?.checkedAt
        || desktopReport?.checkedAt
        || pagespeedSnap?.syncedAt
        || null;

    let status = 'Not checked';
    if (quotaState?.exhausted && !hasAnyCachedReport) {
        status = 'Quota Exceeded';
    } else if (mobilePerf !== null) {
        status = mobilePerf >= 85 ? 'Good' : mobilePerf >= 50 ? 'Needs attention' : 'Critical';
    } else if (desktopPerf !== null) {
        status = desktopPerf >= 85 ? 'Good' : desktopPerf >= 50 ? 'Needs attention' : 'Critical';
    } else if (lastError?.errorCategory) {
        status = 'Needs attention';
    }

    const mobileFresh = isPageSpeedEntryFresh(mobileReport);
    const desktopFresh = isPageSpeedEntryFresh(desktopReport);
    const cacheStatus = hasAnyCachedReport
        ? (quotaState?.exhausted
            ? 'cached_quota_fallback'
            : (mobileFresh || desktopFresh ? 'cached' : 'cached_stale'))
        : 'empty';

    let explanation;
    if (quotaState?.exhausted) {
        explanation = PAGESPEED_QUOTA_EXHAUSTED_MESSAGE;
    } else if (hasAnyCachedReport) {
        explanation = `Measured via Google PageSpeed Insights (Last audit: ${lastAuditedAt || 'recent'} · Cached for 24 hours).`;
    } else if (!keyInfo.hasKey) {
        explanation = 'Configure PAGESPEED_API_KEY on the backend and select a URL to run an on-demand Google PageSpeed Insights audit.';
    } else if (lastError?.userMessage) {
        explanation = lastError.userMessage;
    } else {
        explanation = 'PageSpeed Insights has not been run yet. Select an individual URL and click "Run PageSpeed Check" to measure Mobile or Desktop performance.';
    }

    const auditableUrls = getPrioritizedAuditableUrls(config, latestAudit, {
        ...snapData,
        byUrl,
        byPath,
        mobile: mobileReport,
        desktop: desktopReport
    });

    return {
        status,
        connected: connStatus.connected,
        connectionStatus: connStatus.connectionStatus,
        apiEnabled: connStatus.apiEnabled,
        lastTestedAt: connStatus.lastTestedAt,
        verificationMessage: connStatus.message,
        errorCategory: connStatus.errorCategory,
        mobile: mobileReport,
        desktop: desktopReport,
        mobilePerformance: mobilePerf,
        desktopPerformance: desktopPerf,
        byUrl,
        byPath,
        auditableUrls,
        lastAuditedAt,
        lastAuditedUrl: snapData.lastAuditedUrl || mobileReport?.url || desktopReport?.url || null,
        lastAuditedStrategy: snapData.lastAuditedStrategy || (mobileReport ? 'mobile' : desktopReport ? 'desktop' : null),
        cachedResultStatus: hasAnyCachedReport
            ? (quotaState?.exhausted
                ? 'Cached Report (Quota Exhausted Fallback)'
                : (mobileFresh || desktopFresh ? 'Cached (24h TTL Active)' : 'Cached Report Available'))
            : 'No Cached Report',
        cacheStatus,
        hasCachedReport: hasAnyCachedReport,
        cacheTtlMs: PAGESPEED_CACHE_TTL_MS,
        cacheTtlHours: 24,
        apiKeyConfigured: keyInfo.hasKey,
        apiKeySource: keyInfo.source,
        expectedProjectNumber: PAGESPEED_EXPECTED_PROJECT_NUMBER,
        quotaState,
        lastError,
        nextRetryAt: quotaState?.nextRetryAt || lastError?.nextRetryAt || null,
        explanation
    };
}

function sleepMs(ms) {
    if (!ms || ms <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquirePageSpeedThrottleSlot({
    throttleMs = PAGESPEED_DEFAULT_THROTTLE_MS,
    maxRequestsPerMinute = PAGESPEED_DEFAULT_MAX_RPM
} = {}) {
    const now = Date.now();
    // Prune timestamps older than 60s
    while (pageSpeedRequestTimestamps.length > 0 && now - pageSpeedRequestTimestamps[0] >= 60000) {
        pageSpeedRequestTimestamps.shift();
    }

    if (maxRequestsPerMinute > 0 && pageSpeedRequestTimestamps.length >= maxRequestsPerMinute) {
        const oldest = pageSpeedRequestTimestamps[0];
        const retryAtIso = new Date(oldest + 60000).toISOString();
        const rateErr = new Error(
            `Google PageSpeed request throttled: reached ${maxRequestsPerMinute} requests per minute limit.`
        );
        rateErr.status = 429;
        rateErr.errorCategory = 'rate_limit_exceeded';
        rateErr.nextRetryAt = retryAtIso;
        throw rateErr;
    }

    let releaseNext;
    const prevChain = pageSpeedThrottleChain;
    pageSpeedThrottleChain = new Promise((resolve) => {
        releaseNext = resolve;
    });

    await prevChain;
    try {
        const elapsed = Date.now() - lastPageSpeedRequestAt;
        if (lastPageSpeedRequestAt > 0 && throttleMs > 0 && elapsed < throttleMs) {
            await sleepMs(throttleMs - elapsed);
        }
        lastPageSpeedRequestAt = Date.now();
        pageSpeedRequestTimestamps.push(lastPageSpeedRequestAt);
    } finally {
        releaseNext();
    }
}

function parseLighthousePayload(data, canonicalUrl, normalizedPath, cleanStrategy, nowIso, cacheTtlMs) {
    const lhr = data?.lighthouseResult || {};
    const cats = lhr.categories || {};
    const audits = lhr.audits || {};

    const toValidScore = (rawScore) => {
        if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) return null;
        return Math.max(0, Math.min(100, Math.round(rawScore * 100)));
    };

    const lcpMs = typeof audits['largest-contentful-paint']?.numericValue === 'number'
        ? audits['largest-contentful-paint'].numericValue
        : null;
    const clsVal = typeof audits['cumulative-layout-shift']?.numericValue === 'number'
        ? audits['cumulative-layout-shift'].numericValue
        : null;
    const fcpMs = typeof audits['first-contentful-paint']?.numericValue === 'number'
        ? audits['first-contentful-paint'].numericValue
        : null;
    const tbtMs = typeof audits['total-blocking-time']?.numericValue === 'number'
        ? audits['total-blocking-time'].numericValue
        : null;
    const ttfbMs = typeof audits['server-response-time']?.numericValue === 'number'
        ? audits['server-response-time'].numericValue
        : null;
    const speedIndexMs = typeof audits['speed-index']?.numericValue === 'number'
        ? audits['speed-index'].numericValue
        : null;

    // Extract field INP if CrUX metrics exist
    const fieldMetrics = data?.loadingExperience?.metrics || {};
    const inpFieldMs = typeof fieldMetrics?.INTERACTION_TO_NEXT_PAINT?.percentile === 'number'
        ? fieldMetrics.INTERACTION_TO_NEXT_PAINT.percentile
        : null;

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

    const checkedMs = Date.parse(nowIso);
    const expiresAt = new Date(checkedMs + cacheTtlMs).toISOString();

    return {
        url: canonicalUrl,
        path: normalizedPath,
        strategy: cleanStrategy,
        source: 'Google PageSpeed Insights / Lighthouse',
        checkedAt: nowIso,
        cachedAt: nowIso,
        expiresAt,
        fromCache: false,
        cacheStatus: 'fresh',
        scores: {
            performance: toValidScore(cats.performance?.score),
            accessibility: toValidScore(cats.accessibility?.score),
            bestPractices: toValidScore(cats['best-practices']?.score),
            seo: toValidScore(cats.seo?.score)
        },
        coreWebVitals: {
            lcp: {
                label: 'Largest Contentful Paint (LCP)',
                valueMs: lcpMs !== null ? Math.round(lcpMs) : null,
                displayValue:
                    audits['largest-contentful-paint']?.displayValue
                    || (lcpMs !== null ? `${(lcpMs / 1000).toFixed(2)} s` : 'Unavailable'),
                status: classifyCwvMetric('lcp', lcpMs)
            },
            cls: {
                label: 'Cumulative Layout Shift (CLS)',
                value: clsVal !== null ? Number(clsVal.toFixed(3)) : null,
                displayValue:
                    audits['cumulative-layout-shift']?.displayValue
                    || (clsVal !== null ? String(clsVal.toFixed(3)) : 'Unavailable'),
                status: classifyCwvMetric('cls', clsVal)
            },
            inp: {
                label:
                    inpFieldMs !== null
                        ? 'Interaction to Next Paint (INP - Field)'
                        : 'Total Blocking Time (TBT - Lab INP proxy)',
                valueMs: inpFieldMs !== null ? Math.round(inpFieldMs) : (tbtMs !== null ? Math.round(tbtMs) : null),
                displayValue:
                    inpFieldMs !== null
                        ? `${Math.round(inpFieldMs)} ms`
                        : (audits['total-blocking-time']?.displayValue || 'Unavailable'),
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
}

function createClassifiedPageSpeedError(classified, { cachedReport = null, pagespeedView = null } = {}) {
    const err = new Error(classified.userMessage || classified.message || 'PageSpeed Insights request failed.');
    err.status = classified.httpStatus || 500;
    err.httpStatus = classified.httpStatus || 500;
    err.errorCategory = classified.errorCategory || 'api_error';
    err.userMessage = classified.userMessage || err.message;
    err.technicalDetail = classified.message || err.message;
    err.isQuotaError = Boolean(classified.isQuotaError);
    err.isDailyQuota = Boolean(classified.isDailyQuota);
    err.retryable = Boolean(classified.retryable);
    err.nextRetryAt = classified.nextRetryAt || null;
    err.projectNumber = classified.projectNumber || null;
    err.expectedProjectNumber = classified.expectedProjectNumber || PAGESPEED_EXPECTED_PROJECT_NUMBER;
    err.apiEnabled = classified.apiEnabled ?? null;
    err.projectVerified = classified.projectVerified ?? null;
    err.cachedReport = cachedReport || null;
    err.hasCachedReport = Boolean(cachedReport || pagespeedView?.hasCachedReport);
    err.pagespeed = pagespeedView || null;
    return err;
}

async function runPageSpeedInsights(config = {}, targetUrl = '', strategy = 'mobile', options = {}) {
    const cleanDomain = normalizeDomain(config?.domain || DEFAULT_DOMAIN);
    const cleanStrategy = String(strategy || 'mobile').toLowerCase() === 'desktop' ? 'desktop' : 'mobile';
    const forceRefresh = Boolean(options?.forceRefresh);
    const cacheTtlMs = Number(options?.cacheTtlMs) > 0 ? Number(options.cacheTtlMs) : PAGESPEED_CACHE_TTL_MS;
    const throttleMs = options?.throttleMs !== undefined
        ? Math.max(0, Number(options.throttleMs) || 0)
        : (process.env.PAGESPEED_THROTTLE_MS !== undefined ? Math.max(0, Number(process.env.PAGESPEED_THROTTLE_MS) || 0) : PAGESPEED_DEFAULT_THROTTLE_MS);
    const maxRequestsPerMinute = options?.maxRequestsPerMinute !== undefined
        ? Math.max(1, Number(options.maxRequestsPerMinute) || PAGESPEED_DEFAULT_MAX_RPM)
        : PAGESPEED_DEFAULT_MAX_RPM;
    const maxRetries = options?.maxRetries !== undefined
        ? Math.max(0, Number(options.maxRetries) || 0)
        : PAGESPEED_DEFAULT_MAX_RETRIES;
    const baseBackoffMs = options?.baseBackoffMs !== undefined
        ? Math.max(0, Number(options.baseBackoffMs) || 0)
        : PAGESPEED_DEFAULT_BACKOFF_MS;
    const enforceProjectMatch = Boolean(options?.enforceProjectMatch);
    const expectedProjectNumber = String(
        options?.expectedProjectNumber
        || config?.googleCloudProjectNumber
        || process.env.GOOGLE_CLOUD_PROJECT_NUMBER
        || process.env.PAGESPEED_PROJECT_NUMBER
        || PAGESPEED_EXPECTED_PROJECT_NUMBER
    ).trim();

    // 1. Validate & normalize target URL
    const urlCheck = validateAndNormalizePageSpeedUrl(config, targetUrl);
    if (!urlCheck.valid) {
        const existingSnap = await getSnapshot(cleanDomain, 'pagespeed');
        const view = buildPageSpeedDashboardView({ config, pagespeedSnap: existingSnap });
        const classified = classifyPageSpeedApiError(urlCheck, { expectedProjectNumber });
        throw createClassifiedPageSpeedError(classified, { pagespeedView: view });
    }

    const { canonicalUrl, normalizedPath } = urlCheck;

    // 2. Check 24-hour cache by URL and device strategy before making any network calls
    const existingSnap = await getSnapshot(cleanDomain, 'pagespeed');
    const snapData = existingSnap?.data || {};
    const existingByUrl = snapData.byUrl || {};
    const existingByPath = snapData.byPath || {};
    const cachedUrlGroup = existingByUrl[canonicalUrl] || existingByPath[normalizedPath] || null;
    const legacyStrategyMatch =
        snapData[cleanStrategy]?.url === canonicalUrl ? snapData[cleanStrategy] : null;
    const cachedEntry = cachedUrlGroup?.[cleanStrategy] || legacyStrategyMatch || null;

    if (!forceRefresh && isPageSpeedEntryFresh(cachedEntry, cacheTtlMs)) {
        const cachedResult = {
            ...cachedEntry,
            fromCache: true,
            cacheStatus: 'cached'
        };
        const otherStrategy = cleanStrategy === 'mobile' ? 'desktop' : 'mobile';
        const otherResult = cachedUrlGroup?.[otherStrategy]
            || (snapData[otherStrategy]?.url === canonicalUrl ? snapData[otherStrategy] : snapData[otherStrategy])
            || null;
        const view = buildPageSpeedDashboardView({
            config,
            pagespeedSnap: {
                data: {
                    ...snapData,
                    [cleanStrategy]: cachedResult,
                    ...(otherResult ? { [otherStrategy]: otherResult } : {})
                },
                syncedAt: existingSnap?.syncedAt
            }
        });
        return {
            ...view,
            [cleanStrategy]: cachedResult,
            activeResult: cachedResult,
            fromCache: true,
            deduplicated: false,
            cacheStatus: 'cached'
        };
    }

    // 3. Deduplicate simultaneous in-flight requests for the same domain + URL + strategy
    const inflightKey = `${cleanDomain}::${canonicalUrl}::${cleanStrategy}`;
    if (inFlightPageSpeedRequests.has(inflightKey)) {
        const sharedResult = await inFlightPageSpeedRequests.get(inflightKey);
        return {
            ...sharedResult,
            deduplicated: true
        };
    }

    // 4. Resolve and validate server-side PAGESPEED_API_KEY
    const keyInfo = resolvePageSpeedApiKey(config);
    const keyValidation = validatePageSpeedApiKey(keyInfo.key);
    if (!keyValidation.valid) {
        const classified = classifyPageSpeedApiError(keyValidation, {
            rawKey: keyInfo.key,
            expectedProjectNumber
        });
        const detectedAt = new Date().toISOString();
        const errorState = {
            errorCategory: classified.errorCategory,
            userMessage: classified.userMessage,
            message: classified.message,
            projectNumber: classified.projectNumber,
            keyFingerprint: keyInfo.fingerprint,
            detectedAt,
            nextRetryAt: null
        };
        const verificationRecord = {
            connected: false,
            connectionStatus: mapPageSpeedErrorCategoryToStatus(classified.errorCategory),
            apiEnabled: classified.apiEnabled ?? null,
            errorCategory: classified.errorCategory,
            keyFingerprint: keyInfo.fingerprint,
            checkedAt: detectedAt,
            nextRetryAt: null,
            message: classified.userMessage
        };
        memoryPageSpeedVerifications.set(cleanDomain, verificationRecord);

        const updatedSnapData = await withPageSpeedSnapshotLock(cleanDomain, async () => {
            const latestSnap = await getSnapshot(cleanDomain, 'pagespeed');
            const latestData = latestSnap?.data || snapData || {};
            const nextData = {
                ...latestData,
                lastError: errorState,
                connectionVerification: verificationRecord
            };
            await saveSnapshot(cleanDomain, 'pagespeed', nextData, 'Google PageSpeed Insights API');
            return nextData;
        });

        const view = buildPageSpeedDashboardView({
            config,
            pagespeedSnap: { data: updatedSnapData, syncedAt: detectedAt }
        });
        throw createClassifiedPageSpeedError(classified, {
            cachedReport: cachedEntry,
            pagespeedView: view
        });
    }

    // 5. Check if daily quota is currently exhausted for this key (do NOT repeatedly retry daily quota exhaustion!)
    const memQuota = memoryPageSpeedQuotaStates.get(cleanDomain) || snapData.quotaState || null;
    if (
        memQuota
        && memQuota.exhausted
        && memQuota.errorCategory === 'daily_quota_exceeded'
        && (!memQuota.keyFingerprint || memQuota.keyFingerprint === keyInfo.fingerprint)
        && memQuota.nextRetryAt
        && Date.now() < Date.parse(memQuota.nextRetryAt)
    ) {
        const classified = classifyPageSpeedApiError(
            {
                status: 429,
                errorCategory: 'daily_quota_exceeded',
                message: memQuota.message || PAGESPEED_QUOTA_EXHAUSTED_MESSAGE,
                nextRetryAt: memQuota.nextRetryAt
            },
            {
                rawKey: keyInfo.key,
                detectedProjectNumber: memQuota.projectNumber,
                expectedProjectNumber
            }
        );
        const view = buildPageSpeedDashboardView({
            config,
            pagespeedSnap: { data: snapData, syncedAt: existingSnap?.syncedAt }
        });
        throw createClassifiedPageSpeedError(classified, {
            cachedReport: cachedEntry,
            pagespeedView: view
        });
    }

    // 6. Execute live PageSpeed Insights request with throttling and exponential backoff for temporary errors
    const executeLiveRequest = async () => {
        const params = new URLSearchParams({
            url: canonicalUrl,
            strategy: cleanStrategy
        });
        params.append('category', 'performance');
        params.append('category', 'accessibility');
        params.append('category', 'best-practices');
        params.append('category', 'seo');
        params.append('key', keyInfo.key);

        const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

        let lastClassified = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                await acquirePageSpeedThrottleSlot({ throttleMs, maxRequestsPerMinute });
                const data = await fetchJsonWithTimeout(apiUrl, { method: 'GET' }, 45000);
                const nowIso = new Date().toISOString();
                const parsedResult = parseLighthousePayload(
                    data,
                    canonicalUrl,
                    normalizedPath,
                    cleanStrategy,
                    nowIso,
                    cacheTtlMs
                );

                // Clear any previous quota/error states on success
                memoryPageSpeedQuotaStates.delete(cleanDomain);

                const { nextSnapshotPayload, updatedUrlEntry, otherStrategy } = await withPageSpeedSnapshotLock(cleanDomain, async () => {
                    const latestSnap = await getSnapshot(cleanDomain, 'pagespeed');
                    const latestData = latestSnap?.data || {};
                    const nextByUrl = { ...(latestData.byUrl || {}) };
                    const nextByPath = { ...(latestData.byPath || {}) };

                    const existingUrlEntry = nextByUrl[canonicalUrl] || nextByPath[normalizedPath] || {
                        url: canonicalUrl,
                        path: normalizedPath,
                        mobile: null,
                        desktop: null
                    };

                    const nextUrlEntry = {
                        ...existingUrlEntry,
                        url: canonicalUrl,
                        path: normalizedPath,
                        [cleanStrategy]: parsedResult
                    };

                    nextByUrl[canonicalUrl] = nextUrlEntry;
                    nextByPath[normalizedPath] = nextUrlEntry;

                    const otherStrat = cleanStrategy === 'mobile' ? 'desktop' : 'mobile';
                    const topOther = nextUrlEntry[otherStrat] || latestData[otherStrat] || null;
                    const existingVer = latestData.connectionVerification || {};
                    const mobilePerf = cleanStrategy === 'mobile'
                        ? parsedResult.scores.performance
                        : (typeof topOther?.scores?.performance === 'number' ? topOther.scores.performance : (existingVer.mobilePerformance ?? null));
                    const desktopPerf = cleanStrategy === 'desktop'
                        ? parsedResult.scores.performance
                        : (typeof topOther?.scores?.performance === 'number' ? topOther.scores.performance : (existingVer.desktopPerformance ?? null));

                    const verificationRecord = {
                        connected: true,
                        connectionStatus: 'Connected',
                        apiEnabled: true,
                        errorCategory: null,
                        keyFingerprint: keyInfo.fingerprint,
                        checkedAt: nowIso,
                        targetUrl: canonicalUrl,
                        mobilePerformance: mobilePerf,
                        desktopPerformance: desktopPerf,
                        message: `Google PageSpeed Insights API v5 verified for ${canonicalUrl}.`
                    };
                    memoryPageSpeedVerifications.set(cleanDomain, verificationRecord);

                    const payload = {
                        ...latestData,
                        [cleanStrategy]: parsedResult,
                        ...(topOther ? { [otherStrat]: topOther } : {}),
                        byUrl: nextByUrl,
                        byPath: nextByPath,
                        lastAuditedUrl: canonicalUrl,
                        lastAuditedPath: normalizedPath,
                        lastAuditedStrategy: cleanStrategy,
                        lastAuditedAt: nowIso,
                        quotaState: null,
                        lastError: null,
                        connectionVerification: verificationRecord
                    };

                    await saveSnapshot(cleanDomain, 'pagespeed', payload, 'Google PageSpeed Insights API');
                    return {
                        nextSnapshotPayload: payload,
                        updatedUrlEntry: nextUrlEntry,
                        otherStrategy: otherStrat
                    };
                });

                const view = buildPageSpeedDashboardView({
                    config,
                    pagespeedSnap: { data: nextSnapshotPayload, syncedAt: nowIso }
                });

                return {
                    ...view,
                    [cleanStrategy]: parsedResult,
                    ...(updatedUrlEntry[otherStrategy] ? { [otherStrategy]: updatedUrlEntry[otherStrategy] } : {}),
                    activeResult: parsedResult,
                    fromCache: false,
                    deduplicated: false,
                    cacheStatus: 'fresh'
                };
            } catch (rawErr) {
                const classified = classifyPageSpeedApiError(rawErr, {
                    rawKey: keyInfo.key,
                    expectedProjectNumber,
                    enforceProjectMatch
                });
                lastClassified = classified;

                // Never retry daily quota exhaustion, invalid key, missing key, API disabled, or invalid URL
                if (!classified.retryable || classified.errorCategory === 'daily_quota_exceeded') {
                    break;
                }

                // Exponential backoff for temporary errors (network_error, rate_limit_exceeded)
                if (attempt < maxRetries) {
                    const backoffDelay = baseBackoffMs * Math.pow(2, attempt);
                    await sleepMs(backoffDelay);
                }
            }
        }

        // Persist error / quota state while preserving all previously cached reports
        const nowIso = new Date().toISOString();
        const errorState = {
            errorCategory: lastClassified.errorCategory,
            userMessage: lastClassified.userMessage,
            message: lastClassified.message,
            projectNumber: lastClassified.projectNumber,
            expectedProjectNumber: lastClassified.expectedProjectNumber,
            keyFingerprint: keyInfo.fingerprint,
            isQuotaError: Boolean(lastClassified.isQuotaError),
            isDailyQuota: Boolean(lastClassified.isDailyQuota),
            detectedAt: nowIso,
            nextRetryAt: lastClassified.nextRetryAt || null
        };

        const verificationRecord = {
            connected: false,
            connectionStatus: mapPageSpeedErrorCategoryToStatus(lastClassified.errorCategory),
            apiEnabled: lastClassified.apiEnabled ?? null,
            errorCategory: lastClassified.errorCategory,
            keyFingerprint: keyInfo.fingerprint,
            checkedAt: nowIso,
            nextRetryAt: lastClassified.nextRetryAt || null,
            message: lastClassified.userMessage
        };
        memoryPageSpeedVerifications.set(cleanDomain, verificationRecord);

        const { updatedSnapData, syncedAt } = await withPageSpeedSnapshotLock(cleanDomain, async () => {
            const latestSnap = await getSnapshot(cleanDomain, 'pagespeed');
            const latestData = latestSnap?.data || snapData || {};

            let nextQuotaState = latestData.quotaState || null;
            if (lastClassified.errorCategory === 'daily_quota_exceeded') {
                nextQuotaState = {
                    exhausted: true,
                    errorCategory: 'daily_quota_exceeded',
                    userMessage: PAGESPEED_QUOTA_EXHAUSTED_MESSAGE,
                    message: lastClassified.message,
                    projectNumber: lastClassified.projectNumber,
                    keyFingerprint: keyInfo.fingerprint,
                    detectedAt: nowIso,
                    nextRetryAt: lastClassified.nextRetryAt
                };
                memoryPageSpeedQuotaStates.set(cleanDomain, nextQuotaState);
            } else if (lastClassified.errorCategory === 'rate_limit_exceeded') {
                nextQuotaState = {
                    exhausted: false,
                    errorCategory: 'rate_limit_exceeded',
                    userMessage: lastClassified.userMessage,
                    message: lastClassified.message,
                    projectNumber: lastClassified.projectNumber,
                    keyFingerprint: keyInfo.fingerprint,
                    detectedAt: nowIso,
                    nextRetryAt: lastClassified.nextRetryAt
                };
            }

            const nextData = {
                ...latestData,
                quotaState: nextQuotaState,
                lastError: errorState,
                connectionVerification: verificationRecord
            };

            await saveSnapshot(cleanDomain, 'pagespeed', nextData, 'Google PageSpeed Insights API');
            return {
                updatedSnapData: nextData,
                syncedAt: latestSnap?.syncedAt || nowIso
            };
        });

        const view = buildPageSpeedDashboardView({
            config,
            pagespeedSnap: { data: updatedSnapData, syncedAt }
        });

        throw createClassifiedPageSpeedError(lastClassified, {
            cachedReport: cachedEntry,
            pagespeedView: view
        });
    };

    const requestPromise = executeLiveRequest();
    inFlightPageSpeedRequests.set(inflightKey, requestPromise);

    try {
        return await requestPromise;
    } finally {
        inFlightPageSpeedRequests.delete(inflightKey);
    }
}

function resetPageSpeedState(domain = null) {
    if (domain) {
        const clean = normalizeDomain(domain);
        memoryPageSpeedQuotaStates.delete(clean);
        memoryPageSpeedVerifications.delete(clean);
        pageSpeedSnapshotLocks.delete(clean);
        memorySnapshots.delete(`${clean}::pagespeed`);
        for (const key of inFlightPageSpeedRequests.keys()) {
            if (key.startsWith(`${clean}::`)) {
                inFlightPageSpeedRequests.delete(key);
            }
        }
    } else {
        memoryPageSpeedQuotaStates.clear();
        memoryPageSpeedVerifications.clear();
        pageSpeedSnapshotLocks.clear();
        inFlightPageSpeedRequests.clear();
        for (const key of memorySnapshots.keys()) {
            if (key.endsWith('::pagespeed')) {
                memorySnapshots.delete(key);
            }
        }
    }
    pageSpeedRequestTimestamps.length = 0;
    lastPageSpeedRequestAt = 0;
    pageSpeedThrottleChain = Promise.resolve();
}

function getHeaderCaseInsensitive(headers, targetName) {
    if (!headers) return null;
    const lowerTarget = String(targetName || '').toLowerCase();
    if (typeof headers.get === 'function') {
        const direct = headers.get(targetName) ?? headers.get(lowerTarget);
        if (direct !== null && direct !== undefined) return direct;
    }
    if (typeof headers.entries === 'function') {
        for (const [k, v] of headers.entries()) {
            if (String(k).toLowerCase() === lowerTarget) return v;
        }
    }
    if (typeof headers === 'object') {
        for (const [k, v] of Object.entries(headers)) {
            if (String(k).toLowerCase() === lowerTarget) return v;
        }
    }
    return null;
}

function parseOpenPageRankQuotaHeaders(headers, usageBody = null) {
    const parseNum = (val) => {
        if (val === null || val === undefined || String(val).trim() === '') return null;
        const n = Number(val);
        return Number.isFinite(n) ? n : null;
    };

    const parseUnixIso = (val) => {
        const n = parseNum(val);
        if (n === null || n <= 0) return null;
        const ms = n > 1e12 ? n : n * 1000;
        const d = new Date(ms);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };

    const headerLimit = parseNum(getHeaderCaseInsensitive(headers, 'x-domains-limit'));
    const headerRemaining = parseNum(getHeaderCaseInsensitive(headers, 'x-domains-remaining'));
    const headerResetIso = parseUnixIso(getHeaderCaseInsensitive(headers, 'x-domains-reset'));
    const headerRpmLimit = parseNum(getHeaderCaseInsensitive(headers, 'x-ratelimit-limit'));
    const headerRpmRemaining = parseNum(getHeaderCaseInsensitive(headers, 'x-ratelimit-remaining'));
    const headerRpmResetIso = parseUnixIso(getHeaderCaseInsensitive(headers, 'x-ratelimit-reset'));
    const headerRetryAfter = parseNum(getHeaderCaseInsensitive(headers, 'retry-after'));
    const meteringHeader = getHeaderCaseInsensitive(headers, 'x-opr-metering');

    const monthlyDomainLimit = usageBody?.monthly_domain_limit !== undefined
        ? parseNum(usageBody.monthly_domain_limit)
        : headerLimit;
    const domainsRemaining = usageBody?.domains_remaining !== undefined
        ? parseNum(usageBody.domains_remaining)
        : headerRemaining;
    const domainsUsed = usageBody?.domains_used !== undefined
        ? parseNum(usageBody.domains_used)
        : (monthlyDomainLimit !== null && domainsRemaining !== null
            ? Math.max(0, monthlyDomainLimit - domainsRemaining)
            : null);
    const resetsAt = usageBody?.resets_at || headerResetIso || null;
    const requestsPerMinute = usageBody?.requests_per_minute !== undefined
        ? parseNum(usageBody.requests_per_minute)
        : headerRpmLimit;
    const tier = usageBody?.tier ? String(usageBody.tier) : null;
    const metering = meteringHeader ? String(meteringHeader).trim() : 'normal';

    if (
        monthlyDomainLimit === null
        && domainsRemaining === null
        && domainsUsed === null
        && requestsPerMinute === null
        && headerRpmRemaining === null
        && !tier
    ) {
        return null;
    }

    const usagePct = (monthlyDomainLimit && monthlyDomainLimit > 0 && domainsUsed !== null)
        ? Number(((domainsUsed / monthlyDomainLimit) * 100).toFixed(2))
        : null;

    return {
        available: true,
        tier: tier || 'standard',
        monthlyDomainLimit,
        domainsUsed,
        domainsRemaining,
        usagePct,
        resetsAt,
        requestsPerMinute,
        rateLimitRemaining: headerRpmRemaining,
        rateLimitResetsAt: headerRpmResetIso,
        retryAfterSeconds: headerRetryAfter,
        metering
    };
}

function buildOpenPageRankHistorySummary(rawHistory = [], currentScore = null, found = false, domain = 'hangbug.com') {
    const cleanSeries = (Array.isArray(rawHistory) ? rawHistory : [])
        .filter((item) => item && item.date && item.open_page_rank !== null && item.open_page_rank !== undefined)
        .map((item) => {
            const score = Number(Number(item.open_page_rank).toFixed(2));
            const estimated = Boolean(item.estimated);
            return {
                date: String(item.date).trim(),
                open_page_rank: score,
                score,
                estimated,
                dataType: estimated ? 'Estimated' : 'Measured'
            };
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    const totalMonths = cleanSeries.length;
    const measuredMonthsCount = cleanSeries.filter((p) => !p.estimated).length;
    const estimatedMonthsCount = cleanSeries.filter((p) => p.estimated).length;

    if (totalMonths === 0) {
        return {
            history: [],
            summary: {
                available: false,
                totalMonths: 0,
                measuredMonthsCount: 0,
                estimatedMonthsCount: 0,
                startDate: null,
                endDate: null,
                earliestScore: null,
                latestScore: currentScore,
                previousMonthScore: null,
                monthOverMonthChange: null,
                threeMonthChange: null,
                sixMonthChange: null,
                yearOverYearChange: null,
                allTimeChange: null,
                peakScore: currentScore,
                peakDate: null,
                lowestScore: currentScore,
                lowestDate: null,
                trendDirection: 'insufficient_data',
                growthStatus: 'No Historical Series Available',
                availabilityNote: found
                    ? `Domain ${domain} was found in OpenPageRank, but no monthly historical series is available yet.`
                    : `Domain ${domain} does not yet have monthly historical data in the OpenPageRank link graph.`
            }
        };
    }

    const first = cleanSeries[0];
    const last = cleanSeries[totalMonths - 1];
    const prevMonth = totalMonths >= 2 ? cleanSeries[totalMonths - 2] : null;
    const threeMonthsAgo = totalMonths >= 4 ? cleanSeries[totalMonths - 4] : null;
    const sixMonthsAgo = totalMonths >= 7 ? cleanSeries[totalMonths - 7] : null;
    const twelveMonthsAgo = totalMonths >= 13 ? cleanSeries[totalMonths - 13] : null;

    const delta = (curr, prev) => (prev !== null && prev !== undefined ? Number((curr - prev).toFixed(2)) : null);

    const monthOverMonthChange = prevMonth ? delta(last.open_page_rank, prevMonth.open_page_rank) : null;
    const threeMonthChange = threeMonthsAgo ? delta(last.open_page_rank, threeMonthsAgo.open_page_rank) : null;
    const sixMonthChange = sixMonthsAgo ? delta(last.open_page_rank, sixMonthsAgo.open_page_rank) : null;
    const yearOverYearChange = twelveMonthsAgo ? delta(last.open_page_rank, twelveMonthsAgo.open_page_rank) : null;
    const allTimeChange = totalMonths >= 2 ? delta(last.open_page_rank, first.open_page_rank) : null;

    let peak = first;
    let lowest = first;
    for (const pt of cleanSeries) {
        if (pt.open_page_rank >= peak.open_page_rank) peak = pt;
        if (pt.open_page_rank < lowest.open_page_rank) lowest = pt;
    }

    const primaryDelta = yearOverYearChange ?? threeMonthChange ?? monthOverMonthChange ?? allTimeChange;
    let trendDirection = 'stable';
    let growthStatus = 'Stable Authority';
    if (primaryDelta !== null) {
        if (primaryDelta > 0) {
            trendDirection = 'growth';
            growthStatus = `Authority Growth (+${primaryDelta.toFixed(2)})`;
        } else if (primaryDelta < 0) {
            trendDirection = 'decline';
            growthStatus = `Authority Decline (${primaryDelta.toFixed(2)})`;
        }
    }

    return {
        history: cleanSeries,
        summary: {
            available: true,
            totalMonths,
            measuredMonthsCount,
            estimatedMonthsCount,
            startDate: first.date,
            endDate: last.date,
            earliestScore: first.open_page_rank,
            latestScore: last.open_page_rank,
            previousMonthScore: prevMonth ? prevMonth.open_page_rank : null,
            monthOverMonthChange,
            threeMonthChange,
            sixMonthChange,
            yearOverYearChange,
            allTimeChange,
            peakScore: peak.open_page_rank,
            peakDate: peak.date,
            lowestScore: lowest.open_page_rank,
            lowestDate: lowest.date,
            trendDirection,
            growthStatus,
            availabilityNote: `${totalMonths} monthly data point(s) from ${first.date} to ${last.date}: ${measuredMonthsCount} Measured month(s) (Common Crawl release) and ${estimatedMonthsCount} Estimated month(s) (linearly interpolated).`
        }
    };
}

function classifyOpenPageRankError({ status = 0, payload = null, errorMessage = '', rawKey = '' } = {}) {
    const errObj = payload?.error && typeof payload.error === 'object' ? payload.error : {};
    const errType = String(errObj.type || '').trim().toLowerCase();
    const rawApiMsg = redactOpenPageRankApiKey(errObj.message || payload?.message || errorMessage || '', rawKey).trim();
    const lowerMsg = rawApiMsg.toLowerCase();

    if (
        status === 401
        || errType === 'authentication_error'
        || lowerMsg.includes('invalid opr api key')
        || lowerMsg.includes('missing opr api key')
        || lowerMsg.includes('invalid api key')
    ) {
        return {
            connectionStatus: OPENPAGERANK_STATUS.INVALID_KEY,
            errorType: errType || 'authentication_error',
            httpStatus: 401,
            message: 'Invalid OpenPageRank API key. Open your Keywords Everywhere account → OpenPageRank tab, generate an OpenPageRank API key (opr_live_...), and save it in SEO & Growth → Settings.'
        };
    }

    if (status === 403 || errType === 'address_error') {
        return {
            connectionStatus: OPENPAGERANK_STATUS.INVALID_KEY,
            errorType: errType || 'address_error',
            httpStatus: 403,
            message: `OpenPageRank API key rejected for this server IP address (403 address_error). ${rawApiMsg || 'Free OpenPageRank keys must have the caller IPv4 address bound on the Keywords Everywhere OpenPageRank account page.'}`
        };
    }

    if (
        status === 429
        || errType === 'quota_error'
        || errType === 'rate_limit_error'
        || lowerMsg.includes('quota')
        || lowerMsg.includes('rate limit')
        || lowerMsg.includes('monthly domain limit')
    ) {
        return {
            connectionStatus: OPENPAGERANK_STATUS.QUOTA_EXCEEDED,
            errorType: errType || 'quota_error',
            httpStatus: 429,
            message: `OpenPageRank quota or rate limit exceeded (429 ${errType || 'quota_error'}). ${rawApiMsg || 'Monthly domain limit reached or too many requests per minute.'}`
        };
    }

    return {
        connectionStatus: OPENPAGERANK_STATUS.UNAVAILABLE,
        errorType: errType || 'provider_unavailable',
        httpStatus: status || 503,
        message: `OpenPageRank provider is currently unavailable${status ? ` (HTTP ${status})` : ''}: ${rawApiMsg || 'Unable to reach https://openpagerank.keywordseverywhere.com/v1/domains/bulk.'}`
    };
}

async function fetchOpenPageRankHttp(url, options = {}, timeoutMs = 12000) {
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
        return {
            ok: Boolean(res.ok),
            status: Number(res.status || (res.ok ? 200 : 500)),
            headers: res.headers || null,
            json
        };
    } finally {
        clearTimeout(timer);
    }
}

async function fetchOpenPageRankData(config = {}, options = {}) {
    const cleanDomain = normalizeDomain(config.domain || DEFAULT_DOMAIN);
    const targetDomain = normalizeRootDomain(cleanDomain);
    const includeHistory = options.includeHistory !== false;
    const keyInfo = resolveOpenPageRankApiKey(config, options.overrideApiKey);

    if (!keyInfo.hasKey) {
        const unconfigured = {
            connected: false,
            connectionStatus: OPENPAGERANK_STATUS.NOT_CONFIGURED,
            provider: 'OpenPageRank',
            endpoint: OPENPAGERANK_BULK_ENDPOINT,
            domain: targetDomain,
            found: false,
            asOf: null,
            syncedAt: null,
            isEstimated: true,
            openPageRankScore: null,
            rank: null,
            referringDomains: null,
            history: [],
            historySummary: buildOpenPageRankHistorySummary([], null, false, targetDomain).summary,
            quota: null,
            errorType: null,
            keySource: 'none',
            reason: 'OpenPageRank API key is not configured. Add your OpenPageRank API key under SEO & Growth → Settings (or set OPENPAGERANK_API_KEY on the backend) and click Test Connection.',
            message: 'OpenPageRank API key is not configured.'
        };
        if (options.overrideApiKey === undefined) {
            memoryOprVerifications.set(cleanDomain, unconfigured);
        }
        return unconfigured;
    }

    const authHeaders = {
        Authorization: `Bearer ${keyInfo.key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    };

    try {
        const bulkRes = await fetchOpenPageRankHttp(
            OPENPAGERANK_BULK_ENDPOINT,
            {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    domains: [targetDomain],
                    include_history: Boolean(includeHistory)
                })
            },
            12000
        );

        let usageBody = null;
        if (bulkRes.ok && options.fetchUsage !== false) {
            try {
                const usageRes = await fetchOpenPageRankHttp(
                    OPENPAGERANK_USAGE_ENDPOINT,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${keyInfo.key}`,
                            Accept: 'application/json'
                        }
                    },
                    5000
                );
                if (usageRes.ok && usageRes.json && typeof usageRes.json === 'object') {
                    usageBody = usageRes.json;
                }
            } catch {
                // Optional /v1/usage enrichment; headers on /v1/domains/bulk already provide domain quota
            }
        }

        const quota = parseOpenPageRankQuotaHeaders(bulkRes.headers, usageBody);

        if (!bulkRes.ok) {
            const classified = classifyOpenPageRankError({
                status: bulkRes.status,
                payload: bulkRes.json,
                rawKey: keyInfo.key
            });
            const failedResult = {
                connected: false,
                connectionStatus: classified.connectionStatus,
                provider: 'OpenPageRank',
                endpoint: OPENPAGERANK_BULK_ENDPOINT,
                domain: targetDomain,
                found: false,
                asOf: null,
                syncedAt: null,
                isEstimated: true,
                openPageRankScore: null,
                rank: null,
                referringDomains: null,
                history: [],
                historySummary: buildOpenPageRankHistorySummary([], null, false, targetDomain).summary,
                quota,
                errorType: classified.errorType,
                httpStatus: classified.httpStatus,
                keySource: keyInfo.source,
                reason: classified.message,
                message: classified.message
            };
            if (options.overrideApiKey === undefined) {
                memoryOprVerifications.set(cleanDomain, failedResult);
            }
            return failedResult;
        }

        const payload = bulkRes.json || {};
        const results = Array.isArray(payload.results) ? payload.results : [];
        const entry = results.find((r) => normalizeRootDomain(r?.domain || '') === targetDomain) || results[0] || null;
        const found = Boolean(entry?.found);
        const openPageRankScore = entry?.open_page_rank !== null && entry?.open_page_rank !== undefined
            ? Number(Number(entry.open_page_rank).toFixed(2))
            : null;
        const rank = entry?.rank !== null && entry?.rank !== undefined
            ? Number(entry.rank)
            : null;
        const referringDomains = entry?.referring_domains !== null && entry?.referring_domains !== undefined
            ? Number(entry.referring_domains)
            : null;
        const asOf = payload.as_of ? String(payload.as_of).trim() : null;
        const syncedAt = new Date().toISOString();

        const { history, summary: historySummary } = buildOpenPageRankHistorySummary(
            entry?.history || [],
            openPageRankScore,
            found,
            targetDomain
        );

        const successMessage = found
            ? `Connected to OpenPageRank for ${targetDomain}. Score: ${openPageRankScore ?? 'N/A'}/10 · Global Rank: ${rank ? `#${rank.toLocaleString('en-US')}` : 'N/A'} · Referring Domains (OPR): ${referringDomains !== null ? referringDomains.toLocaleString('en-US') : 'N/A'}.`
            : `Connected to OpenPageRank API (as of ${asOf || 'latest release'}). Domain ${targetDomain} is not yet indexed in the Common Crawl domain graph (found: false).`;

        const successResult = {
            connected: true,
            connectionStatus: OPENPAGERANK_STATUS.CONNECTED,
            provider: 'OpenPageRank',
            endpoint: OPENPAGERANK_BULK_ENDPOINT,
            domain: entry?.domain || targetDomain,
            found,
            asOf,
            count: payload.count ?? results.length,
            invalid: Array.isArray(payload.invalid) ? payload.invalid : [],
            syncedAt,
            isEstimated: true,
            openPageRankScore,
            rank,
            referringDomains,
            history,
            historySummary,
            quota,
            errorType: null,
            keySource: keyInfo.source,
            reason: null,
            message: successMessage
        };

        if (options.overrideApiKey === undefined) {
            memoryOprVerifications.set(cleanDomain, successResult);
            await saveSnapshot(cleanDomain, 'backlink_opr', successResult, 'OpenPageRank API');
        }

        return successResult;
    } catch (err) {
        const classified = classifyOpenPageRankError({
            status: Number(err?.status || 0),
            payload: err?.payload || null,
            errorMessage: err?.message || 'Network request failed',
            rawKey: keyInfo.key
        });
        const errorResult = {
            connected: false,
            connectionStatus: classified.connectionStatus,
            provider: 'OpenPageRank',
            endpoint: OPENPAGERANK_BULK_ENDPOINT,
            domain: targetDomain,
            found: false,
            asOf: null,
            syncedAt: null,
            isEstimated: true,
            openPageRankScore: null,
            rank: null,
            referringDomains: null,
            history: [],
            historySummary: buildOpenPageRankHistorySummary([], null, false, targetDomain).summary,
            quota: null,
            errorType: classified.errorType,
            httpStatus: classified.httpStatus,
            keySource: keyInfo.source,
            reason: classified.message,
            message: classified.message
        };
        if (options.overrideApiKey === undefined) {
            memoryOprVerifications.set(cleanDomain, errorResult);
        }
        return errorResult;
    }
}

function splitCsvRow(line = '', delimiter = ',') {
    const out = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === delimiter && !inQuotes) {
            out.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    out.push(current.trim());
    return out.map((cell) => cell.replace(/^"|"$/g, '').trim());
}

function normalizeHangbugTargetPage(rawTarget = '', defaultDomain = DEFAULT_DOMAIN) {
    const raw = String(rawTarget || '').trim();
    if (!raw) return { path: '/', fullUrl: `https://${normalizeDomain(defaultDomain)}/` };

    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            const pathOnly = parsed.pathname || '/';
            return {
                path: pathOnly,
                fullUrl: parsed.toString()
            };
        } catch {
            return { path: raw, fullUrl: raw };
        }
    }

    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    return {
        path: cleanPath,
        fullUrl: `https://${normalizeDomain(defaultDomain)}${cleanPath}`
    };
}

function extractExternalDomainAndUrl(rawSource = '', hangbugRoot = 'hangbug.com') {
    const raw = String(rawSource || '').trim();
    if (!raw) return { referringDomain: '', linkingPage: '' };

    if (/^https?:\/\//i.test(raw)) {
        try {
            const parsed = new URL(raw);
            const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
            if (!host || host === hangbugRoot || host === `www.${hangbugRoot}`) {
                return { referringDomain: '', linkingPage: '' };
            }
            return {
                referringDomain: host,
                linkingPage: parsed.toString()
            };
        } catch {
            // Fall through
        }
    }

    // Check if it looks like a domain or domain/path without scheme
    const withoutScheme = raw.replace(/^\/\//, '');
    const slashIdx = withoutScheme.indexOf('/');
    const hostCandidate = (slashIdx >= 0 ? withoutScheme.slice(0, slashIdx) : withoutScheme)
        .toLowerCase()
        .replace(/:\d+$/, '')
        .replace(/^www\./, '');

    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(hostCandidate) && hostCandidate !== hangbugRoot) {
        return {
            referringDomain: hostCandidate,
            linkingPage: slashIdx >= 0 && withoutScheme.slice(slashIdx).length > 1
                ? `https://${withoutScheme}`
                : ''
        };
    }

    return { referringDomain: '', linkingPage: '' };
}

function parseGscLinksCsv(csvText = '', defaultDomain = DEFAULT_DOMAIN) {
    const cleanText = String(csvText || '').replace(/^\uFEFF/, '').trim();
    if (!cleanText) {
        return { rows: [], detectedFormat: 'empty' };
    }

    const rawLines = cleanText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => Boolean(l) && !l.startsWith('#'));

    if (rawLines.length === 0) {
        return { rows: [], detectedFormat: 'empty' };
    }

    const sampleLine = rawLines[0];
    const delimiter = sampleLine.includes('\t') && !sampleLine.includes(',')
        ? '\t'
        : (sampleLine.includes(';') && !sampleLine.includes(',') ? ';' : ',');

    const firstRowCells = splitCsvRow(rawLines[0], delimiter);
    const lowerFirst = firstRowCells.map((c) => c.toLowerCase());

    const HEADER_KEYWORDS = [
        'domain', 'referring', 'linking site', 'source page', 'linking page',
        'target page', 'target url', 'external links', 'links', 'linked pages',
        'linking sites', 'anchor', 'first seen', 'top linking', 'top linked'
    ];
    const hasHeader = lowerFirst.some((cell) => HEADER_KEYWORDS.some((kw) => cell.includes(kw)));

    const hangbugRoot = normalizeRootDomain(defaultDomain);
    const dataLines = hasHeader ? rawLines.slice(1) : rawLines;
    const parsedRows = [];

    // Identify column indices when header is present
    let colSourceDomain = -1;
    let colSourceUrl = -1;
    let colTargetUrl = -1;
    let colLinksCount = -1;
    let colLinkedPagesCount = -1;
    let colLinkingSitesCount = -1;
    let colAnchor = -1;
    let colDate = -1;

    if (hasHeader) {
        lowerFirst.forEach((h, idx) => {
            if (colSourceUrl === -1 && (h.includes('source page') || h.includes('linking page') || h.includes('source url') || h === 'from')) {
                colSourceUrl = idx;
            } else if (colSourceDomain === -1 && (h.includes('linking site') || h.includes('referring') || h.includes('external domain') || h === 'domain' || h === 'site')) {
                colSourceDomain = idx;
            } else if (colTargetUrl === -1 && (h.includes('target') || h.includes('linked page') || h.includes('destination') || h === 'to' || h === 'page')) {
                colTargetUrl = idx;
            } else if (colLinksCount === -1 && (h.includes('external links') || h.includes('incoming links') || h.includes('link count') || h === 'links' || h === 'backlinks')) {
                colLinksCount = idx;
            } else if (colLinkedPagesCount === -1 && h.includes('linked pages')) {
                colLinkedPagesCount = idx;
            } else if (colLinkingSitesCount === -1 && (h.includes('linking sites') || h.includes('linking domains'))) {
                colLinkingSitesCount = idx;
            } else if (colAnchor === -1 && (h.includes('anchor') || h.includes('link text'))) {
                colAnchor = idx;
            } else if (colDate === -1 && (h.includes('first seen') || h.includes('last seen') || h.includes('date') || h.includes('discovered'))) {
                colDate = idx;
            }
        });
    }

    for (const line of dataLines) {
        const cells = splitCsvRow(line, delimiter);
        if (cells.length === 0 || cells.every((c) => !c)) continue;

        let referringDomain = '';
        let linkingPage = '';
        let targetPage = '';
        let fullTargetUrl = '';
        let linksCount = 1;
        let linkedPagesCount = null;
        let linkingSitesCount = null;
        let anchorText = '';
        let firstSeen = '';

        if (hasHeader && (colSourceDomain !== -1 || colSourceUrl !== -1 || colTargetUrl !== -1)) {
            if (colSourceUrl !== -1 && cells[colSourceUrl]) {
                const ext = extractExternalDomainAndUrl(cells[colSourceUrl], hangbugRoot);
                referringDomain = ext.referringDomain;
                linkingPage = ext.linkingPage || cells[colSourceUrl];
            }
            if (colSourceDomain !== -1 && cells[colSourceDomain]) {
                const ext = extractExternalDomainAndUrl(cells[colSourceDomain], hangbugRoot);
                if (ext.referringDomain) referringDomain = ext.referringDomain;
                if (!linkingPage && ext.linkingPage) linkingPage = ext.linkingPage;
            }
            if (colTargetUrl !== -1 && cells[colTargetUrl]) {
                const normTarget = normalizeHangbugTargetPage(cells[colTargetUrl], defaultDomain);
                targetPage = normTarget.path;
                fullTargetUrl = normTarget.fullUrl;
            }
            if (colLinksCount !== -1 && cells[colLinksCount]) {
                const n = parseInt(String(cells[colLinksCount]).replace(/,/g, ''), 10);
                if (Number.isFinite(n) && n > 0) linksCount = n;
            }
            if (colLinkedPagesCount !== -1 && cells[colLinkedPagesCount]) {
                const n = parseInt(String(cells[colLinkedPagesCount]).replace(/,/g, ''), 10);
                if (Number.isFinite(n) && n > 0) linkedPagesCount = n;
            }
            if (colLinkingSitesCount !== -1 && cells[colLinkingSitesCount]) {
                const n = parseInt(String(cells[colLinkingSitesCount]).replace(/,/g, ''), 10);
                if (Number.isFinite(n) && n > 0) linkingSitesCount = n;
            }
            if (colAnchor !== -1 && cells[colAnchor]) {
                anchorText = cells[colAnchor];
            }
            if (colDate !== -1 && cells[colDate]) {
                firstSeen = cells[colDate];
            }
        } else {
            // Heuristic row parsing for headerless CSVs or custom GSC exports:
            // Format 1: sourceUrl, targetUrl (e.g. GSC "Latest links" without standard header)
            // Format 2: domain.com, linksCount, /target-page, anchorText, linkingPageUrl
            // Format 3: https://www.hangbug.com/page, externalLinksCount, linkingSitesCount
            const firstCell = cells[0] || '';
            const secondCell = cells[1] || '';
            const thirdCell = cells[2] || '';
            const fourthCell = cells[3] || '';
            const fifthCell = cells[4] || '';

            const firstExt = extractExternalDomainAndUrl(firstCell, hangbugRoot);
            if (firstExt.referringDomain) {
                referringDomain = firstExt.referringDomain;
                linkingPage = firstExt.linkingPage;

                const secondAsInt = parseInt(secondCell.replace(/,/g, ''), 10);
                if (Number.isFinite(secondAsInt) && /^\d+$/.test(secondCell.replace(/,/g, ''))) {
                    linksCount = Math.max(1, secondAsInt);
                    const thirdAsInt = parseInt(thirdCell.replace(/,/g, ''), 10);
                    if (thirdCell && Number.isFinite(thirdAsInt) && /^\d+$/.test(thirdCell.replace(/,/g, ''))) {
                        linkedPagesCount = thirdAsInt;
                    } else if (thirdCell) {
                        const normT = normalizeHangbugTargetPage(thirdCell, defaultDomain);
                        targetPage = normT.path;
                        fullTargetUrl = normT.fullUrl;
                    }
                    if (fourthCell) {
                        if (/^https?:\/\//i.test(fourthCell) && !linkingPage) {
                            linkingPage = fourthCell;
                        } else {
                            anchorText = fourthCell;
                        }
                    }
                    if (fifthCell && !linkingPage && /^https?:\/\//i.test(fifthCell)) {
                        linkingPage = fifthCell;
                    }
                } else if (secondCell) {
                    const normT = normalizeHangbugTargetPage(secondCell, defaultDomain);
                    targetPage = normT.path;
                    fullTargetUrl = normT.fullUrl;
                    if (thirdCell) {
                        const thirdInt = parseInt(thirdCell.replace(/,/g, ''), 10);
                        if (Number.isFinite(thirdInt) && /^\d+$/.test(thirdCell.replace(/,/g, ''))) {
                            linksCount = Math.max(1, thirdInt);
                        } else {
                            anchorText = thirdCell;
                        }
                    }
                }
            } else if (firstCell.startsWith('/') || firstCell.toLowerCase().includes(hangbugRoot)) {
                const normT = normalizeHangbugTargetPage(firstCell, defaultDomain);
                targetPage = normT.path;
                fullTargetUrl = normT.fullUrl;
                const secondInt = parseInt(secondCell.replace(/,/g, ''), 10);
                if (Number.isFinite(secondInt) && secondInt > 0) linksCount = secondInt;
                const thirdInt = parseInt(thirdCell.replace(/,/g, ''), 10);
                if (Number.isFinite(thirdInt) && thirdInt > 0) linkingSitesCount = thirdInt;
            }
        }

        if (referringDomain || targetPage) {
            parsedRows.push({
                referringDomain,
                linkingPage,
                targetPage: targetPage || '/',
                fullTargetUrl: fullTargetUrl || normalizeHangbugTargetPage(targetPage || '/', defaultDomain).fullUrl,
                hasExplicitTarget: Boolean(targetPage),
                linksCount: Math.max(1, Number(linksCount) || 1),
                linkedPagesCount,
                linkingSitesCount,
                anchorText,
                firstSeen
            });
        }
    }

    return {
        rows: parsedRows,
        detectedFormat: hasHeader ? 'gsc_csv_with_header' : 'csv_rows'
    };
}

async function importGscBacklinks(domain, input = []) {
    const cleanDomain = normalizeDomain(domain);
    let rawRows = [];
    let fileName = 'gsc-links-export.csv';
    let reportDate = null;

    if (Array.isArray(input)) {
        rawRows = input.map((row) => {
            const ext = extractExternalDomainAndUrl(
                row.linkingPage || row.sourceUrl || row.referringDomain || row.domain || '',
                normalizeRootDomain(cleanDomain)
            );
            const tRaw = row.targetPage || row.target || '';
            const normTarget = normalizeHangbugTargetPage(tRaw || '/', cleanDomain);
            return {
                referringDomain: ext.referringDomain || String(row.referringDomain || row.domain || '').trim().toLowerCase(),
                linkingPage: String(row.linkingPage || row.sourceUrl || ext.linkingPage || '').trim(),
                targetPage: normTarget.path,
                fullTargetUrl: normTarget.fullUrl,
                hasExplicitTarget: Boolean(tRaw),
                linksCount: Math.max(1, parseInt(row.linksCount || row.links || '1', 10) || 1),
                linkedPagesCount: row.linkedPagesCount ? Number(row.linkedPagesCount) : null,
                linkingSitesCount: row.linkingSitesCount ? Number(row.linkingSitesCount) : null,
                anchorText: String(row.anchorText || row.anchor || '').trim(),
                firstSeen: String(row.firstSeen || row.date || '').trim()
            };
        }).filter((r) => Boolean(r.referringDomain || r.hasExplicitTarget));
    } else if (input && typeof input === 'object') {
        if (input.fileName) fileName = String(input.fileName).trim() || fileName;
        if (input.reportDate) reportDate = String(input.reportDate).trim();
        if (input.csvText && String(input.csvText).trim()) {
            const parsed = parseGscLinksCsv(input.csvText, cleanDomain);
            rawRows.push(...parsed.rows);
        }
        if (Array.isArray(input.items) && input.items.length > 0) {
            for (const row of input.items) {
                const ext = extractExternalDomainAndUrl(
                    row.linkingPage || row.sourceUrl || row.referringDomain || row.domain || '',
                    normalizeRootDomain(cleanDomain)
                );
                const tRaw = row.targetPage || row.target || '';
                const normTarget = normalizeHangbugTargetPage(tRaw || '/', cleanDomain);
                if (ext.referringDomain || String(row.referringDomain || row.domain || '').trim() || tRaw) {
                    rawRows.push({
                        referringDomain: ext.referringDomain || String(row.referringDomain || row.domain || '').trim().toLowerCase(),
                        linkingPage: String(row.linkingPage || row.sourceUrl || ext.linkingPage || '').trim(),
                        targetPage: normTarget.path,
                        fullTargetUrl: normTarget.fullUrl,
                        hasExplicitTarget: Boolean(tRaw),
                        linksCount: Math.max(1, parseInt(row.linksCount || row.links || '1', 10) || 1),
                        linkedPagesCount: row.linkedPagesCount ? Number(row.linkedPagesCount) : null,
                        linkingSitesCount: row.linkingSitesCount ? Number(row.linkingSitesCount) : null,
                        anchorText: String(row.anchorText || row.anchor || '').trim(),
                        firstSeen: String(row.firstSeen || row.date || '').trim()
                    });
                }
            }
        }
    }

    if (rawRows.length === 0) {
        throw new Error('Provide at least one valid Google Search Console Links CSV row (external linking domain or target page).');
    }

    // Aggregate external linking domains
    const domainMap = new Map();
    const targetMap = new Map();
    const linkingPages = [];
    const anchorCounts = {};

    for (const r of rawRows) {
        const refDom = String(r.referringDomain || '').trim().toLowerCase();
        const tPath = String(r.targetPage || '/').trim();
        const tFull = r.fullTargetUrl || normalizeHangbugTargetPage(tPath, cleanDomain).fullUrl;

        if (refDom) {
            const existingDom = domainMap.get(refDom) || {
                referringDomain: refDom,
                linksCount: 0,
                linkedPagesCount: null,
                targetPagesSet: new Set(),
                linkingPagesSet: new Set(),
                anchorsSet: new Set()
            };
            existingDom.linksCount += r.linksCount;
            if (r.linkedPagesCount !== null && r.linkedPagesCount !== undefined) {
                existingDom.linkedPagesCount = Math.max(existingDom.linkedPagesCount || 0, r.linkedPagesCount);
            }
            if (r.hasExplicitTarget || tPath) {
                existingDom.targetPagesSet.add(tPath);
            }
            if (r.linkingPage) {
                existingDom.linkingPagesSet.add(r.linkingPage);
            }
            if (r.anchorText) {
                existingDom.anchorsSet.add(r.anchorText);
            }
            domainMap.set(refDom, existingDom);
        }

        if (r.hasExplicitTarget || !refDom || tPath) {
            const existingTarget = targetMap.get(tPath) || {
                targetPage: tPath,
                fullUrl: tFull,
                linksCount: 0,
                explicitLinkingSitesCount: null,
                linkingDomainsSet: new Set(),
                linkingPagesSet: new Set()
            };
            existingTarget.linksCount += r.linksCount;
            if (r.linkingSitesCount !== null && r.linkingSitesCount !== undefined) {
                existingTarget.explicitLinkingSitesCount = Math.max(existingTarget.explicitLinkingSitesCount || 0, r.linkingSitesCount);
            }
            if (refDom) {
                existingTarget.linkingDomainsSet.add(refDom);
            }
            if (r.linkingPage) {
                existingTarget.linkingPagesSet.add(r.linkingPage);
            }
            targetMap.set(tPath, existingTarget);
        }

        if (r.linkingPage || r.anchorText || r.firstSeen || (refDom && r.hasExplicitTarget)) {
            linkingPages.push({
                linkingPage: r.linkingPage || `https://${refDom}`,
                hasFullSourceUrl: Boolean(r.linkingPage),
                referringDomain: refDom || 'External Site',
                targetPage: tPath,
                fullTargetUrl: tFull,
                linksCount: r.linksCount,
                anchorText: r.anchorText || '',
                firstSeen: r.firstSeen || ''
            });
        }

        if (r.anchorText) {
            anchorCounts[r.anchorText] = (anchorCounts[r.anchorText] || 0) + r.linksCount;
        }
    }

    const externalLinkingDomains = Array.from(domainMap.values())
        .map((d) => {
            const targetPages = Array.from(d.targetPagesSet);
            return {
                referringDomain: d.referringDomain,
                linksCount: d.linksCount,
                linkedPagesCount: d.linkedPagesCount || targetPages.length || 1,
                targetPage: targetPages[0] || '/',
                targetPages,
                linkingPages: Array.from(d.linkingPagesSet).slice(0, 10),
                anchorText: Array.from(d.anchorsSet)[0] || '',
                anchorTexts: Array.from(d.anchorsSet)
            };
        })
        .sort((a, b) => b.linksCount - a.linksCount)
        .slice(0, 200);

    const targetPages = Array.from(targetMap.values())
        .map((t) => {
            const linkingDomains = Array.from(t.linkingDomainsSet);
            return {
                targetPage: t.targetPage,
                fullUrl: t.fullUrl,
                linksCount: t.linksCount,
                linkingDomainsCount: t.explicitLinkingSitesCount || linkingDomains.length || 1,
                linkingDomains: linkingDomains.slice(0, 25),
                sampleLinkingPages: Array.from(t.linkingPagesSet).slice(0, 10)
            };
        })
        .sort((a, b) => b.linksCount - a.linksCount)
        .slice(0, 200);

    const topAnchors = Object.entries(anchorCounts)
        .map(([anchor, count]) => ({ anchor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

    const totalBacklinks = externalLinkingDomains.length > 0
        ? externalLinkingDomains.reduce((sum, r) => sum + r.linksCount, 0)
        : targetPages.reduce((sum, t) => sum + t.linksCount, 0);

    const importedAt = new Date().toISOString();
    const payload = {
        available: true,
        isLive: false,
        originalSource: 'Google Search Console Links Report (Manual CSV Import)',
        fileName,
        importedAt,
        reportDate: reportDate || importedAt,
        disclosure: 'Manual Google Search Console Links CSV import. This is a static report snapshot preserved with its original source and import date, not live real-time backlink data.',
        summary: {
            referringDomains: externalLinkingDomains.length,
            totalBacklinks,
            targetPagesCount: targetPages.length,
            linkingPagesCount: linkingPages.length,
            domainRankScore: null,
            globalRank: null
        },
        externalLinkingDomains,
        referringDomainsList: externalLinkingDomains.slice(0, 100),
        targetPages,
        linkingPages: linkingPages.slice(0, 200),
        topAnchors
    };

    await saveSnapshot(cleanDomain, 'gsc_backlinks', payload, 'Google Search Console Links Report (Manual CSV Import)');
    return payload;
}

async function clearGscBacklinks(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    memorySnapshots.delete(`${cleanDomain}::gsc_backlinks`);
    try {
        if (prisma && prisma.seoIntegrationSnapshot && typeof prisma.seoIntegrationSnapshot.delete === 'function') {
            await prisma.seoIntegrationSnapshot.delete({
                where: {
                    domain_provider: {
                        domain: cleanDomain,
                        provider: 'gsc_backlinks'
                    }
                }
            });
        }
    } catch {
        // Ignore if already absent
    }
    return { cleared: true };
}

async function getBacklinksData(config) {
    const cleanDomain = normalizeDomain(config?.domain || DEFAULT_DOMAIN);
    const [oprData, importedSnap] = await Promise.all([
        fetchOpenPageRankData(config),
        getSnapshot(cleanDomain, 'gsc_backlinks')
    ]);

    const rawImported = importedSnap?.data && (
        Array.isArray(importedSnap.data.externalLinkingDomains)
        || Array.isArray(importedSnap.data.referringDomainsList)
        || Array.isArray(importedSnap.data.targetPages)
    )
        ? importedSnap.data
        : null;

    const gscImport = rawImported
        ? {
            available: true,
            isLive: false,
            originalSource: rawImported.originalSource || importedSnap.source || 'Google Search Console Links Report (Manual CSV Import)',
            fileName: rawImported.fileName || 'gsc-links-export.csv',
            importedAt: rawImported.importedAt || importedSnap.syncedAt || null,
            reportDate: rawImported.reportDate || rawImported.importedAt || importedSnap.syncedAt || null,
            disclosure: rawImported.disclosure || 'Manual Google Search Console Links CSV import. This is a static report snapshot preserved with its original source and import date, not live real-time backlink data.',
            summary: {
                referringDomains: rawImported.summary?.referringDomains ?? (rawImported.externalLinkingDomains || rawImported.referringDomainsList || []).length,
                totalBacklinks: rawImported.summary?.totalBacklinks ?? null,
                targetPagesCount: rawImported.summary?.targetPagesCount ?? (rawImported.targetPages || []).length,
                linkingPagesCount: rawImported.summary?.linkingPagesCount ?? (rawImported.linkingPages || []).length
            },
            externalLinkingDomains: rawImported.externalLinkingDomains || rawImported.referringDomainsList || [],
            targetPages: rawImported.targetPages || [],
            linkingPages: rawImported.linkingPages || [],
            topAnchors: rawImported.topAnchors || []
        }
        : null;

    const hasOpr = Boolean(oprData.connected);
    const hasGscCsv = Boolean(gscImport && gscImport.available);
    const syncedAt = oprData.syncedAt || gscImport?.importedAt || null;

    let sourceLabel = 'Not Connected';
    if (hasOpr && hasGscCsv) {
        sourceLabel = 'OpenPageRank API + Google Search Console Links CSV (Manual Import)';
    } else if (hasOpr) {
        sourceLabel = 'OpenPageRank API (External Domain Authority & Referring Domains)';
    } else if (hasGscCsv) {
        sourceLabel = 'Google Search Console Links CSV (Manual Import Snapshot)';
    }

    return {
        connected: Boolean(hasOpr || hasGscCsv),
        connectionStatus: oprData.connectionStatus,
        openPageRankConnected: hasOpr,
        gscImportAvailable: hasGscCsv,
        isEstimated: hasOpr,
        source: sourceLabel,
        syncedAt,
        lastDataUpdate: syncedAt,
        reason: !hasOpr ? oprData.reason : null,
        openPageRank: {
            connected: hasOpr,
            connectionStatus: oprData.connectionStatus,
            provider: 'OpenPageRank',
            endpoint: OPENPAGERANK_BULK_ENDPOINT,
            domain: oprData.domain,
            found: oprData.found,
            asOf: oprData.asOf,
            syncedAt: oprData.syncedAt,
            score: oprData.openPageRankScore,
            maxScore: 10,
            globalRank: oprData.rank,
            referringDomains: oprData.referringDomains,
            history: oprData.history,
            historySummary: oprData.historySummary,
            quota: oprData.quota,
            errorType: oprData.errorType || null,
            keySource: oprData.keySource || 'none',
            message: oprData.message || oprData.reason || ''
        },
        gscLinksImport: gscImport || {
            available: false,
            isLive: false,
            originalSource: 'Google Search Console Links Report (Manual CSV Import)',
            fileName: null,
            importedAt: null,
            reportDate: null,
            disclosure: 'Upload an official Google Search Console Links CSV export to inspect external linking domains, target pages, and available linking-page details.',
            summary: null,
            externalLinkingDomains: [],
            targetPages: [],
            linkingPages: [],
            topAnchors: []
        },
        metricExplanations: {
            openPageRankScore: "An external estimate of your website's authority based on its link graph. It is not a Google ranking score.",
            globalDomainRank: "Your website's estimated global position compared with other domains in the OpenPageRank link graph (#1 is the highest authority worldwide).",
            referringDomains: "The number of linking domains reported by the selected data provider. OpenPageRank's referring_domains metric is an authority-weighted linking domain count from Common Crawl, not a complete verified backlink count.",
            monthlyAuthorityHistory: "Monthly historical authority scores (0–10) from OpenPageRank. Measured months correspond to actual Common Crawl releases, while Estimated months are linearly interpolated between releases.",
            apiQuota: "Your OpenPageRank plan's monthly domain lookup usage, remaining domain quota, and per-minute rate limit balance.",
            gscLinksReport: "A static snapshot manually imported from your official Google Search Console Links CSV export, preserving the original source and import date."
        },
        summary: {
            domainRankScore: oprData.openPageRankScore,
            openPageRankScore: oprData.openPageRankScore,
            globalRank: oprData.rank,
            referringDomains: hasOpr && oprData.referringDomains !== null
                ? oprData.referringDomains
                : (gscImport?.summary?.referringDomains ?? null),
            openPageRankReferringDomains: oprData.referringDomains,
            gscImportedReferringDomains: gscImport?.summary?.referringDomains ?? null,
            // Do not label OpenPageRank's referring_domains value as a complete verified backlink count
            totalBacklinks: gscImport?.summary?.totalBacklinks ?? null
        },
        referringDomainsList: gscImport?.externalLinkingDomains || [],
        targetPagesList: gscImport?.targetPages || [],
        linkingPagesList: gscImport?.linkingPages || [],
        topAnchors: gscImport?.topAnchors || []
    };
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

async function testIntegrationConnection(domain, target, options = {}) {
    const config = await getProjectConfig(domain);
    const dateRange = resolveDateRange('7d');

    if (target === 'gsc') {
        const res = await fetchSearchConsolePerformance(config, dateRange);
        return {
            ok: Boolean(res.connected),
            provider: 'Google Search Console',
            authenticated: Boolean(res.authenticated),
            authStatus: res.authStatus || 'Not Configured',
            serviceAccountEmail: res.serviceAccountEmail || config.googleServiceAccountEmail || '',
            property: res.property || DEFAULT_GSC_PROPERTY,
            permissionLevel: res.permissionLevel || null,
            availableProperties: Array.isArray(res.availableProperties) ? res.availableProperties : [],
            message: res.connected
                ? `Connected to ${res.property} (permissionLevel: ${res.permissionLevel}). Found ${res.topQueries.length} queries and ${res.sitemaps.length} sitemap(s).`
                : res.reason
        };
    }
    if (target === 'ga4') {
        const res = await fetchGa4Performance(config, dateRange);
        return {
            ok: Boolean(res.connected),
            provider: 'Google Analytics 4',
            propertyId: res.propertyId || '',
            resourceName: res.resourceName || '',
            measurementId: res.measurementId || DEFAULT_GA4_MEASUREMENT_ID,
            serviceAccountEmail: res.serviceAccountEmail || config.googleServiceAccountEmail || '',
            syncedAt: res.syncedAt || null,
            errorCategory: res.errorCategory || null,
            summary: res.summary || null,
            message: res.connected
                ? `Connected to GA4 Property ${res.resourceName} (Tag: ${res.measurementId}). Retrieved ${res.summary.activeUsers} active users, ${res.summary.totalUsers} total users, ${res.summary.sessions} sessions, and ${res.summary.pageViews} page views.`
                : res.reason
        };
    }
    if (target === 'pagespeed') {
        const cleanDomain = normalizeDomain(domain);
        const keyInfo = resolvePageSpeedApiKey(config);
        const rawTargetUrl = options.url || (
            (cleanDomain === 'hangbug.com' || cleanDomain === 'www.hangbug.com')
                ? `${DEFAULT_SITE_URL}/`
                : config.siteUrl
        );
        const urlCheck = validateAndNormalizePageSpeedUrl(config, rawTargetUrl);
        if (!urlCheck.valid) {
            return {
                ok: false,
                provider: 'Google PageSpeed Insights',
                connectionStatus: 'Connection Error',
                apiKeyConfigured: keyInfo.hasKey,
                apiKeySource: keyInfo.source,
                apiEnabled: null,
                authenticated: false,
                targetUrl: rawTargetUrl,
                testedStrategies: ['mobile', 'desktop'],
                errorCategory: 'invalid_url',
                mobilePerformance: null,
                desktopPerformance: null,
                message: redactPageSpeedApiKey(urlCheck.userMessage || urlCheck.message, keyInfo.key)
            };
        }

        const canonicalTargetUrl = urlCheck.canonicalUrl;
        const psiOpts = {
            forceRefresh: true,
            throttleMs: options.throttleMs,
            maxRequestsPerMinute: options.maxRequestsPerMinute,
            maxRetries: options.maxRetries !== undefined ? options.maxRetries : 1,
            baseBackoffMs: options.baseBackoffMs
        };

        const buildFailurePayload = (err, { mobileReport = null, desktopReport = null } = {}) => {
            const errCat = err?.errorCategory || 'api_error';
            const connStatus = mapPageSpeedErrorCategoryToStatus(errCat);
            const mobilePerf = typeof mobileReport?.scores?.performance === 'number' ? mobileReport.scores.performance : null;
            const desktopPerf = typeof desktopReport?.scores?.performance === 'number' ? desktopReport.scores.performance : null;
            const baseMsg = redactPageSpeedApiKey(
                err?.userMessage || err?.message || 'PageSpeed Insights test failed.',
                keyInfo.key
            );
            const partialNote = (mobilePerf !== null && desktopPerf === null)
                ? ` (Mobile succeeded: ${mobilePerf}/100; Desktop failed.)`
                : (desktopPerf !== null && mobilePerf === null)
                    ? ` (Desktop succeeded: ${desktopPerf}/100; Mobile failed.)`
                    : '';

            return {
                ok: false,
                provider: 'Google PageSpeed Insights',
                connectionStatus: connStatus,
                apiKeyConfigured: keyInfo.hasKey,
                apiKeySource: keyInfo.source,
                apiEnabled: err?.apiEnabled ?? (errCat === 'api_disabled' ? false : (errCat === 'daily_quota_exceeded' || errCat === 'rate_limit_exceeded' ? true : null)),
                authenticated: errCat === 'api_disabled' || errCat === 'daily_quota_exceeded' || errCat === 'rate_limit_exceeded',
                targetUrl: canonicalTargetUrl,
                testedStrategies: ['mobile', 'desktop'],
                fromCache: false,
                checkedAt: new Date().toISOString(),
                mobilePerformance: mobilePerf,
                desktopPerformance: desktopPerf,
                mobile: mobileReport,
                desktop: desktopReport,
                errorCategory: errCat,
                isQuotaError: Boolean(err?.isQuotaError),
                isDailyQuota: Boolean(err?.isDailyQuota),
                projectNumber: err?.projectNumber || null,
                nextRetryAt: err?.nextRetryAt || null,
                hasCachedReport: Boolean(err?.hasCachedReport),
                message: `${baseMsg}${partialNote}`
            };
        };

        // Start mobile live check first; if it fails fast on auth/disabled/daily-quota, return immediately without wasting a 2nd request
        const mobilePromise = runPageSpeedInsights(config, canonicalTargetUrl, 'mobile', psiOpts).then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason })
        );

        const configuredThrottle = options.throttleMs !== undefined
            ? Math.max(0, Number(options.throttleMs) || 0)
            : (process.env.PAGESPEED_THROTTLE_MS !== undefined ? Math.max(0, Number(process.env.PAGESPEED_THROTTLE_MS) || 0) : PAGESPEED_DEFAULT_THROTTLE_MS);
        const earlyWaitMs = configuredThrottle === 0 ? 25 : Math.min(1500, Math.max(250, configuredThrottle + 150));

        let timerId = null;
        const earlyOutcome = await Promise.race([
            mobilePromise,
            new Promise((resolve) => {
                timerId = setTimeout(() => resolve({ status: 'pending' }), earlyWaitMs);
            })
        ]);
        if (timerId) clearTimeout(timerId);

        const fatalCategories = new Set(['missing_api_key', 'invalid_api_key', 'api_disabled', 'daily_quota_exceeded']);
        if (earlyOutcome.status === 'rejected' && fatalCategories.has(earlyOutcome.reason?.errorCategory)) {
            return buildFailurePayload(earlyOutcome.reason);
        }

        const desktopPromise = runPageSpeedInsights(config, canonicalTargetUrl, 'desktop', psiOpts).then(
            (value) => ({ status: 'fulfilled', value }),
            (reason) => ({ status: 'rejected', reason })
        );

        const [mobileOutcome, desktopOutcome] = await Promise.all([mobilePromise, desktopPromise]);

        const mobileReport = mobileOutcome.status === 'fulfilled'
            ? (mobileOutcome.value?.mobile || mobileOutcome.value?.activeResult || null)
            : null;
        const desktopReport = desktopOutcome.status === 'fulfilled'
            ? (desktopOutcome.value?.desktop || desktopOutcome.value?.activeResult || null)
            : null;

        const mobilePerf = typeof mobileReport?.scores?.performance === 'number' ? mobileReport.scores.performance : null;
        const desktopPerf = typeof desktopReport?.scores?.performance === 'number' ? desktopReport.scores.performance : null;

        if (mobilePerf !== null && desktopPerf !== null) {
            const nowIso = new Date().toISOString();
            const successMessage = `Google PageSpeed Insights API v5 connected and verified for ${canonicalTargetUrl}. Mobile Performance: ${mobilePerf}/100 · Desktop Performance: ${desktopPerf}/100.`;
            const verificationRecord = {
                connected: true,
                connectionStatus: 'Connected',
                apiEnabled: true,
                errorCategory: null,
                keyFingerprint: keyInfo.fingerprint,
                checkedAt: nowIso,
                targetUrl: canonicalTargetUrl,
                testedStrategies: ['mobile', 'desktop'],
                mobilePerformance: mobilePerf,
                desktopPerformance: desktopPerf,
                message: successMessage
            };
            memoryPageSpeedVerifications.set(cleanDomain, verificationRecord);

            await withPageSpeedSnapshotLock(cleanDomain, async () => {
                const latestSnap = await getSnapshot(cleanDomain, 'pagespeed');
                const latestData = latestSnap?.data || {};
                await saveSnapshot(cleanDomain, 'pagespeed', {
                    ...latestData,
                    connectionVerification: verificationRecord,
                    quotaState: null,
                    lastError: null
                }, 'Google PageSpeed Insights API');
            });

            return {
                ok: true,
                provider: 'Google PageSpeed Insights',
                connectionStatus: 'Connected',
                apiKeyConfigured: keyInfo.hasKey,
                apiKeySource: keyInfo.source,
                apiEnabled: true,
                authenticated: true,
                targetUrl: canonicalTargetUrl,
                testedStrategies: ['mobile', 'desktop'],
                fromCache: false,
                checkedAt: nowIso,
                mobilePerformance: mobilePerf,
                desktopPerformance: desktopPerf,
                mobile: mobileReport,
                desktop: desktopReport,
                errorCategory: null,
                isQuotaError: false,
                isDailyQuota: false,
                message: successMessage
            };
        }

        const primaryErr = mobileOutcome.status === 'rejected'
            ? mobileOutcome.reason
            : (desktopOutcome.status === 'rejected'
                ? desktopOutcome.reason
                : { errorCategory: 'api_error', message: 'PageSpeed Insights responded without complete Mobile and Desktop performance scores.' });

        return buildFailurePayload(primaryErr, { mobileReport, desktopReport });
    }
    if (target === 'openpagerank' || target === 'backlinks') {
        const oprRes = await fetchOpenPageRankData(config, {
            overrideApiKey: options.apiKey,
            includeHistory: true
        });
        return {
            ok: Boolean(oprRes.connected),
            provider: 'OpenPageRank',
            connectionStatus: oprRes.connectionStatus,
            domain: oprRes.domain,
            found: oprRes.found,
            asOf: oprRes.asOf,
            syncedAt: oprRes.syncedAt,
            openPageRankScore: oprRes.openPageRankScore,
            globalRank: oprRes.rank,
            referringDomains: oprRes.referringDomains,
            historyMonths: oprRes.history ? oprRes.history.length : 0,
            quota: oprRes.quota || null,
            errorType: oprRes.errorType || null,
            message: oprRes.message || oprRes.reason
        };
    }

    return { ok: false, provider: target, message: 'Unknown integration target.' };
}

module.exports = {
    DEFAULT_DOMAIN,
    DEFAULT_SITE_URL,
    DEFAULT_GSC_PROPERTY,
    DEFAULT_GA4_PROPERTY_ID,
    DEFAULT_GA4_MEASUREMENT_ID,
    DEFAULT_GA4_STREAM_ID,
    GSC_READONLY_SCOPE,
    GA4_READONLY_SCOPE,
    OPENPAGERANK_API_BASE_URL,
    OPENPAGERANK_BULK_ENDPOINT,
    OPENPAGERANK_USAGE_ENDPOINT,
    OPENPAGERANK_CLEARED_SENTINEL,
    OPENPAGERANK_STATUS,
    PAGESPEED_API_SERVICE,
    PAGESPEED_EXPECTED_PROJECT_NUMBER,
    PAGESPEED_CACHE_TTL_MS,
    PAGESPEED_QUOTA_EXHAUSTED_MESSAGE,
    VERIFIED_GSC_PERMISSION_LEVELS,
    normalizeDomain,
    normalizeRootDomain,
    buildSiteUrl,
    normalizeGscPropertyIdentifier,
    validateAndNormalizeGa4PropertyId,
    classifyGa4ApiError,
    resolvePageSpeedApiKey,
    redactPageSpeedApiKey,
    resolvePageSpeedConnectionStatus,
    resolveOpenPageRankApiKey,
    redactOpenPageRankApiKey,
    parseOpenPageRankQuotaHeaders,
    buildOpenPageRankHistorySummary,
    classifyOpenPageRankError,
    fetchOpenPageRankData,
    parseGscLinksCsv,
    validatePageSpeedApiKey,
    validateAndNormalizePageSpeedUrl,
    extractGoogleProjectNumberFromError,
    computeNextDailyQuotaResetIso,
    computeNextRateLimitRetryIso,
    classifyPageSpeedApiError,
    getPrioritizedAuditableUrls,
    buildPageSpeedDashboardView,
    resetPageSpeedState,
    formatDurationSeconds,
    listSearchConsoleSites,
    resolvePropertyAgainstSitesList,
    verifySearchConsoleServiceAccount,
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
    clearGscBacklinks,
    getAiVisibilityData,
    testIntegrationConnection,
    classifySearchIntent
};
