import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LeaderboardComponent from '../../components/Leaderboard';
import { Trophy, Award, Flame, CheckCircle2, ChevronLeft, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import usePageSeo from '../../hooks/usePageSeo';

const LeaderboardPage = ({ mode: propMode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const isDashboard = location.pathname.startsWith('/dashboard');
    const isFullMode =
        propMode === 'full' ||
        location.pathname.endsWith('/full') ||
        location.search.includes('view=full');

    usePageSeo({
        title: isFullMode
            ? 'Complete Global Developer Leaderboard & Directory — HangBug'
            : 'Global Developer Leaderboard & Rankings — HangBug',
        description: isFullMode
            ? 'Explore the complete directory of ranked software engineers and learners worldwide on HangBug.'
            : 'See top ranked software engineers and learners worldwide. Track XP, accuracy, quiz streaks, and verified certificates on HangBug.',
        canonicalPath: isFullMode ? '/leaderboard/full' : '/leaderboard'
    });

    // Requirement 3: Full Leaderboard requires authentication.
    // If a logged-out visitor attempts to access /leaderboard/full directly,
    // redirect them to /login with the intended destination preserved.
    useEffect(() => {
        if (isFullMode && !authLoading && !isAuthenticated) {
            const currentPath = location.pathname + location.search;
            navigate(`/login?redirect=${encodeURIComponent(currentPath)}`, {
                replace: true,
                state: { from: currentPath }
            });
        }
    }, [isFullMode, authLoading, isAuthenticated, location, navigate]);

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
            totalRanked: data.totalRanked ?? activeUsers.length,
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

    // If redirected to login while loading auth in full mode, show sleek placeholder
    if (isFullMode && authLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0D1117] text-white' : 'bg-[#FAF8F5] text-slate-800'}`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[#285A4D] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (isFullMode && !isAuthenticated) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-[#0D1117] text-white' : 'bg-[#FAF8F5] text-slate-800'}`}>
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">Sign In Required</h2>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                        Redirecting you to sign in to access the complete developer leaderboard...
                    </p>
                </div>
            </div>
        );
    }

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
                    {/* Mode switcher / Pill badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="badge badge-emerald inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full shadow-xs">
                            <Trophy className="w-4 h-4 shrink-0" aria-hidden="true" />
                            <span className="font-semibold tracking-wide">
                                {isFullMode ? 'Global Directory' : 'Top 5 Highlights'}
                            </span>
                        </div>
                        {isFullMode && (
                            <button
                                type="button"
                                onClick={() => navigate(isDashboard ? '/dashboard/leaderboard' : '/leaderboard')}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Back to Top 5</span>
                            </button>
                        )}
                    </div>

                    <h1
                        className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight mb-3 leading-tight ${
                            isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                        }`}
                    >
                        {isFullMode ? 'All Ranked Performers' : 'Top 5 Performers'}
                    </h1>

                    <p
                        className={`text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed ${
                            isDark ? 'text-[#8B949E]' : 'text-[#5C6460]'
                        }`}
                    >
                        {isFullMode
                            ? 'Discover how developers rank across technical assessments worldwide. XP and points are calculated dynamically from completed quizzes and verified accuracy.'
                            : 'Featuring the top 5 developers globally. Top 3 are honored with Gold, Silver, and Bronze badges based on verified quiz points and accuracy.'}
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
                            className={`rounded-2xl border p-3.5 sm:p-5 flex items-center gap-2.5 sm:gap-4 transition-all ${
                                isDark
                                    ? 'bg-[#161B22] border-[#30363D] hover:border-[#3FB950]/40'
                                    : 'bg-white border-[#E6E0D6] shadow-xs hover:border-[#285A4D]/30'
                            }`}
                        >
                            <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                                <Icon className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                {!stats.loaded ? (
                                    <div className="h-6 sm:h-7 w-14 rounded-md skeleton mb-1" />
                                ) : (
                                    <div
                                        className={`text-lg sm:text-2xl font-extrabold font-display tracking-tight leading-tight ${
                                            isDark ? 'text-[#F0F6FC]' : 'text-[#1A1D1C]'
                                        }`}
                                    >
                                        {stat.value}
                                    </div>
                                )}
                                <div
                                    className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider leading-tight ${
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

            {/* Main Leaderboard Component with Top 5 / Full Mode toggle */}
            <LeaderboardComponent
                mode={isFullMode ? 'full' : 'top5'}
                onDataLoaded={handleStatsLoad}
            />
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
