import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
    { id: 'light', label: 'Light Mode', shortLabel: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark Mode', shortLabel: 'Dark', icon: Moon },
    { id: 'system', label: 'System Default', shortLabel: 'System', icon: Monitor },
];

function AnimatedThemeGlyph({ mode, isDark, showSystem = true }) {
    const isLightActive = mode === 'light';
    const isDarkActive = mode === 'dark';
    const isSystemActive = showSystem && mode === 'system';

    return (
        <span
            aria-hidden="true"
            className="theme-toggle-motion relative inline-flex items-center justify-center w-4 h-4 shrink-0"
        >
            <Sun
                size={16}
                className={`absolute inset-0 m-auto text-[#193D35] ${
                    isLightActive
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-[0.35] rotate-90 pointer-events-none'
                }`}
            />
            <Moon
                size={16}
                className={`absolute inset-0 m-auto text-emerald-400 ${
                    isDarkActive
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-[0.35] -rotate-90 pointer-events-none'
                }`}
            />
            {showSystem && (
                <Monitor
                    size={16}
                    className={`absolute inset-0 m-auto ${
                        isDark ? 'text-emerald-400' : 'text-[#193D35]'
                    } ${
                        isSystemActive
                            ? 'opacity-100 scale-100 rotate-0'
                            : 'opacity-0 scale-50 pointer-events-none'
                    }`}
                />
            )}
        </span>
    );
}

export default function ThemeToggle({ variant = 'dropdown', className = '' }) {
    const { theme, resolvedTheme, isDark, setThemeMode, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (variant === 'segmented') {
        return (
            <div
                role="radiogroup"
                aria-label="Theme preference"
                className={`inline-flex items-center p-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] ${className}`}
            >
                {THEME_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = theme === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={opt.label}
                            onClick={(e) => setThemeMode(opt.id, e)}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 active:scale-[0.97] cursor-pointer ${
                                active
                                    ? 'bg-[#193D35] dark:bg-[#25544A] text-white shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <Icon
                                size={13}
                                className={`theme-toggle-motion ${
                                    active ? 'scale-110 rotate-0' : 'scale-100'
                                }`}
                            />
                            <span>{opt.shortLabel}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    if (variant === 'icon') {
        return (
            <button
                type="button"
                data-theme-toggle-trigger="true"
                onClick={(e) => toggleTheme(e)}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                className={`p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all duration-200 active:scale-95 cursor-pointer ${className}`}
            >
                <AnimatedThemeGlyph
                    mode={isDark ? 'dark' : 'light'}
                    isDark={isDark}
                    showSystem={false}
                />
            </button>
        );
    }

    const activeOption = THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[2];

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                ref={triggerRef}
                type="button"
                data-theme-toggle-trigger="true"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={`Theme selector, current theme: ${activeOption.label} (${resolvedTheme})`}
                aria-haspopup="menu"
                aria-expanded={open}
                title={`Theme: ${activeOption.label}`}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all duration-200 active:scale-95 cursor-pointer"
            >
                <AnimatedThemeGlyph
                    mode={theme}
                    isDark={isDark}
                    showSystem={true}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Select theme"
                    className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-1.5 z-50 animate-scale-in origin-top-right"
                >
                    {THEME_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = theme === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isSelected}
                                onClick={() => {
                                    if (opt.id === theme) {
                                        setOpen(false);
                                        return;
                                    }
                                    const started = setThemeMode(opt.id, {
                                        originEl: triggerRef.current,
                                        onBeforeUpdate: () => setOpen(false),
                                    });
                                    if (!started) {
                                        setOpen(false);
                                    }
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    isSelected
                                        ? 'bg-[#F3E5C5]/70 dark:bg-emerald-500/15 text-[#193D35] dark:text-emerald-300'
                                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--muted-bg)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon size={14} />
                                    <span>{opt.label}</span>
                                </span>
                                {isSelected && <Check size={13} className="shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
