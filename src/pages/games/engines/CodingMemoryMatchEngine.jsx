import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, Trophy, Timer, Sparkles, CheckCircle2 } from 'lucide-react';

const PROGRAMMING_PAIRS = [
    { id: '1', term: 'Closure', match: 'Function + Lexical Scope' },
    { id: '2', term: 'Polymorphism', match: 'Many Forms / Same Method' },
    { id: '3', term: 'Promise', match: 'Eventual Async Result' },
    { id: '4', term: 'Primary Key', match: 'Unique Row Identifier' },
    { id: '5', term: 'Virtual DOM', match: 'In-Memory React Tree' },
    { id: '6', term: 'Recursion', match: 'Function Calling Itself' },
    { id: '7', term: 'Hoisting', match: 'Moved to Top of Scope' },
    { id: '8', term: 'Idempotent', match: 'Same Output on Repeats' }
];

export const CodingMemoryMatchEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Shuffle cards
    const initGame = () => {
        const deck = [];
        PROGRAMMING_PAIRS.forEach(p => {
            deck.push({ cardId: `${p.id}_term`, pairId: p.id, text: p.term, isTerm: true });
            deck.push({ cardId: `${p.id}_match`, pairId: p.id, text: p.match, isTerm: false });
        });
        deck.sort(() => Math.random() - 0.5);
        setCards(deck);
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setSeconds(0);
        setIsComplete(false);
    };

    useEffect(() => {
        initGame();
    }, []);

    // Timer
    useEffect(() => {
        if (isPaused || isComplete) return;
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused, isComplete]);

    const handleCardClick = (idx) => {
        if (isPaused || isComplete || flipped.length === 2) return;
        if (flipped.includes(idx) || matched.includes(cards[idx].pairId)) return;

        const newFlipped = [...flipped, idx];
        setFlipped(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [firstIdx, secondIdx] = newFlipped;
            const c1 = cards[firstIdx];
            const c2 = cards[secondIdx];

            if (c1.pairId === c2.pairId) {
                // Match!
                const newMatched = [...matched, c1.pairId];
                setMatched(newMatched);
                setFlipped([]);

                const currentScore = newMatched.length * 150 - (moves * 5);
                if (onScoreUpdate) onScoreUpdate(Math.max(0, currentScore));

                if (newMatched.length === PROGRAMMING_PAIRS.length) {
                    setIsComplete(true);
                    const finalScore = Math.max(100, (PROGRAMMING_PAIRS.length * 200) - (moves * 10) - seconds * 2);
                    if (onScoreUpdate) onScoreUpdate(finalScore);
                    if (onGameOver) {
                        onGameOver({
                            score: finalScore,
                            accuracy: Math.round((PROGRAMMING_PAIRS.length / (moves || 1)) * 100),
                            metadata: { moves, durationSeconds: seconds }
                        });
                    }
                }
            } else {
                // Not match - flip back
                setTimeout(() => {
                    setFlipped([]);
                }, 1000);
            }
        }
    };

    return (
        <div className="flex flex-col gap-5 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Layers size={12} /> Memory Recall
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Pairs: {matched.length} / {PROGRAMMING_PAIRS.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Programming Concepts Memory Match</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Flip cards two at a time to pair programming terms with definitions.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Moves</span>
                        <span className="text-sm font-black text-blue-400">{moves}</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Time</span>
                        <span className="text-sm font-black text-emerald-400">{seconds}s</span>
                    </div>
                </div>
            </div>

            {/* 4x4 Grid of Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {cards.map((card, idx) => {
                    const isFlipped = flipped.includes(idx) || matched.includes(card.pairId);
                    const isMatchedCard = matched.includes(card.pairId);

                    return (
                        <div
                            key={card.cardId}
                            onClick={() => handleCardClick(idx)}
                            className={`h-24 sm:h-28 rounded-2xl border p-2.5 flex items-center justify-center text-center font-mono cursor-pointer select-none transition-all duration-300 transform ${
                                isFlipped
                                    ? isMatchedCard
                                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-md scale-98'
                                        : 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 shadow-md scale-102'
                                    : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-transparent hover:border-blue-500/40 hover:scale-102'
                            }`}
                        >
                            {isFlipped ? (
                                <div className="flex flex-col items-center gap-1">
                                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                        card.isTerm ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                        {card.isTerm ? 'Concept' : 'Definition'}
                                    </span>
                                    <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-tight">
                                        {card.text}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-xl opacity-30 text-[var(--foreground-muted)]">⚡</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {isComplete && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 size={24} className="shrink-0" />
                    <div>
                        <p className="font-black text-sm">All Concepts Matched! Memory Master!</p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">Completed in {moves} moves and {seconds} seconds.</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Flip cards to discover matches
                </span>
                <button
                    onClick={initGame}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Reset Board
                </button>
            </div>
        </div>
    );
};

export default CodingMemoryMatchEngine;
