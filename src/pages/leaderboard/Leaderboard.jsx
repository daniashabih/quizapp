import { Trophy, Medal, Star, Flame, Zap, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LeaderboardComponent from '../../components/Leaderboard';

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-[var(--page-bg)] flex flex-col transition-colors duration-300">
            <Navbar />

            <div className="flex-1 pt-24 lg:pt-28 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
                    {/* Hero Header */}
                    <div className="text-center mb-10">
                        <div className="badge-emerald mx-auto mb-4">
                            <Trophy size={14} className="text-[#289B7D]" />
                            Global Rankings
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-[var(--foreground)] mb-3">
                            Top <span className="text-gradient">Performers</span>
                        </h1>
                        <p className="text-[var(--foreground-muted)] max-w-xl mx-auto text-sm sm:text-base">
                            Earn XP, complete tech quizzes, build daily streaks, and climb to the top of the global developer leaderboard.
                        </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Total Ranked</p>
                                <p className="text-lg font-extrabold text-[var(--foreground)]">2,840+</p>
                            </div>
                        </div>

                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Verified Certs</p>
                                <p className="text-lg font-extrabold text-[var(--foreground)]">1,120</p>
                            </div>
                        </div>

                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                <Flame size={20} className="fill-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Max Streak</p>
                                <p className="text-lg font-extrabold text-[var(--foreground)]">45 Days</p>
                            </div>
                        </div>

                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                                <Zap size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-[var(--foreground-muted)]">Total Quizzes</p>
                                <p className="text-lg font-extrabold text-[var(--foreground)]">18,500+</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Leaderboard Component */}
                    <LeaderboardComponent />
                </div>
            </div>

            <Footer />
        </div>
    );
}
