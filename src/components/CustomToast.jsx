import React, { useEffect, useState } from 'react';
import {
    subscribeNotifications,
    dismissNotification,
    pauseNotificationTimer,
    resumeNotificationTimer
} from '../services/notificationService';

/**
 * Custom crafted vector icon suite for Hangbug SaaS Notifications.
 * Supports: success, error, warning, info, loading.
 */
export const CustomToastIcon = ({ type = 'info' }) => {
    const normalized = typeof type === 'string' ? type : (type?.type || 'info');

    switch (normalized) {
        case 'success':
            return (
                <div className="hb-toast-icon hb-toast-icon-success" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            fill="currentColor"
                            fillOpacity="0.16"
                        />
                        <path
                            d="M8.5 12.3L10.85 14.65L15.75 9.5"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="9.25"
                            stroke="currentColor"
                            strokeWidth="1.75"
                        />
                    </svg>
                </div>
            );

        case 'error':
            return (
                <div className="hb-toast-icon hb-toast-icon-error" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            fill="currentColor"
                            fillOpacity="0.16"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="9.25"
                            stroke="currentColor"
                            strokeWidth="1.75"
                        />
                        <path
                            d="M12 8.25V12.75"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="15.85" r="1.2" fill="currentColor" />
                    </svg>
                </div>
            );

        case 'warning':
            return (
                <div className="hb-toast-icon hb-toast-icon-warning" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M10.29 3.86L1.82 18C1.64 18.3 1.55 18.64 1.55 19C1.55 20.1 2.45 21 3.55 21H20.45C21.55 21 22.45 20.1 22.45 19C22.45 18.64 22.36 18.3 22.18 18L13.71 3.86C13.35 3.25 12.7 2.88 12 2.88C11.3 2.88 10.65 3.25 10.29 3.86Z"
                            fill="currentColor"
                            fillOpacity="0.15"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M12 9V13.25"
                            stroke="currentColor"
                            strokeWidth="2.15"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="16.6" r="1.15" fill="currentColor" />
                    </svg>
                </div>
            );

        case 'loading':
            return (
                <div className="hb-toast-icon hb-toast-icon-loading" aria-hidden="true">
                    <svg
                        className="hb-toast-spinner"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeOpacity="0.22"
                            strokeWidth="2.4"
                        />
                        <path
                            d="M21 12C21 7.02944 16.9706 3 12 3"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            );

        case 'info':
        default:
            return (
                <div className="hb-toast-icon hb-toast-icon-info" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            fill="currentColor"
                            fillOpacity="0.15"
                        />
                        <circle
                            cx="12"
                            cy="12"
                            r="9.25"
                            stroke="currentColor"
                            strokeWidth="1.75"
                        />
                        <path
                            d="M12 11.25V16"
                            stroke="currentColor"
                            strokeWidth="2.15"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="8.2" r="1.15" fill="currentColor" />
                    </svg>
                </div>
            );
    }
};

/**
 * Minimalist accessible close button for Hangbug notifications.
 */
export const CustomCloseButton = ({ closeToast, onClick }) => (
    <button
        type="button"
        onClick={onClick || closeToast}
        aria-label="Dismiss notification"
        className="hb-toast-close"
    >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </button>
);

/**
 * Individual Hangbug Notification Card
 */
export const HangbugToastCard = ({ item, onDismiss }) => {
    const { id, type, title, description, exiting } = item;
    const isUrgent = type === 'error' || type === 'warning';

    return (
        <div
            role={isUrgent ? 'alert' : 'status'}
            aria-live={isUrgent ? 'assertive' : 'polite'}
            aria-atomic="true"
            onMouseEnter={() => pauseNotificationTimer(id)}
            onMouseLeave={() => resumeNotificationTimer(id)}
            className={`hb-toast hb-toast-${type} ${exiting ? 'hb-toast-exit' : ''}`}
            data-toast-id={id}
            data-toast-type={type}
        >
            <span className="hb-toast-accent-bar" aria-hidden="true" />
            <CustomToastIcon type={type} />
            <div className="hb-toast-content">
                {title && (
                    <p className="hb-toast-title">
                        {title}
                    </p>
                )}
                {description && (
                    <p className="hb-toast-message">
                        {description}
                    </p>
                )}
            </div>
            <CustomCloseButton onClick={() => onDismiss(id)} />
        </div>
    );
};

/**
 * Global Hangbug Floating Notification Viewport.
 * Renders stacked notifications cleanly without blocking underlying UI.
 */
export const HangbugToastViewport = () => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const unsubscribe = subscribeNotifications(setItems);
        return unsubscribe;
    }, []);

    if (items.length === 0) return null;

    return (
        <section
            aria-label="Notifications"
            className="hb-toast-viewport no-print"
        >
            {items.map((item) => (
                <HangbugToastCard
                    key={item.id}
                    item={item}
                    onDismiss={dismissNotification}
                />
            ))}
        </section>
    );
};

export default HangbugToastViewport;
