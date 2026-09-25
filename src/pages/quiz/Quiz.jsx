import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    X, ArrowRight, ArrowLeft,
    Flag, AlertCircle, HelpCircle, ChevronLeft, ChevronRight,
    Send, Sparkles, LayoutGrid, Check, BookOpen,
    BookmarkCheck, RefreshCw, Loader2, PlayCircle, RotateCcw, Clock, Trash2
} from 'lucide-react';
import attemptService from '../../services/attemptService';

const defaultQuizOptions = {
    passingScore: 70,
    maxQuestions: 999,
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
        if (!saved) return defaultQuizOptions;
        const parsed = JSON.parse(saved);
        if (parsed.maxQuestions === 10) {
            parsed.maxQuestions = 999;
        }
        return { ...defaultQuizOptions, ...parsed };
    } catch {
        return defaultQuizOptions;
    }
};

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCategory = location.state?.category || location.state?.language;
    const rawSession = location.state?.session;
    const isAllSessions = rawSession === 'all' || rawSession === 'All' || rawSession === 0;
    const selectedSession = isAllSessions ? 'all' : (parseInt(rawSession, 10) || 1);
    const quizOpts = getQuizOptions();

    const explicitAttemptId = location.state?.attemptId || null;
    const [attemptId, setAttemptId] = useState(explicitAttemptId);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
    const [isResumed, setIsResumed] = useState(false);
    const [pendingResumeAttempt, setPendingResumeAttempt] = useState(null);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

    const attemptIdRef = useRef(explicitAttemptId);
    const saveTimeoutRef = useRef(null);
    const latestStateRef = useRef({
        currentIndex: 0,
        selectedAnswers: {},
        flaggedQuestions: new Set(),
        questions: []
    });

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [navigatorOpen, setNavigatorOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return false;
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [startTime, setStartTime] = useState(() => Date.now());

    // Keep latestStateRef updated on every state transition
    useEffect(() => {
        latestStateRef.current = {
            currentIndex,
            selectedAnswers,
            flaggedQuestions,
            questions
        };
    }, [currentIndex, selectedAnswers, flaggedQuestions, questions]);

    // Auto-close navigator on mobile resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setNavigatorOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const normalizeValue = useCallback((val) => String(val || '').trim().replace(/\band\b/gi, '&').replace(/\s+/g, ' ').toLowerCase(), []);

    // Format relative time helper for resume dialog
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'recently';
        const date = new Date(dateStr);
        const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        if (diffSeconds < 60) return 'just now';
        const diffMinutes = Math.floor(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    // Save current progress to MongoDB Atlas via attemptService
    const saveCurrentProgress = useCallback(async (overrides = {}) => {
        const currentAttId = overrides.attemptId || attemptIdRef.current;
        if (!currentAttId) return;

        const curIndex = overrides.currentIndex !== undefined ? overrides.currentIndex : latestStateRef.current.currentIndex;
        const curAnswers = overrides.selectedAnswers !== undefined ? overrides.selectedAnswers : latestStateRef.current.selectedAnswers;
        const curFlagged = overrides.flaggedQuestions !== undefined ? overrides.flaggedQuestions : latestStateRef.current.flaggedQuestions;
        const curQuestions = overrides.questions || latestStateRef.current.questions;

        let curScore = 0;
        curQuestions.forEach(q => {
            const idx = curAnswers[q.id];
            if (idx !== undefined) {
                let opts = q.options;
                if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
                if (normalizeValue(opts[idx]) === normalizeValue(q.correct_answer)) curScore++;
            }
        });

        const answeredCount = Object.keys(curAnswers).length;
        const progressPercentage = curQuestions.length > 0 ? Math.round((answeredCount / curQuestions.length) * 100) : 0;

        setSaveStatus('saving');
        try {
            await attemptService.updateProgress(currentAttId, {
                currentQuestionIndex: curIndex,
                answers: curAnswers,
                flaggedQuestions: Array.from(curFlagged),
                score: curScore,
                answeredCount,
                progressPercentage,
                status: overrides.status || 'in_progress'
            });
            setSaveStatus('saved');
        } catch (err) {
            console.error('Error auto-saving quiz attempt:', err);
            setSaveStatus('error');
        }
    }, [normalizeValue]);

    // Handle selecting an answer with debounced auto-save
    const handleAnswerSelect = useCallback((questionId, optionIndex) => {
        setSelectedAnswers(prev => {
            const updated = { ...prev, [questionId]: optionIndex };
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            setSaveStatus('saving');
            saveTimeoutRef.current = setTimeout(() => {
                saveCurrentProgress({ selectedAnswers: updated });
            }, 600);
            return updated;
        });
    }, [saveCurrentProgress]);

    // Manual Save & Exit handler
    const handleSaveAndExit = async () => {
        setIsSavingAndExiting(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        try {
            await saveCurrentProgress();
            toast.success("Quiz progress saved! You can resume anytime from your dashboard.");
            navigate('/dashboard');
        } catch (err) {
            console.error("Save & Exit error:", err);
            toast.info("Navigating to dashboard.");
            navigate('/dashboard');
        } finally {
            setIsSavingAndExiting(false);
        }
    };

    // Discard active attempt and exit
    const handleDiscardAndExit = async () => {
        if (attemptIdRef.current) {
            try {
                await attemptService.discardAttempt(attemptIdRef.current);
                toast.info("Quiz attempt discarded.");
            } catch (err) {
                console.warn("Failed to discard attempt:", err);
            }
        }
        navigate('/dashboard');
    };

    // Navigation Handlers with immediate auto-save
    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            saveCurrentProgress({ currentIndex: nextIdx });
        } else if (currentIndex === questions.length - 1) {
            setShowConfirmSubmit(true);
        }
    };

    const handlePrevQuestion = () => {
        if (currentIndex > 0) {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            saveCurrentProgress({ currentIndex: prevIdx });
        }
    };

    const handleJumpToQuestion = (targetIdx) => {
        setCurrentIndex(targetIdx);
        saveCurrentProgress({ currentIndex: targetIdx });
        if (window.innerWidth < 1024) {
            setNavigatorOpen(false);
        }
    };

    const toggleFlag = (questionId) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) newSet.delete(questionId);
            else newSet.add(questionId);
            saveCurrentProgress({ flaggedQuestions: newSet });
            return newSet;
        });
    };

    // Auto-save on page exit / tab switch
    useEffect(() => {
        const handleBeforeUnload = () => {
            const currentAttId = attemptIdRef.current;
            if (!currentAttId || isSubmitted) return;

            const curAnswers = latestStateRef.current.selectedAnswers;
            const curIndex = latestStateRef.current.currentIndex;
            const curFlagged = Array.from(latestStateRef.current.flaggedQuestions);
            const answeredCount = Object.keys(curAnswers).length;

            const payload = JSON.stringify({
                currentQuestionIndex: curIndex,
                answers: curAnswers,
                flaggedQuestions: curFlagged,
                answeredCount,
                status: 'in_progress'
            });

            if (navigator.sendBeacon) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(`/api/attempts/${currentAttId}`, blob);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && !isSubmitted && attemptIdRef.current) {
                saveCurrentProgress();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [saveCurrentProgress, isSubmitted]);

    // Restore attempt state from snapshot
    const restoreAttempt = useCallback((activeAttempt) => {
        setQuestions(activeAttempt.questionsSnapshot);
        const safeIndex = Math.min(
            activeAttempt.currentQuestionIndex || 0,
            activeAttempt.questionsSnapshot.length - 1
        );
        setCurrentIndex(Math.max(0, safeIndex));
        setSelectedAnswers(activeAttempt.answers || {});
        setFlaggedQuestions(new Set(activeAttempt.flaggedQuestions || []));
        setAttemptId(activeAttempt.id);
        attemptIdRef.current = activeAttempt.id;
        setIsResumed(true);
        setSaveStatus('saved');
        toast.info(`Resumed ${selectedCategory} exactly where you left off (Question ${safeIndex + 1}).`);
    }, [selectedCategory]);

    // Start fresh quiz from question bank and register new in_progress attempt
    const startFreshQuiz = useCallback(async () => {
        setLoading(true);
        try {
            const url = isAllSessions 
                ? `/questions?category=${encodeURIComponent(selectedCategory)}`
                : `/questions?category=${encodeURIComponent(selectedCategory)}&session=${selectedSession}`;
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
                toast.info(`No questions found for ${selectedCategory} (${isAllSessions ? 'All Sessions' : `Session ${selectedSession}`}).`);
            } else {
                try {
                    const startRes = await attemptService.startOrResumeAttempt({
                        category: selectedCategory,
                        session: isAllSessions ? 0 : selectedSession,
                        questionsSnapshot: filtered,
                        totalQuestions: filtered.length,
                        forceNew: true
                    });
                    if (startRes.success && startRes.attempt) {
                        setAttemptId(startRes.attempt.id);
                        attemptIdRef.current = startRes.attempt.id;
                    }
                } catch (startErr) {
                    console.warn("Could not register initial quiz attempt in DB:", startErr);
                }
            }

            setStartTime(Date.now());
        } catch (err) {
            console.error("Failed to load questions:", err);
            toast.error("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    }, [isAllSessions, selectedCategory, selectedSession, normalizeValue, quizOpts.randomizeQuestions, quizOpts.maxQuestions]);

    // Initialize Quiz or Resume Active Attempt
    useEffect(() => {
        if (!selectedCategory) {
            toast.error("No category selected.");
            navigate('/technologies');
            return;
        }

        const initializeQuiz = async () => {
            setLoading(true);
            try {
                // Case 1: Explicit attempt ID passed from User Dashboard "Resume Quiz" button
                if (explicitAttemptId) {
                    try {
                        const res = await attemptService.getAttemptById(explicitAttemptId);
                        if (res.success && res.attempt && Array.isArray(res.attempt.questionsSnapshot) && res.attempt.questionsSnapshot.length > 0) {
                            restoreAttempt(res.attempt);
                            setLoading(false);
                            return;
                        }
                    } catch (e) {
                        console.warn("Could not fetch attempt by explicit ID:", e);
                    }
                }

                // Case 2: Fresh route entry without explicit ID — check if active attempt already exists
                try {
                    const checkRes = await attemptService.checkActiveAttempt(
                        selectedCategory,
                        isAllSessions ? 0 : selectedSession
                    );
                    if (checkRes.success && checkRes.hasActiveAttempt && checkRes.attempt) {
                        const att = checkRes.attempt;
                        if (Array.isArray(att.questionsSnapshot) && att.questionsSnapshot.length > 0) {
                            // Prompt user whether to Resume or Start Over
                            setPendingResumeAttempt(att);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("Could not check active attempt:", e);
                }

                // Case 3: No active attempt found, start fresh
                await startFreshQuiz();
            } catch (err) {
                console.error("Failed to load quiz:", err);
                toast.error("Failed to load quiz.");
                setLoading(false);
            }
        };

        initializeQuiz();
    }, [selectedCategory, selectedSession, isAllSessions, explicitAttemptId, navigate, restoreAttempt, startFreshQuiz]);

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
        const answeredCount = Object.keys(selectedAnswers).length;

        // 1. Mark attempt as completed in database
        if (attemptIdRef.current) {
            try {
                await attemptService.completeAttempt(attemptIdRef.current, {
                    score,
                    totalQuestions: questions.length,
                    answeredCount,
                    progressPercentage: percentage,
                    answers: selectedAnswers
                });
            } catch (attErr) {
                console.warn("Could not mark attempt completed:", attErr);
            }
        }

        // 2. Save result in quiz_results for certificates & rankings
        try {
            const res = await axios.post('/results/save', {
                category: selectedCategory,
                session: isAllSessions ? 1 : selectedSession,
                score,
                total: questions.length,
                percentage,
                difficulty: questions[0]?.difficulty || 'beginner'
            });
            if (res.data?.resultId) {
                toast.success("Quiz completed and saved successfully!");
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
                session: isAllSessions ? 'All' : selectedSession,
                timeTaken,
            }
        });
    }, [questions, selectedAnswers, startTime, selectedCategory, selectedSession, isAllSessions, navigate, normalizeValue]);

    // Keyboard Shortcuts Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Disable when modals are open
            if (showConfirmSubmit || showExitConfirm || showSaveConfirmModal || pendingResumeAttempt) return;

            const key = e.key.toLowerCase();

            // Save & Exit Shortcut: Ctrl+S or Cmd+S
            if ((e.ctrlKey || e.metaKey) && key === 's') {
                e.preventDefault();
                setShowSaveConfirmModal(true);
                return;
            }

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
                handleNextQuestion();
            } else if (key === 'arrowleft') {
                handlePrevQuestion();
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
    });

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
    const isCurrentFlagged = flaggedQuestions.has(currentQ?.id);
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="h-dvh max-h-dvh min-h-dvh w-full overflow-hidden flex flex-col bg-[var(--page-bg)] text-[var(--foreground)] select-none relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#193D35]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D19A45]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

            {/* ═══════════════════════════════════════════════════════════
                 1. TOP HEADER (TRACK INFO & PROGRESS)
               ═══════════════════════════════════════════════════════════ */}
            <header className="h-14 sm:h-16 shrink-0 border-b border-[var(--card-border)] bg-[var(--nav-bg)] backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between z-20 gap-2">
                {/* Left: Exit + Track Info */}
                <div className="min-w-0 flex items-center gap-1.5 sm:gap-3 shrink">
                    <button
                        onClick={() => setShowExitConfirm(true)}
                        className="p-1.5 sm:p-2 rounded-xl text-[var(--foreground-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                        title="Exit Quiz"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="h-4 sm:h-5 w-px bg-[var(--card-border)] hidden sm:block shrink-0" />

                    <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
                        <span className="font-display font-extrabold text-xs sm:text-sm text-[var(--foreground)] flex items-center gap-1.5 truncate">
                            <BookOpen size={15} className="text-[#193D35] shrink-0" />
                            <span className="truncate max-w-[90px] xs:max-w-[140px] sm:max-w-none">{selectedCategory}</span>
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] uppercase tracking-wider shrink-0">
                            {isAllSessions ? 'All' : `S${selectedSession}`}
                        </span>
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] uppercase tracking-wider shrink-0">
                            {currentQ?.difficulty || 'Standard'}
                        </span>
                    </div>
                </div>

                {/* Center: Integrated Dynamic Progress Track (Desktop) */}
                <div className="hidden md:flex flex-col items-center gap-1 min-w-[200px] lg:min-w-[260px] shrink-0">
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

                {/* Right: Live Save Status, Save & Exit, Flag, and Question Navigator HUD */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Live Auto-Save Status Pill */}
                    <div 
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--muted-bg)] border border-[var(--card-border)] text-[11px] font-medium transition-all select-none"
                        title={saveStatus === 'saved' ? 'All progress saved to database' : saveStatus === 'saving' ? 'Saving progress...' : 'Failed to save progress'}
                    >
                        {saveStatus === 'saving' && (
                            <>
                                <Loader2 size={12} className="animate-spin text-[#D19A45]" />
                                <span className="text-[#D19A45] font-semibold">Saving...</span>
                            </>
                        )}
                        {saveStatus === 'saved' && (
                            <>
                                <Check size={12} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Saved</span>
                            </>
                        )}
                        {saveStatus === 'error' && (
                            <>
                                <AlertCircle size={12} className="text-red-500" />
                                <span className="text-red-500 font-semibold">Save Failed</span>
                            </>
                        )}
                    </div>

                    {/* Prominent Save & Exit Button */}
                    <button
                        onClick={() => setShowSaveConfirmModal(true)}
                        disabled={isSavingAndExiting}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#D19A45]/40 bg-[#F3E5C5] text-[#193D35] hover:bg-[#EAD8B0] hover:border-[#D19A45] font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                        title="Save progress and return to dashboard (Ctrl+S)"
                    >
                        {isSavingAndExiting ? (
                            <Loader2 size={14} className="animate-spin text-[#193D35]" />
                        ) : (
                            <BookmarkCheck size={14} className="text-[#193D35]" />
                        )}
                        <span className="hidden xs:inline">Save & Exit</span>
                    </button>

                    {/* Flag / Bookmark Button */}
                    <button
                        onClick={() => toggleFlag(currentQ.id)}
                        className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                            isCurrentFlagged
                                ? 'bg-[#F3E5C5] text-[#D19A45] border-[#D19A45] shadow-xs'
                                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] border-[var(--card-border)]'
                        }`}
                        title={isCurrentFlagged ? 'Flagged for review (Press F)' : 'Flag for review (Press F)'}
                    >
                        <Flag size={15} className={isCurrentFlagged ? 'fill-[#D19A45]' : ''} />
                    </button>

                    {/* Matrix / Navigator Drawer Toggle */}
                    <button
                        onClick={() => setNavigatorOpen(prev => !prev)}
                        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            navigatorOpen
                                ? 'bg-[#193D35] text-white border-[#193D35] shadow-xs'
                                : 'bg-[var(--muted-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:border-[#193D35]'
                        }`}
                        title={navigatorOpen ? "Hide Question Navigator (Press M)" : "Open Question Navigator (Press M)"}
                    >
                        <LayoutGrid size={14} />
                        <span className="font-mono text-xs">{answeredCount}/{questions.length}</span>
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                 2. MAIN ASSESSMENT CANVAS (CENTERED, FIT-TO-SCREEN)
               ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-0 relative overflow-hidden">
                <main className="flex-1 h-full flex flex-col justify-between py-3 sm:py-4 lg:py-6 px-3 sm:px-8 max-w-4xl mx-auto w-full overflow-hidden">
                    {/* Top: Mobile Progress & Question Tag */}
                    <div className="shrink-0 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#193D35]" />
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <span className="text-[10px] font-bold text-[var(--foreground-muted)] bg-[var(--muted-bg)] px-2.5 py-0.5 rounded-full border border-[var(--card-border)]">
                                1 Point · Single Choice
                            </span>
                        </div>

                        {/* Question Prompt Title Card - cleanly styled with border-l-4 to avoid WebKit overflow-radius artifacts */}
                        <div className="p-4 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] border-l-4 border-l-[#193D35] shadow-xs">
                            <h2 className="text-sm sm:text-base lg:text-lg font-display font-bold text-[var(--foreground)] leading-snug sm:leading-relaxed whitespace-pre-line">
                                {currentQ?.question_text}
                            </h2>
                        </div>
                    </div>

                    {/* Middle: Interactive Options Deck (Keyboard A-D / 1-4) */}
                    <div className="flex-1 min-h-0 flex flex-col justify-center gap-2 sm:gap-2.5 my-2 sm:my-3 overflow-y-auto pr-1 no-scrollbar">
                        {currentOptions?.map((opt, idx) => {
                            const isSelected = selectedAnswers[currentQ.id] === idx;
                            const optionLetter = String.fromCharCode(65 + idx);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(currentQ.id, idx)}
                                    className={`w-full group text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-center gap-3 sm:gap-3.5 cursor-pointer relative ${
                                        isSelected
                                            ? 'bg-[#F3E5C5]/70 border-[#193D35] shadow-sm'
                                            : 'bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[#193D35] hover:bg-[var(--muted-bg)]/40'
                                    }`}
                                >
                                    {/* Option Letter Chip */}
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center shrink-0 font-mono font-extrabold text-xs sm:text-sm transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-[#193D35] border-[#193D35] text-[#FCFAF4] shadow-2xs scale-105'
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
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#193D35] text-white flex items-center justify-center shrink-0 shadow-2xs animate-scale-in">
                                            <Check size={13} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom: Persistent Action Dock */}
                    <div className="shrink-0 pt-2.5 sm:pt-3 border-t border-[var(--card-border)] flex items-center justify-between gap-2 sm:gap-3">
                        <button
                            onClick={handlePrevQuestion}
                            disabled={currentIndex === 0}
                            className="btn-secondary text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                        >
                            <ChevronLeft size={16} /> <span>Prev</span>
                        </button>

                        {/* Mobile Question Indicator */}
                        <div className="sm:hidden text-xs font-bold font-mono text-[var(--foreground-muted)]">
                            {currentIndex + 1} / {questions.length}
                        </div>

                        {/* Desktop Keyboard navigation hints */}
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
                                className="btn-primary text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-6 shadow-md shadow-[#193D35]/20 cursor-pointer flex items-center gap-1.5"
                            >
                                <Send size={14} /> <span>Submit</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="btn-primary text-xs sm:text-sm py-2 sm:py-2.5 px-4 sm:px-6 shadow-sm shadow-[#193D35]/15 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>Next</span> <ChevronRight size={16} />
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
                                            onClick={() => handleJumpToQuestion(idx)}
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
                            className="btn-primary w-full justify-center py-3 text-xs font-bold shadow-md shadow-[#193D35]/15 cursor-pointer flex items-center gap-1.5"
                        >
                            <Send size={14} /> Submit Assessment
                        </button>
                        <button
                            onClick={() => setShowSaveConfirmModal(true)}
                            disabled={isSavingAndExiting}
                            className="btn-secondary w-full justify-center py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                        >
                            <BookmarkCheck size={14} /> Save & Exit Quiz
                        </button>
                    </div>
                </aside>
            </div>

            {/* ═══════════════════════════════════════════════════════════
                 4. UNFINISHED ATTEMPT MODAL (PREVENT DUPLICATES)
               ═══════════════════════════════════════════════════════════ */}
            {pendingResumeAttempt && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl animate-scale-in border-2 border-[#193D35]/20">
                        <div className="w-16 h-16 rounded-2xl bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] flex items-center justify-center mx-auto shadow-sm">
                            <PlayCircle size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-display font-extrabold text-[var(--foreground)]">Unfinished Quiz Found</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                You have an active attempt for <strong className="text-[var(--foreground)]">{pendingResumeAttempt.category}</strong> ({pendingResumeAttempt.session === 0 ? 'All Sessions' : `Session ${pendingResumeAttempt.session}`}) saved <span className="text-[#193D35] font-semibold">{formatTimeAgo(pendingResumeAttempt.lastSavedAt)}</span>.
                            </p>
                            <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-semibold flex items-center justify-around">
                                <span>Answered: <strong className="text-[#193D35]">{pendingResumeAttempt.answeredCount || 0} / {pendingResumeAttempt.totalQuestions || 0}</strong></span>
                                <span>•</span>
                                <span>Progress: <strong className="text-[#193D35]">{pendingResumeAttempt.progressPercentage || 0}%</strong></span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                            <button
                                onClick={() => {
                                    const att = pendingResumeAttempt;
                                    setPendingResumeAttempt(null);
                                    restoreAttempt(att);
                                }}
                                className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 order-1 sm:order-2"
                            >
                                <PlayCircle size={15} /> Resume Quiz
                            </button>
                            <button
                                onClick={async () => {
                                    const attId = pendingResumeAttempt.id;
                                    setPendingResumeAttempt(null);
                                    try {
                                        await attemptService.discardAttempt(attId);
                                    } catch (e) {
                                        console.warn("Could not discard prior attempt:", e);
                                    }
                                    await startFreshQuiz();
                                }}
                                className="btn-secondary flex-1 justify-center py-2.5 text-xs font-bold cursor-pointer flex items-center gap-1.5 order-2 sm:order-1 text-red-600 hover:text-red-700"
                            >
                                <RotateCcw size={14} /> Start Over
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════════════
                 5. CONFIRM SAVE & EXIT MODAL
               ═══════════════════════════════════════════════════════════ */}
            {showSaveConfirmModal && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSaveConfirmModal(false); }}
                >
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl animate-scale-in">
                        <div className="w-16 h-16 rounded-2xl bg-[#F3E5C5] border border-[#E2D0A6] text-[#193D35] flex items-center justify-center mx-auto shadow-sm">
                            <BookmarkCheck size={32} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-display font-extrabold text-[var(--foreground)]">Save & Exit Quiz?</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                Your answers and progress (<strong className="text-[var(--foreground)]">{answeredCount} of {questions.length} answered</strong>) will be safely saved in your database. You can resume this quiz at any time from your dashboard.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowSaveConfirmModal(false)}
                                disabled={isSavingAndExiting}
                                className="btn-secondary flex-1 justify-center text-xs py-2.5 cursor-pointer"
                            >
                                Keep Answering
                            </button>
                            <button
                                onClick={async () => {
                                    setShowSaveConfirmModal(false);
                                    await handleSaveAndExit();
                                }}
                                disabled={isSavingAndExiting}
                                className="btn-primary flex-1 justify-center text-xs py-2.5 shadow-md shadow-[#193D35]/20 cursor-pointer flex items-center gap-1.5"
                            >
                                {isSavingAndExiting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <BookmarkCheck size={14} />
                                        <span>Save & Exit</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════════════
                 6. CONFIRM EXIT MODAL
               ═══════════════════════════════════════════════════════════ */}
            {showExitConfirm && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowExitConfirm(false); }}
                >
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-in">
                        <div className="w-14 h-14 rounded-2xl bg-[#F3E5C5] text-[#193D35] border border-[#E2D0A6] flex items-center justify-center mx-auto">
                            <AlertCircle size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-display font-bold text-[var(--foreground)]">Leave Quiz?</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Save your progress to continue later, or discard your current attempt.
                            </p>
                        </div>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={async () => {
                                    setShowExitConfirm(false);
                                    await handleSaveAndExit();
                                }}
                                className="btn-primary w-full justify-center text-xs py-2.5 cursor-pointer flex items-center gap-1.5"
                            >
                                <BookmarkCheck size={14} /> Save & Exit to Dashboard
                            </button>
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="btn-secondary w-full justify-center text-xs py-2 cursor-pointer"
                            >
                                Continue Answering
                            </button>
                            <button
                                onClick={handleDiscardAndExit}
                                className="text-[11px] text-red-500 hover:text-red-700 font-semibold py-1 transition-colors cursor-pointer block mx-auto"
                            >
                                Discard Attempt & Exit
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════════════
                 5. CONFIRM SUBMIT MODAL
               ═══════════════════════════════════════════════════════════ */}
            {showConfirmSubmit && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmSubmit(false); }}
                >
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
                </div>,
                document.body
            )}
        </div>
    );
};

export default Quiz;
