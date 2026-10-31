import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Sparkles, Timer, MousePointerClick, Star } from 'lucide-react';

const CARD_SYMBOLS = ['🚀', '🎮', '⚡', '💎', '🐞', '🧠', '🎯', '🏆'];

export const MemoryMatchEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [streak, setStreak] = useState(0);
    const [score, setScore] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    // Shuffle and initialize deck
    const initCards = useCallback(() => {
        const deck = [...CARD_SYMBOLS, ...CARD_SYMBOLS]
            .map((symbol, id) => ({ id, symbol }))
            .sort(() => Math.random() - 0.5);

        setCards(deck);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setStreak(0);
        setScore(0);
        setSeconds(0);
        setGameStarted(false);
        setGameWon(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [onScoreUpdate]);

    useEffect(() => {
        initCards();
    }, [initCards]);

    // Timer
    useEffect(() => {
        let interval = null;
        if (gameStarted && !gameWon && !isPaused) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStarted, gameWon, isPaused]);

    // Card click handler
    const handleCardClick = (id) => {
        if (isPaused || gameWon || flipped.length === 2 || flipped.includes(id) || matched.includes(id)) {
            return;
        }

        if (!gameStarted) setGameStarted(true);

        const newFlipped = [...flipped, id];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard.symbol === secondCard.symbol) {
                // Match!
                const newMatched = [...matched, firstId, secondId];
                setMatched(newMatched);
                setFlipped([]);

                const newStreak = streak + 1;
                setStreak(newStreak);

                // Score: 100 base + streak multiplier
                const gained = 100 + newStreak * 40;
                const newScore = score + gained;
                setScore(newScore);
                if (onScoreUpdate) onScoreUpdate(newScore);

                // Check Win
                if (newMatched.length === cards.length) {
                    setGameWon(true);
                    // Speed bonus
                    const timeBonus = Math.max(0, 300 - seconds * 5);
                    const finalScore = newScore + timeBonus;
                    setScore(finalScore);
                    if (onScoreUpdate) onScoreUpdate(finalScore);
                    if (onGameOver) onGameOver(finalScore, { moves: moves + 1, seconds, stars: moves < 14 ? 3 : (moves < 20 ? 2 : 1) });
                }
            } else {
                // No match
                setStreak(0);
                setTimeout(() => {
                    setFlipped([]);
                }, 850);
            }
        }
    };

    // Calculate stars
    const stars = moves <= 12 ? 3 : (moves <= 18 ? 2 : 1);

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Stats Header */}
            <div className="w-full grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center gap-1.5 shadow-2xs">
                    <MousePointerClick size={14} className="text-cyan-500" />
                    <span className="text-xs font-bold">{moves} Moves</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center gap-1.5 shadow-2xs">
                    <Timer size={14} className="text-amber-500" />
                    <span className="text-xs font-bold font-mono">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center gap-1.5 shadow-2xs">
                    <Sparkles size={14} className="text-purple-500" />
                    <span className="text-xs font-black text-purple-400">{score}</span>
                </div>
            </div>

            {/* Streak & Reset Row */}
            <div className="w-full flex items-center justify-between mb-3 px-1 text-xs">
                {streak > 1 ? (
                    <span className="text-amber-400 font-extrabold animate-bounce">
                        🔥 {streak}x Match Combo!
                    </span>
                ) : (
                    <span className="text-[var(--foreground-muted)]">Find matching pairs</span>
                )}
                <button
                    onClick={initCards}
                    className="flex items-center gap-1 text-[11px] font-bold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                    <RotateCcw size={13} /> Reset Cards
                </button>
            </div>

            {/* 4x4 Cards Grid */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-3 shadow-xl">
                <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
                    {cards.map((card) => {
                        const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
                        const isMatch = matched.includes(card.id);

                        return (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card.id)}
                                disabled={isFlipped || isPaused || gameWon}
                                className={`rounded-xl flex items-center justify-center font-bold text-2xl transition-all duration-300 transform perspective-500 cursor-pointer ${
                                    isMatch
                                        ? 'bg-purple-500/20 border-2 border-purple-400 shadow-sm shadow-purple-500/30 text-purple-200 scale-95'
                                        : isFlipped
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50 scale-100 rotate-y-0'
                                        : 'bg-[var(--muted-bg)] hover:bg-[var(--muted-bg)]/80 border border-[var(--card-border)] hover:scale-102 text-transparent'
                                }`}
                            >
                                {isFlipped ? card.symbol : (
                                    <span className="text-sm font-extrabold text-[var(--foreground-muted)] opacity-40">?</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Win Modal Overlay */}
                {gameWon && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3].map((starIdx) => (
                                <Star
                                    key={starIdx}
                                    size={28}
                                    className={starIdx <= stars ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-stone-600'}
                                />
                            ))}
                        </div>
                        <h3 className="text-xl font-black text-white mb-1">Puzzle Solved! 🎉</h3>
                        <p className="text-xs text-stone-300 mb-1">
                            Cleared in <span className="font-bold text-purple-400">{moves} moves</span> ({seconds}s)
                        </p>
                        <p className="text-sm font-black text-amber-400 mb-4">Final Score: {score}</p>
                        <button
                            onClick={initCards}
                            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-black text-xs transition-all shadow-lg shadow-purple-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center">
                Tap or click cards to flip them. Match all 8 pairs in minimum moves to earn 3 stars!
            </p>
        </div>
    );
};

export default MemoryMatchEngine;
