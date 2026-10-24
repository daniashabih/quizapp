import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LeaderboardComponent from '../../components/Leaderboard';
import { Trophy, Award, Flame, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LeaderboardPage = () => {
    const location = useLocation();
    const { isDark } = useTheme();
    const isDashboard = location.pathname.startsWith('/dashboard');

    const [stats, setStats] = useState({
        totalRanked: 0,
        verifiedCerts: 0,
        maxStreak: '0d',
        totalQuizzes: 0,
        loaded: false,
    });

    const handleStatsLoad = useCallback((data) => {
        if (!data || !Array.isArray(data.leaderboard)) return;
        const activeUsers = data.leaderboard.filter((u) => Number(u.quizzes || 0) > 0);
        const certs = activeUsers.reduce((acc, curr) => acc + (Number(curr.certs) || 0), 0);
        const quizzes = activeUsers.reduce((acc, curr) => acc + (Number(curr.quizzes) || 0), 0);
        let maxStrk = 0;
        activeUsers.forEach((u) => {
            const s = parseInt(String(u.streak || '0').replace(/\D/g, ''), 10) || 0;
            if (s > maxStrk) maxStrk = s;
        });

        setStats({
            totalRanked: activeUsers.length,
            verifiedCerts: certs,
            maxStreak: `${maxStrk}d`,
            totalQuizzes: quizzes,
            loaded: true,
        });
    }, []);

    const statCards = [
        {
            label: 'Ranked Learners',
            value: stats.totalRanked.toLocaleString(),
            icon: Trophy,
            iconBg: isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-[#F3E5C5] text-[#193D35]',
        },
        {
            label: 'Verified Certs',
            value: stats.verifiedCerts.toLocaleString(),
            icon: Award,
            iconBg: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#E3EFEA] text-[#285A4D]',
        },
        {
            label: 'Top Streak',
            value: stats.maxStreak,
            icon: Flame,
            iconBg: isDark ? 'bg-orange-500/15 text-orange-400' : 'bg-orange-100 text-orange-700',
        },
        {
            label: 'Quizzes Completed',
            value: stats.totalQuizzes.toLocaleString(),
            icon: CheckCircle2,
            iconBg: isDark ? 'bg-sky-500/15 text-sky-400' : 'bg-sky-100 text-sky-700',
        },
    ];

    const content = (
        <div className={isDashboard ? 'w-full pb-12' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20'}>
            {/* Page Header Banner */}
            <section
                aria-label="Global Rankings Header"
                className={`relative overflow-hidden rounded-3xl border px-6 py-8 sm:px-10 sm:py-10 mb-8 transition-colors ${
                    isDark
                        ? 'bg-gradient-to-br from-[#1C2128] via-[#161B22] to-[#0D1117] border-[#30363D]'
                        : 'bg-gradient-to-br from-white via-[#FAF8F5] to-[#F3EFEA] border-[#E6E0D6] shadow-sm'
                }`}
            >
                <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                    {/* Pill Badge with horizontally & vertically aligned Trophy icon and heading label */}
                    <div className="badge badge-emerald mb-4 inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full shadow-xs">
                        <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span className="font-semibold tracking-wide">Global Rankings</span>
                    </div>

                    <h1
                        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight mb-3 leading-tight ${
                            isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                        }`}
                    >
                        Top Performers
                    </h1>

                    <p
                        className={`text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed ${
                            isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'
                        }`}
                    >
                        Discover how developers rank across technical assessments. Scores and XP are calculated directly from completed quizzes and verified accuracy.
                    </p>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <section aria-label="Leaderboard Summary Statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                {statCards.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            className={`rounded-2xl border p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 transition-all ${
                                isDark
                                    ? 'bg-[#161B22] border-[#30363D] hover:border-[#3FB950]/40'
                                    : 'bg-white border-[#E6E0D6] shadow-xs hover:border-[#285A4D]/30'
                            }`}
                        >
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                {!stats.loaded ? (
                                    <div className="h-6 sm:h-7 w-14 rounded-md skeleton mb-1" />
                                ) : (
                                    <div
                                        className={`text-xl sm:text-2xl font-extrabold font-display tracking-tight truncate ${
                                            isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                        }`}
                                    >
                                        {stat.value}
                                    </div>
                                )}
                                <div
                                    className={`text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate ${
                                        isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'
                                    }`}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Main Leaderboard Component */}
            <LeaderboardComponent onDataLoaded={handleStatsLoad} />
        </div>
    );

    if (isDashboard) {
        return content;
    }

    return (
        <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-[#0D1117]' : 'bg-[#FAF8F5]'}`}>
            <Navbar />
            <main className="flex-grow">{content}</main>
            <Footer />
        </div>
    );
};

export default LeaderboardPage;
