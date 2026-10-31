import React, { useState, useEffect, useRef } from 'react';
import { Gauge, CheckCircle2, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react';

const PASSAGES = [
    "Clean code is simple, direct, and reads like well-crafted prose. Meaningful naming conventions and small single-responsibility functions make complex software architectures effortless to debug and maintain over time.",
    "JavaScript manages asynchronous operations with a single-threaded event loop. Non-blocking I/O delegates network requests and timers to the browser background, processing resolved microtasks on the call stack.",
    "Git branches allow engineering teams to isolate feature development without polluting the main production line. Frequent atomic commits paired with thorough pull request reviews keep codebases resilient and clean."
];

export const SpeedTypingEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [passageIdx, setPassageIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);
    const passage = PASSAGES[passageIdx];

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setWpm(0);
        setCpm(0);
        setAccuracy(100);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [passageIdx]);

    // Live WPM calculation timer
    useEffect(() => {
        if (!startTime || isFinished || isPaused) return;

        const interval = setInterval(() => {
            const elapsedMins = (Date.now() - startTime) / 60000;
            if (elapsedMins > 0) {
                const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
                const currentWpm = Math.round(wordsTyped / elapsedMins);
                const currentCpm = Math.round(typed.length / elapsedMins);
                setWpm(currentWpm);
                setCpm(currentCpm);
            }
        }, 300);

        return () => clearInterval(interval);
    }, [startTime, typed, isFinished, isPaused]);

    const handleChange = (e) => {
        if (isFinished || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        setTyped(val);

        // Calculate accuracy
        let correctChars = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === passage[i]) correctChars++;
        }
        const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
        setAccuracy(acc);

        // Check completion
        if (val.length >= passage.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wordsCount = passage.split(/\s+/).length;
            const finalWpm = Math.max(1, Math.round(wordsCount / (elapsedMins || 0.01)));
            const finalScore = Math.round(finalWpm * 10 * (acc / 100));

            setWpm(finalWpm);
            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy: acc,
                    metadata: { cpm: Math.round(passage.length / elapsedMins), durationSeconds: Math.round(elapsedMins * 60) }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Gauge size={12} /> Typing Benchmark
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Passage {passageIdx + 1} of {PASSAGES.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Speed Typing Challenge</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type the displayed text accurately to benchmark your developer WPM.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Speed</span>
                        <span className="text-base font-black text-emerald-400">{wpm} WPM</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Accuracy</span>
                        <span className="text-base font-black text-cyan-400">{accuracy}%</span>
                    </div>
                </div>
            </div>

            {/* Target Passage with real-time character highlights */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border border-white/10 min-h-[140px] shadow-inner"
            >
                {passage.split('').map((char, i) => {
                    let color = 'text-slate-500';
                    let isCurrent = i === typed.length;

                    if (i < typed.length) {
                        color = typed[i] === char ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';
                    }

                    return (
                        <span key={i} className={`relative ${color} ${isCurrent ? 'border-b-2 border-emerald-400 animate-pulse' : ''}`}>
                            {char}
                        </span>
                    );
                })}
            </div>

            {/* Hidden Input Layer */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                placeholder="Click the text above and start typing..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-emerald-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />

            {/* Completion Result */}
            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Passage Completed!</p>
                            <p className="text-xs text-emerald-300/80 mt-0.5">
                                Final Speed: <strong>{wpm} WPM</strong> | Accuracy: <strong>{accuracy}%</strong> | CPM: <strong>{cpm}</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setPassageIdx(prev => (prev + 1) % PASSAGES.length)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-emerald-400 cursor-pointer"
                    >
                        Next Passage
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {passage.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        setWpm(0);
                        inputRef.current?.focus();
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Restart Passage
                </button>
            </div>
        </div>
    );
};

export default SpeedTypingEngine;
