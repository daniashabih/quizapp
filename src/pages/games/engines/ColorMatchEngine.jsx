import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Flame, Trophy, Check, X } from 'lucide-react';

const COLORS = [
    { name: 'RED', hex: '#ef4444' },
    { name: 'BLUE', hex: '#3b82f6' },
    { name: 'GREEN', hex: '#10b981' },
    { name: 'YELLOW', hex: '#eab308' },
    { name: 'PURPLE', hex: '#a855f7' },
    { name: 'ORANGE', hex: '#f97316' }
];

export const ColorMatchEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [currentCard, setCurrentCard] = useState({ text: 'BLUE', color: '#3b82f6', isMatch: true });
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(100); // 100% down to 0%
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const generateRound = useCallback(() => {
        const isMatch = Math.random() < 0.5;
        const textColorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
        let inkColorObj;

        if (isMatch) {
            inkColorObj = textColorObj;
        } else {
            const others = COLORS.filter(c => c.name !== textColorObj.name);
            inkColorObj = others[Math.floor(Math.random() * others.length)];
        }

        setCurrentCard({
            text: textColorObj.name,
            color: inkColorObj.hex,
            isMatch
        });
        setTimeLeft(100);
    }, []);

    const restartGame = useCallback(() => {
        setScore(0);
        setStreak(0);
        setGameOver(false);
        generateRound();
        if (onScoreUpdate) onScoreUpdate(0);
    }, [generateRound, onScoreUpdate]);

    useEffect(() => {
        generateRound();
    }, [generateRound]);

    // Timer Countdown
    useEffect(() => {
        if (gameOver || isPaused) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    setGameOver(true);
                    if (onGameOver) onGameOver(score, { reason: 'timeout', streak });
                    return 0;
                }
                // Decrements faster as score rises
                const decrement = 1.4 + Math.min(2.5, score * 0.05);
                return Math.max(0, prev - decrement);
            });
        }, 40);

        return () => clearInterval(interval);
    }, [gameOver, isPaused, score, streak, onGameOver]);

    // Answer decision
    const handleAnswer = (choice) => {
        if (gameOver || isPaused) return;

        if (choice === currentCard.isMatch) {
            // Correct!
            const newStreak = streak + 1;
            const pointsGained = 10 + newStreak * 5;
            const newScore = score + pointsGained;
            setScore(newScore);
            setStreak(newStreak);
            if (newScore > highScore) setHighScore(newScore);
            if (onScoreUpdate) onScoreUpdate(newScore);
            generateRound();
        } else {
            // Wrong!
            setGameOver(true);
            if (onGameOver) onGameOver(score, { reason: 'wrong_choice', streak });
        }
    };

    // Keyboard controls (Left Arrow = Match, Right Arrow = Not Match)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleAnswer(true);
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleAnswer(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleAnswer]);

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2.5 shadow-xs">
                {streak > 1 ? (
                    <div className="flex items-center gap-1 text-xs font-black text-amber-500 animate-pulse">
                        <Flame size={14} /> {streak}x Streak!
                    </div>
                ) : (
                    <span className="text-xs font-bold text-[var(--foreground-muted)]">Color Reflex</span>
                )}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase">Score</span>
                    <span className="text-sm font-black text-rose-500">{score}</span>
                    <button
                        onClick={restartGame}
                        className="ml-2 p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Restart"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Timer Progress Bar */}
            <div className="w-full h-2 rounded-full bg-[var(--muted-bg)] overflow-hidden mb-4 border border-[var(--card-border)]">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${timeLeft}%` }}
                />
            </div>

            {/* Target Display Box */}
            <div className="relative w-72 h-64 sm:w-80 sm:h-72 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center">
                <span className="text-xs uppercase font-extrabold text-[var(--foreground-muted)] mb-3">
                    Does text meaning match ink color?
                </span>

                <div
                    className="text-4xl sm:text-5xl font-black tracking-widest px-6 py-4 rounded-2xl bg-[var(--muted-bg)]/80 border border-[var(--card-border)] shadow-inner transform scale-105"
                    style={{ color: currentCard.color }}
                >
                    {currentCard.text}
                </div>

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
                        <Trophy className="text-rose-400 mb-2" size={36} />
                        <h3 className="text-xl font-black text-white mb-1">Time's Up!</h3>
                        <p className="text-xs text-stone-300 mb-4">
                            Final Score: <span className="text-rose-400 font-bold">{score}</span>
                        </p>
                        <button
                            onClick={restartGame}
                            className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-all shadow-lg shadow-rose-500/40 cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Answer Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <button
                    onClick={() => handleAnswer(true)}
                    disabled={gameOver || isPaused}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                >
                    <Check size={18} /> MATCH
                </button>
                <button
                    onClick={() => handleAnswer(false)}
                    disabled={gameOver || isPaused}
                    className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer"
                >
                    <X size={18} /> DIFFERENT
                </button>
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center">
                Press <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">◀ MATCH</kbd> or <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">DIFFERENT ▶</kbd>.
            </p>
        </div>
    );
};

export default ColorMatchEngine;
