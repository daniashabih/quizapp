import React, { useState } from 'react';
import { Terminal, CheckCircle2, XCircle, ArrowRight, Sparkles, Play } from 'lucide-react';

const PREDICTOR_CHALLENGES = [
    {
        id: 'op_1',
        title: 'Asynchronous Closure with Var',
        language: 'javascript',
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

export const OutputPredictorEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    const challenge = PREDICTOR_CHALLENGES[challengeIdx];

    const handleSelect = (opt) => {
        if (isSubmitted || isPaused) return;
        setSelectedOption(opt);
    };

    const handleSubmit = () => {
        if (!selectedOption || isSubmitted || isPaused) return;

        setIsSubmitted(true);
        const isMatch = selectedOption === challenge.solution;

        let newScore = score;
        if (isMatch) {
            newScore = score + 200;
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (challengeIdx + 1 < PREDICTOR_CHALLENGES.length) {
            setChallengeIdx(prev => prev + 1);
            setSelectedOption(null);
            setIsSubmitted(false);
        } else {
            if (onGameOver) {
                onGameOver({
                    score,
                    accuracy: Math.round(((correctCount + (selectedOption === challenge.solution ? 1 : 0)) / PREDICTOR_CHALLENGES.length) * 100),
                    metadata: { challengesCompleted: PREDICTOR_CHALLENGES.length }
                });
            }
        }
    };

    const isCorrect = selectedOption === challenge.solution;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {challenge.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Predictor {challengeIdx + 1} of {PREDICTOR_CHALLENGES.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Trace the logic and predict the terminal output before running.</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-amber-400">{score} pts</span>
                </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-slate-950 font-mono text-xs sm:text-sm shadow-inner">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border-b border-white/10 text-slate-400 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                    <span className="ml-2 font-mono text-slate-300">snippet.{challenge.language === 'python' ? 'py' : challenge.language === 'sql' ? 'sql' : 'js'}</span>
                </div>
                <div className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
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
                        const isAnswer = isSubmitted && opt === challenge.solution;
                        const isWrongSelection = isSubmitted && isSelected && !isCorrect;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(opt)}
                                disabled={isSubmitted || isPaused}
                                className={`p-3.5 rounded-2xl border font-mono text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between ${
                                    isAnswer
                                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-bold'
                                        : isWrongSelection
                                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                                        : isSelected
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                                        : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-amber-500/30'
                                }`}
                            >
                                <span>{opt}</span>
                                {isAnswer && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                                {isWrongSelection && <XCircle size={16} className="text-rose-400 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback & Execution Step Breakdown */}
            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-400" /> : <XCircle size={18} className="text-rose-400" />}
                        <span>{isCorrect ? 'Correct Prediction! (+200 pts)' : `Incorrect (Expected: ${challenge.solution})`}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                        {challenge.explanation}
                    </p>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    {selectedOption ? `Selected: ${selectedOption}` : 'Choose an output'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedOption || isPaused}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Play size={14} className="fill-slate-950" /> Verify Output
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
                    >
                        Next Snippet <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default OutputPredictorEngine;
