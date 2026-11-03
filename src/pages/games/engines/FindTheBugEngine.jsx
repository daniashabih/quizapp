import React, { useState, useEffect } from 'react';
import { Bug, CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import gameService from '../../../services/gameService';

const FALLBACK_BUG_CHALLENGES = [
    {
        id: 'ftb_1',
        title: 'Off-By-One Array Bound',
        language: 'javascript',
        category: 'Logic Error',
        difficulty: 'Beginner',
        technology: 'javascript',
        technologyName: 'JavaScript',
        code: [
            'function sumArray(numbers) {',
            '    let total = 0;',
            '    for (let i = 0; i <= numbers.length; i++) {',
            '        total += numbers[i];',
            '    }',
            '    return total;',
            '}'
        ],
        bugLine: 3,
        fix: 'for (let i = 0; i < numbers.length; i++) {',
        explanation: 'Line 3 uses `i <= numbers.length`. Since JS arrays are 0-indexed, `numbers[numbers.length]` evaluates to `undefined`, which yields NaN when added to total.'
    },
    {
        id: 'ftb_2',
        title: 'Mutable Default Argument',
        language: 'python',
        category: 'Reference Bug',
        difficulty: 'Intermediate',
        technology: 'python',
        technologyName: 'Python',
        code: [
            'def register_user(username, roles=[]):',
            '    roles.append("member")',
            '    return {"user": username, "roles": roles}',
            '',
            'u1 = register_user("alice")',
            'u2 = register_user("bob")'
        ],
        bugLine: 1,
        fix: 'def register_user(username, roles=None): if roles is None: roles = []',
        explanation: 'Line 1 uses a mutable list `roles=[]` as a default parameter. In Python, default arguments are evaluated once at function definition time, sharing the same list across all calls.'
    },
    {
        id: 'ftb_3',
        title: 'Unaggregated Non-Grouped Column',
        language: 'sql',
        category: 'Syntax / Semantic Error',
        difficulty: 'Intermediate',
        technology: 'sql',
        technologyName: 'SQL',
        code: [
            'SELECT department, role, COUNT(*)',
            'FROM staff',
            'WHERE is_active = true',
            'GROUP BY department;',
            ''
        ],
        bugLine: 4,
        fix: 'GROUP BY department, role;',
        explanation: 'Line 4 only groups by `department`, but `role` is included in the SELECT clause without an aggregate function. SQL requires all unaggregated selected columns in GROUP BY.'
    },
    {
        id: 'ftb_4',
        title: 'Loose String Equality Pitfall',
        language: 'php',
        category: 'Type Coercion',
        difficulty: 'Beginner',
        technology: 'php',
        technologyName: 'PHP',
        code: [
            'function authenticate($inputHash, $secretHash) {',
            '    if ($inputHash == $secretHash) {',
            '        return "ACCESS_GRANTED";',
            '    }',
            '    return "ACCESS_DENIED";',
            '}'
        ],
        bugLine: 2,
        fix: 'if (hash_equals($secretHash, $inputHash)) {',
        explanation: 'Line 2 uses loose equality `==` which is vulnerable to type juggling and timing attacks. Always use strict `===` or `hash_equals()` for credential tokens in PHP.'
    }
];

export const FindTheBugEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [challenges, setChallenges] = useState(FALLBACK_BUG_CHALLENGES);
    const [challengeIdx, setChallengeIdx] = useState(0);
    const [selectedLine, setSelectedLine] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [isValidating, setIsValidating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Fetch challenges based on selected technology and difficulty
    useEffect(() => {
        let isMounted = true;
        async function loadChallenges() {
            setLoading(true);
            try {
                const res = await gameService.getChallenges('find-the-bug', {
                    technology: technology && technology !== 'all' ? technology : undefined,
                    difficulty: difficulty && difficulty !== 'All Levels' ? difficulty : undefined
                });

                if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                    const parsed = res.data.map(item => {
                        let lines = [];
                        if (Array.isArray(item.code)) {
                            lines = item.code;
                        } else if (typeof item.content === 'string') {
                            try {
                                const json = JSON.parse(item.content);
                                lines = json.lines || json.code || [];
                            } catch {
                                // Format "1: code\n2: code" or raw multiline code
                                lines = item.content.split('\n').map(l => l.replace(/^\d+:\s*/, ''));
                            }
                        }

                        return {
                            ...item,
                            category: item.category || 'Logic & Syntax',
                            code: lines.length > 0 ? lines : ['// No code lines provided'],
                            bugLine: item.bugLine || (item.solution ? Number(item.solution) : null),
                            fix: item.fix || item.hints || 'Review language documentation for exact syntax.',
                            explanation: item.explanation || 'Identified bug disrupts expected execution flow.'
                        };
                    });

                    if (isMounted) {
                        setChallenges(parsed);
                        setChallengeIdx(0);
                        setSelectedLine(null);
                        setIsSubmitted(false);
                        setVerificationResult(null);
                    }
                } else if (technology && technology !== 'all') {
                    // Filter fallback by technology if matched
                    const filtered = FALLBACK_BUG_CHALLENGES.filter(c =>
                        c.technology === technology.toLowerCase()
                    );
                    if (isMounted && filtered.length > 0) {
                        setChallenges(filtered);
                        setChallengeIdx(0);
                    }
                }
            } catch (err) {
                console.warn('[FindTheBug] Using fallback challenges:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadChallenges();
        return () => { isMounted = false; };
    }, [technology, difficulty]);

    const currentChallenge = challenges[challengeIdx] || FALLBACK_BUG_CHALLENGES[0];

    const handleLineClick = (lineNum) => {
        if (isSubmitted || isPaused || isValidating) return;
        setSelectedLine(lineNum);
    };

    const handleSubmit = async () => {
        if (!selectedLine || isSubmitted || isPaused || isValidating) return;

        setIsValidating(true);
        let isCorrect = false;
        let explanation = currentChallenge.explanation;
        let fix = currentChallenge.fix;
        let bugLine = currentChallenge.bugLine;

        try {
            const res = await gameService.verifyChallenge('find-the-bug', currentChallenge.id, selectedLine);
            if (res && typeof res.isCorrect === 'boolean') {
                isCorrect = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
                if (res.solution) bugLine = Number(res.solution);
            } else {
                isCorrect = currentChallenge.bugLine ? (selectedLine === currentChallenge.bugLine) : false;
            }
        } catch {
            isCorrect = currentChallenge.bugLine ? (selectedLine === currentChallenge.bugLine) : false;
        }

        setVerificationResult({ isCorrect, explanation, fix, bugLine });
        setIsSubmitted(true);
        setIsValidating(false);

        let newScore = score;
        if (isCorrect) {
            newScore = score + (currentChallenge.points || 250);
            setScore(newScore);
            setCorrectCount(prev => prev + 1);
            if (onScoreUpdate) onScoreUpdate(newScore);
        }
    };

    const handleNext = () => {
        if (challengeIdx + 1 < challenges.length) {
            setChallengeIdx(prev => prev + 1);
            setSelectedLine(null);
            setIsSubmitted(false);
            setVerificationResult(null);
        } else {
            if (onGameOver) {
                const total = challenges.length;
                const correct = correctCount + (verificationResult?.isCorrect ? 1 : 0);
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
                <p className="text-sm font-semibold text-[var(--foreground-muted)]">Loading {technology || 'technology'} bug challenges...</p>
            </div>
        );
    }

    const isCorrect = verificationResult ? verificationResult.isCorrect : (selectedLine === currentChallenge.bugLine);
    const targetBugLine = verificationResult?.bugLine || currentChallenge.bugLine;

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="game-tech-badge">
                            <Bug size={12} /> {currentChallenge.technologyName || currentChallenge.language || 'Code'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {currentChallenge.difficulty || difficulty || 'All Levels'}
                        </span>
                        {currentChallenge.category && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                {currentChallenge.category}
                            </span>
                        )}
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">{currentChallenge.title}</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Click the exact line containing the bug.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Challenge</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{challengeIdx + 1} / {challenges.length}</span>
                    </div>
                </div>
            </div>

            {/* Code Inspector Pane */}
            <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--muted-bg)] font-mono text-xs sm:text-sm select-none shadow-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-[var(--card-bg)] border-b border-[var(--card-border)] text-[var(--foreground-muted)] text-[11px]">
                    <span className="font-semibold">
                        source_code.{currentChallenge.language === 'python' ? 'py' : currentChallenge.language === 'sql' ? 'sql' : currentChallenge.language === 'php' ? 'php' : 'js'}
                    </span>
                    <span>Click a line to select</span>
                </div>

                <div className="p-3 divide-y divide-[var(--card-border)]/50">
                    {currentChallenge.code.map((line, idx) => {
                        const lineNum = idx + 1;
                        const isSelected = selectedLine === lineNum;
                        const isBugLine = isSubmitted && targetBugLine && lineNum === targetBugLine;
                        const isFalsePick = isSubmitted && isSelected && !isCorrect;

                        return (
                            <div
                                key={lineNum}
                                onClick={() => handleLineClick(lineNum)}
                                className={`flex items-center py-1.5 px-3 rounded-lg cursor-pointer transition-all ${
                                    isBugLine
                                        ? 'bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-500/60 font-bold'
                                        : isFalsePick
                                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                                        : isSelected
                                        ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border border-indigo-500/50 font-bold'
                                        : 'text-[var(--foreground)] hover:bg-[var(--hover-bg)]'
                                }`}
                            >
                                <span className="w-8 shrink-0 text-[var(--foreground-muted)] text-right pr-4 select-none text-[11px]">
                                    {lineNum}
                                </span>
                                <pre className="font-mono whitespace-pre overflow-x-auto flex-1 font-medium">{line}</pre>
                                {isBugLine && (
                                    <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded ml-2 shrink-0">
                                        BUG HERE
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Explanation & Solution upon submission */}
            {isSubmitted && (
                <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300'
                }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" /> : <XCircle size={18} className="text-rose-600 dark:text-rose-400" />}
                        <span className="text-[var(--foreground)] font-black">
                            {isCorrect ? `Target Locked! Correct Bug Found (+${currentChallenge.points || 250} pts)` : `Incorrect Line (Bug is on Line ${targetBugLine || 'specified'})`}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[var(--foreground-secondary)]">
                        {verificationResult?.explanation || currentChallenge.explanation}
                    </p>
                    {(verificationResult?.fix || currentChallenge.fix) && (
                        <div className="mt-1 p-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] font-mono text-xs text-emerald-700 dark:text-emerald-400">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Recommended Fix / Hint:</span>
                            <code>{verificationResult?.fix || currentChallenge.fix}</code>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)] font-medium">
                    {selectedLine ? `Selected Line: ${selectedLine}` : 'No line selected'}
                </span>

                {!isSubmitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedLine || isPaused || isValidating}
                        className="game-btn-primary"
                    >
                        {isValidating ? <Loader2 size={14} className="animate-spin" /> : <Bug size={14} />}
                        Submit Line
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

export default FindTheBugEngine;
