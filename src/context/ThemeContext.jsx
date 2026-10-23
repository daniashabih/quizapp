import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'hangbug-theme';
const VALID_MODES = ['light', 'dark', 'system'];

const ThemeContext = createContext({
    theme: 'system',
    resolvedTheme: 'light',
    isDark: false,
    toggleTheme: () => {},
    setThemeMode: () => {},
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

function applyThemeToDOM(mode, resolved) {
    if (typeof document === 'undefined') return;
    const isDark = resolved === 'dark';
    const root = document.documentElement;
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

    // Immediately sync DOM classes and attributes when theme or systemTheme changes
    useIsomorphicLayoutEffect(() => {
        applyThemeToDOM(theme, resolvedTheme);
    }, [theme, resolvedTheme]);

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

    const setThemeMode = useCallback((nextMode) => {
        const normalized = VALID_MODES.includes(nextMode) ? nextMode : 'system';
        setTheme(normalized);
        try {
            localStorage.setItem(STORAGE_KEY, normalized);
        } catch {
            // Gracefully ignore storage write errors
        }
        const nextResolved = normalized === 'system' ? getSystemTheme() : normalized;
        applyThemeToDOM(normalized, nextResolved);
    }, []);

    const toggleTheme = useCallback(() => {
        const nextMode = isDark ? 'light' : 'dark';
        setThemeMode(nextMode);
    }, [isDark, setThemeMode]);

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
