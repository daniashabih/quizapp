/**
 * Hangbug Centralized Notification Service
 * Premium SaaS floating notification state manager with deduplication,
 * smooth exit transitions, pause-on-hover timers, and loading-to-result morphing.
 */

const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 240;
const LOADING_FAILSAFE_MS = 20000;

const DEFAULT_DURATIONS = {
    success: 3600,
    info: 3600,
    warning: 4200,
    error: 4600,
    loading: 0
};

const DEFAULT_TITLES = {
    success: 'Success',
    error: 'Something went wrong',
    warning: 'Attention needed',
    info: 'Update',
    loading: 'Processing...'
};

let notifications = [];
const listeners = new Set();
const timers = new Map();
let idCounter = 0;

function emitChange() {
    const snapshot = [...notifications];
    listeners.forEach((listener) => {
        try {
            listener(snapshot);
        } catch (err) {
            console.error('[HangbugNotificationService] Listener error:', err);
        }
    });
}

/**
 * Contextual smart title inference when a single message string is provided.
 */
function inferStructuredContent(type, rawMessage) {
    const text = String(rawMessage || '').trim();
    if (!text) {
        return {
            title: DEFAULT_TITLES[type] || 'Notification',
            description: ''
        };
    }

    // Check if the message naturally splits into a short headline + follow-up sentence
    // e.g. "Your progress has been saved! You can continue your quiz anytime."
    const sentenceMatch = text.match(/^([^.!?:]+[.!])\s+(.+)$/);
    if (sentenceMatch) {
        const firstPart = sentenceMatch[1].trim();
        const restPart = sentenceMatch[2].trim();
        if (firstPart.length >= 6 && firstPart.length <= 44 && restPart.length >= 6) {
            return {
                title: firstPart,
                description: restPart
            };
        }
    }

    const lower = text.toLowerCase();

    if (type === 'success') {
        if (lower.includes('welcome') || lower.includes('signed in') || lower.includes('logged in')) {
            return { title: "You're all set!", description: text };
        }
        if (lower.includes('account created') || lower.includes('registered')) {
            return { title: 'Welcome to Hangbug!', description: text };
        }
        if (lower.includes('copied')) {
            return { title: 'Copied to clipboard', description: text };
        }
        if (lower.includes('saved') || lower.includes('updated')) {
            return { title: 'Changes saved', description: text };
        }
        if (lower.includes('created') || lower.includes('generated')) {
            return { title: 'Created successfully', description: text };
        }
        if (lower.includes('deleted') || lower.includes('removed') || lower.includes('discarded')) {
            return { title: 'Removed', description: text };
        }
        if (lower.includes('reset') || lower.includes('inbox') || lower.includes('email')) {
            return { title: 'Reset link sent', description: text };
        }
        return { title: 'Completed', description: text };
    }

    if (type === 'error') {
        if (lower.includes('invalid') || lower.includes('password') || lower.includes('credential') || lower.includes('sign in') || lower.includes('login')) {
            return { title: 'Sign-in failed', description: text };
        }
        if (lower.includes('expired') || lower.includes('unauthorized')) {
            return { title: 'Session expired', description: text };
        }
        if (lower.includes('required') || lower.includes('valid') || lower.includes('select') || lower.includes('enter') || lower.includes('provide')) {
            return { title: 'Check your input', description: text };
        }
        if (lower.includes('connect') || lower.includes('network') || lower.includes('server')) {
            return { title: 'Connection issue', description: text };
        }
        return { title: 'Something went wrong', description: text };
    }

    if (type === 'warning') {
        if (lower.includes('required') || lower.includes('complete') || lower.includes('fill') || lower.includes('valid') || lower.includes('select')) {
            return { title: 'Action required', description: text };
        }
        if (lower.includes('expired')) {
            return { title: 'Session expired', description: text };
        }
        return { title: 'Please note', description: text };
    }

    if (type === 'info') {
        if (lower.includes('logged out') || lower.includes('signed out')) {
            return { title: 'Signed out', description: text };
        }
        if (lower.includes('saved') || lower.includes('resumed')) {
            return { title: 'Quiz progress', description: text };
        }
        if (lower.includes('discarded')) {
            return { title: 'Attempt discarded', description: text };
        }
        return { title: 'Heads up', description: text };
    }

    if (type === 'loading') {
        return { title: text, description: '' };
    }

    return {
        title: DEFAULT_TITLES[type] || 'Notice',
        description: text
    };
}

/**
 * Normalizes flexible call signatures:
 * - notify.success({ title, description, duration, id })
 * - notify.success('Title', 'Description', { duration, id })
 * - notify.success('Single message string', { duration, id })
 */
