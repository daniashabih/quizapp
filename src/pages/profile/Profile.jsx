import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Mail, Calendar, Award, Trophy, Edit3, Check, X,
    Github, Linkedin, Globe, MapPin, ChevronRight, Layers, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: user?.name || '', email: user?.email || '' });
    const [isSaving, setIsSaving] = useState(false);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setEditData({ name: user.name || '', email: user.email || '' });
        }
    }, [user]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await dashboardService.getUserDashboard();
                if (res.success && res.data) {
                    setDashboardData(res.data);
                }
            } catch (err) {
                console.error('[Profile Fetch Error]:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await axios.put('/auth/update-profile', editData);
            if (res.data?.user) {
                updateUser(res.data.user);
            }
            toast.success("Profile updated");
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update");
        } finally {
            setIsSaving(false);
        }
    };

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : 'Active Member';

    const recentAttempts = dashboardData?.recentAttempts || [];
    const technologyProgress = dashboardData?.technologyProgress || [];

    // Construct real dynamic activity timeline from MongoDB
    const timeline = [];
    recentAttempts.forEach(r => {
        if (r.percentage >= 80) {
            timeline.push({
                action: `Earned ${r.category} Certificate`,
                score: `${r.percentage}%`,
                date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                icon: '🏆'
            });
        }
        timeline.push({
            action: `Completed ${r.category} Quiz`,
            score: `${r.percentage}%`,
            date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            icon: r.percentage >= 70 ? '✅' : '📚'
        });
    });

    if (user?.createdAt) {
        timeline.push({
            action: 'Joined HangBug Platform',
            score: '',
            date: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            icon: '🚀'
        });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--foreground)]">Profile</h1>
                <p className="text-sm text-[var(--foreground-muted)]">Manage your personal information and view your activity.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="card p-6 rounded-2xl text-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-black flex items-center justify-center text-white font-display font-extrabold text-4xl shadow-xl">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border-2 border-[var(--card-bg)]" />
                        </div>
                        {!isEditing ? (
                            <>
                                <h2 className="text-xl font-bold text-[var(--foreground)]">{user?.name}</h2>
                                <p className="text-sm text-[var(--foreground-muted)]">{user?.email}</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <span className="badge-emerald text-[10px] capitalize">{user?.role || 'user'}</span>
                                    {dashboardData?.stats?.rank && (
                                        <span className="badge text-[10px] bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] font-bold">
                                            Rank #{dashboardData.stats.rank}
                                        </span>
                                    )}
                                </div>
                                <button onClick={() => setIsEditing(true)}
                                    className="btn-secondary w-full justify-center text-sm mt-5">
                                    <Edit3 size={14} /> Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleSave} className="text-left space-y-3 mt-2">
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

                    {/* Quick Info */}
                    <div className="card p-6 rounded-2xl space-y-4">
                        <InfoRow icon={Mail} label="Email" value={user?.email} />
                        <InfoRow icon={Calendar} label="Joined" value={joinedDate} />
                        <InfoRow icon={MapPin} label="Location" value="Earth" />
                        <InfoRow icon={Globe} label="Website" value="https://hangbug.dev" isLink />
                    </div>

                    {/* Social */}
                    <div className="card p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-[var(--foreground)] mb-4">Social Links</h3>
                        <div className="space-y-3">
                            <SocialLink icon={Github} label="GitHub" href="https://github.com" />
                            <SocialLink icon={Linkedin} label="LinkedIn" href="https://linkedin.com" />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Skills & Expertise (Calculated from Real MongoDB Quiz Performance) */}
                    <div className="card p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Layers size={18} className="text-[#193D35]" />
                                <h3 className="text-sm font-bold text-[var(--foreground)]">Skills & Expertise</h3>
                            </div>
                            <span className="text-xs text-[var(--foreground-muted)] font-medium">
                                Derived from test results
                            </span>
                        </div>

                        {technologyProgress.length > 0 ? (
                            <div className="space-y-5">
                                {technologyProgress.map((skill) => (
                                    <div key={skill.category}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-semibold text-[var(--foreground)]">{skill.category}</span>
                                            <span className="text-xs font-bold text-[var(--foreground-muted)]">{skill.bestScore}% Mastery</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="h-full rounded-full bg-black transition-all duration-1000"
                                                style={{ width: `${skill.bestScore}%` }} />
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] text-[var(--foreground-muted)] mt-1">
                                            <span>{skill.attempts} attempts</span>
                                            <span>{skill.passRate}% pass rate</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Sparkles size={24} className="text-[var(--foreground-muted)] mx-auto mb-2 opacity-40" />
                                <p className="text-xs text-[var(--foreground-muted)] mb-3">No skills evaluated yet.</p>
                                <Link to="/technologies" className="btn-primary text-xs py-2 px-4">
                                    Take a Quiz Assessment
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Activity Timeline (Calculated from Real MongoDB Attempt History) */}
                    <div className="card overflow-hidden rounded-2xl">
                        <div className="p-6 border-b border-[var(--card-border)] flex items-center justify-between">
                            <h3 className="text-sm font-bold text-[var(--foreground)]">Activity Timeline</h3>
                        </div>
                        <div className="divide-y divide-[var(--card-border)]">
                            {timeline.length > 0 ? (
                                timeline.map((item, i) => (
                                    <div key={i} className="p-5 flex items-center gap-4 hover:bg-[var(--muted-bg)] transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center text-lg">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[var(--foreground)]">{item.action}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-[var(--foreground-muted)]">{item.date}</span>
                                                {item.score && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-[var(--card-border)]" />
                                                        <span className={`text-xs font-medium ${item.score.includes('%') ? 'text-black font-bold' : 'text-[var(--foreground-muted)]'}`}>{item.score}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                                    No activity recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, isLink }) {
    return (
        <div className="flex items-center gap-3">
            <Icon size={15} className="text-[var(--foreground-muted)] shrink-0" />
            <div>
                <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">{label}</p>
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-black hover:underline">{value}</a>
                ) : (
                    <p className="text-sm font-medium text-[var(--foreground)]">{value}</p>
                )}
            </div>
        </div>
    );
}

function SocialLink({ icon: Icon, label, href }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] hover:border-black hover:text-black transition-all text-sm font-medium text-[var(--foreground)] group">
            <Icon size={16} className="group-hover:scale-110 transition-transform" />
            {label}
            <ChevronRight size={14} className="ml-auto text-[var(--foreground-muted)]" />
        </a>
    );
}
