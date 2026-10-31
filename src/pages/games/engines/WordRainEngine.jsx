import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Heart, RotateCcw, Sparkles, Trophy } from 'lucide-react';

const WORDS_POOL = [
    'async', 'await', 'const', 'let', 'var', 'class',
    'import', 'export', 'return', 'yield', 'lambda',
    'boolean', 'number', 'string', 'symbol', 'bigint',
    'promise', 'resolve', 'reject', 'closure', 'hoist',
    'prototype', 'iterator', 'generator', 'mutation',
    'function', 'callback', 'handler', 'listener', 'stream',
    'database', 'primary', 'foreign', 'relation', 'index'
];

export const WordRainEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [fallingWords, setFallingWords] = useState([]);
    const [typed, setTyped] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isGameOver, setIsGameOver] = useState(false);
    const [missedCount, setMissedCount] = useState(0);

    const inputRef = useRef(null);
    const lastSpawnRef = useRef(Date.now());
    const scoreRef = useRef(0);
    scoreRef.current = score;

    // Game loop for falling animation and spawning
    useEffect(() => {
        if (isPaused || isGameOver) return;

        const loop = setInterval(() => {
            const now = Date.now();

            // Spawn new word every 2.2 seconds
            if (now - lastSpawnRef.current > 2200) {
                lastSpawnRef.current = now;
                const randomWord = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
                const randomLeft = 10 + Math.random() * 75; // percentage 10% to 85%

                setFallingWords(prev => [
                    ...prev,
                    {
                        id: `${now}_${Math.random()}`,
                        text: randomWord,
                        x: randomLeft,
                        y: 0,
                        speed: 0.8 + Math.random() * 0.5
                    }
                ]);
            }

            // Move falling words down
            setFallingWords(prev => {
                const nextWords = [];
                let lostLives = 0;

                prev.forEach(w => {
                    const nextY = w.y + w.speed;
                    if (nextY >= 88) {
                        // Word reached bottom! Missed!
                        lostLives++;
                    } else {
                        nextWords.push({ ...w, y: nextY });
                    }
                });

                if (lostLives > 0) {
                    setMissedCount(m => m + lostLives);
                    setLives(l => {
                        const newLives = l - lostLives;
                        if (newLives <= 0) {
                            setIsGameOver(true);
                            if (onGameOver) {
                                onGameOver({
                                    score: scoreRef.current,
                                    accuracy: 85,
                                    metadata: { missedCount: missedCount + lostLives }
                                });
                            }
                            return 0;
                        }
                        return newLives;
                    });
                }

                return nextWords;
            });
        }, 50);

        return () => clearInterval(loop);
    }, [isPaused, isGameOver, missedCount, onGameOver]);

    // Check typed word against falling words
    const handleChange = (e) => {
        if (isPaused || isGameOver) return;
        const val = e.target.value.toLowerCase().trim();
        setTyped(val);

        // Check if val matches any falling word
        const matchIdx = fallingWords.findIndex(w => w.text === val);
        if (matchIdx !== -1) {
            // Destroy word!
            setFallingWords(prev => prev.filter((_, idx) => idx !== matchIdx));
            setTyped('');

            const points = 100 + Math.round(100 - (fallingWords[matchIdx]?.y || 0));
            setScore(prev => {
                const newScore = prev + points;
                if (onScoreUpdate) onScoreUpdate(newScore);
                return newScore;
            });
        }
    };

    const handleRestart = () => {
        setFallingWords([]);
        setTyped('');
        setScore(0);
        setLives(3);
        setMissedCount(0);
        setIsGameOver(false);
        lastSpawnRef.current = Date.now();
        if (inputRef.current) inputRef.current.focus();
    };

    return (
        <div className="flex flex-col gap-4 p-4 sm:p-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-xl max-w-3xl mx-auto w-full select-none">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                            <CloudRain size={12} /> Word Rain
                        </span>
                    </div>
                    <h2 className="text-lg font-black text-[var(--foreground)]">Word Rain Arcade</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">Type programming keywords before they touch the ground!</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Lives */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(heart => (
                            <Heart
                                key={heart}
                                size={18}
                                className={heart <= lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-600'}
                            />
                        ))}
                    </div>
                    <div className="text-right pl-3 border-l border-[var(--card-border)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                        <span className="text-base font-black text-purple-400">{score}</span>
                    </div>
                </div>
            </div>

            {/* Falling Words Canvas Sky */}
            <div
                onClick={() => inputRef.current?.focus()}
                className="relative h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-white/10 overflow-hidden shadow-inner cursor-text"
            >
                {/* Danger Floor Zone */}
                <div className="absolute bottom-0 left-0 right-0 h-9 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-center text-[10px] font-mono text-rose-300 font-bold uppercase tracking-wider">
                    CRITICAL DANGER ZONE
                </div>

                {/* Words */}
                {fallingWords.map((word) => (
                    <div
                        key={word.id}
                        style={{
                            left: `${word.x}%`,
                            top: `${word.y}%`
                        }}
                        className={`absolute font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border shadow-lg transition-transform ${
                            word.y > 65
                                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce'
                                : 'bg-purple-950/80 border-purple-400/60 text-purple-200'
                        }`}
                    >
                        {word.text}
                    </div>
                ))}

                {isGameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                        <Trophy size={36} className="text-amber-400" />
                        <h3 className="text-xl font-black text-white">Arcade Run Over</h3>
                        <p className="text-xs text-slate-300">Final Score: {score} | Missed: {missedCount}</p>
                        <button
                            onClick={handleRestart}
                            className="px-6 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-purple-400 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={handleChange}
                disabled={isGameOver || isPaused}
                placeholder="Type the lowest word to destroy it..."
                className="w-full px-5 py-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center text-sm font-mono text-[var(--foreground)] focus:outline-hidden focus:border-purple-500 transition-all"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                autoFocus
            />

            <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--foreground-muted)]">
                    Active Words in Sky: {fallingWords.length}
                </span>
                <button
                    onClick={handleRestart}
                    className="px-4 py-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-xs font-bold text-[var(--foreground-secondary)] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                    <RotateCcw size={14} /> Restart Rain
                </button>
            </div>
        </div>
    );
};

export default WordRainEngine;
