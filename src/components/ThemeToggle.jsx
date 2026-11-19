import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const THEME_OPTIONS = [
    { id: 'light', label: 'Light Mode', shortLabel: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark Mode', shortLabel: 'Dark', icon: Moon },
    { id: 'system', label: 'System Default', shortLabel: 'System', icon: Monitor },
];

function AnimatedThemeGlyph({ isDark }) {
    return (
        <span
            aria-hidden="true"
            className="theme-toggle-motion relative inline-flex items-center justify-center w-4 h-4 shrink-0"
        >
            <Sun
                size={16}
                style={{ color: '#193D35' }}
                className={`absolute inset-0 m-auto ${
                    !isDark
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-[0.35] rotate-90 pointer-events-none'
                }`}
            />
            <Moon
                size={16}
                style={{ color: '#34D399' }}
                className={`absolute inset-0 m-auto ${
                    isDark
                        ? 'opacity-100 scale-100 rotate-0'
                        : 'opacity-0 scale-[0.35] -rotate-90 pointer-events-none'
                }`}
            />
        </span>
    );
}

export default function ThemeToggle({ variant = 'icon', className = '' }) {
    const { theme, isDark, setThemeMode, toggleTheme } = useTheme();

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

    return (
        <button
            type="button"
            data-theme-toggle-trigger="true"
            onClick={(e) => toggleTheme(e)}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-pressed={isDark}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            className={`inline-flex items-center justify-center p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-colors duration-200 cursor-pointer ${className}`}
        >
            <AnimatedThemeGlyph isDark={isDark} />
        </button>
    );
}
