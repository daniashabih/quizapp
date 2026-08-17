import { useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowRight, Code2, Target, Trophy, Zap, Users, BookOpen,
    Star, Award, BarChart3, Search, Play, GraduationCap, BrainCircuit,
    Linkedin, CheckCircle2, QrCode, Sparkles, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BrandLogo from '../components/BrandLogo';

const technologies = [
    { name: 'HTML', level: 'Beginner', questions: 120, color: '#000000' },
    { name: 'CSS', level: 'Beginner', questions: 150, color: '#000000' },
    { name: 'JavaScript', level: 'Intermediate', questions: 200, color: '#000000' },
    { name: 'React', level: 'Advanced', questions: 180, color: '#000000' },
    { name: 'Node.js', level: 'Intermediate', questions: 160, color: '#000000' },
    { name: 'Python', level: 'Intermediate', questions: 190, color: '#000000' },
    { name: 'Tailwind CSS', level: 'Intermediate', questions: 100, color: '#000000' },
    { name: 'MongoDB', level: 'Intermediate', questions: 90, color: '#000000' },
];

export default function Landing() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('assessment'); // assessment, features, certificate, path

    const filteredTechs = technologies.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen w-full bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col justify-between overflow-x-hidden relative transition-colors duration-300">
            {/* Background ambient glowing gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-black/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-black/5 rounded-full blur-[140px]" />
            </div>

            {/* Fixed Navbar at Top */}
            <Navbar />

            {/* Main Center Hero Section */}
            <main className="flex-1 pt-24 sm:pt-28 lg:pt-32 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto w-full">

                    {/* Left Column: Headline, Search, CTA, Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="lg:col-span-6 flex flex-col justify-center space-y-4 lg:space-y-5"
                    >
                        {/* Live Pill Badge */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 text-black text-xs font-semibold tracking-wide border border-zinc-300 shadow-xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                AI-Powered Web Quizzes — Now Live
                            </motion.div>
                        </div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold text-[var(--foreground)] leading-[1.08] tracking-tight"
                        >
                            Master Web <br />
                            Development <span className="text-black font-extrabold underline decoration-black/20 underline-offset-4">One Quiz</span> <br />
                            at a Time
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xs sm:text-sm lg:text-base text-[var(--foreground-muted)] max-w-lg leading-relaxed font-normal"
                        >
                            The ultimate platform to test, certify, and showcase your web development skills.
                            AI-powered quizzes, verified certificates, and global leaderboards.
                        </motion.p>

                        {/* Search Input with Instant Results Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="relative max-w-md"
                        >
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                <input
                                    type="text"
                                    placeholder="Search technologies (e.g., React, Python)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--foreground)] placeholder:[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all shadow-xs"
                                />
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden z-30 animate-scale-in">
                                        {filteredTechs.length > 0 ? (
                                            filteredTechs.map((t) => (
                                                <Link
                                                    key={t.name}
                                                    to="/technologies"
                                                    className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--muted-bg)] transition-colors border-b border-[var(--card-border)] last:border-0"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-black" />
                                                        <span className="text-xs font-semibold text-[var(--foreground)]">{t.name}</span>
                                                    </div>
                                                    <span className="text-[11px] text-[var(--foreground-muted)]">{t.questions} Qs</span>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="px-4 py-4 text-center text-xs text-[var(--foreground-muted)]">No technologies found.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3 pt-1"
                        >
                            {user ? (
                                <Link to="/dashboard" className="btn-primary px-6 py-3 text-xs sm:text-sm">
                                    Go to Dashboard <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn-primary px-6 py-3 text-xs sm:text-sm">
                                        Start Learning Free <ArrowRight size={16} />
                                    </Link>
                                    <Link to="/technologies" className="btn-secondary px-5 py-3 text-xs sm:text-sm">
                                        Browse Tech
                                    </Link>
                                </>
                            )}
                        </motion.div>

                        {/* Metrics Bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.35 }}
                            className="grid grid-cols-4 gap-2 pt-3 border-t border-[var(--card-border)] max-w-lg"
                        >
                            {[
                                { value: "10,000+", label: "Learners", icon: Users },
                                { value: "1,500+", label: "Questions", icon: BookOpen },
                                { value: "18+", label: "Techs", icon: Code2 },
                                { value: "95%", label: "Pass Rate", icon: Star },
                            ].map(({ value, label, icon: Icon }, i) => (
                                <div key={i} className="text-left">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <Icon size={12} className="text-black" />
                                        <span className="text-xs font-bold text-[var(--foreground)] font-display">{value}</span>
                                    </div>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium leading-tight">{label}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Tabbed Interactive Feature Showcase Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-6 flex flex-col justify-center min-h-0"
                    >
                        {/* Interactive View Selector Tabs */}
                        <div className="flex items-center justify-between gap-1 p-1 bg-[var(--muted-bg)] border border-[var(--card-border)] rounded-2xl mb-3 shadow-2xs overflow-x-auto no-scrollbar">
                            {[
                                { id: 'assessment', label: 'Assessment', icon: Play },
                                { id: 'features', label: 'Features', icon: Sparkles },
                                { id: 'certificate', label: 'Certificates', icon: GraduationCap },
                                { id: 'path', label: 'Learning Path', icon: Target },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                            isActive
                                                ? 'bg-black text-white shadow-xs'
                                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)]'
                                        }`}
                                    >
                                        <Icon size={13} />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Interactive Tab Card Display */}
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300 min-h-[330px] flex flex-col justify-between">
                            <AnimatePresence mode="wait">
                                {activeTab === 'assessment' && (
                                    <motion.div
                                        key="assessment"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="space-y-4 my-auto"
                                    >
                                        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
                                            <div className="flex items-center gap-2.5">
                                                <BrandLogo variant="mark" size="md" />
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--foreground)]">HangBug Assessment</p>
                                                    <p className="text-[10px] text-[var(--foreground-muted)]">Interactive Web Developer Quiz</p>
                                                </div>
                                            </div>
                                            <span className="badge-emerald text-[10px] font-bold">Live Simulation</span>
                                        </div>

                                        <div className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-[var(--foreground)]">React Component Lifecycle & Hooks</span>
                                                <span className="text-[10px] font-bold text-black">Question 12/15</span>
                                            </div>
                                            <div className="progress-bar overflow-hidden h-2 bg-zinc-200 rounded-full">
                                                <motion.div
                                                    className="h-full bg-black rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '80%' }}
                                                    transition={{ duration: 1 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { label: 'Score Rate', value: '94%', color: 'text-black' },
                                                { label: 'Avg Speed', value: '18s / Q', color: 'text-black' },
                                                { label: 'Current Streak', value: '7 Days', color: 'text-black' },
                                                { label: 'Global Rank', value: '#42 Top 1%', color: 'text-black' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                                    <p className="text-[9px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">{stat.label}</p>
                                                    <p className={`text-sm font-display font-bold ${stat.color}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 border border-zinc-300">
                                            <Zap size={14} className="text-black animate-bounce shrink-0" />
                                            <p className="text-[11px] font-semibold text-black">75 XP away from reaching Master Rank!</p>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'features' && (
                                    <motion.div
                                        key="features"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="grid grid-cols-2 gap-3 my-auto"
                                    >
                                        {[
                                            { icon: BrainCircuit, title: "AI Questions", desc: "Adaptive questions tailored to your skill level.", color: "text-black" },
                                            { icon: ShieldCheck, title: "Verified Certs", desc: "Sharable certificates with unique ID & QR code.", color: "text-black" },
                                            { icon: BarChart3, title: "Deep Analytics", desc: "Detailed insights on strengths & weak spots.", color: "text-black" },
                                            { icon: Trophy, title: "Leaderboards", desc: "Compete globally with top web developers.", color: "text-black" },
                                        ].map((feat, i) => {
                                            const Icon = feat.icon;
                                            return (
                                                <div key={i} className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex flex-col justify-between">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div className={`p-1.5 rounded-lg bg-zinc-100 border border-zinc-200 shadow-2xs ${feat.color}`}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-[var(--foreground)]">{feat.title}</h4>
                                                    </div>
                                                    <p className="text-[11px] text-[var(--foreground-muted)] leading-snug">{feat.desc}</p>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}

                                {activeTab === 'certificate' && (
                                    <motion.div
                                        key="certificate"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="my-auto space-y-3"
                                    >
                                        <div className="p-4 rounded-2xl bg-black text-white shadow-md relative overflow-hidden border border-black">
                                            <div className="flex items-center justify-between mb-3">
                                                <BrandLogo variant="mark" size="sm" />
                                                <span className="text-[10px] font-semibold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full text-white">Official Certificate</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-300 uppercase tracking-widest font-semibold">Verified Developer</p>
                                            <h3 className="text-lg font-display font-bold mb-1">React & Modern Web Stack</h3>
                                            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                                                <div>
                                                    <p className="text-[9px] text-zinc-300">Issued To</p>
                                                    <p className="font-bold text-white">Verified Learner</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-zinc-300">Score</p>
                                                    <p className="font-bold text-white font-extrabold">96% (Pass)</p>
                                                </div>
                                                <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
                                                    <QrCode size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] px-1">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 size={14} className="text-black" />
                                                <span className="font-medium">LinkedIn Shareable</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Linkedin size={14} className="text-black" />
                                                <span className="font-medium">Instant Verification</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'path' && (
                                    <motion.div
                                        key="path"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                        className="my-auto space-y-2.5"
                                    >
                                        {[
                                            { step: "01", title: "Select Technology", desc: "Choose from 18+ frameworks & languages." },
                                            { step: "02", title: "Adaptive Quiz", desc: "Timed AI questions calibrated to your skill." },
                                            { step: "03", title: "Review Analytics", desc: "Get detailed feedback on missed questions." },
                                            { step: "04", title: "Earn Certificate", desc: "Unlock shareable badge on 80%+ score." },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                                                    {item.step}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--foreground)]">{item.title}</h4>
                                                    <p className="text-[11px] text-[var(--foreground-muted)]">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Compact Desktop Single-Line Footer */}
            <footer className="w-full border-t border-[var(--card-border)] py-2.5 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--foreground-muted)] relative z-10 shrink-0">
                <p className="font-medium">© {new Date().getFullYear()} HangBug. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <Link to="/technologies" className="hover:text-[var(--foreground)] transition-colors">Technologies</Link>
                    <Link to="/leaderboard" className="hover:text-[var(--foreground)] transition-colors">Leaderboard</Link>
                    <span className="text-[var(--card-border)]">•</span>
                    <span className="text-[11px]">AI-Powered Learning Platform</span>
                </div>
            </footer>
        </div>
    );
}
