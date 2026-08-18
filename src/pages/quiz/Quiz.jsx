import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Clock, CheckCircle2, XCircle, Menu, X, ArrowRight, ArrowLeft,
    Flag, AlertCircle, HelpCircle, ChevronLeft, ChevronRight,
    Send, Loader2, Check, Sparkles, LayoutGrid, CheckCircle,
    RotateCcw, ShieldCheck, Flame, BookOpen, Layers
} from 'lucide-react';

const defaultQuizOptions = {
    timePerQuestion: 60,
    passingScore: 70,
    maxQuestions: 10,
    randomizeQuestions: true,
    shuffleOptions: false,
    instantFeedback: true,
    allowRetries: true,
    negativeMarking: false,
    showExplanations: true
};

const getQuizOptions = () => {
    try {
        const saved = localStorage.getItem('quiz_options');
        return saved ? { ...defaultQuizOptions, ...JSON.parse(saved) } : defaultQuizOptions;
    } catch {
        return defaultQuizOptions;
    }
};

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCategory = location.state?.category || location.state?.language;
    const selectedSession = location.state?.session ? parseInt(location.state.session, 10) : 1;
    const quizOpts = getQuizOptions();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [navigatorOpen, setNavigatorOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(() => getQuizOptions().timePerQuestion || 60);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [startTime, setStartTime] = useState(() => Date.now());

    const normalizeValue = (val) => String(val || '').trim().replace(/\s+/g, ' ').toLowerCase();

    // Fetch questions from API
    useEffect(() => {
        if (!selectedCategory) {
            toast.error("No category selected.");
            navigate('/technologies');
            return;
        }

        const fetchQuestions = async () => {
            try {
                const url = `/questions?category=${encodeURIComponent(selectedCategory)}&session=${selectedSession}`;
                const res = await axios.get(url);
                let filtered = res.data.filter(q => {
                    return normalizeValue(q.category) === normalizeValue(selectedCategory);
                });

                if (quizOpts.randomizeQuestions) {
                    filtered = [...filtered].sort(() => Math.random() - 0.5);
                }
                if (quizOpts.maxQuestions && quizOpts.maxQuestions > 0 && quizOpts.maxQuestions < 900) {
                    filtered = filtered.slice(0, quizOpts.maxQuestions);
                }

                setQuestions(filtered);
                if (filtered.length === 0) {
                    toast.info(`No questions found for ${selectedCategory} (Session ${selectedSession}).`);
                }
                setStartTime(Date.now());
            } catch {
                toast.error("Failed to load questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, [selectedCategory, selectedSession, navigate, quizOpts.randomizeQuestions, quizOpts.maxQuestions]);

    const handleSubmitQuiz = useCallback(async () => {
        let score = 0;
        questions.forEach(q => {
            const idx = selectedAnswers[q.id];
            if (idx !== undefined) {
                let opts = q.options;
                if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
                if (normalizeValue(opts[idx]) === normalizeValue(q.correct_answer)) score++;
            }
        });
        const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
        const timeTaken = Math.round((Date.now() - startTime) / 1000);

        try {
            const res = await axios.post('/results/save', {
                category: selectedCategory,
                session: selectedSession,
                score,
                total: questions.length,
                percentage,
                difficulty: questions[0]?.difficulty || 'beginner'
            });
            if (res.data?.resultId) {
                toast.success("Quiz result saved successfully!");
            }
        } catch (error) {
            console.error("Error saving result:", error);
            if (error.response?.status === 401) {
                toast.info("Sign in to save and track your score in your dashboard.");
            }
        }

        setIsSubmitted(true);
        navigate('/quiz/result', {
            state: {
                score,
                total: questions.length,
                percentage,
                category: selectedCategory,
                session: selectedSession,
                timeTaken,
            }
        });
    }, [questions, selectedAnswers, startTime, selectedCategory, selectedSession, navigate]);

    const handleAutoAdvance = useCallback(() => {
        const currentQ = questions[currentIndex];
        if (currentQ) {
            setWrongAnswers(prev => ({ ...prev, [currentQ.id]: true }));
            setFeedbackType('timeout');
            setShowFeedback(true);
            setTimeout(() => {
                setShowFeedback(false);
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    handleSubmitQuiz();
                }
            }, 900);
        }
    }, [questions, currentIndex, handleSubmitQuiz]);

    // Question Timer
    useEffect(() => {
        if (!loading && questions.length > 0 && !isSubmitted) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleAutoAdvance();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, questions, isSubmitted, currentIndex, handleAutoAdvance]);

    useEffect(() => {
        setTimeLeft(quizOpts.timePerQuestion || 60);
    }, [currentIndex, quizOpts.timePerQuestion]);

    const handleAnswerSelect = (questionId, optionIndex) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
        const q = questions.find(q => q.id === questionId);
        if (!q) return;
        let opts = q.options;
        if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
        const isCorrect = opts[optionIndex] === q.correct_answer;
        setFeedbackType(isCorrect ? 'correct' : 'wrong');
        setShowFeedback(true);
        if (!isCorrect) {
            setWrongAnswers(prev => ({ ...prev, [questionId]: true }));
        } else {
            setWrongAnswers(prev => {
                const n = { ...prev };
                delete n[questionId];
                return n;
            });
        }
        setTimeout(() => setShowFeedback(false), 600);
    };

    const toggleFlag = (questionId) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) newSet.delete(questionId);
            else newSet.add(questionId);
            return newSet;
        });
    };

    // Keyboard Shortcuts Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Disable when modals are open
            if (showConfirmSubmit || showExitConfirm) return;

            const key = e.key.toLowerCase();
            const currentQ = questions[currentIndex];
            if (!currentQ) return;

            let opts = currentQ.options;
            if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }

            // Select Options: 1, 2, 3, 4 or a, b, c, d
            if (['1', 'a'].includes(key) && opts.length > 0) {
                handleAnswerSelect(currentQ.id, 0);
            } else if (['2', 'b'].includes(key) && opts.length > 1) {
                handleAnswerSelect(currentQ.id, 1);
            } else if (['3', 'c'].includes(key) && opts.length > 2) {
                handleAnswerSelect(currentQ.id, 2);
            } else if (['4', 'd'].includes(key) && opts.length > 3) {
                handleAnswerSelect(currentQ.id, 3);
            } else if (key === 'arrowright' || key === 'enter') {
                if (currentIndex < questions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else if (currentIndex === questions.length - 1) {
                    setShowConfirmSubmit(true);
                }
            } else if (key === 'arrowleft') {
                if (currentIndex > 0) {
                    setCurrentIndex(prev => prev - 1);
                }
            } else if (key === 'f') {
                toggleFlag(currentQ.id);
            } else if (key === 'm') {
                setNavigatorOpen(prev => !prev);
            } else if (key === 'escape') {
                setNavigatorOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions, showConfirmSubmit, showExitConfirm]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[var(--page-bg)] flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-3xl bg-[#193D35]/10 animate-ping absolute" />
                    <div className="w-16 h-16 rounded-3xl bg-[#193D35] flex items-center justify-center text-white shadow-xl">
                        <Sparkles size={28} className="animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-base font-display font-bold text-[var(--foreground)]">Initializing Assessment</h3>
                    <p className="text-xs text-[var(--foreground-muted)]">Loading questions for {selectedCategory}...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="h-screen w-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
                <div className="card p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center mx-auto">
                        <HelpCircle size={30} className="text-[var(--foreground-muted)]" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-[var(--foreground)]">No Questions Found</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">
                        No questions available for {selectedCategory} in <strong className="text-[var(--foreground)]">Session {selectedSession}</strong>. Try choosing another session or create questions in Admin dashboard.
                    </p>
                    <button onClick={() => navigate('/technologies')} className="btn-primary text-xs py-2.5 px-6 mx-auto cursor-pointer">
                        Browse Sessions & Tracks
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    let currentOptions = currentQ?.options;
    if (typeof currentOptions === 'string') { try { currentOptions = JSON.parse(currentOptions); } catch { currentOptions = []; } }

    const answeredCount = Object.keys(selectedAnswers).length;
    const flaggedCount = flaggedQuestions.size;
    const isLastQuestion = currentIndex === questions.length - 1;
    const totalTime = quizOpts.timePerQuestion || 60;
    const timerPct = Math.min(100, Math.max(0, (timeLeft / totalTime) * 100));
    const timerIsUrgent = timeLeft <= 10;
    const isCurrentFlagged = flaggedQuestions.has(currentQ?.id);
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="h-screen max-h-screen w-screen overflow-hidden flex flex-col bg-[var(--page-bg)] text-[var(--foreground)] select-none relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#193D35]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D19A45]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

            {/* Live Top Time-Depletion Progress Line */}
            <div className="w-full h-1 bg-[var(--muted-bg)] relative z-30 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${
                        timerIsUrgent
                            ? 'bg-red-500 shadow-sm shadow-red-500/50'
                            : timeLeft <= 20
                                ? 'bg-amber-500'
                                : 'bg-[#193D35]'
                    }`}
                    style={{ width: `${timerPct}%` }}
                />
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 1. TOP HEADER (PROMINENT TIMER, TRACK INFO & PROGRESS)
               ═══════════════════════════════════════════════════════════ */}
            <header className="h-16 shrink-0 border-b border-[var(--card-border)] bg-[var(--nav-bg)] backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between z-20">
                {/* Left: Exit + Track Info */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Exit Quiz"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="h-5 w-px bg-[var(--card-border)] hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[var(--foreground)] flex items-center gap-1.5">
                            <BookOpen size={16} className="text-[#193D35]" />
                            {selectedCategory}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] uppercase tracking-wider">
                            Session {selectedSession}
                        </span>
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] uppercase tracking-wider">
                            {currentQ?.difficulty || 'Standard'}
                        </span>
                    </div>
                </div>

                {/* Center: Integrated Dynamic Progress Track */}
                <div className="hidden md:flex flex-col items-center gap-1 min-w-[220px] lg:min-w-[280px]">
                    <div className="flex items-center justify-between w-full text-[11px] font-bold text-[var(--foreground-muted)]">
                        <span>Question <strong className="text-[var(--foreground)]">{currentIndex + 1}</strong> of {questions.length}</span>
                        <span className="text-[#193D35]">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--muted-bg)] rounded-full overflow-hidden p-0.5 border border-[var(--card-border)]/50">
                        <div
                            className="h-full bg-gradient-to-r from-[#193D35] to-[#42665B] transition-all duration-300 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Right: Prominent Countdown Timer, Flag, and Question Navigator HUD */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* PROMINENT COUNTDOWN TIMER BADGE */}
                    <div
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                            timerIsUrgent
                                ? 'bg-red-500/15 border-red-500 text-red-600 ring-2 ring-red-500/30 animate-pulse'
                                : timeLeft <= 20
                                    ? 'bg-amber-500/10 border-amber-500/60 text-amber-700'
                                    : 'bg-[#193D35]/10 border-[#193D35]/30 text-[#193D35]'
                        }`}
                        title="Time remaining for current question"
                    >
                        {timerIsUrgent ? (
                            <Flame size={18} className="text-red-600 animate-bounce shrink-0" />
                        ) : (
                            <Clock size={16} className={`shrink-0 ${timeLeft <= 20 ? 'text-amber-600' : 'text-[#193D35]'}`} />
                        )}
                        <div className="flex items-baseline gap-1 font-mono">
                            <span className="text-sm sm:text-base font-black tabular-nums tracking-tight">
                                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                            </span>
                            <span className="hidden lg:inline text-[10px] font-sans font-bold uppercase tracking-wider opacity-75">left</span>
                        </div>
                    </div>

                    {/* Flag / Bookmark Button */}
                    <button
                        onClick={() => toggleFlag(currentQ.id)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isCurrentFlagged
                                ? 'bg-[#F3E5C5] text-[#D19A45] border-[#D19A45] shadow-xs'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] border-[var(--card-border)]'
                        }`}
                        title={isCurrentFlagged ? 'Flagged for review (Press F)' : 'Flag for review (Press F)'}
                    >
                        <Flag size={16} className={isCurrentFlagged ? 'fill-[#D19A45]' : ''} />
                    </button>

                    {/* Matrix / Navigator Drawer Toggle */}
                    <button
                        onClick={() => setNavigatorOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            navigatorOpen
                                ? 'bg-[#193D35] text-white border-[#193D35] shadow-xs'
                                : 'bg-[var(--muted-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:border-[#193D35]'
                        }`}
                        title={navigatorOpen ? "Hide Question Navigator (Press M)" : "Open Question Navigator (Press M)"}
                    >
                        <LayoutGrid size={15} />
                        <span className="font-mono">{answeredCount}/{questions.length}</span>
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                 2. MAIN ASSESSMENT CANVAS (CENTERED, FIT-TO-SCREEN)
               ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-0 relative overflow-hidden">
                <main className="flex-1 h-full flex flex-col justify-between py-4 lg:py-6 px-4 sm:px-8 max-w-4xl mx-auto w-full overflow-hidden">
                    {/* Top: Mobile Progress & Question Tag */}
                    <div className="shrink-0 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#193D35]" />
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <span className="text-[10px] font-bold text-[var(--foreground-muted)] bg-[var(--muted-bg)] px-2.5 py-1 rounded-full border border-[var(--card-border)]">
                                1 Point · Single Choice
                            </span>
                        </div>

                        {/* Question Prompt Title Card */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-1.5 bg-[#193D35]" />
                            <h2 className="text-base sm:text-lg lg:text-xl font-display font-extrabold text-[var(--foreground)] leading-snug">
                                {currentQ?.question_text}
                            </h2>
                        </div>
                    </div>

                    {/* Middle: Interactive Options Deck (Keyboard A-D / 1-4) */}
                    <div className="flex-1 min-h-0 flex flex-col justify-center gap-2.5 my-3 overflow-y-auto pr-1 no-scrollbar">
                        {currentOptions?.map((opt, idx) => {
                            const isSelected = selectedAnswers[currentQ.id] === idx;
                            const optionLetter = String.fromCharCode(65 + idx);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(currentQ.id, idx)}
                                    className={`w-full group text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 cursor-pointer relative ${
                                        isSelected
                                            ? 'bg-[#F3E5C5]/70 border-[#193D35] shadow-md -translate-y-0.5'
                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[#193D35] hover:bg-[var(--muted-bg)]/40 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {/* Option Letter Chip */}
                                    <div
                                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center shrink-0 font-mono font-extrabold text-xs sm:text-sm transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-[#193D35] border-[#193D35] text-[#FCFAF4] shadow-xs scale-105'
                                                : 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground-muted)] group-hover:border-[#193D35] group-hover:text-[var(--foreground)]'
                                        }`}
                                    >
                                        {optionLetter}
                                    </div>

                                    {/* Option Text */}
                                    <span
                                        className={`text-xs sm:text-sm font-medium leading-relaxed flex-1 ${
                                            isSelected ? 'font-bold text-[#193D35]' : 'text-[var(--foreground)]'
                                        }`}
                                    >
                                        {opt}
                                    </span>

                                    {/* Selected Checkmark Icon */}
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-[#193D35] text-white flex items-center justify-center shrink-0 shadow-xs animate-scale-in">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom: Persistent Action Dock */}
                    <div className="shrink-0 pt-3 border-t border-[var(--card-border)] flex items-center justify-between gap-3">
                        <button
                            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                            disabled={currentIndex === 0}
                            className="btn-secondary text-xs sm:text-sm py-2.5 px-4 sm:px-5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* Keyboard navigation hints */}
                        <div className="hidden lg:flex items-center gap-2 text-[10px] font-semibold text-[var(--foreground-muted)] bg-[var(--muted-bg)] px-3 py-1.5 rounded-full border border-[var(--card-border)]">
                            <span>Keys:</span>
                            <kbd className="px-1.5 py-0.5 bg-[var(--card-bg)] rounded border text-[9px] font-mono">1-4</kbd>
                            <span>Select</span>
                            <span>·</span>
                            <kbd className="px-1.5 py-0.5 bg-[var(--card-bg)] rounded border text-[9px] font-mono">Enter</kbd>
                            <span>Next</span>
                            <span>·</span>
                            <kbd className="px-1.5 py-0.5 bg-[var(--card-bg)] rounded border text-[9px] font-mono">F</kbd>
                            <span>Flag</span>
                        </div>

                        {isLastQuestion ? (
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                className="btn-primary text-xs sm:text-sm py-2.5 px-5 sm:px-6 shadow-lg shadow-[#193D35]/20 cursor-pointer"
                            >
                                <Send size={15} /> Finish & Submit
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                                className="btn-primary text-xs sm:text-sm py-2.5 px-5 sm:px-6 shadow-md shadow-[#193D35]/15 cursor-pointer"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </main>

                {/* Mobile Backdrop Overlay (only on < lg when open) */}
                {navigatorOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
                        onClick={() => setNavigatorOpen(false)}
                    />
                )}

                {/* Question Navigator Panel (Fixed / Docked by default on desktop, toggleable) */}
                <aside
                    className={`fixed lg:static top-0 right-0 h-full z-50 lg:z-10 w-full max-w-sm sm:w-96 lg:w-80 xl:w-96 bg-[var(--card-bg)] border-l border-[var(--card-border)] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
                        navigatorOpen
                            ? 'translate-x-0 lg:flex shadow-2xl lg:shadow-none'
                            : 'translate-x-full lg:hidden pointer-events-none'
                    }`}
                >
                    {/* Drawer / Sidebar Header */}
                    <div className="p-4 sm:p-5 border-b border-[var(--card-border)] flex items-center justify-between shrink-0 bg-[var(--muted-bg)]/30">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-[#193D35] text-white flex items-center justify-center shadow-xs">
                                <LayoutGrid size={16} />
                            </div>
                            <div>
                                <h3 className="font-display font-extrabold text-sm text-[var(--foreground)]">Question Navigator</h3>
                                <p className="text-[10px] text-[var(--foreground-muted)] font-medium">Quick jump across questions</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Live Synchronized Timer in Header */}
                            <div
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${
                                    timerIsUrgent
                                        ? 'bg-red-500/15 border-red-500 text-red-600 animate-pulse'
                                        : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[#193D35]'
                                }`}
                                title="Active Timer"
                            >
                                <Clock size={12} className={timerIsUrgent ? 'text-red-600' : 'text-[#193D35]'} />
                                <span>{timeLeft}s</span>
                            </div>

                            <button
                                onClick={() => setNavigatorOpen(false)}
                                className="p-1.5 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all cursor-pointer"
                                title="Hide Navigator (Press M)"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Question Grid & Details */}
                    <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-5">
                        {/* 5-Column Question Number Matrix */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground-muted)] mb-2.5 uppercase tracking-wider">
                                <span>Questions Map</span>
                                <span className="text-[#193D35] font-mono">{answeredCount} of {questions.length} Answered</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2.5">
                                {questions.map((q, idx) => {
                                    const active = currentIndex === idx;
                                    const answered = selectedAnswers[q.id] !== undefined;
                                    const flagged = flaggedQuestions.has(q.id);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setCurrentIndex(idx);
                                                if (window.innerWidth < 1024) {
                                                    setNavigatorOpen(false);
                                                }
                                            }}
                                            className={`relative h-11 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                                                active
                                                    ? 'bg-[#193D35] text-white shadow-md ring-2 ring-[#193D35]/50 scale-105 font-black'
                                                    : answered
                                                        ? 'bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] hover:bg-[#ebd8b0]'
                                                        : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] hover:border-[#193D35] hover:text-[var(--foreground)]'
                                            }`}
                                        >
                                            {idx + 1}
                                            {flagged && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D19A45] ring-2 ring-white" />
                                            )}
                                            {answered && !active && (
                                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#193D35]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Progress Stats Mini Cards */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-2.5 rounded-xl bg-[#193D35]/5 border border-[#193D35]/15 text-center">
                                <p className="text-[10px] font-bold text-[var(--foreground-muted)]">Answered</p>
                                <p className="text-sm font-black text-[#193D35] mt-0.5">{answeredCount}/{questions.length}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[#D19A45]/10 border border-[#D19A45]/20 text-center">
                                <p className="text-[10px] font-bold text-[var(--foreground-muted)]">Flagged</p>
                                <p className="text-sm font-black text-[#D19A45] mt-0.5">{flaggedCount}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-center">
                                <p className="text-[10px] font-bold text-[var(--foreground-muted)]">Remaining</p>
                                <p className="text-sm font-black text-[var(--foreground)] mt-0.5">{questions.length - answeredCount}</p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2 pt-3 border-t border-[var(--card-border)] text-[11px] text-[var(--foreground-secondary)] font-medium">
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-[#193D35] ring-1 ring-[#193D35]" />
                                <span>Current Question</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-[#F3E5C5] border border-[#E2D0A6]" />
                                <span>Answered Question</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-[#D19A45]" />
                                <span>Flagged for Review</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)]" />
                                <span>Unanswered Question</span>
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="p-4 sm:p-5 border-t border-[var(--card-border)] bg-[var(--muted-bg)]/30 space-y-2 shrink-0">
                        <button
                            onClick={() => {
                                setShowConfirmSubmit(true);
                            }}
                            className="btn-primary w-full justify-center py-3 text-xs font-bold shadow-md shadow-[#193D35]/15 cursor-pointer"
                        >
                            <Send size={14} /> Submit Assessment
                        </button>
                    </div>
                </aside>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 4. CONFIRM EXIT MODAL
               ═══════════════════════════════════════════════════════════ */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className="text-lg font-display font-bold text-[var(--foreground)]">Quit Assessment?</h3>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            Your progress for this attempt will be discarded. Are you sure you want to leave?
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="btn-secondary flex-1 justify-center text-xs py-2.5 cursor-pointer"
                            >
                                Resume Quiz
                            </button>
                            <button
                                onClick={() => navigate('/technologies')}
                                className="btn-primary flex-1 justify-center text-xs py-2.5 bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                 5. CONFIRM SUBMIT MODAL
               ═══════════════════════════════════════════════════════════ */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-[#F3E5C5] border border-[#E2D0A6] flex items-center justify-center mx-auto">
                            <Send size={28} className="text-[#193D35]" />
                        </div>
                        <h3 className="text-xl font-display font-extrabold text-[var(--foreground)]">Submit Assessment?</h3>
                        <p className="text-xs text-[var(--foreground-muted)]">
                            You answered <strong className="text-[var(--foreground)]">{answeredCount} of {questions.length}</strong> questions.
                            {questions.length - answeredCount > 0 && (
                                <span className="block text-[#D19A45] font-semibold mt-1">
                                    ⚠️ {questions.length - answeredCount} question(s) are still unanswered.
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="btn-secondary flex-1 justify-center text-xs py-2.5 cursor-pointer"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={handleSubmitQuiz}
                                className="btn-primary flex-1 justify-center text-xs py-2.5 cursor-pointer"
                            >
                                Submit Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quiz;
