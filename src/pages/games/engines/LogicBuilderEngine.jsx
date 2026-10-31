import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

const LOGIC_PROBLEMS = [
    {
        id: 'lb_1',
        title: 'Alternating Sequence Pattern',
        difficulty: 'Easy',
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
        difficulty: 'Medium',
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
        difficulty: 'Hard',
        description: 'Predict the element at index 1 after 14 circular right-shifts on array of length 5.',
        prompt: 'Array: [10, 20, 30, 40, 50] shifted right by 14 positions. What is element at index 0?',
        options: ['20', '30', '40', '50'],
        solution: '20',
        hint: '14 shifts modulo 5 equals 4 effective right-shifts (or 1 left-shift).',
        explanation: 'Shift count = 14 % 5 = 4 right shifts. The original array [10, 20, 30, 40, 50] shifted 4 places right becomes [20, 30, 40, 50, 10]. Index 0 is 20.'
    }
];

export const LogicBuilderEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [problemIdx, setProblemIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const problem = LOGIC_PROBLEMS[problemIdx];

    const handleSelect = (opt) => {
        if (isSubmitted || isPaused) return;
        setSelectedOption(opt);
    };

    const handleSubmit = () => {
        if (!selectedOption || isSubmitted || isPaused) return;

        setIsSubmitted(true);
        const isMatch = selectedOption === problem.solution;

        let newScore = score;
        if (isMatch) {
            const points = problem.difficulty === 'Hard' ? 300 : problem.difficulty === 'Medium' ? 200 : 100;
            newScore = score + points;
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (problemIdx + 1 < LOGIC_PROBLEMS.length) {
            setProblemIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
            setShowHint(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: Math.round(((correctCount + (selectedOption === problem.solution ? 1 : 0)) / LOGIC_PROBLEMS.length) * 100),
                    metadata: { problemsSolved: LOGIC_PROBLEMS.length }
                });
            }
        }
    };

    const isCorrect = selectedOption === problem.solution;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            <Cpu size={12} /> {problem.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Problem {problemIdx + 1} of {LOGIC_PROBLEMS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{problem.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{problem.description}</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-purple-400">{score} pts</span>
                </div>
            </div>

            {/* Prompt Box */}
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-purple-100 flex flex-col gap-2 shadow-inner">
                <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-bold">Logic Problem:</span>
                <p className="text-base sm:text-lg font-mono font-bold text-white">{problem.prompt}</p>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                        <Lightbulb size={13} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                </div>
                {showHint && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                        💡 {problem.hint}
                    </div>
                )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-2 gap-3">
                {problem.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    const isAnswer = isSubmitted && opt === problem.solution;
                    const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            disabled={isSubmitted || isPaused}
                            className={`p-4 rounded-2xl border font-mono text-sm sm:text-base text-center font-bold transition-all cursor-pointer ${
                                isAnswer
                                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                    : isWrongSelection
                                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                                    : isSelected
                                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                                    : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-purple-500/30'
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
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Logic Solved!' : `Incorrect (Expected: ${problem.solution})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                        {problem.explanation}
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
                        disabled={!selectedOption || isPaused}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Sparkles size={14} /> Submit Solution
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
                    >
                        Next Problem <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default LogicBuilderEngine;
