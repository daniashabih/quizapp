import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Heart, Trophy, Sparkles } from 'lucide-react';

const BRICK_ROWS = 4;
const BRICK_COLS = 7;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 65;
const BALL_RADIUS = 5;

const ROW_COLORS = [
    { fill: '#ef4444', score: 40 }, // Red
    { fill: '#f97316', score: 30 }, // Orange
    { fill: '#eab308', score: 20 }, // Yellow
    { fill: '#10b981', score: 10 }  // Green
];

export const BrickBreakerEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [started, setStarted] = useState(false);

    // Refs for physics loop
    const stateRef = useRef({
        paddleX: 130,
        ballX: 160,
        ballY: 280,
        ballDx: 2.5,
        ballDy: -2.5,
        bricks: [],
        lives: 3,
        score: 0,
        started: false
    });

    const initBricks = useCallback(() => {
        const bricks = [];
        for (let r = 0; r < BRICK_ROWS; r++) {
            bricks[r] = [];
            for (let c = 0; c < BRICK_COLS; c++) {
                bricks[r][c] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: ROW_COLORS[r].fill,
                    value: ROW_COLORS[r].score
                };
            }
        }
        return bricks;
    }, []);

    const resetGame = useCallback(() => {
        const bricks = initBricks();
        stateRef.current = {
            paddleX: 130,
            ballX: 160,
            ballY: 280,
            ballDx: (Math.random() > 0.5 ? 2.5 : -2.5),
            ballDy: -3,
            bricks,
            lives: 3,
            score: 0,
            started: false
        };
        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setStarted(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [initBricks, onScoreUpdate]);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    // Handle mouse & touch movement
    const updatePaddlePosition = (clientX) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const scale = canvas.width / rect.width;
        const scaledX = relativeX * scale;
        const newPaddleX = Math.max(0, Math.min(canvas.width - PADDLE_WIDTH, scaledX - PADDLE_WIDTH / 2));
        stateRef.current.paddleX = newPaddleX;

        if (!stateRef.current.started) {
            stateRef.current.ballX = newPaddleX + PADDLE_WIDTH / 2;
        }
    };

    const handleMouseMove = (e) => updatePaddlePosition(e.clientX);
    const handleTouchMove = (e) => {
        if (e.touches.length > 0) {
            updatePaddlePosition(e.touches[0].clientX);
        }
    };

    const handleCanvasClick = () => {
        if (!stateRef.current.started && !gameOver && !gameWon) {
            stateRef.current.started = true;
            setStarted(true);
        }
    };

    // Keyboard paddle controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === ' ' && !stateRef.current.started && !gameOver && !gameWon) {
                stateRef.current.started = true;
                setStarted(true);
                return;
            }
            const step = 20;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                stateRef.current.paddleX = Math.max(0, stateRef.current.paddleX - step);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                const canvas = canvasRef.current;
                const max = canvas ? canvas.width - PADDLE_WIDTH : 260;
                stateRef.current.paddleX = Math.min(max, stateRef.current.paddleX + step);
            }
            if (!stateRef.current.started) {
                stateRef.current.ballX = stateRef.current.paddleX + PADDLE_WIDTH / 2;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameOver, gameWon]);

    // Main animation & collision loop
    useEffect(() => {
        if (isPaused || gameOver || gameWon) return;

        let animationFrameId;

        const loop = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const state = stateRef.current;

            const W = canvas.width;
            const H = canvas.height;

            // Clear frame
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, W, H);

            // Brick Layout Constants
            const brickPadding = 6;
            const brickOffsetTop = 32;
            const brickOffsetLeft = 14;
            const brickWidth = (W - brickOffsetLeft * 2 - (BRICK_COLS - 1) * brickPadding) / BRICK_COLS;
            const brickHeight = 13;

            let remainingBricks = 0;

            // Draw Bricks & Check Collisions
            for (let r = 0; r < BRICK_ROWS; r++) {
                for (let c = 0; c < BRICK_COLS; c++) {
                    const b = state.bricks[r]?.[c];
                    if (b && b.status === 1) {
                        remainingBricks++;
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        b.x = brickX;
                        b.y = brickY;

                        // Collision detection with ball
                        if (
                            state.ballX + BALL_RADIUS > brickX &&
                            state.ballX - BALL_RADIUS < brickX + brickWidth &&
                            state.ballY + BALL_RADIUS > brickY &&
                            state.ballY - BALL_RADIUS < brickY + brickHeight
                        ) {
                            state.ballDy = -state.ballDy;
                            b.status = 0;
                            state.score += b.value;
                            setScore(state.score);
                            if (onScoreUpdate) onScoreUpdate(state.score);
                        }

                        // Draw Brick
                        ctx.fillStyle = b.color;
                        ctx.shadowColor = b.color;
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 3);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }
            }

            // Check Win
            if (remainingBricks === 0 && state.started) {
                setGameWon(true);
                const finalScore = state.score + 500;
                setScore(finalScore);
                if (onScoreUpdate) onScoreUpdate(finalScore);
                if (onGameOver) onGameOver(finalScore, { cleared: true, livesLeft: state.lives });
                return;
            }

            // Draw Paddle
            const paddleY = H - 24;
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(state.paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Ball
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Move ball if started
            if (state.started) {
                // Wall collisions (left / right)
                if (state.ballX + state.ballDx > W - BALL_RADIUS || state.ballX + state.ballDx < BALL_RADIUS) {
                    state.ballDx = -state.ballDx;
                }
                // Wall collision (top)
                if (state.ballY + state.ballDy < BALL_RADIUS) {
                    state.ballDy = -state.ballDy;
                }
                // Paddle collision
                else if (
                    state.ballY + state.ballDy > paddleY - BALL_RADIUS &&
                    state.ballY < paddleY + PADDLE_HEIGHT
                ) {
                    if (state.ballX > state.paddleX - 4 && state.ballX < state.paddleX + PADDLE_WIDTH + 4) {
                        // Dynamic deflection angle based on hit position
                        const hitPoint = (state.ballX - (state.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
                        state.ballDx = hitPoint * 3.5;
                        state.ballDy = -Math.abs(state.ballDy);
                    }
                }
                // Ball hits bottom
                else if (state.ballY + state.ballDy > H) {
                    state.lives--;
                    setLives(state.lives);

                    if (state.lives <= 0) {
                        setGameOver(true);
                        if (onGameOver) onGameOver(state.score, { cleared: false });
                        return;
                    } else {
                        // Reset ball to paddle
                        state.started = false;
                        setStarted(false);
                        state.paddleX = W / 2 - PADDLE_WIDTH / 2;
                        state.ballX = W / 2;
                        state.ballY = paddleY - BALL_RADIUS - 2;
                        state.ballDy = -3;
                        state.ballDx = (Math.random() > 0.5 ? 2.5 : -2.5);
                    }
                }

                state.ballX += state.ballDx;
                state.ballY += state.ballDy;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, gameOver, gameWon, onGameOver, onScoreUpdate]);

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Header Toolbar */}
            <div className="w-full flex items-center justify-between mb-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2.5 shadow-xs">
                {/* Lives */}
                <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((heart) => (
                        <Heart
                            key={heart}
                            size={16}
                            className={heart <= lives ? 'text-red-500 fill-red-500' : 'text-slate-600'}
                        />
                    ))}
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase">Score</span>
                    <span className="text-sm font-black text-indigo-400">{score}</span>
                    <button
                        onClick={resetGame}
                        className="ml-2 p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Restart"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
            </div>

            {/* Canvas Viewport */}
            <div
                className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 cursor-crosshair touch-none"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
            >
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={340}
                    className="w-72 h-76 sm:w-80 sm:h-84 block"
                />

                {/* Tap to launch hint */}
                {!started && !gameOver && !gameWon && (
                    <div className="absolute inset-x-0 bottom-16 flex justify-center pointer-events-none">
                        <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-xs text-xs font-bold text-cyan-300 border border-cyan-400/30 animate-pulse shadow-lg">
                            Tap / Click to Launch Ball 🚀
                        </span>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Trophy className="text-red-400 mb-2" size={36} />
                        <h3 className="text-xl font-black text-white mb-1">Game Over!</h3>
                        <p className="text-xs text-slate-300 mb-4">
                            Final Score: <span className="text-indigo-400 font-bold">{score}</span>
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs transition-all shadow-lg shadow-indigo-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* Victory Overlay */}
                {gameWon && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Sparkles className="text-amber-400 mb-2 animate-bounce" size={38} />
                        <h3 className="text-xl font-black text-white mb-1">Board Cleared! 🏆</h3>
                        <p className="text-xs text-slate-300 mb-4">
                            All bricks smashed! Score: <span className="text-amber-400 font-bold">{score}</span>
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center">
                Move paddle with mouse, finger drag, or <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">Arrow Keys</kbd>.
            </p>
        </div>
    );
};

export default BrickBreakerEngine;
