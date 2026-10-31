import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Trophy, Sparkles } from 'lucide-react';

const PIPE_WIDTH = 44;
const PIPE_GAP = 105;
const GRAVITY = 0.32;
const JUMP_IMPULSE = -5.8;

export const FlappyBugEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [started, setStarted] = useState(false);

    const stateRef = useRef({
        bugY: 160,
        bugVy: 0,
        pipes: [],
        score: 0,
        started: false
    });

    const resetGame = useCallback(() => {
        stateRef.current = {
            bugY: 160,
            bugVy: 0,
            pipes: [
                { x: 340, topHeight: 90, passed: false },
                { x: 520, topHeight: 140, passed: false }
            ],
            score: 0,
            started: false
        };
        setScore(0);
        setGameOver(false);
        setStarted(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [onScoreUpdate]);

    useEffect(() => {
        resetGame();
    }, [resetGame]);

    const flap = useCallback(() => {
        if (gameOver) return;
        if (!stateRef.current.started) {
            stateRef.current.started = true;
            setStarted(true);
        }
        stateRef.current.bugVy = JUMP_IMPULSE;
    }, [gameOver]);

    // Handle spacebar / tap
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
                flap();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flap]);

    // Main animation loop
    useEffect(() => {
        if (isPaused || gameOver) return;

        let animationFrameId;

        const loop = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const state = stateRef.current;

            const W = canvas.width;
            const H = canvas.height;

            // Sky Background
            const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
            skyGrad.addColorStop(0, '#0284c7');
            skyGrad.addColorStop(0.7, '#38bdf8');
            skyGrad.addColorStop(1, '#a7f3d0');
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, W, H);

            // Ground strip
            ctx.fillStyle = '#15803d';
            ctx.fillRect(0, H - 24, W, 24);
            ctx.fillStyle = '#166534';
            ctx.fillRect(0, H - 4, W, 4);

            // Physics update if started
            if (state.started) {
                state.bugVy += GRAVITY;
                state.bugY += state.bugVy;

                // Move and spawn pipes
                for (let i = 0; i < state.pipes.length; i++) {
                    const p = state.pipes[i];
                    p.x -= 2;

                    // Score calculation when bug crosses pipe center
                    if (!p.passed && p.x + PIPE_WIDTH < 60) {
                        p.passed = true;
                        state.score += 1;
                        setScore(state.score);
                        if (onScoreUpdate) onScoreUpdate(state.score);
                    }

                    // Recycle pipe when offscreen
                    if (p.x < -PIPE_WIDTH) {
                        const rightmost = Math.max(...state.pipes.map(pipe => pipe.x));
                        p.x = rightmost + 180;
                        p.topHeight = Math.floor(Math.random() * (H - PIPE_GAP - 100)) + 40;
                        p.passed = false;
                    }

                    // Collision check with pipes
                    const bugX = 60;
                    const bugRadius = 12;

                    // Top pipe collision
                    if (bugX + bugRadius > p.x && bugX - bugRadius < p.x + PIPE_WIDTH) {
                        if (state.bugY - bugRadius < p.topHeight || state.bugY + bugRadius > p.topHeight + PIPE_GAP) {
                            setGameOver(true);
                            if (onGameOver) onGameOver(state.score, { clearedPipes: state.score });
                            return;
                        }
                    }
                }

                // Check ground or ceiling collision
                if (state.bugY + 12 >= H - 24 || state.bugY - 12 <= 0) {
                    setGameOver(true);
                    if (onGameOver) onGameOver(state.score, { clearedPipes: state.score });
                    return;
                }
            }

            // Draw Pipes
            for (let p of state.pipes) {
                // Top Pipe
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topHeight);
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(p.x - 3, p.topHeight - 14, PIPE_WIDTH + 6, 14);

                // Bottom Pipe
                const botY = p.topHeight + PIPE_GAP;
                const botH = H - 24 - botY;
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(p.x, botY, PIPE_WIDTH, botH);
                ctx.fillStyle = '#16a34a';
                ctx.fillRect(p.x - 3, botY, PIPE_WIDTH + 6, 14);
            }

            // Draw Hangbug Mascot
            const bugX = 60;
            const bugY = state.bugY;
            ctx.save();
            ctx.translate(bugX, bugY);
            // Tilt based on velocity
            const tilt = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (state.bugVy * 0.08)));
            ctx.rotate(tilt);

            // Bug Body (emerald oval)
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#059669';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Wing
            ctx.fillStyle = '#ecfdf5';
            ctx.beginPath();
            ctx.ellipse(-3, -8, 8, 5, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(6, -3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(8, -3, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Score HUD on canvas
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 6;
            ctx.fillText(state.score.toString(), W / 2, 42);
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, gameOver, onGameOver, onScoreUpdate]);

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between mb-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2.5 shadow-xs">
                <span className="text-xs font-bold text-sky-400">Flap & Dodge</span>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase">Score</span>
                    <span className="text-sm font-black text-emerald-400">{score}</span>
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
                className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 cursor-pointer touch-none"
                onClick={flap}
            >
                <canvas
                    ref={canvasRef}
                    width={320}
                    height={340}
                    className="w-72 h-76 sm:w-80 sm:h-84 block"
                />

                {/* Tap to start hint */}
                {!started && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/20">
                        <span className="px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-xs text-xs font-black text-white border border-white/20 animate-pulse shadow-xl">
                            Tap / Spacebar to Flap 🐞
                        </span>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Trophy className="text-amber-400 mb-2" size={36} />
                        <h3 className="text-xl font-black text-white mb-1">Game Over!</h3>
                        <p className="text-xs text-slate-300 mb-4">
                            You scored <span className="text-emerald-400 font-bold">{score}</span> points!
                        </p>
                        <button
                            onClick={resetGame}
                            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs transition-all shadow-lg shadow-sky-500/40 cursor-pointer"
                        >
                            Fly Again
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center">
                Click or press <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">Space</kbd> to flap wings. Avoid hitting the pipes!
            </p>
        </div>
    );
};

export default FlappyBugEngine;
