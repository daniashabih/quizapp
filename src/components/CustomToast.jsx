import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Custom modern refined icon component for React-Toastify notifications.
 */
export const CustomToastIcon = ({ type }) => {
    switch (type) {
        case 'success':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-success">
                    <CheckCircle2 className="w-[18px] h-[18px] stroke-[2.2]" />
                </div>
            );
        case 'error':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-error">
                    <AlertCircle className="w-[18px] h-[18px] stroke-[2.2]" />
                </div>
            );
        case 'warning':
            return (
                <div className="custom-toast-icon-box custom-toast-icon-warning">
                    <AlertTriangle className="w-[18px] h-[18px] stroke-[2.2]" />
                </div>
            );
        case 'info':
        default:
            return (
                <div className="custom-toast-icon-box custom-toast-icon-info">
                    <Info className="w-[18px] h-[18px] stroke-[2.2]" />
                </div>
            );
    }
};

/**
 * Custom sleek minimalist close button component for React-Toastify notifications.
 */
export const CustomCloseButton = ({ closeToast }) => (
    <button
        type="button"
        onClick={closeToast}
        aria-label="Close notification"
        className="custom-toast-close-button"
    >
        <X className="w-3.5 h-3.5 stroke-[2.2]" />
    </button>
);
