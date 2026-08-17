import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

export default function SplashScreen({ onFinish }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'loading' | 'exit'
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Phase 1: Initial pause to show the logo
        const enterTimer = setTimeout(() => {
            setPhase('loading');
        }, 600);

        return () => clearTimeout(enterTimer);
    }, []);

    useEffect(() => {
        if (phase !== 'loading') return;

        // Phase 2: Animate progress bar from 0 to 100
        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.random() * 12 + 3;
                const next = Math.min(prev + increment, 100);
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setPhase('exit');
                        setTimeout(() => {
                            setVisible(false);
                            if (onFinish) onFinish();
                        }, 600);
                    }, 300);
                    return 100;
                }
                return next;
            });
        }, 180);

        return () => clearInterval(interval);
    }, [phase, onFinish]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-in-out bg-white ${
                phase === 'exit' ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
        >
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#059669]/5 rounded-full blur-[120px] animate-pulse-glow" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="flex flex-col items-center text-center max-w-sm px-6"
            >
                {/* Bug Icon Container with Pulsing Ring */}
                <div className="relative mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -inset-3 bg-[#059669]/20 rounded-3xl blur-md"
                    />

                    <div className="relative w-20 h-20 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl flex items-center justify-center p-3">
                        <BrandLogo variant="mark" size="lg" />
                    </div>
                </div>

                {/* App Brand Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-3xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-1"
                >
                    Hang<span className="text-[#059669]">Bug</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-xs font-semibold text-[var(--foreground-secondary)] tracking-widest uppercase mb-8"
                >
                    AI Web Development Assessment
                </motion.p>

                {/* Progress Bar Container */}
                <div className="w-full space-y-2">
                    <div className="w-full h-1.5 bg-[var(--muted-bg)] rounded-full overflow-hidden border border-[var(--card-border)] p-0.5">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#047857] transition-all duration-300 ease-out"
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-[var(--foreground-muted)]">
                        <span>Initializing core modules...</span>
                        <span className="font-mono font-bold text-[var(--foreground-secondary)]">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Minimal Loading Dots */}
                <div className="flex items-center gap-1.5 mt-8">
            </div>

            {/* Bottom branding */}
            <p className={`absolute bottom-8 text-[10px] font-medium text-[#9CA3AF] tracking-wider transition-all duration-500 ${
                phase === 'enter' ? 'opacity-0' : 'opacity-100'
            }`}>
                © {new Date().getFullYear()} HangBug Platform
            </p>
        </div>
    );
}
