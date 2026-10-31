import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Apple, Sparkles, Trophy } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const BASE_SPEED = 140; // ms per tick

export const SnakeEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const canvasRef = useRef(null);
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [direction, setDirection] = useState(INITIAL_DIRECTION);
    const [food, setFood] = useState({ x: 15, y: 10 });
    const [goldenFood, setGoldenFood] = useState(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [applesEaten, setApplesEaten] = useState(0);

    const directionRef = useRef(INITIAL_DIRECTION);
    directionRef.current = direction;

    // Generate random unoccupied position
    const generateFoodPosition = useCallback((currentSnake) => {
        let newPos;
        let isOccupied = true;
        while (isOccupied) {
            newPos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            isOccupied = currentSnake.some(seg => seg.x === newPos.x && seg.y === newPos.y);
        }
        return newPos;
    }, []);

    // Restart game
    const restartGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDirection(INITIAL_DIRECTION);
        directionRef.current = INITIAL_DIRECTION;
        setFood({ x: 15, y: 10 });
        setGoldenFood(null);
        setScore(0);
        setApplesEaten(0);
        setGameOver(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [onScoreUpdate]);

    // Handle direction changes safely
    const changeDirection = useCallback((newDir) => {
        const current = directionRef.current;
        // Prevent 180-degree immediate reversal into own neck
        if (newDir.x !== -current.x && newDir.y !== -current.y) {
            setDirection(newDir);
            directionRef.current = newDir;
        }
    }, []);

    // Keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            if (gameOver || isPaused) return;

            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection({ x: 0, y: -1 });
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection({ x: 0, y: 1 });
            else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection({ x: -1, y: 0 });
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection({ x: 1, y: 0 });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeDirection, gameOver, isPaused]);

    // Golden apple timer
    useEffect(() => {
        if (!goldenFood) return;
        const timer = setTimeout(() => {
            setGoldenFood(null);
        }, 7000);
        return () => clearTimeout(timer);
    }, [goldenFood]);

    // Main Game Loop Tick
    useEffect(() => {
        if (gameOver || isPaused) return;

        // Speed increases by 2ms for every 30 points, down to 60ms min
        const speed = Math.max(65, BASE_SPEED - Math.floor(score / 30) * 3);

        const tick = setInterval(() => {
            setSnake((prevSnake) => {
                const currentDir = directionRef.current;
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + currentDir.x,
                    y: head.y + currentDir.y
                };

                // Check wall collision
                if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                    setGameOver(true);
                    if (onGameOver) onGameOver(score, { length: prevSnake.length });
                    return prevSnake;
                }

                // Check self collision
                if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
                    setGameOver(true);
                    if (onGameOver) onGameOver(score, { length: prevSnake.length });
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check standard food eaten
                if (newHead.x === food.x && newHead.y === food.y) {
                    const newScore = score + 10;
                    const newApples = applesEaten + 1;
                    setScore(newScore);
                    setApplesEaten(newApples);
                    if (onScoreUpdate) onScoreUpdate(newScore);
                    setFood(generateFoodPosition(newSnake));

                    // Spawn golden apple every 4 apples
                    if (newApples % 4 === 0 && !goldenFood) {
                        setGoldenFood(generateFoodPosition(newSnake));
                    }
                } else if (goldenFood && newHead.x === goldenFood.x && newHead.y === goldenFood.y) {
                    // Golden food eaten!
                    const newScore = score + 50;
                    setScore(newScore);
                    setGoldenFood(null);
                    if (onScoreUpdate) onScoreUpdate(newScore);
                } else {
                    newSnake.pop(); // Remove tail segment
                }

                return newSnake;
            });
        }, speed);

        return () => clearInterval(tick);
    }, [gameOver, isPaused, score, food, goldenFood, applesEaten, generateFoodPosition, onGameOver, onScoreUpdate]);

    // Draw canvas whenever snake or food updates
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        const cell = size / GRID_SIZE;

        // Background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, size, size);

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= size; i += cell) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }

        // Draw Standard Food (Red Apple)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Little leaf
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(food.x * cell + cell / 2 - 1, food.y * cell + 1, 2, 3);

        // Draw Golden Food if active
        if (goldenFood) {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(goldenFood.x * cell + cell / 2, goldenFood.y * cell + cell / 2, cell / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset
        }

        // Draw Snake
        snake.forEach((segment, idx) => {
            const isHead = idx === 0;
            ctx.fillStyle = isHead ? '#34d399' : (idx % 2 === 0 ? '#10b981' : '#059669');
            const padding = 1;
            const x = segment.x * cell + padding;
            const y = segment.y * cell + padding;
            const w = cell - padding * 2;
            const h = cell - padding * 2;
            const r = isHead ? 4 : 2;

            // Draw rounded rectangle
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();

            // Head details (Eyes)
            if (isHead) {
                ctx.fillStyle = '#0f172a';
                const eyeSize = 2;
                if (directionRef.current.x === 1) {
                    ctx.fillRect(x + w - 4, y + 3, eyeSize, eyeSize);
                    ctx.fillRect(x + w - 4, y + h - 5, eyeSize, eyeSize);
                } else if (directionRef.current.x === -1) {
                    ctx.fillRect(x + 2, y + 3, eyeSize, eyeSize);
                    ctx.fillRect(x + 2, y + h - 5, eyeSize, eyeSize);
                } else if (directionRef.current.y === -1) {
                    ctx.fillRect(x + 3, y + 2, eyeSize, eyeSize);
                    ctx.fillRect(x + w - 5, y + 2, eyeSize, eyeSize);
                } else {
                    ctx.fillRect(x + 3, y + h - 4, eyeSize, eyeSize);
                    ctx.fillRect(x + w - 5, y + h - 4, eyeSize, eyeSize);
                }
            }
        });
    }, [snake, food, goldenFood]);

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between mb-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                        <Apple size={14} />
                        <span>{applesEaten}</span>
                    </div>
                    {goldenFood && (
                        <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded-full">
                            <Sparkles size={12} /> Golden Apple!
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase">Score</span>
                    <span className="text-sm font-black text-emerald-400">{score}</span>
                    <button
                        onClick={restartGame}
                        className="ml-2 p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Restart"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Canvas Screen */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="w-72 h-72 sm:w-80 sm:h-80 block"
                />

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Trophy className="text-emerald-400 mb-2" size={36} />
                        <h3 className="text-xl font-black text-white mb-1">Crash! Game Over</h3>
                        <p className="text-xs text-slate-300 mb-4">
                            Score: <span className="text-emerald-400 font-bold">{score}</span> | Length: <span className="text-white font-bold">{snake.length}</span>
                        </p>
                        <button
                            onClick={restartGame}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            {/* On-screen Mobile D-Pad */}
            <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
                <button
                    onClick={() => changeDirection({ x: 0, y: -1 })}
                    className="w-12 h-11 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-emerald-500 active:text-white"
                >
                    ▲
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => changeDirection({ x: -1, y: 0 })}
                        className="w-12 h-11 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-emerald-500 active:text-white"
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => changeDirection({ x: 0, y: 1 })}
                        className="w-12 h-11 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-emerald-500 active:text-white"
                    >
                        ▼
                    </button>
                    <button
                        onClick={() => changeDirection({ x: 1, y: 0 })}
                        className="w-12 h-11 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-emerald-500 active:text-white"
                    >
                        ▶
                    </button>
                </div>
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center hidden sm:block">
                Use <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">WASD</kbd> to steer the snake.
            </p>
        </div>
    );
};

export default SnakeEngine;
