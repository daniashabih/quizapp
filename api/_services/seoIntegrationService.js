const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT } = require('google-auth-library');
const prisma = require('../_config/prisma');

const DEFAULT_DOMAIN = 'www.hangbug.com';
const DEFAULT_SITE_URL = 'https://www.hangbug.com';
const DEFAULT_GA4_MEASUREMENT_ID = 'G-BSZBBFZZH0';
const DEFAULT_GA4_STREAM_ID = '16254821680';

const GSC_OAUTH_REQUIRED_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GSC_OAUTH_SCOPES = [
    GSC_OAUTH_REQUIRED_SCOPE,
    'openid',
    'email'
];
const GOOGLE_OAUTH_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_OAUTH_REVOKE_ENDPOINT = 'https://oauth2.googleapis.com/revoke';
const GOOGLE_OAUTH_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GSC_CALLBACK_PATH = '/api/admin/seo/gsc/oauth/callback';

const GSC_STATUS_LABELS = {
    connected: 'Connected',
    not_connected: 'Not Connected',
    expired: 'Connection Expired',
    revoked: 'Permission Revoked'
};

const VERIFIED_GSC_PERMISSION_LEVELS = new Set([
    'siteOwner',
    'siteFullUser',
    'siteRestrictedUser'
]);

const ISO3_COUNTRY_NAMES = {
    usa: 'United States',
    ind: 'India',
    pak: 'Pakistan',
    gbr: 'United Kingdom',
    can: 'Canada',
    aus: 'Australia',
    deu: 'Germany',
    fra: 'France',
    bra: 'Brazil',
    idn: 'Indonesia',
    phl: 'Philippines',
    bgd: 'Bangladesh',
    nga: 'Nigeria',
    nld: 'Netherlands',
    esp: 'Spain',
    ita: 'Italy',
    mex: 'Mexico',
    pol: 'Poland',
    tur: 'Turkey',
    jpn: 'Japan',
    kor: 'South Korea',
    sgp: 'Singapore',
    mys: 'Malaysia',
    are: 'United Arab Emirates',
    sau: 'Saudi Arabia',
    egy: 'Egypt',
    zaf: 'South Africa',
    vnm: 'Vietnam',
    tha: 'Thailand',
    ukr: 'Ukraine',
    rus: 'Russia',
    chn: 'China',
    twn: 'Taiwan',
    hkg: 'Hong Kong',
    swe: 'Sweden',
    nor: 'Norway',
    dnk: 'Denmark',
    fin: 'Finland',
    che: 'Switzerland',
    aut: 'Austria',
    bel: 'Belgium',
    irl: 'Ireland',
    prt: 'Portugal',
    arg: 'Argentina',
    col: 'Colombia',
    chl: 'Chile',
    per: 'Peru',
    ken: 'Kenya',
    npl: 'Nepal',
    lka: 'Sri Lanka'
};

const DEVICE_LABELS = {
    DESKTOP: 'Desktop',
    MOBILE: 'Mobile',
    TABLET: 'Tablet'
};

// In-memory fallback stores if Prisma client is not yet regenerated or DB is offline in tests
const memoryConfigs = new Map();
const memorySnapshots = new Map();

function clearDomainMemoryState(domain = null) {
    if (!domain) {
        memoryConfigs.clear();
        memorySnapshots.clear();
        return;
    }
    const clean = normalizeDomain(domain);
    memoryConfigs.delete(clean);
    for (const key of Array.from(memorySnapshots.keys())) {
        if (key.startsWith(`${clean}::`)) {
            memorySnapshots.delete(key);
        }
    }
}

function normalizeDomain(input) {
    const raw = String(input || DEFAULT_DOMAIN).trim().toLowerCase();
    return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || DEFAULT_DOMAIN;
}

function buildSiteUrl(domain) {
    const clean = normalizeDomain(domain);
    return `https://${clean}`;
}

function normalizeGscProperty(input) {
    const raw = String(input || '').trim();
    if (!raw) return '';
    if (/^sc-domain:/i.test(raw)) {
        const domainPart = raw
            .slice('sc-domain:'.length)
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '');
        return domainPart ? `sc-domain:${domainPart}` : '';
    }
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

function getEncryptionKey() {
    const material = String(
        process.env.SEO_TOKEN_ENCRYPTION_KEY
        || process.env.JWT_SECRET
        || 'hangbug_secret_jwt_key_2026'
    );
    return crypto.createHash('sha256').update(material).digest();
}

