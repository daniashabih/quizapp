import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Code2, ArrowRight, Search, Sparkles, BookOpen,
    Loader2, X, Play, Hash, CheckCircle2, Layers, Check,
    ListChecks, Zap
} from 'lucide-react';
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

    // Session Modal State
    const [selectedCatForSession, setSelectedCatForSession] = useState(null);
    const [sessionsList, setSessionsList] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [chosenSession, setChosenSession] = useState(1);
    const [customSessionNo, setCustomSessionNo] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/categories');
                setCategories(res.data);
            } catch {
                toast.error("Failed to load technologies");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = async (cat) => {
        setSelectedCatForSession(cat);
        setChosenSession(1);
        setCustomSessionNo('');
        setIsCustomMode(false);
        setLoadingSessions(true);

        try {
            const res = await axios.get(`/questions/sessions?category=${encodeURIComponent(cat.name)}`);
            if (Array.isArray(res.data) && res.data.length > 0) {
                setSessionsList(res.data);
                // Set first available session as default
                setChosenSession(res.data[0].session || 1);
            } else {
                setSessionsList([{ session: 1, count: cat.questionCount || 0 }]);
                setChosenSession(1);
            }
        } catch {
            setSessionsList([{ session: 1, count: cat.questionCount || 0 }]);
            setChosenSession(1);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleStartQuiz = (overrideSession = null) => {
        if (!selectedCatForSession) return;
        
        let finalSession = overrideSession !== null ? overrideSession : chosenSession;
        
        if (isCustomMode && overrideSession === null) {
            const parsed = parseInt(customSessionNo, 10);
            if (isNaN(parsed) || parsed < 1) {
                toast.error("Please enter a valid Session Number (1 or greater)");
                return;
            }
            finalSession = parsed;
        }

        navigate('/quiz/start', {
            state: {
                category: selectedCatForSession.name,
                language: selectedCatForSession.name,
                session: finalSession
            }
        });
        setSelectedCatForSession(null);
    };

    const filtered = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const getGradient = () => techIcons.default;

    const totalQuestionsInTrack = sessionsList.reduce((sum, s) => sum + (s.count || 0), 0);

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
                <p className="text-sm text-[var(--foreground-muted)] max-w-xl mx-auto">Select a technology to choose a session and start your assessment.</p>
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
                        const hasMultipleSessions = Array.isArray(cat.sessions) && cat.sessions.length > 1;
                        return (
                            <button key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 text-left hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
                                <div>
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                        <span className="text-white font-bold text-base">{cat.name.charAt(0)}</span>
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-[var(--foreground)] mb-1 group-hover:text-black transition-colors">{cat.name}</h3>
                                    <p className="text-xs text-[var(--foreground-muted)] mb-3">Session-wise assessment covering core to advanced concepts.</p>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--card-border)]">
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                            <BookOpen size={13} /> {cat.questionCount !== undefined ? `${cat.questionCount} Questions` : 'Questions Bank'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                            <Layers size={13} /> 
                                            {hasMultipleSessions ? `Sessions: ${cat.sessions.join(', ')}` : 'Multi-Session'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 pt-2.5 text-xs font-semibold text-black group-hover:gap-2 transition-all">
                                        Select Session & Start <ArrowRight size={13} />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                 SESSION SELECTION & ADD SESSION NO MODAL
               ═══════════════════════════════════════════════════════════ */}
            {selectedCatForSession && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedCatForSession(null); }}
                >
                    <div className="card p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl space-y-5 animate-scale-in relative border border-[var(--card-border)] bg-[var(--card-bg)] max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg shadow-md">
                                    {selectedCatForSession.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#193D35] bg-[#F3E5C5] px-2.5 py-0.5 rounded-full border border-[#E2D0A6]">
                                            Session Wise Assessment
                                        </span>
                                        {totalQuestionsInTrack > 0 && (
                                            <span className="text-[10px] font-bold text-[var(--foreground-muted)]">
                                                {totalQuestionsInTrack} Total Questions
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-display font-extrabold text-[var(--foreground)] mt-1">
                                        {selectedCatForSession.name}
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCatForSession(null)}
                                className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {loadingSessions ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-2">
                                <Loader2 size={28} className="animate-spin text-[#193D35]" />
                                <p className="text-xs text-[var(--foreground-muted)] font-medium">Loading all sessions...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                                            <ListChecks size={14} className="text-[#193D35]" />
                                            <span>Available Sessions</span>
                                        </label>
                                        <span className="text-[10px] font-semibold text-[var(--foreground-muted)]">
                                            Select any session to start
                                        </span>
                                    </div>

                                    {/* Option 1: Full Track / All Sessions Card */}
                                    {sessionsList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCustomMode(false);
                                                setChosenSession('all');
                                            }}
                                            className={`w-full p-3.5 mb-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                                !isCustomMode && chosenSession === 'all'
                                                    ? 'bg-[#193D35] text-white border-[#193D35] shadow-md ring-2 ring-[#193D35]/30'
                                                    : 'bg-[var(--muted-bg)] border-[var(--card-border)] hover:border-[#193D35] text-[var(--foreground)]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                    !isCustomMode && chosenSession === 'all'
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6]'
                                                }`}>
                                                    <Zap size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-extrabold">All Sessions (Complete Track)</p>
                                                    <p className={`text-[10px] ${!isCustomMode && chosenSession === 'all' ? 'text-white/80' : 'text-[var(--foreground-muted)]'}`}>
                                                        Practice all {totalQuestionsInTrack} questions across all sessions combined
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className={`text-xs font-black font-mono px-2.5 py-1 rounded-full ${
                                                    !isCustomMode && chosenSession === 'all'
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-[var(--card-bg)] text-[#193D35] border border-[var(--card-border)]'
                                                }`}>
                                                    {totalQuestionsInTrack} Qs
                                                </span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Option 2: Individual Sessions Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                                        {sessionsList.map(s => {
                                            const isSelected = !isCustomMode && chosenSession === s.session;
                                            return (
                                                <button
                                                    key={s.session}
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomMode(false);
                                                        setChosenSession(s.session);
                                                    }}
                                                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                                                        isSelected
                                                            ? 'bg-[#193D35] text-white border-[#193D35] shadow-md ring-2 ring-[#193D35]/30'
                                                            : 'bg-[var(--muted-bg)] border-[var(--card-border)] hover:border-[#193D35] text-[var(--foreground)]'
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-[#193D35] flex items-center justify-center">
                                                            <Check size={10} strokeWidth={3} />
                                                        </div>
                                                    )}
                                                    <p className="text-xs font-black">Session {s.session}</p>
                                                    <p className={`text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-white/90' : 'text-[#193D35]'}`}>
                                                        {s.count} {s.count === 1 ? 'Question' : 'Questions'}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Option 3: Add / Enter Custom Session No Toggle & Input */}
                                    <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)]/50 border border-[var(--card-border)] space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomMode(!isCustomMode)}
                                            className="w-full flex items-center justify-between text-xs font-bold text-[var(--foreground)] cursor-pointer"
                                        >
                                            <span className="flex items-center gap-1.5">
                                                <Hash size={14} className="text-[#193D35]" />
                                                Enter Custom Session No
                                            </span>
                                            <span className="text-[10px] font-semibold text-[#193D35] underline">
                                                {isCustomMode ? 'Use listed sessions' : '+ Choose custom session number'}
                                            </span>
                                        </button>

                                        {isCustomMode && (
                                            <div className="pt-2 animate-fade-in space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="e.g. 2, 3, 5..."
                                                        value={customSessionNo}
                                                        onChange={(e) => setCustomSessionNo(e.target.value)}
                                                        className="input-field text-xs py-2 flex-1 font-mono font-bold"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const val = parseInt(customSessionNo, 10);
                                                            if (val > 0) {
                                                                setChosenSession(val);
                                                                toast.info(`Selected Session ${val}`);
                                                            }
                                                        }}
                                                        className="btn-secondary text-xs py-2 px-3 shrink-0"
                                                    >
                                                        Select
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-[var(--foreground-muted)]">
                                                    Enter any session number you want to take an assessment for.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Active Selection Live Summary */}
                                <div className="p-3 rounded-xl bg-[#F3E5C5]/50 border border-[#E2D0A6] flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[var(--foreground)]">Selected Assessment:</span>
                                    <span className="font-extrabold text-[#193D35] flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#193D35]" />
                                        {selectedCatForSession.name} · {
                                            isCustomMode
                                                ? `Session ${customSessionNo || chosenSession}`
                                                : chosenSession === 'all'
                                                    ? 'All Sessions (Full Track)'
                                                    : `Session ${chosenSession}`
                                        }
                                    </span>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCatForSession(null)}
                                        className="btn-secondary flex-1 justify-center text-xs py-2.5 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleStartQuiz()}
                                        className="btn-primary flex-1 justify-center text-xs py-2.5 shadow-md shadow-[#193D35]/20 cursor-pointer font-bold"
                                    >
                                        <Play size={14} /> Start {
                                            isCustomMode
                                                ? `Session ${customSessionNo || chosenSession}`
                                                : chosenSession === 'all'
                                                    ? 'All Sessions'
                                                    : `Session ${chosenSession}`
                                        } Quiz
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
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


