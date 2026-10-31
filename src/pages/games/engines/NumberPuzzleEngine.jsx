import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Timer, MousePointerClick, Trophy, Sparkles } from 'lucide-react';

const SIZE = 3; // 3x3 (8 puzzle) for snappy, fun mobile play

export const NumberPuzzleEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [tiles, setTiles] = useState([]);
    const [moves, setMoves] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const [started, setStarted] = useState(false);

    // Generate a guaranteed solvable puzzle by scrambling from solved state
    const scramble = useCallback(() => {
        let current = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // 0 is empty slot
        let emptyPos = 8;

        for (let i = 0; i < 40; i++) {
            const validNeighbors = [];
            const r = Math.floor(emptyPos / SIZE);
            const c = emptyPos % SIZE;

            if (r > 0) validNeighbors.push(emptyPos - SIZE); // Up
            if (r < SIZE - 1) validNeighbors.push(emptyPos + SIZE); // Down
            if (c > 0) validNeighbors.push(emptyPos - 1); // Left
            if (c < SIZE - 1) validNeighbors.push(emptyPos + 1); // Right

            const nextPos = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            // Swap
            current[emptyPos] = current[nextPos];
            current[nextPos] = 0;
            emptyPos = nextPos;
        }

        setTiles(current);
        setMoves(0);
        setSeconds(0);
        setIsSolved(false);
        setStarted(false);
        if (onScoreUpdate) onScoreUpdate(0);
    }, [onScoreUpdate]);

    useEffect(() => {
        scramble();
    }, [scramble]);

    // Timer
    useEffect(() => {
        let interval = null;
        if (started && !isSolved && !isPaused) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [started, isSolved, isPaused]);

    // Check if board matches [1, 2, 3, 4, 5, 6, 7, 8, 0]
    const checkWin = (board) => {
        for (let i = 0; i < 8; i++) {
            if (board[i] !== i + 1) return false;
        }
        return board[8] === 0;
    };

    // Move tile
    const handleTileClick = (index) => {
        if (isPaused || isSolved || tiles[index] === 0) return;

        const emptyIdx = tiles.indexOf(0);
        const r1 = Math.floor(index / SIZE);
        const c1 = index % SIZE;
        const r2 = Math.floor(emptyIdx / SIZE);
        const c2 = emptyIdx % SIZE;

        // Must be adjacent
        const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
        if (!isAdjacent) return;

        if (!started) setStarted(true);

        const newTiles = [...tiles];
        newTiles[emptyIdx] = tiles[index];
        newTiles[index] = 0;
        setTiles(newTiles);

        const newMoves = moves + 1;
        setMoves(newMoves);

        if (checkWin(newTiles)) {
            setIsSolved(true);
            const score = Math.max(100, 1000 - newMoves * 20 - seconds * 5);
            if (onScoreUpdate) onScoreUpdate(score);
            if (onGameOver) onGameOver(score, { moves: newMoves, seconds });
        }
    };

    return (
        <div className="flex flex-col items-center max-w-sm mx-auto w-full select-none p-2">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                        <MousePointerClick size={14} />
                        <span>{moves} Moves</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 font-mono">
                        <Timer size={14} />
                        <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>

                <button
                    onClick={scramble}
                    className="p-1.5 rounded-lg bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors cursor-pointer"
                    title="Reshuffle"
                >
                    <RotateCcw size={14} />
                </button>
            </div>

            {/* 3x3 Grid */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-3 shadow-xl">
                <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
                    {tiles.map((val, idx) => {
                        const isEmpty = val === 0;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleTileClick(idx)}
                                disabled={isEmpty || isPaused || isSolved}
                                className={`rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all duration-150 cursor-pointer ${
                                    isEmpty
                                        ? 'bg-transparent border-2 border-dashed border-[var(--card-border)]'
                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95 border border-blue-400/30'
                                }`}
                            >
                                {!isEmpty && val}
                            </button>
                        );
                    })}
                </div>

                {/* Victory Modal */}
                {isSolved && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                        <Sparkles className="text-amber-400 mb-2 animate-bounce" size={38} />
                        <h3 className="text-xl font-black text-white mb-1">Solved in {moves} Moves! 🏆</h3>
                        <p className="text-xs text-stone-300 mb-4">Time: {seconds}s</p>
                        <button
                            onClick={scramble}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-500/40 cursor-pointer"
                        >
                            Play Again
                        </button>
                    </div>
                )}
            </div>

            <p className="mt-3 text-[11px] text-[var(--foreground-muted)] text-center">
                Click tiles adjacent to the empty spot to slide them. Arrange in order 1 through 8!
            </p>
        </div>
    );
};

export default NumberPuzzleEngine;