function encryptSecret(plaintext) {
    const raw = String(plaintext || '');
    if (!raw) return '';
    if (raw.startsWith('enc:v1:')) return raw;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `enc:v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptSecret(stored) {
    const raw = String(stored || '');
    if (!raw) return '';
    if (!raw.startsWith('enc:v1:')) {
        return raw;
    }
    const parts = raw.split(':');
    if (parts.length !== 5) return '';
    try {
        const iv = Buffer.from(parts[2], 'hex');
        const authTag = Buffer.from(parts[3], 'hex');
        const ciphertext = Buffer.from(parts[4], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch {
        return '';
    }
}

function getGoogleOAuthConfig() {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const envRedirectUri = String(process.env.GOOGLE_REDIRECT_URI || '').trim();
    const baseUrl = String(process.env.APP_BASE_URL || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
    const redirectUri = envRedirectUri || `${baseUrl}${GSC_CALLBACK_PATH}`;

    return {
        clientId,
        clientSecret,
        redirectUri,
        configured: Boolean(clientId && clientSecret)
    };
}

function createGscOAuthState({ domain = DEFAULT_DOMAIN, platform = 'web', userId = '', userEmail = '' } = {}) {
    const secret = process.env.JWT_SECRET || 'hangbug_secret_jwt_key_2026';
    return jwt.sign(
        {
            purpose: 'gsc_oauth',
            domain: normalizeDomain(domain),
            platform: platform === 'mobile' ? 'mobile' : 'web',
            userId: String(userId || ''),
            userEmail: String(userEmail || ''),
            nonce: crypto.randomBytes(16).toString('hex')
        },
        secret,
        { expiresIn: '10m' }
    );
}

function verifyGscOAuthState(stateToken) {
    if (!stateToken || typeof stateToken !== 'string') {
        const err = new Error('Missing OAuth state parameter.');
        err.status = 400;
        throw err;
    }
    const secret = process.env.JWT_SECRET || 'hangbug_secret_jwt_key_2026';
    let decoded;
    try {
        decoded = jwt.verify(stateToken, secret);
    } catch (e) {
        const err = new Error(
            e.name === 'TokenExpiredError'
                ? 'Google OAuth authorization session expired. Please try connecting again.'
                : 'Invalid Google OAuth state token.'
        );
        err.status = 400;
        throw err;
    }
    if (!decoded || decoded.purpose !== 'gsc_oauth') {
        const err = new Error('Invalid OAuth state purpose.');
        err.status = 400;
        throw err;
    }
    return {
        domain: normalizeDomain(decoded.domain || DEFAULT_DOMAIN),
        platform: decoded.platform === 'mobile' ? 'mobile' : 'web',
        userId: String(decoded.userId || ''),
        userEmail: String(decoded.userEmail || '')
    };
}

function buildGscOAuthAuthorizationUrl({ domain = DEFAULT_DOMAIN, platform = 'web', userId = '', userEmail = '' } = {}) {
    const oauth = getGoogleOAuthConfig();
    if (!oauth.clientId || !oauth.clientSecret) {
        const err = new Error(
            'Google OAuth 2.0 is not configured on the server. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables.'
        );
        err.status = 400;
        err.code = 'GSC_OAUTH_NOT_CONFIGURED';
        throw err;
    }

    const state = createGscOAuthState({ domain, platform, userId, userEmail });
    const params = new URLSearchParams({
        client_id: oauth.clientId,
        redirect_uri: oauth.redirectUri,
        response_type: 'code',
        scope: GSC_OAUTH_SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent select_account',
        include_granted_scopes: 'false',
        state
    });

    return {
        authUrl: `${GOOGLE_OAUTH_AUTH_ENDPOINT}?${params.toString()}`,
        redirectUri: oauth.redirectUri,
        state
    };
}

function parseAvailableProperties(jsonStr) {
    if (Array.isArray(jsonStr)) return jsonStr;
    try {
        const parsed = JSON.parse(String(jsonStr || '[]'));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function deriveGscConnectionStatus(config) {
    const explicitStatus = String(config.gscConnectionStatus || '').trim().toLowerCase();
    const hasRefreshToken = Boolean(decryptSecret(config.gscOAuthRefreshToken));
    const hasAccessToken = Boolean(decryptSecret(config.gscOAuthAccessToken));

    if (explicitStatus === 'revoked') {
        return 'revoked';
    }
    if (explicitStatus === 'expired') {
        return 'expired';
    }
    if (!hasRefreshToken && !hasAccessToken) {
        return 'not_connected';
    }
    if (!hasRefreshToken && hasAccessToken && config.gscOAuthTokenExpiry) {
        const expMs = new Date(config.gscOAuthTokenExpiry).getTime();
        if (!Number.isNaN(expMs) && expMs <= Date.now()) {
            return 'expired';
        }
    }
    return 'connected';
}

function getEnvDefaults(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    return {
        domain: cleanDomain,
        projectName: 'Hangbug',
        siteUrl: buildSiteUrl(cleanDomain),
        gscProperty: normalizeGscProperty(process.env.GSC_SITE_URL || ''),
        gscPropertyVerified: false,
        gscAccountEmail: '',
        gscConnectionStatus: 'not_connected',
        gscLastError: '',
        gscConnectedAt: null,
        gscLastSyncedAt: null,
        gscOAuthAccessToken: '',
        gscOAuthRefreshToken: '',
        gscOAuthTokenExpiry: null,
        gscOAuthScope: '',
        gscAvailablePropertiesJson: '[]',
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
        gscProperty: normalizeGscProperty(dbRecord?.gscProperty ?? envDefaults.gscProperty),
        gscPropertyVerified: Boolean(dbRecord?.gscPropertyVerified),
        gscAccountEmail: dbRecord?.gscAccountEmail || '',
        gscConnectionStatus: dbRecord?.gscConnectionStatus || 'not_connected',
        gscLastError: dbRecord?.gscLastError || '',
        gscConnectedAt: dbRecord?.gscConnectedAt || null,
        gscLastSyncedAt: dbRecord?.gscLastSyncedAt || null,
        gscOAuthAccessToken: dbRecord?.gscOAuthAccessToken || '',
        gscOAuthRefreshToken: dbRecord?.gscOAuthRefreshToken || '',
        gscOAuthTokenExpiry: dbRecord?.gscOAuthTokenExpiry || null,
        gscOAuthScope: dbRecord?.gscOAuthScope || '',
        gscAvailablePropertiesJson: dbRecord?.gscAvailablePropertiesJson || '[]',
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

async function persistProjectConfigRecord(cleanDomain, next) {
    const updateData = {
        projectName: next.projectName,
        siteUrl: next.siteUrl,
        gscProperty: next.gscProperty,
        gscPropertyVerified: Boolean(next.gscPropertyVerified),
        gscAccountEmail: next.gscAccountEmail || '',
        gscConnectionStatus: next.gscConnectionStatus || 'not_connected',
        gscLastError: next.gscLastError || '',
        gscConnectedAt: next.gscConnectedAt ? new Date(next.gscConnectedAt) : null,
        gscLastSyncedAt: next.gscLastSyncedAt ? new Date(next.gscLastSyncedAt) : null,
        gscOAuthAccessToken: next.gscOAuthAccessToken || '',
        gscOAuthRefreshToken: next.gscOAuthRefreshToken || '',
        gscOAuthTokenExpiry: next.gscOAuthTokenExpiry ? new Date(next.gscOAuthTokenExpiry) : null,
        gscOAuthScope: next.gscOAuthScope || '',
        gscAvailablePropertiesJson: next.gscAvailablePropertiesJson || '[]',
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
    };

    try {
        if (prisma && prisma.seoProjectConfig && typeof prisma.seoProjectConfig.upsert === 'function') {
            const saved = await prisma.seoProjectConfig.upsert({
                where: { domain: cleanDomain },
                create: {
                    domain: cleanDomain,
                    ...updateData
                },
                update: updateData
            });
            memoryConfigs.set(cleanDomain, saved);
            return saved;
        }
    } catch {
        // Fallback to in-memory store
    }

    const memRecord = {
        domain: cleanDomain,
        ...updateData,
        updatedAt: new Date().toISOString()
    };
    memoryConfigs.set(cleanDomain, memRecord);
    return memRecord;
}

async function patchGscOAuthState(domain, patch = {}) {
    const cleanDomain = normalizeDomain(domain);
    const current = await getProjectConfig(cleanDomain);
    const next = {
        ...current,
        ...patch
    };
    return persistProjectConfigRecord(cleanDomain, next);
}

function sanitizeConfigForClient(config) {
    const oauth = getGoogleOAuthConfig();
    const gscStatus = deriveGscConnectionStatus(config);
    const gscStatusLabel = GSC_STATUS_LABELS[gscStatus] || 'Not Connected';
    const availableProperties = parseAvailableProperties(config.gscAvailablePropertiesJson);
    const gscAuthorized = gscStatus === 'connected';
    const gscConfigured = Boolean(gscAuthorized && config.gscProperty && config.gscPropertyVerified);

    const hasGoogleServiceAccount = Boolean(config.googleServiceAccountEmail && config.googlePrivateKey);
    const hasGa4Credentials = hasGoogleServiceAccount || Boolean(config.googleAccessToken);
    const ga4Configured = Boolean(hasGa4Credentials && config.ga4PropertyId);

    return {
        domain: config.domain,
        projectName: config.projectName || 'Hangbug',
        siteUrl: config.siteUrl || buildSiteUrl(config.domain),
        gscProperty: config.gscProperty || '',
        gscPropertyVerified: Boolean(config.gscPropertyVerified),
        gscAccountEmail: config.gscAccountEmail || '',
        gscConnectionStatus: gscStatus,
        gscConnectionStatusLabel: gscStatusLabel,
        gscLastError: config.gscLastError || '',
        gscConnectedAt: config.gscConnectedAt ? new Date(config.gscConnectedAt).toISOString() : null,
        gscLastSyncedAt: config.gscLastSyncedAt ? new Date(config.gscLastSyncedAt).toISOString() : null,
        gscAvailableProperties: availableProperties,
        gscOAuthConfigured: oauth.configured,
        gscRedirectUri: oauth.redirectUri,
        ga4PropertyId: config.ga4PropertyId || '',
        ga4MeasurementId: config.ga4MeasurementId || DEFAULT_GA4_MEASUREMENT_ID,
        ga4StreamId: DEFAULT_GA4_STREAM_ID,
        googleServiceAccountEmailMasked: maskEmail(config.googleServiceAccountEmail),
        hasGoogleServiceAccount,
        hasGoogleAccessToken: Boolean(config.googleAccessToken),
        hasGoogleCredentials: gscAuthorized || hasGa4Credentials,
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
            gscConnected: gscConfigured,
            gscAuthorized,
            gscStatus,
            gscStatusLabel,
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

    const nextGscProperty = updates.gscProperty !== undefined
        ? normalizeGscProperty(updates.gscProperty)
        : current.gscProperty;

    // If gscProperty changed via generic settings update, do not blindly assume verified access
    const gscPropertyChanged = nextGscProperty !== current.gscProperty;
    let nextGscVerified = current.gscPropertyVerified;
    if (gscPropertyChanged) {
        const available = parseAvailableProperties(current.gscAvailablePropertiesJson);
        const match = available.find(
            (p) => normalizeGscProperty(p.siteUrl).toLowerCase() === nextGscProperty.toLowerCase() && p.hasAccess
        );
        nextGscVerified = Boolean(match);
    }

    const next = {
        ...current,
        domain: cleanDomain,
        projectName: updates.projectName !== undefined ? String(updates.projectName).trim() || 'Hangbug' : current.projectName,
        siteUrl: updates.siteUrl !== undefined ? String(updates.siteUrl).trim().replace(/\/+$/, '') || buildSiteUrl(cleanDomain) : current.siteUrl,
        gscProperty: nextGscProperty,
        gscPropertyVerified: nextGscVerified,
        ga4PropertyId: updates.ga4PropertyId !== undefined ? String(updates.ga4PropertyId).trim() : current.ga4PropertyId,
        ga4MeasurementId: updates.ga4MeasurementId !== undefined ? String(updates.ga4MeasurementId).trim() || DEFAULT_GA4_MEASUREMENT_ID : current.ga4MeasurementId,
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

    return persistProjectConfigRecord(cleanDomain, next);
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

async function clearGscSnapshots(domain) {
    const cleanDomain = normalizeDomain(domain);
    for (const key of Array.from(memorySnapshots.keys())) {
        if (key.startsWith(`${cleanDomain}::gsc_`) && !key.endsWith('::gsc_backlinks')) {
            memorySnapshots.delete(key);
        }
    }
    try {
        if (prisma && prisma.seoIntegrationSnapshot && typeof prisma.seoIntegrationSnapshot.deleteMany === 'function') {
            await prisma.seoIntegrationSnapshot.deleteMany({
                where: {
                    domain: cleanDomain,
                    provider: { in: ['gsc_7d', 'gsc_28d', 'gsc_3m', 'gsc_6m', 'gsc_custom'] }
                }
            });
        }
    } catch {
        // Ignore if DB unavailable
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
    const end = new Date(today);
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

// Preserved exclusively for legacy/env GA4 Data API compatibility (never used for GSC)
async function getGa4AccessToken(config, scopes) {
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
            throw new Error('Failed to mint Google Analytics access token.');
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
            const msg = json?.error_description
                || (typeof json?.error === 'string' ? json.error : json?.error?.message)
                || json?.message
                || `HTTP ${res.status}`;
            const err = new Error(msg);
            err.status = res.status;
            err.payload = json;
            err.oauthError = typeof json?.error === 'string' ? json.error : (json?.error?.status || '');
            throw err;
        }
        return json;
    } finally {
        clearTimeout(timer);
    }
}

function extractEmailFromIdToken(idToken) {
    if (!idToken || typeof idToken !== 'string') return '';
    const parts = idToken.split('.');
    if (parts.length < 2) return '';
    try {
        const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        return typeof payload.email === 'string' ? payload.email.trim() : '';
    } catch {
        return '';
    }
}

async function fetchGoogleUserEmail(accessToken, idToken = '') {
    const fromIdToken = extractEmailFromIdToken(idToken);
    if (fromIdToken) return fromIdToken;

    try {
        const userinfo = await fetchJsonWithTimeout(GOOGLE_OAUTH_USERINFO_ENDPOINT, {
            method: 'GET',
            headers: { Authorization: `Bearer ${accessToken}` }
        }, 8000);
        return typeof userinfo?.email === 'string' ? userinfo.email.trim() : '';
    } catch {
        return '';
    }
}

function mapSitesApiEntries(siteEntries = []) {
    return (Array.isArray(siteEntries) ? siteEntries : [])
        .filter((entry) => entry && entry.siteUrl)
        .map((entry) => {
            const siteUrl = normalizeGscProperty(entry.siteUrl);
            const permissionLevel = String(entry.permissionLevel || 'siteUnverifiedUser');
            const isDomainProperty = siteUrl.startsWith('sc-domain:');
            const hasAccess = VERIFIED_GSC_PERMISSION_LEVELS.has(permissionLevel);
            return {
                siteUrl,
                permissionLevel,
                isDomainProperty,
                hasAccess
            };
        })
        .sort((a, b) => {
            if (a.hasAccess !== b.hasAccess) return a.hasAccess ? -1 : 1;
            if (a.isDomainProperty !== b.isDomainProperty) return a.isDomainProperty ? -1 : 1;
            return a.siteUrl.localeCompare(b.siteUrl);
        });
}

function pickVerifiedHangbugProperty(properties = [], currentProperty = '', domain = DEFAULT_DOMAIN) {
    const verified = properties.filter((p) => p.hasAccess);
    if (verified.length === 0) {
        return { property: '', verified: false };
    }

    const normalizedCurrent = normalizeGscProperty(currentProperty).toLowerCase();
    if (normalizedCurrent) {
        const existingMatch = verified.find((p) => p.siteUrl.toLowerCase() === normalizedCurrent);
        if (existingMatch) {
            return { property: existingMatch.siteUrl, verified: true };
        }
    }

    const rootDomain = normalizeDomain(domain).replace(/^www\./, '');
    const preferredOrder = [
        `sc-domain:${rootDomain}`,
        `https://www.${rootDomain}/`,
        `https://${rootDomain}/`
    ];
    for (const candidate of preferredOrder) {
        const match = verified.find((p) => p.siteUrl.toLowerCase() === candidate.toLowerCase());
        if (match) {
            return { property: match.siteUrl, verified: true };
        }
    }

    return { property: '', verified: false };
}

