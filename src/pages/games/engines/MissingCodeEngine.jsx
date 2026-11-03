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
                        <span className="text-xs font-mono font-bold uppercase tracking-wider game-tech-badge">
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
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-black">{score} pts</span>
                </div>
            </div>

            {/* Incomplete Code Preview */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] font-mono text-xs sm:text-sm p-4 text-[var(--foreground)] leading-relaxed shadow-xs">
                <pre className="whitespace-pre overflow-x-auto">
                    {challenge.codeBefore}
                    <span className={`inline-block px-2.5 py-0.5 mx-1 rounded-md border font-black ${
                        isSubmitted
                            ? isCorrect
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                                : 'bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 font-bold'
                            : selectedOption
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold'
                            : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 border-dashed animate-pulse font-bold'
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
                                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold'
                                        : isWrongSelection
                                        ? 'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200'
                                        : isSelected
                                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-bold'
                                        : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/40'
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
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Syntax Restored! (+200 pts)' : `Incorrect Token (Correct: ${challenge.blank})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
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
                        className="game-btn-primary"
                    >
                        <Sparkles size={14} /> Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="game-btn-primary"
                    >
                        Next Challenge <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MissingCodeEngine;
