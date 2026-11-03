import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_MISSING_CODE_CHALLENGES = [
    {
        id: 'mc_1',
        title: 'Promise All Settlement',
        language: 'javascript',
        technology: 'javascript',
        technologyName: 'JavaScript',
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
        technology: 'python',
        technologyName: 'Python',
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
        technology: 'sql',
        technologyName: 'SQL',
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
        technology: 'react',
        technologyName: 'React.js',
        difficulty: 'Beginner',
        codeBefore: `import React, { `,
        blank: 'useState',
        codeAfter: ` } from 'react';\n\nfunction Counter() {\n    const [count, setCount] = useState(0);\n    return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}`,
        options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
        explanation: '`useState` is the core React hook that declares local state variables that persist across re-renders.'
    }
];

export const MissingCodeEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [challenges, setChallenges] = useState(FALLBACK_MISSING_CODE_CHALLENGES);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('missing-code', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => {
                        let codeBefore = item.codeBefore || '';
                        let codeAfter = item.codeAfter || '';
                        const content = item.content || '';

                        if (!codeBefore && !codeAfter && content.includes('_____')) {
                            const parts = content.split('_____');
                            codeBefore = parts[0] || '';
                            codeAfter = parts.slice(1).join('_____') || '';
                        }

                        return {
                            ...item,
                            codeBefore,
                            codeAfter,
                            blank: item.blank || item.solution || '',
                            options: Array.isArray(item.options) && item.options.length > 0
                                ? item.options
                                : ['token_a', 'token_b', 'token_c', 'token_d'],
                            explanation: item.explanation || 'Supplying the proper keyword restores syntax and semantic meaning.'
                        };
                    });

                    if (isMounted) {
                        setChallenges(parsed);
                        setChallengeIdx(0);
                        setSelectedOption(null);
                        setIsSubmitted(false);
                        setVerificationResult(null);
                    }
                } else if (technology && technology !== 'all') {
                    const filtered = FALLBACK_MISSING_CODE_CHALLENGES.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setChallenges(filtered);
                        setChallengeIdx(0);
                    }
                }
            } catch (err) {
                console.warn('[MissingCode] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const challenge = challenges[challengeIdx] || FALLBACK_MISSING_CODE_CHALLENGES[0];

    const handleSelect = (opt) => {
        if (isSubmitted || isPaused || isValidating) return;
        setSelectedOption(opt);
    };

    const handleSubmit = async () => {
        if (!selectedOption || isSubmitted || isPaused || isValidating) return;

        setIsValidating(true);
        let isMatch = false;
        let explanation = challenge.explanation;

        try {
            const res = await gameService.verifyChallenge('missing-code', challenge.id, selectedOption);
            if (res && typeof res.isCorrect === 'boolean') {
                isMatch = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
            } else if (challenge.blank) {
                isMatch = String(selectedOption).trim() === String(challenge.blank).trim();
            }
        } catch {
            isMatch = challenge.blank ? (String(selectedOption).trim() === String(challenge.blank).trim()) : false;
        }

        setVerificationResult({ isMatch, explanation });
        setIsSubmitted(true);
        setIsValidating(false);

        let newScore = score;
        if (isMatch) {
            newScore = score + (challenge.points || 200);
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (challengeIdx + 1 < challenges.length) {
            setChallengeIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setVerificationResult(null);
        } else {
            if (onGameOver) {
                const total = challenges.length;
                const correct = correctCount + (verificationResult?.isMatch ? 1 : 0);
                onGameOver({
                    score,
                    accuracy: Math.round((correct / total) * 100),
                    metadata: { challengesCompleted: total, correctCount: correct, technology }
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-3xl mx-auto w-full">
                <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'technology'} syntax gaps...</p>
            </div>
        );
    }

    const isCorrect = verificationResult ? verificationResult.isMatch : (selectedOption === challenge.blank);

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge">
                            <HelpCircle size={12} /> {challenge.technologyName || challenge.language || 'Code'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {challenge.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Challenge {challengeIdx + 1} of {challenges.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Fill in the missing token to complete working code.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                </div>
            </div>

            {/* Incomplete Code Preview */}
            <div className="game-code-container rounded-2xl overflow-hidden font-mono text-xs sm:text-sm p-4 leading-relaxed shadow-xs">
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
                        const isAnswer = isSubmitted && isSelected && isCorrect;
                        const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(opt)}
                                disabled={isSubmitted || isPaused || isValidating}
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
                        <span>{isCorrect ? `Syntax Restored! (+${challenge.points || 200} pts)` : `Incorrect Token (Correct: ${challenge.blank || 'Specified keyword'})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
                        {verificationResult?.explanation || challenge.explanation}
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
                        disabled={!selectedOption || isPaused || isValidating}
                        className="game-btn-primary"
                    >
                        {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Submit Answer
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
