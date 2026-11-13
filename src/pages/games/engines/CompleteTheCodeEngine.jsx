import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    CheckCircle2,
    XCircle,
    ArrowRight,
    Sparkles,
    RotateCcw,
    Trophy,
    HelpCircle,
    Flame,
    Zap,
    Code2,
    Loader2,
    Check,
    Keyboard,
    ListFilter,
    Lightbulb,
    BookmarkCheck,
    Terminal
} from 'lucide-react';
import gameService from '../../../services/gameService';
import TechIcon from '../components/TechIcon';

export const CompleteTheCodeEngine = ({
    onGameOver,
    onScoreUpdate,
    isPaused,
    technology = 'csharp',
    difficulty = 'All Levels'
}) => {
    const [challenges, setChallenges] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty || 'All Levels');
    const [inputMode, setInputMode] = useState('choice'); // 'choice' or 'type'
    const [userCodeInput, setUserCodeInput] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    // Scoring & Statistics
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showResultScreen, setShowResultScreen] = useState(false);
    const [earnedStreakBonus, setEarnedStreakBonus] = useState(0);

    const inputRef = useRef(null);
    const isMountedRef = useRef(true);

    // Load challenges from backend or resilient fallback
    const loadChallenges = useCallback(async () => {
        setLoading(true);
        try {
            const res = await gameService.getChallenges('complete-the-code', {
                technology: 'csharp',
                difficulty: selectedDifficulty !== 'All Levels' ? selectedDifficulty : undefined
            });

            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                if (isMountedRef.current) {
                    setChallenges(res.data);
                    setCurrentIdx(0);
                    resetQuestionState();
                }
            } else {
                // Fallback to missing-code endpoint with technology=csharp
                const fallbackRes = await gameService.getChallenges('missing-code', {
                    technology: 'csharp',
                    difficulty: selectedDifficulty !== 'All Levels' ? selectedDifficulty : undefined
                });
                if (fallbackRes && fallbackRes.success && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
                    if (isMountedRef.current) {
                        setChallenges(fallbackRes.data);
                        setCurrentIdx(0);
                        resetQuestionState();
                    }
                }
            }
        } catch (err) {
            console.warn('[CompleteTheCodeEngine] loadChallenges failed:', err);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, [selectedDifficulty]);

    useEffect(() => {
        isMountedRef.current = true;
        loadChallenges();
        return () => {
            isMountedRef.current = false;
        };
    }, [loadChallenges]);

    // Check for saved session progress
    useEffect(() => {
        async function checkProgress() {
            try {
                const saved = await gameService.getProgress('complete-the-code');
                if (saved && typeof saved.currentIdx === 'number' && saved.currentIdx > 0) {
                    setCurrentIdx(saved.currentIdx);
                    if (typeof saved.score === 'number') setScore(saved.score);
                    if (typeof saved.correctCount === 'number') setCorrectCount(saved.correctCount);
                    if (typeof saved.incorrectCount === 'number') setIncorrectCount(saved.incorrectCount);
                }
            } catch {
                // Ignore
            }
        }
        checkProgress();
    }, []);

    const resetQuestionState = () => {
        setUserCodeInput('');
        setSelectedOption(null);
        setIsSubmitted(false);
        setFeedback(null);
        setShowHint(false);
    };

    const currentChallenge = challenges[currentIdx] || null;

    // Focus input field when entering type mode
    useEffect(() => {
        if (inputMode === 'type' && inputRef.current && !isSubmitted) {
            inputRef.current.focus();
        }
    }, [inputMode, currentIdx, isSubmitted]);

    // Select option from choices
    const handleSelectOption = (opt) => {
        if (isSubmitted || isPaused || isValidating) return;
        setSelectedOption(opt);
        setUserCodeInput(opt);
    };

    // Submit answer
    const handleSubmit = async () => {
        const finalSubmission = (inputMode === 'type' ? userCodeInput : selectedOption || userCodeInput).trim();
        if (!finalSubmission || isSubmitted || isPaused || isValidating || !currentChallenge) return;

        setIsValidating(true);
        let isCorrect = false;
        let explanation = currentChallenge.explanation || '';
        let solution = currentChallenge.solution || currentChallenge.blank || '';

        try {
            const res = await gameService.verifyChallenge('complete-the-code', currentChallenge.id, finalSubmission);
            if (res && typeof res.isCorrect === 'boolean') {
                isCorrect = res.isCorrect;
                if (res.explanation) explanation = res.explanation;
                if (res.solution) solution = res.solution;
            } else {
                // Client normalization comparison
                isCorrect = finalSubmission.toLowerCase().replace(/\s+/g, ' ') === solution.toLowerCase().replace(/\s+/g, ' ');
            }
        } catch {
            isCorrect = finalSubmission.toLowerCase().replace(/\s+/g, ' ') === solution.toLowerCase().replace(/\s+/g, ' ');
        }

        const questionPoints = currentChallenge.points || (currentChallenge.difficulty === 'Advanced' ? 200 : currentChallenge.difficulty === 'Intermediate' ? 150 : 100);
        let addedPoints = 0;
        let newStreak = streak;
        let streakBonus = 0;

        if (isCorrect) {
            newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);
            setCorrectCount(prev => prev + 1);

            // Streak bonus (+25 per question if streak >= 3)
            if (newStreak >= 3) {
                streakBonus = Math.min(newStreak * 15, 100);
                setEarnedStreakBonus(prev => prev + streakBonus);
            }

            addedPoints = questionPoints + streakBonus;
            const updatedScore = score + addedPoints;
            setScore(updatedScore);
            if (onScoreUpdate) onScoreUpdate(updatedScore);
        } else {
            setStreak(0);
            setIncorrectCount(prev => prev + 1);
        }

        setFeedback({
            isCorrect,
            solution,
            explanation,
            addedPoints,
            streakBonus
        });
        setIsSubmitted(true);
        setIsValidating(false);

        // Save progress for session persistence
        gameService.saveProgress('complete-the-code', {
            currentIdx: currentIdx + 1,
            score: score + addedPoints,
            correctCount: correctCount + (isCorrect ? 1 : 0),
            incorrectCount: incorrectCount + (isCorrect ? 0 : 1),
            difficulty: selectedDifficulty
        }).catch(() => null);
    };

    // Advance to next challenge or show game over
    const handleNext = () => {
        if (currentIdx + 1 < challenges.length) {
            setCurrentIdx(prev => prev + 1);
            resetQuestionState();
        } else {
            finishGame();
        }
    };

    // Finalize game and trigger game over
    const finishGame = () => {
        setShowResultScreen(true);
        gameService.clearProgress('complete-the-code').catch(() => null);

        const total = challenges.length;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 100;

        if (onGameOver) {
            onGameOver({
                score,
                accuracy,
                difficulty: selectedDifficulty,
                technology: 'csharp',
                metadata: {
                    totalQuestions: total,
                    correctAnswers: correctCount,
                    incorrectAnswers: incorrectCount,
                    maxStreak,
                    streakBonus: earnedStreakBonus
                }
            });
        }
    };

    // Restart game
    const handleRestart = () => {
        gameService.clearProgress('complete-the-code').catch(() => null);
        setCurrentIdx(0);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setEarnedStreakBonus(0);
        setShowResultScreen(false);
        resetQuestionState();
        if (onScoreUpdate) onScoreUpdate(0);
    };

    // Parse code segments before and after the blank
    const parsedCode = useMemo(() => {
        if (!currentChallenge) return { before: '', after: '', blank: '' };

        let before = currentChallenge.codeBefore || '';
        let after = currentChallenge.codeAfter || '';
        const content = currentChallenge.content || '';
        const blank = currentChallenge.blank || currentChallenge.solution || '';

        if (!before && !after && content.includes('_____')) {
            const parts = content.split('_____');
            before = parts[0] || '';
            after = parts.slice(1).join('_____') || '';
        } else if (!before && !after && blank && content.includes(blank)) {
            const idx = content.indexOf(blank);
            before = content.slice(0, idx);
            after = content.slice(idx + blank.length);
        }

        return { before, after, blank };
    }, [currentChallenge]);

    // Active displayed token in the code blank
    const activeBlankToken = (inputMode === 'type' ? userCodeInput : selectedOption || userCodeInput).trim();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-3xl mx-auto w-full min-h-[380px]">
                <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <TechIcon slug="csharp" className="w-7 h-7" />
                    </div>
                    <Loader2 size={24} className="animate-spin text-purple-400 absolute -top-1 -right-1" />
                </div>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Loading C# Code Gaps...</h3>
                <p className="text-xs text-[var(--foreground-muted)]">Preparing syntax challenges & verification rules</p>
            </div>
        );
    }

    if (!currentChallenge || challenges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl max-w-2xl mx-auto w-full text-center">
                <Code2 size={40} className="text-purple-400 mb-3" />
                <h3 className="text-base font-black text-[var(--foreground)] mb-1">No Challenges Found</h3>
                <p className="text-xs text-[var(--foreground-muted)] mb-5">
                    We could not find C# challenges matching level "{selectedDifficulty}".
                </p>
                <button
                    onClick={() => { setSelectedDifficulty('All Levels'); loadChallenges(); }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
                >
                    Reset Filter to All Levels
                </button>
            </div>
        );
    }

    // FINAL RESULTS SCREEN
    if (showResultScreen) {
        const total = challenges.length;
        const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 100;
        const isMaster = percentage >= 80;

        return (
            <div className="flex flex-col gap-6 p-6 sm:p-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-2xl max-w-2xl mx-auto w-full text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
                    <Trophy size={32} className="text-white" />
                </div>

                <div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 inline-block mb-2">
                        Challenge Completed
                    </span>
                    <h2 className="text-2xl font-black text-[var(--foreground)]">C# Complete the Code</h2>
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        {isMaster ? 'Masterful work! Your C# syntax skills are rock solid.' : 'Good effort! Review the code explanations to improve your accuracy.'}
                    </p>
                </div>

                {/* Score & Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Total Score</span>
                        <span className="text-xl font-black text-purple-600 dark:text-purple-400">{score}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Accuracy</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Correct</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{correctCount} / {total}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-1">Best Streak</span>
                        <span className="text-xl font-black text-amber-500">{maxStreak} 🔥</span>
                    </div>
                </div>

                {earnedStreakBonus > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                        <Flame size={16} /> Earned +{earnedStreakBonus} points in consecutive streak bonuses!
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                        onClick={handleRestart}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-md shadow-purple-600/20"
                    >
                        <RotateCcw size={15} /> Play Again
                    </button>
                    <a
                        href="/games?tech=csharp"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-bold text-xs transition-colors"
                    >
                        Back to C# Games
                    </a>
                </div>
            </div>
        );
    }

    const progressPct = Math.round(((currentIdx + 1) / challenges.length) * 100);

    return (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
            {/* Top Bar: Difficulty Tabs & Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <TechIcon slug="csharp" className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                C# Complete the Code
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {currentChallenge.difficulty || 'All Levels'}
                            </span>
                            {currentChallenge.topic && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]">
                                    {currentChallenge.topic}
                                </span>
                            )}
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] mt-0.5">
                            {currentChallenge.title}
                        </h2>
                    </div>
                </div>

                {/* Score & Streak Pill */}
                <div className="flex items-center gap-3">
                    {streak >= 2 && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black animate-pulse">
                            <Flame size={14} />
                            <span>{streak} Streak!</span>
                        </div>
                    )}
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{score} pts</span>
                    </div>
                </div>
            </div>

            {/* Progress & Difficulty Filter Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                {/* Difficulty selector */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] w-full sm:w-auto">
                    {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                        <button
                            key={diff}
                            onClick={() => setSelectedDifficulty(diff)}
                            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                selectedDifficulty === diff
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {diff}
                        </button>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 w-full sm:w-64">
                    <div className="flex-1 bg-[var(--card-border)] h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-emerald-500 h-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] whitespace-nowrap">
                        {currentIdx + 1} / {challenges.length}
                    </span>
                </div>
            </div>

            {/* Code Editor Container */}
            <div className="relative rounded-3xl overflow-hidden border border-[#2b3732] bg-[#121915] text-[#d6deeb] font-mono shadow-xl">
                {/* Code Window Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b100d] border-b border-[#202c25] select-none text-xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                        <span className="text-[#849b8f] text-[11px] font-sans font-semibold ml-2 flex items-center gap-1">
                            <Terminal size={12} /> Program.cs
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Switch Input Mode */}
                        <div className="flex items-center gap-1 bg-[#18231c] p-0.5 rounded-lg border border-[#24362b]">
                            <button
                                onClick={() => setInputMode('choice')}
                                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold flex items-center gap-1 transition-all ${
                                    inputMode === 'choice' ? 'bg-purple-600 text-white' : 'text-[#849b8f] hover:text-white'
                                }`}
                                title="Multiple Choice Mode"
                            >
                                <ListFilter size={11} /> Choices
                            </button>
                            <button
                                onClick={() => setInputMode('type')}
                                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold flex items-center gap-1 transition-all ${
                                    inputMode === 'type' ? 'bg-purple-600 text-white' : 'text-[#849b8f] hover:text-white'
                                }`}
                                title="Direct Type Mode"
                            >
                                <Keyboard size={11} /> Type In
                            </button>
                        </div>
                    </div>
                </div>

                {/* Incomplete Code View with Interactive Blank */}
                <div className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm leading-relaxed">
                    <pre className="whitespace-pre">
                        <span>{parsedCode.before}</span>
                        {/* Interactive Blank Space */}
                        <span
                            onClick={() => {
                                if (!isSubmitted && inputMode !== 'type') {
                                    setInputMode('type');
                                }
                            }}
                            className={`inline-block px-3 py-1 mx-1 rounded-lg border font-mono font-bold transition-all cursor-pointer ${
                                isSubmitted
                                    ? feedback?.isCorrect
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                                        : 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30 line-through'
                                    : activeBlankToken
                                    ? 'bg-purple-500/25 border-purple-400 text-purple-200 ring-2 ring-purple-500/30 shadow-md'
                                    : 'bg-purple-500/10 border-dashed border-purple-500/50 text-purple-300 animate-pulse'
                            }`}
                            title="Interactive blank space: click to type or choose from options below"
                        >
                            {activeBlankToken || '_____'}
                        </span>
                        {/* If submitted & incorrect, show the correct solution badge */}
                        {isSubmitted && !feedback?.isCorrect && (
                            <span className="inline-block px-2.5 py-1 mx-1 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono font-bold animate-in fade-in">
                                {feedback?.solution}
                            </span>
                        )}
                        <span>{parsedCode.after}</span>
                    </pre>
                </div>
            </div>

            {/* Answer Input Controls */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-sm">
                {/* Mode 1: Multiple Choice Options */}
                {inputMode === 'choice' && Array.isArray(currentChallenge.options) && currentChallenge.options.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider flex items-center justify-between">
                            <span>Select the Missing C# Token:</span>
                            <span className="text-[10px] text-[var(--foreground-muted)] font-normal hidden sm:inline">
                                Tip: Click any option or switch to "Type In"
                            </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {currentChallenge.options.map((opt, idx) => {
                                const isSelected = selectedOption === opt;
                                const isOptionCorrect = isSubmitted && opt === (feedback?.solution || currentChallenge.solution);
                                const isOptionWrong = isSubmitted && isSelected && !feedback?.isCorrect;

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={isSubmitted || isValidating}
                                        onClick={() => handleSelectOption(opt)}
                                        className={`flex items-center justify-between p-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold transition-all text-left ${
                                            isOptionCorrect
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                                : isOptionWrong
                                                ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300'
                                                : isSelected
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                                                : 'bg-[var(--muted-bg)] hover:bg-[var(--card-border)] border-[var(--card-border)] text-[var(--foreground)]'
                                        }`}
                                    >
                                        <span className="truncate">{opt}</span>
                                        {isOptionCorrect && <Check size={14} className="shrink-0 text-emerald-400" />}
                                        {isOptionWrong && <XCircle size={14} className="shrink-0 text-rose-400" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Mode 2: Direct Text Input */}
                {inputMode === 'type' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                            Type Missing Code Token:
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                disabled={isSubmitted || isValidating}
                                value={userCodeInput}
                                onChange={(e) => setUserCodeInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isSubmitted && userCodeInput.trim()) {
                                        handleSubmit();
                                    }
                                }}
                                placeholder="Type the missing code keyword, statement, or operator..."
                                className="w-full px-4 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)] font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {userCodeInput && !isSubmitted && (
                                <button
                                    onClick={() => setUserCodeInput('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons: Submit / Next / Hint */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--card-border)]">
                    <div className="flex items-center gap-2">
                        {currentChallenge.hints && (
                            <button
                                type="button"
                                onClick={() => setShowHint(prev => !prev)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--foreground-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                            >
                                <Lightbulb size={14} />
                                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5">
                        {!isSubmitted ? (
                            <button
                                type="button"
                                disabled={!activeBlankToken || isValidating}
                                onClick={handleSubmit}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                                    activeBlankToken && !isValidating
                                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                                        : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] cursor-not-allowed opacity-60'
                                }`}
                            >
                                {isValidating ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" /> Validating...
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} /> Submit Answer
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
                            >
                                <span>{currentIdx + 1 < challenges.length ? 'Next Challenge' : 'View Results'}</span>
                                <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Hint Card */}
                {showHint && currentChallenge.hints && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2 animate-in fade-in">
                        <Lightbulb size={16} className="shrink-0 mt-0.5 text-amber-500" />
                        <div>
                            <span className="font-bold block mb-0.5">Hint:</span>
                            <span>{currentChallenge.hints}</span>
                        </div>
                    </div>
                )}

                {/* Feedback Card with Educational Explanation */}
                {isSubmitted && feedback && (
                    <div className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in ${
                        feedback.isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
                    }`}>
                        <div className="flex items-center gap-2 font-black text-sm mb-1.5">
                            {feedback.isCorrect ? (
                                <>
                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                    <span>Correct! +{feedback.addedPoints} Points</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={18} className="text-rose-500" />
                                    <span>Incorrect — Correct Answer: <code className="px-1.5 py-0.5 rounded bg-black/20 font-mono">{feedback.solution}</code></span>
                                </>
                            )}
                        </div>

                        {feedback.explanation && (
                            <p className="opacity-90 pl-6">
                                {feedback.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompleteTheCodeEngine;
