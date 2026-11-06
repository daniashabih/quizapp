/**
 * Google Analytics 4 (GA4) & Organic SEO Tracking Utility for HangBug
 * Website: https://www.hangbug.com
 * Measurement ID: G-BSZBBFZZH0
 * Stream ID: 16254821680
 *
 * Privacy & Security Notice:
 * - Never track passwords, authentication tokens, personal emails, or sensitive user data.
 * - Automatic PII sanitization strips sensitive keys and redacts email/token patterns.
 * - Deduplication is enforced to prevent double-counting of tags and route views.
 */

export const GA_MEASUREMENT_ID = 'G-BSZBBFZZH0';
export const GA_STREAM_ID = '16254821680';

const TELEMETRY_STORAGE_KEY = 'hangbug_seo_telemetry_v1';
const SESSION_ATTRIBUTION_KEY = 'hangbug_session_attribution_v1';

/**
 * Sensitive parameter key patterns that must NEVER be sent to Google Analytics 4
 */
const SENSITIVE_KEY_REGEX = /^(password|pass|passwd|pwd|confirm_password|email|user_email|mail|token|access_token|refresh_token|id_token|reset_token|auth_token|credential|secret|api_key|apikey|authorization|cookie|ssn|phone|phone_number|credit_card)$/i;

/**
 * Patterns for redacting accidental email addresses or JWT tokens in parameter values
 */
const EMAIL_VALUE_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const JWT_VALUE_REGEX = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

/**
 * Meaningful GA4 Conversion (Key) Events Configuration for HangBug SEO & Growth
 */
export const GA4_CONVERSION_EVENTS = [
    {
        eventName: 'sign_up',
        label: 'User Sign-Up',
        tier: 'macro',
        category: 'Acquisition',
        markAsKeyEventInGA4: true,
        description: 'New developer account registration via Email or Google OAuth.',
        parameters: ['method']
    },
    {
        eventName: 'quiz_complete',
        label: 'Quiz Assessment Completed',
        tier: 'macro',
        category: 'Assessment Funnel',
        markAsKeyEventInGA4: true,
        description: 'Developer completed a technical quiz session with score and pass status.',
        parameters: ['quiz_category', 'quiz_session', 'score', 'total_questions', 'percentage', 'passed', 'duration_seconds']
    },
    {
        eventName: 'certificate_generation',
        label: 'Skill Certificate Generated',
        tier: 'macro',
        category: 'Certification',
        markAsKeyEventInGA4: true,
        description: 'Verified developer certificate unlocked after passing an assessment.',
        parameters: ['certificate_category', 'percentage', 'certificate_id']
    },
    {
        eventName: 'certificate_download',
        label: 'Certificate Downloaded',
        tier: 'macro',
        category: 'Certification',
        markAsKeyEventInGA4: true,
        description: 'Developer downloaded their verified skill certificate PDF.',
        parameters: ['certificate_category', 'certificate_id']
    },
    {
        eventName: 'game_complete',
        label: 'Coding/Typing Game Completed',
        tier: 'macro',
        category: 'Interactive Games',
        markAsKeyEventInGA4: true,
        description: 'Completed an interactive coding puzzle or developer typing challenge.',
        parameters: ['game_slug', 'game_name', 'score', 'duration_seconds', 'wpm', 'accuracy']
    },
    {
        eventName: 'technology_page_visit',
        label: 'Technology Page Visit',
        tier: 'micro',
        category: 'SEO Exploration',
        markAsKeyEventInGA4: true,
        description: 'Visited the technology quiz catalog or selected a specific technology track.',
        parameters: ['technology_name', 'page_path', 'interaction_type', 'source', 'question_count']
    },
    {
        eventName: 'quiz_start',
        label: 'Quiz Session Started',
        tier: 'micro',
        category: 'Assessment Funnel',
        markAsKeyEventInGA4: true,
        description: 'Initiated or resumed a technology quiz session.',
        parameters: ['quiz_category', 'quiz_session', 'total_questions']
    },
    {
        eventName: 'game_start',
        label: 'Coding/Typing Game Started',
        tier: 'micro',
        category: 'Interactive Games',
        markAsKeyEventInGA4: false,
        description: 'Started an interactive browser coding or typing game.',
        parameters: ['game_slug', 'game_name', 'game_category']
    },
    {
        eventName: 'login',
        label: 'User Login',
        tier: 'micro',
        category: 'Retention',
        markAsKeyEventInGA4: false,
        description: 'Returning user authenticated into HangBug.',
        parameters: ['method']
    }
];

