import React, { useState, useEffect, useCallback } from 'react';
import { Bot, User, RotateCcw, Trophy, Sparkles, Flame } from 'lucide-react';

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const TicTacToeEngine = ({ onGameOver, onScoreUpdate, isPaused }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'pvp'
    const [aiDifficulty, setAiDifficulty] = useState('unbeatable'); // 'easy', 'medium', 'unbeatable'
    const [winner, setWinner] = useState(null);
    const [winningLine, setWinningLine] = useState(null);
    const [score, setScore] = useState(0);
    const [winStreak, setWinStreak] = useState(0);
    const [stats, setStats] = useState({ xWins: 0, oWins: 0, ties: 0 });

    const checkWinner = useCallback((currentBoard) => {
        for (let combo of WINNING_COMBINATIONS) {
            const [a, b, c] = combo;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return { winner: currentBoard[a], line: combo };
            }
        }
        if (currentBoard.every(cell => cell !== null)) {
            return { winner: 'Tie', line: null };
        }
        return null;
    }, []);

    // Minimax algorithm for unbeatable AI
    const minimax = useCallback((newBoard, depth, isMaximizing) => {
        const result = checkWinner(newBoard);
        if (result) {
            if (result.winner === 'O') return 10 - depth;
            if (result.winner === 'X') return depth - 10;
            if (result.winner === 'Tie') return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (newBoard[i] === null) {
                    newBoard[i] = 'O';
                    let currentScore = minimax(newBoard, depth + 1, false);
                    newBoard[i] = null;
                    bestScore = Math.max(bestScore, currentScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (newBoard[i] === null) {
                    newBoard[i] = 'X';
                    let currentScore = minimax(newBoard, depth + 1, true);
                    newBoard[i] = null;
                    bestScore = Math.min(bestScore, currentScore);
                }
            }
            return bestScore;
        }
    }, [checkWinner]);

    const getAiMove = useCallback((currentBoard) => {
        const availableMoves = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (availableMoves.length === 0) return null;

        // Easy: Random move
        if (aiDifficulty === 'easy') {
            const randomIdx = Math.floor(Math.random() * availableMoves.length);
            return availableMoves[randomIdx];
        }

        // Medium: 50% minimax, 50% random
        if (aiDifficulty === 'medium') {
            if (Math.random() > 0.6) {
                const randomIdx = Math.floor(Math.random() * availableMoves.length);
                return availableMoves[randomIdx];
            }
        }

        // Unbeatable: Minimax
        let bestScore = -Infinity;
        let bestMove = availableMoves[0];

        for (let move of availableMoves) {
            currentBoard[move] = 'O';
            const moveScore = minimax(currentBoard, 0, false);
            currentBoard[move] = null;
            if (moveScore > bestScore) {
                bestScore = moveScore;
                bestMove = move;
            }
        }
        return bestMove;
    }, [aiDifficulty, minimax]);

    const handleCellClick = (index) => {
        if (isPaused || board[index] || winner) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? 'X' : 'O';
        setBoard(newBoard);

        const outcome = checkWinner(newBoard);
        if (outcome) {
            handleOutcome(outcome.winner, outcome.line);
            return;
        }

        setIsXNext(!isXNext);
    };

    const handleOutcome = (won, line) => {
        setWinner(won);
        setWinningLine(line);

        if (won === 'X') {
            const streakBonus = (winStreak + 1) * 25;
            const diffMult = aiDifficulty === 'unbeatable' ? 150 : (aiDifficulty === 'medium' ? 100 : 50);
            const gained = diffMult + streakBonus;
            const newTotal = score + gained;
            setScore(newTotal);
            setWinStreak(prev => prev + 1);
            setStats(prev => ({ ...prev, xWins: prev.xWins + 1 }));
            if (onScoreUpdate) onScoreUpdate(newTotal);
            if (onGameOver) onGameOver(newTotal, { result: 'win', difficulty: aiDifficulty, streak: winStreak + 1 });
        } else if (won === 'O') {
            setWinStreak(0);
            setStats(prev => ({ ...prev, oWins: prev.oWins + 1 }));
            if (onGameOver) onGameOver(score, { result: 'loss', difficulty: aiDifficulty });
        } else if (won === 'Tie') {
            const tiePoints = 20;
            const newTotal = score + tiePoints;
            setScore(newTotal);
            setStats(prev => ({ ...prev, ties: prev.ties + 1 }));
            if (onScoreUpdate) onScoreUpdate(newTotal);
            if (onGameOver) onGameOver(newTotal, { result: 'tie', difficulty: aiDifficulty });
        }
    };

    // AI Turn Trigger
    useEffect(() => {
        if (gameMode === 'ai' && !isXNext && !winner && !isPaused) {
            const timer = setTimeout(() => {
                const move = getAiMove([...board]);
                if (move !== null) {
                    const newBoard = [...board];
                    newBoard[move] = 'O';
                    setBoard(newBoard);

                    const outcome = checkWinner(newBoard);
                    if (outcome) {
                        handleOutcome(outcome.winner, outcome.line);
                    } else {
                        setIsXNext(true);
                    }
                }
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, winner, board, isPaused, getAiMove, checkWinner]);

    const resetRound = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setWinningLine(null);
    };

    return (
        <div className="flex flex-col items-center max-w-md mx-auto w-full p-4 select-none">
            {/* Game Options & Stats Bar */}
            <div className="w-full flex items-center justify-between mb-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-3 shadow-xs">
                {/* Mode Selector */}
                <div className="flex bg-[var(--muted-bg)] p-1 rounded-xl gap-1">
                    <button
                        onClick={() => { setGameMode('ai'); resetRound(); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                            gameMode === 'ai'
                                ? 'bg-[#193D35] text-white shadow-xs'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        <Bot size={13} /> vs AI
                    </button>
                    <button
                        onClick={() => { setGameMode('pvp'); resetRound(); }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                            gameMode === 'pvp'
                                ? 'bg-[#193D35] text-white shadow-xs'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                        }`}
                    >
                        <User size={13} /> 2 Players
                    </button>
                </div>

                {/* AI Difficulty dropdown if AI mode */}
                {gameMode === 'ai' ? (
                    <select
                        value={aiDifficulty}
                        onChange={(e) => { setAiDifficulty(e.target.value); resetRound(); }}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-hidden"
                    >
                        <option value="easy">Easy AI</option>
                        <option value="medium">Medium AI</option>
                        <option value="unbeatable">Unbeatable AI</option>
                    </select>
                ) : (
                    <div className="text-xs font-bold text-amber-500 flex items-center gap-1">
                        <Trophy size={13} /> Pass & Play
                    </div>
                )}
            </div>

            {/* Turn & Streak Banner */}
            <div className="w-full flex items-center justify-between px-2 mb-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--foreground-muted)]">Turn:</span>
                    <span className={`px-2 py-0.5 rounded-md ${isXNext ? 'bg-cyan-500/20 text-cyan-500' : 'bg-rose-500/20 text-rose-500'}`}>
                        {isXNext ? 'Player X' : (gameMode === 'ai' ? 'AI Bot (O)' : 'Player O')}
                    </span>
                </div>

                {winStreak > 0 && (
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                        <Flame size={13} />
                        <span>{winStreak} Win Streak!</span>
                    </div>
                )}
            </div>

            {/* 3x3 Grid Board */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-[var(--card-bg)] border-2 border-[var(--card-border)] rounded-3xl p-3 shadow-xl">
                <div className="grid grid-cols-3 grid-rows-3 gap-2.5 w-full h-full">
                    {board.map((cell, idx) => {
                        const isWinningCell = winningLine && winningLine.includes(idx);
                        return (
                            <button
                                key={idx}
                                onClick={() => handleCellClick(idx)}
                                disabled={Boolean(cell || winner || isPaused || (gameMode === 'ai' && !isXNext))}
                                className={`rounded-2xl flex items-center justify-center font-black text-4xl sm:text-5xl transition-all duration-200 cursor-pointer ${
                                    isWinningCell
                                        ? 'bg-amber-400 text-amber-950 scale-105 shadow-lg shadow-amber-400/50'
                                        : cell === 'X'
                                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                        : cell === 'O'
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                        : 'bg-[var(--muted-bg)] hover:bg-[var(--muted-bg)]/80 hover:scale-102 border border-[var(--card-border)]'
                                }`}
                            >
                                {cell === 'X' && <span className="transform animate-scale">✕</span>}
                                {cell === 'O' && <span className="transform animate-scale">◯</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Outcome Display */}
            {winner && (
                <div className="mt-4 p-3 w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-amber-400" size={18} />
                        <span className="font-bold text-sm">
                            {winner === 'Tie'
                                ? "It's a Draw!"
                                : `${winner === 'X' ? 'Player X' : (gameMode === 'ai' ? 'AI Bot' : 'Player O')} Wins! 🎉`}
                        </span>
                    </div>
                    <button
                        onClick={resetRound}
                        className="px-3 py-1.5 rounded-xl bg-[#193D35] text-white text-xs font-bold hover:bg-[#193D35]/90 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw size={13} /> Next Round
                    </button>
                </div>
            )}

            {/* Scorecard */}
            <div className="mt-4 grid grid-cols-3 gap-3 w-full text-center">
                <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                    <div className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Player X</div>
                    <div className="text-base font-extrabold text-cyan-400">{stats.xWins}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                    <div className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Ties</div>
                    <div className="text-base font-extrabold text-[var(--foreground-muted)]">{stats.ties}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                    <div className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">
                        {gameMode === 'ai' ? 'AI Bot' : 'Player O'}
                    </div>
                    <div className="text-base font-extrabold text-rose-400">{stats.oWins}</div>
                </div>
            </div>
        </div>
    );
};

export default TicTacToeEngine;
