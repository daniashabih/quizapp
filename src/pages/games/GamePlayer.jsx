import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Maximize2,
    Minimize2,
    Play,
    Pause,
    RotateCcw,
    Heart,
    Trophy,
    Info,
    X,
    Sparkles,
    Flame,
    Share2,
    Volume2,
    VolumeX,
    Code2,
    Keyboard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService';

// Coding Games Engines
import CodePuzzleEngine from './engines/CodePuzzleEngine';
import FindTheBugEngine from './engines/FindTheBugEngine';
import OutputPredictorEngine from './engines/OutputPredictorEngine';
import CodeScrambleEngine from './engines/CodeScrambleEngine';
import MissingCodeEngine from './engines/MissingCodeEngine';
import LogicBuilderEngine from './engines/LogicBuilderEngine';
import SqlChallengeEngine from './engines/SqlChallengeEngine';
import CodingMemoryMatchEngine from './engines/CodingMemoryMatchEngine';

// Typing Games Engines
import SpeedTypingEngine from './engines/SpeedTypingEngine';
import CodeTypingEngine from './engines/CodeTypingEngine';
import SixtySecondChallengeEngine from './engines/SixtySecondChallengeEngine';
import ErrorFreeTypingEngine from './engines/ErrorFreeTypingEngine';
import SyntaxTypingEngine from './engines/SyntaxTypingEngine';
import WordRainEngine from './engines/WordRainEngine';

