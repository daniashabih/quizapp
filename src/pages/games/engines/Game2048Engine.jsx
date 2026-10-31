import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Undo2, Trophy, Sparkles } from 'lucide-react';

const GRID_SIZE = 4;

const TILE_COLORS = {
    2: 'bg-amber-100 text-amber-900 border-amber-200',
    4: 'bg-amber-200 text-amber-900 border-amber-300',
    8: 'bg-orange-400 text-white border-orange-500 shadow-sm shadow-orange-500/40',
    16: 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-600/40',
    32: 'bg-orange-600 text-white border-orange-700 shadow-sm shadow-orange-700/50',
    64: 'bg-red-500 text-white border-red-600 shadow-md shadow-red-500/50',
    128: 'bg-yellow-400 text-yellow-950 font-black border-yellow-500 shadow-md shadow-yellow-400/50',
    256: 'bg-yellow-500 text-yellow-950 font-black border-yellow-600 shadow-lg shadow-yellow-500/60',
    512: 'bg-amber-500 text-white font-black border-amber-600 shadow-lg shadow-amber-500/60',
    1024: 'bg-amber-600 text-white font-black border-amber-700 shadow-xl shadow-amber-600/70',
    2048: 'bg-yellow-300 text-amber-950 font-black border-yellow-400 shadow-2xl shadow-yellow-300/80 animate-pulse',
    4096: 'bg-emerald-500 text-white font-black border-emerald-600 shadow-2xl shadow-emerald-500/80'
};

