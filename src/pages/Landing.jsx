import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search, ArrowRight, ShieldCheck, Trophy, Sparkles, BrainCircuit,
    Award, BarChart3, Users, QrCode, Linkedin, CheckCircle2, Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';

const technologies = [
    { name: 'HTML', questions: 120, color: '#000000' },
    { name: 'CSS', questions: 150, color: '#000000' },
    { name: 'JavaScript', questions: 200, color: '#000000' },
    { name: 'React', questions: 180, color: '#000000' },
    { name: 'Node.js', questions: 160, color: '#000000' },
    { name: 'Python', questions: 190, color: '#000000' },
    { name: 'Tailwind CSS', questions: 100, color: '#000000' },
    { name: 'MongoDB', questions: 90, color: '#000000' },
];

export default function Landing() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('assessment');
    const navigate = useNavigate();

    const filteredTechs = technologies.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen w-full bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col justify-between overflow-x-hidden relative transition-colors duration-300">
            {/* Background ambient glowing gradients */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#193D35]/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[#D19A45]/5 rounded-full blur-[140px]" />
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
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3E5C5] text-[#193D35] text-xs font-semibold tracking-wide border border-[#E2D0A6] shadow-xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-[#D19A45] animate-pulse" />
                                AI-Powered Web Quizzes — Now Live
                            </motion.div>
                        </div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[var(--foreground)] tracking-tight leading-[1.12]"
                        >
                            Test & Master Your <br className="hidden sm:inline" />
                            <span className="text-gradient">Web Development</span> Skills
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-sm sm:text-base text-[var(--foreground-muted)] max-w-xl font-normal leading-relaxed"
                        >
                            Evaluate your full-stack expertise with interactive, AI-calibrated quizzes. Earn verified certificates, track performance analytics, and compete on global leaderboards.
                        </motion.p>

                        {/* Technology Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="w-full max-w-lg space-y-2 pt-1"
                        >
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search technology (e.g. React, JavaScript, Python)…"
                                    className="input-field pl-11 pr-32 py-3 text-sm rounded-2xl border-[var(--input-border)] focus:border-[#193D35] shadow-sm"
                                />
                                <button
                                    onClick={() => navigate('/technologies')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs py-2 px-4 rounded-xl shadow-xs"
                                >
                                    Explore <ArrowRight size={13} />
                                </button>
                            </div>

                            {/* Live Search Quick Results */}
                            {searchQuery.trim() && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl space-y-1.5"
                                >
                                    <p className="text-[10px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider px-2">Matching Techs</p>
                                    {filteredTechs.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {filteredTechs.map(t => (
                                                <Link
                                                    key={t.name}
                                                    to="/register"
                                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--muted-bg)] transition-colors text-xs font-semibold text-[var(--foreground)]"
                                                >
                                                    <span>{t.name}</span>
                                                    <span className="text-[10px] text-[var(--foreground-muted)] font-normal">{t.questions} Qs</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[var(--foreground-muted)] p-2 font-medium">No technologies match "{searchQuery}"</p>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* CTA Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3 pt-2"
                        >
                            <Link to="/register" className="btn-primary text-sm py-3 px-6 rounded-2xl shadow-md group">
                                Start Free Assessment
                                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                            </Link>

                            <Link to="/technologies" className="btn-secondary text-sm py-3 px-5 rounded-2xl">
                                Browse 18+ Techs
                            </Link>
                        </motion.div>

                        {/* Quick Metrics Bar */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="pt-4 border-t border-[var(--card-border)] grid grid-cols-3 gap-4 max-w-lg"
                        >
                            <div>
                                <p className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">25,000+</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] font-semibold">Active Developers</p>
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">1,800+</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] font-semibold">Curated Questions</p>
                            </div>
                            <div>
                                <p className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)]">99.4%</p>
                                <p className="text-[11px] text-[var(--foreground-muted)] font-semibold">Satisfaction Rate</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Interactive Showcase Box */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="lg:col-span-6 flex flex-col justify-center"
                    >
                        {/* Interactive Mode Pills */}
                        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] mb-3 self-center sm:self-start overflow-x-auto max-w-full">
                            {[
                                { id: 'assessment', label: 'Live Quiz Demo', icon: Sparkles },
                                { id: 'features', label: 'Key Features', icon: BrainCircuit },
                                { id: 'certificate', label: 'Verified Certificate', icon: Award },
                                { id: 'path', label: 'How It Works', icon: Trophy }
                            ].map(tab => {
                                const Icon = tab.icon;
                                const isSelected = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#193D35] text-[#FCFAF4] shadow-xs'
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
                                                <span className="text-[10px] font-bold text-[#193D35]">Question 12/15</span>
                                            </div>
                                            <div className="progress-bar overflow-hidden h-2 bg-[#F4EFE6] rounded-full">
                                                <motion.div
                                                    className="h-full bg-[#193D35] rounded-full"
                                                    initial={{ width: '0%' }}
                                                    animate={{ width: '80%' }}
                                                    transition={{ duration: 1 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2.5">
                                            {[
                                                { label: 'Score Rate', value: '94%', color: 'text-[#193D35]' },
                                                { label: 'Avg Speed', value: '18s / Q', color: 'text-[#193D35]' },
                                                { label: 'Current Streak', value: '7 Days', color: 'text-[#D19A45]' },
                                                { label: 'Global Rank', value: '#42 Top 1%', color: 'text-[#193D35]' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                                    <p className="text-[9px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">{stat.label}</p>
                                                    <p className={`text-sm font-display font-bold ${stat.color}`}>{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F3E5C5] border border-[#E2D0A6]">
                                            <Zap size={14} className="text-[#D19A45] animate-bounce shrink-0" />
                                            <p className="text-[11px] font-semibold text-[#193D35]">75 XP away from reaching Master Rank!</p>
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
                                            { icon: BrainCircuit, title: "AI Questions", desc: "Adaptive questions tailored to your skill level.", color: "text-[#193D35]" },
                                            { icon: ShieldCheck, title: "Verified Certs", desc: "Sharable certificates with unique ID & QR code.", color: "text-[#193D35]" },
                                            { icon: BarChart3, title: "Deep Analytics", desc: "Detailed insights on strengths & weak spots.", color: "text-[#193D35]" },
                                            { icon: Trophy, title: "Leaderboards", desc: "Compete globally with top web developers.", color: "text-[#D19A45]" },
                                        ].map((feat, i) => {
                                            const Icon = feat.icon;
                                            return (
                                                <div key={i} className="p-3.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex flex-col justify-between">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <div className={`p-1.5 rounded-lg bg-[#F3E5C5] border border-[#E2D0A6] shadow-2xs ${feat.color}`}>
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
                                        <div className="p-4 rounded-2xl bg-[#193D35] text-[#FCFAF4] shadow-md relative overflow-hidden border border-[#193D35]">
                                            <div className="flex items-center justify-between mb-3">
                                                <BrandLogo variant="mark" size="sm" />
                                                <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#D19A45]/30 px-2 py-0.5 rounded-full text-white border border-[#D19A45]/40">Official Certificate</span>
                                            </div>
                                            <p className="text-[10px] text-[#F3E5C5] uppercase tracking-widest font-semibold">Verified Developer</p>
                                            <h3 className="text-lg font-display font-bold mb-1">React & Modern Web Stack</h3>
                                            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
                                                <div>
                                                    <p className="text-[9px] text-[#F3E5C5]">Issued To</p>
                                                    <p className="font-bold text-white">Verified Learner</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] text-[#F3E5C5]">Score</p>
                                                    <p className="font-bold text-white font-extrabold">96% (Pass)</p>
                                                </div>
                                                <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
                                                    <QrCode size={20} className="text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] px-1">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle2 size={14} className="text-[#67966D]" />
                                                <span className="font-medium">LinkedIn Shareable</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Linkedin size={14} className="text-[#193D35]" />
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
                                                <div className="w-7 h-7 rounded-lg bg-[#193D35] text-[#FCFAF4] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
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

            {/* Footer at Bottom */}
            <Footer />
        </div>
    );
}
