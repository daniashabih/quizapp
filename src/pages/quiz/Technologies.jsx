import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Code2, ArrowRight, Search, Sparkles, Clock, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const techIcons = { default: 'from-black to-zinc-800' };

export default function Technologies() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try { const res = await axios.get('/categories'); setCategories(res.data); }
            catch { toast.error("Failed to load technologies"); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const getGradient = () => techIcons.default;

    if (loading) return (
        <div className={`min-h-screen bg-[var(--page-bg)] flex flex-col ${isDashboard ? 'p-6' : ''}`}>
            {!isDashboard && <Navbar />}
            <div className="flex-1 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-black mx-auto mb-4" />
                <p className="text-sm font-medium text-[var(--foreground-muted)] animate-pulse text-center">Loading technologies...</p>
            </div>
            {!isDashboard && <Footer />}
        </div>
    );

    const mainContent = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <div className="badge-emerald mx-auto mb-3"><Sparkles size={12} /> Technologies</div>
                <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-[var(--foreground)] mb-2">Choose Your <span className="text-black underline decoration-black/20 underline-offset-4">Stack</span></h1>
                <p className="text-sm text-[var(--foreground-muted)] max-w-xl mx-auto">Select a technology to test your knowledge across multiple difficulty levels.</p>
            </div>

            <div className="relative max-w-md mx-auto mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input type="text" placeholder="Search technologies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all" />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Code2 size={36} className="text-[var(--foreground-muted)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--foreground-muted)]">No technologies found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map((cat) => {
                        const gradient = getGradient();
                        return (
                            <button key={cat.id}
                                onClick={() => navigate(isDashboard ? '/dashboard/technologies/level' : '/technologies/level', { state: { category: cat.name } })}
                                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 text-left hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                    <span className="text-white font-bold text-base">{cat.name.charAt(0)}</span>
                                </div>
                                <h3 className="text-lg font-display font-bold text-[var(--foreground)] mb-1 group-hover:text-black transition-colors">{cat.name}</h3>
                                <p className="text-xs text-[var(--foreground-muted)] mb-3">Comprehensive assessment covering core concepts.</p>
                                <div className="flex items-center gap-4 pt-2.5 border-t border-[var(--card-border)]">
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]"><BookOpen size={13} /> 100 Questions</div>
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]"><Clock size={13} /> 50 min</div>
                                </div>
                                <div className="flex items-center gap-1 pt-2.5 text-xs font-semibold text-black group-hover:gap-2 transition-all">
                                    Start Quiz <ArrowRight size={13} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
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

