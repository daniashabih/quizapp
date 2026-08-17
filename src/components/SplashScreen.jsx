import { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

export default function SplashScreen({ onFinish }) {
    const [phase, setPhase] = useState('enter'); // 'enter' | 'loading' | 'exit'
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const enterTimer = setTimeout(() => {
            setPhase('loading');
        }, 400);

        return () => clearTimeout(enterTimer);
    }, []);

    useEffect(() => {
        if (phase !== 'loading') return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.random() * 15 + 5;
                const next = Math.min(prev + increment, 100);
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setPhase('exit');
                        setTimeout(() => {
                            setVisible(false);
                            if (onFinish) onFinish();
                        }, 400);
                    }, 200);
                    return 100;
                }
                return next;
            });
        }, 150);

        return () => clearTimeout(interval);
    }, [phase, onFinish]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ease-in-out bg-white ${
                phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
        >
            {/* Ambient Background Blur */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#059669]/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            <div className="flex flex-col items-center text-center max-w-sm px-6 relative z-10">
                {/* Logo Container */}
                <div className="relative mb-6">
                    <div className="absolute -inset-3 bg-[#059669]/10 rounded-3xl blur-md animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-white border border-[#E2E8F0] shadow-xl flex items-center justify-center p-3">
                        <BrandLogo variant="mark" size="lg" />
                    </div>
                </div>

                {/* App Brand Name */}
                <h1 className="text-3xl font-display font-extrabold text-[var(--foreground)] tracking-tight mb-1">
                    Hang<span className="text-[#059669]">Bug</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xs font-semibold text-[var(--foreground-secondary)] tracking-widest uppercase mb-8">
                    AI Web Development Assessment
                </p>

                {/* Progress Bar Container */}
                <div className="w-full space-y-2">
                    <div className="w-full h-1.5 bg-[#ECFDF5] rounded-full overflow-hidden border border-[#A7F3D0] p-0.5">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#047857] transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium text-[var(--foreground-muted)]">
                        <span>Initializing core modules...</span>
                        <span className="font-mono font-bold text-[#059669]">{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* Minimal Loading Dots */}
                <div className="flex items-center gap-1.5 mt-8">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>

            {/* Bottom branding */}
            <p className="absolute bottom-8 text-[10px] font-medium text-[var(--foreground-muted)] tracking-wider">
                © {new Date().getFullYear()} HangBug Platform
            </p>
        </div>
    );
}
