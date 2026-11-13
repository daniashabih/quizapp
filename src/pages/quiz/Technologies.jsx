import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Code2, ArrowRight, Search, Sparkles, BookOpen,
    Loader2, X, Play, Hash, CheckCircle2, Layers, Check,
    ListChecks, Zap, AlertCircle, RefreshCw, Clock, Trash2, BookmarkCheck, PlayCircle
} from 'lucide-react';
import { toast } from '../../services/notificationService';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';
import { useAuth } from '../../context/AuthContext';
import attemptService from '../../services/attemptService';
import TechLogo from '../../components/TechLogo';

function formatTimeAgo(date) {
    if (!date) return 'Recently';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
}

export default function Technologies() {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/dashboard');

    usePageSeo({
        title: 'Choose Your Tech Stack — Programming & Framework Quizzes | Hangbug',
        description: 'Practice interactive technology MCQ quizzes on Hangbug across HTML, CSS, JavaScript, Bootstrap, jQuery, PHP, Laravel, MySQL, Flutter, Dart, C#, React, Node.js, SQL Server, and Python.',
        canonicalPath: '/technologies',
        noindex: isDashboard
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { user } = useAuth();
    const [savedAttempts, setSavedAttempts] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    // Session Modal State
    const [selectedCatForSession, setSelectedCatForSession] = useState(null);
    const [sessionsList, setSessionsList] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [chosenSession, setChosenSession] = useState(1);
    const [customSessionNo, setCustomSessionNo] = useState('');
    const [isCustomMode, setIsCustomMode] = useState(false);

    const fetchSavedAttempts = useCallback(async () => {
        if (!user) {
            setSavedAttempts([]);
            return;
        }
        setLoadingSaved(true);
        try {
            const res = await attemptService.getInProgressAttempts();
            if (res && res.success && Array.isArray(res.data)) {
                setSavedAttempts(res.data);
            } else if (Array.isArray(res)) {
                setSavedAttempts(res);
            }
        } catch (err) {
            console.debug('No in-progress attempts found or guest mode:', err);
        } finally {
            setLoadingSaved(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSavedAttempts();
    }, [fetchSavedAttempts]);

    const handleResumeQuiz = (quiz) => {
        navigate('/quiz/start', {
            state: {
                attemptId: quiz.id,
                category: quiz.category || quiz.technology,
                session: quiz.session,
                resumeDirect: true
            }
        });
    };

    const handleDiscardSavedAttempt = async (quiz) => {
        const title = quiz.quizTitle || `${quiz.category || quiz.technology} (Session ${quiz.session})`;
        if (!window.confirm(`Discard saved progress for ${title}? This will delete this specific saved attempt.`)) {
            return;
        }
        try {
            await attemptService.discardAttempt(quiz.id);
            setSavedAttempts(prev => prev.filter(q => q.id !== quiz.id));
            toast.success('Saved quiz attempt discarded.');
        } catch (err) {
            console.error('Failed to discard attempt:', err);
            toast.error('Failed to discard saved attempt.');
        }
    };

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/categories');
            const list = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.categories)
                    ? res.data.categories
                    : [];
            setCategories(list);
        } catch (err) {
            console.error('[Technologies Fetch Error]:', err);
            setError(err.response?.data?.message || 'Unable to load technology tracks. Please check your connection and try again.');
            toast.error("Failed to load technologies");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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

    const safeCategories = Array.isArray(categories) ? categories : [];
    const filtered = safeCategories
        .filter(c => c && c.isEnabled !== false && Number(c.questionCount || 0) > 0)
        .filter(c => {
            const q = searchQuery.toLowerCase().trim();
            if (!q) return true;
            const name = (c.name || '').toLowerCase();
            const slug = (c.slug || '').toLowerCase();
            const isCSharpQuery = q === 'c#' || q === 'csharp' || q === 'c sharp';
            if (isCSharpQuery && (name === 'c#' || slug === 'csharp')) return true;
            return name.includes(q) || slug.includes(q);
        });

    const totalQuestionsInTrack = sessionsList.reduce((sum, s) => sum + (s.count || 0), 0);

    const mainContent = (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <div className="badge-emerald mx-auto mb-3"><Sparkles size={12} /> Technologies</div>
                <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-[var(--foreground)] mb-2">Choose Your <span className="text-black underline decoration-black/20 underline-offset-4">Stack</span></h1>
                <p className="text-sm text-[var(--foreground-muted)] max-w-2xl mx-auto">
                    Practice interactive technology MCQ quizzes on Hangbug across HTML, CSS, JavaScript, Bootstrap, jQuery, PHP, Laravel, MySQL, Flutter, Dart, C#, React, Node.js, SQL Server, and Python. Select a technology below to choose a session and start your quiz.
                </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 SAVED / IN-PROGRESS QUIZZES CARD SECTION
               ═══════════════════════════════════════════════════════════ */}
            {savedAttempts.length > 0 && (
                <div className="mb-8 card p-5 sm:p-6 rounded-3xl border-2 border-[#193D35]/25 bg-gradient-to-br from-[#193D35]/5 via-[var(--card-bg)] to-[#F3E5C5]/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--card-border)] pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#193D35] text-white flex items-center justify-center shadow-md shrink-0">
                                <BookmarkCheck size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-display font-extrabold text-[var(--foreground)]">
                                        Saved In-Progress Quizzes
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#193D35] text-white shadow-2xs">
                                        {savedAttempts.length} Saved
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    Continue your quiz exactly where you stopped with your score and previous answers preserved.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                        {savedAttempts.map(quiz => {
                            const completedCount = quiz.answeredCount || 0;
                            const totalQ = quiz.totalQuestions || 0;
                            const pct = quiz.progressPercentage !== undefined ? quiz.progressPercentage : (totalQ > 0 ? Math.round((completedCount / totalQ) * 100) : 0);
                            const lastSaved = quiz.lastSavedAt || quiz.updatedAt;

                            return (
                                <div
                                    key={quiz.id}
                                    className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35]/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-base font-display font-bold text-[var(--foreground)] group-hover:text-[#193D35] transition-colors line-clamp-1">
                                                    {quiz.category || quiz.technology}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6]">
                                                        {quiz.session === 0 ? 'All Sessions' : `Session ${quiz.session}`}
                                                    </span>
                                                    <span className="text-[11px] text-[var(--foreground-muted)] flex items-center gap-1 font-medium">
                                                        <Clock size={11} /> {formatTimeAgo(lastSaved)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar & Counter */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-[var(--foreground-muted)]">
                                                    <strong className="text-[var(--foreground)]">{completedCount}</strong> / {totalQ} questions completed
                                                </span>
                                                <span className="text-[#193D35] font-black">{pct}%</span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-[var(--muted-bg)] overflow-hidden border border-[var(--card-border)]/50">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#193D35] to-[#42665B] rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
                                        <button
                                            onClick={() => handleResumeQuiz(quiz)}
                                            className="btn-primary flex-1 justify-center py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                                        >
                                            <Play size={13} className="fill-white" /> Resume Quiz
                                        </button>
                                        <button
                                            onClick={() => handleDiscardSavedAttempt(quiz)}
                                            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-red-600 hover:bg-red-500/10 border border-transparent hover:border-red-200 transition-all cursor-pointer shrink-0"
                                            title="Discard saved attempt"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="relative max-w-md mx-auto mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <input type="text" placeholder="Search technologies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all" />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-[#193D35] dark:text-emerald-400 mx-auto mb-4" />
                    <p className="text-sm font-medium text-[var(--foreground-muted)] animate-pulse text-center">Loading technologies...</p>
                </div>
            ) : error && safeCategories.length === 0 ? (
                <div className="max-w-md mx-auto text-center py-14 card p-8 rounded-3xl space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-lg font-display font-bold text-[var(--foreground)]">Unable to load technologies</h2>
                    <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{error}</p>
                    <button
                        type="button"
                        onClick={fetchCategories}
                        className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-6 mx-auto cursor-pointer"
                    >
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <Code2 size={36} className="text-[var(--foreground-muted)] mx-auto mb-4" />
                    <p className="text-sm text-[var(--foreground-muted)]">No technologies found.</p>
                </div>
            ) : (
                <section aria-label="Technology Quiz Tracks">
                    <h2 className="sr-only">Available Technology Quiz Tracks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((cat) => {
                            const hasMultipleSessions = Array.isArray(cat.sessions) && cat.sessions.length > 1;
                            return (
                                <button key={cat.id || cat.name}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="group bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 text-left hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between">
                                    <div>
                                        <div className="mb-3">
                                            <TechLogo
                                                name={cat.name}
                                                className="group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-lg font-display font-bold text-[var(--foreground)] mb-1 group-hover:text-black transition-colors">{cat.name}</h3>
                                        <p className="text-xs text-[var(--foreground-muted)] mb-3">Session-wise practice covering core to advanced concepts.</p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center justify-between pt-2.5 border-t border-[var(--card-border)]">
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                                <BookOpen size={13} /> {cat.questionCount !== undefined ? `${cat.questionCount} Questions` : 'Questions Bank'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                                <Layers size={13} /> 
                                                {hasMultipleSessions ? (cat.sessions.length > 5 ? `${cat.sessions.length} Sessions` : `Sessions: ${cat.sessions.join(', ')}`) : 'Multi-Session'}
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
                </section>
            )}

            {/* Semantic Crawlable Technology Guides Section for Search Engine Spiders */}
            <section aria-label="Technology Learning & Assessment Tracks" className="mt-12 pt-8 border-t border-[var(--card-border)]">
                <div className="text-center max-w-2xl mx-auto mb-6">
                    <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[var(--foreground)] mb-2">
                        Explore Technology Guides &amp; Assessment Tracks
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)]">
                        Deep dive into topic-specific questions, coding challenges, and key learning objectives across our supported programming stacks.
                    </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
                    {[
                        { name: 'HTML', slug: 'html' },
                        { name: 'CSS', slug: 'css' },
                        { name: 'JavaScript', slug: 'javascript' },
                        { name: 'React.js', slug: 'react' },
                        { name: 'PHP', slug: 'php' },
                        { name: 'Laravel', slug: 'laravel' },
                        { name: 'MySQL', slug: 'mysql' },
                        { name: 'MongoDB', slug: 'mongodb' },
                        { name: 'Flutter', slug: 'flutter' },
                        { name: 'Dart', slug: 'dart' },
                        { name: 'Python', slug: 'python' },
                        { name: 'Programming Fundamentals', slug: 'programming-fundamentals' }
                    ].map(t => (
                        <Link
                            key={t.slug}
                            to={`/technologies/${t.slug}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:border-[#193D35] hover:text-[#193D35] dark:hover:text-emerald-400 transition-all shadow-xs"
                        >
                            <span>{t.name} Quizzes &amp; Practice</span>
                            <ArrowRight size={12} className="opacity-60" />
                        </Link>
                    ))}
                </div>
            </section>

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
                                <TechLogo name={selectedCatForSession.name} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#193D35] bg-[#F3E5C5] px-2.5 py-0.5 rounded-full border border-[#E2D0A6]">
                                            Sessions
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
                                            <span>Sessions</span>
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
                                                    <p className="text-xs font-black">
                                                        {`Session ${s.session}`}
                                                    </p>
                                                    <p className={`text-[10px] mt-0.5 font-semibold ${isSelected ? 'text-white/90' : 'text-[#193D35]'}`}>
                                                        {s.count} {s.count === 1 ? 'Question' : 'Questions'}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Option 3: Add / Enter Custom Session No Toggle & Input */}
                                    {selectedCatForSession?.name?.toLowerCase() !== 'seo' && (
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
                                                        Enter any session number you want to practice.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Active Selection Live Summary */}
                                <div className="p-3 rounded-xl bg-[#F3E5C5]/50 border border-[#E2D0A6] flex items-center justify-between text-xs">
                                    <span className="font-semibold text-[var(--foreground)]">Selected Session:</span>
                                    <span className="font-extrabold text-[#193D35] flex items-center gap-1.5">
                                        <CheckCircle2 size={13} className="text-[#193D35]" />
                                        {selectedCatForSession.name} · {
                                            isCustomMode
                                                ? `Session ${customSessionNo || chosenSession}`
                                                : chosenSession === 'all'
                                                    ? 'All Sessions (Complete Track)'
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
                                        <Play size={14} /> {
                                            !isCustomMode && chosenSession === 'all'
                                                ? 'Start All Sessions Quiz'
                                                : 'Start Session Quiz'
                                        }
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
            <main className="flex-1 pt-24 pb-12 min-h-0">
                {mainContent}
            </main>
            <Footer />
        </div>
    );
}
