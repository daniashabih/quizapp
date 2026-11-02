/**
 * Google Analytics 4 (GA4) Tracking Utility for HangBug
 * Website: https://www.hangbug.com
 * Measurement ID: G-BSZBBFZZH0
 * Stream ID: 16254821680
 *
 * Privacy & Security Notice:
 * - Never track passwords, authentication tokens, personal emails, or sensitive user data.
 * - Deduplication is enforced to prevent double-counting.
 */

export const GA_MEASUREMENT_ID = 'G-BSZBBFZZH0';
export const GA_STREAM_ID = '16254821680';

// In browser environments, initialize lastTrackedPath to the initial URL.
// The initial page view is automatically recorded by the static gtag('config') snippet in index.html,
// so initializing lastTrackedPath ensures the initial route is not double-counted when React mounts.
let lastTrackedPath = typeof window !== 'undefined'
    ? (window.location.pathname + window.location.search)
    : null;

/**
 * Low-level event dispatcher to window.gtag / dataLayer
 * Fails safely if gtag is blocked by ad-blockers or when running outside browser
 */
export function trackEvent(eventName, params = {}) {
    if (typeof window === 'undefined') return;

    try {
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, params);
        } else if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
                event: eventName,
                ...params
            });
        }
    } catch (err) {
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
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

    trackEvent('page_view', {
        page_path: cleanPath,
        page_location: window.location.href,
        page_title: title || document.title || 'HangBug'
    });
}

/**
 * Track User Sign-ups
 * Only records method ('email', 'google', etc.) - NO passwords, tokens, or PII
 */
export function trackSignUp(method = 'email') {
    trackEvent('sign_up', {
        method: String(method || 'email')
    });
}

/**
 * Track User Logins
 * Only records method ('email', 'google', 'guest') - NO passwords, tokens, or PII
 */
export function trackLogin(method = 'email') {
    trackEvent('login', {
        method: String(method || 'email')
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
export function trackGameStart({ slug, name, category } = {}) {
    trackEvent('game_start', {
        game_slug: String(slug || 'unknown'),
        game_name: String(name || slug || 'Unknown Game'),
        game_category: String(category || 'Educational')
    });
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
