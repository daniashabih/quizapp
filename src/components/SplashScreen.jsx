import logoIcon from '../assets/branding/hangbug-icon.png';

export default function SplashScreen({ message = 'HangBug' }) {
    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--page-bg)] select-none px-6 transition-colors duration-200"
            role="status"
            aria-live="polite"
            aria-label={message}
        >
            {/* Brand Emblem Container */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] shadow-lg flex items-center justify-center p-4">
                    <img
                        src={logoIcon}
                        alt="HangBug Emblem"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Brand Title */}
            <div className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-[var(--foreground)]">
                    Hang<span className="text-[#193D35] dark:text-emerald-400">Bug</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#193D35] dark:text-emerald-400/90 uppercase">
                    Learn · Test · Prove
                </p>
            </div>

            {/* Subtle Loading Indicator */}
            <div className="mt-8 flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#193D35]/20 dark:border-emerald-400/20 border-t-[#193D35] dark:border-t-emerald-400 rounded-full animate-spin" />
            </div>
        </div>
    );
}
