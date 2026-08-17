import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Sparkles, Target, Shield, Trophy, Star, Clock, BookOpen } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const levels = [
    {
        id: 'beginner',
        name: 'Foundational',
        label: 'Beginner',
        desc: 'Perfect for beginners. Covers core syntax, basic concepts, and fundamental logic building.',
        icon: Target,
        gradient: 'from-black to-zinc-800',
        color: 'text-black',
        bg: 'bg-zinc-100',
        border: 'border-zinc-300',
        hoverBorder: 'hover:border-black',
        details: { questions: '10-15', timer: '60s per Q', passing: '60%' },
    },
    {
        id: 'intermediate',
        name: 'Professional',
        label: 'Intermediate',
        desc: 'For experienced developers. Tests architectural patterns, best practices, and complex problem solving.',
        icon: Shield,
        gradient: 'from-zinc-900 to-black',
        color: 'text-black',
        bg: 'bg-zinc-100',
        border: 'border-zinc-300',
        hoverBorder: 'hover:border-black',
        details: { questions: '15-20', timer: '45s per Q', passing: '70%' },
    },
    {
        id: 'expert',
        name: 'Maestro',
        label: 'Expert',
        desc: 'The ultimate challenge. Deep dives into performance optimization, edge cases, and advanced patterns.',
        icon: Trophy,
        gradient: 'from-black to-zinc-900',
        color: 'text-black',
        bg: 'bg-zinc-100',
        border: 'border-zinc-300',
        hoverBorder: 'hover:border-black',
        details: { questions: '20-25', timer: '30s per Q', passing: '80%' },
    },
];

export default function SelectLevel() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');
    const category = location.state?.category;

    if (!category) {
        navigate(isDashboard ? '/dashboard/technologies' : '/technologies');
        return null;
    }

    const mainContent = (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-up">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--foreground-muted)] hover:text-black transition-colors mb-4"
            >
                <ArrowLeft size={15} /> Back to Technologies
            </button>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="badge-emerald mx-auto mb-3">
                    <Sparkles size={12} />
                    {category} Track
                </div>
                <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-[var(--foreground)] mb-2">
                    Choose Your{' '}
                    <span className="text-black underline decoration-black/20 underline-offset-4">Difficulty</span>
                </h1>
                <p className="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-xl mx-auto">
                    Select the challenge level that matches your current expertise. You can always retry at a higher difficulty later.
                </p>
            </div>

            {/* Levels Grid */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
                {levels.map((level) => {
                    const Icon = level.icon;
                    return (
                        <button
                            key={level.id}
                            onClick={() => navigate('/quiz/start', { state: { category, language: category, difficulty: level.id } })}
                            className={`group card p-6 lg:p-7 text-left flex flex-col gap-5 ${level.hoverBorder} transition-all duration-300 active:scale-[0.98]`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <Icon size={26} className="text-white" />
                                </div>
                                <span className={`badge ${level.bg} ${level.color} ${level.border} text-[10px]`}>
                                    {level.label}
                                </span>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-display font-bold text-[var(--foreground)] mb-2 group-hover:text-black transition-colors">
                                    {level.name}
                                </h3>
                                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{level.desc}</p>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--card-border)]">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-[var(--foreground)]">{level.details.questions}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium">Questions</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-[var(--foreground)]">{level.details.timer}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium">Per Q</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-[var(--foreground)]">{level.details.passing}</p>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium">Passing</p>
                                </div>
                            </div>

                            <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${level.gradient} text-white w-full justify-center text-sm py-3 rounded-xl font-semibold group-hover:-translate-y-0.5 transition-all duration-300 shadow-lg`}>
                                Start Challenge <ArrowRight size={15} />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Pro Tip */}
            <div className="card p-6 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-black shrink-0">
                    <Star size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-[var(--foreground)] mb-1">Pro Tip</h4>
                    <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                        You can revisit any completed track to try a higher difficulty and earn advanced certifications. 
                        Each attempt is tracked and saved to your profile. Score 80%+ to unlock a verified certificate!
                    </p>
                </div>
            </div>
        </div>
    );

    if (isDashboard) {
        return <div className="space-y-6 animate-fade-up">{mainContent}</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col">
            <Navbar />
            <div className="flex-1 pt-24 pb-12 min-h-0">
                {mainContent}
            </div>
            <Footer />
        </div>
    );
}