const CONVERSION_EVENT_SET = new Set(GA4_CONVERSION_EVENTS.map(e => e.eventName));

export function isConversionEvent(eventName) {
    return CONVERSION_EVENT_SET.has(eventName);
}

/**
 * Sanitize event parameters to guarantee no passwords, emails, tokens, or PII are sent to GA4
 */
export function sanitizeAnalyticsParams(params = {}) {
    if (!params || typeof params !== 'object') return {};

    const clean = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (SENSITIVE_KEY_REGEX.test(key)) continue;

        if (typeof value === 'string') {
            if (EMAIL_VALUE_REGEX.test(value) || JWT_VALUE_REGEX.test(value)) {
                continue;
            }
            clean[key] = value;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            clean[key] = value;
        } else if (Array.isArray(value)) {
            clean[key] = value.filter(v => typeof v !== 'string' || (!EMAIL_VALUE_REGEX.test(v) && !JWT_VALUE_REGEX.test(v)));
        }
    }
    return clean;
}

/**
 * Runtime safeguard to prevent duplicate Google Tag (gtag.js) script injections
 */
export function ensureSingleGoogleTag() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') {
        return { duplicateRemoved: false, activeTagCount: 1 };
    }

    const scripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    let duplicateRemoved = false;
    if (scripts.length > 1) {
        for (let i = 1; i < scripts.length; i++) {
            scripts[i].parentNode?.removeChild(scripts[i]);
            duplicateRemoved = true;
        }
    }
    return {
        duplicateRemoved,
        activeTagCount: scripts.length > 0 ? 1 : 0
    };
}

/**
 * Detect organic search vs direct/referral/social/paid traffic source
 */
