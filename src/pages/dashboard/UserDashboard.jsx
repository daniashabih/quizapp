import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    Trophy, Award, ChevronRight, BarChart3, Clock,
    Edit3, Check, X, Zap, Flame, BookOpen,
    Activity, Sparkles, ArrowRight, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';

const achievementIconMap = {
    Zap: Zap,
    Flame: Flame,
    BookOpen: BookOpen,
    Trophy: Trophy,
    Award: Award,
    Sparkles: Sparkles
};

export default function UserDashboard() {
    const { user, updateUser } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            const t = setTimeout(() => {
                setEditData({ name: user.name || '', email: user.email || '' });
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user]);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await dashboardService.getUserDashboard();
            if (res.success && res.data) {
                setDashboardData(res.data);
            } else {
                throw new Error(res.message || 'Failed to load dashboard data');
            }
        } catch (err) {
            console.error('[User Dashboard Error]:', err);
            setError('Unable to load dashboard data.');
            toast.error('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put('/auth/update-profile', editData);
            if (res.data?.user) {
                updateUser(res.data.user);
            }
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Skeleton loading state
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-2">
                <div className="h-32 bg-[var(--muted-bg)] rounded-3xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-24 bg-[var(--muted-bg)] rounded-2xl" />
                    ))}
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="h-56 bg-[var(--muted-bg)] rounded-2xl" />
                        <div className="h-36 bg-[var(--muted-bg)] rounded-2xl" />
                        <div className="h-48 bg-[var(--muted-bg)] rounded-2xl" />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-56 bg-[var(--muted-bg)] rounded-2xl" />
                        <div className="h-80 bg-[var(--muted-bg)] rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state with retry
    if (error && !dashboardData) {
        return (
            <div className="max-w-xl mx-auto text-center py-16 card p-8 rounded-3xl space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">Unable to load dashboard data</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                    We encountered an issue fetching your real-time statistics from MongoDB.
                </p>
                <button onClick={fetchDashboard} className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 mx-auto">
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    const stats = dashboardData?.stats || {
        totalQuizzes: 0,
        averageScore: 0,
        passedQuizzes: 0,
        failedQuizzes: 0,
        certificates: 0,
        xp: 0,
        level: 1,
        levelProgress: 0,
        streak: 0,
        rank: 1
    };

    const recentAttempts = dashboardData?.recentAttempts || [];
    const technologyProgress = dashboardData?.technologyProgress || [];
    const achievements = dashboardData?.achievements || [];
    const weeklyActivity = dashboardData?.weeklyActivity || [
        { day: 'Mon', attempts: 0 },
        { day: 'Tue', attempts: 0 },
        { day: 'Wed', attempts: 0 },
        { day: 'Thu', attempts: 0 },
        { day: 'Fri', attempts: 0 },
        { day: 'Sat', attempts: 0 },
        { day: 'Sun', attempts: 0 }
    ];

    const maxWeeklyAttempts = Math.max(...weeklyActivity.map(a => a.attempts), 1);
    const xpProgressPercent = (stats.levelProgress / 3) * 100;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
            {/* Welcome Banner */}
            <div className="card p-6 lg:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-r from-[var(--muted-bg)] to-[var(--card-bg)] border border-[var(--card-border)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#193D35]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#193D35] flex items-center justify-center text-[#FCFAF4] font-display font-extrabold text-2xl shadow-xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-[var(--foreground)]">
                                    Welcome back, {user?.name || 'Developer'}!
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6]">
                                    <Sparkles size={12} className="text-[#D19A45]" /> Level {stats.level}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mt-1">
                                Ready to test your knowledge today? Choose a technology track to begin.
                            </p>
                        </div>
                    </div>
                    <Link to="/technologies" className="btn-primary shrink-0 py-3 text-xs sm:text-sm">
                        Browse Quizzes <ArrowRight size={15} />
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStat icon={Trophy} label="Total Quizzes" value={stats.totalQuizzes} gradient="from-[#193D35] to-[#42665B]" />
                <DashboardStat icon={BarChart3} label="Average Score" value={`${stats.averageScore}%`} gradient="from-[#42665B] to-[#193D35]" />
                <DashboardStat icon={Award} label="Certificates" value={stats.certificates} gradient="from-[#193D35] to-[#D19A45]" />
                <DashboardStat icon={Flame} label="Current Streak" value={`${stats.streak}d`} gradient="from-[#D19A45] to-[#42665B]" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Profile</h3>
                            <button onClick={() => setIsEditing(!isEditing)}
                                className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[#193D35] hover:bg-[var(--muted-bg)] transition-all">
                                {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                            </button>
                        </div>

                        {!isEditing ? (
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-[#193D35] flex items-center justify-center text-[#FCFAF4] font-display font-extrabold text-3xl mx-auto mb-4 shadow-xl">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <h2 className="text-lg font-bold text-[var(--foreground)]">{user?.name}</h2>
                                <p className="text-sm text-[var(--foreground-muted)] mb-3">{user?.email}</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="badge-emerald text-[10px] capitalize">{user?.role || 'user'} Account</span>
                                    <span className="badge text-[10px] bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] font-bold">
                                        Rank #{stats.rank}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Name</label>
                                    <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="input-field mt-1" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Email</label>
                                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="input-field mt-1" required />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button type="button" onClick={() => setIsEditing(false)}
                                        className="btn-secondary flex-1 justify-center py-2 text-sm">Cancel</button>
                                    <button type="submit" disabled={isSaving}
                                        className="btn-primary flex-1 justify-center py-2 text-sm">
                                        {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Save</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* XP Progress Card */}
                    <div className="card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-[#193D35]" />
                                <h3 className="text-sm font-bold text-[var(--foreground)]">XP Progress</h3>
                            </div>
                            <span className="text-xs font-bold text-[#193D35] bg-[#F3E5C5] px-2 py-0.5 rounded-full border border-[#E2D0A6]">
                                {stats.xp.toLocaleString()} XP
                            </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--foreground-muted)] font-medium">Level {stats.level}</span>
                            <span className="text-xs text-[var(--foreground-muted)] font-medium">Level {stats.level + 1}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill" style={{ width: `${xpProgressPercent}%` }} />
                        </div>
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-1.5">{stats.levelProgress}/3 quizzes to next level</p>
                    </div>

                    {/* Dynamic Achievements */}
                    <div className="card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Achievements</h3>
                            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
                                {achievements.filter(a => a.earned).length}/{achievements.length} Unlocked
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((b) => {
                                const IconComponent = achievementIconMap[b.icon] || Trophy;
                                return (
                                    <div
                                        key={b.id}
                                        title={b.description}
                                        className={`p-3 rounded-xl text-center border transition-all ${
                                            b.earned
                                                ? 'border-[#193D35] bg-[#F3E5C5] text-[#193D35]'
                                                : 'border-[var(--card-border)] opacity-40 bg-[var(--muted-bg)]'
                                        }`}
                                    >
                                        <IconComponent
                                            size={20}
                                            className={`${b.earned ? 'text-[#193D35]' : 'text-[var(--foreground-muted)]'} mx-auto mb-1`}
                                        />
                                        <p className="text-[10px] font-bold text-[var(--foreground)] line-clamp-1">{b.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <Link to="/dashboard/profile" className="text-xs font-medium text-[#193D35] hover:underline mt-4 inline-flex items-center gap-1">
                            View profile & timeline <ChevronRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Real Weekly Activity Bar Chart */}
                    <div className="card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-[#193D35]" />
                                <h3 className="text-sm font-bold text-[var(--foreground)]">Weekly Activity</h3>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--foreground-muted)]">Current Week</span>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-32">
                            {weeklyActivity.map((dayData) => {
                                const height = maxWeeklyAttempts > 0
                                    ? Math.round((dayData.attempts / maxWeeklyAttempts) * 100)
                                    : 0;
                                return (
                                    <div key={dayData.day} className="flex-1 flex flex-col items-center gap-2">
                                        <span className="text-[10px] text-[var(--foreground-muted)] font-medium">
                                            {dayData.attempts}
                                        </span>
                                        <div className="w-full rounded-lg relative bg-[var(--muted-bg)]" style={{ height: '100px' }}>
                                            <div
                                                className="absolute bottom-0 w-full rounded-lg bg-[#193D35] transition-all duration-500 hover:bg-[#42665B]"
                                                style={{ height: `${height}%`, minHeight: dayData.attempts > 0 ? '8px' : '0' }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-[var(--foreground-muted)] font-medium">{dayData.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Technology Progress Breakdown */}
                    {technologyProgress.length > 0 && (
                        <div className="card p-6 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Layers size={16} className="text-[#193D35]" />
                                    <h3 className="text-sm font-bold text-[var(--foreground)]">Technology Progress</h3>
                                </div>
                                <span className="text-[10px] font-medium text-[var(--foreground-muted)]">
                                    {technologyProgress.length} Tracks Attempted
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {technologyProgress.map(tp => (
                                    <div key={tp.category} className="p-3.5 rounded-xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-[var(--foreground)]">{tp.category}</span>
                                            <span className="text-xs font-extrabold text-[#193D35]">{tp.bestScore}% Best</span>
                                        </div>
                                        <div className="progress-bar h-1.5">
                                            <div className="progress-bar-fill" style={{ width: `${tp.bestScore}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-[var(--foreground-muted)]">
                                            <span>{tp.attempts} {tp.attempts === 1 ? 'attempt' : 'attempts'}</span>
                                            <span>{tp.passRate}% pass rate</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Quizzes List */}
                    <div className="card overflow-hidden rounded-2xl">
                        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-[#193D35]" />
                                <h3 className="text-sm font-bold text-[var(--foreground)]">Recent Quizzes</h3>
                            </div>
                            <Link to="/technologies" className="text-xs font-medium text-[#193D35] hover:underline flex items-center gap-1">
                                Take Quiz <ChevronRight size={12} />
                            </Link>
                        </div>

                        <div className="divide-y divide-[var(--card-border)]">
                            {recentAttempts.length > 0 ? (
                                recentAttempts.slice(0, 5).map((res) => (
                                    <div key={res.id} className="p-5 flex items-center justify-between hover:bg-[var(--muted-bg)] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl border border-[#E8E5DD] bg-[#F4EFE6] flex items-center justify-center text-lg">
                                                {res.percentage >= 80 ? '🏆' : res.percentage >= 70 ? '✅' : '📚'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[var(--foreground)]">{res.category}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-[var(--foreground-muted)]">
                                                        {new Date(res.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-display font-bold text-[#193D35]">{res.percentage}%</p>
                                                <p className="text-[10px] text-[var(--foreground-muted)] font-medium">{res.score}/{res.total}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-3">
                                        <Trophy size={24} className="text-[var(--foreground-muted)] opacity-40" />
                                    </div>
                                    <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">No quiz attempts yet</h3>
                                    <p className="text-xs text-[var(--foreground-muted)] mb-4">Start your first quiz challenge to track real-time progress.</p>
                                    <Link to="/technologies" className="btn-primary text-sm px-6 py-2.5">
                                        Take a Quiz
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DashboardStat({ icon: Icon, label, value, gradient }) {
    return (
        <div className="card p-5 rounded-2xl flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-2xl font-display font-extrabold text-[var(--foreground)]">{value}</p>
                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
