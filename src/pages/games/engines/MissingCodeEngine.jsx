import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';

const MISSING_CODE_CHALLENGES = [
    {
        id: 'mc_1',
        title: 'Promise All Settlement',
        language: 'javascript',
        difficulty: 'Beginner',
        codeBefore: `async function loadData() {\n    const [users, posts] = await Promise.`,
        blank: 'all',
        codeAfter: `([\n        fetchUsers(),\n        fetchPosts()\n    ]);\n    return { users, posts };\n}`,
        options: ['all', 'race', 'any', 'resolve'],
        explanation: '`Promise.all` accepts an iterable of promises and fulfills only when all of the input promises have fulfilled.'
    },
    {
        id: 'mc_2',
        title: 'Python List Comprehension Filtering',
        language: 'python',
        difficulty: 'Beginner',
        codeBefore: `numbers = [1, 2, 3, 4, 5, 6]\nevens = [n for n in numbers `,
        blank: 'if',
        codeAfter: ` n % 2 == 0]\nprint(evens)`,
        options: ['if', 'where', 'filter', 'when'],
        explanation: 'In Python, the `if` keyword filters items in a list comprehension: `[expr for item in iterable if condition]`.'
    },
    {
        id: 'mc_3',
        title: 'SQL Aggregate Group Filtering',
        language: 'sql',
        difficulty: 'Intermediate',
        codeBefore: `SELECT department, COUNT(*)\nFROM employees\nGROUP BY department\n`,
        blank: 'HAVING',
        codeAfter: ` COUNT(*) >= 5;`,
        options: ['HAVING', 'WHERE', 'LIMIT', 'FILTER'],
        explanation: '`HAVING` filters rows AFTER aggregation has occurred, whereas `WHERE` filters rows BEFORE aggregation.'
    },
    {
        id: 'mc_4',
        title: 'React Stateful Counter Hook',
        language: 'javascript',
        difficulty: 'Beginner',
        codeBefore: `import React, { `,
        blank: 'useState',
        codeAfter: ` } from 'react';\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}`,
        options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
        explanation: '`useState` is the core React hook that declares local state variables that persist across re-renders.'
    }
];

export const MissingCodeEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const challenge = MISSING_CODE_CHALLENGES[challengeIdx];

    const handleSelect = (opt) => {
        if (isSubmitted || isPaused) return;
        setSelectedOption(opt);
    };

    const handleSubmit = () => {
        if (!selectedOption || isSubmitted || isPaused) return;

        setIsSubmitted(true);
        const isMatch = selectedOption === challenge.blank;

        let newScore = score;
        if (isMatch) {
            newScore = score + 200;
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (challengeIdx + 1 < MISSING_CODE_CHALLENGES.length) {
            setChallengeIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: Math.round(((correctCount + (selectedOption === challenge.blank ? 1 : 0)) / MISSING_CODE_CHALLENGES.length) * 100),
                    metadata: { challengesCompleted: MISSING_CODE_CHALLENGES.length }
                });
            }
        }
    };

    const isCorrect = selectedOption === challenge.blank;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {challenge.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Challenge {challengeIdx + 1} of {MISSING_CODE_CHALLENGES.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Fill in the missing token to complete working code.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-400">{score} pts</span>
                </div>
            </div>

            {/* Incomplete Code Preview */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-slate-950 font-mono text-xs sm:text-sm p-4 text-slate-200 leading-relaxed shadow-inner">
                <pre className="whitespace-pre overflow-x-auto">
                    {challenge.codeBefore}
                    <span className={`inline-block px-2.5 py-0.5 mx-1 rounded-md border font-black ${
                        isSubmitted
                            ? isCorrect
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                : 'bg-rose-500/30 border-rose-400 text-rose-300'
                            : selectedOption
                            ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                            : 'bg-emerald-400/20 border-emerald-400/40 text-emerald-300 border-dashed animate-pulse'
                    }`}>
                        {selectedOption || '_____'}
                    </span>
                    {challenge.codeAfter}
                </pre>
            </div>

            {/* Token Options */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Select Missing Keyword or Token:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {challenge.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const isAnswer = isSubmitted && opt === challenge.blank;
                        const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(opt)}
                                disabled={isSubmitted || isPaused}
                                className={`p-3 rounded-2xl border font-mono text-xs sm:text-sm text-center font-bold transition-all cursor-pointer ${
                                    isAnswer
                                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                        : isWrongSelection
                                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                                        : isSelected
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                        : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-emerald-500/30'
                                }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>

            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Syntax Restored! (+200 pts)' : `Incorrect Token (Correct: ${challenge.blank})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                        {challenge.explanation}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    {selectedOption ? `Token: ${selectedOption}` : 'Pick a token'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption || isPaused}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Sparkles size={14} /> Submit Answer
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

export default MissingCodeEngine;