export function detectTrafficSource(customReferrer, customSearch) {
    const rawSearch = customSearch !== undefined
        ? customSearch
        : (typeof window !== 'undefined' && window.location?.search ? window.location.search : '');
    const rawReferrer = customReferrer !== undefined
        ? customReferrer
        : (typeof document !== 'undefined' && document.referrer ? document.referrer : '');

    let utmSource = '';
    let utmMedium = '';
    let utmCampaign = '';
    let gclid = '';
    let srsltid = '';

    try {
        const params = new URLSearchParams(rawSearch || '');
        utmSource = (params.get('utm_source') || '').toLowerCase().trim();
        utmMedium = (params.get('utm_medium') || '').toLowerCase().trim();
        utmCampaign = (params.get('utm_campaign') || '').trim();
        gclid = (params.get('gclid') || '').trim();
        srsltid = (params.get('srsltid') || '').trim();
    } catch {
        // Ignore malformed search strings
    }

    let referrerHost = '';
    if (rawReferrer) {
        try {
            referrerHost = new URL(rawReferrer).hostname.toLowerCase();
        } catch {
            referrerHost = String(rawReferrer).toLowerCase();
        }
    }

    // Ignore internal self-referrals
    const isInternalReferrer = referrerHost.includes('hangbug.com') || referrerHost.includes('localhost') || referrerHost.includes('127.0.0.1');
    if (isInternalReferrer) {
        referrerHost = '';
    }

    const searchEngines = [
        { pattern: /google\./i, name: 'Google', source: 'google' },
        { pattern: /bing\.com/i, name: 'Bing', source: 'bing' },
        { pattern: /duckduckgo\.com/i, name: 'DuckDuckGo', source: 'duckduckgo' },
        { pattern: /yahoo\.com/i, name: 'Yahoo', source: 'yahoo' },
        { pattern: /ecosia\.org/i, name: 'Ecosia', source: 'ecosia' },
        { pattern: /search\.brave\.com/i, name: 'Brave Search', source: 'brave' },
        { pattern: /baidu\.com/i, name: 'Baidu', source: 'baidu' },
        { pattern: /yandex\./i, name: 'Yandex', source: 'yandex' }
    ];

    const matchedEngine = searchEngines.find(
        se => se.pattern.test(referrerHost) || se.source === utmSource
    );

    if (gclid || utmMedium === 'cpc' || utmMedium === 'ppc' || utmMedium === 'paid') {
        return {
            channel: 'Paid Search',
            source: utmSource || matchedEngine?.source || 'google',
            medium: utmMedium || 'cpc',
            searchEngine: matchedEngine?.name || 'Google',
            campaign: utmCampaign || '(not set)',
            isOrganic: false
        };
    }

    if (utmMedium === 'organic' || srsltid || matchedEngine) {
        return {
            channel: 'Organic Search',
            source: utmSource || matchedEngine?.source || 'google',
            medium: 'organic',
            searchEngine: matchedEngine?.name || (utmSource ? utmSource.charAt(0).toUpperCase() + utmSource.slice(1) : 'Google'),
            campaign: utmCampaign || '(organic)',
            isOrganic: true
        };
    }

    const socialHosts = ['linkedin.com', 'twitter.com', 'x.com', 'facebook.com', 'github.com', 'reddit.com', 'youtube.com', 't.co'];
    if (utmMedium === 'social' || socialHosts.some(h => referrerHost.includes(h))) {
        return {
            channel: 'Social',
            source: utmSource || referrerHost.replace(/^www\./, '') || 'social',
            medium: 'social',
            searchEngine: null,
            campaign: utmCampaign || '(not set)',
            isOrganic: false
        };
    }

    if (referrerHost || utmSource) {
        return {
            channel: 'Referral',
            source: utmSource || referrerHost.replace(/^www\./, ''),
            medium: utmMedium || 'referral',
            searchEngine: null,
            campaign: utmCampaign || '(not set)',
            isOrganic: false
        };
    }

    return {
        channel: 'Direct',
        source: '(direct)',
        medium: '(none)',
        searchEngine: null,
        campaign: '(not set)',
        isOrganic: false
    };
}

/**
 * Read or initialize local SEO & GA4 telemetry store (browser-safe)
 */
function readTelemetryStore() {
    const fallback = {
        eventCounts: {},
        conversionCounts: {},
        landingPages: {},
        recentEvents: [],
        lastUpdated: null
    };
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    try {
        const raw = window.localStorage.getItem(TELEMETRY_STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return {
            eventCounts: parsed.eventCounts || {},
            conversionCounts: parsed.conversionCounts || {},
            landingPages: parsed.landingPages || {},
            recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
            lastUpdated: parsed.lastUpdated || null
        };
    } catch {
        return fallback;
    }
}

function writeTelemetryStore(store) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        store.lastUpdated = new Date().toISOString();
        window.localStorage.setItem(TELEMETRY_STORAGE_KEY, JSON.stringify(store));
    } catch {
        // Ignore storage quota or private browsing errors
    }
}

