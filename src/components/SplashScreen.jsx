import { useState, useEffect, useRef } from 'react';
import logoIcon from '../assets/branding/hangbug-icon.png';

export default function SplashScreen({ onFinish, message = 'HangBug' }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'loading' | 'exit'
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);
    const finishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        const completeSplash = () => {
            if (finishedRef.current) return;
            finishedRef.current = true;
            setVisible(false);
            if (typeof onFinishRef.current === 'function') {
                onFinishRef.current();
            }
        };

        const enterTimer = setTimeout(() => {
            setPhase('loading');
        }, 120);

        let exitTimer = null;
        let finishTimer = null;

        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = 25 + Math.random() * 20;
                const next = Math.min(prev + increment, 100);
                if (next >= 100) {
                    clearInterval(interval);
                    exitTimer = setTimeout(() => {
                        setPhase('exit');
                        finishTimer = setTimeout(completeSplash, 220);
                    }, 100);
                    return 100;
                }
                return next;
            });
        }, 80);

        // Hard failsafe so the splash screen can never get stuck even if timers are throttled
        const failsafeTimer = setTimeout(completeSplash, 1100);

        return () => {
            clearTimeout(enterTimer);
            clearInterval(interval);
            if (exitTimer) clearTimeout(exitTimer);
            if (finishTimer) clearTimeout(finishTimer);
            clearTimeout(failsafeTimer);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--page-bg)] select-none px-6 transition-all duration-300 ease-out ${
                phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
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

            {/* Progress Bar & Spinner */}
            <div className="mt-7 w-48 space-y-2">
                <div className="w-full h-1.5 bg-[var(--muted-bg)] rounded-full overflow-hidden border border-[var(--card-border)]">
                    <div
                        className="h-full rounded-full bg-[#193D35] dark:bg-emerald-400 transition-all duration-150 ease-out"
                        style={{ width: `${Math.round(progress)}%` }}
                    />
                </div>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#193D35]/20 dark:border-emerald-400/20 border-t-[#193D35] dark:border-t-emerald-400 rounded-full animate-spin" />
                    <span className="text-[11px] font-mono font-bold text-[var(--foreground-muted)]">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
