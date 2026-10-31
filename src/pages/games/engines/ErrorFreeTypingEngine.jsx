import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, AlertOctagon } from 'lucide-react';

const PASSAGE = "In mission-critical software systems, every single keystroke must be deliberate. Strong type systems, automated unit tests, and rigorous static analysis catch defects before deployment.";

export const ErrorFreeTypingEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [typed, setTyped] = useState('');
    const [hasError, setHasError] = useState(false);
    const [totalErrors, setTotalErrors] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleChange = (e) => {
        if (isComplete || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        // If deleting backwards
        if (val.length < typed.length) {
            setTyped(val);
            // Check if error is cleared
            const isNowErrorFree = val === PASSAGE.slice(0, val.length);
            setHasError(!isNowErrorFree);
            return;
        }

        // If already in an error state, block adding more characters until backspaced
        if (hasError) {
            return;
        }

        const nextCharIdx = val.length - 1;
        if (val[nextCharIdx] !== PASSAGE[nextCharIdx]) {
            // Typing mistake detected!
            setHasError(true);
            setTotalErrors(prev => prev + 1);
            setTyped(val);
            return;
        }

        // Correct character typed
        setTyped(val);
        setHasError(false);

        if (val === PASSAGE) {
            setIsComplete(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wpm = Math.max(1, Math.round(PASSAGE.split(/\s+/).length / (elapsedMins || 0.01)));
            const accuracy = Math.round((PASSAGE.length / (PASSAGE.length + totalErrors)) * 100);
            const score = totalErrors === 0 ? 500 : Math.max(100, 500 - (totalErrors * 50));

            if (onScoreUpdate) onScoreUpdate(score);
            if (onGameOver) {
                onGameOver({
                    score,
                    wpm,
                    accuracy,
                    metadata: { totalErrors, perfectRun: totalErrors === 0 }
                });
            }
        }
    };

    const handleRestart = () => {
        setTyped('');
        setHasError(false);
        setTotalErrors(0);
        setIsComplete(false);
        setStartTime(null);
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <ShieldCheck size={12} /> Zero Error
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Precision Challenge
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Error-Free Typing Test</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type without making any typos. A mistake will lock progress until backspaced.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Errors Made</span>
                        <span className={`text-base font-black ${totalErrors > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {totalErrors}
                        </span>
                    </div>
                </div>
            </div>

            {/* Target Passage */}
            <div
                onClick={() => inputRef.current?.focus()}
                className={`relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border transition-all min-h-[140px] shadow-inner ${
                    hasError ? 'border-rose-500/60 ring-2 ring-rose-500/30' : 'border-white/10'
                }`}
            >
                {PASSAGE.split('').map((char, i) => {
                    let color = 'text-slate-500';
                    let isCurrent = i === typed.length;

                    if (i < typed.length) {
                        color = typed[i] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';
                    }

                    return (
                        <span key={i} className={`${color} ${isCurrent ? 'border-b-2 border-amber-400 animate-pulse' : ''}`}>
                            {char}
                        </span>
                    );
                })}
            </div>

            {hasError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertOctagon size={16} className="text-rose-400 shrink-0" />
                    <span>Typo detected! Press <strong>Backspace</strong> to fix the error before you can continue.</span>
                </div>
            )}

            {/* Hidden Input Layer */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isComplete || isPaused}
                placeholder="Click the text and type without mistakes..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-amber-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />

            {isComplete && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Passage Completed Successfully!</p>
                            <p className="text-xs text-emerald-300/80 mt-0.5">
                                {totalErrors === 0 ? '🏆 Flawless 100% Zero-Error Execution!' : `Completed with ${totalErrors} corrected mistake(s).`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRestart}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"
                    >
                        Retry Run
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {PASSAGE.length} characters
                </span>
                <button
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Restart
                </button>
            </div>
        </div>
    );
};

export default ErrorFreeTypingEngine;
