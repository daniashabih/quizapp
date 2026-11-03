import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, Trophy, Timer, Sparkles, CheckCircle2 } from 'lucide-react';

const TECH_MEMORY_PAIRS = {
    react: [
        { id: '1', term: 'useState', match: 'Component State' },
        { id: '2', term: 'useEffect', match: 'Side Effects Lifecycle' },
        { id: '3', term: 'useMemo', match: 'Memoized Result' },
        { id: '4', term: 'useCallback', match: 'Memoized Function' },
        { id: '5', term: 'Props', match: 'Parent-to-Child Inputs' },
        { id: '6', term: 'JSX', match: 'Syntax Extension for JS' },
        { id: '7', term: 'Virtual DOM', match: 'In-Memory React Tree' },
        { id: '8', term: 'Context', match: 'Global State Delivery' }
    ],
    javascript: [
        { id: '1', term: 'Closure', match: 'Function + Lexical Scope' },
        { id: '2', term: 'Hoisting', match: 'Declarations Moved Up' },
        { id: '3', term: 'Event Loop', match: 'Concurrency Stack' },
        { id: '4', term: 'Promise', match: 'Eventual Async Result' },
        { id: '5', term: 'Prototype', match: 'Inheritance Chain' },
        { id: '6', term: 'Strict Mode', match: 'Prevents Silent Errors' },
        { id: '7', term: 'Currying', match: 'Unary Function Chain' },
        { id: '8', term: 'Idempotent', match: 'Same Output on Repeats' }
    ],
    python: [
        { id: '1', term: 'List Comprehension', match: 'Compact List Creation' },
        { id: '2', term: 'Decorator', match: 'Wrap Function Logic' },
        { id: '3', term: 'Generator', match: 'Lazy Yield Execution' },
        { id: '4', term: 'Dunder', match: 'Double Underscore Method' },
        { id: '5', term: 'GIL', match: 'Global Interpreter Lock' },
        { id: '6', term: 'Tuple', match: 'Immutable Sequence' },
        { id: '7', term: 'Dictionary', match: 'Hash Map Key-Values' },
        { id: '8', term: 'Lambda', match: 'Anonymous Inline Function' }
    ],
    php: [
        { id: '1', term: 'Eloquent', match: 'ActiveRecord ORM' },
        { id: '2', term: 'Artisan', match: 'CLI Management Tool' },
        { id: '3', term: 'Blade', match: 'Templating Engine' },
        { id: '4', term: 'Middleware', match: 'HTTP Request Pipeline' },
        { id: '5', term: 'Migration', match: 'Database Version Control' },
        { id: '6', term: 'Facade', match: 'Static Interface to Service' },
        { id: '7', term: 'Composer', match: 'PHP Dependency Manager' },
        { id: '8', term: 'Controller', match: 'Handles Request Logic' }
    ],
    laravel: [
        { id: '1', term: 'Eloquent', match: 'ActiveRecord ORM' },
        { id: '2', term: 'Artisan', match: 'CLI Management Tool' },
        { id: '3', term: 'Blade', match: 'Templating Engine' },
        { id: '4', term: 'Middleware', match: 'HTTP Request Pipeline' },
        { id: '5', term: 'Migration', match: 'Database Version Control' },
        { id: '6', term: 'Facade', match: 'Static Interface to Service' },
        { id: '7', term: 'Composer', match: 'PHP Dependency Manager' },
        { id: '8', term: 'Controller', match: 'Handles Request Logic' }
    ],
    sql: [
        { id: '1', term: 'Primary Key', match: 'Unique Row Identifier' },
        { id: '2', term: 'Foreign Key', match: 'Referential Table Link' },
        { id: '3', term: 'JOIN', match: 'Combine Table Records' },
        { id: '4', term: 'INDEX', match: 'B-Tree Query Speedup' },
        { id: '5', term: 'HAVING', match: 'Post-Aggregate Filter' },
        { id: '6', term: 'ACID', match: 'Transaction Guarantees' },
        { id: '7', term: 'GROUP BY', match: 'Category Aggregation' },
        { id: '8', term: 'CASCADE', match: 'Propagates Relational Edits' }
    ],
    mysql: [
        { id: '1', term: 'Primary Key', match: 'Unique Row Identifier' },
        { id: '2', term: 'Foreign Key', match: 'Referential Table Link' },
        { id: '3', term: 'JOIN', match: 'Combine Table Records' },
        { id: '4', term: 'INDEX', match: 'B-Tree Query Speedup' },
        { id: '5', term: 'HAVING', match: 'Post-Aggregate Filter' },
        { id: '6', term: 'ACID', match: 'Transaction Guarantees' },
        { id: '7', term: 'GROUP BY', match: 'Category Aggregation' },
        { id: '8', term: 'CASCADE', match: 'Propagates Relational Edits' }
    ],
    flutter: [
        { id: '1', term: 'Widget', match: 'Immutable UI Element' },
        { id: '2', term: 'StatefulWidget', match: 'Mutable Internal State' },
        { id: '3', term: 'BuildContext', match: 'Element Tree Location' },
        { id: '4', term: 'Hot Reload', match: 'Instant VM Code Injection' },
        { id: '5', term: 'Future', match: 'Single Async Value' },
        { id: '6', term: 'Stream', match: 'Asynchronous Data Series' },
        { id: '7', term: 'Scaffold', match: 'Material Layout Structure' },
        { id: '8', term: 'Pubspec', match: 'Dependency & Asset Config' }
    ],
    dart: [
        { id: '1', term: 'Widget', match: 'Immutable UI Element' },
        { id: '2', term: 'StatefulWidget', match: 'Mutable Internal State' },
        { id: '3', term: 'BuildContext', match: 'Element Tree Location' },
        { id: '4', term: 'Hot Reload', match: 'Instant VM Code Injection' },
        { id: '5', term: 'Future', match: 'Single Async Value' },
        { id: '6', term: 'Stream', match: 'Asynchronous Data Series' },
        { id: '7', term: 'Scaffold', match: 'Material Layout Structure' },
        { id: '8', term: 'Pubspec', match: 'Dependency & Asset Config' }
    ],
    html: [
        { id: '1', term: 'Semantic HTML', match: 'Meaningful Markup Tags' },
        { id: '2', term: 'Flexbox', match: '1D Flexible Layout' },
        { id: '3', term: 'CSS Grid', match: '2D Layout Matrix' },
        { id: '4', term: 'Specificity', match: 'Selector Weighting Rule' },
        { id: '5', term: 'Box Model', match: 'Content Padding Border Margin' },
        { id: '6', term: 'rem', match: 'Root Relative Font Unit' },
        { id: '7', term: 'Viewport', match: 'Visible Screen Frame' },
        { id: '8', term: 'DOCTYPE', match: 'HTML5 Mode Declaration' }
    ],
    css: [
        { id: '1', term: 'Semantic HTML', match: 'Meaningful Markup Tags' },
        { id: '2', term: 'Flexbox', match: '1D Flexible Layout' },
        { id: '3', term: 'CSS Grid', match: '2D Layout Matrix' },
        { id: '4', term: 'Specificity', match: 'Selector Weighting Rule' },
        { id: '5', term: 'Box Model', match: 'Content Padding Border Margin' },
        { id: '6', term: 'rem', match: 'Root Relative Font Unit' },
        { id: '7', term: 'Viewport', match: 'Visible Screen Frame' },
        { id: '8', term: 'DOCTYPE', match: 'HTML5 Mode Declaration' }
    ]
};