function recordTelemetryEvent(eventName, sanitizedParams) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
        const store = readTelemetryStore();
        store.eventCounts[eventName] = (store.eventCounts[eventName] || 0) + 1;

        if (isConversionEvent(eventName)) {
            store.conversionCounts[eventName] = (store.conversionCounts[eventName] || 0) + 1;

            // Attribute conversion to the session's landing page if present
            const sessionAttr = getSessionAttribution();
            const lp = sessionAttr?.landingPage || window.location?.pathname || '/';
            if (!store.landingPages[lp]) {
                store.landingPages[lp] = {
                    path: lp,
                    title: document?.title || 'HangBug',
                    views: 1,
                    organicVisits: sessionAttr?.isOrganic ? 1 : 0,
                    engagedSessions: 0,
                    totalEngagementSeconds: 0,
                    maxScrollDepth: 0,
                    conversions: 0
                };
            }
            store.landingPages[lp].conversions = (store.landingPages[lp].conversions || 0) + 1;
        }

        store.recentEvents = [
            {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                eventName,
                isConversion: isConversionEvent(eventName),
                params: sanitizedParams,
                timestamp: new Date().toISOString()
            },
            ...store.recentEvents.slice(0, 29)
        ];

        writeTelemetryStore(store);
    } catch {
        // Ignore telemetry persistence errors
    }
}

/**
 * Get or initialize session-level organic landing page attribution
 */
export function getSessionAttribution() {
    if (typeof window === 'undefined') return null;
    try {
        if (window.sessionStorage) {
            const existing = window.sessionStorage.getItem(SESSION_ATTRIBUTION_KEY);
            if (existing) {
                return JSON.parse(existing);
            }
        }
        const traffic = detectTrafficSource();
        const landingPage = window.location?.pathname || '/';
        const attribution = {
            landingPage,
            landingTitle: (typeof document !== 'undefined' && document.title) ? document.title : 'HangBug',
            ...traffic,
            startedAt: new Date().toISOString(),
            engagedTracked: false
        };
        if (window.sessionStorage) {
            window.sessionStorage.setItem(SESSION_ATTRIBUTION_KEY, JSON.stringify(attribution));
        }
        return attribution;
    } catch {
        return null;
    }
}

/**
 * Export snapshot of local GA4 & Organic SEO telemetry for the SEO Dashboard
 */
export function getSeoTelemetrySnapshot() {
    return {
        measurementId: GA_MEASUREMENT_ID,
        streamId: GA_STREAM_ID,
        conversionEvents: GA4_CONVERSION_EVENTS,
        sessionAttribution: getSessionAttribution(),
        ...readTelemetryStore()
    };
}

// In browser environments, initialize lastTrackedPath to the initial URL.
// The initial page view is automatically recorded by the static gtag('config') snippet in index.html,
// so initializing lastTrackedPath ensures the initial route is not double-counted when React mounts.
let lastTrackedPath = typeof window !== 'undefined'
    ? (window.location.pathname + window.location.search)
    : null;

/**
 * Low-level event dispatcher to window.gtag / dataLayer
 * Automatically sanitizes parameters to block PII (passwords, emails, tokens)
 * Fails safely if gtag is blocked by ad-blockers or when running outside browser
 */
export function trackEvent(eventName, params = {}) {
    if (typeof window === 'undefined') return;

    const safeParams = sanitizeAnalyticsParams(params);
    recordTelemetryEvent(eventName, safeParams);

    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, safeParams);
        } else if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
                event: eventName,
                ...safeParams
            });
        }
    } catch (err) {
        if (typeof window !== 'undefined' && window.__HB_DEBUG_GA4__) {
            console.warn(`[GA4] Failed to record event "${eventName}":`, err);
        }
    }
}

/**
 * Track SPA Route Changes / Page Views
 * Skips consecutive duplicate requests for the identical URL
 */
export function trackPageView(path, title) {
    if (typeof window === 'undefined') return;

    const cleanPath = path || (window.location.pathname + window.location.search);
    if (cleanPath === lastTrackedPath) return;

    lastTrackedPath = cleanPath;

    const resolvedTitle = title || (typeof document !== 'undefined' ? document.title : '') || 'HangBug';

    // Record page view in local landing page telemetry
    try {
        if (window.localStorage) {
            const store = readTelemetryStore();
            const baseRoute = cleanPath.split('?')[0] || '/';
            const existing = store.landingPages[baseRoute] || {
                path: baseRoute,
                title: resolvedTitle,
                views: 0,
                organicVisits: 0,
                engagedSessions: 0,
                totalEngagementSeconds: 0,
                maxScrollDepth: 0,
                conversions: 0
            };
            existing.views += 1;
            existing.title = resolvedTitle;
            store.landingPages[baseRoute] = existing;
            writeTelemetryStore(store);
        }
    } catch {
        // Ignore storage errors
    }

    trackEvent('page_view', {
        page_path: cleanPath,
        page_location: window.location.href,
        page_title: resolvedTitle
    });
}

