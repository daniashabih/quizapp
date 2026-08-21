import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
    Trophy, Medal, Star, Award, Search, Users,
    TrendingUp, Flame, Zap, CheckCircle2, ChevronRight,
    ArrowUpRight, ArrowDownRight, Minus, Filter, X, RefreshCw, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1.0]
        }
    }
};

export default function Leaderboard({ onStatsLoaded = null }) {
    const { user: currentUser } = useAuth();
    const [timeframe, setTimeframe] = useState('all-time'); // 'all-time' | 'monthly' | 'weekly'
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState(['All']);
    const [performers, setPerformers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch categories for filter dropdown
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await axios.get('/categories');
                if (Array.isArray(res.data)) {
                    setCategories(['All', ...res.data.map(c => c.name)]);
                }
            } catch { /* silent */ }
        };
        fetchCats();
    }, []);

    // Fetch live leaderboard
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.getLeaderboard({ timeframe, category });
            if (res.success && Array.isArray(res.leaderboard)) {
                setPerformers(res.leaderboard);
                if (onStatsLoaded) {
                    const totalRanked = res.leaderboard.length;
                    const totalCerts = res.leaderboard.reduce((acc, u) => acc + (u.certs || 0), 0);
                    const maxStreak = res.leaderboard.length > 0 ? Math.max(...res.leaderboard.map(u => u.streak || 0)) : 0;
                    const totalQuizzes = res.leaderboard.reduce((acc, u) => acc + (u.quizzes || 0), 0);
                    onStatsLoaded({ totalRanked, totalCerts, maxStreak, totalQuizzes });
                }
            } else {
                throw new Error(res.message || 'Failed to load leaderboard');
            }
        } catch (err) {
            console.error('[Leaderboard Fetch Error]:', err);
            setError('Unable to load leaderboard data.');
        } finally {
            setLoading(false);
        }
    }, [timeframe, category, onStatsLoaded]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const filteredPerformers = performers.filter(user => {
        const matchesCategory = category === 'All' || user.category === category;
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const top3 = filteredPerformers.filter(u => u.quizzes > 0).slice(0, 3);

    if (loading) {
        return (
            <div className="w-full space-y-6 animate-pulse p-2">
                <div className="h-16 bg-[var(--muted-bg)] rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="bg-[var(--muted-bg)] rounded-3xl" />
                    ))}
                </div>
                <div className="h-96 bg-[var(--muted-bg)] rounded-2xl" />
            </div>
        );
    }

    if (error && performers.length === 0) {
        return (
            <div className="text-center py-16 card p-8 rounded-3xl space-y-4 max-w-md mx-auto">
                <AlertCircle size={32} className="text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-[var(--foreground)]">Unable to load leaderboard</h3>
                <p className="text-xs text-[var(--foreground-muted)]">Could not retrieve live player scores from MongoDB.</p>
                <button onClick={fetchLeaderboard} className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 mx-auto">
                    <RefreshCw size={13} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            {/* Control Bar: Timeframe Tabs + Category Dropdown + Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)] shadow-xs">
                {/* Timeframe Tabs */}
                <div className="flex items-center gap-1 bg-[var(--muted-bg)] p-1 rounded-xl border border-[var(--card-border)]">
                    {[
                        { id: 'all-time', label: 'All Time' },
                        { id: 'monthly', label: 'This Month' },
                        { id: 'weekly', label: 'This Week' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeframe(tab.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                timeframe === tab.id
                                    ? 'bg-[#193D35] text-[#FCFAF4] shadow-xs'
                                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Filter */}
                    <div className="relative flex items-center">
                        <Filter size={14} className="absolute left-3 text-[var(--foreground-muted)] pointer-events-none" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="pl-8 pr-8 py-2 text-xs font-semibold bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-[#193D35] cursor-pointer appearance-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search Field */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by username or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-2 text-xs font-medium bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-[#193D35] focus:ring-2 focus:ring-[#193D35]/20 transition-all placeholder:text-[var(--foreground-muted)]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/50 transition-all cursor-pointer"
                                title="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* TOP 3 PODIUM (Rendered only when active quiz performers exist) */}
            {top3.length >= 3 && !searchQuery && category === 'All' && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-6 pb-2 items-end"
                >
                    {/* 2nd Place */}
                    <motion.div
                        variants={itemVariants}
                        className="order-2 md:order-1 bg-[var(--card-bg)] border border-[#42665B]/30 rounded-3xl p-6 text-center shadow-md relative flex flex-col items-center group hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute -top-4 px-3 py-1 bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] text-[10px] font-extrabold uppercase rounded-full shadow-xs flex items-center gap-1">
                            <Medal size={12} className="text-[#42665B]" /> 2nd Place
                        </div>

                        <div className="relative mt-2 mb-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-[#42665B]/20 shadow-md bg-[#F4EFE6] flex items-center justify-center border border-[#42665B]">
                                {top3[1].avatar ? (
                                    <img
                                        src={top3[1].avatar}
                                        alt={top3[1].name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-[#193D35] text-xl bg-[#F4EFE6]">
                                        {top3[1].initials}
                                    </div>
                                )}
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#42665B] text-[#FCFAF4] font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                                2
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-base text-[var(--foreground)] line-clamp-1">{top3[1].name}</h3>
                        <p className="text-[11px] text-[var(--foreground-muted)] font-medium mb-3">{top3[1].role}</p>

                        <div className="w-full bg-[var(--muted-bg)] rounded-2xl p-3 border border-[var(--card-border)] grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">XP Score</p>
                                <p className="text-sm font-extrabold text-[#193D35]">{top3[1].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">Accuracy</p>
                                <p className="text-sm font-extrabold text-[#193D35]">{top3[1].score}%</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--foreground-secondary)]">
                            <span className="flex items-center gap-1 text-[#193D35]"><Flame size={13} className="text-[#D19A45] fill-[#D19A45]" /> {top3[1].streak}d Streak</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Award size={13} className="text-[#193D35]" /> {top3[1].certs} Certs</span>
                        </div>
                    </motion.div>

                    {/* 1st Place (Champion) */}
                    <motion.div
                        variants={itemVariants}
                        className="order-1 md:order-2 bg-[#193D35] text-[#FCFAF4] border-2 border-[#193D35] rounded-3xl p-7 text-center shadow-xl relative flex flex-col items-center group hover:-translate-y-2 transition-all duration-300 md:-translate-y-4"
                    >
                        <div className="absolute -top-5 px-4 py-1.5 bg-[#D19A45] text-white border border-[#D19A45] text-xs font-black uppercase rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                            <Trophy size={14} className="fill-white text-white" /> 1st Place Champion
                        </div>

                        <div className="relative mt-3 mb-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-[#D19A45] shadow-xl bg-[#122C26] flex items-center justify-center">
                                {top3[0].avatar ? (
                                    <img
                                        src={top3[0].avatar}
                                        alt={top3[0].name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-white text-2xl bg-[#122C26]">
                                        {top3[0].initials}
                                    </div>
                                )}
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#D19A45] text-white font-black text-sm flex items-center justify-center shadow-lg border-2 border-[#193D35]">
                                👑
                            </span>
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-white line-clamp-1">{top3[0].name}</h3>
                        <p className="text-xs text-[#F3E5C5] font-medium mb-4">{top3[0].role}</p>

                        <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#F3E5C5] font-bold">Total XP</p>
                                <p className="text-base font-black text-white">{top3[0].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[#F3E5C5] font-bold">Accuracy</p>
                                <p className="text-base font-black text-white">{top3[0].score}%</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-bold text-white">
                            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                                <Flame size={14} className="text-[#D19A45] fill-[#D19A45]" /> {top3[0].streak} Day Streak
                            </span>
                            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/20 text-white">
                                <Award size={14} className="text-[#D19A45]" /> {top3[0].certs} Verified Certs
                            </span>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        variants={itemVariants}
                        className="order-3 bg-[var(--card-bg)] border border-[#D19A45]/30 rounded-3xl p-6 text-center shadow-md relative flex flex-col items-center group hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute -top-4 px-3 py-1 bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] text-[10px] font-extrabold uppercase rounded-full shadow-xs flex items-center gap-1">
                            <Medal size={12} className="text-[#D19A45]" /> 3rd Place
                        </div>

                        <div className="relative mt-2 mb-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-[#D19A45]/20 shadow-md bg-[#F4EFE6] flex items-center justify-center border border-[#D19A45]">
                                {top3[2].avatar ? (
                                    <img
                                        src={top3[2].avatar}
                                        alt={top3[2].name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-[#193D35] text-xl bg-[#F4EFE6]">
                                        {top3[2].initials}
                                    </div>
                                )}
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#7A807B] text-[#FCFAF4] font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                                3
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-base text-[var(--foreground)] line-clamp-1">{top3[2].name}</h3>
                        <p className="text-[11px] text-[var(--foreground-muted)] font-medium mb-3">{top3[2].role}</p>

                        <div className="w-full bg-[var(--muted-bg)] rounded-2xl p-3 border border-[var(--card-border)] grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">XP Score</p>
                                <p className="text-sm font-extrabold text-[#193D35]">{top3[2].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">Accuracy</p>
                                <p className="text-sm font-extrabold text-[#193D35]">{top3[2].score}%</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--foreground-secondary)]">
                            <span className="flex items-center gap-1 text-[#193D35]"><Flame size={13} className="text-[#D19A45] fill-[#D19A45]" /> {top3[2].streak}d Streak</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Award size={13} className="text-[#193D35]" /> {top3[2].certs} Certs</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* LEADERBOARD RANKINGS TABLE */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Users size={18} className="text-[#193D35]" />
                        <h2 className="font-display font-bold text-base text-[var(--foreground)]">
                            Overall Leaderboard ({filteredPerformers.length})
                        </h2>
                        {searchQuery && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6]">
                                Matching "{searchQuery}"
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--card-border)] bg-[var(--muted-bg)]/60 text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                                <th className="px-5 py-3.5 w-16 text-center">Rank</th>
                                <th className="px-5 py-3.5">Developer / Role</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5 text-right">XP Points</th>
                                <th className="px-5 py-3.5 text-center">Accuracy</th>
                                <th className="px-5 py-3.5 text-center">Quizzes</th>
                                <th className="px-5 py-3.5 text-center">Certs</th>
                                <th className="px-5 py-3.5 text-center">Streak</th>
                                <th className="px-5 py-3.5 text-center">Trend</th>
                            </tr>
                        </thead>
                        <motion.tbody
                            key={`${timeframe}-${category}-${searchQuery}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="divide-y divide-[var(--card-border)]"
                        >
                            {filteredPerformers.map((user) => {
                                const isCurrentUser = currentUser && String(user.id) === String(currentUser.id);

                                let rankBadge = (
                                    <span className="w-7 h-7 rounded-lg bg-[var(--muted-bg)] text-[var(--foreground-secondary)] font-bold text-xs flex items-center justify-center mx-auto border border-[var(--card-border)]">
                                        #{user.rank}
                                    </span>
                                );

                                if (user.rank === 1 && user.quizzes > 0) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-[#D19A45] text-white font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥇
                                        </span>
                                    );
                                } else if (user.rank === 2 && user.quizzes > 0) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥈
                                        </span>
                                    );
                                } else if (user.rank === 3 && user.quizzes > 0) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-[#F4EFE6] text-[#42665B] border border-[#E8E5DD] font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥉
                                        </span>
                                    );
                                }

                                return (
                                    <motion.tr
                                        key={user.id}
                                        variants={itemVariants}
                                        className={`group hover:bg-[var(--muted-bg)]/80 transition-colors ${
                                            isCurrentUser ? 'bg-[#F3E5C5]/40 border-l-4 border-l-[#193D35]' : ''
                                        }`}
                                    >
                                        {/* Rank Column */}
                                        <td className="px-5 py-4 text-center">
                                            {rankBadge}
                                        </td>

                                        {/* User Column */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--muted-bg)] border border-[var(--card-border)] shrink-0 flex items-center justify-center font-bold text-xs text-[var(--foreground)]">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        user.initials
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-[var(--foreground)] group-hover:text-[#193D35] transition-colors">
                                                            {user.name}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#193D35] text-[#FCFAF4]">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--foreground-muted)]">{user.role}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-5 py-4">
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--muted-bg)] text-[var(--foreground-secondary)] border border-[var(--card-border)]">
                                                {user.category}
                                            </span>
                                        </td>

                                        {/* XP Points */}
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-extrabold text-sm text-[#193D35]">
                                                {user.xp.toLocaleString()} <span className="text-[10px] font-semibold text-[var(--foreground-muted)]">XP</span>
                                            </span>
                                        </td>

                                        {/* Accuracy */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-extrabold text-xs text-[#193D35]">
                                                    {user.score}%
                                                </span>
                                                <div className="w-16 h-1.5 bg-[#F4EFE6] rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#193D35] rounded-full"
                                                        style={{ width: `${user.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Quizzes Completed */}
                                        <td className="px-5 py-4 text-center text-xs font-semibold text-[var(--foreground)]">
                                            {user.quizzes}
                                        </td>

                                        {/* Certificates */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#193D35]">
                                                <Award size={13} className="text-[#D19A45]" /> {user.certs}
                                            </span>
                                        </td>

                                        {/* Streak */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#193D35]">
                                                <Flame size={13} className="text-[#D19A45] fill-[#D19A45]" /> {user.streak}d
                                            </span>
                                        </td>

                                        {/* Trend */}
                                        <td className="px-5 py-4 text-center">
                                            {user.trend === 'up' && (
                                                <span className="inline-flex items-center text-xs font-bold text-[#67966D]">
                                                    <ArrowUpRight size={14} /> {user.change}
                                                </span>
                                            )}
                                            {user.trend === 'down' && (
                                                <span className="inline-flex items-center text-xs font-bold text-[#C96155]">
                                                    <ArrowDownRight size={14} /> {user.change}
                                                </span>
                                            )}
                                            {user.trend === 'same' && (
                                                <span className="inline-flex items-center text-xs font-bold text-[var(--foreground-muted)]">
                                                    <Minus size={14} />
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </motion.tbody>
                    </table>

                    {filteredPerformers.length === 0 && (
                        <div className="p-12 text-center">
                            <Users size={32} className="mx-auto text-[var(--foreground-muted)] opacity-40 mb-3" />
                            <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">
                                {searchQuery ? `No performers found matching "${searchQuery}".` : 'No ranked candidates yet.'}
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)] mb-4">
                                Take a quiz to claim the #1 spot on the leaderboard!
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setCategory('All'); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#193D35] text-[#FCFAF4] hover:bg-[#122C26] transition-colors cursor-pointer"
                                >
                                    <X size={12} /> Clear Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
