import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowUp, ArrowDown, HelpCircle, Sparkles, Code2 } from 'lucide-react';

const PUZZLES = [
    {
        id: 'cp_1',
        title: 'Filter & Map Evens Squared',
        language: 'javascript',
        difficulty: 'Beginner',
        description: 'Arrange blocks to filter even numbers and calculate their squares.',
        blocks: [
            'return squared;',
            'const numbers = [1, 2, 3, 4, 5, 6];',
            'const squared = evens.map(n => n * n);',
            'const evens = numbers.filter(n => n % 2 === 0);'
        ],
        solution: [
            'const numbers = [1, 2, 3, 4, 5, 6];',
            'const evens = numbers.filter(n => n % 2 === 0);',
            'const squared = evens.map(n => n * n);',
            'return squared;'
        ],
        explanation: 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.'
    },
    {
        id: 'cp_2',
        title: 'Python Fibonacci Generator',
        language: 'python',
        difficulty: 'Intermediate',
        description: 'Order statements to produce a Fibonacci list of length n.',
        blocks: [
            'return fib',
            'def get_fib(n):',
            '    for _ in range(2, n):',
            '        fib.append(fib[-1] + fib[-2])',
            '    fib = [0, 1]'
        ],
        solution: [
            'def get_fib(n):',
            '    fib = [0, 1]',
            '    for _ in range(2, n):',
            '        fib.append(fib[-1] + fib[-2])',
            '    return fib'
        ],
        explanation: 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.'
    },
    {
        id: 'cp_3',
        title: 'SQL Top Department Salaries',
        language: 'sql',
        difficulty: 'Advanced',
        description: 'Arrange clauses to aggregate average department salaries above 50k.',
        blocks: [
            'LIMIT 5;',
            'SELECT department, AVG(salary) AS avg_sal',
            'HAVING AVG(salary) > 50000',
            'FROM employees',
            'ORDER BY avg_sal DESC',
            'GROUP BY department'
        ],
        solution: [
            'SELECT department, AVG(salary) AS avg_sal',
            'FROM employees',
            'GROUP BY department',
            'HAVING AVG(salary) > 50000',
            'ORDER BY avg_sal DESC',
            'LIMIT 5;'
        ],
        explanation: 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.'
    },
    {
        id: 'cp_4',
        title: 'HTML Semantic Card Structure',
        language: 'html',
        difficulty: 'Beginner',
        description: 'Arrange HTML elements into a semantic card layout.',
        blocks: [
            '  </div>',
            '  <img src="avatar.jpg" alt="Profile" />',
            '<article class="user-card">',
            '  <div class="user-info">',
            '    <h3>Alex Rivera</h3>',
            '</article>'
        ],
        solution: [
            '<article class="user-card">',
            '  <img src="avatar.jpg" alt="Profile" />',
            '  <div class="user-info">',
            '    <h3>Alex Rivera</h3>',
            '  </div>',
            '</article>'
        ],
        explanation: 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.'
    }
];

