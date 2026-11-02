import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Gamepad2,
    Sparkles,
    Search,
    Flame,
    Trophy,
    Heart,
    Star,
    Play,
    Code2,
    Keyboard,
    ArrowRight,
    RotateCcw,
    AlertCircle,
    RefreshCw,
    X,
    Clock,
    Zap,
    Layers,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gameService, { FALLBACK_GAMES } from '../../services/gameService';
import GameArtwork from './components/GameArtwork';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';

const CATEGORIES = [
    { name: 'All Games', icon: <Gamepad2 size={16} /> },
    { name: 'Coding Games', icon: <Code2 size={16} /> },
    { name: 'Typing Games', icon: <Keyboard size={16} /> }
];

const DIFFICULTIES = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export const GamesHub = () => {
    usePageSeo({
        title: 'Coding & Typing Games for Developers — HangBug Games Hub',
        description: 'Sharpen your coding logic, syntax memory, and typing speed with interactive browser games including Code Puzzle, Find the Bug, and Speed Typing.',
        canonicalPath: '/games'
    });

    const { user } = useAuth();

    // Data State
    const [games, setGames] = useState([]);
    const [featuredGame, setFeaturedGame] = useState(null);
    const [categoryCounts, setCategoryCounts] = useState({});
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All Games');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'featured', 'favorites', 'recent'

    // Load games & user statistics
    const loadGamesData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [gamesRes, statsRes] = await Promise.all([
                gameService.getGames(),
                user ? gameService.getUserStats().catch(() => null) : Promise.resolve(null)
            ]);

            if (gamesRes?.success && Array.isArray(gamesRes.data) && gamesRes.data.length > 0) {
                setGames(gamesRes.data);
                setFeaturedGame(gamesRes.featuredGame || gamesRes.data[0] || null);
                setCategoryCounts(gamesRes.categoryCounts || {
                    'All Games': gamesRes.data.length,
                    'Coding Games': gamesRes.data.filter(g => g.category === 'Coding Games').length,
                    'Typing Games': gamesRes.data.filter(g => g.category === 'Typing Games').length
                });
                setIsOfflineMode(Boolean(gamesRes.isOffline));
            } else {
                // If response had no games, fallback to standard catalog
                setGames(FALLBACK_GAMES);
                setFeaturedGame(FALLBACK_GAMES.find(g => g.isFeatured) || FALLBACK_GAMES[0]);
                setCategoryCounts({
                    'All Games': FALLBACK_GAMES.length,
                    'Coding Games': FALLBACK_GAMES.filter(g => g.category === 'Coding Games').length,
                    'Typing Games': FALLBACK_GAMES.filter(g => g.category === 'Typing Games').length
                });
            }

            if (statsRes?.success && statsRes.data) {
                setUserStats(statsRes.data);
            }
        } catch (err) {
            console.error('[GamesHub] Error loading games:', err);
            setError(err.message || 'Unable to connect to games server.');
            // Fallback gracefully so users never see a completely dead page
            setGames(FALLBACK_GAMES);
            setFeaturedGame(FALLBACK_GAMES.find(g => g.isFeatured) || FALLBACK_GAMES[0]);
            setCategoryCounts({
                'All Games': FALLBACK_GAMES.length,
                'Coding Games': FALLBACK_GAMES.filter(g => g.category === 'Coding Games').length,
                'Typing Games': FALLBACK_GAMES.filter(g => g.category === 'Typing Games').length
            });
            setIsOfflineMode(true);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadGamesData();
    }, [loadGamesData]);

    // Toggle favorite directly on card
    const handleToggleFavorite = async (e, slug) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;

        try {
            const res = await gameService.toggleFavorite(slug);
            if (res.success) {
                setGames(prev =>
                    prev.map(g => (g.slug === slug ? { ...g, isFavorite: res.isFavorite } : g))
                );
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    // Filtered games list
    const filteredGames = useMemo(() => {
        return games.filter((game) => {
            // Category filter
            if (selectedCategory !== 'All Games' && game.category !== selectedCategory) {
                return false;
            }

            // Difficulty filter
            if (selectedDifficulty !== 'All Levels') {
                if ((game.difficulty || '').toLowerCase() !== selectedDifficulty.toLowerCase()) {
                    return false;
                }
            }

            // Tab filter
            if (activeTab === 'favorites' && !game.isFavorite) {
                return false;
            }
            if (activeTab === 'featured' && !game.isFeatured) {
                return false;
            }
            if (activeTab === 'recent') {
                const isRecent = userStats?.recentGames?.some(r => r.slug === game.slug);
                if (!isRecent) return false;
            }

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (game.title || '').toLowerCase().includes(q);
                const matchDesc = (game.description || '').toLowerCase().includes(q);
                const matchCat = (game.category || '').toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchCat) return false;
            }

            return true;
        });
    }, [games, selectedCategory, selectedDifficulty, activeTab, searchQuery, userStats]);

    // Recently played games list
    const recentPlayedGames = useMemo(() => {
        if (!userStats?.recentGames?.length) return [];
        return userStats.recentGames
            .map(r => {
                const matched = games.find(g => g.slug === r.slug);
                return matched ? { ...matched, recentInfo: r } : null;
            })
            .filter(Boolean)
            .slice(0, 4);
    }, [userStats, games]);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col transition-colors duration-200">
            {/* Top Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* 1. PROMINENT GAMES HEADING & SUBTITLE */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Gamepad2 size={14} /> Hangbug Arcade
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[var(--foreground)]">
                            Games
                        </h1>
                        <p className="text-sm sm:text-base text-[var(--foreground-muted)] font-medium mt-1">
                            Learn, Play and Challenge Yourself
                        </p>
                    </div>

                    {isOfflineMode && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            <Zap size={14} /> Local Practice Mode Active
                        </div>
                    )}
                </div>

                {/* 2. HERO BANNER & DAILY FEATURED SPOTLIGHT */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/20 shadow-2xl p-6 sm:p-8 md:p-10 mb-8 text-white">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
                                <Sparkles size={14} className="text-emerald-400 animate-spin" />
                                <span>CODING & TYPING MASTERY</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                Sharpen Logic & <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                    Developer Keyboard Speed
                                </span>
                            </h2>

                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                                Master real programming syntax, solve algorithmic code puzzles, spot hidden syntax bugs, and build lightning-fast keyboard muscle memory across 14 interactive coding & typing challenges.
                            </p>

                            {/* Stats Chips */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Code2 size={16} className="text-emerald-400" />
                                    <span><strong>8</strong> Coding Games</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Keyboard size={16} className="text-cyan-400" />
                                    <span><strong>6</strong> Typing Games</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Trophy size={16} className="text-yellow-400" />
                                    <span>Cloud Scores & Live WPM</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Featured Spotlight Card */}
                        {featuredGame && (
                            <div className="lg:col-span-5">
                                <div className="relative group bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-md transform hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                                            <Flame size={12} /> Daily Quest: 1.5x XP
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Star size={13} className="text-amber-400 fill-amber-400" />
                                            <span className="font-bold text-white">{featuredGame.rating || 4.9}</span>
                                        </div>
                                    </div>

                                    {/* Thumbnail Preview */}
                                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
                                        <GameArtwork slug={featuredGame.slug} title={featuredGame.title} />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-lg font-black text-white">{featuredGame.title}</h3>
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                            {featuredGame.difficulty || 'All Levels'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                                        {featuredGame.description}
                                    </p>

                                    <Link
                                        to={`/games/${featuredGame.slug}`}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all"
                                    >
                                        <Play size={14} className="fill-slate-950" /> Play Daily Quest
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RECENTLY PLAYED SECTION (IF EXISTS) */}
                {recentPlayedGames.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5">
                                <RotateCcw size={14} className="text-cyan-500" /> Jump Back In — Recently Played
                            </h3>
                            <button
                                onClick={() => setActiveTab('recent')}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                View All Recent ({userStats?.recentGames?.length})
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {recentPlayedGames.map(game => (
                                <Link
                                    key={`recent-${game.slug}`}
                                    to={`/games/${game.slug}`}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[var(--card-border)]">
                                        <GameArtwork slug={game.slug} title={game.title} className="w-full h-full object-cover scale-150" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-[var(--foreground)] truncate group-hover:text-emerald-500 transition-colors">
                                            {game.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--foreground-muted)]">
                                            <span className="font-bold text-amber-500">
                                                ★ {game.recentInfo?.highScore || 0} pts
                                            </span>
                                            {game.recentInfo?.bestWpm > 0 && (
                                                <span className="text-cyan-500 font-bold">
                                                    {game.recentInfo.bestWpm} WPM
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Play size={14} className="text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0 mr-1" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. USER PROFILE STRIP OR GUEST MODE BANNER */}
                {user ? (
                    <div className="mb-8 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#193D35] to-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--foreground)]">{user.name}'s Dev Profile</h4>
                                <p className="text-[11px] text-[var(--foreground-muted)]">Code challenges solved and typing metrics saved to your account.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-center">
                            <div className="px-3 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Challenges Solved</span>
                                <span className="text-sm font-black text-emerald-500">{userStats?.totalPlayed || 0}</span>
                            </div>
                            <div className="px-3 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Favorites</span>
                                <span className="text-sm font-black text-rose-500">{userStats?.favorites?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 flex-wrap gap-2">
                        <span>👋 <strong>Playing in Guest Mode:</strong> All 14 games are freely playable! Sign in to record your personal best score, live WPM, and favorite games.</span>
                        <Link to="/login" className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-600 transition-colors">
                            Sign In
                        </Link>
                    </div>
                )}

                {/* 5. SEARCH & QUICK FILTER TABS */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            All Games
                        </button>
                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                                activeTab === 'featured'
                                    ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            <Flame size={12} className="text-amber-400" /> Featured
                        </button>
                        {user && (
                            <>
                                <button
                                    onClick={() => setActiveTab('favorites')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                                        activeTab === 'favorites'
                                            ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <Heart size={12} className="text-rose-400 fill-rose-400" /> Favorites
                                </button>
                                <button
                                    onClick={() => setActiveTab('recent')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                                        activeTab === 'recent'
                                            ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 shadow-xs'
                                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <RotateCcw size={12} className="text-cyan-400" /> Recently Played
                                </button>
                            </>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search 14 games, languages, skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-hidden focus:border-emerald-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 6. CATEGORY PILL FILTER CHIPS & DIFFICULTY */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.name;
                            const count = categoryCounts[cat.name] || 0;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                                        isSelected
                                            ? 'bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 border-[#193D35] dark:border-emerald-400 shadow-md shadow-[#193D35]/20 dark:shadow-emerald-500/20 scale-102'
                                            : 'bg-[var(--card-bg)] text-[var(--foreground-secondary)] border-[var(--card-border)] hover:border-[#193D35] dark:hover:border-emerald-400'
                                    }`}
                                >
                                    {cat.icon}
                                    <span>{cat.name}</span>
                                    {count > 0 && (
                                        <span
                                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                                isSelected ? 'bg-white/20 text-white dark:text-stone-950' : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Difficulty selector */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-[var(--foreground-muted)] font-medium mr-1">Difficulty:</span>
                        {DIFFICULTIES.map(diff => (
                            <button
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                    selectedDifficulty === diff
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                                        : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                }`}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 7. LOADING, ERROR, EMPTY & GAME GRID STATES */}
                {loading ? (
                    /* SKELETON LOADING STATE */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={`skel-${i}`} className="h-72 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] animate-pulse p-4 flex flex-col justify-between">
                                <div className="h-40 rounded-2xl bg-[var(--muted-bg)]" />
                                <div className="space-y-2 mt-3">
                                    <div className="h-4 bg-[var(--muted-bg)] rounded-md w-3/4" />
                                    <div className="h-3 bg-[var(--muted-bg)] rounded-md w-full" />
                                    <div className="h-3 bg-[var(--muted-bg)] rounded-md w-2/3" />
                                </div>
                                <div className="h-8 bg-[var(--muted-bg)] rounded-xl w-full mt-2" />
                            </div>
                        ))}
                    </div>
                ) : error && games.length === 0 ? (
                    /* ERROR STATE */
                    <div className="p-8 sm:p-12 text-center bg-[var(--card-bg)] border border-red-500/30 rounded-3xl my-6 max-w-xl mx-auto shadow-xl">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-lg font-black mb-2 text-[var(--foreground)]">Unable to Load Games Catalog</h3>
                        <p className="text-xs text-[var(--foreground-muted)] max-w-md mx-auto mb-6 leading-relaxed">
                            {error}. Please check your connection to the Hangbug server.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                                onClick={loadGamesData}
                                className="px-5 py-2.5 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 text-xs font-bold hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md"
                            >
                                <RefreshCw size={14} /> Retry Connection
                            </button>
                            <button
                                onClick={() => { setGames(FALLBACK_GAMES); setError(null); setIsOfflineMode(true); }}
                                className="px-5 py-2.5 rounded-xl bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] text-xs font-bold hover:bg-[var(--hover-bg)] cursor-pointer"
                            >
                                Play Offline Catalog (14 Games)
                            </button>
                        </div>
                    </div>
                ) : filteredGames.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="p-12 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl my-6 max-w-lg mx-auto shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center mx-auto mb-3 text-[var(--foreground-muted)]">
                            <Gamepad2 size={32} />
                        </div>
                        <h3 className="text-base font-bold mb-1 text-[var(--foreground)]">
                            {games.length === 0 ? 'No games available yet' : 'No games match your filters'}
                        </h3>
                        <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto mb-5 leading-relaxed">
                            {games.length === 0
                                ? 'The games catalog is currently being prepared. Check back shortly!'
                                : 'Try clearing your search query, switching categories, or resetting difficulty levels.'}
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('All Games'); setSelectedDifficulty('All Levels'); setSearchQuery(''); setActiveTab('all'); }}
                            className="px-5 py-2.5 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 text-xs font-bold hover:opacity-90 cursor-pointer shadow-sm"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    /* RESPONSIVE GAME CARDS GRID: 1 col (mobile), 2-3 col (tablet), 3-4 col (desktop) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filteredGames.map((game) => {
                            const isLarge = game.cardSize === 'large';
                            const isTall = game.cardSize === 'tall';
                            const isTyping = game.category === 'Typing Games';

                            return (
                                <Link
                                    key={game.id || game.slug}
                                    to={`/games/${game.slug}`}
                                    className={`group relative flex flex-col rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/60 dark:hover:border-emerald-400/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1.5 ${
                                        isLarge ? 'sm:col-span-2' : ''
                                    }`}
                                >
                                    {/* Thumbnail Art Container */}
                                    <div className={`relative overflow-hidden ${isLarge ? 'h-52 sm:h-56' : isTall ? 'h-52' : 'h-44'}`}>
                                        <GameArtwork slug={game.slug} title={game.title} />

                                        {/* Top Badges overlay */}
                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                                            {game.badge ? (
                                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/60 text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-sm">
                                                    {game.badge}
                                                </span>
                                            ) : (
                                                <span />
                                            )}

                                            <div className="flex items-center gap-1.5">
                                                {/* Favorite Button */}
                                                <button
                                                    onClick={(e) => handleToggleFavorite(e, game.slug)}
                                                    className={`p-1.5 rounded-full backdrop-blur-md transition-all pointer-events-auto cursor-pointer ${
                                                        game.isFavorite
                                                            ? 'bg-rose-500 text-white shadow-md'
                                                            : 'bg-black/50 text-white/80 hover:text-rose-400 hover:bg-black/70'
                                                    }`}
                                                    title={game.isFavorite ? "Favorited" : "Add to favorites"}
                                                >
                                                    <Heart size={14} className={game.isFavorite ? 'fill-white' : ''} />
                                                </button>

                                                {/* Rating Badge */}
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/60 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
                                                    <Star size={10} className="fill-amber-300" />
                                                    {game.rating || 4.9}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Play Hover Overlay Badge */}
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                            <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play size={22} className="fill-slate-950 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Content & Action Bar */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <h3 className="text-sm font-black text-[var(--foreground)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                    {game.title}
                                                </h3>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--muted-bg)] text-[var(--foreground-muted)] whitespace-nowrap">
                                                    {game.difficulty || 'All Levels'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed mb-4">
                                                {game.description}
                                            </p>
                                        </div>

                                        {/* Bottom Action & Metrics Bar with Visible Play Button */}
                                        <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-[11px] text-[var(--foreground-muted)]">
                                                    {isTyping ? <Keyboard size={12} /> : <Code2 size={12} />}
                                                    <span>{game.category.replace(' Games', '')}</span>
                                                </div>

                                                {game.userHighScore > 0 && (
                                                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 mt-0.5">
                                                        <Trophy size={10} /> Best: {game.userHighScore} {isTyping && game.userBestWpm ? `(${game.userBestWpm} WPM)` : 'pts'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Visible Play Now Button */}
                                            <span className="px-3.5 py-1.5 rounded-xl bg-[#193D35] dark:bg-emerald-500 text-white dark:text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm group-hover:scale-105 active:scale-95 transition-transform shrink-0">
                                                <Play size={12} className="fill-current" /> Play Now
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default GamesHub;