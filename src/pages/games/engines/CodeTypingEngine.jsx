import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, CheckCircle2, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

const CODE_SNIPPETS = [
    {
        id: 'ct_1',
        language: 'javascript',
        title: 'Binary Search Function',
        code: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
    },
    {
        id: 'ct_2',
        language: 'python',
        title: 'Python Decorator Wrapper',
        code: `import time
from functools import wraps

def time_it(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"Elapsed: {duration:.4f}s")
        return result
    return wrapper`
    },
    {
        id: 'ct_3',
        language: 'sql',
        title: 'Aggregated Revenue Query',
        code: `SELECT department, SUM(amount) AS total_revenue
FROM sales
WHERE transaction_date >= '2026-01-01'
GROUP BY department
HAVING SUM(amount) > 10000
ORDER BY total_revenue DESC;`
    }
];

export const CodeTypingEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [snippetIdx, setSnippetIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);
    const currentSnippet = CODE_SNIPPETS[snippetIdx];
    const targetCode = currentSnippet.code;

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [snippetIdx]);

    useEffect(() => {
        if (!startTime || isFinished || isPaused) return;

        const interval = setInterval(() => {
            const elapsedMins = (Date.now() - startTime) / 60000;
            if (elapsedMins > 0) {
                const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
                setWpm(Math.round(wordsTyped / elapsedMins));
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

        let correctCount = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === targetCode[i]) correctCount++;
        }
        const acc = val.length > 0 ? Math.round((correctCount / val.length) * 100) : 100;
        setAccuracy(acc);

        if (val.length >= targetCode.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const wordsCount = targetCode.split(/\s+/).length;
            const finalWpm = Math.max(1, Math.round(wordsCount / (elapsedMins || 0.01)));
            const finalScore = Math.round(finalWpm * 15 * (acc / 100));

            setWpm(finalWpm);
            if (onScoreUpdate) onScoreUpdate(finalScore);
            if (onGameOver) {
                onGameOver({
                    score: finalScore,
                    wpm: finalWpm,
                    accuracy: acc,
                    metadata: { language: currentSnippet.language, characters: targetCode.length }
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider game-tech-badge flex items-center gap-1">
                            <Keyboard size={12} /> {currentSnippet.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Snippet {snippetIdx + 1} of {CODE_SNIPPETS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentSnippet.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Practice authentic syntax, indentation, and developer muscle memory.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Speed</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{wpm} WPM</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Accuracy</span>
                        <span className="text-base font-black text-amber-600 dark:text-amber-400">{accuracy}%</span>
                    </div>
                </div>
            </div>

            {/* Syntax Reference Code Display with live character highlights */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative p-5 rounded-2xl bg-[var(--muted-bg)] font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto select-none cursor-text border border-[var(--card-border)] min-h-[160px] shadow-xs"
            >
                <pre className="whitespace-pre">
                    {targetCode.split('').map((char, i) => {
                        let color = 'text-stone-400 dark:text-stone-500';
                        let isCurrent = i === typed.length;

                        if (i < typed.length) {
                            color = typed[i] === char ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 font-semibold' : 'text-rose-700 dark:text-rose-400 bg-rose-500/20 font-bold';
                        }

                        return (
                            <span key={i} className={`${color} ${isCurrent ? 'border-b-2 border-indigo-400 animate-pulse' : ''}`}>
                                {char}
                            </span>
                        );
                    })}
                </pre>
            </div>

            {/* Input textarea */}
            <textarea
                ref={inputRef}
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                rows={3}
                placeholder="Type the exact code above with indentation..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-indigo-500 transition-all resize-none shadow-xs"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />

            {isFinished && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Code Snippet Typed Flawlessly!</p>
                            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                                Speed: <strong>{wpm} WPM</strong> | Accuracy: <strong>{accuracy}%</strong>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSnippetIdx(prev => (prev + 1) % CODE_SNIPPETS.length)}
                        className="game-btn-primary"
                    >
                        Next Snippet
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {targetCode.length} characters
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        setWpm(0);
                        inputRef.current?.focus();
                    }}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset Snippet
                </button>
            </div>
        </div>
    );
};

export default CodeTypingEngine;