export const CodePuzzleEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [puzzleIdx, setPuzzleIdx] = useState(0);
    const [blocks, setBlocks] = useState([]);
    const [status, setStatus] = useState(null); // 'correct' | 'incorrect'
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showHint, setShowHint] = useState(false);

    const currentPuzzle = PUZZLES[puzzleIdx];

    useEffect(() => {
        // Initialize shuffled blocks for current puzzle
        const shuffled = [...currentPuzzle.blocks].sort(() => Math.random() - 0.5);
        setBlocks(shuffled);
        setStatus(null);
        setShowHint(false);
    }, [puzzleIdx]);

    const moveBlock = (fromIdx, toIdx) => {
        if (toIdx < 0 || toIdx >= blocks.length || isPaused || status === 'correct') return;
        const newBlocks = [...blocks];
        const [moved] = newBlocks.splice(fromIdx, 1);
        newBlocks.splice(toIdx, 0, moved);
        setBlocks(newBlocks);
        setStatus(null);
    };

    const handleCheckAnswer = () => {
        if (isPaused) return;
        const isMatch = blocks.every((b, i) => b === currentPuzzle.solution[i]);

        if (isMatch) {
            setStatus('correct');
            const points = currentPuzzle.difficulty === 'Advanced' ? 300 : currentPuzzle.difficulty === 'Intermediate' ? 200 : 100;
            const newScore = score + points + (streak * 20);
            setScore(newScore);
            setStreak(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);

            setTimeout(() => {
                if (puzzleIdx + 1 < PUZZLES.length) {
                    setPuzzleIdx(prev => prev + 1);
                } else {
                    if (onGameOver) {
                        onGameOver({
                            score: newScore,
                            accuracy: 100,
                            metadata: { puzzlesSolved: PUZZLES.length }
                        });
                    }
                }
            }, 1800);
        } else {
            setStatus('incorrect');
            setStreak(0);
        }
    };

    const handleRevealSolution = () => {
        setBlocks([...currentPuzzle.solution]);
        setStatus('revealed');
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {currentPuzzle.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Puzzle {puzzleIdx + 1} of {PUZZLES.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentPuzzle.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{currentPuzzle.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Difficulty</span>
                        <span className="text-xs font-bold text-amber-400">{currentPuzzle.difficulty}</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Streak</span>
                        <span className="text-sm font-black text-emerald-400">{streak}🔥</span>
                    </div>
                </div>
            </div>

            {/* Instruction banner */}
            <div className="text-xs text-indigo-300/90 bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
                <span>Use the arrows to rearrange statements in the correct logical sequence.</span>
                <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                    <HelpCircle size={13} /> {showHint ? 'Hide Hint' : 'Hint'}
                </button>
            </div>

            {showHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    💡 <strong>Hint:</strong> {currentPuzzle.explanation}
                </div>
            )}

            {/* Reorderable Code Blocks */}
            <div className="flex flex-col gap-2.5">
                {blocks.map((line, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border font-mono text-xs sm:text-sm transition-all ${
                            status === 'correct'
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                                : status === 'incorrect'
                                ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                                : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/40'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-x-auto">
                            <span className="text-[11px] font-bold text-[var(--foreground-muted)] w-5 text-right select-none">
                                {idx + 1}.
                            </span>
                            <pre className="whitespace-pre font-mono">{line}</pre>
                        </div>

                        <div className="flex items-center gap-1 ml-2 select-none">
                            <button
                                onClick={() => moveBlock(idx, idx - 1)}
                                disabled={idx === 0 || isPaused || status === 'correct'}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/20 text-[var(--foreground-muted)] hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move Up"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={() => moveBlock(idx, idx + 1)}
                                disabled={idx === blocks.length - 1 || isPaused || status === 'correct'}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/20 text-[var(--foreground-muted)] hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move Down"
                            >
                                <ArrowDown size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Feedback */}
            {status === 'correct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm">Correct Arrangement! +{streak > 1 ? ` (${streak}x Streak!)` : ''}</p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">{currentPuzzle.explanation}</p>
                    </div>
                </div>
            )}

            {status === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <XCircle size={20} className="shrink-0" />
                        <div>
                            <p className="font-black text-sm">Not quite right yet.</p>
                            <p className="text-xs text-rose-300/80 mt-0.5">Check the logical execution flow and try again.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRevealSolution}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 cursor-pointer whitespace-nowrap"
                    >
                        Reveal Solution
                    </button>
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => {
                        setBlocks([...currentPuzzle.blocks].sort(() => Math.random() - 0.5));
                        setStatus(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Reset
                </button>

                <button
                    onClick={handleCheckAnswer}
                    disabled={isPaused || status === 'correct'}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                    <Sparkles size={14} /> Check Answer
                </button>
            </div>
        </div>
    );
};

export default CodePuzzleEngine;
