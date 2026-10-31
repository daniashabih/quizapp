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
    VolumeX
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService';
import TicTacToeEngine from './engines/TicTacToeEngine';
import Game2048Engine from './engines/Game2048Engine';
import SnakeEngine from './engines/SnakeEngine';
import MemoryMatchEngine from './engines/MemoryMatchEngine';
import BrickBreakerEngine from './engines/BrickBreakerEngine';
import FlappyBugEngine from './engines/FlappyBugEngine';
import ColorMatchEngine from './engines/ColorMatchEngine';
import NumberPuzzleEngine from './engines/NumberPuzzleEngine';

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
    const [gameOverModal, setGameOverModal] = useState(null); // { score, isNewHigh, metadata }
    const [playKey, setPlayKey] = useState(0); // for forcing engine remount on restart

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

    // Toggle Favorite
    const handleToggleFavorite = async () => {
        if (!user) {
            toast.info('Sign in to save favorite games to your account.');
            return;
        }
        try {
            const res = await gameService.toggleFavorite(slug);
            if (res.success) {
                setIsFavorite(res.isFavorite);
                toast.success(res.message);
            }
        } catch (err) {
            toast.error('Failed to update favorite status.');
        }
    };

    // Live score update from engine
    const handleScoreUpdate = (newScore) => {
        setCurrentScore(newScore);
    };

    // Game Over callback from engine
    const handleGameOver = async (finalScore, metadata = {}) => {
        const durationSeconds = Math.round((Date.now() - gameStartTimeRef.current) / 1000);
        const isNewHigh = finalScore > personalBest;

        if (isNewHigh) {
            setPersonalBest(finalScore);
        }

        setGameOverModal({
            score: finalScore,
            isNewHigh,
            metadata
        });

        // Submit score to backend
        try {
            const res = await gameService.submitScore(slug, {
                score: finalScore,
                durationSeconds,
                metadata
            });
            if (res.isGuest) {
                // guest notification
            }
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
            case '2048':
                return <Game2048Engine {...commonProps} />;
            case 'snake':
                return <SnakeEngine {...commonProps} />;
            case 'brick-breaker':
                return <BrickBreakerEngine {...commonProps} />;
            case 'tic-tac-toe':
                return <TicTacToeEngine {...commonProps} />;
            case 'memory-match':
                return <MemoryMatchEngine {...commonProps} />;
            case 'flappy-bug':
                return <FlappyBugEngine {...commonProps} />;
            case 'color-match':
                return <ColorMatchEngine {...commonProps} />;
            case 'number-puzzle':
                return <NumberPuzzleEngine {...commonProps} />;
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
                    <p className="text-xs font-semibold text-[var(--foreground-muted)]">Powering up arcade...</p>
                </div>
            </div>
        );
    }

    if (!game) return null;

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
                            title="Back to Arcade Hub"
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
                            <p className="text-[11px] text-[var(--foreground-muted)] hidden sm:block">{game.category}</p>
                        </div>
                    </div>

                    {/* Middle: Scores */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-center px-2.5 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] block">Current</span>
                            <span className="text-sm sm:text-base font-black text-emerald-500">{currentScore}</span>
                        </div>
                        <div className="text-center px-2.5 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                            <span className="text-[9px] uppercase font-bold text-[var(--foreground-muted)] block flex items-center gap-0.5 justify-center">
                                <Trophy size={10} className="text-amber-500" /> Best
                            </span>
                            <span className="text-sm sm:text-base font-black text-amber-500">{personalBest}</span>
                        </div>
                    </div>

                    {/* Right: Controls & Toggles */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={`p-2 rounded-xl border border-[var(--card-border)] transition-colors cursor-pointer ${
                                isPaused
                                    ? 'bg-amber-500 text-stone-950 font-bold'
                                    : 'bg-[var(--muted-bg)] text-[var(--foreground)] hover:bg-[var(--card-border)]'
                            }`}
                            title={isPaused ? "Resume Game" : "Pause Game"}
                        >
                            {isPaused ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                            onClick={handleRestart}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] border border-[var(--card-border)] transition-colors cursor-pointer"
                            title="Restart Game"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2 rounded-xl border border-[var(--card-border)] transition-colors cursor-pointer ${
                                isFavorite
                                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                                    : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-rose-500'
                            }`}
                            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart size={16} className={isFavorite ? 'fill-rose-500' : ''} />
                        </button>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--card-border)] transition-colors cursor-pointer"
                            title="Game Instructions"
                        >
                            <Info size={16} />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border border-[var(--card-border)] transition-colors cursor-pointer hidden sm:block"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>

                {/* Main Game Screen Stage */}
                <div className="relative flex-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center justify-center min-h-[460px]">
                    {/* Pause Overlay */}
                    {isPaused && (
                        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                            <Pause size={48} className="text-amber-400 mb-3 animate-pulse" />
                            <h2 className="text-2xl font-black text-white mb-2">Game Paused</h2>
                            <p className="text-xs text-stone-300 max-w-xs mb-6">Take a breather, stretch your fingers, and resume when ready.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsPaused(false)}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
                                >
                                    <Play size={14} /> Resume Game
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs transition-all border border-stone-700 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <RotateCcw size={14} /> Restart
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Game Engine */}
                    {renderEngine()}
                </div>

                {/* Game Over Modal */}
                {gameOverModal && (
                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative animate-scale">
                            {gameOverModal.isNewHigh ? (
                                <div className="mb-4">
                                    <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-3 animate-bounce shadow-xl shadow-amber-400/30">
                                        <Trophy size={32} />
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 text-xs font-black uppercase tracking-wider mb-2">
                                        <Sparkles size={13} /> New Personal Best!
                                    </div>
                                    <h2 className="text-2xl font-black">Outstanding!</h2>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-3 shadow-xl">
                                        <Flame size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black">Game Completed!</h2>
                                </div>
                            )}

                            {/* Score Display Card */}
                            <div className="p-4 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] mb-6">
                                <div className="text-xs font-bold text-[var(--foreground-muted)] uppercase mb-1">Final Score</div>
                                <div className="text-4xl font-black text-emerald-500 tracking-tight">{gameOverModal.score}</div>
                                <div className="mt-2 text-[11px] text-[var(--foreground-muted)] flex items-center justify-center gap-1">
                                    <Trophy size={12} className="text-amber-500" />
                                    <span>Personal Best: <strong>{personalBest}</strong></span>
                                </div>
                            </div>

                            {/* Guest prompt notice */}
                            {!user && (
                                <p className="text-[11px] text-[var(--foreground-muted)] mb-5 bg-amber-500/10 text-amber-500 p-2.5 rounded-xl border border-amber-500/20">
                                    Playing as guest. <Link to="/login" className="font-bold underline text-amber-400">Sign in</Link> to save your arcade stats to the cloud!
                                </p>
                            )}

                            {/* Modal Action Buttons */}
                            <div className="flex flex-col gap-2.5">
                                <button
                                    onClick={handleRestart}
                                    className="w-full py-3 rounded-xl bg-[#193D35] hover:bg-[#193D35]/90 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <RotateCcw size={14} /> Play Again
                                </button>
                                <button
                                    onClick={() => navigate('/games')}
                                    className="w-full py-2.5 rounded-xl bg-[var(--muted-bg)] hover:bg-[var(--card-border)] text-[var(--foreground)] font-bold text-xs transition-colors cursor-pointer"
                                >
                                    Exit to Games Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions Modal Drawer */}
                {showInstructions && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="absolute top-5 right-5 p-1.5 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-500">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black">{game.title} Instructions</h3>
                                    <p className="text-xs text-[var(--foreground-muted)]">{game.category}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs text-[var(--foreground-secondary)] leading-relaxed">
                                <p>{game.instructions}</p>
                                <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                    <p className="font-bold text-[var(--foreground)] mb-1">🎮 Controls:</p>
                                    <p className="text-[11px] text-[var(--foreground-muted)]">
                                        Supports mouse, touchscreen swipes/taps, and keyboard arrow keys / WASD.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowInstructions(false)}
                                className="mt-6 w-full py-2.5 rounded-xl bg-[#193D35] text-white font-bold text-xs hover:bg-[#193D35]/90 transition-all cursor-pointer"
                            >
                                Got it, let's play!
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamePlayer;