const DEFAULT_PROGRAMMING_PAIRS = [
    { id: '1', term: 'Closure', match: 'Function + Lexical Scope' },
    { id: '2', term: 'Polymorphism', match: 'Many Forms / Same Method' },
    { id: '3', term: 'Promise', match: 'Eventual Async Result' },
    { id: '4', term: 'Primary Key', match: 'Unique Row Identifier' },
    { id: '5', term: 'Virtual DOM', match: 'In-Memory React Tree' },
    { id: '6', term: 'Recursion', match: 'Function Calling Itself' },
    { id: '7', term: 'Hoisting', match: 'Moved to Top of Scope' },
    { id: '8', term: 'Idempotent', match: 'Same Output on Repeats' }
];

export const CodingMemoryMatchEngine = ({ onGameOver, onScoreUpdate, isPaused, technology, difficulty }) => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const activePairs = (technology && TECH_MEMORY_PAIRS[technology.toLowerCase()]) || DEFAULT_PROGRAMMING_PAIRS;

    // Shuffle cards
    const initGame = () => {
        const deck = [];
        activePairs.forEach(p => {
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
    }, [technology, difficulty]);

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

                if (newMatched.length === activePairs.length) {
                    setIsComplete(true);
                    const finalScore = Math.max(100, (activePairs.length * 200) - (moves * 10) - seconds * 2);
                    if (onScoreUpdate) onScoreUpdate(finalScore);
                    if (onGameOver) {
                        onGameOver({
                            score: finalScore,
                            accuracy: Math.round((activePairs.length / (moves || 1)) * 100),
                            metadata: { moves, durationSeconds: seconds, technology }
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
                        <span className="game-tech-badge flex items-center gap-1">
                            <Layers size={12} /> {technology && technology !== 'all' ? technology.toUpperCase() : 'General'}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {difficulty || 'All Levels'}
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                            Pairs: {matched.length} / {activePairs.length}
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Programming Concepts Memory Match</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Flip cards two at a time to pair programming terms with definitions.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Moves</span>
                        <span className="text-sm font-black text-[var(--foreground)]">{moves}</span>
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Time</span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{seconds}s</span>
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
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/60 text-emerald-800 dark:text-emerald-200 font-bold shadow-md scale-98'
                                        : 'bg-[var(--game-badge-bg)] border border-[var(--game-badge-border)] text-[var(--game-badge-text)] font-bold shadow-md scale-102'
                                    : 'bg-[var(--muted-bg)] border border-[var(--card-border)] text-transparent hover:border-indigo-500/40 hover:scale-102'
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
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">Completed in {moves} moves and {seconds} seconds.</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Flip cards to discover matches
                </span>
                <button
                    onClick={initGame}
                    className="game-btn-secondary"
                >
                    <RotateCcw size={14} /> Reset Board
                </button>
            </div>
        </div>
    );
};

export default CodingMemoryMatchEngine;
