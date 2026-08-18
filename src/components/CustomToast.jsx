import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

/**
 * Custom modern icon component for React-Toastify notifications.
 */
export const CustomToastIcon = ({ type }) => {
    switch (type) {
        case 'success':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-success">
                    <CheckCircle2 className="w-5 h-5 stroke-[2.3]" />
                    <span className="custom-toast-icon-ping" />
                </div>
            );
        case 'error':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-error">
                    <AlertCircle className="w-5 h-5 stroke-[2.3]" />
                </div>
            );
        case 'warning':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-warning">
                    <AlertTriangle className="w-5 h-5 stroke-[2.3]" />
                </div>
            );
        case 'info':
        default:
            return (
                <div className="custom-toast-icon-box custom-toast-icon-info">
                    <Sparkles className="w-5 h-5 stroke-[2.3]" />
                </div>
            );
    }
};

/**
 * Custom sleek close button component for React-Toastify notifications.
 */
export const CustomCloseButton = ({ closeToast }) => (
    <button
        type="button"
        onClick={closeToast}
        aria-label="Close notification"
        className="custom-toast-close-button"
    >
        <X className="w-3.5 h-3.5" />
    </button>
);
