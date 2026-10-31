import React, { useState, useEffect, useRef } from 'react';
import { Hash, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

const SYMBOL_DRILLS = [
    {
        id: 'stx_1',
        title: 'Arrow Function & Return',
        syntax: 'const add = (a, b) => { return a + b; };'
    },
    {
        id: 'stx_2',
        title: 'Logical Nullish Coalescing',
        syntax: 'const { id, tags = [] } = response?.data ?? {};'
    },
    {
        id: 'stx_3',
        title: 'Conditional Logical Operators',
        syntax: 'if (x !== null && (arr[0] || str.length === 0)) { ... }'
    },
    {
        id: 'stx_4',
        title: 'Destructured Export Config',
        syntax: 'export default async function handler(req, res) { try { ... } }'
    }
];

export const SyntaxTypingEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [drillIdx, setDrillIdx] = useState(0);
    const [typed, setTyped] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    const inputRef = useRef(null);
    const drill = SYMBOL_DRILLS[drillIdx];
    const target = drill.syntax;

    useEffect(() => {
        setTyped('');
        setStartTime(null);
        setIsFinished(false);
        if (inputRef.current) inputRef.current.focus();
    }, [drillIdx]);

    const handleChange = (e) => {
        if (isFinished || isPaused) return;
        const val = e.target.value;

        if (!startTime && val.length > 0) {
            setStartTime(Date.now());
        }

        setTyped(val);

        if (val.length >= target.length) {
            setIsFinished(true);
            const elapsedMins = (Date.now() - (startTime || Date.now())) / 60000;
            const finalScore = score + 200;
            setScore(finalScore);
            if (onScoreUpdate) onScoreUpdate(finalScore);

            if (drillIdx + 1 >= SYMBOL_DRILLS.length) {
                if (onGameOver) {
                    onGameOver({
                        score: finalScore,
                        accuracy: 100,
                        metadata: { drillsCompleted: SYMBOL_DRILLS.length }
                    });
                }
            }
        }
    };

    const handleNext = () => {
        if (drillIdx + 1 < SYMBOL_DRILLS.length) {
            setDrillIdx(prev => prev + 1);
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                            <Hash size={12} /> Symbol Drills
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Drill {drillIdx + 1} of {SYMBOL_DRILLS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{drill.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Drill tricky brackets, braces, arrows, and punctuation marks.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-cyan-400">{score} pts</span>
                </div>
            </div>

            {/* Target Syntax */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative p-5 rounded-2xl bg-slate-950 font-mono text-sm sm:text-base leading-relaxed tracking-wider select-none cursor-text border border-white/10 min-h-[100px] shadow-inner"
            >
                {target.split('').map((char, i) => {
                    let color = 'text-slate-500';
                    let isCurrent = i === typed.length;

                    if (i < typed.length) {
                        color = typed[i] === char ? 'text-cyan-400 bg-cyan-950/40' : 'text-rose-400 bg-rose-950/60 font-bold';
                    }

                    return (
                        <span key={i} className={`${color} ${isCurrent ? 'border-b-2 border-cyan-400 animate-pulse' : ''}`}>
                            {char}
                        </span>
                    );
                })}
            </div>

            {/* Input Field */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isFinished || isPaused}
                placeholder="Type the exact symbols above..."
                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-cyan-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
            />

            {isFinished && (
                <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-cyan-400 shrink-0" />
                        <div>
                            <p className="font-black text-sm">Drill Completed! (+200 pts)</p>
                            <p className="text-xs text-cyan-300/80 mt-0.5">Accurate keyboard muscle memory locked in.</p>
                        </div>
                    </div>
                    {drillIdx + 1 < SYMBOL_DRILLS.length && (
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:bg-cyan-400 cursor-pointer flex items-center gap-1"
                        >
                            Next Drill <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Progress: {typed.length} / {target.length} symbols
                </span>
                <button
                    onClick={() => {
                        setTyped('');
                        setStartTime(null);
                        inputRef.current?.focus();
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Retry Drill
                </button>
            </div>
        </div>
    );
};

export default SyntaxTypingEngine;
