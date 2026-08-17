import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'motion/react';
import {
    Trophy, Medal, Star, Award, Search, Users,
    TrendingUp, Flame, Zap, CheckCircle2, ChevronRight,
    ArrowUpRight, ArrowDownRight, Minus, Filter, X
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.25, 0.1, 0.25, 1.0]
        }
    }
};

const mockTopPerformers = [
    {
        rank: 1,
        id: 'usr-1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        initials: 'SC',
        role: 'Full Stack Architect',
        xp: 14850,
        score: 98.4,
        quizzes: 52,
        certs: 14,
        badges: 12,
        streak: 24,
        change: '+2',
        trend: 'up',
        category: 'Full Stack'
    },
    {
        rank: 2,
        id: 'usr-2',
        name: 'James Wilson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        initials: 'JW',
        role: 'React Lead',
        xp: 13200,
        score: 96.1,
        quizzes: 46,
        certs: 11,
        badges: 9,
        streak: 18,
        change: '+1',
        trend: 'up',
        category: 'JavaScript & React'
    },
    {
        rank: 3,
        id: 'usr-3',
        name: 'Priya Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        initials: 'PP',
        role: 'Python & AI Engineer',
        xp: 11950,
        score: 94.8,
        quizzes: 41,
        certs: 9,
        badges: 10,
        streak: 15,
        change: '-1',
        trend: 'down',
        category: 'Python'
    },
    {
        rank: 4,
        id: 'usr-4',
        name: 'Marcus Johnson',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        initials: 'MJ',
        role: 'Backend Specialist',
        xp: 10400,
        score: 92.0,
        quizzes: 36,
        certs: 8,
        badges: 7,
        streak: 12,
        change: '0',
        trend: 'same',
        category: 'Full Stack'
    },
    {
        rank: 5,
        id: 'usr-5',
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        initials: 'ED',
        role: 'DevOps Specialist',
        xp: 9300,
        score: 89.5,
        quizzes: 31,
        certs: 6,
        badges: 8,
        streak: 9,
        change: '+3',
        trend: 'up',
        category: 'DevOps & Cloud'
    },
    {
        rank: 6,
        id: 'usr-6',
        name: 'Alex Kim',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        initials: 'AK',
        role: 'Frontend Engineer',
        xp: 8550,
        score: 88.2,
        quizzes: 29,
        certs: 5,
        badges: 6,
        streak: 8,
        change: '-2',
        trend: 'down',
        category: 'JavaScript & React'
    },
    {
        rank: 7,
        id: 'usr-7',
        name: 'Lisa Anderson',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        initials: 'LA',
        role: 'Cybersecurity Analyst',
        xp: 7800,
        score: 86.0,
        quizzes: 25,
        certs: 4,
        badges: 5,
        streak: 6,
        change: '+1',
        trend: 'up',
        category: 'DevOps & Cloud'
    },
    {
        rank: 8,
        id: 'usr-8',
        name: 'David Martinez',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        initials: 'DM',
        role: 'Mobile Developer',
        xp: 7100,
        score: 84.6,
        quizzes: 22,
        certs: 3,
        badges: 5,
        streak: 5,
        change: '0',
        trend: 'same',
        category: 'JavaScript & React'
    },
    {
        rank: 9,
        id: 'usr-9',
        name: 'Rachel Lee',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        initials: 'RL',
        role: 'Data Engineer',
        xp: 6450,
        score: 82.3,
        quizzes: 19,
        certs: 3,
        badges: 4,
        streak: 4,
        change: '-1',
        trend: 'down',
        category: 'Python'
    },
    {
        rank: 10,
        id: 'usr-10',
        name: 'Tom Brown',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        initials: 'TB',
        role: 'Cloud Architect',
        xp: 5900,
        score: 80.5,
        quizzes: 17,
        certs: 2,
        badges: 3,
        streak: 3,
        change: '+2',
        trend: 'up',
        category: 'DevOps & Cloud'
    }
];

