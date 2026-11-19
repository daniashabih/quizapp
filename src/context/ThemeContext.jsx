import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const STORAGE_KEY = 'hangbug-theme';
const VALID_MODES = ['light', 'dark', 'system'];
const THEME_TRANSITION_DURATION_MS = 520;
const THEME_CLEANUP_BUFFER_MS = 60;
const THEME_REVEAL_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const ThemeContext = createContext({
    theme: 'system',
    resolvedTheme: 'light',
    isDark: false,
    toggleTheme: () => false,
    setThemeMode: () => false,
});

function getSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

function getStoredThemeMode() {
    if (typeof window === 'undefined') return 'system';
    try {
        const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
        if (saved && VALID_MODES.includes(saved)) {
            return saved;
        }
    } catch {
        // Ignore storage read failures (e.g. private browsing restrictions)
    }
    return 'system';
}

function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
        return false;
    }
}

function normalizeTriggerOptions(eventOrOptions) {
    if (!eventOrOptions || typeof eventOrOptions !== 'object') {
        return {};
    }
    if ('currentTarget' in eventOrOptions || 'nativeEvent' in eventOrOptions || 'clientX' in eventOrOptions) {
        return { event: eventOrOptions };
    }
    return eventOrOptions;
}

function getElementCenter(el) {
    if (!el || typeof el.getBoundingClientRect !== 'function') return null;
    const rect = el.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

function getRevealCoordinates(options) {
    if (typeof window === 'undefined') {
        return { x: 0, y: 0, maxRadius: 0 };
    }

    let coords = null;
    const { originEl, event, x, y } = options || {};

    if (Number.isFinite(x) && Number.isFinite(y)) {
        coords = { x, y };
    }

    if (!coords && originEl) {
        coords = getElementCenter(originEl);
    }

    if (!coords && event) {
        coords = getElementCenter(event.currentTarget);
        if (!coords && Number.isFinite(event.clientX) && Number.isFinite(event.clientY) && (event.clientX > 0 || event.clientY > 0)) {
            coords = { x: event.clientX, y: event.clientY };
        }
    }

    if (!coords && typeof document !== 'undefined') {
        const triggers = document.querySelectorAll('[data-theme-toggle-trigger="true"]');
        for (const el of triggers) {
            const center = getElementCenter(el);
            if (center) {
                coords = center;
                break;
            }
        }
    }

    const originX = coords ? coords.x : window.innerWidth / 2;
    const originY = coords ? coords.y : window.innerHeight / 2;
    const maxRadius = Math.ceil(
        Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY)
        )
    );

    return { x: originX, y: originY, maxRadius };
}

