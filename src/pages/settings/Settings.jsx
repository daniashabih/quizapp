import { Sun, Moon, Monitor, Bell, Shield, Check } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
    const { theme, resolvedTheme, setThemeMode } = useTheme();

    const themeOptions = [
        {
            id: 'light',
            label: 'Light Mode',
            icon: Sun,
            desc: 'Clean light backgrounds with high-contrast dark text',
        },
        {
            id: 'dark',
            label: 'Dark Mode',
            icon: Moon,
            desc: 'Comfortable dark surfaces with crisp, readable light text',
        },
        {
            id: 'system',
            label: 'System Default',
            icon: Monitor,
            desc: `Automatically follows your device or browser appearance (currently ${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`,
        },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">
                        Preferences & Settings
                    </h1>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                        Customize your appearance and platform experience.
                    </p>
                </div>

                {/* Theme Selection */}
                <div className="card p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                            <h2 className="text-sm font-display font-bold text-[var(--foreground)]">
                                Theme Appearance
                            </h2>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Choose how HangBug looks on this browser. Changes apply immediately and are saved automatically.
                            </p>
                        </div>
                        <span className="badge badge-emerald text-[11px]">
                            Active: {themeOptions.find((o) => o.id === theme)?.label || 'System Default'}
                        </span>
                    </div>

                    <div
                        role="radiogroup"
                        aria-label="Select theme appearance"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                        {themeOptions.map((opt) => {
                            const Icon = opt.icon;
                            const active = theme === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setThemeMode(opt.id)}
                                    className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                                        active
                                            ? 'border-[#193D35] dark:border-emerald-400 bg-[#F3E5C5]/60 dark:bg-emerald-500/15 ring-2 ring-[#193D35]/15 dark:ring-emerald-400/20'
                                            : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--muted-bg)]/60 hover:border-[#193D35]/40 dark:hover:border-emerald-400/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                                active
                                                    ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-[#0A0E0C]'
                                                    : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                                            }`}
                                        >
                                            <Icon size={18} />
                                        </div>
                                        {active && (
                                            <span className="w-5 h-5 rounded-full bg-[#193D35] dark:bg-emerald-400 text-white dark:text-[#0A0E0C] flex items-center justify-center">
                                                <Check size={12} strokeWidth={3} />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-[var(--foreground)]">{opt.label}</p>
                                    <p className="text-[11px] text-[var(--foreground-muted)] mt-0.5 leading-relaxed">
                                        {opt.desc}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notifications & Preferences */}
                <div className="card p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2.5">
                        <Bell size={16} className="text-[#193D35] dark:text-emerald-400" />
                        <h2 className="text-sm font-display font-bold text-[var(--foreground)]">
                            Quiz Experience
                        </h2>
                    </div>

                    <div className="divide-y divide-[var(--card-border)] text-xs">
                        <div className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-[var(--foreground)]">Instant Answer Explanations</p>
                                <p className="text-[11px] text-[var(--foreground-muted)]">Show detailed explanations immediately after answering</p>
                            </div>
                            <span className="badge badge-success">Enabled</span>
                        </div>
                        <div className="py-3 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-[var(--foreground)]">Auto-Generate Certificates</p>
                                <p className="text-[11px] text-[var(--foreground-muted)]">Automatically issue verified certificate on passing score</p>
                            </div>
                            <span className="badge badge-success">Enabled</span>
                        </div>
                    </div>
                </div>

                {/* Security Info */}
                <div className="card p-6 rounded-2xl flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F3E5C5] dark:bg-emerald-500/15 flex items-center justify-center text-[#193D35] dark:text-emerald-400 shrink-0">
                        <Shield size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-[var(--foreground)]">Data & Session Security</h3>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">
                            Your quiz progress, certificates, and profile data are securely synchronized with MongoDB Atlas.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
