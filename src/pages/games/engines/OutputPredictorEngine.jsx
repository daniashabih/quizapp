import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, ArrowRight, Sparkles, Play, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_PREDICTOR_CHALLENGES = [
    {
        id: 'op_1',
        title: 'Asynchronous Closure with Var',
        language: 'javascript',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Intermediate',
        code: `for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 10);
}`,
        options: [
            '0, 1, 2',
            '3, 3, 3',
            'undefined, undefined, undefined',
            '0, 0, 0'
        ],
        solution: '3, 3, 3',
        explanation: 'Because `var` is function-scoped rather than block-scoped, all timeouts reference the same mutable variable `i`. By the time the event loop executes the callbacks after 10ms, the loop has terminated and `i` equals 3.'
    },
    {
        id: 'op_2',
        title: 'Python Mutable Reference Assignment',
        language: 'python',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Beginner',
        code: `a = [1, 2, 3]
b = a
b.append(4)
print(len(a))`,
        options: [
            '3',
            '4',
            'TypeError',
            'None'
        ],
        solution: '4',
        explanation: 'In Python, assigning `b = a` creates a new reference to the same underlying list in memory. Calling `b.append(4)` mutates that shared object, so `len(a)` also becomes 4.'
    },
    {
        id: 'op_3',
        title: 'JavaScript Type Coercion Math',
        language: 'javascript',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Beginner',
        code: `const result = "5" - 2 + "3";
console.log(result);`,
        options: [
            '"33"',
            '6',
            '"523"',
            'NaN'
        ],
        solution: '"33"',
        explanation: 'The subtraction operator `-` coerces `"5"` into numeric 5, yielding 3. Then, the addition operator `+` with string `"3"` coerces 3 into `"3"` and concatenates, resulting in `"33"`.'
    },
    {
        id: 'op_4',
        title: 'SQL Left Join Row Count',
        language: 'sql',
        technology: 'sql',
        technologyName: 'SQL',
        difficulty: 'Intermediate',
        code: `-- Users: 3 rows | Orders: 0 rows
SELECT u.name, o.order_id
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;`,
        options: [
            '3 rows with NULL for o.order_id',
            '0 rows',
            'Error: Empty table join',
            '1 row'
        ],
        solution: '3 rows with NULL for o.order_id',
        explanation: 'A LEFT JOIN always retains all rows from the left table (`users`). Even if the right table (`orders`) has zero matching records, all 3 user rows are returned with NULL for order columns.'
    }
];

export const OutputPredictorEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [challenges, setChallenges] = useState(FALLBACK_PREDICTOR_CHALLENGES);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Fetch technology challenges
    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('output-predictor', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => ({
                        ...item,
                        code: item.code || item.content || '// Code snippet',
                        options: Array.isArray(item.options) && item.options.length > 0
                            ? item.options
                            : ['Output A', 'Output B', 'Output C', 'Output D'],
                        explanation: item.explanation || 'Code execution traces to this specific result.'
                    }));

                    if (isMounted) {
                        setChallenges(parsed);
                        setChallengeIdx(0);
                        setSelectedOption(null);
                        setIsSubmitted(false);
                        setVerificationResult(null);
                    }
                } else if (technology && technology !== 'all') {
                    const filtered = FALLBACK_PREDICTOR_CHALLENGES.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setChallenges(filtered);
                        setChallengeIdx(0);
                    }
                }
            } catch (err) {
                console.warn('[OutputPredictor] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const challenge = challenges[challengeIdx] || FALLBACK_PREDICTOR_CHALLENGES[0];

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
            const res = await gameService.verifyChallenge('output-predictor', challenge.id, selectedOption);
            if (res && typeof res.isCorrect === 'boolean') {
                isMatch = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
            } else if (challenge.solution) {
                isMatch = String(selectedOption).trim().toLowerCase() === String(challenge.solution).trim().toLowerCase();
            }
        } catch {
            isMatch = challenge.solution ? (String(selectedOption).trim().toLowerCase() === String(challenge.solution).trim().toLowerCase()) : false;
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
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'technology'} predictor challenges...</p>
            </div>
        );
    }

    const isCorrect = verificationResult ? verificationResult.isMatch : (selectedOption === challenge.solution);

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge">
                            <Terminal size={12} /> {challenge.technologyName || challenge.language || 'Code'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {challenge.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Predictor {challengeIdx + 1} of {challenges.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Trace the logic and predict the terminal output before running.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] font-mono text-xs sm:text-sm shadow-xs">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--card-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 font-mono font-semibold text-[var(--foreground)]">
                        snippet.{challenge.language === 'python' ? 'py' : challenge.language === 'sql' ? 'sql' : challenge.language === 'php' ? 'php' : 'js'}
                    </span>
                </div>
                <div className="p-4 overflow-x-auto text-[var(--foreground)] leading-relaxed font-mono font-medium">
                    <pre className="whitespace-pre">{challenge.code}</pre>
                </div>
            </div>

            {/* Options Grid */}
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                    Select Expected Output:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {challenge.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt;
                        const isWrongSelection = isSubmitted && isSelected && !isCorrect;
                        const isVerifiedCorrect = isSubmitted && isSelected && isCorrect;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(opt)}
                                disabled={isSubmitted || isPaused || isValidating}
                                className={`p-3.5 rounded-2xl border font-mono text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between ${
                                    isVerifiedCorrect
                                        ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold'
                                        : isWrongSelection
                                        ? 'bg-rose-500/15 border-rose-500/60 text-rose-800 dark:text-rose-200'
                                        : isSelected
                                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-800 dark:text-indigo-200 font-bold'
                                        : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/30'
                                }`}
                            >
                                <span>{opt}</span>
                                {isVerifiedCorrect && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                {isWrongSelection && <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback & Execution Step Breakdown */}
            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={18} className="text-rose-600 dark:text-rose-400" />}
                        <span className="text-[var(--foreground)] font-black">
                            {isCorrect ? `Correct Prediction! (+${challenge.points || 200} pts)` : 'Incorrect Prediction'}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
                        {verificationResult?.explanation || challenge.explanation}
                    </p>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)] font-medium">
                    {selectedOption ? `Selected: ${selectedOption}` : 'Choose an output'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption || isPaused || isValidating}
                        className="game-btn-primary"
                    >
                        {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="fill-white" />}
                        Verify Output
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="game-btn-primary"
                    >
                        Next Snippet <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default OutputPredictorEngine;
