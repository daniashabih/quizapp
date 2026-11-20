import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Trash2,
    PencilLine,
    X,
    AlertCircle,
    ShieldAlert,
} from 'lucide-react';
import {
    subscribeDialog,
    confirmActiveDialog,
    cancelActiveDialog,
    clearActiveDialogError,
} from '../services/dialogService';

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Semantic Icon Badge for Hangbug Global Dialogs
 */
export const DialogTypeIcon = ({ type = 'info' }) => {
    const iconProps = { size: 22, strokeWidth: 2.1, 'aria-hidden': true };

    switch (type) {
        case 'success':
            return (
                <div className="hb-dialog-icon hb-dialog-icon-success" aria-hidden="true">
                    <CheckCircle2 {...iconProps} />
                </div>
            );
        case 'error':
            return (
                <div className="hb-dialog-icon hb-dialog-icon-error" aria-hidden="true">
                    <XCircle {...iconProps} />
                </div>
            );
        case 'warning':
            return (
                <div className="hb-dialog-icon hb-dialog-icon-warning" aria-hidden="true">
                    <AlertTriangle {...iconProps} />
                </div>
            );
        case 'delete':
            return (
                <div className="hb-dialog-icon hb-dialog-icon-delete" aria-hidden="true">
                    <Trash2 {...iconProps} />
                </div>
            );
        case 'prompt':
            return (
                <div className="hb-dialog-icon hb-dialog-icon-prompt" aria-hidden="true">
                    <PencilLine {...iconProps} />
                </div>
            );
        case 'info':
        default:
            return (
                <div className="hb-dialog-icon hb-dialog-icon-info" aria-hidden="true">
                    <Info {...iconProps} />
                </div>
            );
    }
};

const ButtonSpinner = () => (
    <svg
        className="hb-dialog-spinner"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.28"
            strokeWidth="2.8"
        />
        <path
            d="M21 12C21 7.02944 16.9706 3 12 3"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
        />
    </svg>
);

function buildInitialPromptValues(dialogState) {
    if (!dialogState) return {};
    if (Array.isArray(dialogState.fields) && dialogState.fields.length > 0) {
        const map = {};
        dialogState.fields.forEach((f) => {
            map[f.name] = f.defaultValue || '';
        });
        return map;
    }
    return { value: dialogState.defaultValue || '' };
}

/**
 * Active Hangbug Dialog Card — handles focus trap, keyboard navigation,
 * validation, async loading state, and inline error display.
 */
