import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Trophy,
    Medal,
    Award,
    Flame,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    Star,
    Zap,
    RotateCcw,
    AlertCircle,
    BookOpen,
    CheckCircle2,
    UserCheck,
    X,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const TIMEFRAMES = [
    { id: 'all-time', label: 'All-Time' },
    { id: 'monthly', label: 'This Month' },
    { id: 'weekly', label: 'This Week' },
];

const DEFAULT_CATEGORIES = [
    'All',
    'SQL Server',
    'Node.js',
    'Express JS and Node JS',
    'Agile & DevOps',
    'Azure',
    'PHP',
    'HTML & CSS',
    'Power BI',
    'Excel',
    'SEO',
    'React',
    'JavaScript',
    'Python',
];

const PAGE_SIZE = 10;

const Leaderboard = ({
    mode = 'top5', // 'top5' | 'full'
    isEmbedded = false,
    onDataLoaded,
}) => {
    const { user, isAuthenticated } = useAuth();
    const currentUser = user;
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname.startsWith('/dashboard');
    const isFullMode = mode === 'full' || location.pathname.endsWith('/full') || location.search.includes('view=full');
    const isTop5 = !isFullMode;

    const [timeframe, setTimeframe] = useState('all-time');
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [discoveredCategories, setDiscoveredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dashboardService.getLeaderboard({ timeframe, category });
            if (!data || !Array.isArray(data.leaderboard)) {
                throw new Error('Unexpected response format from leaderboard API.');
            }
            // Filter to users who have completed at least 1 quiz
            // Deterministically sort and index ranks 1..N
            const activeRankings = data.leaderboard
                .filter((u) => Number(u.quizzes || 0) > 0)
                .map((u, idx) => {
                    const rawStreak = parseInt(String(u.streak ?? '0').replace(/\D/g, ''), 10) || 0;
                    return {
                        ...u,
                        rank: idx + 1,
                        quizzes: Number(u.quizzes || 0),
                        score: Math.round(Number(u.score || 0)),
                        xp: Number(u.xp || 0),
                        certs: Number(u.certs || 0),
                        streak: `${rawStreak}d`,
                    };
                });

            setLeaderboardData(activeRankings);
            setDiscoveredCategories((prev) => {
                const next = new Set(prev);
                activeRankings.forEach((u) => {
                    if (u.category && u.category !== 'Full Stack') {
                        next.add(u.category);
                    }
                });
                return Array.from(next);
            });
            if (onDataLoaded) {
                onDataLoaded({
                    ...data,
                    leaderboard: activeRankings,
                    totalRanked: activeRankings.length,
                });
            }
        } catch (err) {
            console.error('Failed to load leaderboard:', err);
            setError(err?.response?.data?.message || err?.message || 'Unable to load rankings right now. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [timeframe, category, onDataLoaded]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, category, timeframe]);

    const isCurrentUserEntry = useCallback(
        (entry) => {
            if (!currentUser || !entry) return false;
            const currentId = String(currentUser.id || currentUser._id || '');
            const entryId = String(entry.id || entry._id || '');
            if (currentId && entryId && currentId === entryId) return true;
            if (
                currentUser.name &&
                entry.name &&
                currentUser.name.trim().toLowerCase() === entry.name.trim().toLowerCase()
            ) {
                return true;
            }
            return false;
        },
        [currentUser]
    );

    const currentUserRankEntry = useMemo(() => {
        if (!currentUser) return null;
        return leaderboardData.find((u) => isCurrentUserEntry(u)) || null;
    }, [leaderboardData, currentUser, isCurrentUserEntry]);

    const filteredData = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return leaderboardData;
        return leaderboardData.filter(
            (user) =>
                (user.name && user.name.toLowerCase().includes(q)) ||
                (user.category && user.category.toLowerCase().includes(q))
        );
    }, [leaderboardData, searchQuery]);

    const categoryOptions = useMemo(() => {
        const set = new Set(DEFAULT_CATEGORIES);
        discoveredCategories.forEach((c) => set.add(c));
        return Array.from(set);
    }, [discoveredCategories]);

    const top3 = useMemo(() => filteredData.slice(0, 3), [filteredData]);
    const showPodium = !isEmbedded && !searchQuery.trim() && top3.length >= 3;

    // In Top 5 mode, display only up to 5 users. In Full mode, apply pagination.
    const totalRanked = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalRanked / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    const displayData = useMemo(() => {
        if (isTop5) {
            return filteredData.slice(0, 5);
        }
        const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
        return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredData, isTop5, safeCurrentPage]);

    // Navigation handlers
    const handleSeeMore = () => {
        const fullPath = isDashboard ? '/dashboard/leaderboard/full' : '/leaderboard/full';
        if (!isAuthenticated) {
            navigate(`/login?redirect=${encodeURIComponent(fullPath)}`, {
                state: { from: fullPath },
            });
        } else {
            navigate(fullPath);
        }
    };

    const handleShowLess = () => {
        const top5Path = isDashboard ? '/dashboard/leaderboard' : '/leaderboard';
        navigate(top5Path);
    };

    // Rank Badge with Gold, Silver, Bronze visual highlights
    const getRankBadge = (rank) => {
        if (rank === 1) {
            return (
                <div
                    title="Rank #1 — Gold Champion"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/30 via-amber-400/25 to-yellow-300/30 text-amber-500 flex items-center justify-center font-extrabold border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0"
                >
                    <Trophy className="w-4 h-4 fill-amber-400 text-amber-600 drop-shadow-xs" aria-hidden="true" />
                </div>
            );
        }
        if (rank === 2) {
            return (
                <div
                    title="Rank #2 — Silver Runner-Up"
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold border-2 shadow-[0_0_10px_rgba(148,163,184,0.25)] shrink-0 ${
                        isDark
                            ? 'bg-gradient-to-tr from-slate-400/25 to-slate-200/20 text-slate-200 border-slate-300/60'
                            : 'bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 border-slate-400'
                    }`}
                >
                    <Medal className="w-4 h-4 text-slate-400 dark:text-slate-200" aria-hidden="true" />
                </div>
            );
        }
        if (rank === 3) {
            return (
                <div
                    title="Rank #3 — Bronze Third Place"
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold border-2 shadow-[0_0_10px_rgba(180,83,9,0.25)] shrink-0 ${
                        isDark
                            ? 'bg-gradient-to-tr from-amber-700/30 to-amber-600/20 text-amber-400 border-amber-600/60'
                            : 'bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-800 border-amber-600/50'
                    }`}
                >
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                </div>
            );
        }
        return (
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs font-mono border shrink-0 ${
                    isDark
                        ? 'bg-[#21262D] text-[#8B949E] border-[#30363D]'
                        : 'bg-[#F3EFEA] text-[#5C6460] border-[#E6E0D6]'
                }`}
            >
                #{rank}
            </div>
        );
    };

    const getAvatarContent = (userEntry) => {
        const avatarStr = String(userEntry.avatar || '').trim();
        if (avatarStr.startsWith('http://') || avatarStr.startsWith('https://') || avatarStr.startsWith('data:image')) {
            return (
                <img
                    src={avatarStr}
                    alt={userEntry.name || 'User'}
                    className="w-full h-full object-cover rounded-full"
                />
            );
        }
        const initials =
            avatarStr.length > 0 && avatarStr.length <= 3
                ? avatarStr.toUpperCase()
                : String(userEntry.name || 'U')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase();
        return <span>{initials || 'U'}</span>;
    };

    return (
        <div className="w-full space-y-6">
            {/* Top Navigation Bar in Full Mode */}
            {!isTop5 && (
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleShowLess}
                            className="btn-secondary inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Show Less (Top 5)</span>
                        </button>
                        <div className="hidden sm:block text-xs text-[var(--foreground-secondary)]">
                            Showing full leaderboard directory ({totalRanked} total learners)
                        </div>
                    </div>
                    <span className="badge badge-emerald text-xs font-bold px-3 py-1">
                        Full Standings
                    </span>
                </div>
            )}

            {/* Controls Bar: Timeframe, Category, Search */}
            {!isEmbedded && (
                <div
                    className={`flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-4 sm:p-5 rounded-2xl border transition-colors ${
                        isDark
                            ? 'bg-[#161B22] border-[#30363D]'
                            : 'bg-white border-[#E6E0D6] shadow-xs'
                    }`}
                >
                    {/* Timeframe Pills */}
                    <div
                        role="tablist"
                        aria-label="Ranking Timeframe"
                        className={`flex p-1 rounded-xl border w-full lg:w-auto ${
                            isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#F3EFEA] border-[#E6E0D6]'
                        }`}
                    >
                        {TIMEFRAMES.map((tf) => {
                            const active = timeframe === tf.id;
                            return (
                                <button
                                    key={tf.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setTimeframe(tf.id)}
                                    className={`flex-1 lg:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                        active
                                            ? 'bg-[#285A4D] text-white shadow-xs'
                                            : isDark
                                              ? 'text-[#8B949E] hover:text-[#F0F6FC]'
                                              : 'text-[#5C6460] hover:text-[#1A1D1C]'
                                    }`}
                                >
                                    {tf.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Category Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow sm:w-64">
                            <Search
                                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                                    isDark ? 'text-[#8B949E]' : 'text-[#8C9490]'
                                }`}
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                aria-label="Search participant or technology"
                                placeholder="Search user or tech..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-9 py-2 rounded-xl text-sm border transition-all focus:outline-none ${
                                    isDark
                                        ? 'bg-[#0D1117] border-[#30363D] text-[#F0F6FC] placeholder-[#8B949E] focus:border-[#3FB950]'
                                        : 'bg-[#FAF8F5] border-[#E6E0D6] text-[#1A1D1C] placeholder-[#8C9490] focus:border-[#285A4D] focus:bg-white'
                                }`}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setSearchQuery('')}
                                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full cursor-pointer ${
                                        isDark ? 'text-[#8B949E] hover:text-[#F0F6FC]' : 'text-[#8C9490] hover:text-[#1A1D1C]'
                                    }`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative sm:w-48">
                            <Filter
                                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                                    isDark ? 'text-[#8B949E]' : 'text-[#8C9490]'
                                }`}
                                aria-hidden="true"
                            />
                            <select
                                aria-label="Filter by technology category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`w-full pl-10 pr-9 py-2 rounded-xl text-sm font-medium border appearance-none cursor-pointer transition-all focus:outline-none ${
                                    isDark
                                        ? 'bg-[#0D1117] border-[#30363D] text-[#F0F6FC] focus:border-[#3FB950]'
                                        : 'bg-[#FAF8F5] border-[#E6E0D6] text-[#1A1D1C] focus:border-[#285A4D] focus:bg-white'
                                }`}
                            >
                                {categoryOptions.map((cat) => (
                                    <option
                                        key={cat}
                                        value={cat}
                                        className={isDark ? 'bg-[#161B22] text-[#F0F6FC]' : 'bg-white text-[#1A1D1C]'}
                                    >
                                        {cat === 'All' ? 'All Technologies' : cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                                    isDark ? 'text-[#8B949E]' : 'text-[#8C9490]'
                                }`}
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Current User Rank Callout Banner (when logged in & loaded) */}
            {!loading && !error && currentUser && (
                <div
                    className={`rounded-2xl border p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        isDark
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-[#F0F6FC]'
                            : 'bg-[#E3EFEA]/70 border-[#285A4D]/25 text-[#1A1D1C]'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#285A4D] text-white'
                            }`}
                        >
                            <UserCheck className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm sm:text-base">
                                    {currentUserRankEntry
                                        ? `Your Current Rank: #${currentUserRankEntry.rank}`
                                        : 'You are not ranked in this view yet'}
                                </span>
                                {currentUserRankEntry && (
                                    <span className="badge badge-success">
                                        Top {Math.max(1, Math.round((currentUserRankEntry.rank / leaderboardData.length) * 100))}%
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs sm:text-sm ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                {currentUserRankEntry
                                    ? `${currentUserRankEntry.xp.toLocaleString()} XP • ${currentUserRankEntry.quizzes} ${
                                          currentUserRankEntry.quizzes === 1 ? 'quiz' : 'quizzes'
                                      } completed • ${currentUserRankEntry.score}% avg score`
                                    : 'Complete a technical quiz to earn XP and appear on the global leaderboard.'}
                            </p>
                        </div>
                    </div>
                    {!currentUserRankEntry && (
                        <Link to="/technologies" className="btn-primary text-xs sm:text-sm py-2 px-4 shrink-0">
                            Take a Quiz
                        </Link>
                    )}
                </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
                <div className="space-y-6" aria-busy="true" aria-label="Loading rankings">
                    {!isEmbedded && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className={`rounded-2xl border p-6 flex flex-col items-center ${
                                        isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-[#E6E0D6]'
                                    }`}
                                >
                                    <div className="w-16 h-16 rounded-full skeleton mb-4" />
                                    <div className="h-5 w-32 rounded-md skeleton mb-2" />
                                    <div className="h-4 w-20 rounded-md skeleton mb-5" />
                                    <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-[#E6E0D6]/40">
                                        <div className="h-10 rounded-lg skeleton" />
                                        <div className="h-10 rounded-lg skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        className={`rounded-2xl border overflow-hidden ${
                            isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-[#E6E0D6]'
                        }`}
                    >
                        <div className="p-4 sm:p-6 space-y-4">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <div key={row} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 flex-1">
                                        <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                                        <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                                        <div className="space-y-2 flex-1 max-w-xs">
                                            <div className="h-4 w-3/4 rounded-md skeleton" />
                                            <div className="h-3 w-1/2 rounded-md skeleton" />
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-6">
                                        <div className="h-4 w-16 rounded-md skeleton" />
                                        <div className="h-4 w-20 rounded-md skeleton" />
                                        <div className="h-6 w-20 rounded-lg skeleton" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div
                    role="alert"
                    className={`rounded-2xl border p-8 sm:p-12 text-center max-w-xl mx-auto my-4 ${
                        isDark ? 'bg-[#161B22] border-red-500/30' : 'bg-white border-red-200 shadow-xs'
                    }`}
                >
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h2 className={`text-xl font-bold font-display mb-2 ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                        Could Not Load Rankings
                    </h2>
                    <p className={`text-sm mb-6 ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>{error}</p>
                    <button
                        type="button"
                        onClick={loadData}
                        className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        <span>Retry</span>
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredData.length === 0 && (
                <div
                    className={`rounded-2xl border p-8 sm:p-14 text-center ${
                        isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-[#E6E0D6] shadow-xs'
                    }`}
                >
                    <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                            isDark ? 'bg-[#21262D] text-[#8B949E]' : 'bg-[#F3EFEA] text-[#5C6460]'
                        }`}
                    >
                        <Trophy className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h2 className={`text-xl font-bold font-display mb-2 ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                        No Rankings Found
                    </h2>
                    <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                        {searchQuery || category !== 'All' || timeframe !== 'all-time'
                            ? 'No participants matched your active filters. Try clearing your search or switching back to All-Time rankings.'
                            : 'No quizzes have been completed yet. Be the first to complete a quiz and claim the #1 spot!'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {(searchQuery || category !== 'All' || timeframe !== 'all-time') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setCategory('All');
                                    setTimeframe('all-time');
                                }}
                                className="btn-secondary text-sm py-2 px-4 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}
                        <Link to="/technologies" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-5">
                            <BookOpen className="w-4 h-4" aria-hidden="true" />
                            <span>Explore Quizzes</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content: Podium + Rankings Table & Mobile Cards */}
            {!loading && !error && filteredData.length > 0 && (
                <>
                    {/* Top 3 Podium Cards with Gold, Silver, Bronze Highlights */}
                    {showPodium && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch pt-2">
                            {[
                                { user: top3[0], place: 1, orderClass: 'order-1 md:order-2' },
                                { user: top3[1], place: 2, orderClass: 'order-2 md:order-1' },
                                { user: top3[2], place: 3, orderClass: 'order-3 md:order-3' },
                            ].map(({ user: topUser, place, orderClass }) => {
                                const isFirst = place === 1;
                                const isSecond = place === 2;
                                const isThird = place === 3;
                                const isMe = isCurrentUserEntry(topUser);

                                // Card highlights
                                const cardBorderHighlight = isFirst
                                    ? isDark
                                        ? 'bg-gradient-to-b from-[#252015] via-[#1A1813] to-[#161B22] border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.22)]'
                                        : 'bg-gradient-to-b from-[#FFFDF2] via-[#FFF9E6] to-white border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                                    : isSecond
                                      ? isDark
                                          ? 'bg-gradient-to-b from-[#1C2331] via-[#171B26] to-[#161B22] border-slate-300/70 shadow-[0_0_20px_rgba(148,163,184,0.18)]'
                                          : 'bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-white border-slate-300 shadow-[0_0_18px_rgba(148,163,184,0.15)]'
                                      : isDark
                                        ? 'bg-gradient-to-b from-[#241A13] via-[#1C1713] to-[#161B22] border-amber-700/70 shadow-[0_0_20px_rgba(180,83,9,0.18)]'
                                        : 'bg-gradient-to-b from-[#FFF9F5] via-[#FDF2EA] to-white border-amber-600/40 shadow-[0_0_18px_rgba(180,83,9,0.14)]';

                                const badgeColors = isFirst
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-300 font-extrabold shadow-sm'
                                    : isSecond
                                      ? 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 text-slate-900 dark:text-slate-100 border-slate-300 font-extrabold shadow-sm'
                                      : 'bg-gradient-to-r from-amber-700 to-amber-800 text-amber-100 border-amber-600 font-extrabold shadow-sm';

                                const avatarRing = isFirst
                                    ? 'border-2 border-amber-400 ring-4 ring-amber-400/25 bg-amber-500/15 text-amber-500'
                                    : isSecond
                                      ? 'border-2 border-slate-300 ring-4 ring-slate-400/25 bg-slate-400/15 text-slate-700 dark:text-slate-200'
                                      : 'border-2 border-amber-600 ring-4 ring-amber-600/25 bg-amber-700/15 text-amber-700 dark:text-amber-400';

                                return (
                                    <div
                                        key={topUser.id || place}
                                        className={`${orderClass} relative rounded-3xl border-2 p-6 flex flex-col items-center text-center transition-all hover:-translate-y-1 ${cardBorderHighlight} ${
                                            isMe ? 'ring-2 ring-[#285A4D]' : ''
                                        }`}
                                    >
                                        {/* Highlight Header */}
                                        <div className="flex items-center justify-between w-full mb-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${badgeColors}`}
                                            >
                                                {isFirst ? (
                                                    <Trophy className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                                                ) : isSecond ? (
                                                    <Medal className="w-3.5 h-3.5" aria-hidden="true" />
                                                ) : (
                                                    <Award className="w-3.5 h-3.5" aria-hidden="true" />
                                                )}
                                                <span>#{place} {isFirst ? 'Gold' : isSecond ? 'Silver' : 'Bronze'}</span>
                                            </span>
                                            {isMe && <span className="badge badge-success text-[10px] font-extrabold">YOU</span>}
                                            <span
                                                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border truncate max-w-[120px] ${
                                                    isDark
                                                        ? 'bg-[#21262D] text-[#8B949E] border-[#30363D]'
                                                        : 'bg-[#F3EFEA] text-[#5C6460] border-[#E6E0D6]'
                                                }`}
                                            >
                                                {topUser.category || 'General'}
                                            </span>
                                        </div>

                                        {/* Avatar */}
                                        <div
                                            className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-bold text-2xl mb-3 overflow-hidden shadow-md ${avatarRing}`}
                                        >
                                            {getAvatarContent(topUser)}
                                        </div>

                                        {/* Name */}
                                        <h3
                                            className={`text-lg sm:text-xl font-extrabold font-display truncate max-w-full mb-1 ${
                                                isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                            }`}
                                        >
                                            {topUser.name}
                                        </h3>

                                        {/* XP Pill */}
                                        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl font-mono font-bold text-sm mb-4 border ${
                                            isFirst
                                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-400/40'
                                                : isSecond
                                                  ? 'bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/40'
                                                  : 'bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/40'
                                        }`}>
                                            <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                                            <span>{topUser.xp.toLocaleString()} XP</span>
                                        </div>

                                        {/* Metrics Footer */}
                                        <div
                                            className={`w-full grid grid-cols-3 gap-2 pt-4 mt-auto border-t text-center ${
                                                isDark ? 'border-[#30363D]' : 'border-[#E6E0D6]'
                                            }`}
                                        >
                                            <div>
                                                <div
                                                    className={`text-sm font-bold font-mono ${
                                                        isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                    }`}
                                                >
                                                    {topUser.score}%
                                                </div>
                                                <div className={`text-[11px] ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                                    Avg Score
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    className={`text-sm font-bold font-mono ${
                                                        isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                    }`}
                                                >
                                                    {topUser.quizzes}
                                                </div>
                                                <div className={`text-[11px] ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                                    Quizzes
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    className={`text-sm font-bold font-mono flex items-center justify-center gap-1 ${
                                                        isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                    }`}
                                                >
                                                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" aria-hidden="true" />
                                                    {topUser.streak || '1d'}
                                                </div>
                                                <div className={`text-[11px] ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                                    Streak
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Rankings Container (Desktop Table + Mobile Cards) */}
                    <div
                        className={`rounded-2xl border overflow-hidden transition-colors ${
                            isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-[#E6E0D6] shadow-xs'
                        }`}
                    >
                        {/* Section Header */}
                        <div
                            className={`px-4 sm:px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
                                isDark ? 'border-[#30363D] bg-[#1C2128]/60' : 'border-[#E6E0D6] bg-[#FAF8F5]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Trophy
                                    className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-[#285A4D]'}`}
                                    aria-hidden="true"
                                />
                                <h2 className={`text-sm sm:text-base font-bold ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                                    {isTop5 ? 'Top 5 Standings' : `All Standings (${totalRanked})`}
                                </h2>
                                {isTop5 && totalRanked > 5 && (
                                    <span className="badge badge-emerald text-[11px]">
                                        Top 5 View
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium hidden sm:inline ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                    {isTop5
                                        ? 'Displaying Top 5 by XP & Accuracy'
                                        : `Showing ${Math.min((safeCurrentPage - 1) * PAGE_SIZE + 1, totalRanked)}–${Math.min(
                                              safeCurrentPage * PAGE_SIZE,
                                              totalRanked
                                          )} of ${totalRanked} developers`}
                                </span>
                                {!isTop5 && (
                                    <button
                                        type="button"
                                        onClick={handleShowLess}
                                        className="btn-secondary text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                        <span>Show Less</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Desktop & Tablet Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr
                                        className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                                            isDark
                                                ? 'border-[#30363D] text-[#8B949E] bg-[#0D1117]/40'
                                                : 'border-[#E6E0D6] text-[#5C6460] bg-[#FAF8F5]/60'
                                        }`}
                                    >
                                        <th className="py-3.5 px-6 w-20">Rank</th>
                                        <th className="py-3.5 px-6">Participant</th>
                                        <th className="py-3.5 px-6">Top Category</th>
                                        <th className="py-3.5 px-6 text-center">Quizzes</th>
                                        <th className="py-3.5 px-6">Avg Accuracy</th>
                                        <th className="py-3.5 px-6">Streak</th>
                                        <th className="py-3.5 px-6 text-right">Total XP</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y text-sm ${isDark ? 'divide-[#30363D]' : 'divide-[#E6E0D6]'}`}>
                                    {displayData.map((userRow) => {
                                        const isMe = isCurrentUserEntry(userRow);
                                        const isGold = userRow.rank === 1;
                                        const isSilver = userRow.rank === 2;
                                        const isBronze = userRow.rank === 3;

                                        return (
                                            <tr
                                                key={userRow.id || userRow.rank}
                                                className={`transition-colors ${
                                                    isMe
                                                        ? isDark
                                                            ? 'bg-emerald-950/30 hover:bg-emerald-950/45 border-l-4 border-l-emerald-400'
                                                            : 'bg-[#E3EFEA]/60 hover:bg-[#E3EFEA]/90 border-l-4 border-l-[#285A4D]'
                                                        : isGold
                                                          ? isDark
                                                              ? 'bg-amber-500/[0.04] hover:bg-amber-500/[0.08] border-l-4 border-l-amber-400'
                                                              : 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06] border-l-4 border-l-amber-400'
                                                          : isSilver
                                                            ? isDark
                                                                ? 'bg-slate-400/[0.04] hover:bg-slate-400/[0.08] border-l-4 border-l-slate-400'
                                                                : 'bg-slate-400/[0.03] hover:bg-slate-400/[0.06] border-l-4 border-l-slate-400'
                                                            : isBronze
                                                              ? isDark
                                                                  ? 'bg-amber-700/[0.04] hover:bg-amber-700/[0.08] border-l-4 border-l-amber-600'
                                                                  : 'bg-amber-700/[0.03] hover:bg-amber-700/[0.06] border-l-4 border-l-amber-600'
                                                              : isDark
                                                                ? 'hover:bg-[#21262D]/60'
                                                                : 'hover:bg-[#FAF8F5]'
                                                }`}
                                            >
                                                {/* Rank */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    {getRankBadge(userRow.rank)}
                                                </td>

                                                {/* Participant */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-3.5">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border overflow-hidden ${
                                                                isGold
                                                                    ? 'border-2 border-amber-400 ring-2 ring-amber-400/20 bg-amber-500/10 text-amber-600'
                                                                    : isSilver
                                                                      ? 'border-2 border-slate-400 ring-2 ring-slate-400/20 bg-slate-300/20 text-slate-700 dark:text-slate-200'
                                                                      : isBronze
                                                                        ? 'border-2 border-amber-600 ring-2 ring-amber-600/20 bg-amber-700/15 text-amber-700 dark:text-amber-400'
                                                                        : isDark
                                                                          ? 'bg-[#21262D] text-[#F0F6FC] border-[#30363D]'
                                                                          : 'bg-[#E3EFEA] text-[#193D35] border-[#285A4D]/20'
                                                            }`}
                                                        >
                                                            {getAvatarContent(userRow)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className={`font-bold truncate ${
                                                                        isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                                    }`}
                                                                >
                                                                    {userRow.name}
                                                                </span>
                                                                {isMe && (
                                                                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#285A4D] text-white rounded-md">
                                                                        YOU
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div
                                                                className={`text-xs flex items-center gap-2 mt-0.5 ${
                                                                    isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'
                                                                }`}
                                                            >
                                                                <span>{userRow.role || 'Candidate'}</span>
                                                                {userRow.certs > 0 && (
                                                                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                                                        • <Star className="w-3 h-3 fill-current" /> {userRow.certs}{' '}
                                                                        {userRow.certs === 1 ? 'cert' : 'certs'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Top Category */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                            isDark
                                                                ? 'bg-[#21262D] text-[#F0F6FC] border-[#30363D]'
                                                                : 'bg-[#FAF8F5] text-[#1A1D1C] border-[#E6E0D6]'
                                                        }`}
                                                    >
                                                        {userRow.category || 'General'}
                                                    </span>
                                                </td>

                                                {/* Quizzes Completed */}
                                                <td className="py-4 px-6 whitespace-nowrap text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 font-mono font-bold text-sm ${
                                                            isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                        }`}
                                                    >
                                                        <CheckCircle2
                                                            className={`w-3.5 h-3.5 ${
                                                                isDark ? 'text-emerald-400' : 'text-[#285A4D]'
                                                            }`}
                                                            aria-hidden="true"
                                                        />
                                                        {userRow.quizzes}
                                                    </span>
                                                </td>

                                                {/* Avg Accuracy */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-20 progress-bar">
                                                            <div
                                                                className="progress-bar-fill"
                                                                style={{
                                                                    width: `${Math.min(100, Math.max(0, userRow.score))}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span
                                                            className={`font-mono font-bold text-xs w-10 ${
                                                                isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                            }`}
                                                        >
                                                            {userRow.score}%
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Streak */}
                                                <td className="py-4 px-6 whitespace-nowrap">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                                            isDark
                                                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                                : 'bg-orange-50 text-orange-700 border-orange-200'
                                                        }`}
                                                    >
                                                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" aria-hidden="true" />
                                                        <span>{userRow.streak || '1d'}</span>
                                                    </div>
                                                </td>

                                                {/* Total XP */}
                                                <td className="py-4 px-6 whitespace-nowrap text-right">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 font-mono font-bold px-3 py-1 rounded-lg border ${
                                                            isGold
                                                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-400/30'
                                                                : isSilver
                                                                  ? 'bg-slate-300/20 text-slate-800 dark:text-slate-200 border-slate-300/40'
                                                                  : isBronze
                                                                    ? 'bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/30'
                                                                    : isDark
                                                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                                      : 'bg-[#E3EFEA] text-[#193D35] border-[#285A4D]/20'
                                                        }`}
                                                    >
                                                        <Zap className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                                                        <span>{userRow.xp.toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card List View (< 768px) */}
                        <div className={`md:hidden divide-y ${isDark ? 'divide-[#30363D]' : 'divide-[#E6E0D6]'}`}>
                            {displayData.map((userCard) => {
                                const isMe = isCurrentUserEntry(userCard);
                                const isGold = userCard.rank === 1;
                                const isSilver = userCard.rank === 2;
                                const isBronze = userCard.rank === 3;

                                return (
                                    <div
                                        key={userCard.id || userCard.rank}
                                        className={`p-4 flex flex-col gap-3 transition-colors ${
                                            isMe
                                                ? isDark
                                                    ? 'bg-emerald-950/30 border-l-4 border-l-emerald-400'
                                                    : 'bg-[#E3EFEA]/60 border-l-4 border-l-[#285A4D]'
                                                : isGold
                                                  ? isDark
                                                      ? 'bg-amber-500/[0.04] border-l-4 border-l-amber-400'
                                                      : 'bg-amber-500/[0.03] border-l-4 border-l-amber-400'
                                                  : isSilver
                                                    ? isDark
                                                        ? 'bg-slate-400/[0.04] border-l-4 border-l-slate-400'
                                                        : 'bg-slate-400/[0.03] border-l-4 border-l-slate-400'
                                                    : isBronze
                                                      ? isDark
                                                          ? 'bg-amber-700/[0.04] border-l-4 border-l-amber-600'
                                                          : 'bg-amber-700/[0.03] border-l-4 border-l-amber-600'
                                                      : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {getRankBadge(userCard.rank)}
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border overflow-hidden ${
                                                        isGold
                                                            ? 'border-2 border-amber-400 ring-2 ring-amber-400/20 bg-amber-500/10 text-amber-600'
                                                            : isSilver
                                                              ? 'border-2 border-slate-400 ring-2 ring-slate-400/20 bg-slate-300/20 text-slate-700 dark:text-slate-200'
                                                              : isBronze
                                                                ? 'border-2 border-amber-600 ring-2 ring-amber-600/20 bg-amber-700/15 text-amber-700 dark:text-amber-400'
                                                                : isDark
                                                                  ? 'bg-[#21262D] text-[#F0F6FC] border-[#30363D]'
                                                                  : 'bg-[#E3EFEA] text-[#193D35] border-[#285A4D]/20'
                                                    }`}
                                                >
                                                    {getAvatarContent(userCard)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`font-bold text-sm truncate ${
                                                                isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                                            }`}
                                                        >
                                                            {userCard.name}
                                                        </span>
                                                        {isMe && (
                                                            <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-[#285A4D] text-white rounded">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div
                                                        className={`text-xs truncate ${
                                                            isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'
                                                        }`}
                                                    >
                                                        {userCard.category || 'General'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border shrink-0 ${
                                                    isGold
                                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-400/30'
                                                        : isSilver
                                                          ? 'bg-slate-300/20 text-slate-800 dark:text-slate-200 border-slate-300/40'
                                                          : isBronze
                                                            ? 'bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/30'
                                                            : isDark
                                                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                                              : 'bg-[#E3EFEA] text-[#193D35] border-[#285A4D]/20'
                                                }`}
                                            >
                                                <Zap className="w-3 h-3 fill-current" aria-hidden="true" />
                                                <span>{userCard.xp.toLocaleString()} XP</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`grid grid-cols-3 gap-2 pt-2 border-t text-xs ${
                                                isDark ? 'border-[#30363D]/60' : 'border-[#E6E0D6]/70'
                                            }`}
                                        >
                                            <div>
                                                <span className={isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}>Quizzes: </span>
                                                <span className={`font-mono font-bold ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                                                    {userCard.quizzes}
                                                </span>
                                            </div>
                                            <div>
                                                <span className={isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}>Accuracy: </span>
                                                <span className={`font-mono font-bold ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                                                    {userCard.score}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end gap-1 font-mono font-bold">
                                                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" aria-hidden="true" />
                                                <span className={isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}>
                                                    {userCard.streak || '1d'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top 5 Mode: Clear "See More" Button Below Top 5 Users */}
                    {isTop5 && totalRanked > 5 && (
                        <div
                            className={`p-6 sm:p-8 rounded-3xl border text-center transition-all shadow-sm ${
                                isDark
                                    ? 'bg-gradient-to-br from-[#161B22] via-[#1C2128] to-[#0D1117] border-[#30363D]'
                                    : 'bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] border-[#E6E0D6]'
                            }`}
                        >
                            <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h3 className={`text-lg sm:text-xl font-extrabold font-display ${isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'}`}>
                                    Viewing Top 5 of {totalRanked} Ranked Developers
                                </h3>
                                <p className={`text-xs sm:text-sm max-w-md ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                    {isAuthenticated
                                        ? `Explore all ${totalRanked} ranked developers, filter by technical domains, and inspect full global standings.`
                                        : `Sign in to access all ${totalRanked} ranked learners worldwide, view personalized technology stats, and verify your rank.`}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleSeeMore}
                                    className="btn-primary mt-2 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <Trophy className="w-4 h-4" />
                                    <span>See More ({totalRanked - 5} More Learners)</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Full Mode: Pagination Controls */}
                    {!isTop5 && totalPages > 1 && (
                        <div
                            className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                                isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-[#E6E0D6] shadow-xs'
                            }`}
                        >
                            <div className={`text-xs font-medium ${isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'}`}>
                                Showing page <span className="font-bold text-[var(--foreground)]">{safeCurrentPage}</span> of{' '}
                                <span className="font-bold text-[var(--foreground)]">{totalPages}</span> ({totalRanked} total learners)
                            </div>

                            <div className="flex items-center gap-1.5">
                                {/* First page */}
                                <button
                                    type="button"
                                    title="First page"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={safeCurrentPage === 1}
                                    className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]'
                                            : 'bg-white border-[#E6E0D6] text-[#1A1D1C] hover:bg-[#FAF8F5]'
                                    }`}
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>

                                {/* Prev page */}
                                <button
                                    type="button"
                                    title="Previous page"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safeCurrentPage === 1}
                                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]'
                                            : 'bg-white border-[#E6E0D6] text-[#1A1D1C] hover:bg-[#FAF8F5]'
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>Prev</span>
                                </button>

                                {/* Numbered page buttons */}
                                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                                    .filter((p) => Math.abs(p - safeCurrentPage) <= 2 || p === 1 || p === totalPages)
                                    .map((p, idx, arr) => {
                                        const prevPageNum = arr[idx - 1];
                                        const showEllipsisBefore = prevPageNum && p - prevPageNum > 1;
                                        const isActivePage = p === safeCurrentPage;

                                        return (
                                            <React.Fragment key={p}>
                                                {showEllipsisBefore && (
                                                    <span className="px-1 text-xs text-[var(--foreground-secondary)]">…</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                        isActivePage
                                                            ? 'bg-[#285A4D] text-white shadow-xs'
                                                            : isDark
                                                              ? 'bg-[#21262D] border border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC]'
                                                              : 'bg-white border border-[#E6E0D6] text-[#5C6460] hover:text-[#1A1D1C]'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                {/* Next page */}
                                <button
                                    type="button"
                                    title="Next page"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safeCurrentPage === totalPages}
                                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]'
                                            : 'bg-white border-[#E6E0D6] text-[#1A1D1C] hover:bg-[#FAF8F5]'
                                    }`}
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Last page */}
                                <button
                                    type="button"
                                    title="Last page"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={safeCurrentPage === totalPages}
                                    className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                        isDark
                                            ? 'bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]'
                                            : 'bg-white border-[#E6E0D6] text-[#1A1D1C] hover:bg-[#FAF8F5]'
                                    }`}
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard;
