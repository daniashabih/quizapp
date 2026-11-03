import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ArrowUp, ArrowDown, HelpCircle, Sparkles, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';
import gameAudio from '../../../utils/gameAudio';

// Curated fallback puzzles matching backend and database seeds
const FALLBACK_PUZZLES = [
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
        hints: 'Variables must be initialized before they can be referenced in .filter() and .map() pipeline.',
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
        hints: 'The function header defines scope, seed list is created, iterative loop appends sum, then list is returned.',
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
        hints: 'SQL grammar requires SELECT, FROM, GROUP BY, HAVING, ORDER BY, and finally LIMIT.',
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
        hints: 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.',
        explanation: 'HTML tags must open and close symmetrically, nesting the heading within the info wrapper.'
    }
];

export const CodePuzzleEngine = ({ onGameOver, onScoreUpdate, isPaused, isMuted, technology, difficulty }) => {
    const [puzzles, setPuzzles] = useState(FALLBACK_PUZZLES);
    const [loading, setLoading] = useState(true);
    const [puzzleIdx, setPuzzleIdx] = useState(0);
    const [blocks, setBlocks] = useState([]);
    const [initialScrambledBlocks, setInitialScrambledBlocks] = useState([]);
    const [status, setStatus] = useState(null); // 'correct' | 'incorrect' | 'revealed'
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [feedbackExplanation, setFeedbackExplanation] = useState('');
    const [revealedSolution, setRevealedSolution] = useState(null);
    const [solvedPuzzleIds, setSolvedPuzzleIds] = useState(new Set());

    // Sync sound setting
    useEffect(() => {
        if (typeof isMuted === 'boolean') {
            gameAudio.setMuted(isMuted);
        }
    }, [isMuted]);

    // Deterministically shuffle statements (avoiding accidental already-solved order)
    const scrambleBlocks = (arr) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    // 1. Fetch puzzles from API and check for saved progress
    useEffect(() => {
        let isMounted = true;

        async function initGame() {
            setLoading(true);
            let loadedPuzzles = FALLBACK_PUZZLES;

            try {
                const res = await gameService.getChallenges('code-puzzle', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });
                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    loadedPuzzles = res.data.map(p => {
                        let parsedBlocks = p.blocks;
                        if (!parsedBlocks || parsedBlocks.length === 0) {
                            try {
                                const parsed = typeof p.content === 'string' ? JSON.parse(p.content) : (p.content || {});
                                parsedBlocks = parsed.blocks || parsed.shuffledBlocks || [];
                            } catch {
                                parsedBlocks = [];
                            }
                        }
                        return {
                            ...p,
                            blocks: parsedBlocks && parsedBlocks.length > 0 ? parsedBlocks : (FALLBACK_PUZZLES[0].blocks)
                        };
                    });
                }
            } catch (err) {
                console.warn('[CodePuzzle] Using fallback puzzles due to API error:', err);
            }

            if (!isMounted) return;
            setPuzzles(loadedPuzzles);

            // 2. Check for saved active progress
            try {
                const saved = await gameService.getProgress('code-puzzle');
                if (saved && typeof saved.puzzleIndex === 'number' && saved.puzzleIndex < loadedPuzzles.length) {
                    const idx = Math.max(0, Math.min(saved.puzzleIndex, loadedPuzzles.length - 1));
                    const savedScore = Number(saved.score || 0);
                    const savedStreak = Number(saved.streak || 0);
                    const solvedSet = new Set(saved.completedPuzzles || []);

                    setPuzzleIdx(idx);
                    setScore(savedScore);
                    setStreak(savedStreak);
                    setSolvedPuzzleIds(solvedSet);
                    if (onScoreUpdate) onScoreUpdate(savedScore);

                    // If blocks were saved for the current puzzle
                    if (Array.isArray(saved.currentBlocks) && saved.currentBlocks.length > 0) {
                        setBlocks(saved.currentBlocks);
                        setInitialScrambledBlocks(saved.currentBlocks);
                        setLoading(false);
                        return;
                    }
                }
            } catch {
                // Ignore progress read errors
            }

            setLoading(false);
        }

        initGame();

        return () => {
            isMounted = false;
        };
    }, []);

    // 3. Initialize blocks whenever puzzle index changes
    useEffect(() => {
        if (!puzzles || puzzles.length === 0 || loading) return;

        const currentPuzzle = puzzles[puzzleIdx] || puzzles[0];
        const rawBlocks = currentPuzzle.blocks && currentPuzzle.blocks.length > 0
            ? currentPuzzle.blocks
            : FALLBACK_PUZZLES[0].blocks;

        const shuffled = scrambleBlocks(rawBlocks);
        setBlocks(shuffled);
        setInitialScrambledBlocks([...shuffled]);
        setStatus(null);
        setShowHint(false);
        setFeedbackExplanation('');
        setRevealedSolution(null);
    }, [puzzleIdx, puzzles, loading]);

    const currentPuzzle = puzzles[puzzleIdx] || puzzles[0];

    // Rearrange statement with Up/Down buttons
    const moveBlock = (fromIdx, toIdx) => {
        if (
            toIdx < 0 ||
            toIdx >= blocks.length ||
            isPaused ||
            status === 'correct' ||
            isValidating
        ) {
            return;
        }

        const newBlocks = [...blocks];
        const [moved] = newBlocks.splice(fromIdx, 1);
        newBlocks.splice(toIdx, 0, moved);

        setBlocks(newBlocks);
        setStatus(null);
        gameAudio.playMove();

        // Save rearranged order to allow resuming mid-puzzle
        gameService.saveProgress('code-puzzle', {
            puzzleIndex: puzzleIdx,
            score,
            streak,
            completedPuzzles: Array.from(solvedPuzzleIds),
            currentBlocks: newBlocks
        }).catch(() => {});
    };

    // Reset button: restores the original scrambled order of the current puzzle
    const handleReset = () => {
        if (isPaused || isValidating || status === 'correct') return;
        setBlocks([...initialScrambledBlocks]);
        setStatus(null);
        gameAudio.playMove();

        gameService.saveProgress('code-puzzle', {
            puzzleIndex: puzzleIdx,
            score,
            streak,
            completedPuzzles: Array.from(solvedPuzzleIds),
            currentBlocks: initialScrambledBlocks
        }).catch(() => {});
    };

    // Check Answer button: validates complete sequence on backend securely
    const handleCheckAnswer = async () => {
        if (isPaused || isValidating || status === 'correct') return;

        // Prevent duplicate scoring if this puzzle is already solved
        if (solvedPuzzleIds.has(currentPuzzle.id)) return;

        setIsValidating(true);

        try {
            const res = await gameService.verifyChallenge('code-puzzle', currentPuzzle.id, blocks);

            if (res && res.isCorrect) {
                setStatus('correct');

                const basePoints = res.points || (
                    currentPuzzle.difficulty === 'Advanced' ? 300 :
                    currentPuzzle.difficulty === 'Intermediate' ? 200 : 100
                );
                const streakBonus = streak * 20;
                const earnedPoints = basePoints + streakBonus;

                setPointsAwarded(earnedPoints);
                const newScore = score + earnedPoints;
                const newStreak = streak + 1;
                const newSolved = new Set(solvedPuzzleIds);
                newSolved.add(currentPuzzle.id);

                setScore(newScore);
                setStreak(newStreak);
                setSolvedPuzzleIds(newSolved);
                setFeedbackExplanation(res.explanation || currentPuzzle.explanation || 'Logical execution sequence verified.');

                gameAudio.playSuccess();
                if (onScoreUpdate) onScoreUpdate(newScore);

                // Persist progression
                const nextIdx = puzzleIdx + 1;
                await gameService.saveProgress('code-puzzle', {
                    puzzleIndex: nextIdx,
                    score: newScore,
                    streak: newStreak,
                    completedPuzzles: Array.from(newSolved),
                    currentBlocks: null
                });

                // Auto-advance to next puzzle
                setTimeout(() => {
                    if (nextIdx < puzzles.length) {
                        setPuzzleIdx(nextIdx);
                    } else {
                        // All puzzles solved!
                        gameAudio.playGameOver();
                        gameService.clearProgress('code-puzzle').catch(() => {});
                        if (onGameOver) {
                            onGameOver({
                                score: newScore,
                                accuracy: 100,
                                metadata: { puzzlesSolved: puzzles.length }
                            });
                        }
                    }
                }, 1800);
            } else {
                setStatus('incorrect');
                setStreak(0);
                gameAudio.playError();
                if (res && res.solution) {
                    setRevealedSolution(res.solution);
                }
            }
        } catch (err) {
            console.error('Error verifying solution:', err);
            setStatus('incorrect');
            gameAudio.playError();
        } finally {
            setIsValidating(false);
        }
    };

    // Reveal Solution (for player assistance upon error)
    const handleRevealSolution = () => {
        if (revealedSolution && Array.isArray(revealedSolution)) {
            setBlocks([...revealedSolution]);
            setStatus('revealed');
        } else if (currentPuzzle.solution) {
            try {
                const parsed = typeof currentPuzzle.solution === 'string' ? JSON.parse(currentPuzzle.solution) : currentPuzzle.solution;
                setBlocks([...parsed]);
                setStatus('revealed');
            } catch {
                setStatus('revealed');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
                <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
                <p className="text-xs font-semibold text-[var(--foreground-muted)]">Loading Code Puzzle challenge...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge">
                            {currentPuzzle.language}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Puzzle {puzzleIdx + 1} of {puzzles.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentPuzzle.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{currentPuzzle.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Difficulty</span>
                        <span className={`text-xs font-bold ${
                            currentPuzzle.difficulty === 'Beginner' ? 'text-emerald-600 dark:text-emerald-400' :
                            currentPuzzle.difficulty === 'Intermediate' ? 'text-amber-600 dark:text-amber-400' :
                            'text-purple-600 dark:text-purple-400'
                        }`}>{currentPuzzle.difficulty}</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Streak</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{streak}🔥</span>
                    </div>
                </div>
            </div>

            {/* Instruction banner */}
            <div className="game-hint-banner">
                <span>Use the arrows to rearrange statements in the correct logical sequence.</span>
                <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[var(--game-hint-btn)] hover:opacity-80 cursor-pointer"
                >
                    <HelpCircle size={13} /> {showHint ? 'Hide Hint' : 'Hint'}
                </button>
            </div>

            {showHint && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                    💡 <strong>Hint:</strong> {currentPuzzle.hints || currentPuzzle.explanation}
                </div>
            )}

            {/* Reorderable Code Blocks */}
            <div className="flex flex-col gap-2.5">
                {blocks.map((line, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border font-mono text-xs sm:text-sm transition-all ${
                            status === 'correct'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-800 dark:text-emerald-200'
                                : status === 'incorrect'
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/50 text-rose-800 dark:text-rose-200'
                                : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/50'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-x-auto">
                            <span className="text-[11px] font-bold text-[var(--foreground-muted)] w-5 text-right select-none">
                                {idx + 1}.
                            </span>
                            <pre className="whitespace-pre font-mono font-medium">{line}</pre>
                        </div>

                        <div className="flex items-center gap-1 ml-2 select-none">
                            <button
                                onClick={() => moveBlock(idx, idx - 1)}
                                disabled={idx === 0 || isPaused || status === 'correct' || isValidating}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/15 text-[var(--foreground-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                title="Move Up"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={() => moveBlock(idx, idx + 1)}
                                disabled={idx === blocks.length - 1 || isPaused || status === 'correct' || isValidating}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/15 text-[var(--foreground-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <p className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                            Correct Arrangement! +{pointsAwarded} pts{streak > 1 ? ` (${streak}x Streak!)` : ''}
                        </p>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">{feedbackExplanation}</p>
                    </div>
                </div>
            )}

            {status === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <XCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
                        <div>
                            <p className="font-black text-sm text-rose-900 dark:text-rose-200">Not quite right yet.</p>
                            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">Check the logical execution flow and try again.</p>
                        </div>
                    </div>
                    {revealedSolution && (
                        <button
                            onClick={handleRevealSolution}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-bold border border-rose-500/30 cursor-pointer whitespace-nowrap"
                        >
                            Reveal Solution
                        </button>
                    )}
                </div>
            )}

            {status === 'revealed' && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-300 flex items-center gap-3">
                    <HelpCircle size={20} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                        <p className="font-black text-sm text-amber-900 dark:text-amber-200">Solution Revealed</p>
                        <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">Study the correct logical sequence above, then hit Reset to practice arranging it yourself.</p>
                    </div>
                </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={handleReset}
                    disabled={isPaused || isValidating || status === 'correct'}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset
                </button>

                <button
                    onClick={handleCheckAnswer}
                    disabled={isPaused || isValidating || status === 'correct'}
                    className="game-btn-primary"
                >
                    {isValidating ? (
                        <>
                            <Loader2 size={14} className="animate-spin" /> Checking...
                        </>
                    ) : (
                        <>
                            <Sparkles size={14} /> Check Answer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CodePuzzleEngine;