async function listGscPropertiesWithToken(accessToken) {
    const data = await fetchJsonWithTimeout('https://www.googleapis.com/webmasters/v3/sites', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }, 10000);
    return mapSitesApiEntries(data?.siteEntry || []);
}

async function exchangeGscOAuthCode({ domain = DEFAULT_DOMAIN, code }) {
    const cleanDomain = normalizeDomain(domain);
    if (!code || typeof code !== 'string') {
        const err = new Error('Missing Google OAuth authorization code.');
        err.status = 400;
        throw err;
    }

    const oauth = getGoogleOAuthConfig();
    if (!oauth.clientId || !oauth.clientSecret) {
        const err = new Error('Google OAuth 2.0 server credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are not configured.');
        err.status = 500;
        err.code = 'GSC_OAUTH_NOT_CONFIGURED';
        throw err;
    }

    const body = new URLSearchParams({
        code: code.trim(),
        client_id: oauth.clientId,
        client_secret: oauth.clientSecret,
        redirect_uri: oauth.redirectUri,
        grant_type: 'authorization_code'
    });

    const tokenData = await fetchJsonWithTimeout(GOOGLE_OAUTH_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    }, 12000);

    const accessToken = String(tokenData?.access_token || '').trim();
    if (!accessToken) {
        const err = new Error('Google OAuth token exchange did not return an access token.');
        err.status = 502;
        throw err;
    }

    const grantedScope = String(tokenData?.scope || '').trim();
    if (grantedScope && !grantedScope.includes(GSC_OAUTH_REQUIRED_SCOPE) && !grantedScope.includes('https://www.googleapis.com/auth/webmasters')) {
        await patchGscOAuthState(cleanDomain, {
            gscConnectionStatus: 'revoked',
            gscLastError: 'Read-only Search Console permission (webmasters.readonly) was not granted. Please reconnect and approve Search Console access.'
        });
        const err = new Error('Read-only Google Search Console permission was not granted.');
        err.status = 403;
        err.code = 'GSC_PERMISSION_REVOKED';
        throw err;
    }

    const current = await getProjectConfig(cleanDomain);
    const refreshTokenRaw = String(tokenData?.refresh_token || '').trim();
    const encryptedRefreshToken = refreshTokenRaw
        ? encryptSecret(refreshTokenRaw)
        : current.gscOAuthRefreshToken;

    const expiresInSec = Math.max(60, Number(tokenData?.expires_in) || 3600);
    const expiryDate = new Date(Date.now() + expiresInSec * 1000);
    const accountEmail = await fetchGoogleUserEmail(accessToken, tokenData?.id_token) || current.gscAccountEmail || '';

    // Retrieve available Search Console properties and verify access (never assume access)
    let properties = [];
    let propertyFetchError = '';
    try {
        properties = await listGscPropertiesWithToken(accessToken);
    } catch (e) {
        propertyFetchError = e.message || 'Unable to retrieve Search Console properties.';
    }

    const picked = pickVerifiedHangbugProperty(properties, current.gscProperty, cleanDomain);

    const saved = await patchGscOAuthState(cleanDomain, {
        gscOAuthAccessToken: encryptSecret(accessToken),
        gscOAuthRefreshToken: encryptedRefreshToken || '',
        gscOAuthTokenExpiry: expiryDate,
        gscOAuthScope: grantedScope || GSC_OAUTH_SCOPES.join(' '),
        gscAccountEmail: accountEmail,
        gscConnectionStatus: 'connected',
        gscLastError: propertyFetchError || (picked.verified ? '' : 'Select and verify your Hangbug property in Search Console settings.'),
        gscConnectedAt: new Date(),
        gscProperty: picked.property,
        gscPropertyVerified: picked.verified,
        gscAvailablePropertiesJson: JSON.stringify(properties)
    });

    return {
        accountEmail,
        properties,
        selectedProperty: picked.property,
        propertyVerified: picked.verified,
        settings: sanitizeConfigForClient(saved)
    };
}