function normalizeInput(type, arg1, arg2, arg3) {
    const normalizedType = type === 'warn' ? 'warning' : (DEFAULT_DURATIONS[type] !== undefined ? type : 'info');

    if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
        const opts = arg1;
        const rawTitle = opts.title ? String(opts.title).trim() : '';
        const rawDesc = opts.description !== undefined
            ? String(opts.description).trim()
            : (opts.message ? String(opts.message).trim() : '');

        const structured = rawTitle
            ? { title: rawTitle, description: rawDesc }
            : inferStructuredContent(normalizedType, rawDesc);

        const duration = typeof opts.duration === 'number'
            ? opts.duration
            : (typeof opts.autoClose === 'number' ? opts.autoClose : DEFAULT_DURATIONS[normalizedType]);

        return {
            id: opts.id || opts.toastId || null,
            type: normalizedType,
            title: structured.title,
            description: structured.description,
            duration
        };
    }

    if (typeof arg2 === 'string') {
        const opts = (arg3 && typeof arg3 === 'object') ? arg3 : {};
        const duration = typeof opts.duration === 'number'
            ? opts.duration
            : (typeof opts.autoClose === 'number' ? opts.autoClose : DEFAULT_DURATIONS[normalizedType]);

        return {
            id: opts.id || opts.toastId || null,
            type: normalizedType,
            title: String(arg1 || DEFAULT_TITLES[normalizedType]).trim(),
            description: arg2.trim(),
            duration
        };
    }

    const opts = (arg2 && typeof arg2 === 'object') ? arg2 : {};
    const structured = inferStructuredContent(normalizedType, arg1);
    const duration = typeof opts.duration === 'number'
        ? opts.duration
        : (typeof opts.autoClose === 'number' ? opts.autoClose : DEFAULT_DURATIONS[normalizedType]);

    return {
        id: opts.id || opts.toastId || null,
        type: normalizedType,
        title: opts.title ? String(opts.title).trim() : structured.title,
        description: opts.description !== undefined ? String(opts.description).trim() : structured.description,
        duration
    };
}

function clearTimer(id) {
    const record = timers.get(id);
    if (record) {
        if (record.timeoutId) clearTimeout(record.timeoutId);
        if (record.exitTimeoutId) clearTimeout(record.exitTimeoutId);
        timers.delete(id);
    }
}

function scheduleAutoDismiss(id, durationMs) {
    const existing = timers.get(id) || {};
    if (existing.timeoutId) clearTimeout(existing.timeoutId);

    const effectiveDuration = durationMs > 0
        ? durationMs
        : 0;

    if (effectiveDuration <= 0) {
        // Failsafe for loading toasts so they never hang indefinitely if caller forgets to dismiss
        const failsafeId = setTimeout(() => {
            dismissNotification(id);
        }, LOADING_FAILSAFE_MS);
        timers.set(id, {
            ...existing,
            timeoutId: failsafeId,
            remaining: LOADING_FAILSAFE_MS,
            startedAt: Date.now(),
            isPaused: false
        });
        return;
    }

    const timeoutId = setTimeout(() => {
        dismissNotification(id);
    }, effectiveDuration);

    timers.set(id, {
        ...existing,
        timeoutId,
        remaining: effectiveDuration,
        startedAt: Date.now(),
        isPaused: false
    });
}

export function dismissNotification(id) {
    if (!id) {
        clearAllNotifications();
        return;
    }

    const target = notifications.find((n) => n.id === id);
    if (!target || target.exiting) return;

    const record = timers.get(id);
    if (record?.timeoutId) clearTimeout(record.timeoutId);

    notifications = notifications.map((item) =>
        item.id === id ? { ...item, exiting: true } : item
    );
    emitChange();

    const exitTimeoutId = setTimeout(() => {
        notifications = notifications.filter((item) => item.id !== id);
        clearTimer(id);
        emitChange();
    }, EXIT_ANIMATION_MS);

    timers.set(id, { ...(record || {}), timeoutId: null, exitTimeoutId });
}

export function clearAllNotifications() {
    notifications.forEach((n) => clearTimer(n.id));
    notifications = [];
    emitChange();
}

export function pauseNotificationTimer(id) {
    const record = timers.get(id);
    if (!record || record.isPaused || !record.timeoutId) return;

    clearTimeout(record.timeoutId);
    const elapsed = Date.now() - (record.startedAt || Date.now());
    const remaining = Math.max(800, (record.remaining || 2000) - elapsed);

    timers.set(id, {
        ...record,
        timeoutId: null,
        remaining,
        isPaused: true
    });
}

export function resumeNotificationTimer(id) {
    const record = timers.get(id);
    if (!record || !record.isPaused) return;

    const target = notifications.find((n) => n.id === id);
    if (!target || target.exiting) return;

    scheduleAutoDismiss(id, record.remaining || DEFAULT_DURATIONS[target.type] || 3500);
}