export const HangbugDialogCard = ({ dialogState }) => {
    const cardRef = useRef(null);
    const confirmBtnRef = useRef(null);
    const cancelBtnRef = useRef(null);
    const firstInputRef = useRef(null);
    const previousFocusRef = useRef(null);

    const [values, setValues] = useState(() => buildInitialPromptValues(dialogState));
    const [fieldErrors, setFieldErrors] = useState({});
    const [phraseInput, setPhraseInput] = useState('');

    // Body scroll lock & focus restoration
    useEffect(() => {
        previousFocusRef.current = document.activeElement;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Set smart initial focus after mount
        const focusTimer = window.requestAnimationFrame(() => {
            if (dialogState.type === 'prompt' || dialogState.confirmPhrase) {
                firstInputRef.current?.focus();
            } else if (dialogState.type === 'delete' && dialogState.showCancel) {
                cancelBtnRef.current?.focus();
            } else {
                confirmBtnRef.current?.focus();
            }
        });

        return () => {
            window.cancelAnimationFrame(focusTimer);
            document.body.style.overflow = originalOverflow;
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                try {
                    previousFocusRef.current.focus();
                } catch {
                    // Ignore focus restoration error if original element unmounted
                }
            }
        };
    }, [dialogState.id, dialogState.type, dialogState.showCancel, dialogState.confirmPhrase]);

    const phraseSatisfied = !dialogState.confirmPhrase ||
        phraseInput.trim().toUpperCase() === dialogState.confirmPhrase.trim().toUpperCase();

    const validatePrompt = useCallback(() => {
        if (dialogState.type !== 'prompt') return { valid: true, payload: undefined };

        const errors = {};
        if (Array.isArray(dialogState.fields) && dialogState.fields.length > 0) {
            for (const field of dialogState.fields) {
                const rawVal = values[field.name] ?? '';
                const trimmed = String(rawVal).trim();

                if (field.required && !trimmed) {
                    errors[field.name] = `${field.label || 'This field'} is required.`;
                    continue;
                }
                if (field.minLength !== undefined && trimmed.length > 0 && trimmed.length < field.minLength) {
                    errors[field.name] = `Must be at least ${field.minLength} characters.`;
                    continue;
                }
                if (field.maxLength !== undefined && trimmed.length > field.maxLength) {
                    errors[field.name] = `Must be ${field.maxLength} characters or fewer.`;
                    continue;
                }
                if (field.pattern && trimmed && !new RegExp(field.pattern).test(trimmed)) {
                    errors[field.name] = field.patternMessage || 'Invalid format.';
                    continue;
                }
                if (typeof field.validate === 'function') {
                    const customErr = field.validate(rawVal, values);
                    if (customErr) {
                        errors[field.name] = String(customErr);
                    }
                }
            }

            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
                return { valid: false };
            }
            return { valid: true, payload: { ...values } };
        }

        // Single-input prompt
        const rawVal = values.value ?? '';
        const trimmed = String(rawVal).trim();
        if (dialogState.required && !trimmed) {
            errors.value = `${dialogState.inputLabel || 'Input'} is required.`;
        } else if (dialogState.minLength !== undefined && trimmed.length < dialogState.minLength) {
            errors.value = `Must be at least ${dialogState.minLength} characters.`;
        } else if (dialogState.maxLength !== undefined && trimmed.length > dialogState.maxLength) {
            errors.value = `Must be ${dialogState.maxLength} characters or fewer.`;
        } else if (typeof dialogState.validate === 'function') {
            const customErr = dialogState.validate(rawVal);
            if (customErr) {
                errors.value = String(customErr);
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return { valid: false };
        }
        return { valid: true, payload: rawVal };
    }, [dialogState, values]);

    const handleConfirm = useCallback(() => {
        if (dialogState.isLoading || dialogState.exiting) return;
        if (!phraseSatisfied) return;

        if (dialogState.type === 'prompt') {
            const check = validatePrompt();
            if (!check.valid) return;
            confirmActiveDialog(check.payload);
            return;
        }

        confirmActiveDialog();
    }, [dialogState.isLoading, dialogState.exiting, dialogState.type, phraseSatisfied, validatePrompt]);

    const handleCancel = useCallback(() => {
        if (dialogState.isLoading || dialogState.exiting) return;
        cancelActiveDialog();
    }, [dialogState.isLoading, dialogState.exiting]);

    // Keyboard navigation: Escape, Enter, and Tab focus trapping
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (dialogState.exiting) return;

            if (e.key === 'Escape') {
                if (dialogState.closeOnEscape && !dialogState.isLoading) {
                    e.preventDefault();
                    handleCancel();
                }
                return;
            }

            if (e.key === 'Tab' && cardRef.current) {
                const focusables = Array.from(cardRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
                    .filter((el) => el.offsetParent !== null);
                if (focusables.length === 0) {
                    e.preventDefault();
                    return;
                }
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first || !cardRef.current.contains(document.activeElement)) {
                        e.preventDefault();
                        last.focus();
                    }
                } else if (document.activeElement === last || !cardRef.current.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
                return;
            }

            if (e.key === 'Enter' && !dialogState.isLoading) {
                const activeTag = document.activeElement?.tagName?.toLowerCase();
                if (activeTag === 'textarea') return;
                if (activeTag === 'button') return; // Let native button click handle Enter
                if (dialogState.type === 'delete' && !dialogState.confirmPhrase) return;
                if (dialogState.type === 'prompt' || dialogState.confirmPhrase) {
                    e.preventDefault();
                    handleConfirm();
                } else if (!dialogState.showCancel) {
                    e.preventDefault();
                    handleConfirm();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [dialogState, handleCancel, handleConfirm]);

    const handleBackdropMouseDown = (e) => {
        if (e.target === e.currentTarget && dialogState.closeOnBackdrop && !dialogState.isLoading) {
            handleCancel();
        }
    };

    const handleFieldChange = (name, nextVal) => {
        setValues((prev) => ({ ...prev, [name]: nextVal }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => {
                const copy = { ...prev };
                delete copy[name];
                return copy;
            });
        }
        if (dialogState.error) {
            clearActiveDialogError();
        }
    };

    const isAlertDialog =
        dialogState.type === 'delete' ||
        dialogState.type === 'error' ||
        dialogState.type === 'warning';

    const titleId = `${dialogState.id}-title`;
    const descId = `${dialogState.id}-desc`;

    return (
        <div
            className={`hb-dialog-backdrop no-print ${dialogState.exiting ? 'hb-dialog-exit' : ''}`}
            onMouseDown={handleBackdropMouseDown}
            data-dialog-backdrop="true"
        >
            <div
                ref={cardRef}
                role={isAlertDialog ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={dialogState.message ? descId : undefined}
                tabIndex={-1}
                className={`hb-dialog-card hb-dialog-${dialogState.type}`}
                data-dialog-id={dialogState.id}
                data-dialog-type={dialogState.type}
            >
                <div className="hb-dialog-top-accent" aria-hidden="true" />

                <div className="hb-dialog-body">
                    <div className="hb-dialog-header">
                        <DialogTypeIcon type={dialogState.type} />
                        <div className="hb-dialog-heading-wrap">
                            <h2 id={titleId} className="hb-dialog-title">
                                {dialogState.title}
                            </h2>
                            {dialogState.message && (
                                <p id={descId} className="hb-dialog-message">
                                    {dialogState.message}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="hb-dialog-close"
                            onClick={handleCancel}
                            disabled={dialogState.isLoading}
                            aria-label="Close dialog"
                        >
                            <X size={16} strokeWidth={2.2} />
                        </button>
                    </div>

                    {/* Highlighted target item chip */}
                    {dialogState.itemName && (
                        <div className="hb-dialog-item-pill">
                            <span>{dialogState.itemName}</span>
                        </div>
                    )}

                    {/* Permanent / Destructive Notice */}
                    {dialogState.permanentNotice && (
                        <div
                            className={`hb-dialog-notice ${
                                dialogState.permanent
                                    ? 'hb-dialog-notice-danger'
                                    : 'hb-dialog-notice-info'
                            }`}
                        >
                            {dialogState.permanent ? (
                                <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            ) : (
                                <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            )}
                            <span>{dialogState.permanentNotice}</span>
                        </div>
                    )}

                    {/* Optional Confirmation Phrase Input for High-Risk Deletions */}
                    {dialogState.confirmPhrase && (
                        <div className="hb-dialog-fields">
                            <div>
                                <label
                                    htmlFor={`${dialogState.id}-confirm-phrase`}
                                    className="hb-dialog-field-label"
                                >
                                    {dialogState.confirmPhraseLabel ||
                                        `Type ${dialogState.confirmPhrase} to confirm`}
                                </label>
                                <input
                                    id={`${dialogState.id}-confirm-phrase`}
                                    ref={firstInputRef}
                                    type="text"
                                    value={phraseInput}
                                    disabled={dialogState.isLoading}
                                    onChange={(e) => {
                                        setPhraseInput(e.target.value);
                                        if (dialogState.error) clearActiveDialogError();
                                    }}
                                    placeholder={`Type ${dialogState.confirmPhrase}`}
                                    className="hb-dialog-input"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    )}

                    {/* Prompt Input Field(s) */}
                    {dialogState.type === 'prompt' && (
                        <div className="hb-dialog-fields">
                            {Array.isArray(dialogState.fields) && dialogState.fields.length > 0 ? (
                                dialogState.fields.map((field, index) => {
                                    const fieldId = `${dialogState.id}-${field.name}`;
                                    const hasErr = Boolean(fieldErrors[field.name]);
                                    return (
                                        <div key={field.name}>
                                            {field.label && (
                                                <label htmlFor={fieldId} className="hb-dialog-field-label">
                                                    {field.label}
                                                    {field.required && <span style={{ color: '#DC2626' }}> *</span>}
                                                </label>
                                            )}
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    id={fieldId}
                                                    ref={index === 0 ? firstInputRef : undefined}
                                                    rows={field.rows || 3}
                                                    value={values[field.name] ?? ''}
                                                    disabled={dialogState.isLoading}
                                                    placeholder={field.placeholder}
                                                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                    className={`hb-dialog-input ${hasErr ? 'hb-dialog-input-error' : ''}`}
                                                />
                                            ) : (
                                                <input
                                                    id={fieldId}
                                                    ref={index === 0 ? firstInputRef : undefined}
                                                    type={field.type || 'text'}
                                                    value={values[field.name] ?? ''}
                                                    disabled={dialogState.isLoading}
                                                    placeholder={field.placeholder}
                                                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                                    className={`hb-dialog-input ${hasErr ? 'hb-dialog-input-error' : ''}`}
                                                />
                                            )}
                                            {hasErr && (
                                                <p className="hb-dialog-field-error" role="alert">
                                                    {fieldErrors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div>
                                    {dialogState.inputLabel && (
                                        <label
                                            htmlFor={`${dialogState.id}-input`}
                                            className="hb-dialog-field-label"
                                        >
                                            {dialogState.inputLabel}
                                            {dialogState.required && <span style={{ color: '#DC2626' }}> *</span>}
                                        </label>
                                    )}
                                    {dialogState.inputType === 'textarea' ? (
                                        <textarea
                                            id={`${dialogState.id}-input`}
                                            ref={firstInputRef}
                                            rows={3}
                                            value={values.value ?? ''}
                                            disabled={dialogState.isLoading}
                                            placeholder={dialogState.placeholder}
                                            onChange={(e) => handleFieldChange('value', e.target.value)}
                                            className={`hb-dialog-input ${fieldErrors.value ? 'hb-dialog-input-error' : ''}`}
                                        />
                                    ) : (
                                        <input
                                            id={`${dialogState.id}-input`}
                                            ref={firstInputRef}
                                            type={dialogState.inputType || 'text'}
                                            value={values.value ?? ''}
                                            disabled={dialogState.isLoading}
                                            placeholder={dialogState.placeholder}
                                            onChange={(e) => handleFieldChange('value', e.target.value)}
                                            className={`hb-dialog-input ${fieldErrors.value ? 'hb-dialog-input-error' : ''}`}
                                        />
                                    )}
                                    {fieldErrors.value && (
                                        <p className="hb-dialog-field-error" role="alert">
                                            {fieldErrors.value}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inline API Error Banner (shown when async onConfirm fails) */}
                    {dialogState.error && (
                        <div className="hb-dialog-error-banner" role="alert">
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>{dialogState.error}</span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="hb-dialog-footer">
                    {dialogState.showCancel && (
                        <button
                            ref={cancelBtnRef}
                            type="button"
                            disabled={dialogState.isLoading}
                            onClick={handleCancel}
                            className="hb-dialog-btn hb-dialog-btn-cancel"
                        >
                            {dialogState.cancelText}
                        </button>
                    )}
                    <button
                        ref={confirmBtnRef}
                        type="button"
                        disabled={dialogState.isLoading || !phraseSatisfied}
                        onClick={handleConfirm}
                        className={`hb-dialog-btn hb-dialog-btn-${dialogState.confirmVariant}`}
                    >
                        {dialogState.isLoading ? (
                            <>
                                <ButtonSpinner />
                                <span>{dialogState.loadingText}</span>
                            </>
                        ) : (
                            <span>{dialogState.confirmText}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Global Hangbug Dialog Portal Viewport.
 * Subscribes to dialogService and renders the active modal above all content.
 */
export const HangbugDialogViewport = () => {
    const [activeDialog, setActiveDialog] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeDialog(setActiveDialog);
        return unsubscribe;
    }, []);

    if (!activeDialog || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <HangbugDialogCard key={activeDialog.id} dialogState={activeDialog} />,
        document.body
    );
};

export default HangbugDialogViewport;
