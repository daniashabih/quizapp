import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Target, Trophy, Zap, Users, BookOpen, Terminal, Sparkles, Shield, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const [hasNewQuizzes, setHasNewQuizzes] = useState(false);

    useEffect(() => {
        const checkNew = async () => {
            try {
                const res = await fetch('/api/questions/status');
                const data = await res.json();
                setHasNewQuizzes(data.hasNew);
            } catch {
                // silent
            }
        };
        checkNew();
    }, []);

    const features = [
        {
            icon: Terminal,
            title: "Multi-Language Support",
            desc: "Native environments for C, C++, Java, Python, and JavaScript.",
            colSpan: "sm:col-span-2",
            iconColor: "text-[#059669]"
        },
        {
            icon: Target,
            title: "Advanced Analytics",
            desc: "Precision tracking to identify and fix your weak spots.",
            colSpan: "sm:col-span-1",
            iconColor: "text-[#059669]"
        },
        {
            icon: Trophy,
            title: "Global Leaderboards",
            desc: "Compete against thousands of developers worldwide.",
            colSpan: "sm:col-span-1",
            iconColor: "text-[#059669]"
        },
        {
            icon: Cpu,
            title: "AI-Powered Generation",
            desc: "Never run out of challenges. Our AI generates fresh, real-world scenarios on demand.",
            colSpan: "sm:col-span-2",
            iconColor: "text-[#32B895]"
        },
    ];

    const stats = [
        { value: "10K+", label: "Challenges", icon: BookOpen },
        { value: "5", label: "Languages", icon: Code2 },
        { value: "24/7", label: "AI Evaluated", icon: Sparkles },
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <section className="relative flex flex-col items-center text-center pt-12 pb-20 space-y-10 animate-fade-in z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#153C33] border border-[#1E4D42] text-[#D4EBE5] text-sm font-semibold tracking-wide shadow-xs">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32B895] opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#32B895]" />
                    </span>
                    {hasNewQuizzes ? "New Daily Challenges Available" : "System Online. Ready for Code."}
                </div>

                <div className="space-y-6 relative max-w-4xl">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-[var(--foreground)] leading-[1.08] tracking-tight">
                        Master Coding <br />
                        <span className="text-gradient">The Smart Way</span>
                    </h1>
                    <p className="text-sm sm:text-lg text-[var(--foreground-muted)] max-w-2xl mx-auto leading-relaxed font-medium">
                        The ultimate training ground for serious developers. Practice real-world scenarios, track deep analytics, and level up your stack.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    {user ? (
                        <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-sm sm:text-base">
                            Enter Dashboard <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <Link to="/quiz" className="btn-primary px-8 py-3.5 text-sm sm:text-base">
                            Start Training Protocol <ArrowRight size={18} />
                        </Link>
                    )}
                    {!user && (
                        <Link to="/register" className="btn-secondary px-8 py-3.5 text-sm sm:text-base">
                            Initialize Account
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-center flex-wrap gap-8 sm:gap-16 pt-8">
                    {stats.map(({ value, label, icon: Icon }, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#153C33] border border-[#1E4D42] flex items-center justify-center shadow-xs">
                                <Icon size={20} className="text-[#32B895]" />
                            </div>
                            <div className="text-left">
                                <div className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">{value}</div>
                                <div className="text-[10px] text-[var(--foreground-muted)] font-semibold uppercase tracking-widest">{label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pb-16 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--foreground)] mb-3">Engineered for Growth</h2>
                    <p className="text-[var(--foreground-muted)] text-xs sm:text-sm max-w-xl mx-auto">
                        Everything you need to go from writing scripts to architecting software.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 auto-rows-min">
                    {features.map(({ icon: Icon, title, desc, colSpan, iconColor }, i) => (
                        <div key={i} className={`card p-6 sm:p-8 rounded-3xl transition-all duration-500 group hover:-translate-y-1 hover:shadow-xl hover:border-[#289B7D] ${colSpan}`}>
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#153C33] border border-[#1E4D42] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-xs`}>
                                <Icon size={24} className={iconColor} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-display font-bold text-[var(--foreground)] mb-2 tracking-tight">{title}</h3>
                            <p className="text-xs sm:text-sm text-[var(--foreground-muted)] leading-relaxed font-medium">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
