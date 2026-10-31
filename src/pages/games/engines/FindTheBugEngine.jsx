import React, { useState } from 'react';
import { Bug, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, AlertTriangle } from 'lucide-react';

const BUG_CHALLENGES = [
    {
        id: 'ftb_1',
        title: 'Off-By-One Array Bound',
        language: 'javascript',
        category: 'Logic Error',
        difficulty: 'Beginner',
        code: [
            'function sumArray(numbers) {',
            '    let total = 0;',
            '    for (let i = 0; i <= numbers.length; i++) {',
            '        total += numbers[i];',
            '    }',
            '    return total;',
            '}'
        ],
        bugLine: 3, // 1-indexed line number
        fix: 'for (let i = 0; i < numbers.length; i++) {',
        explanation: 'Line 3 uses `i <= numbers.length`. Since JS arrays are 0-indexed, `numbers[numbers.length]` evaluates to `undefined`, which yields NaN when added to total.'
    },
    {
        id: 'ftb_2',
        title: 'Mutable Default Argument',
        language: 'python',
        category: 'Reference Bug',
        difficulty: 'Intermediate',
        code: [
            'def register_user(username, roles=[]):',
            '    roles.append("member")',
            '    return {"user": username, "roles": roles}',
            '',
            'u1 = register_user("alice")',
            'u2 = register_user("bob")'
        ],
        bugLine: 1,
        fix: 'def register_user(username, roles=None): if roles is None: roles = []',
        explanation: 'Line 1 uses a mutable list `roles=[]` as a default parameter. In Python, default arguments are evaluated once at function definition time, sharing the same list across all calls.'
    },
    {
        id: 'ftb_3',
        title: 'Unaggregated Non-Grouped Column',
        language: 'sql',
        category: 'Syntax / Semantic Error',
        difficulty: 'Intermediate',
        code: [
            'SELECT department, role, COUNT(*)',
            'FROM staff',
            'WHERE is_active = true',
            'GROUP BY department;',
            ''
        ],
        bugLine: 4,
        fix: 'GROUP BY department, role;',
        explanation: 'Line 4 only groups by `department`, but `role` is included in the SELECT clause without an aggregate function. SQL requires all unaggregated selected columns in GROUP BY.'
    },
    {
        id: 'ftb_4',
        title: 'Loose String Equality Pitfall',
        language: 'php',
        category: 'Type Coercion',
        difficulty: 'Beginner',
        code: [
            'function authenticate($inputHash, $secretHash) {',
            '    if ($inputHash == $secretHash) {',
            '        return "ACCESS_GRANTED";',
            '    }',
            '    return "ACCESS_DENIED";',
            '}'
        ],
        bugLine: 2,
        fix: 'if (hash_equals($secretHash, $inputHash)) {',
        explanation: 'Line 2 uses loose equality `==` which is vulnerable to type juggling and timing attacks. Always use strict `===` or `hash_equals()` for credential tokens in PHP.'
    }
];

export const FindTheBugEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedLine, setSelectedLine] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const currentChallenge = BUG_CHALLENGES[challengeIdx];

    const handleLineClick = (lineNum) => {
        if (isSubmitted || isPaused) return;
        setSelectedLine(lineNum);
    };

    const handleSubmit = () => {
        if (!selectedLine || isSubmitted || isPaused) return;

        setIsSubmitted(true);
        const isCorrect = selectedLine === currentChallenge.bugLine;

        let newScore = score;
        if (isCorrect) {
            newScore = score + 250;
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (challengeIdx + 1 < BUG_CHALLENGES.length) {
            setChallengeIdx(prev => prev + 1);
            setSelectedLine(null);
            setIsSubmitted(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: Math.round(((correctCount + (selectedLine === currentChallenge.bugLine ? 1 : 0)) / BUG_CHALLENGES.length) * 100),
                    metadata: { challengesCompleted: BUG_CHALLENGES.length }
                });
            }
        }
    };

    const isCorrect = selectedLine === currentChallenge.bugLine;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                            <Bug size={12} /> {currentChallenge.language}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {currentChallenge.category}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentChallenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Click the exact line containing the bug.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Challenge</span>
                        <span className="text-sm font-black text-rose-400">{challengeIdx + 1} / {BUG_CHALLENGES.length}</span>
                    </div>
                </div>
            </div>

            {/* Code Inspector Pane */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-slate-950 font-mono text-xs sm:text-sm select-none shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/10 text-slate-400 text-[11px]">
                    <span>source_code.{currentChallenge.language === 'python' ? 'py' : currentChallenge.language === 'sql' ? 'sql' : 'js'}</span>
                    <span className="text-slate-500">Click a line to select</span>
                </div>

                <div className="p-3 divide-y divide-white/5">
                    {currentChallenge.code.map((line, idx) => {
                        const lineNum = idx + 1;
                        const isSelected = selectedLine === lineNum;
                        const isBugLine = isSubmitted && lineNum === currentChallenge.bugLine;
                        const isFalsePick = isSubmitted && isSelected && !isCorrect;

                        return (
                            <div
                                key={lineNum}
                                onClick={() => handleLineClick(lineNum)}
                                className={`flex items-center py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
                                    isBugLine
                                        ? 'bg-rose-500/30 text-rose-200 border border-rose-500/60 font-bold'
                                        : isFalsePick
                                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                        : isSelected
                                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                                        : 'text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                <span className="w-8 shrink-0 text-slate-500 text-right pr-4 select-none text-[11px]">
                                    {lineNum}
                                </span>
                                <pre className="font-mono whitespace-pre overflow-x-auto flex-1">{line}</pre>
                                {isBugLine && (
                                    <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded ml-2 shrink-0">
                                        BUG HERE
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Explanation & Solution upon submission */}
            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Target Locked! Correct Bug Found (+250 pts)' : `Incorrect Line (Bug is on Line ${currentChallenge.bugLine})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                        {currentChallenge.explanation}
                    </p>
                    <div className="mt-1 p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-emerald-300">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Recommended Fix:</span>
                        <code>{currentChallenge.fix}</code>
                    </div>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    {selectedLine ? `Selected Line: ${selectedLine}` : 'No line selected'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedLine || isPaused}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Bug size={14} /> Submit Line
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
                    >
                        Next Challenge <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FindTheBugEngine;
