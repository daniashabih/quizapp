import React, { useState, useEffect } from 'react';
import { Shuffle, ArrowUp, ArrowDown, CheckCircle2, XCircle, Sparkles, RotateCcw } from 'lucide-react';

const SCRAMBLE_SETS = [
    {
        id: 'cs_1',
        title: 'JavaScript Async Fetch Pipeline',
        language: 'javascript',
        difficulty: 'Beginner',
        statements: [
            'return data;',
            'const res = await fetch("/api/data");',
            'const data = await res.json();',
            'if (!res.ok) throw new Error("HTTP " + res.status);'
        ],
        solution: [
            'const res = await fetch("/api/data");',
            'if (!res.ok) throw new Error("HTTP " + res.status);',
            'const data = await res.json();',
            'return data;'
        ],
        explanation: 'The request is dispatched first, HTTP response status is verified, the JSON body stream is parsed, and finally the resulting object is returned.'
    },
    {
        id: 'cs_2',
        title: 'Python File Context Manager',
        language: 'python',
        difficulty: 'Intermediate',
        statements: [
            'lines = file.readlines()',
            'print(f"Processed {len(clean)} entries")',
            'with open("audit.log", "r") as file:',
            'clean = [l.strip() for l in lines]'
        ],
        solution: [
            'with open("audit.log", "r") as file:',
            'lines = file.readlines()',
            'clean = [l.strip() for l in lines]',
            'print(f"Processed {len(clean)} entries")'
        ],
        explanation: 'Open context manager handles opening and automatic closing, readlines reads into list, list comprehension cleans whitespace, and total count is logged.'
    },
    {
        id: 'cs_3',
        title: 'Binary Search Step Sequence',
        language: 'javascript',
        difficulty: 'Advanced',
        statements: [
            'if (arr[mid] < target) low = mid + 1;',
            'let low = 0, high = arr.length - 1;',
            'const mid = Math.floor((low + high) / 2);',
            'while (low <= high) {',
            'if (arr[mid] === target) return mid;'
        ],
        solution: [
            'let low = 0, high = arr.length - 1;',
            'while (low <= high) {',
            'const mid = Math.floor((low + high) / 2);',
            'if (arr[mid] === target) return mid;',
            'if (arr[mid] < target) low = mid + 1;'
        ],
        explanation: 'Pointers are initialized, while loop guards the boundary, mid point is computed, equality checked, and pointer narrowed.'
    }
];

export const CodeScrambleEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [scrambleIdx, setScrambleIdx] = useState(0);
    const [statements, setStatements] = useState([]);
    const [status, setStatus] = useState(null);
    const [score, setScore] = useState(0);

    const challenge = SCRAMBLE_SETS[scrambleIdx];

    useEffect(() => {
        const shuffled = [...challenge.statements].sort(() => Math.random() - 0.5);
        setStatements(shuffled);
        setStatus(null);
    }, [scrambleIdx]);

    const moveStatement = (fromIdx, toIdx) => {
        if (toIdx < 0 || toIdx >= statements.length || isPaused || status === 'correct') return;
        const copy = [...statements];
        const [moved] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, moved);
        setStatements(copy);
        setStatus(null);
    };

    const handleCheck = () => {
        if (isPaused) return;
        const isMatch = statements.every((s, i) => s === challenge.solution[i]);

        if (isMatch) {
            setStatus('correct');
            const newScore = score + 220;
            setScore(newScore);
            if (onScoreUpdate) onScoreUpdate(newScore);

            setTimeout(() => {
                if (scrambleIdx + 1 < SCRAMBLE_SETS.length) {
                    setScrambleIdx(prev => prev + 1);
                } else {
                    if (onGameOver) {
                        onGameOver({
                            score: newScore,
                            accuracy: 100,
                            metadata: { scramblesCompleted: SCRAMBLE_SETS.length }
                        });
                    }
                }
            }, 1800);
        } else {
            setStatus('incorrect');
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            {challenge.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Scramble {scrambleIdx + 1} of {SCRAMBLE_SETS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Order statements into the correct executable algorithm sequence.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-cyan-400">{score} pts</span>
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
                {statements.map((stmt, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border font-mono text-xs sm:text-sm transition-all ${
                            status === 'correct'
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                                : status === 'incorrect'
                                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                                : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)]'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-x-auto">
                            <span className="text-[11px] font-bold text-[var(--foreground-muted)] w-5 text-right select-none">
                                {idx + 1}.
                            </span>
                            <pre className="whitespace-pre font-mono">{stmt}</pre>
                        </div>

                        <div className="flex items-center gap-1 ml-2 select-none">
                            <button
                                onClick={() => moveStatement(idx, idx - 1)}
                                disabled={idx === 0 || isPaused || status === 'correct'}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-cyan-500/20 text-[var(--foreground-muted)] hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={() => moveStatement(idx, idx + 1)}
                                disabled={idx === statements.length - 1 || isPaused || status === 'correct'}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-cyan-500/20 text-[var(--foreground-muted)] hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                                <ArrowDown size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {status === 'correct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm">Sequence Reconstructed! (+220 pts)</p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">{challenge.explanation}</p>
                    </div>
                </div>
            )}

            {status === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center gap-3">
                    <XCircle size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm">Incorrect Sequence.</p>
                        <p className="text-xs text-rose-300/80 mt-0.5">Trace the inputs, conditional branches, and return points.</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => {
                        setStatements([...challenge.statements].sort(() => Math.random() - 0.5));
                        setStatus(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Re-shuffle
                </button>

                <button
                    onClick={handleCheck}
                    disabled={isPaused || status === 'correct'}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                    <Sparkles size={14} /> Verify Sequence
                </button>
            </div>
        </div>
    );
};

export default CodeScrambleEngine;