/**
 * Track Organic Landing Page Entry & Attribution
 * Records initial session landing page, search engine source, and organic medium
 */
export function trackOrganicLandingPage(path, title, customReferrer, customSearch) {
    if (typeof window === 'undefined') return null;

    const cleanPath = (path || window.location?.pathname || '/').split('?')[0] || '/';
    const resolvedTitle = title || (typeof document !== 'undefined' ? document.title : '') || 'HangBug';
    const traffic = detectTrafficSource(customReferrer, customSearch);

    try {
        if (window.localStorage) {
            const store = readTelemetryStore();
            const existing = store.landingPages[cleanPath] || {
                path: cleanPath,
                title: resolvedTitle,
                views: 0,
                organicVisits: 0,
                engagedSessions: 0,
                totalEngagementSeconds: 0,
                maxScrollDepth: 0,
                conversions: 0
            };
            existing.views += 1;
            if (traffic.isOrganic) {
                existing.organicVisits += 1;
            }
            existing.title = resolvedTitle;
            store.landingPages[cleanPath] = existing;
            writeTelemetryStore(store);
        }
    } catch {
        // Ignore storage errors
    }

    const payload = {
        landing_page: cleanPath,
        page_title: resolvedTitle,
        traffic_channel: traffic.channel,
        traffic_source: traffic.source,
        traffic_medium: traffic.medium,
        search_engine: traffic.searchEngine || 'none',
        is_organic: Boolean(traffic.isOrganic)
    };

    trackEvent('organic_landing_page', payload);
    return payload;
}

/**
 * Track User Engagement on Organic Landing Pages (Scroll Depth, Dwell Time, Interactive Actions)
 */
export function trackUserEngagement({
    engagementType = 'engaged_session',
    pagePath,
    engagementTimeSeconds = 0,
    scrollDepthPercent = 0,
    interactionTarget = ''
} = {}) {
    if (typeof window === 'undefined') return;

    const cleanPath = (pagePath || window.location?.pathname || '/').split('?')[0] || '/';
    const timeSec = Math.max(0, Math.round(Number(engagementTimeSeconds) || 0));
    const scrollPct = Math.min(100, Math.max(0, Math.round(Number(scrollDepthPercent) || 0)));

    try {
        if (window.localStorage) {
            const store = readTelemetryStore();
            const existing = store.landingPages[cleanPath] || {
                path: cleanPath,
                title: (typeof document !== 'undefined' && document.title) ? document.title : 'HangBug',
                views: 1,
                organicVisits: 0,
                engagedSessions: 0,
                totalEngagementSeconds: 0,
                maxScrollDepth: 0,
                conversions: 0
            };
            if (engagementType === 'engaged_session') {
                existing.engagedSessions += 1;
            }
            if (timeSec > 0) {
                existing.totalEngagementSeconds += timeSec;
            }
            if (scrollPct > existing.maxScrollDepth) {
                existing.maxScrollDepth = scrollPct;
            }
            store.landingPages[cleanPath] = existing;
            writeTelemetryStore(store);
        }
    } catch {
        // Ignore storage errors
    }

    const payload = {
        engagement_type: String(engagementType || 'engaged_session'),
        page_path: cleanPath,
        engagement_time_msec: timeSec * 1000,
        scroll_depth_percent: scrollPct
    };

    if (interactionTarget) {
        payload.interaction_target = String(interactionTarget);
    }

    trackEvent('user_engagement', payload);
}