export const GamePlayer = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentScore, setCurrentScore] = useState(0);
    const [personalBest, setPersonalBest] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [gameOverModal, setGameOverModal] = useState(null);
    const [playKey, setPlayKey] = useState(0);

    const playerContainerRef = useRef(null);
    const gameStartTimeRef = useRef(Date.now());

    // Fetch game details
    const fetchGame = useCallback(async () => {
        setLoading(true);
        try {
            const res = await gameService.getGameBySlug(slug);
            if (res.success && res.data) {
                setGame(res.data);
                setPersonalBest(res.data.userHighScore || 0);
                setIsFavorite(Boolean(res.data.isFavorite));
            } else {
                toast.error('Game not found.');
                navigate('/games');
            }
        } catch (err) {
            console.error('Error fetching game:', err);
            toast.error('Failed to load game.');
            navigate('/games');
        } finally {
            setLoading(false);
            gameStartTimeRef.current = Date.now();
        }
    }, [slug, navigate]);

    useEffect(() => {
        fetchGame();
    }, [fetchGame]);

    // Handle full screen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (playerContainerRef.current?.requestFullscreen) {
                playerContainerRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Toggle favorite
    const handleToggleFavorite = async () => {
        if (!user) {
            toast.info('Sign in to save this game to your favorites.');
            return;
        }
        try {
            const res = await gameService.toggleFavorite(slug);
            if (res.success) {
                setIsFavorite(res.isFavorite);
                toast.success(res.message);
            }
        } catch (err) {
            console.error('Error favoriting game:', err);
            toast.error('Failed to update favorites.');
        }
    };

    // Live score callback from engine
    const handleScoreUpdate = (newScore) => {
        setCurrentScore(newScore);
        if (newScore > personalBest) {
            setPersonalBest(newScore);
        }
    };

    // Game over callback from engine
    const handleGameOver = async (scoreOrObj, optionalMeta = {}) => {
        const durationSeconds = Math.round((Date.now() - gameStartTimeRef.current) / 1000);

        let finalScore = 0;
        let wpm = 0;
        let accuracy = 100;
        let metadata = optionalMeta;

        if (typeof scoreOrObj === 'object' && scoreOrObj !== null) {
            finalScore = scoreOrObj.score || 0;
            wpm = scoreOrObj.wpm || 0;
            accuracy = scoreOrObj.accuracy !== undefined ? scoreOrObj.accuracy : 100;
            metadata = scoreOrObj.metadata || optionalMeta;
        } else {
            finalScore = Number(scoreOrObj) || 0;
        }

        const isNewHigh = finalScore > personalBest;

        if (isNewHigh) {
            setPersonalBest(finalScore);
        }

        setGameOverModal({
            score: finalScore,
            wpm,
            accuracy,
            isNewHigh,
            metadata
        });

        // Submit score to backend
        try {
            await gameService.submitScore(slug, {
                score: finalScore,
                durationSeconds,
                accuracy,
                wpm,
                difficulty: game?.difficulty || 'All Levels',
                metadata
            });
        } catch (err) {
            console.error('Failed to save score:', err);
        }
    };

    // Restart game
    const handleRestart = () => {
        setCurrentScore(0);
        setGameOverModal(null);
        setIsPaused(false);
        gameStartTimeRef.current = Date.now();
        setPlayKey(prev => prev + 1);
    };

    // Render active game engine
    const renderEngine = () => {
        const commonProps = {
            key: playKey,
            onGameOver: handleGameOver,
            onScoreUpdate: handleScoreUpdate,
            isPaused
        };

        switch (slug) {
            // Coding Games
            case 'code-puzzle':
                return <CodePuzzleEngine {...commonProps} />;
            case 'find-the-bug':
                return <FindTheBugEngine {...commonProps} />;
            case 'output-predictor':
                return <OutputPredictorEngine {...commonProps} />;
            case 'code-scramble':
                return <CodeScrambleEngine {...commonProps} />;
            case 'missing-code':
                return <MissingCodeEngine {...commonProps} />;
            case 'logic-builder':
                return <LogicBuilderEngine {...commonProps} />;
            case 'sql-challenge':
                return <SqlChallengeEngine {...commonProps} />;
            case 'memory-match':
                return <CodingMemoryMatchEngine {...commonProps} />;

            // Typing Games
            case 'speed-typing':
                return <SpeedTypingEngine {...commonProps} />;
            case 'code-typing':
                return <CodeTypingEngine {...commonProps} />;
            case 'sixty-second-challenge':
                return <SixtySecondChallengeEngine {...commonProps} />;
            case 'error-free-typing':
                return <ErrorFreeTypingEngine {...commonProps} />;
            case 'syntax-typing':
                return <SyntaxTypingEngine {...commonProps} />;
            case 'word-rain':
                return <WordRainEngine {...commonProps} />;

            default:
                return (
                    <div className="p-8 text-center text-[var(--foreground-muted)]">
                        <p className="text-base font-bold">Game engine loading...</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--page-bg)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-[#193D35] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-[var(--foreground-muted)]">Loading game challenge...</p>
                </div>
            </div>
        );
    }

    if (!game) return null;

    const isTyping = game.category === 'Typing Games';

    return (
        <div
            ref={playerContainerRef}
            className={`min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col ${
                isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6 overflow-y-auto' : 'pt-20 pb-12 px-4 sm:px-6'
            }`}
        >
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                {/* Game Player Header */}
                <div className="w-full flex items-center justify-between gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-3 sm:p-4 mb-4 shadow-sm">
                    {/* Left: Exit & Title */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/games"
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] transition-colors flex items-center gap-1.5 text-xs font-bold"
                            title="Back to Games Hub"
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">All Games</span>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black tracking-tight">{game.title}</h1>
                                {game.badge && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        {game.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-[var(--foreground-muted)] hidden sm:flex items-center gap-1">
                                {isTyping ? <Keyboard size={12} /> : <Code2 size={12} />}
                                <span>{game.category} &bull; {game.difficulty || 'All Levels'}</span>
                            </p>
                        </div>
                    </div>

                    {/* Middle: Scores */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-center px-2.5 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] block">Score</span>
                            <span className="text-sm sm:text-base font-black text-emerald-500">{currentScore}</span>
                        </div>
                        <div className="text-center px-2.5 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] block">Best</span>
                            <span className="text-sm sm:text-base font-black text-amber-500">{personalBest}</span>
                        </div>
                    </div>

                    {/* Right: Controls HUD */}
                    <div className="flex items-center gap-1.5">
                        {/* Pause / Resume */}
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                            title={isPaused ? "Resume Game" : "Pause Game"}
                        >
                            {isPaused ? <Play size={16} className="text-emerald-500 fill-emerald-500" /> : <Pause size={16} />}
                        </button>

                        {/* Restart */}
                        <button
                            onClick={handleRestart}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                            title="Restart Game"
                        >
                            <RotateCcw size={16} />
                        </button>

                        {/* Instructions */}
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                            title="Instructions & Rules"
                        >
                            <Info size={16} />
                        </button>

                        {/* Favorite */}
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2 rounded-xl transition-colors cursor-pointer ${
                                isFavorite
                                    ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                                    : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-rose-500'
                            }`}
                            title={isFavorite ? "Favorited" : "Add to favorites"}
                        >
                            <Heart size={16} className={isFavorite ? "fill-rose-500" : ""} />
                        </button>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer hidden sm:block"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Pause Overlay Notification */}
                {isPaused && (
                    <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-between">
                        <span>⏸️ <strong>Game Paused:</strong> Take a breath! Click Resume to continue.</span>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors cursor-pointer"
                        >
                            Resume
                        </button>
                    </div>
                )}

                {/* Active Game Engine Canvas/Viewport */}
                <div className="flex-1 flex flex-col justify-center items-center w-full">
                    {renderEngine()}
                </div>
            </div>

            {/* INSTRUCTIONS MODAL */}
            {showInstructions && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--card-border)]">
                            <h3 className="text-base font-black flex items-center gap-2">
                                <Info size={18} className="text-emerald-500" /> How to Play: {game.title}
                            </h3>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="p-1 rounded-xl hover:bg-[var(--muted-bg)] text-[var(--foreground-muted)] transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs text-[var(--foreground-secondary)] leading-relaxed">
                            <div>
                                <h4 className="font-bold text-[var(--foreground)] mb-1">Overview:</h4>
                                <p>{game.description}</p>
                            </div>

                            <div>
                                <h4 className="font-bold text-[var(--foreground)] mb-1">Instructions:</h4>
                                <p>{game.instructions}</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                <span className="font-bold text-[var(--foreground)] block mb-1">Category & Difficulty:</span>
                                <p>{game.category} &bull; {game.difficulty || 'All Levels'}</p>
                            </div>
                        </div>

                        <div className="pt-5 mt-4 border-t border-[var(--card-border)] flex justify-end">
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="px-5 py-2.5 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs hover:bg-[#193D35]/90 transition-all cursor-pointer"
                            >
                                Got it, Let's Play!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GAME OVER MODAL */}
            {gameOverModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                            <Trophy size={32} />
                        </div>

                        <h3 className="text-xl font-black mb-1">Challenge Complete!</h3>
                        <p className="text-xs text-[var(--foreground-muted)] mb-5">
                            Great job solving this challenge in <strong>{game.title}</strong>
                        </p>

                        {/* Score Box */}
                        <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] mb-5">
                            <span className="text-[10px] uppercase font-bold text-[var(--foreground-muted)] block mb-0.5">Final Score</span>
                            <span className="text-3xl font-black text-emerald-500">{gameOverModal.score} pts</span>

                            {gameOverModal.wpm > 0 && (
                                <p className="text-xs text-indigo-400 font-bold mt-1">
                                    Speed: {gameOverModal.wpm} WPM &bull; Accuracy: {gameOverModal.accuracy || 100}%
                                </p>
                            )}

                            {gameOverModal.isNewHigh && (
                                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold">
                                    <Sparkles size={12} /> New Personal Best!
                                </div>
                            )}
                        </div>

                        {!user && (
                            <p className="text-[11px] text-amber-500 bg-amber-500/10 p-2.5 rounded-xl mb-5">
                                💡 Sign in to save your personal records and climb the global leaderboards!
                            </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={handleRestart}
                                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
                            >
                                <RotateCcw size={14} /> Play Again
                            </button>
                            <Link
                                to="/games"
                                className="w-full py-3 rounded-2xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-bold text-xs flex items-center justify-center transition-colors"
                            >
                                Back to All Games
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamePlayer;
