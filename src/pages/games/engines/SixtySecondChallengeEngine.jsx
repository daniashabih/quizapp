import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle2, RotateCcw, Flame, Trophy } from 'lucide-react';

const WORD_BANK = [
    'function', 'variable', 'constant', 'boolean', 'integer',
    'string', 'array', 'object', 'closure', 'promise',
    'async', 'await', 'return', 'import', 'export',
    'class', 'interface', 'extends', 'implements', 'override',
    'private', 'protected', 'public', 'static', 'readonly',
    'database', 'schema', 'migration', 'endpoint', 'request',
    'response', 'header', 'status', 'payload', 'token',
    'encrypt', 'decrypt', 'session', 'cookie', 'storage',
    'testing', 'assertion', 'mocking', 'deploy', 'pipeline',
    'iteration', 'recursion', 'algorithm', 'complexity', 'lambda'
];

export const SixtySecondChallengeEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [correctWords, setCorrectWords] = useState(0);
    const [errors, setErrors] = useState(0);

    const inputRef = useRef(null);

    // Countdown timer
    useEffect(() => {
        if (!isActive || isFinished || isPaused) return;

        if (timeLeft <= 0) {
            setIsFinished(true);
            setIsActive(false);

            const finalWpm = correctWords;
            const accuracy = Math.round((correctWords / (correctWords + errors || 1)) * 100);
            const finalScore = finalWpm * 10;

            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy,
                    metadata: { correctWords, errors }
                });
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isFinished, isPaused, correctWords, errors, onGameOver, onScoreUpdate]);

    const handleKeyDown = (e) => {
        if (isFinished || isPaused) return;

        if (!isActive && e.key.length === 1) {
            setIsActive(true);
        }

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const typedWord = inputValue.trim();
            if (!typedWord) return;

            const targetWord = WORD_BANK[currentWordIdx % WORD_BANK.length];
            if (typedWord === targetWord) {
                setCorrectWords(c => c + 1);
            } else {
                setErrors(er => er + 1);
            }

            setInputValue('');
            setCurrentWordIdx(prev => prev + 1);
        }
    };

    const handleRestart = () => {
        setTimeLeft(60);
        setIsActive(false);
        setIsFinished(false);
        setCurrentWordIdx(0);
        setInputValue('');
        setCorrectWords(0);
        setErrors(0);
        if (inputRef.current) inputRef.current.focus();
    };

    const currentWord = WORD_BANK[currentWordIdx % WORD_BANK.length];
    const upcomingWords = [
        WORD_BANK[(currentWordIdx + 1) % WORD_BANK.length],
        WORD_BANK[(currentWordIdx + 2) % WORD_BANK.length],
        WORD_BANK[(currentWordIdx + 3) % WORD_BANK.length]
    ];

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <Timer size={12} /> 60s Sprint
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Speed Sprint
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">60-Second Developer Challenge</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type as many programming keywords as possible before the timer reaches 0.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Time Remaining</span>
                        <span className={`text-xl font-black ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Words</span>
                        <span className="text-xl font-black text-emerald-400">{correctWords}</span>
                    </div>
                </div>
            </div>

            {/* Target Word Stream */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center gap-4 select-none overflow-hidden shadow-inner">
                <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40">
                    {currentWord}
                </span>
                {upcomingWords.map((w, idx) => (
                    <span key={idx} className="text-lg sm:text-xl font-mono text-slate-500 hidden sm:inline opacity-60">
                        {w}
                    </span>
                ))}
            </div>

            {/* Input Box */}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isFinished || isPaused}
                placeholder={isActive ? "Type word and press Spacebar..." : "Start typing to begin 60s countdown..."}
                className="w-full px-5 py-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-base font-mono text-center text-[var(--foreground)] focus:outline-hidden focus:border-rose-500 transition-all shadow-inner"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
            />

            {/* Results */}
            {isFinished && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Trophy size={24} className="text-amber-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Sprint Completed! Final: {correctWords} WPM</p>
                            <p className="text-xs text-rose-300/80 mt-0.5">
                                Errors: {errors} | Accuracy: {Math.round((correctWords / (correctWords + errors || 1)) * 100)}%
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRestart}
                        className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-wider hover:bg-rose-400 cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] border border-[var(--card-border)]">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] border-[var(--card-border)]">Enter</kbd> to submit word
                </span>
                <button
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Reset
                </button>
            </div>
        </div>
    );
};

export default SixtySecondChallengeEngine;