function isRevokedOAuthError(err) {
    const oauthErr = String(err?.oauthError || err?.payload?.error || '').toLowerCase();
    const desc = String(err?.payload?.error_description || err?.message || '').toLowerCase();
    if (oauthErr === 'access_denied') return true;
    if (oauthErr === 'invalid_grant' && (desc.includes('revoked') || !desc.includes('expired'))) {
        return true;
    }
    if (oauthErr === 'invalid_grant' && desc.includes('expired') && desc.includes('revoked')) {
        return true;
    }
    if (err?.status === 403 && (desc.includes('insufficient') || desc.includes('scope'))) {
        return true;
    }
    return false;
}

async function getValidGscOAuthToken(domain = DEFAULT_DOMAIN, configInput = null, { forceRefresh = false } = {}) {
    const cleanDomain = normalizeDomain(domain);
    const config = configInput || await getProjectConfig(cleanDomain);
    const status = deriveGscConnectionStatus(config);

    if (status === 'revoked') {
        const err = new Error(config.gscLastError || 'Google Search Console permission was revoked. Please reconnect your Google account.');
        err.status = 401;
        err.code = 'GSC_PERMISSION_REVOKED';
        err.connectionStatus = 'revoked';
        throw err;
    }

    const accessToken = decryptSecret(config.gscOAuthAccessToken);
    const refreshToken = decryptSecret(config.gscOAuthRefreshToken);

    if (!accessToken && !refreshToken) {
        const err = new Error('Google Search Console is not connected.');
        err.status = 401;
        err.code = 'GSC_NOT_CONNECTED';
        err.connectionStatus = 'not_connected';
        throw err;
    }

    const expiryMs = config.gscOAuthTokenExpiry ? new Date(config.gscOAuthTokenExpiry).getTime() : 0;
    const isAccessTokenFresh = Boolean(accessToken) && !Number.isNaN(expiryMs) && expiryMs > (Date.now() + 60 * 1000);

    if (!forceRefresh && isAccessTokenFresh) {
        return { accessToken, refreshed: false };
    }

    if (!refreshToken) {
        const msg = 'Google Search Console access token has expired and no refresh token is stored. Please reconnect your Google account.';
        await patchGscOAuthState(cleanDomain, {
            gscOAuthAccessToken: '',
            gscConnectionStatus: 'expired',
            gscLastError: msg
        });
        const err = new Error(msg);
        err.status = 401;
        err.code = 'GSC_CONNECTION_EXPIRED';
        err.connectionStatus = 'expired';
        throw err;
    }

    const oauth = getGoogleOAuthConfig();
    if (!oauth.clientId || !oauth.clientSecret) {
        const err = new Error('Cannot refresh Google OAuth token: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured on the server.');
        err.status = 500;
        err.code = 'GSC_OAUTH_NOT_CONFIGURED';
        err.connectionStatus = 'expired';
        throw err;
    }

    try {
        const body = new URLSearchParams({
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });

        const tokenData = await fetchJsonWithTimeout(GOOGLE_OAUTH_TOKEN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString()
        }, 12000);

        const newAccessToken = String(tokenData?.access_token || '').trim();
        if (!newAccessToken) {
            throw new Error('Google token refresh response missing access_token.');
        }

        const expiresInSec = Math.max(60, Number(tokenData?.expires_in) || 3600);
        const newExpiry = new Date(Date.now() + expiresInSec * 1000);
        const rotatedRefresh = String(tokenData?.refresh_token || '').trim();

        await patchGscOAuthState(cleanDomain, {
            gscOAuthAccessToken: encryptSecret(newAccessToken),
            ...(rotatedRefresh ? { gscOAuthRefreshToken: encryptSecret(rotatedRefresh) } : {}),
            gscOAuthTokenExpiry: newExpiry,
            gscConnectionStatus: 'connected',
            gscLastError: ''
        });

        return { accessToken: newAccessToken, refreshed: true };
    } catch (refreshErr) {
        const revoked = isRevokedOAuthError(refreshErr);
        const nextStatus = revoked ? 'revoked' : 'expired';
        const message = revoked
            ? 'Google Search Console authorization was revoked or expired in Google Account permissions. Please reconnect your Google account.'
            : `Google Search Console session expired (${refreshErr.message}). Please reconnect your Google account.`;

        await patchGscOAuthState(cleanDomain, {
            gscOAuthAccessToken: '',
            gscConnectionStatus: nextStatus,
            gscLastError: message
        });

        const err = new Error(message);
        err.status = 401;
        err.code = revoked ? 'GSC_PERMISSION_REVOKED' : 'GSC_CONNECTION_EXPIRED';
        err.connectionStatus = nextStatus;
        throw err;
    }
}

