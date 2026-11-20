/**
 * Hangbug Centralized Global Dialog Service
 * Promise-based modal dialog state manager replacing all native browser
 * alert(), confirm(), and prompt() dialogs across Hangbug.
 *
 * Supports:
 * - success, error, warning, info, delete, prompt
 * - Sequential queueing without dropped promises
 * - Built-in async loading states & duplicate-submission prevention
 * - Error retention (keeps confirmation dialog open with inline error on failure)
 * - Clean dismissal & memory-safe timer cleanup
 */

const EXIT_ANIMATION_MS = 180;

const VALID_TYPES = new Set(['success', 'error', 'warning', 'info', 'delete', 'prompt']);

const DEFAULT_TITLES = {
    success: 'Success',
    error: 'Something went wrong',
    warning: 'Please confirm',
    info: 'Information',
    delete: 'Confirm Deletion',
    prompt: 'Enter details',
};

const DEFAULT_CONFIRM_TEXT = {
    success: 'OK',
    error: 'OK',
    warning: 'Continue',
    info: 'OK',
    delete: 'Delete',
    prompt: 'Submit',
};

const DEFAULT_LOADING_TEXT = {
    success: 'Working...',
    error: 'Retrying...',
    warning: 'Processing...',
    info: 'Processing...',
    delete: 'Deleting...',
    prompt: 'Submitting...',
};

const DEFAULT_SHOW_CANCEL = {
    success: false,
    error: false,
    warning: true,
    info: false,
    delete: true,
    prompt: true,
};

let activeDialog = null;
const dialogQueue = [];
const listeners = new Set();
let exitTimerId = null;
let idCounter = 0;

function getSnapshot() {
    return activeDialog ? { ...activeDialog } : null;
}

function emitChange() {
    const snapshot = getSnapshot();
    listeners.forEach((listener) => {
        try {
            listener(snapshot);
        } catch (err) {
            console.error('[HangbugDialogService] Listener error:', err);
        }
    });
}

function clearExitTimer() {
    if (exitTimerId) {
        clearTimeout(exitTimerId);
        exitTimerId = null;
    }
}

function normalizeOptions(type, input) {
    const resolvedType = VALID_TYPES.has(type) ? type : 'info';
    const raw = typeof input === 'string'
        ? { message: input }
        : (input && typeof input === 'object' ? input : {});

    const title = raw.title ? String(raw.title).trim() : DEFAULT_TITLES[resolvedType];
    const message = raw.message !== undefined
        ? String(raw.message)
        : (raw.description !== undefined ? String(raw.description) : '');

    const permanent = raw.permanent !== undefined
        ? Boolean(raw.permanent)
        : resolvedType === 'delete';

    const permanentNotice = raw.permanentNotice !== undefined
        ? String(raw.permanentNotice)
        : (resolvedType === 'delete'
            ? (permanent
                ? 'This action is permanent and cannot be undone.'
                : 'This item will be removed from cache and can be regenerated later.')
            : '');

    const showCancel = raw.showCancel !== undefined
        ? Boolean(raw.showCancel)
        : DEFAULT_SHOW_CANCEL[resolvedType];

    const confirmVariant = raw.confirmVariant || (
        resolvedType === 'delete' || resolvedType === 'error'
            ? 'danger'
            : resolvedType === 'warning'
                ? 'warning'
                : resolvedType === 'info'
                    ? 'info'
                    : 'primary'
    );

    const fields = Array.isArray(raw.fields) && raw.fields.length > 0
        ? raw.fields.map((field, idx) => ({
            name: field.name || `field_${idx}`,
            label: field.label || '',
            type: field.type || 'text',
            placeholder: field.placeholder || '',
            defaultValue: field.defaultValue !== undefined && field.defaultValue !== null
                ? String(field.defaultValue)
                : '',
            required: Boolean(field.required),
            minLength: typeof field.minLength === 'number' ? field.minLength : undefined,
            maxLength: typeof field.maxLength === 'number' ? field.maxLength : undefined,
            pattern: field.pattern || undefined,
            patternMessage: field.patternMessage || undefined,
            validate: typeof field.validate === 'function' ? field.validate : null,
            rows: field.rows || 3,
        }))
        : null;

    return {
        id: `hb-dialog-${++idCounter}-${Date.now()}`,
        type: resolvedType,
        title,
        message,
        itemName: raw.itemName ? String(raw.itemName) : '',
        permanent,
        permanentNotice,
        confirmText: raw.confirmText || DEFAULT_CONFIRM_TEXT[resolvedType],
        cancelText: raw.cancelText || 'Cancel',
        loadingText: raw.loadingText || DEFAULT_LOADING_TEXT[resolvedType],
        showCancel,
        confirmVariant,
        confirmPhrase: raw.confirmPhrase ? String(raw.confirmPhrase) : '',
        confirmPhraseLabel: raw.confirmPhraseLabel ? String(raw.confirmPhraseLabel) : '',
        closeOnBackdrop: raw.closeOnBackdrop !== false,
        closeOnEscape: raw.closeOnEscape !== false,
        // Single-input prompt configuration
        inputLabel: raw.inputLabel || raw.label || '',
        inputType: raw.inputType || 'text',
        placeholder: raw.placeholder || '',
        defaultValue: raw.defaultValue !== undefined && raw.defaultValue !== null
            ? String(raw.defaultValue)
            : '',
        required: raw.required !== undefined ? Boolean(raw.required) : resolvedType === 'prompt',
        minLength: typeof raw.minLength === 'number' ? raw.minLength : undefined,
        maxLength: typeof raw.maxLength === 'number' ? raw.maxLength : undefined,
        validate: typeof raw.validate === 'function' ? raw.validate : null,
        fields,
        onConfirm: typeof raw.onConfirm === 'function'
            ? raw.onConfirm
            : (typeof raw.onSubmit === 'function' ? raw.onSubmit : null),
        isLoading: false,
        error: null,
        exiting: false,
    };
}

