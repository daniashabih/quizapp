import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_LOGIC_PROBLEMS = [
    {
        id: 'lb_1',
        title: 'Alternating Sequence Pattern',
        difficulty: 'Beginner',
        technology: 'programming-logic',
        technologyName: 'Programming Logic',
        description: 'Deduce the algorithmic rule and calculate the next integer.',
        prompt: 'Given sequence: 2, 4, 8, 10, 20, 22, 44, ___',
        options: ['46', '88', '50', '48'],
        solution: '46',
        hint: 'Observe the alternating pattern of (+2) and (*2).',
        explanation: 'The pattern alternates: 2(+2)=4, 4(*2)=8, 8(+2)=10, 10(*2)=20, 20(+2)=22, 22(*2)=44, and finally 44(+2)=46.'
    },
    {
        id: 'lb_2',
        title: 'Boolean Logic Simplification',
        difficulty: 'Intermediate',
        technology: 'programming-logic',
        technologyName: 'Programming Logic',
        description: 'Evaluate the logical statement for inputs A=true, B=false, C=true.',
        prompt: 'Expression: (A && !B) || (B && C)',
        options: ['true', 'false', 'undefined', 'null'],
        solution: 'true',
        hint: '!B evaluates to true, so A && !B is true && true.',
        explanation: 'Left operand: (true && !false) = (true && true) = true. Since the left side of the OR operator is true, short-circuit evaluation yields true.'
    },
    {
        id: 'lb_3',
        title: 'Cyclic Array Shift Bounds',
        difficulty: 'Advanced',
        technology: 'dsa',
        technologyName: 'Data Structures & Algorithms',
        description: 'Predict the element at index 1 after 14 circular right-shifts on array of length 5.',
        prompt: 'Array: [10, 20, 30, 40, 50] shifted right by 14 positions. What is element at index 0?',
        options: ['20', '30', '40', '50'],
        solution: '20',
        hint: '14 shifts modulo 5 equals 4 effective right-shifts (or 1 left-shift).',
        explanation: 'Shift count = 14 % 5 = 4 right shifts. The original array [10, 20, 30, 40, 50] shifted 4 places right becomes [20, 30, 40, 50, 10]. Index 0 is 20.'
    }
];

export const LogicBuilderEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [problems, setProblems] = useState(FALLBACK_LOGIC_PROBLEMS);
    const [problemIdx, setProblemIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('logic-builder', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => ({
                        ...item,
                        prompt: item.prompt || item.description || item.content || 'Solve the logical condition.',
                        options: Array.isArray(item.options) && item.options.length > 0
                            ? item.options
                            : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
                        hint: item.hints || item.hint || 'Evaluate the operator precedence and branch condition.',
                        explanation: item.explanation || 'Logical rule deduced.'
                    }));

                    if (isMounted) {
                        setProblems(parsed);
                        setProblemIdx(0);
                        setSelectedOption(null);
                        setIsSubmitted(false);
                    }
                } else if (technology && technology !== 'all') {
                    const filtered = FALLBACK_LOGIC_PROBLEMS.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setProblems(filtered);
                        setProblemIdx(0);
                    }
                }
            } catch (err) {
                console.warn('[LogicBuilder] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const problem = problems[problemIdx] || FALLBACK_LOGIC_PROBLEMS[0];

    const handleSelect = (opt) => {
        if (isSubmitted || isPaused || isValidating) return;
        setSelectedOption(opt);
    };

    const handleSubmit = async () => {
        if (!selectedOption || isSubmitted || isPaused || isValidating) return;

        setIsValidating(true);
        let isMatch = false;
        let explanation = problem.explanation;

        try {
            const res = await gameService.verifyChallenge('logic-builder', problem.id, selectedOption);
            if (res && typeof res.isCorrect === 'boolean') {
                isMatch = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
            } else if (problem.solution) {
                isMatch = String(selectedOption).trim().toLowerCase() === String(problem.solution).trim().toLowerCase();
            }
        } catch {
            isMatch = problem.solution ? (String(selectedOption).trim().toLowerCase() === String(problem.solution).trim().toLowerCase()) : false;
        }

        setVerificationResult({ isMatch, explanation });
        setIsSubmitted(true);
        setIsValidating(false);

        let newScore = score;
        if (isMatch) {
            const points = problem.points || (problem.difficulty === 'Advanced' ? 300 : problem.difficulty === 'Intermediate' ? 200 : 100);
            newScore = score + points;
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (problemIdx + 1 < problems.length) {
            setProblemIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setVerificationResult(null);
            setShowHint(false);
        } else {
            if (onGameOver) {
                const total = problems.length;
                const correct = correctCount + (verificationResult?.isMatch ? 1 : 0);
                onGameOver({
                    score,
                    accuracy: Math.round((correct / total) * 100),
                    metadata: { problemsSolved: total, correctCount: correct, technology }
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-3xl mx-auto w-full">
                <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'logic'} reasoning problems...</p>
            </div>
        );
    }

    const isCorrect = verificationResult ? verificationResult.isMatch : (selectedOption === problem.solution);

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge flex items-center gap-1">
                            <Cpu size={12} /> {problem.technologyName || problem.language || 'Logic'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {problem.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Problem {problemIdx + 1} of {problems.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{problem.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{problem.description}</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-black">{score} pts</span>
                </div>
            </div>

            {/* Prompt Box */}
            <div className="p-5 rounded-2xl bg-[var(--game-hint-bg)] border border-[var(--game-hint-border)] text-[var(--game-hint-text)] flex flex-col gap-2 shadow-xs">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[var(--game-hint-text)]">Logic Problem:</span>
                <p className="text-base sm:text-lg font-mono font-bold text-[var(--foreground)]">{problem.prompt}</p>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-[var(--game-hint-btn)] hover:opacity-80 flex items-center gap-1 cursor-pointer"
                    >
                        <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                </div>
                {showHint && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                        💡 {problem.hint}
                    </div>
                )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
                {problem.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isAnswer = isSubmitted && isSelected && isCorrect;
                    const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            disabled={isSubmitted || isPaused || isValidating}
                            className={`p-4 rounded-2xl border font-mono text-sm sm:text-base text-center font-bold transition-all cursor-pointer ${
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

            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Logic Solved!' : `Incorrect (Expected: ${problem.solution || 'Specified solution'})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
                        {verificationResult?.explanation || problem.explanation}
                    </p>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    {selectedOption ? `Selection: ${selectedOption}` : 'Pick an answer'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption || isPaused || isValidating}
                        className="game-btn-primary"
                    >
                        {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Submit Solution
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="game-btn-primary"
                    >
                        Next Problem <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default LogicBuilderEngine;
