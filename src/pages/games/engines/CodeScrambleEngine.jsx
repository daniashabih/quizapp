import React, { useState, useEffect } from 'react';
import { Shuffle, ArrowUp, ArrowDown, CheckCircle2, XCircle, Sparkles, RotateCcw, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_SCRAMBLE_SETS = [
    {
        id: 'cs_1',
        title: 'JavaScript Async Fetch Pipeline',
        language: 'javascript',
        technology: 'javascript',
        technologyName: 'JavaScript',
        difficulty: 'Beginner',
        description: 'Arrange statements to fetch an API resource and safely handle HTTP errors.',
        statements: [
            'const res = await fetch("/api/data");',
            'if (!res.ok) throw new Error("HTTP " + res.status);',
            'const data = await res.json();',
            'return data;'
        ],
        solution: [
            'const res = await fetch("/api/data");',
            'if (!res.ok) throw new Error("HTTP " + res.status);',
            'const data = await res.json();',
            'return data;'
        ],
        explanation: 'The request is dispatched first, HTTP response status is verified, the JSON body stream is parsed, and finally the resulting object is returned.'
    },
    {
        id: 'cs_2',
        title: 'Python File Context Manager',
        language: 'python',
        technology: 'python',
        technologyName: 'Python',
        difficulty: 'Intermediate',
        description: 'Order statements to open a log file with context manager and clean lines.',
        statements: [
            'with open("audit.log", "r") as file:',
            'lines = file.readlines()',
            'clean = [l.strip() for l in lines]',
            'print(f"Processed {len(clean)} entries")'
        ],
        solution: [
            'with open("audit.log", "r") as file:',
            'lines = file.readlines()',
            'clean = [l.strip() for l in lines]',
            'print(f"Processed {len(clean)} entries")'
        ],
        explanation: 'Open context manager handles opening and automatic closing, readlines reads into list, list comprehension cleans whitespace, and total count is logged.'
    },
    {
        id: 'cs_3',
        title: 'Binary Search Step Sequence',
        language: 'javascript',
        technology: 'dsa',
        technologyName: 'Data Structures & Algorithms',
        difficulty: 'Advanced',
        description: 'Reconstruct the core pointer updating logic for binary search.',
        statements: [
            'let low = 0, high = arr.length - 1;',
            'while (low <= high) {',
            'const mid = Math.floor((low + high) / 2);',
            'if (arr[mid] === target) return mid;',
            'if (arr[mid] < target) low = mid + 1;'
        ],
        solution: [
            'let low = 0, high = arr.length - 1;',
            'while (low <= high) {',
            'const mid = Math.floor((low + high) / 2);',
            'if (arr[mid] === target) return mid;',
            'if (arr[mid] < target) low = mid + 1;'
        ],
        explanation: 'Pointers are initialized, while loop guards the boundary, mid point is computed, equality checked, and pointer narrowed.'
    }
];

export const CodeScrambleEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [challenges, setChallenges] = useState(FALLBACK_SCRAMBLE_SETS);
    const [scrambleIdx, setScrambleIdx] = useState(0);
    const [statements, setStatements] = useState([]);
    const [status, setStatus] = useState(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [feedbackExplanation, setFeedbackExplanation] = useState('');

    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('code-scramble', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => {
                        let stmts = item.statements || item.blocks || [];
                        if (stmts.length === 0 && typeof item.content === 'string') {
                            try {
                                const json = JSON.parse(item.content);
                                stmts = json.statements || json.blocks || [];
                            } catch {
                                stmts = item.content.split('\n').filter(Boolean);
                            }
                        }
                        return {
                            ...item,
                            statements: stmts.length > 0 ? stmts : ['statement_1()', 'statement_2()'],
                            explanation: item.explanation || 'Reconstructed sequence executes logically.'
                        };
                    });

                    if (isMounted) {
                        setChallenges(parsed);
                        setScrambleIdx(0);
                    }
                } else if (technology && technology !== 'all') {
                    const filtered = FALLBACK_SCRAMBLE_SETS.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setChallenges(filtered);
                        setScrambleIdx(0);
                    }
                }
            } catch (err) {
                console.warn('[CodeScramble] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const challenge = challenges[scrambleIdx] || FALLBACK_SCRAMBLE_SETS[0];

    useEffect(() => {
        if (!challenge) return;
        const shuffled = [...challenge.statements].sort(() => Math.random() - 0.5);
        setStatements(shuffled);
        setStatus(null);
        setFeedbackExplanation('');
    }, [challenge, scrambleIdx]);

    const moveStatement = (fromIdx, toIdx) => {
        if (toIdx < 0 || toIdx >= statements.length || isPaused || status === 'correct' || isValidating) return;
        const copy = [...statements];
        const [moved] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, moved);
        setStatements(copy);
        setStatus(null);
    };

    const handleCheck = async () => {
        if (isPaused || isValidating || status === 'correct') return;

        setIsValidating(true);
        let isMatch = false;
        let explanation = challenge.explanation;

        try {
            const res = await gameService.verifyChallenge('code-scramble', challenge.id, statements);
            if (res && typeof res.isCorrect === 'boolean') {
                isMatch = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
            } else if (challenge.solution) {
                isMatch = statements.every((s, i) => s === challenge.solution[i]);
            }
        } catch {
            isMatch = challenge.solution ? statements.every((s, i) => s === challenge.solution[i]) : false;
        }

        setIsValidating(false);

        if (isMatch) {
            setStatus('correct');
            setFeedbackExplanation(explanation);
            const newScore = score + (challenge.points || 220);
            setScore(newScore);
            if (onScoreUpdate) onScoreUpdate(newScore);

            setTimeout(() => {
                if (scrambleIdx + 1 < challenges.length) {
                    setScrambleIdx(prev => prev + 1);
                } else {
                    if (onGameOver) {
                        onGameOver({
                            score: newScore,
                            accuracy: 100,
                            metadata: { scramblesCompleted: challenges.length, technology }
                        });
                    }
                }
            }, 1800);
        } else {
            setStatus('incorrect');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-3xl mx-auto w-full">
                <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'technology'} scramble challenges...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge">
                            <Shuffle size={12} /> {challenge.technologyName || challenge.language || 'Code'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {challenge.difficulty || difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Scramble {scrambleIdx + 1} of {challenges.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{challenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{challenge.description}</p>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
                {statements.map((stmt, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border font-mono text-xs sm:text-sm transition-all ${
                            status === 'correct'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/60 text-emerald-800 dark:text-emerald-200'
                                : status === 'incorrect'
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/50 text-rose-800 dark:text-rose-200'
                                : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:border-indigo-500/40'
                        }`}
                    >
                        <div className="flex items-center gap-3 overflow-x-auto">
                            <span className="text-[11px] font-bold text-[var(--foreground-muted)] w-5 text-right select-none">
                                {idx + 1}.
                            </span>
                            <pre className="whitespace-pre font-mono">{stmt}</pre>
                        </div>

                        <div className="flex items-center gap-1 ml-2 select-none">
                            <button
                                onClick={() => moveStatement(idx, idx - 1)}
                                disabled={idx === 0 || isPaused || status === 'correct' || isValidating}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/15 text-[var(--foreground-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <button
                                onClick={() => moveStatement(idx, idx + 1)}
                                disabled={idx === statements.length - 1 || isPaused || status === 'correct' || isValidating}
                                className="p-1.5 rounded-lg bg-[var(--card-bg)] hover:bg-indigo-500/15 text-[var(--foreground-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 border border-[var(--card-border)] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            >
                                <ArrowDown size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {status === 'correct' && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
                    <CheckCircle2 size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm text-emerald-900 dark:text-emerald-200">
                            Sequence Reconstructed! (+{challenge.points || 220} pts)
                        </p>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">{feedbackExplanation || challenge.explanation}</p>
                    </div>
                </div>
            )}

            {status === 'incorrect' && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 flex items-center gap-3">
                    <XCircle size={20} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm text-rose-900 dark:text-rose-200">Incorrect Sequence.</p>
                        <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">Trace the inputs, conditional branches, and return points.</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <button
                    onClick={() => {
                        setStatements([...challenge.statements].sort(() => Math.random() - 0.5));
                        setStatus(null);
                    }}
                    disabled={isPaused || isValidating}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Re-shuffle
                </button>

                <button
                    onClick={handleCheck}
                    disabled={isPaused || status === 'correct' || isValidating}
                    className="game-btn-primary"
                >
                    {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Verify Sequence
                </button>
            </div>
        </div>
    );
};

export default CodeScrambleEngine;