export const Game2048Engine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [board, setBoard] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
    const [score, setScore] = useState(0);
    const [previousState, setPreviousState] = useState(null);
    const [won, setWon] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const touchStartRef = useRef(null);

    // Spawn a random tile (2 with 90% probability, 4 with 10%)
    const spawnTile = useCallback((grid) => {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return grid;

        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return newGrid;
    }, []);

    // Initialize board with 2 tiles
    const initGame = useCallback(() => {
        let newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        newBoard = spawnTile(newBoard);
        newBoard = spawnTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setPreviousState(null);
        setWon(false);
        setGameOver(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [spawnTile, onScoreUpdate]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Check game over
    const checkGameOver = useCallback((grid) => {
        // Any empty cell?
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) return false;
            }
        }
        // Any adjacent merges possible?
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const current = grid[r][c];
                if (r + 1 < GRID_SIZE && grid[r + 1][c] === current) return false;
                if (c + 1 < GRID_SIZE && grid[r][c + 1] === current) return false;
            }
        }
        return true;
    }, []);

    // Slide and merge one row to the left
    const slideAndMergeRow = (row) => {
        const filtered = row.filter(val => val !== 0);
        let rowScore = 0;
        const newRow = [];

        for (let i = 0; i < filtered.length; i++) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedVal = filtered[i] * 2;
                newRow.push(mergedVal);
                rowScore += mergedVal;
                i++; // skip next merged element
            } else {
                newRow.push(filtered[i]);
            }
        }

        while (newRow.length < GRID_SIZE) {
            newRow.push(0);
        }

        return { newRow, rowScore };
    };

    // Move in direction: 'left', 'right', 'up', 'down'
    const move = useCallback((direction) => {
        if (isPaused || gameOver) return;

        let currentBoard = board.map(row => [...row]);
        let totalGained = 0;
        let moved = false;

        // Transform board so all moves act as 'left'
        let transformedBoard = [];
        if (direction === 'left') {
            transformedBoard = currentBoard;
        } else if (direction === 'right') {
            transformedBoard = currentBoard.map(row => [...row].reverse());
        } else if (direction === 'up') {
            transformedBoard = Array(GRID_SIZE).fill(null).map((_, c) => currentBoard.map(row => row[c]));
        } else if (direction === 'down') {
            transformedBoard = Array(GRID_SIZE).fill(null).map((_, c) => currentBoard.map(row => row[c]).reverse());
        }

        // Apply slide & merge
        const processedRows = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            const { newRow, rowScore } = slideAndMergeRow(transformedBoard[r]);
            processedRows.push(newRow);
            totalGained += rowScore;
        }

        // Untransform back to original orientation
        let finalBoard = [];
        if (direction === 'left') {
            finalBoard = processedRows;
        } else if (direction === 'right') {
            finalBoard = processedRows.map(row => [...row].reverse());
        } else if (direction === 'up') {
            finalBoard = Array(GRID_SIZE).fill(null).map((_, c) => processedRows.map(row => row[c]));
        } else if (direction === 'down') {
            finalBoard = Array(GRID_SIZE).fill(null).map((_, c) => processedRows.map(row => row[c]).reverse());
        }

        // Check if anything actually changed
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (finalBoard[r][c] !== currentBoard[r][c]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }

        if (moved) {
            // Save state for undo
            setPreviousState({
                board: currentBoard,
                score
            });

            const spawnedBoard = spawnTile(finalBoard);
            const newScore = score + totalGained;

            setBoard(spawnedBoard);
            setScore(newScore);
            if (onScoreUpdate) onScoreUpdate(newScore);

            // Check 2048 win
            if (!won) {
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (spawnedBoard[r][c] === 2048) {
                            setWon(true);
                            break;
                        }
                    }
                }
            }

            // Check game over
            if (checkGameOver(spawnedBoard)) {
                setGameOver(true);
                if (onGameOver) {
                    onGameOver(newScore, { won, maxTile: Math.max(...spawnedBoard.flat()) });
                }
            }
        }
    }, [isPaused, gameOver, board, score, onScoreUpdate, spawnTile, won, checkGameOver, onGameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') move('left');
            else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') move('right');
            else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') move('up');
            else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') move('down');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [move]);

    // Touch Swipe handling
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e) => {
        if (!touchStartRef.current) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartRef.current.x;
        const dy = touch.clientY - touchStartRef.current.y;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 30) {
            if (absX > absY) {
                if (dx > 0) move('right');
                else move('left');
            } else {
                if (dy > 0) move('down');
                else move('up');
            }
        }
        touchStartRef.current = null;
    };

    // Undo move
    const handleUndo = () => {
        if (previousState && !gameOver) {
            setBoard(previousState.board);
            setScore(previousState.score);
            setPreviousState(null);
            if (onScoreUpdate) onScoreUpdate(previousState.score);
        }
    };

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleUndo}
                        disabled={!previousState || gameOver}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            previousState && !gameOver
                                ? 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] hover:bg-[var(--muted-bg)]'
                                : 'opacity-40 cursor-not-allowed bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                        }`}
                    >
                        <Undo2 size={14} /> Undo
                    </button>
                    <button
                        onClick={initGame}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#193D35] text-white hover:bg-[#193D35]/90 transition-all cursor-pointer"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>

                <div className="bg-[var(--card-bg)] px-3.5 py-1.5 rounded-xl border border-[var(--card-border)] flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase">Score</span>
                    <span className="text-sm font-black text-amber-500">{score}</span>
                </div>
            </div>

            {/* 4x4 Grid Container */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-72 h-72 sm:w-80 sm:h-80 bg-stone-900 dark:bg-stone-950 p-2.5 rounded-3xl border-2 border-stone-800 shadow-2xl flex flex-col justify-between"
            >
                <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
                    {board.map((row, r) =>
                        row.map((cell, c) => {
                            const colorClass = TILE_COLORS[cell] || 'bg-amber-700 text-white font-black';
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={`rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-150 border ${
                                        cell === 0
                                            ? 'bg-stone-800/60 border-stone-700/30'
                                            : `${colorClass} transform scale-100`
                                    }`}
                                >
                                    {cell > 0 ? cell : ''}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Trophy className="text-amber-400 mb-2" size={36} />
                        <h3 className="text-xl font-black text-white mb-1">Game Over!</h3>
                        <p className="text-xs text-stone-300 mb-4">Final Score: <span className="text-amber-400 font-bold">{score}</span></p>
                        <button
                            onClick={initGame}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}

                {/* 2048 Win Banner */}
                {won && !gameOver && (
                    <div className="absolute top-3 left-3 right-3 bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl text-xs font-black flex items-center justify-between shadow-lg">
                        <span className="flex items-center gap-1.5"><Sparkles size={14} /> You reached 2048!</span>
                        <span className="text-[10px] uppercase font-bold opacity-80">Keep Going</span>
                    </div>
                )}
            </div>

            {/* Mobile Touch Navigation D-Pad */}
            <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
                <button
                    onClick={() => move('up')}
                    className="w-12 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-amber-500 active:text-white"
                >
                    ▲
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => move('left')}
                        className="w-12 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-amber-500 active:text-white"
                    >
                        ◀
                    </button>
                    <button
                        onClick={() => move('down')}
                        className="w-12 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-amber-500 active:text-white"
                    >
                        ▼
                    </button>
                    <button
                        onClick={() => move('right')}
                        className="w-12 h-10 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-sm font-bold flex items-center justify-center active:bg-amber-500 active:text-white"
                    >
                        ▶
                    </button>
                </div>
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center hidden sm:block">
                Use <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-mono text-[10px]">WASD</kbd> to slide tiles.
            </p>
        </div>
    );
};

export default Game2048Engine;