async function fetchGscApiJson(domain, config, url, options = {}, timeoutMs = 12000) {
    const cleanDomain = normalizeDomain(domain);
    let tokenInfo = await getValidGscOAuthToken(cleanDomain, config, { forceRefresh: false });

    const execute = async (bearerToken) => {
        const headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${bearerToken}`
        };
        return fetchJsonWithTimeout(url, { ...options, headers }, timeoutMs);
    };

    try {
        return await execute(tokenInfo.accessToken);
    } catch (err) {
        if (err.status === 401 && !tokenInfo.refreshed) {
            const refreshedConfig = await getProjectConfig(cleanDomain);
            tokenInfo = await getValidGscOAuthToken(cleanDomain, refreshedConfig, { forceRefresh: true });
            return await execute(tokenInfo.accessToken);
        }

        if (err.status === 401) {
            const msg = 'Google Search Console credentials expired or became invalid. Please reconnect your Google account.';
            await patchGscOAuthState(cleanDomain, {
                gscOAuthAccessToken: '',
                gscConnectionStatus: 'expired',
                gscLastError: msg
            });
            err.code = 'GSC_CONNECTION_EXPIRED';
            err.connectionStatus = 'expired';
            err.message = msg;
            throw err;
        }

        if (err.status === 403) {
            const errMsg = String(err.message || '').toLowerCase();
            if (errMsg.includes('insufficient') || errMsg.includes('scope') || errMsg.includes('invalid_grant')) {
                const msg = 'Google Search Console read-only permission was revoked or is insufficient. Please reconnect your Google account.';
                await patchGscOAuthState(cleanDomain, {
                    gscConnectionStatus: 'revoked',
                    gscLastError: msg
                });
                err.code = 'GSC_PERMISSION_REVOKED';
                err.connectionStatus = 'revoked';
                err.message = msg;
                throw err;
            }
        }

        throw err;
    }
}

async function listSearchConsoleProperties(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    const config = await getProjectConfig(cleanDomain);

    const data = await fetchGscApiJson(
        cleanDomain,
        config,
        'https://www.googleapis.com/webmasters/v3/sites',
        { method: 'GET' },
        10000
    );

    const properties = mapSitesApiEntries(data?.siteEntry || []);
    const currentProp = normalizeGscProperty(config.gscProperty);
    const verifiedCurrent = currentProp
        ? properties.find((p) => p.siteUrl.toLowerCase() === currentProp.toLowerCase() && p.hasAccess)
        : null;

    const saved = await patchGscOAuthState(cleanDomain, {
        gscAvailablePropertiesJson: JSON.stringify(properties),
        gscPropertyVerified: Boolean(verifiedCurrent),
        gscLastError: verifiedCurrent ? '' : (currentProp ? `Connected Google account does not have verified access to ${currentProp}.` : '')
    });

    return {
        properties,
        selectedProperty: saved.gscProperty || '',
        propertyVerified: Boolean(verifiedCurrent),
        accountEmail: saved.gscAccountEmail || '',
        connectionStatus: deriveGscConnectionStatus(saved),
        connectionStatusLabel: GSC_STATUS_LABELS[deriveGscConnectionStatus(saved)] || 'Not Connected',
        settings: sanitizeConfigForClient(saved)
    };
}

async function selectAndVerifySearchConsoleProperty(domain = DEFAULT_DOMAIN, propertyInput = '') {
    const cleanDomain = normalizeDomain(domain);
    const normalizedTarget = normalizeGscProperty(propertyInput);
    if (!normalizedTarget) {
        const err = new Error('Please select a Google Search Console property.');
        err.status = 400;
        throw err;
    }

    const listed = await listSearchConsoleProperties(cleanDomain);
    const match = listed.properties.find(
        (p) => p.siteUrl.toLowerCase() === normalizedTarget.toLowerCase()
    );

    if (!match || !match.hasAccess) {
        const errMsg = `The connected Google account (${listed.accountEmail || 'current account'}) does not have verified access to "${normalizedTarget}" in Google Search Console.`;
        await patchGscOAuthState(cleanDomain, {
            gscPropertyVerified: false,
            gscLastError: errMsg
        });
        const err = new Error(errMsg);
        err.status = 403;
        err.code = 'GSC_PROPERTY_ACCESS_DENIED';
        throw err;
    }

    const saved = await patchGscOAuthState(cleanDomain, {
        gscProperty: match.siteUrl,
        gscPropertyVerified: true,
        gscLastError: ''
    });

    return {
        property: match.siteUrl,
        permissionLevel: match.permissionLevel,
        isDomainProperty: match.isDomainProperty,
        verified: true,
        settings: sanitizeConfigForClient(saved)
    };
}

async function disconnectSearchConsole(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    const config = await getProjectConfig(cleanDomain);
    const tokenToRevoke = decryptSecret(config.gscOAuthRefreshToken) || decryptSecret(config.gscOAuthAccessToken);

    let revokedRemotely = false;
    if (tokenToRevoke) {
        try {
            const params = new URLSearchParams({ token: tokenToRevoke });
            const res = await fetch(`${GOOGLE_OAUTH_REVOKE_ENDPOINT}?${params.toString()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            revokedRemotely = res.ok;
        } catch {
            revokedRemotely = false;
        }
    }

    const saved = await patchGscOAuthState(cleanDomain, {
        gscOAuthAccessToken: '',
        gscOAuthRefreshToken: '',
        gscOAuthTokenExpiry: null,
        gscOAuthScope: '',
        gscAccountEmail: '',
        gscConnectionStatus: 'not_connected',
        gscLastError: '',
        gscConnectedAt: null,
        gscLastSyncedAt: null,
        gscPropertyVerified: false,
        gscAvailablePropertiesJson: '[]'
    });

    await clearGscSnapshots(cleanDomain);

    return {
        disconnected: true,
        revokedRemotely,
        settings: sanitizeConfigForClient(saved)
    };
}