function pumpQueue() {
    if (activeDialog || dialogQueue.length === 0) return;
    activeDialog = dialogQueue.shift();
    emitChange();
}

function finalizeActive(resultValue) {
    if (!activeDialog || activeDialog.exiting) return;

    const current = activeDialog;
    activeDialog = { ...current, exiting: true, isLoading: false };
    emitChange();

    clearExitTimer();
    const resolveDialog = () => {
        const resolver = current._resolve;
        if (activeDialog && activeDialog.id === current.id) {
            activeDialog = null;
        }
        emitChange();
        if (typeof resolver === 'function') {
            resolver(resultValue);
        }
        pumpQueue();
    };

    // In headless/test environments without DOM animations, resolve immediately when EXIT_ANIMATION_MS is bypassed
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        resolveDialog();
    } else {
        exitTimerId = setTimeout(resolveDialog, EXIT_ANIMATION_MS);
    }
}

export function openDialog(type, options = {}) {
    return new Promise((resolve) => {
        const entry = {
            ...normalizeOptions(type, options),
            _resolve: resolve,
        };

        if (!activeDialog) {
            activeDialog = entry;
            emitChange();
        } else {
            dialogQueue.push(entry);
        }
    });
}

export async function confirmActiveDialog(value) {
    if (!activeDialog || activeDialog.isLoading || activeDialog.exiting) {
        return;
    }

    const current = activeDialog;
    const isPrompt = current.type === 'prompt';
    const resolvedPayload = isPrompt ? value : true;

    if (typeof current.onConfirm === 'function') {
        activeDialog = { ...current, isLoading: true, error: null };
        emitChange();

        try {
            await current.onConfirm(value);
            // Only finalize if this dialog is still the active one
            if (activeDialog && activeDialog.id === current.id) {
                finalizeActive(resolvedPayload);
            }
        } catch (err) {
            const errMessage =
                err?.response?.data?.message ||
                err?.message ||
                'Operation failed. Please try again.';

            if (activeDialog && activeDialog.id === current.id) {
                activeDialog = {
                    ...activeDialog,
                    isLoading: false,
                    error: String(errMessage),
                };
                emitChange();
            }
        }
        return;
    }

    finalizeActive(resolvedPayload);
}

export function cancelActiveDialog() {
    if (!activeDialog || activeDialog.isLoading || activeDialog.exiting) {
        return;
    }
    const cancelResult = activeDialog.type === 'prompt' ? null : false;
    finalizeActive(cancelResult);
}

export function clearActiveDialogError() {
    if (!activeDialog || !activeDialog.error) return;
    activeDialog = { ...activeDialog, error: null };
    emitChange();
}

export function closeAllDialogs() {
    clearExitTimer();

    const toCancel = [];
    if (activeDialog) {
        toCancel.push(activeDialog);
        activeDialog = null;
    }
    while (dialogQueue.length > 0) {
        toCancel.push(dialogQueue.shift());
    }

    emitChange();

    for (const item of toCancel) {
        if (typeof item._resolve === 'function') {
            item._resolve(item.type === 'prompt' ? null : false);
        }
    }
}

export function subscribeDialog(listener) {
    listeners.add(listener);
    listener(getSnapshot());
    return () => {
        listeners.delete(listener);
    };
}

export function getActiveDialogSnapshot() {
    return getSnapshot();
}

export const dialog = {
    success: (options) => openDialog('success', options),
    error: (options) => openDialog('error', options),
    warning: (options) => openDialog('warning', options),
    info: (options) => openDialog('info', options),
    alert: (options) => {
        const opts = typeof options === 'string' ? { message: options } : (options || {});
        return openDialog(opts.type || 'info', { ...opts, showCancel: false });
    },
    confirm: (options) => {
        const opts = typeof options === 'string' ? { message: options } : (options || {});
        return openDialog(opts.type || 'warning', { showCancel: true, ...opts });
    },
    confirmDelete: (options) => {
        const opts = typeof options === 'string' ? { message: options } : (options || {});
        return openDialog('delete', { showCancel: true, ...opts });
    },
    prompt: (options) => {
        const opts = typeof options === 'string' ? { message: options } : (options || {});
        return openDialog('prompt', { showCancel: true, ...opts });
    },
    confirmActive: confirmActiveDialog,
    cancelActive: cancelActiveDialog,
    clearError: clearActiveDialogError,
    closeAll: closeAllDialogs,
    subscribe: subscribeDialog,
    getSnapshot: getActiveDialogSnapshot,
};

export default dialog;
