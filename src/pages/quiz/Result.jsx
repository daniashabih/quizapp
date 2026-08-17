import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, RotateCcw, Download, CheckCircle2, XCircle, Clock, BarChart3, Sparkles, Linkedin } from "lucide-react";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function Result() {
    const location = useLocation();
    const { score = 0, total = 0, percentage = 0, category = 'Web Development', difficulty = 'beginner', timeTaken = 0 } = location.state || {};
    const [animateScore, setAnimateScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(percentage >= 70);

    const passed = percentage >= 70;
    const minutes = Math.floor(timeTaken / 60);
    const secs = timeTaken % 60;
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (animateScore / 100) * circumference;

    const [confettiParticles, setConfettiParticles] = useState([]);

    useEffect(() => {
        const t = setTimeout(() => {
            setConfettiParticles(Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                color: ['#000000', '#27272A', '#52525B', '#71717A', '#A1A1AA'][i % 5],
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 2,
                rotation: Math.random() * 360,
                width: 4 + Math.random() * 6,
                height: 4 + Math.random() * 6,
            })));
        }, 0);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const interval = setInterval(() => {
                setAnimateScore(prev => {
                    if (prev >= percentage) { clearInterval(interval); return percentage; }
                    return prev + 1;
                });
            }, 20);
            return () => clearInterval(interval);
        }, 500);
        return () => clearTimeout(timer);
    }, [percentage]);

    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti]);

    const grade = passed
        ? { label: percentage >= 90 ? "Exceptional" : "Commendable", color: "#000000", gradient: "from-black to-zinc-800" }
        : { label: "Keep Practicing", color: "#52525B", gradient: "from-zinc-800 to-black" };

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col">
            {showConfetti && passed && (
                <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                    {confettiParticles.map(p => (
                        <div key={p.id} className="absolute rounded-sm"
                            style={{
                                left: p.left, top: '-2%',
                                backgroundColor: p.color,
                                animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
                                transform: `rotate(${p.rotation}deg)`,
                                width: `${p.width}px`, height: `${p.height}px`,
                            }} />
                    ))}
                </div>
            )}
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 pt-20 pb-12 min-h-0">
                <div className="w-full max-w-xl animate-fade-up my-auto">
                    <div className="card overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="p-6 lg:p-8 text-center bg-gradient-to-b from-[var(--muted-bg)] to-[var(--card-bg)]">
                            <div className="relative inline-flex mb-3">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#174A43] flex items-center justify-center text-3xl sm:text-4xl shadow-xl text-white">
                                    {passed ? '🏆' : '📚'}
                                </div>
                                {passed && <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#D6A85F] flex items-center justify-center shadow-md"><Sparkles size={12} className="text-white" /></div>}
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-[var(--foreground)] mb-1">{passed ? 'Congratulations!' : 'Keep Going!'}</h1>
                            <p className="text-[var(--foreground-muted)] text-xs mb-4">{passed ? 'You passed!' : 'Review and try again.'}</p>

                            {/* Circular Score */}
                            <div className="circular-progress w-28 h-28 mx-auto mb-3">
                                <svg width="112" height="112" viewBox="0 0 144 144">
                                    <circle cx="72" cy="72" r="60" fill="none" stroke="var(--card-border)" strokeWidth="8" />
                                    <circle cx="72" cy="72" r="60" fill="none" stroke="#174A43" strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90, 72, 72)"
                                        style={{ transition: 'stroke-dashoffset 2s ease-out' }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#174A43]">{animateScore}%</span>
                                    <span className="text-[9px] text-[var(--foreground-muted)] font-semibold uppercase">Score</span>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E8EFEA] text-[#174A43] border border-[#357268]/30">
                                Grade: {grade.label}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {[
                                    { label: 'Correct', value: score, icon: CheckCircle2, color: 'text-black', bg: 'bg-zinc-100' },
                                    { label: 'Wrong', value: total - score, icon: XCircle, color: 'text-zinc-600', bg: 'bg-zinc-100' },
                                    { label: 'Total', value: total, icon: BarChart3, color: 'text-black', bg: 'bg-zinc-100' },
                                    { label: 'Time', value: `${minutes}:${secs < 10 ? `0${secs}` : secs}`, icon: Clock, color: 'text-black', bg: 'bg-zinc-100' },
                                ].map(s => (
                                    <div key={s.label} className={`p-2.5 sm:p-3 rounded-xl ${s.bg} border border-zinc-200 text-center group hover:shadow-xs transition-all`}>
                                        <s.icon size={15} className={`${s.color} mx-auto mb-1 group-hover:scale-110 transition-transform`} />
                                        <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-[9px] text-[var(--foreground-muted)] font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                    <p className="text-[9px] font-semibold text-[var(--foreground-muted)] uppercase mb-0.5">Technology</p>
                                    <p className="text-xs font-bold text-[var(--foreground)]">{category}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                    <p className="text-[9px] font-semibold text-[var(--foreground-muted)] uppercase mb-0.5">Difficulty</p>
                                    <p className="text-xs font-bold text-[var(--foreground)] capitalize">{difficulty}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => window.history.back()} className="btn-primary justify-center py-2.5 text-xs sm:text-sm">
                                        <RotateCcw size={14} /> Retry
                                    </button>
                                    <Link to="/technologies" className="btn-secondary justify-center py-2.5 text-xs sm:text-sm">
                                        <Home size={14} /> New Track
                                    </Link>
                                </div>
                                {passed && (
                                    <div className="flex items-center justify-center gap-3 pt-1">
                                        <Link to="/certificate/view" state={{ category, percentage, score, total, difficulty }}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-black hover:underline transition-colors">
                                            <Download size={13} /> View Certificate
                                        </Link>
                                        <button className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                                            <Linkedin size={13} /> Share
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