export default function Leaderboard({ currentUserId = null }) {
    const [timeframe, setTimeframe] = useState('all-time'); // 'all-time' | 'monthly' | 'weekly'
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'JavaScript & React', 'Python', 'Full Stack', 'DevOps & Cloud'];

    const filteredPerformers = mockTopPerformers.filter(user => {
        const matchesCategory = category === 'All' || user.category === category;
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.role.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const top3 = filteredPerformers.slice(0, 3);

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
                                    ? 'bg-[#059669] text-white shadow-xs'
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
                            className="pl-8 pr-8 py-2 text-xs font-semibold bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-[#059669] cursor-pointer appearance-none"
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
                            className="w-full pl-9 pr-9 py-2 text-xs font-medium bg-[var(--muted-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-xl focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 transition-all placeholder:text-[var(--foreground-muted)]"
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

            {/* TOP 3 PODIUM (if available in filtered list) */}
            {top3.length >= 3 && !searchQuery && category === 'All' && (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 pt-6 pb-2 items-end"
                >
                    {/* 2nd Place (Silver) */}
                    <motion.div
                        variants={itemVariants}
                        className="order-2 md:order-1 bg-[var(--card-bg)] border border-slate-200 rounded-3xl p-6 text-center shadow-md relative flex flex-col items-center group hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute -top-4 px-3 py-1 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 text-[10px] font-extrabold uppercase rounded-full shadow-sm flex items-center gap-1">
                            <Medal size={12} /> 2nd Place
                        </div>

                        <div className="relative mt-2 mb-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-slate-300 shadow-md bg-slate-100 flex items-center justify-center">
                                <img
                                    src={top3[1].avatar}
                                    alt={top3[1].name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden'); }}
                                />
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-700 text-xl bg-slate-200 hidden">
                                    {top3[1].initials}
                                </div>
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                                2
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-base text-[var(--foreground)] line-clamp-1">{top3[1].name}</h3>
                        <p className="text-[11px] text-[var(--foreground-muted)] font-medium mb-3">{top3[1].role}</p>

                        <div className="w-full bg-[var(--muted-bg)] rounded-2xl p-3 border border-[var(--card-border)] grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">XP Score</p>
                                <p className="text-sm font-extrabold text-[#047857]">{top3[1].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">Accuracy</p>
                                <p className="text-sm font-extrabold text-[#059669]">{top3[1].score}%</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--foreground-secondary)]">
                            <span className="flex items-center gap-1 text-amber-500"><Flame size={13} /> {top3[1].streak}d Streak</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Award size={13} className="text-[#059669]" /> {top3[1].certs} Certs</span>
                        </div>
                    </motion.div>

                    {/* 1st Place (Gold - Elevated) */}
                    <motion.div
                        variants={itemVariants}
                        className="order-1 md:order-2 bg-gradient-to-b from-[#059669] to-[#047857] text-white border-2 border-amber-300 rounded-3xl p-7 text-center shadow-xl relative flex flex-col items-center group hover:-translate-y-2 transition-all duration-300 md:-translate-y-4"
                    >
                        <div className="absolute -top-5 px-4 py-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 text-amber-950 text-xs font-black uppercase rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                            <Trophy size={14} className="fill-amber-950" /> 1st Place Champion
                        </div>

                        <div className="relative mt-3 mb-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-amber-300 shadow-xl bg-amber-100 flex items-center justify-center">
                                <img
                                    src={top3[0].avatar}
                                    alt={top3[0].name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden'); }}
                                />
                                <div className="w-full h-full flex items-center justify-center font-bold text-amber-900 text-2xl bg-amber-100 hidden">
                                    {top3[0].initials}
                                </div>
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow-lg border-2 border-white">
                                👑
                            </span>
                        </div>

                        <h3 className="font-display font-extrabold text-lg text-white line-clamp-1">{top3[0].name}</h3>
                        <p className="text-xs text-emerald-100 font-medium mb-4">{top3[0].role}</p>

                        <div className="w-full bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/25 grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Total XP</p>
                                <p className="text-base font-black text-amber-200">{top3[0].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-emerald-100 font-bold">Accuracy</p>
                                <p className="text-base font-black text-white">{top3[0].score}%</p>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-3 text-xs font-bold text-emerald-50">
                            <span className="flex items-center gap-1 bg-amber-400/20 px-2.5 py-1 rounded-full border border-amber-300/30">
                                <Flame size={14} className="text-amber-300 fill-amber-300" /> {top3[0].streak} Day Streak
                            </span>
                            <span className="flex items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full border border-white/30 text-white">
                                <Award size={14} /> {top3[0].certs} Verified Certs
                            </span>
                        </div>
                    </motion.div>

                    {/* 3rd Place (Bronze) */}
                    <motion.div
                        variants={itemVariants}
                        className="order-3 bg-[var(--card-bg)] border border-amber-300/60 rounded-3xl p-6 text-center shadow-md relative flex flex-col items-center group hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute -top-4 px-3 py-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-extrabold uppercase rounded-full shadow-sm flex items-center gap-1">
                            <Medal size={12} /> 3rd Place
                        </div>

                        <div className="relative mt-2 mb-4">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-amber-600/40 shadow-md bg-amber-50 flex items-center justify-center">
                                <img
                                    src={top3[2].avatar}
                                    alt={top3[2].name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden'); }}
                                />
                                <div className="w-full h-full flex items-center justify-center font-bold text-amber-800 text-xl bg-amber-100 hidden">
                                    {top3[2].initials}
                                </div>
                            </div>
                            <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white">
                                3
                            </span>
                        </div>

                        <h3 className="font-display font-bold text-base text-[var(--foreground)] line-clamp-1">{top3[2].name}</h3>
                        <p className="text-[11px] text-[var(--foreground-muted)] font-medium mb-3">{top3[2].role}</p>

                        <div className="w-full bg-[var(--muted-bg)] rounded-2xl p-3 border border-[var(--card-border)] grid grid-cols-2 gap-2 text-center">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">XP Score</p>
                                <p className="text-sm font-extrabold text-amber-700">{top3[2].xp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">Accuracy</p>
                                <p className="text-sm font-extrabold text-[#059669]">{top3[2].score}%</p>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[var(--foreground-secondary)]">
                            <span className="flex items-center gap-1 text-amber-500"><Flame size={13} /> {top3[2].streak}d Streak</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Award size={13} className="text-[#059669]" /> {top3[2].certs} Certs</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* LEADERBOARD RANKINGS TABLE */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Users size={18} className="text-[#059669]" />
                        <h2 className="font-display font-bold text-base text-[var(--foreground)]">
                            Overall Leaderboard ({filteredPerformers.length})
                        </h2>
                        {searchQuery && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#059669]/10 text-[#059669] border border-[#059669]/20">
                                Matching "{searchQuery}"
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                        Updated Live
                    </span>
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
                                const isCurrentUser = currentUserId && user.id === currentUserId;

                                let rankBadge = (
                                    <span className="w-7 h-7 rounded-lg bg-[var(--muted-bg)] text-[var(--foreground-secondary)] font-bold text-xs flex items-center justify-center mx-auto border border-[var(--card-border)]">
                                        #{user.rank}
                                    </span>
                                );

                                if (user.rank === 1) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥇
                                        </span>
                                    );
                                } else if (user.rank === 2) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥈
                                        </span>
                                    );
                                } else if (user.rank === 3) {
                                    rankBadge = (
                                        <span className="w-8 h-8 rounded-xl bg-amber-700 text-white font-black text-xs flex items-center justify-center mx-auto shadow-xs">
                                            🥉
                                        </span>
                                    );
                                }

                                return (
                                    <motion.tr
                                        key={user.id}
                                        variants={itemVariants}
                                        className={`group hover:bg-[var(--muted-bg)]/80 transition-colors ${
                                            isCurrentUser ? 'bg-[#059669]/10 border-l-4 border-l-[#059669]' : ''
                                        }`}
                                    >
                                        {/* Rank Column */}
                                        <td className="px-5 py-4 text-center">
                                            {rankBadge}
                                        </td>

                                        {/* User Column */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[var(--muted-bg)] border border-[var(--card-border)] shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.classList.remove('hidden'); }}
                                                    />
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[var(--foreground)] hidden">
                                                        {user.initials}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-[var(--foreground)] group-hover:text-[#059669] transition-colors">
                                                            {user.name}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#059669] text-white">
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
                                            <span className="font-extrabold text-sm text-amber-500">
                                                {user.xp.toLocaleString()} <span className="text-[10px] font-semibold">XP</span>
                                            </span>
                                        </td>

                                        {/* Accuracy */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-extrabold text-xs text-emerald-600">
                                                    {user.score}%
                                                </span>
                                                <div className="w-16 h-1 bg-[var(--muted-bg)] rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full"
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
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#059669]">
                                                <Award size={13} /> {user.certs}
                                            </span>
                                        </td>

                                        {/* Streak */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                                                <Flame size={13} className="fill-amber-500" /> {user.streak}d
                                            </span>
                                        </td>

                                        {/* Trend */}
                                        <td className="px-5 py-4 text-center">
                                            {user.trend === 'up' && (
                                                <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                                                    <ArrowUpRight size={14} /> {user.change}
                                                </span>
                                            )}
                                            {user.trend === 'down' && (
                                                <span className="inline-flex items-center text-xs font-bold text-red-500">
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
                                No performers found matching "{searchQuery}".
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)] mb-4">
                                Try adjusting your search query or category filter.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setCategory('All'); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#059669] text-white hover:bg-[#047857] transition-colors cursor-pointer"
                            >
                                <X size={12} /> Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
