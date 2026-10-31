import React, { useState, useEffect, useMemo } from 'react';
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
    Filter,
    Compass,
    SlidersHorizontal,
    ArrowRight,
    Users,
    Zap,
    RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gameService from '../../services/gameService';
import GameArtwork from './components/GameArtwork';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const CATEGORIES = [
    { name: 'All Games', icon: '🎮' },
    { name: 'Puzzle Games', icon: '🧩' },
    { name: 'Arcade Games', icon: '🕹️' },
    { name: 'Racing Games', icon: '🏎️' },
    { name: 'Sports Games', icon: '⚽' },
    { name: 'Brain Games', icon: '🧠' },
    { name: 'Adventure Games', icon: '🗺️' },
    { name: 'Casual Games', icon: '🎯' }
];

export const GamesHub = () => {
    const { user } = useAuth();

    const [games, setGames] = useState([]);
    const [featuredGame, setFeaturedGame] = useState(null);
    const [categoryCounts, setCategoryCounts] = useState({});
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCategory, setSelectedCategory] = useState('All Games');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'favorites', 'featured', 'recent'

    // Load games & user stats
    const loadGamesData = async () => {
        setLoading(true);
        try {
            const [gamesRes, statsRes] = await Promise.all([
                gameService.getGames(),
                user ? gameService.getUserStats().catch(() => null) : Promise.resolve(null)
            ]);

            if (gamesRes.success) {
                setGames(gamesRes.data || []);
                setFeaturedGame(gamesRes.featuredGame || gamesRes.data[0] || null);
                setCategoryCounts(gamesRes.categoryCounts || {});
            }

            if (statsRes?.success) {
                setUserStats(statsRes.data);
            }
        } catch (err) {
            console.error('Failed to load games hub data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGamesData();
    }, [user]);

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
                const matchTitle = game.title.toLowerCase().includes(q);
                const matchDesc = game.description.toLowerCase().includes(q);
                const matchCat = game.category.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchCat) return false;
            }

            return true;
        });
    }, [games, selectedCategory, activeTab, searchQuery, userStats]);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* 1. ARCADE HERO BANNER & DAILY FEATURED SPOTLIGHT */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border border-emerald-500/20 shadow-2xl p-6 sm:p-8 md:p-10 mb-8 text-white">
                    {/* Glowing background orbs */}
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide backdrop-blur-xs">
                                <Sparkles size={14} className="animate-spin text-emerald-400" />
                                <span>HANGBUG MINI GAMES ARCADE</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Casual Games, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                    Instant Fun & Reflexes
                                </span>
                            </h1>

                            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                                Take a well-deserved break between coding quizzes! Enjoy our curated gallery of retro puzzles, arcade hits, reflex challenges, and brain boosters.
                            </p>

                            {/* Stats Chips */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Gamepad2 size={16} className="text-emerald-400" />
                                    <span><strong>{games.length}+</strong> Playable Games</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Zap size={16} className="text-amber-400" />
                                    <span>No Downloads Required</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                                    <Trophy size={16} className="text-yellow-400" />
                                    <span>Cloud High Scores</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Featured Spotlight Card */}
                        {featuredGame && (
                            <div className="lg:col-span-5">
                                <div className="relative group bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-md transform hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                                            <Flame size={12} /> Daily Spotlight
                                        </span>
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Star size={13} className="text-amber-400 fill-amber-400" />
                                            <span className="font-bold text-white">{featuredGame.rating}</span>
                                        </div>
                                    </div>

                                    {/* Thumbnail Preview */}
                                    <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
                                        <GameArtwork slug={featuredGame.slug} title={featuredGame.title} />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    <h3 className="text-lg font-black text-white mb-1">{featuredGame.title}</h3>
                                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                                        {featuredGame.description}
                                    </p>

                                    <Link
                                        to={`/games/${featuredGame.slug}`}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-98 transition-all"
                                    >
                                        <Play size={14} className="fill-slate-950" /> Play Now
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. USER ARCADE PROFILE STRIP */}
                {user ? (
                    <div className="mb-8 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#193D35] to-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-[var(--foreground)]">{user.name}'s Arcade Hub</h4>
                                <p className="text-[11px] text-[var(--foreground-muted)]">Scores and personal bests automatically synced with your cloud profile.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-center">
                            <div className="px-3 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Games Played</span>
                                <span className="text-sm font-black text-emerald-500">{userStats?.totalPlayed || 0}</span>
                            </div>
                            <div className="px-3 py-1 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)] block">Favorites</span>
                                <span className="text-sm font-black text-rose-500">{userStats?.favorites?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-500 flex-wrap gap-2">
                        <span>👋 <strong>Playing in Guest Mode:</strong> You can play any game freely! Sign in to save personal high scores and favorite titles.</span>
                        <Link to="/login" className="px-3 py-1 rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-600 transition-colors">
                            Sign In
                        </Link>
                    </div>
                )}

                {/* 3. SEARCH & QUICK FILTER TABS */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-[#193D35] text-white shadow-xs'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            All Games
                        </button>
                        <button
                            onClick={() => setActiveTab('featured')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                                activeTab === 'featured'
                                    ? 'bg-[#193D35] text-white shadow-xs'
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
                                            ? 'bg-[#193D35] text-white shadow-xs'
                                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <Heart size={12} className="text-rose-400 fill-rose-400" /> Favorites
                                </button>
                                <button
                                    onClick={() => setActiveTab('recent')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                                        activeTab === 'recent'
                                            ? 'bg-[#193D35] text-white shadow-xs'
                                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                    }`}
                                >
                                    <RotateCcw size={12} className="text-cyan-400" /> Recently Played
                                </button>
                            </>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                        <input
                            type="text"
                            placeholder="Search arcade games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-hidden focus:border-[#193D35] transition-all"
                        />
                    </div>
                </div>

                {/* 4. CATEGORY PILL FILTER CHIPS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
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
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                                {count > 0 && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
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

                {/* 5. RICH MASONRY / BENTO GRID GALLERY OF GAMES */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] animate-pulse p-4 flex flex-col justify-between">
                                <div className="h-36 rounded-2xl bg-[var(--muted-bg)]" />
                                <div className="h-4 bg-[var(--muted-bg)] rounded-md w-3/4" />
                                <div className="h-3 bg-[var(--muted-bg)] rounded-md w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredGames.length === 0 ? (
                    <div className="p-12 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl my-6">
                        <Gamepad2 size={48} className="mx-auto text-[var(--foreground-muted)] mb-3 opacity-60" />
                        <h3 className="text-base font-bold mb-1">No games found</h3>
                        <p className="text-xs text-[var(--foreground-muted)] max-w-sm mx-auto mb-4">
                            Try adjusting your search query or selecting a different game category.
                        </p>
                        <button
                            onClick={() => { setSelectedCategory('All Games'); setSearchQuery(''); setActiveTab('all'); }}
                            className="px-4 py-2 rounded-xl bg-[#193D35] text-white text-xs font-bold hover:bg-[#193D35]/90 cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filteredGames.map((game) => {
                            const isLarge = game.cardSize === 'large';
                            const isTall = game.cardSize === 'tall';

                            return (
                                <Link
                                    key={game.id || game.slug}
                                    to={`/games/${game.slug}`}
                                    className={`group relative flex flex-col rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-emerald-500/60 dark:hover:border-emerald-400/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1.5 ${
                                        isLarge ? 'sm:col-span-2' : ''
                                    }`}
                                >
                                    {/* Thumbnail Art Container */}
                                    <div className={`relative overflow-hidden ${isLarge ? 'h-52 sm:h-60' : isTall ? 'h-56' : 'h-44'}`}>
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
                                                    {game.rating}
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

                                    {/* Card Content Footer */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="text-sm font-black text-[var(--foreground)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
                                                    {game.title}
                                                </h3>
                                                <span className="text-[10px] font-bold text-[var(--foreground-muted)] whitespace-nowrap">
                                                    {game.category.replace(' Games', '')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2 leading-relaxed mb-3">
                                                {game.description}
                                            </p>
                                        </div>

                                        {/* Bottom Metrics Bar */}
                                        <div className="pt-2.5 border-t border-[var(--card-border)] flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-1 text-[var(--foreground-muted)]">
                                                <Users size={12} />
                                                <span>{(game.playsCount || 0).toLocaleString()} plays</span>
                                            </div>

                                            {game.userHighScore > 0 ? (
                                                <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                    <Trophy size={12} />
                                                    <span>Best: {game.userHighScore}</span>
                                                </div>
                                            ) : (
                                                <span className="font-bold text-emerald-500 flex items-center gap-1">
                                                    Play <ArrowRight size={12} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default GamesHub;
