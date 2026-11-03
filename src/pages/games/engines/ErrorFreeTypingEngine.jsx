import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ShieldCheck, RotateCcw, CheckCircle2, AlertOctagon } from 'lucide-react';

const TECH_ERROR_FREE_PASSAGES = [
    {
        technology: 'general',
        technologyName: 'General',
        difficulty: 'Intermediate',
        text: "In mission-critical software systems, every single keystroke must be deliberate. Strong type systems, automated unit tests, and rigorous static analysis catch defects before deployment."
    },
    {
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Intermediate',
        text: "Strict equality triple equals checks both type and value identity without coercion. Using const and let prevents accidental variable leaks into outer enclosing scopes."
    },
    {
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Beginner',
        text: "React state must always be treated as immutable. Updating objects or arrays requires creating shallow clones using the spread operator to trigger deterministic re-renders."
    },
    {
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Intermediate',
        text: "Python relies on uniform whitespace indentation to delineate code blocks. Mixing spaces and tabs results in TabError exceptions before script execution begins."
    },
    {
        technology: 'php',
        technologyName: 'PHP',
        difficulty: 'Beginner',
        text: "Always parameterize SQL queries using PDO prepare statements to neutralize SQL injection vulnerabilities. Never concatenate raw user input directly into executable statements."
    },
    {
        technology: 'sql',
        technologyName: 'SQL',
        difficulty: 'Intermediate',
        text: "A database transaction must satisfy ACID properties completely. If any operation within the batch fails, the database issues a rollback to preserve integrity."
    },
    {
        technology: 'flutter',
        technologyName: 'Flutter',
        difficulty: 'Beginner',
        text: "Flutter widgets are declarative configurations rather than persistent visual views. When build is called, Flutter constructs an efficient lightweight element tree."
    },
    {
        technology: 'dart',
        technologyName: 'Dart',
        difficulty: 'Intermediate',
        text: "Sound null safety ensures that variables cannot contain null values unless explicitly declared with a question mark, eliminating null pointer exceptions at runtime."
    }
];

export const ErrorFreeTypingEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [typed, setTyped] = useState('');
    const [hasError, setHasError] = useState(false);
    const [totalErrors, setTotalErrors] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const inputRef = useRef(null);

    const activePassage = useMemo(() => {
        if (!technology || technology === 'all') {
            return TECH_ERROR_FREE_PASSAGES[0];
        }
        const match = TECH_ERROR_FREE_PASSAGES.find(p =>
            p.technology.toLowerCase() === technology.toLowerCase() &&
            (!difficulty || difficulty === 'All Levels' || p.difficulty.toLowerCase() === difficulty.toLowerCase())
        );
        if (match) return match;
        const techMatch = TECH_ERROR_FREE_PASSAGES.find(p => p.technology.toLowerCase() === technology.toLowerCase());
        return techMatch || TECH_ERROR_FREE_PASSAGES[0];
    }, [technology, difficulty]);

    const PASSAGE = activePassage.text;

    useEffect(() => {
        setTyped('');
        setHasError(false);
        setTotalErrors(0);
        setIsComplete(false);
        setStartTime(null);
        if (inputRef.current) inputRef.current.focus();
    }, [technology, difficulty]);

    const handleChange = (e) => {
        if (isComplete || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        // If deleting backwards
        if (val.length < typed.length) {
            setTyped(val);
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
            setHasError(true);
            setTotalErrors(prev => prev + 1);
            setTyped(val);
            return;
        }

        setTyped(val);

        if (val.length >= PASSAGE.length) {
            setIsComplete(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wpm = Math.max(1, Math.round(PASSAGE.split(/\s+/).length / (elapsedMins || 0.01)));
            const accuracy = Math.max(0, Math.round(((PASSAGE.length) / (PASSAGE.length + totalErrors)) * 100));
            const finalScore = Math.round(wpm * 20 * (accuracy / 100));

            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm,
                    accuracy,
                    metadata: { totalErrors, technology: activePassage.technology }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <ShieldCheck size={12} /> {activePassage.technologyName || 'Precision'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {activePassage.difficulty || difficulty || 'Advanced'}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Error-Free Typing Challenge</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Zero mistakes permitted! Typos lock typing until backspaced.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold ${
                        hasError ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300' : 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    }`}>
                        {hasError ? <AlertOctagon size={14} /> : <CheckCircle2 size={14} />}
                        {hasError ? 'MISTAKE LOCKED' : 'FLAWLESS'}
                    </div>
                </div>
            </div>

            {/* Passage Display */}
            <div
                onClick={() => inputRef.current?.focus()}
                className={`relative p-5 rounded-2xl font-mono text-sm sm:text-base leading-relaxed tracking-wide select-none cursor-text border transition-all min-h-[140px] shadow-xs ${
                    hasError
                        ? 'bg-rose-500/10 border-rose-500/60'
                        : 'bg-[var(--muted-bg)] border-[var(--card-border)]'
                }`}
            >
                {PASSAGE.split('').map((char, i) => {
                    let color = 'text-stone-400 dark:text-stone-500';
                    let isCurrent = i === typed.length;

                    if (i < typed.length) {
                        color = typed[i] === char
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold'
                            : 'text-rose-700 dark:text-rose-300 bg-rose-500/30 font-bold underline animate-pulse';
                    }

                    return (
                        <span key={i} className={`relative ${color} ${isCurrent ? 'border-b-2 border-indigo-500 animate-pulse' : ''}`}>
                            {char}
                        </span>
                    );
                })}
            </div>

            {/* Input field */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isComplete || isPaused}
                placeholder={hasError ? "Backspace to clear mistake..." : "Type flawlessly..."}
                className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden transition-all ${
                    hasError ? 'bg-rose-500/10 border-rose-500 focus:border-rose-600' : 'bg-[var(--muted-bg)] border-[var(--card-border)] focus:border-emerald-500'
                }`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />

            {isComplete && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                    <div>
                        <p className="font-black text-sm">Flawless Run Completed!</p>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">Total corrections required: {totalErrors}. Excellent developer discipline!</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {PASSAGE.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setHasError(false);
                        setTotalErrors(0);
                        setIsComplete(false);
                        setStartTime(null);
                        inputRef.current?.focus();
                    }}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Retry Precision Run
                </button>
            </div>
        </div>
    );
};

export default ErrorFreeTypingEngine;