function createFingerprint(payload) {
    if (payload.id) return `id:${payload.id}`;
    return `${payload.type}:${payload.title.toLowerCase()}:${(payload.description || '').toLowerCase()}`;
}

export function showNotification(type, arg1, arg2, arg3) {
    const payload = normalizeInput(type, arg1, arg2, arg3);
    const fingerprint = createFingerprint(payload);

    // Prevent duplicate active notifications: refresh existing toast timer & subtle pulse
    const duplicate = notifications.find(
        (n) => !n.exiting && (n.id === payload.id || n.fingerprint === fingerprint)
    );

    if (duplicate) {
        notifications = notifications.map((n) =>
            n.id === duplicate.id
                ? {
                    ...n,
                    type: payload.type,
                    title: payload.title,
                    description: payload.description,
                    duration: payload.duration,
                    updatedAt: Date.now()
                }
                : n
        );
        scheduleAutoDismiss(duplicate.id, payload.duration);
        emitChange();
        return duplicate.id;
    }

    const id = payload.id || `hb-toast-${++idCounter}-${Date.now()}`;
    const newToast = {
        id,
        fingerprint,
        type: payload.type,
        title: payload.title,
        description: payload.description,
        duration: payload.duration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        exiting: false
    };

    // Add newest on top
    notifications = [newToast, ...notifications];

    // Enforce stack limit cleanly by dismissing oldest non-exiting notification
    const activeList = notifications.filter((n) => !n.exiting);
    if (activeList.length > MAX_VISIBLE_TOASTS) {
        const overflow = activeList.slice(MAX_VISIBLE_TOASTS);
        overflow.forEach((oldToast) => dismissNotification(oldToast.id));
    }

    scheduleAutoDismiss(id, payload.duration);
    emitChange();
    return id;
}

export function updateNotification(id, options = {}) {
    const existing = notifications.find((n) => n.id === id && !n.exiting);
    const nextType = options.type || existing?.type || 'info';
    const normalized = normalizeInput(nextType, options);

    if (!existing) {
        return showNotification(nextType, { ...options, id });
    }

    notifications = notifications.map((n) =>
        n.id === id
            ? {
                ...n,
                type: normalized.type,
                title: normalized.title,
                description: normalized.description,
                duration: normalized.duration,
                fingerprint: createFingerprint({ ...normalized, id }),
                updatedAt: Date.now()
            }
            : n
    );

    scheduleAutoDismiss(id, normalized.duration);
    emitChange();
    return id;
}

export async function promiseNotification(promiseOrFn, messages = {}) {
    const loadingOpts = typeof messages.loading === 'string'
        ? { title: messages.loading }
        : (messages.loading || { title: 'Processing...' });

    const id = showNotification('loading', loadingOpts);

    try {
        const result = typeof promiseOrFn === 'function' ? await promiseOrFn() : await promiseOrFn;
        const successInput = typeof messages.success === 'function'
            ? messages.success(result)
            : (messages.success || { title: 'Completed', description: 'Operation finished successfully.' });
        updateNotification(
            id,
            typeof successInput === 'string'
                ? { type: 'success', description: successInput }
                : { type: 'success', ...successInput }
        );
        return result;
    } catch (error) {
        const errorInput = typeof messages.error === 'function'
            ? messages.error(error)
            : (messages.error || { title: 'Something went wrong', description: error?.message || 'Please try again.' });
        updateNotification(
            id,
            typeof errorInput === 'string'
                ? { type: 'error', description: errorInput }
                : { type: 'error', ...errorInput }
        );
        throw error;
    }
}

export function subscribeNotifications(listener) {
    listeners.add(listener);
    listener([...notifications]);
    return () => {
        listeners.delete(listener);
    };
}

export function getNotificationsSnapshot() {
    return [...notifications];
}

export const notify = {
    success: (arg1, arg2, arg3) => showNotification('success', arg1, arg2, arg3),
    error: (arg1, arg2, arg3) => showNotification('error', arg1, arg2, arg3),
    warning: (arg1, arg2, arg3) => showNotification('warning', arg1, arg2, arg3),
    warn: (arg1, arg2, arg3) => showNotification('warning', arg1, arg2, arg3),
    info: (arg1, arg2, arg3) => showNotification('info', arg1, arg2, arg3),
    loading: (arg1, arg2, arg3) => showNotification('loading', arg1, arg2, arg3),
    update: (id, options) => updateNotification(id, options),
    dismiss: (id) => dismissNotification(id),
    clear: () => clearAllNotifications(),
    promise: (promiseOrFn, messages) => promiseNotification(promiseOrFn, messages),
    getSnapshot: () => getNotificationsSnapshot(),
    subscribe: (listener) => subscribeNotifications(listener)
};

// Alias `toast` for seamless drop-in compatibility across existing modules & tests
export const toast = notify;

export default notify;