function applyThemeToDOM(mode, resolved) {
    if (typeof document === 'undefined') return;
    const isDark = resolved === 'dark';
    const root = document.documentElement;
    if (
        root.classList.contains('dark') === isDark &&
        root.getAttribute('data-theme') === resolved &&
        root.getAttribute('data-theme-preference') === mode
    ) {
        return;
    }
    if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
    } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
    }
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-preference', mode);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#0F1513' : '#193D35');
    }
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getStoredThemeMode);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    const isDark = resolvedTheme === 'dark';

    const themeRef = useRef(theme);
    const resolvedThemeRef = useRef(resolvedTheme);
    const isTransitioningRef = useRef(false);
    const cleanupTimerRef = useRef(null);
    const activeOverlayRef = useRef(null);
    const activeAnimationRef = useRef(null);

    // Immediately sync refs, DOM classes, and attributes when theme or systemTheme changes
    useIsomorphicLayoutEffect(() => {
        themeRef.current = theme;
        resolvedThemeRef.current = resolvedTheme;
        applyThemeToDOM(theme, resolvedTheme);
    }, [theme, resolvedTheme]);

    // Cleanup any active transition classes/timers on unmount
    useEffect(() => {
        return () => {
            if (cleanupTimerRef.current) {
                window.clearTimeout(cleanupTimerRef.current);
            }
            if (activeAnimationRef.current) {
                try {
                    activeAnimationRef.current.cancel();
                } catch {
                    // Ignore already-finished animation cancellation errors
                }
                activeAnimationRef.current = null;
            }
            if (activeOverlayRef.current) {
                activeOverlayRef.current.remove();
                activeOverlayRef.current = null;
            }
            if (typeof document !== 'undefined') {
                const root = document.documentElement;
                root.classList.remove('theme-vt-active', 'theme-vt-css-fallback', 'theme-css-transition');
                root.removeAttribute('data-theme-transition');
            }
            isTransitioningRef.current = false;
        };
    }, []);

    // Listen to OS/browser prefers-color-scheme changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        let mediaQuery;
        try {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        } catch {
            return;
        }

        const handleChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    // Synchronize across browser tabs if localStorage changes
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleStorage = (e) => {
            if (e.key === STORAGE_KEY && e.newValue && VALID_MODES.includes(e.newValue)) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const setThemeMode = useCallback((nextMode, eventOrOptions) => {
        const options = normalizeTriggerOptions(eventOrOptions);
        const normalized = VALID_MODES.includes(nextMode) ? nextMode : 'system';
        const nextResolved = normalized === 'system' ? getSystemTheme() : normalized;

        if (normalized === themeRef.current && nextResolved === resolvedThemeRef.current) {
            options.onBeforeUpdate?.();
            return false;
        }

        // Prevent multiple overlapping animations when users click repeatedly
        if (isTransitioningRef.current) {
            return false;
        }

        try {
            localStorage.setItem(STORAGE_KEY, normalized);
        } catch {
            // Gracefully ignore storage write errors
        }

        const commitThemeChange = () => {
            options.onBeforeUpdate?.();
            themeRef.current = normalized;
            resolvedThemeRef.current = nextResolved;
            setTheme(normalized);
            applyThemeToDOM(normalized, nextResolved);
        };

        const willChangeVisualTheme = nextResolved !== resolvedThemeRef.current;
        const canAnimate =
            willChangeVisualTheme &&
            typeof document !== 'undefined' &&
            typeof window !== 'undefined' &&
            document.visibilityState === 'visible' &&
            !prefersReducedMotion();

        if (!canAnimate) {
            commitThemeChange();
            return true;
        }

        isTransitioningRef.current = true;
        const root = document.documentElement;
        const direction = nextResolved === 'dark' ? 'to-dark' : 'to-light';
        const { x, y, maxRadius } = getRevealCoordinates(options);

        root.style.setProperty('--theme-reveal-x', `${x}px`);
        root.style.setProperty('--theme-reveal-y', `${y}px`);
        root.style.setProperty('--theme-reveal-r', `${maxRadius}px`);
        root.setAttribute('data-theme-transition', direction);

        const runCssFallback = () => {
            if (cleanupTimerRef.current) {
                window.clearTimeout(cleanupTimerRef.current);
            }
            if (activeOverlayRef.current) {
                activeOverlayRef.current.remove();
                activeOverlayRef.current = null;
            }

            root.setAttribute('data-theme-transition', direction);
            root.classList.add('theme-css-transition');

            let overlay = null;
            if (document.body) {
                overlay = document.createElement('div');
                overlay.className = 'hangbug-theme-reveal-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                overlay.setAttribute('data-direction', direction);
                document.body.appendChild(overlay);
                activeOverlayRef.current = overlay;
            }

            flushSync(() => {
                commitThemeChange();
            });

            cleanupTimerRef.current = window.setTimeout(() => {
                root.classList.remove('theme-css-transition');
                root.removeAttribute('data-theme-transition');
                if (overlay) {
                    overlay.remove();
                    if (activeOverlayRef.current === overlay) {
                        activeOverlayRef.current = null;
                    }
                }
                isTransitioningRef.current = false;
                cleanupTimerRef.current = null;
            }, THEME_TRANSITION_DURATION_MS + THEME_CLEANUP_BUFFER_MS);
        };

        if (typeof document.startViewTransition === 'function') {
            root.classList.add('theme-vt-active');
            let cleaned = false;
            const cleanupViewTransition = () => {
                if (cleaned) return;
                cleaned = true;
                if (cleanupTimerRef.current) {
                    window.clearTimeout(cleanupTimerRef.current);
                    cleanupTimerRef.current = null;
                }
                activeAnimationRef.current = null;
                root.classList.remove('theme-vt-active', 'theme-vt-css-fallback');
                root.removeAttribute('data-theme-transition');
                isTransitioningRef.current = false;
            };

            // Generous initial failsafe so slow snapshot capture never aborts mid-animation
            cleanupTimerRef.current = window.setTimeout(
                cleanupViewTransition,
                THEME_TRANSITION_DURATION_MS + 1500
            );

            try {
                const transition = document.startViewTransition(() => {
                    flushSync(() => {
                        commitThemeChange();
                    });
                });

                Promise.resolve(transition.ready)
                    .then(() => {
                        if (cleaned) return;
                        if (cleanupTimerRef.current) {
                            window.clearTimeout(cleanupTimerRef.current);
                        }
                        cleanupTimerRef.current = window.setTimeout(
                            cleanupViewTransition,
                            THEME_TRANSITION_DURATION_MS + 400
                        );

                        try {
                            const anim = document.documentElement.animate(
                                {
                                    clipPath: [
                                        `circle(0px at ${x}px ${y}px)`,
                                        `circle(${maxRadius}px at ${x}px ${y}px)`,
                                    ],
                                },
                                {
                                    duration: THEME_TRANSITION_DURATION_MS,
                                    easing: THEME_REVEAL_EASING,
                                    fill: 'none',
                                    pseudoElement: '::view-transition-new(root)',
                                }
                            );
                            activeAnimationRef.current = anim;
                        } catch {
                            root.classList.add('theme-vt-css-fallback');
                        }
                    })
                    .catch(() => {});

                Promise.resolve(transition.finished)
                    .catch(() => {})
                    .finally(cleanupViewTransition);
                return true;
            } catch {
                cleanupViewTransition();
                isTransitioningRef.current = true;
                runCssFallback();
                return true;
            }
        }

        runCssFallback();
        return true;
    }, []);

    const toggleTheme = useCallback((eventOrOptions) => {
        const nextMode = resolvedThemeRef.current === 'dark' ? 'light' : 'dark';
        return setThemeMode(nextMode, eventOrOptions);
    }, [setThemeMode]);

    const value = useMemo(
        () => ({
            theme,
            resolvedTheme,
            isDark,
            toggleTheme,
            setThemeMode,
        }),
        [theme, resolvedTheme, isDark, toggleTheme, setThemeMode]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