function buildDisconnectedGscResponse({ config, dateRange, status, reason, error = false }) {
    const cleanStatus = status || deriveGscConnectionStatus(config);
    return {
        connected: false,
        error,
        connectionStatus: cleanStatus,
        connectionStatusLabel: GSC_STATUS_LABELS[cleanStatus] || 'Not Connected',
        accountEmail: config.gscAccountEmail || '',
        source: 'Google Search Console',
        property: config.gscProperty || null,
        propertyVerified: Boolean(config.gscPropertyVerified),
        dateRange,
        comparisonAvailable: false,
        reason,
        summary: null,
        timeseries: [],
        topQueries: [],
        topPages: [],
        decliningPages: [],
        countryPerformance: [],
        devicePerformance: [],
        sitemaps: [],
        syncedAt: config.gscLastSyncedAt ? new Date(config.gscLastSyncedAt).toISOString() : null
    };
}

async function fetchSearchConsolePerformance(config, dateRange) {
    const cleanDomain = normalizeDomain(config.domain);
    const status = deriveGscConnectionStatus(config);
    const gscProperty = normalizeGscProperty(config.gscProperty);

    if (status === 'not_connected') {
        return buildDisconnectedGscResponse({
            config,
            dateRange,
            status: 'not_connected',
            reason: 'Google Search Console is not connected. Click "Connect Google Account" in SEO Settings to authorize read-only Search Console access via Google OAuth 2.0.'
        });
    }

    if (status === 'revoked') {
        return buildDisconnectedGscResponse({
            config,
            dateRange,
            status: 'revoked',
            error: true,
            reason: config.gscLastError || 'Google Search Console permission was revoked. Reconnect your Google account in SEO Settings.'
        });
    }

    if (status === 'expired') {
        return buildDisconnectedGscResponse({
            config,
            dateRange,
            status: 'expired',
            error: true,
            reason: config.gscLastError || 'Google Search Console connection expired. Reconnect your Google account in SEO Settings.'
        });
    }

    if (!gscProperty || !config.gscPropertyVerified) {
        return buildDisconnectedGscResponse({
            config,
            dateRange,
            status: 'connected',
            reason: gscProperty
                ? `Search Console property "${gscProperty}" has not been verified for ${config.gscAccountEmail || 'the connected Google account'}. Select and verify a property in SEO Settings.`
                : 'Google account is connected, but no Search Console property is selected yet. Choose your Hangbug property (e.g. sc-domain:hangbug.com) in SEO Settings.'
        });
    }

    try {
        const encodedSite = encodeURIComponent(gscProperty);
        const searchApiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;
        const sitemapsUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`;
        const jsonHeaders = { 'Content-Type': 'application/json' };

        const [
            currDaily,
            prevDaily,
            queryRowsRes,
            currPageRowsRes,
            prevPageRowsRes,
            countryRowsRes,
            deviceRowsRes,
            sitemapsRes
        ] = await Promise.all([
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['date'],
                    rowLimit: 500
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.prevStartDate,
                    endDate: dateRange.prevEndDate,
                    dimensions: ['date'],
                    rowLimit: 500
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['query', 'page'],
                    rowLimit: 100
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['page'],
                    rowLimit: 60
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.prevStartDate,
                    endDate: dateRange.prevEndDate,
                    dimensions: ['page'],
                    rowLimit: 60
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['country'],
                    rowLimit: 50
                })
            }),
            fetchGscApiJson(cleanDomain, config, searchApiUrl, {
                method: 'POST',
                headers: jsonHeaders,
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    dimensions: ['device'],
                    rowLimit: 10
                })
            }),
            fetchGscApiJson(cleanDomain, config, sitemapsUrl, { method: 'GET' }).catch(() => ({ sitemap: [] }))
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

        const countryPerformance = (countryRowsRes.rows || []).map(r => {
            const code = String(r.keys?.[0] || '').toLowerCase();
            return {
                country: code.toUpperCase(),
                countryName: ISO3_COUNTRY_NAMES[code] || code.toUpperCase() || 'Unknown',
                clicks: Number(r.clicks || 0),
                impressions: Number(r.impressions || 0),
                ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
                position: Number((r.position || 0).toFixed(1))
            };
        });

        const rawDevices = (deviceRowsRes.rows || []).map(r => {
            const devCode = String(r.keys?.[0] || '').toUpperCase();
            return {
                device: devCode,
                label: DEVICE_LABELS[devCode] || devCode || 'Other',
                clicks: Number(r.clicks || 0),
                impressions: Number(r.impressions || 0),
                ctr: Number(((r.ctr || 0) * 100).toFixed(2)),
                position: Number((r.position || 0).toFixed(1))
            };
        });
        const totalDeviceClicks = rawDevices.reduce((s, d) => s + d.clicks, 0);
        const totalDeviceImpr = rawDevices.reduce((s, d) => s + d.impressions, 0);
        const devicePerformance = rawDevices.map(d => ({
            ...d,
            clicksSharePct: totalDeviceClicks > 0 ? Number(((d.clicks / totalDeviceClicks) * 100).toFixed(1)) : 0,
            impressionsSharePct: totalDeviceImpr > 0 ? Number(((d.impressions / totalDeviceImpr) * 100).toFixed(1)) : 0
        }));

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

        const syncedAt = new Date().toISOString();
        await patchGscOAuthState(cleanDomain, {
            gscConnectionStatus: 'connected',
            gscLastSyncedAt: new Date(syncedAt),
            gscLastError: ''
        });

        const result = {
            connected: true,
            connectionStatus: 'connected',
            connectionStatusLabel: GSC_STATUS_LABELS.connected,
            accountEmail: config.gscAccountEmail || '',
            source: 'Google Search Console (OAuth 2.0 Verified)',
            property: gscProperty,
            propertyVerified: true,
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
                previousImpressions: prevSeries[idx]?.impressions ?? null,
                previousCtr: prevSeries[idx]?.ctr ?? null,
                previousPosition: prevSeries[idx]?.position ?? null
            })),
            topQueries,
            topPages,
            decliningPages,
            countryPerformance,
            devicePerformance,
            sitemaps,
            syncedAt
        };

        await saveSnapshot(cleanDomain, `gsc_${dateRange.range}`, result, 'Google Search Console API (OAuth 2.0)');
        return result;
    } catch (err) {
        const latest = await getProjectConfig(cleanDomain);
        const latestStatus = err.connectionStatus || deriveGscConnectionStatus(latest);
        if (err.status === 403 && !err.connectionStatus) {
            await patchGscOAuthState(cleanDomain, {
                gscPropertyVerified: false,
                gscLastError: `Google Search Console denied access to ${gscProperty}: ${err.message}`
            });
        }
        return buildDisconnectedGscResponse({
            config: latest,
            dateRange,
            status: latestStatus,
            error: true,
            reason: err.connectionStatus
                ? err.message
                : `Google Search Console API request failed: ${err.message}. Verify your Google account has access to ${gscProperty} in Google Search Console.`
        });
    }
}

async function inspectUrlInSearchConsole(config, targetUrl) {
    const cleanDomain = normalizeDomain(config.domain);
    const status = deriveGscConnectionStatus(config);
    const gscProperty = normalizeGscProperty(config.gscProperty);

    if (status !== 'connected' || !gscProperty || !config.gscPropertyVerified) {
        return {
            gscConnected: false,
            connectionStatus: status,
            reason: 'Google Search Console API is not connected; showing live Hangbug crawlability inspection only.'
        };
    }

    try {
        const data = await fetchGscApiJson(
            cleanDomain,
            config,
            'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inspectionUrl: targetUrl,
                    siteUrl: gscProperty,
                    languageCode: 'en-US'
                })
            },
            12000
        );

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
            gscConnected: false,
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
            reason: `GA4 tracking tag (${measurementId}) is active on Hangbug. Configure GA4_PROPERTY_ID and server-side GA4 reporting credentials to enable GA4 Data API charts.`,
            summary: null,
            topLandingPages: [],
            dailyTraffic: [],
            syncedAt: null
        };
    }

    try {
        const token = await getGa4AccessToken(config, ['https://www.googleapis.com/auth/analytics.readonly']);
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
            reason: `GA4 Data API request failed: ${err.message}. Ensure reporting credentials have Viewer access to GA4 Property ${propertyId}.`,
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
    const cleanDomain = normalizeDomain(domain);
    const config = await getProjectConfig(cleanDomain);
    const dateRange = resolveDateRange('7d');

    if (target === 'gsc') {
        const status = deriveGscConnectionStatus(config);
        if (status === 'not_connected') {
            return {
                ok: false,
                status: 'not_connected',
                statusLabel: GSC_STATUS_LABELS.not_connected,
                provider: 'Google Search Console',
                message: 'Google Search Console is not connected. Click "Connect Google Account" to authorize access via OAuth 2.0.'
            };
        }

        try {
            const propsInfo = await listSearchConsoleProperties(cleanDomain);
            if (!propsInfo.selectedProperty || !propsInfo.propertyVerified) {
                return {
                    ok: false,
                    status: propsInfo.connectionStatus,
                    statusLabel: propsInfo.connectionStatusLabel,
                    provider: 'Google Search Console',
                    accountEmail: propsInfo.accountEmail,
                    message: propsInfo.properties.length > 0
                        ? `Google account (${propsInfo.accountEmail || 'connected'}) is authorized with ${propsInfo.properties.length} property(ies), but no verified Hangbug property is selected yet. Choose one from the dropdown.`
                        : `Google account (${propsInfo.accountEmail || 'connected'}) has no Search Console properties available.`
                };
            }

            const freshConfig = await getProjectConfig(cleanDomain);
            const res = await fetchSearchConsolePerformance(freshConfig, dateRange);
            return {
                ok: Boolean(res.connected),
                status: res.connectionStatus,
                statusLabel: res.connectionStatusLabel,
                provider: 'Google Search Console',
                accountEmail: res.accountEmail,
                property: res.property,
                message: res.connected
                    ? `Connected as ${res.accountEmail || 'Google account'} to ${res.property}. Retrieved ${res.summary?.totalClicks ?? 0} clicks, ${res.topQueries.length} queries, ${res.countryPerformance.length} countries, and ${res.sitemaps.length} sitemap(s).`
                    : res.reason
            };
        } catch (err) {
            const latest = await getProjectConfig(cleanDomain);
            const latestStatus = err.connectionStatus || deriveGscConnectionStatus(latest);
            return {
                ok: false,
                status: latestStatus,
                statusLabel: GSC_STATUS_LABELS[latestStatus] || 'Not Connected',
                provider: 'Google Search Console',
                message: err.message
            };
        }
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
    GSC_OAUTH_REQUIRED_SCOPE,
    GSC_OAUTH_SCOPES,
    GSC_CALLBACK_PATH,
    GSC_STATUS_LABELS,
    normalizeDomain,
    buildSiteUrl,
    normalizeGscProperty,
    encryptSecret,
    decryptSecret,
    getGoogleOAuthConfig,
    createGscOAuthState,
    verifyGscOAuthState,
    buildGscOAuthAuthorizationUrl,
    exchangeGscOAuthCode,
    getValidGscOAuthToken,
    listSearchConsoleProperties,
    selectAndVerifySearchConsoleProperty,
    disconnectSearchConsole,
    clearDomainMemoryState,
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
