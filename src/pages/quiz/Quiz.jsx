import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Clock, CheckCircle2, XCircle, Menu, X, Bug, ArrowRight, ArrowLeft,
    Flag, Layers, AlertCircle, HelpCircle, ChevronLeft, ChevronRight,
    ListOrdered, Send, Loader2, Check
} from 'lucide-react';

const difficultyColors = {
    beginner: { badge: 'bg-zinc-100 text-black border border-zinc-300', label: 'Beginner' },
    intermediate: { badge: 'bg-zinc-100 text-black border border-zinc-300', label: 'Intermediate' },
    expert: { badge: 'bg-zinc-100 text-black border border-zinc-300', label: 'Expert' },
};

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCategory = location.state?.category || location.state?.language;
    const difficulty = location.state?.difficulty || 'beginner';

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState(null);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [startTime, setStartTime] = useState(() => Date.now());

    const normalizeValue = (val) => String(val || '').trim().replace(/\s+/g, ' ').toLowerCase();

    // Load admin configured quiz options
    const quizOpts = (() => {
        try {
            const saved = localStorage.getItem('quiz_options');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    })();
    const timeLimitPerQuestion = quizOpts.timePerQuestion || 60;

    useEffect(() => {
        const t = setTimeout(() => {
            setTimeLeft(timeLimitPerQuestion);
            setShowFeedback(false);
            setFeedbackType(null);
        }, 0);
        return () => clearTimeout(t);
    }, [currentIndex, timeLimitPerQuestion]);

    const handleSubmitQuiz = async () => {
        let score = 0;
        questions.forEach(q => {
            const idx = selectedAnswers[q.id];
            if (idx !== undefined) {
                let opts = q.options;
                if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
                if (opts[idx] === q.correct_answer) score++;
            }
        });
        const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
        const timeTaken = Math.round((Date.now() - startTime) / 1000);

        try {
            await axios.post('/results/save', {
                category: selectedCategory,
                score,
                total: questions.length,
                percentage,
                difficulty
            });
        } catch (error) {
            console.error("Error saving result:", error);
        }

        setIsSubmitted(true);
        navigate('/quiz/result', { state: { score, total: questions.length, percentage, category: selectedCategory, difficulty, timeTaken } });
    };

    const handleAutoAdvance = () => {
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
            }, 1000);
        }
    };

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, questions, isSubmitted, currentIndex]);

    useEffect(() => {
        if (!selectedCategory) {
            toast.error("No category selected.");
            navigate('/technologies');
            return;
        }
        const fetchQuestions = async () => {
            try {
                let url = `/questions?category=${encodeURIComponent(selectedCategory)}`;
                if (difficulty) url += `&difficulty=${encodeURIComponent(difficulty)}`;
                const res = await axios.get(url);
                let filtered = res.data.filter(q => {
                    const catMatch = normalizeValue(q.category) === normalizeValue(selectedCategory);
                    const diffMatch = !difficulty || normalizeValue(q.difficulty) === normalizeValue(difficulty);
                    return catMatch && diffMatch;
                });

                // Apply Admin Quiz Options (Randomization & Max Count)
                if (quizOpts.randomizeQuestions) {
                    filtered = [...filtered].sort(() => Math.random() - 0.5);
                }
                if (quizOpts.maxQuestions && quizOpts.maxQuestions > 0 && quizOpts.maxQuestions < 900) {
                    filtered = filtered.slice(0, quizOpts.maxQuestions);
                }

                setQuestions(filtered);
                if (filtered.length === 0) {
                    toast.info(`No questions found for ${selectedCategory} at ${difficulty} level.`);
                }
                setStartTime(Date.now());
            } catch {
                toast.error("Failed to load questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory, difficulty, navigate]);

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
        setTimeout(() => setShowFeedback(false), 800);
    };

    const toggleFlag = (questionId) => {
        setFlaggedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) newSet.delete(questionId);
            else newSet.add(questionId);
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-black mx-auto mb-4" />
                    <p className="text-sm font-medium text-[var(--foreground-muted)] animate-pulse">Loading Quiz...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
                <div className="card p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={28} className="text-[var(--foreground-muted)]" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-[var(--foreground)] mb-2">No Questions Available</h2>
                    <p className="text-sm text-[var(--foreground-muted)] mb-6">
                        No {difficulty} questions for {selectedCategory}. Try a different difficulty or track.
                    </p>
                    <button onClick={() => navigate('/technologies')} className="btn-primary text-sm">
                        Browse Technologies
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
    const timerPct = (timeLeft / 60) * 100;
    const timerIsLow = timeLeft < 10;
    const diffStyle = difficultyColors[difficulty] || difficultyColors.beginner;

    return (
        <div className="h-screen max-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col overflow-hidden">
            {/* ─── TOP BAR ─── */}
            <header className="shrink-0 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--card-border)]">
                <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/technologies')}
                            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className="hidden sm:block h-8 w-px bg-[var(--card-border)]" />
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-[var(--foreground)]">{selectedCategory}</p>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${diffStyle.badge} text-[10px] px-2 py-0.5`}>
                                    {diffStyle.label}
                                </span>
                                <span className="text-[10px] text-[var(--foreground-muted)] font-medium">
                                    Q {currentIndex + 1}/{questions.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-center">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className={timerIsLow ? 'text-red-500' : 'text-[var(--foreground-muted)]'} />
                                <span className={`font-mono text-lg font-bold tabular-nums ${timerIsLow ? 'text-red-500 animate-pulse' : 'text-[var(--foreground)]'}`}>
                                    {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                                </span>
                            </div>
                            <div className="w-24 h-1.5 rounded-full bg-[var(--muted-bg)] overflow-hidden mt-1">
                                <div
                                     className={`h-full rounded-full transition-all duration-1000 ${timerIsLow ? 'bg-[#C85F55]' : 'bg-[#174A43]'}`}
                                     style={{ width: `${timerPct}%` }}
                                />
                            </div>
                        </div>

                        <div className="md:hidden flex items-center gap-1.5">
                            <Clock size={14} className={timerIsLow ? 'text-red-500' : 'text-[var(--foreground-muted)]'} />
                            <span className={`font-mono font-bold text-sm ${timerIsLow ? 'text-red-500' : ''}`}>
                                {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleFlag(currentQ.id)}
                            className={`p-2 rounded-xl transition-all ${flaggedQuestions.has(currentQ.id) ? 'text-amber-500 bg-amber-50' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)]'}`}
                            title={flaggedQuestions.has(currentQ.id) ? 'Unflag' : 'Flag for review'}
                        >
                            <Flag size={16} />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] transition-all"
                        >
                            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── VISUAL PROGRESS STEPPER ─── */}
            <QuizProgressStepper
                questions={questions}
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
                selectedAnswers={selectedAnswers}
                flaggedQuestions={flaggedQuestions}
                wrongAnswers={wrongAnswers}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* ─── MAIN ─── */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto p-4 lg:p-8 pb-24">
                        <div className="sm:hidden flex items-center gap-2 mb-4">
                            <span className={`badge ${diffStyle.badge} text-[10px]`}>{diffStyle.label}</span>
                            <span className="text-xs text-[var(--foreground-muted)] font-medium">
                                Q {currentIndex + 1}/{questions.length}
                            </span>
                            {flaggedQuestions.has(currentQ.id) && (
                                <Flag size={12} className="text-amber-500" />
                            )}
                        </div>

                        <div className="mb-6">
                            <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <h2 className="text-xl lg:text-2xl font-display font-bold text-[var(--foreground)] leading-snug mt-3 mb-6">
                                {currentQ?.question_text}
                            </h2>
                            <div className="h-px bg-gradient-to-r from-[#059669]/30 via-[#10B981]/20 to-transparent" />
                        </div>

                        <div className="space-y-3">
                            {currentOptions?.map((opt, idx) => {
                                const isSelected = selectedAnswers[currentQ.id] === idx;
                                let optionClass = 'quiz-option';
                                if (isSelected) {
                                    optionClass += ' quiz-option-selected';
                                }
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswerSelect(currentQ.id, idx)}
                                        className={`${optionClass} ${showFeedback && feedbackType === 'timeout' ? 'quiz-option-disabled' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 font-mono font-bold text-sm transition-all ${
                                            isSelected
                                                ? 'bg-[#174A43] border-[#174A43] text-white'
                                                : 'border-[var(--card-border)] text-[var(--foreground-muted)] group-hover:border-[#174A43]'
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-sm font-medium leading-snug flex-1 ${isSelected ? 'text-[var(--foreground)]' : 'text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]'}`}>
                                            {opt}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle2 size={20} className="text-[#174A43] shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
                                disabled={currentIndex === 0}
                                className="btn-secondary text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={() => setShowConfirmSubmit(true)}
                                    className="btn-primary text-sm"
                                >
                                    Submit Quiz <Send size={15} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentIndex(p => Math.min(questions.length - 1, p + 1))}
                                    className="btn-primary text-sm"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>

                {/* ─── SIDEBAR ─── */}
                <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden border-l border-[var(--card-border)]`}>
                    <div className="w-72 h-full flex flex-col bg-[var(--card-bg)]">
                        <div className="p-5 border-b border-[var(--card-border)]">
                            <div className="flex items-center gap-2 mb-4">
                                <ListOrdered size={14} className="text-[var(--foreground-muted)]" />
                                <h3 className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">Question Navigator</h3>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((q, idx) => {
                                    const active = currentIndex === idx;
                                    const answered = selectedAnswers[q.id] !== undefined;
                                    const wrong = wrongAnswers[q.id];
                                    const flagged = flaggedQuestions.has(q.id);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`relative h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                                active
                                                    ? 'bg-[#174A43] text-white scale-110 shadow-md ring-2 ring-[#174A43]/50'
                                                    : wrong
                                                        ? 'bg-[#C85F55]/10 text-[#C85F55] border border-[#C85F55]/30'
                                                        : answered
                                                            ? 'bg-[#E8EFEA] text-[#174A43] border border-[#357268]/30'
                                                            : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] hover:border-[#174A43]'
                                            }`}
                                        >
                                            {idx + 1}
                                            {flagged && (
                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-5 space-y-3 border-b border-[var(--card-border)]">
                            <StatRow label="Answered" value={answeredCount} total={questions.length} color="text-[#174A43]" />
                            <StatRow label="Remaining" value={questions.length - answeredCount} total={questions.length} color="text-[#174A43]" />
                            <StatRow label="Flagged" value={flaggedCount} total={questions.length} color="text-amber-500" />
                        </div>

                        <div className="p-5 space-y-2.5">
                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest mb-3">Legend</p>
                            <LegendItem color="bg-[#174A43]" label="Answered" />
                            <LegendItem color="bg-[#C85F55]" label="Incorrect" />
                            <LegendItem color="bg-[#174A43]" label="Current" />
                            <LegendItem color="bg-amber-500" label="Flagged" />
                            <LegendItem color="bg-[var(--muted-bg)] border border-[var(--card-border)]" label="Unanswered" />
                        </div>

                        <div className="mt-auto p-5 border-t border-[var(--card-border)]">
                            <button
                                onClick={() => setShowConfirmSubmit(true)}
                                className="btn-primary w-full justify-center py-3 text-sm"
                            >
                                <Send size={15} /> Finish Quiz
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ─── Feedback Overlay ─── */}
            <div className={`fixed inset-0 z-50 pointer-events-none transition-all duration-300 ${showFeedback ? 'opacity-100' : 'opacity-0'}`}>
                {feedbackType === 'correct' && (
                    <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px]" />
                )}
                {feedbackType === 'wrong' && (
                    <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[1px]" />
                )}
                {feedbackType === 'timeout' && (
                    <div className="absolute inset-0 bg-red-500/10 backdrop-blur-[2px]">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Clock size={48} className="text-red-500 mx-auto mb-2 animate-bounce" />
                                <p className="text-red-500 font-bold text-lg">Time's Up!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Confirm Submit Modal ─── */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="card p-8 rounded-2xl max-w-md w-full animate-scale-in shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-4">
                                <Send size={28} className="text-black" />
                            </div>
                            <h3 className="text-xl font-display font-bold text-[var(--foreground)] mb-2">Submit Quiz?</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">
                                You have answered <strong className="text-[var(--foreground)]">{answeredCount}/{questions.length}</strong> questions.
                                {questions.length - answeredCount > 0 && (
                                    <span className="text-amber-500"> {questions.length - answeredCount} unanswered.</span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="btn-secondary flex-1 justify-center py-3 text-sm"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={handleSubmitQuiz}
                                className="btn-primary flex-1 justify-center py-3 text-sm"
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

function QuizProgressStepper({ questions, currentIndex, setCurrentIndex, selectedAnswers, flaggedQuestions, wrongAnswers }) {
    const activeRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [currentIndex]);

    const total = questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    const progressPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    return (
        <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] px-4 lg:px-8 py-3 shadow-xs transition-colors select-none">
            <div className="max-w-5xl mx-auto">
                {/* Header summary line */}
                <div className="flex items-center justify-between mb-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--foreground-muted)]">
                            Quiz Progress
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-black border border-zinc-300">
                            {progressPercent}% Completed
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--foreground-muted)]">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#174A43] inline-block" />
                            <strong className="text-[var(--foreground)]">{answeredCount}</strong> / {total} Answered
                        </span>
                        {flaggedQuestions.size > 0 && (
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Flag size={11} /> {flaggedQuestions.size} Flagged
                            </span>
                        )}
                    </div>
                </div>

                {/* Overall track progress bar */}
                <div className="w-full h-1.5 bg-[var(--muted-bg)] rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full bg-[#174A43] transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Stepper Nodes Row */}
                <div className="relative pt-1 pb-1">
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth"
                    >
                        {questions.map((q, idx) => {
                            const isCurrent = idx === currentIndex;
                            const isAnswered = selectedAnswers[q.id] !== undefined;
                            const isFlagged = flaggedQuestions.has(q.id);
                            const isWrong = wrongAnswers[q.id];

                            let stateClasses = "bg-[var(--muted-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:border-[#174A43]";
                            let badgeIcon = null;

                            if (isCurrent) {
                                stateClasses = "bg-[#174A43] text-white border-[#174A43] ring-2 ring-[#174A43]/40 shadow-xs scale-105";
                            } else if (isWrong) {
                                stateClasses = "bg-[#C85F55]/10 text-[#C85F55] border-[#C85F55]/30 hover:bg-[#C85F55]/20";
                                badgeIcon = <X size={10} strokeWidth={3} />;
                            } else if (isAnswered) {
                                stateClasses = "bg-[#174A43] text-white border-[#174A43] shadow-xs";
                                badgeIcon = <Check size={10} strokeWidth={3} />;
                            }

                            return (
                                <div key={idx} className="flex items-center shrink-0" ref={isCurrent ? activeRef : null}>
                                    <button
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`group relative flex items-center justify-center min-w-[32px] h-8 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${stateClasses}`}
                                        title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : isCurrent ? ' (Current)' : ''}${isFlagged ? ' (Flagged)' : ''}`}
                                    >
                                        <span className="flex items-center gap-1">
                                            {badgeIcon}
                                            <span>{idx + 1}</span>
                                        </span>

                                        {isFlagged && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border border-white rounded-full flex items-center justify-center shadow-xs" />
                                        )}
                                    </button>

                                    {/* Connector line between step nodes */}
                                    {idx < total - 1 && (
                                        <div
                                            className={`w-2.5 sm:w-4 lg:w-5 h-0.5 mx-0.5 rounded-full transition-colors ${
                                                isAnswered || idx < currentIndex
                                                    ? 'bg-[#174A43]'
                                                    : 'bg-[var(--card-border)]'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value, total, color }) {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest">{label}</p>
                <p className={`text-xs font-bold ${color}`}>{value}/{total}</p>
            </div>
            <div className="progress-bar h-1.5">
                <div className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function LegendItem({ color, label, border }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded-md ${color} ${border || ''}`} />
            <span className="text-xs text-[var(--foreground-muted)] font-medium">{label}</span>
        </div>
    );
}

export default Quiz;
