import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
    { id: 'light', label: 'Light Mode', shortLabel: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark Mode', shortLabel: 'Dark', icon: Moon },
    { id: 'system', label: 'System Default', shortLabel: 'System', icon: Monitor },
];

export default function ThemeToggle({ variant = 'dropdown', className = '' }) {
    const { theme, resolvedTheme, isDark, setThemeMode, toggleTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

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
                            onClick={() => setThemeMode(opt.id)}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                active
                                    ? 'bg-[#193D35] dark:bg-[#25544A] text-white shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <Icon size={13} />
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
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                className={`p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all cursor-pointer ${className}`}
            >
                {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
        );
    }

    const activeOption = THEME_OPTIONS.find((o) => o.id === theme) || THEME_OPTIONS[2];
    const TriggerIcon = theme === 'system' ? Monitor : isDark ? Moon : Sun;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={`Theme selector, current theme: ${activeOption.label} (${resolvedTheme})`}
                aria-haspopup="menu"
                aria-expanded={open}
                title={`Theme: ${activeOption.label}`}
                className="flex items-center gap-1.5 p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all cursor-pointer"
            >
                <TriggerIcon
                    size={16}
                    className={isDark ? 'text-emerald-400' : 'text-[#193D35]'}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Select theme"
                    className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl p-1.5 z-50"
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
                                    setThemeMode(opt.id);
                                    setOpen(false);
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