/**
 * Track Technology Page Visits & Track Selections
 */
export function trackTechnologyPageVisit({
    technology = 'All Technologies',
    pagePath = '/technologies',
    interactionType = 'hub_view',
    source = 'public_catalog',
    questionCount = 0,
    sessionCount
} = {}) {
    const payload = {
        technology_name: String(technology || 'All Technologies'),
        page_path: String(pagePath || '/technologies'),
        interaction_type: String(interactionType || 'hub_view'),
        source: String(source || 'public_catalog'),
        question_count: Number(questionCount) || 0
    };

    if (sessionCount !== undefined) {
        payload.session_count = Number(sessionCount) || 0;
    }

    trackEvent('technology_page_visit', payload);
}

/**
 * Track User Sign-ups
 * Only records method ('email', 'google', etc.) - NO passwords, tokens, or PII
 */
export function trackSignUp(method = 'email') {
    const safeMethod = typeof method === 'object' && method !== null
        ? String(method.method || 'email')
        : String(method || 'email');

    trackEvent('sign_up', {
        method: safeMethod
    });
}

/**
 * Track User Logins
 * Only records method ('email', 'google', 'guest') - NO passwords, tokens, or PII
 */
export function trackLogin(method = 'email') {
    const safeMethod = typeof method === 'object' && method !== null
        ? String(method.method || 'email')
        : String(method || 'email');

    trackEvent('login', {
        method: safeMethod
    });
}

/**
 * Track Quiz Starts
 */
export function trackQuizStart({ category, session, totalQuestions } = {}) {
    trackEvent('quiz_start', {
        quiz_category: String(category || 'General'),
        quiz_session: session !== undefined ? String(session) : '1',
        total_questions: Number(totalQuestions) || 0
    });
}

/**
 * Track Quiz Completions
 */
export function trackQuizCompletion({ category, session, score, totalQuestions, percentage, passed, timeTaken } = {}) {
    trackEvent('quiz_complete', {
        quiz_category: String(category || 'General'),
        quiz_session: session !== undefined ? String(session) : '1',
        score: Number(score) || 0,
        total_questions: Number(totalQuestions) || 0,
        percentage: Number(percentage) || 0,
        passed: Boolean(passed),
        duration_seconds: Number(timeTaken) || 0
    });
}

/**
 * Track Certificate Generation & Downloads
 */
export function trackCertificateGeneration({ category, percentage, certificateId } = {}) {
    const payload = {
        certificate_category: String(category || 'General'),
        percentage: Number(percentage) || 0
    };
    if (certificateId) {
        payload.certificate_id = String(certificateId);
    }
    trackEvent('certificate_generation', {
        ...payload
    });
}

export function trackCertificateDownload({ category, certificateId } = {}) {
    const payload = {
        certificate_category: String(category || 'General')
    };
    if (certificateId) {
        payload.certificate_id = String(certificateId);
    }
    trackEvent('certificate_download', {
        ...payload
    });
}

/**
 * Track Games Started & Completed
 */
export function trackGameStart({ slug, name, category, technology, difficulty } = {}) {
    const payload = {
        game_slug: String(slug || 'unknown'),
        game_name: String(name || slug || 'Unknown Game'),
        game_category: String(category || 'Educational')
    };
    if (technology) {
        payload.game_technology = String(technology);
    }
    if (difficulty) {
        payload.game_difficulty = String(difficulty);
    }
    trackEvent('game_start', payload);
}

export function trackGameComplete({ slug, name, score, durationSeconds, wpm, accuracy } = {}) {
    trackEvent('game_complete', {
        game_slug: String(slug || 'unknown'),
        game_name: String(name || slug || 'Unknown Game'),
        score: Number(score) || 0,
        duration_seconds: Number(durationSeconds) || 0,
        wpm: Number(wpm) || 0,
        accuracy: Number(accuracy) || 0
    });
}
