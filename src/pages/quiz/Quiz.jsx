import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    X, ArrowRight, ArrowLeft,
    Flag, AlertCircle, HelpCircle, ChevronLeft, ChevronRight,
    Send, Sparkles, LayoutGrid, Check, BookOpen,
    BookmarkCheck, RefreshCw, Loader2, PlayCircle, RotateCcw, Clock, Trash2,
    CheckCircle2, XCircle
} from 'lucide-react';
import attemptService from '../../services/attemptService';
import { useSettings } from '../../context/SettingsContext';
import ThemeToggle from '../../components/ThemeToggle';

// Format relative time helper for resume dialog
function formatTimeAgo(dateStr) {
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
}

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const selectedCategory = location.state?.category || location.state?.language;
    const rawSession = location.state?.session;
    const isAllSessions = rawSession === 'all' || rawSession === 'All' || rawSession === 0;
    const selectedSession = isAllSessions ? 'all' : (parseInt(rawSession, 10) || 1);
    
    const quizOpts = {
        passingScore: settings?.passingScore || 70,
        maxQuestions: settings?.maxQuestions || 999,
        randomizeQuestions: settings?.randomizeQuestions !== false,
        shuffleOptions: settings?.shuffleOptions || false,
        instantFeedback: settings?.instantFeedback !== false,
        allowRetries: settings?.allowRetries !== false,
        negativeMarking: settings?.negativeMarking || false,
        showExplanations: settings?.showExplanations !== false
    };

    const explicitAttemptId = location.state?.attemptId || null;
    const [_attemptId, setAttemptId] = useState(explicitAttemptId);
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
    const [_isResumed, setIsResumed] = useState(false);
    const [pendingResumeAttempt, setPendingResumeAttempt] = useState(null);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

    const attemptIdRef = useRef(explicitAttemptId);
    const saveTimeoutRef = useRef(null);
    const questionScrollRef = useRef(null);
    const latestStateRef = useRef({
        currentIndex: 0,
        selectedAnswers: {},
        evaluatedAnswers: {},
        flaggedQuestions: new Set(),
        questions: []
    });

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [evaluatedAnswers, setEvaluatedAnswers] = useState({});
    const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
    const [navigatorOpen, setNavigatorOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024;
        }
        return false;
    });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [startTime, setStartTime] = useState(() => Date.now());
    const quizOptsRef = useRef(quizOpts);
    useEffect(() => {
        quizOptsRef.current = quizOpts;
    });

    // Keep latestStateRef updated on every state transition
    useEffect(() => {
        latestStateRef.current = {
            currentIndex,
            selectedAnswers,
            evaluatedAnswers,
            flaggedQuestions,
            questions
        };
    }, [currentIndex, selectedAnswers, evaluatedAnswers, flaggedQuestions, questions]);

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

    // Reset scroll container to top whenever navigating to a different question
    useEffect(() => {
        if (questionScrollRef.current) {
            questionScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentIndex]);

    const normalizeValue = useCallback((val) => {
        return String(val || '')
            .trim()
            .toLowerCase()
            .replace(/^[a-d\d][).:-]\s*/i, '')
            .replace(/\[\s*correct\s*\]|\(\s*correct\s*\)|\*+$/i, '')
            .replace(/\band\b/gi, '&')
            .replace(/\s+/g, ' ')
            .trim();
    }, []);

    // Save current progress to MongoDB Atlas via attemptService
    const saveCurrentProgress = useCallback(async (overrides = {}) => {
        const currentAttId = overrides.attemptId || attemptIdRef.current;
        if (!currentAttId) return;

        const curIndex = overrides.currentIndex !== undefined ? overrides.currentIndex : latestStateRef.current.currentIndex;
        const curAnswers = overrides.selectedAnswers !== undefined ? overrides.selectedAnswers : latestStateRef.current.selectedAnswers;
        const curEvaluated = overrides.evaluatedAnswers !== undefined ? overrides.evaluatedAnswers : latestStateRef.current.evaluatedAnswers;
        const curFlagged = overrides.flaggedQuestions !== undefined ? overrides.flaggedQuestions : latestStateRef.current.flaggedQuestions;
        const curQuestions = overrides.questions || latestStateRef.current.questions;

        let curScore = 0;
        curQuestions.forEach(q => {
            const qId = q.id || q._id;
            const idx = curAnswers[qId];
            if (idx !== undefined) {
                if (curEvaluated?.[qId]?.isCorrect !== undefined) {
                    if (curEvaluated[qId].isCorrect) curScore++;
                } else {
                    let opts = q.options;
                    if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
                    const rawCorrect = String(q.correct_answer || q.correctAnswer || '').trim();
                    if (rawCorrect && normalizeValue(opts[idx]) === normalizeValue(rawCorrect)) curScore++;
                }
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

    // Handle selecting an answer with immediate evaluation, strict answer locking, and authoritative backend persistence
    const handleAnswerSelect = useCallback(async (questionId, optionIndex) => {
        // STRICT SYNCHRONOUS LOCK:
        // If question has already been answered or locked, ignore all repeated taps / clicks immediately!
        if (
            selectedAnswers[questionId] !== undefined ||
            evaluatedAnswers[questionId]?.isLocked
        ) {
            return;
        }

        const targetQ = questions.find(q => (q.id || q._id) === questionId);
        if (!targetQ) return;

        let opts = targetQ.options;
        if (typeof opts === 'string') {
            try { opts = JSON.parse(opts); } catch { opts = []; }
        }
        if (optionIndex < 0 || optionIndex >= opts.length) return;

        // Resolve correct option index from question if available
        const rawCorrect = String(targetQ.correct_answer || targetQ.correctAnswer || '').trim();
        let correctIdx = -1;
        if (rawCorrect) {
            correctIdx = opts.findIndex(o => normalizeValue(o) === normalizeValue(rawCorrect));
            if (correctIdx === -1 && /^[a-d]$/i.test(rawCorrect)) {
                correctIdx = rawCorrect.toUpperCase().charCodeAt(0) - 65;
            }
            if (correctIdx === -1 && /^\d+$/.test(rawCorrect)) {
                correctIdx = parseInt(rawCorrect, 10);
            }
        }

        const isCorrectOptimistic = (correctIdx !== -1) && (optionIndex === correctIdx);
        const correctAnswerText = (correctIdx >= 0 && opts[correctIdx]) ? opts[correctIdx] : rawCorrect;

        // 1. Synchronously lock selection in client state
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));

        if (correctIdx !== -1) {
            setEvaluatedAnswers(prev => ({
                ...prev,
                [questionId]: {
                    selectedOptionIndex: optionIndex,
                    isCorrect: isCorrectOptimistic,
                    isLocked: true,
                    correctOptionIndex: correctIdx,
                    correctAnswer: correctAnswerText,
                    explanation: targetQ.explanation || ''
                }
            }));
        }

        setSaveStatus('saving');

        // 2. Authoritatively validate and persist answer on backend
        const currentAttId = attemptIdRef.current;
        if (currentAttId) {
            try {
                const res = await attemptService.submitAnswer(currentAttId, {
                    questionId,
                    selectedOptionIndex: optionIndex
                });
                if (res && res.success) {
                    setEvaluatedAnswers(prev => ({
                        ...prev,
                        [questionId]: {
                            selectedOptionIndex: res.selectedOptionIndex !== undefined ? res.selectedOptionIndex : optionIndex,
                            isCorrect: res.isCorrect,
                            isLocked: true,
                            correctOptionIndex: res.correctOptionIndex,
                            correctAnswer: res.correctAnswer,
                            explanation: res.explanation || targetQ.explanation || ''
                        }
                    }));
                    setSelectedAnswers(prev => ({
                        ...prev,
                        [questionId]: res.selectedOptionIndex !== undefined ? res.selectedOptionIndex : optionIndex
                    }));
                    if (res.correctAnswer) {
                        setQuestions(prev => prev.map(q =>
                            (q.id || q._id) === questionId
                                ? { ...q, correct_answer: res.correctAnswer, correctAnswer: res.correctAnswer, explanation: res.explanation || q.explanation || '' }
                                : q
                        ));
                    }
                    setSaveStatus('saved');
                } else {
                    setSaveStatus('saved');
                }
            } catch (err) {
                console.warn("Backend answer validation fallback to debounced save:", err);
                if (correctIdx === -1) {
                    setEvaluatedAnswers(prev => ({
                        ...prev,
                        [questionId]: {
                            selectedOptionIndex: optionIndex,
                            isCorrect: false,
                            isLocked: true,
                            correctOptionIndex: -1,
                            correctAnswer: '',
                            explanation: targetQ.explanation || ''
                        }
                    }));
                }
                saveCurrentProgress({
                    selectedAnswers: { ...selectedAnswers, [questionId]: optionIndex }
                });
            }
        } else {
            // Standalone / offline validation fallback
            try {
                const res = await axios.post('/quizzes/validate-answer', {
                    questionId,
                    selectedOptionIndex: optionIndex
                });
                if (res.data?.success) {
                    setEvaluatedAnswers(prev => ({
                        ...prev,
                        [questionId]: {
                            selectedOptionIndex: res.data.selectedOptionIndex !== undefined ? res.data.selectedOptionIndex : optionIndex,
                            isCorrect: res.data.isCorrect,
                            isLocked: true,
                            correctOptionIndex: res.data.correctOptionIndex,
                            correctAnswer: res.data.correctAnswer,
                            explanation: res.data.explanation || targetQ.explanation || ''
                        }
                    }));
                    if (res.data.correctAnswer) {
                        setQuestions(prev => prev.map(q =>
                            (q.id || q._id) === questionId
                                ? { ...q, correct_answer: res.data.correctAnswer, correctAnswer: res.data.correctAnswer, explanation: res.data.explanation || q.explanation || '' }
                                : q
                        ));
                    }
                }
            } catch (err) {
                console.debug('Synchronous answer evaluation error:', err);
                if (correctIdx === -1) {
                    setEvaluatedAnswers(prev => ({
                        ...prev,
                        [questionId]: {
                            selectedOptionIndex: optionIndex,
                            isCorrect: false,
                            isLocked: true,
                            correctOptionIndex: -1,
                            correctAnswer: '',
                            explanation: targetQ.explanation || ''
                        }
                    }));
                }
            }
            setSaveStatus('saved');
        }
    }, [selectedAnswers, evaluatedAnswers, questions, normalizeValue, saveCurrentProgress]);

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

    // Restore attempt state from snapshot and keep all previous answers strictly locked with feedback restored
    const restoreAttempt = useCallback((activeAttempt) => {
        const snapshot = (activeAttempt.questionsSnapshot || []).map(q => ({
            ...q,
            id: q.id || q._id
        }));
        setQuestions(snapshot);
        const safeIndex = Math.min(
            activeAttempt.currentQuestionIndex || 0,
            snapshot.length > 0 ? snapshot.length - 1 : 0
        );
        setCurrentIndex(Math.max(0, safeIndex));
        
        const rawAnswers = activeAttempt.answers || {};
        setSelectedAnswers(rawAnswers);

        // Reconstruct evaluated answers and locked state for all answered questions
        const restoredEvaluated = { ...(activeAttempt.evaluatedAnswers || {}) };
        if (Array.isArray(snapshot)) {
            snapshot.forEach(q => {
                const qId = q.id || q._id;
                if (rawAnswers[qId] !== undefined && !restoredEvaluated[qId]) {
                    const chosenIdx = rawAnswers[qId];
                    let opts = q.options;
                    if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }

                    const rawCorrect = String(q.correct_answer || q.correctAnswer || '').trim();
                    let correctIdx = -1;
                    if (rawCorrect) {
                        correctIdx = opts.findIndex(o => normalizeValue(o) === normalizeValue(rawCorrect));
                        if (correctIdx === -1 && /^[a-d]$/i.test(rawCorrect)) {
                            correctIdx = rawCorrect.toUpperCase().charCodeAt(0) - 65;
                        }
                        if (correctIdx === -1 && /^\d+$/.test(rawCorrect)) {
                            correctIdx = parseInt(rawCorrect, 10);
                        }
                    }

                    const isCorrect = (correctIdx !== -1) && (chosenIdx === correctIdx);
                    restoredEvaluated[qId] = {
                        selectedOptionIndex: chosenIdx,
                        isCorrect,
                        isLocked: true,
                        correctOptionIndex: correctIdx,
                        correctAnswer: (correctIdx >= 0 && opts[correctIdx]) ? opts[correctIdx] : rawCorrect,
                        explanation: q.explanation || ''
                    };
                }
            });
        }
        setEvaluatedAnswers(restoredEvaluated);

        setFlaggedQuestions(new Set(activeAttempt.flaggedQuestions || []));
        setAttemptId(activeAttempt.id);
        attemptIdRef.current = activeAttempt.id;
        setIsResumed(true);
        setSaveStatus('saved');
        toast.info(`Resumed ${selectedCategory}: previously answered questions remain locked (Question ${safeIndex + 1}).`);

        // Enrich any sanitized unanswered questions in snapshot from question bank for instant evaluation
        const hasMissingCorrect = snapshot.some(q => !q.correct_answer && !q.correctAnswer);
        if (hasMissingCorrect && selectedCategory) {
            const url = isAllSessions
                ? `/questions?category=${encodeURIComponent(selectedCategory)}`
                : `/questions?category=${encodeURIComponent(selectedCategory)}&session=${selectedSession}`;
            axios.get(url).then(res => {
                const bankList = Array.isArray(res.data) ? res.data : [];
                if (bankList.length > 0) {
                    const bankMap = new Map();
                    bankList.forEach(bq => bankMap.set(bq.id || bq._id, bq));
                    setQuestions(prev => prev.map(q => {
                        const qId = q.id || q._id;
                        const bq = bankMap.get(qId);
                        if (bq && (!q.correct_answer && !q.correctAnswer)) {
                            return {
                                ...q,
                                correct_answer: bq.correct_answer || bq.correctAnswer,
                                correctAnswer: bq.correctAnswer || bq.correct_answer,
                                explanation: q.explanation || bq.explanation || ''
                            };
                        }
                        return q;
                    }));
                }
            }).catch(() => {});
        }
    }, [selectedCategory, isAllSessions, selectedSession, normalizeValue]);

    // Start fresh quiz from question bank and register new in_progress attempt
    const startFreshQuiz = useCallback(async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const url = isAllSessions 
                ? `/questions?category=${encodeURIComponent(selectedCategory)}`
                : `/questions?category=${encodeURIComponent(selectedCategory)}&session=${selectedSession}`;
            const res = await axios.get(url);
            const rawList = Array.isArray(res.data) ? res.data : [];
            let filtered = rawList.filter(q => {
                return normalizeValue(q.category) === normalizeValue(selectedCategory);
            });

            const currentQuizOpts = quizOptsRef.current;
            if (currentQuizOpts.randomizeQuestions) {
                filtered = [...filtered].sort(() => Math.random() - 0.5);
            }
            if (currentQuizOpts.maxQuestions && currentQuizOpts.maxQuestions > 0 && currentQuizOpts.maxQuestions < 900) {
                filtered = filtered.slice(0, currentQuizOpts.maxQuestions);
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
            setLoadError(err.response?.data?.message || "Unable to load quiz questions. Please check your connection and try again.");
            toast.error("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    }, [isAllSessions, selectedCategory, selectedSession, normalizeValue]);

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
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        const answeredCount = Object.keys(selectedAnswers).length;
        const effectivePassingScore = settings?.passingScore || 70;

        // Authoritative Server-Side Evaluation via /api/quizzes/submit
        let evalResult = null;
        try {
            const submitRes = await axios.post('/quizzes/submit', {
                category: selectedCategory,
                session: isAllSessions ? 1 : selectedSession,
                answers: selectedAnswers,
                attemptId: attemptIdRef.current,
                timeTaken,
                questions: questions
            });
            if (submitRes.data?.success) {
                evalResult = submitRes.data;
            }
        } catch (subErr) {
            console.warn("Primary /quizzes/submit failed, falling back to local computation:", subErr);
        }

        // Local fallback calculation if offline or network failure
        let fallbackScore = 0;
        questions.forEach(q => {
            const qId = q.id || q._id;
            const idx = selectedAnswers[qId];
            if (idx !== undefined) {
                if (evaluatedAnswers?.[qId]?.isCorrect !== undefined) {
                    if (evaluatedAnswers[qId].isCorrect) fallbackScore++;
                } else {
                    let opts = q.options;
                    if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }
                    const rawCorrect = String(q.correct_answer || q.correctAnswer || '').trim();
                    if (rawCorrect && normalizeValue(opts[idx]) === normalizeValue(rawCorrect)) fallbackScore++;
                }
            }
        });
        const fallbackPercentage = questions.length > 0 ? Math.round((fallbackScore / questions.length) * 100) : 0;

        const finalScore = evalResult ? evalResult.score : fallbackScore;
        const finalPercentage = evalResult ? evalResult.percentage : fallbackPercentage;
        const finalPassed = evalResult ? evalResult.passed : (finalPercentage >= effectivePassingScore);

        // 1. Mark attempt as completed in database
        if (attemptIdRef.current) {
            try {
                await attemptService.completeAttempt(attemptIdRef.current, {
                    score: finalScore,
                    totalQuestions: questions.length,
                    answeredCount,
                    progressPercentage: finalPercentage,
                    answers: selectedAnswers
                });
            } catch (attErr) {
                console.warn("Could not mark attempt completed:", attErr);
            }
        }

        setIsSubmitted(true);
        navigate('/quiz/result', {
            state: {
                score: finalScore,
                total: evalResult ? evalResult.total : questions.length,
                percentage: finalPercentage,
                passed: finalPassed,
                passingScore: evalResult?.passingScore || effectivePassingScore,
                isEligibleForCertificate: evalResult?.certificateEligible || (finalPercentage >= (settings?.certificatePassingScore || effectivePassingScore)),
                certificateId: evalResult?.certificateId || null,
                category: selectedCategory,
                session: isAllSessions ? 'All' : selectedSession,
                timeTaken,
            }
        });
    }, [questions, selectedAnswers, evaluatedAnswers, startTime, selectedCategory, selectedSession, isAllSessions, navigate, normalizeValue, settings]);

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

            const isCurrentLocked = selectedAnswers[currentQ.id] !== undefined || evaluatedAnswers[currentQ.id]?.isLocked;

            let opts = currentQ.options;
            if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch { opts = []; } }

            // Select Options: 1, 2, 3, 4 or a, b, c, d (ONLY IF CURRENT QUESTION IS NOT LOCKED)
            if (!isCurrentLocked) {
                if (['1', 'a'].includes(key) && opts.length > 0) {
                    handleAnswerSelect(currentQ.id, 0);
                } else if (['2', 'b'].includes(key) && opts.length > 1) {
                    handleAnswerSelect(currentQ.id, 1);
                } else if (['3', 'c'].includes(key) && opts.length > 2) {
                    handleAnswerSelect(currentQ.id, 2);
                } else if (['4', 'd'].includes(key) && opts.length > 3) {
                    handleAnswerSelect(currentQ.id, 3);
                }
            }

            if (key === 'arrowright' || key === 'enter') {
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

    if (loadError) {
        return (
            <div className="h-screen w-screen bg-[var(--page-bg)] flex items-center justify-center p-4">
                <div className="card p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <AlertCircle size={30} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-[var(--foreground)]">Unable to Load Quiz</h2>
                    <p className="text-xs text-[var(--foreground-muted)]">{loadError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                        <button onClick={startFreshQuiz} className="btn-primary text-xs py-2.5 px-6 inline-flex items-center gap-1.5 cursor-pointer">
                            <RefreshCw size={14} /> Retry
                        </button>
                        <button onClick={() => navigate('/technologies')} className="btn-secondary text-xs py-2.5 px-5 cursor-pointer">
                            Browse Tracks
                        </button>
                    </div>
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

    const isCurrentAnswered = selectedAnswers[currentQ?.id] !== undefined || evaluatedAnswers[currentQ?.id]?.isLocked;
    const currentEvaluation = evaluatedAnswers[currentQ?.id];

    const answeredCount = Object.keys(selectedAnswers).length;
    const flaggedCount = flaggedQuestions.size;
    const isLastQuestion = currentIndex === questions.length - 1;
    const isCurrentFlagged = flaggedQuestions.has(currentQ?.id);
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

    return (
        <div className="min-h-dvh h-dvh w-full overflow-x-hidden overflow-y-hidden flex flex-col bg-[var(--page-bg)] text-[var(--foreground)] select-none relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#193D35]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D19A45]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

            {/* ═══════════════════════════════════════════════════════════
                 1. TOP HEADER (TRACK INFO & PROGRESS)
               ═══════════════════════════════════════════════════════════ */}
            <header className="relative h-14 sm:h-16 shrink-0 border-b border-[var(--card-border)] bg-[var(--nav-bg)] backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between z-20 gap-2">
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
                        className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#D19A45]/40 bg-[#F3E5C5] dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] hover:bg-[#EAD8B0] dark:hover:bg-[#D19A45]/30 hover:border-[#D19A45] font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                        title="Save progress and return to dashboard (Ctrl+S)"
                    >
                        {isSavingAndExiting ? (
                            <Loader2 size={14} className="animate-spin text-[#193D35] dark:text-[#F3E5C5]" />
                        ) : (
                            <BookmarkCheck size={14} className="text-[#193D35] dark:text-[#F3E5C5]" />
                        )}
                        <span className="hidden xs:inline">Save & Exit</span>
                    </button>

                    {/* Theme Toggle */}
                    <ThemeToggle variant="dropdown" />

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

                {/* Mobile & Tablet Progress Bar along bottom edge of header */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 h-1 bg-[var(--muted-bg)] overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#193D35] to-[#42665B] transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                 2. MAIN ASSESSMENT WORKSPACE (UNIFIED SCROLLABLE FLOW)
               ═══════════════════════════════════════════════════════════ */}
            <div className="flex flex-1 min-h-0 relative overflow-hidden">
                <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
                    {/* Unified Scrollable Content Flow: Question -> Feedback Banner -> Answer Options -> Explanation */}
                    <div
                        ref={questionScrollRef}
                        data-testid="quiz-scroll-container"
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-6 lg:px-8 py-4 sm:py-6"
                    >
                        <div className="max-w-3xl lg:max-w-4xl mx-auto w-full flex flex-col gap-3.5 sm:gap-4 pb-2">
                            {/* Step 1: Question Progress & Metadata Row */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[var(--foreground-muted)] flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#193D35] shrink-0" />
                                    <span>Question {currentIndex + 1} of {questions.length}</span>
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-bold text-[var(--foreground-muted)] bg-[var(--muted-bg)] px-2.5 py-0.5 rounded-full border border-[var(--card-border)] shrink-0">
                                    1 Point · Single Choice
                                </span>
                            </div>

                            {/* Step 2: Question Prompt Title Card */}
                            <div
                                data-testid="quiz-question-card"
                                className="w-full p-4 sm:p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] border-l-4 border-l-[#193D35] shadow-xs"
                            >
                                <h2 className="text-sm sm:text-base lg:text-lg font-display font-bold text-[var(--foreground)] leading-snug sm:leading-relaxed whitespace-pre-line break-words">
                                    {currentQ?.question_text || currentQ?.questionText}
                                </h2>
                            </div>

                            {/* Step 3: Separate Answer Feedback Banner (In normal document flow, never overlaps options) */}
                            {isCurrentAnswered && currentEvaluation && (
                                <div
                                    role="status"
                                    aria-live="polite"
                                    data-testid="quiz-feedback-banner"
                                    className={`w-full shrink-0 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border flex items-start sm:items-center gap-3 text-xs sm:text-sm font-bold leading-relaxed shadow-xs transition-colors duration-200 animate-fadeIn ${
                                        currentEvaluation.isCorrect
                                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                                            : 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100'
                                    }`}
                                >
                                    {currentEvaluation.isCorrect ? (
                                        <>
                                            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0 flex-1 break-words">
                                                <span>Correct Answer! You earned 1 point for this question.</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5 sm:mt-0" />
                                            <div className="min-w-0 flex-1 break-words">
                                                <span>Incorrect Answer. The correct answer has been highlighted in green below to help you learn.</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Step 4: Interactive Answer Options Deck (Normal vertical flow, no justify-center clipping) */}
                            <div
                                role="radiogroup"
                                aria-label="Answer options"
                                data-testid="quiz-options-list"
                                className="w-full flex flex-col gap-2.5 sm:gap-3"
                            >
                                {currentOptions?.map((opt, idx) => {
                                    const optionLetter = String.fromCharCode(65 + idx);
                                    const isUserSelection = selectedAnswers[currentQ?.id] === idx;
                                    const evalState = currentEvaluation;
                                    const correctOptionIndex = evalState?.correctOptionIndex;
                                    const isCorrectOption = isCurrentAnswered && correctOptionIndex !== undefined && correctOptionIndex !== -1 && idx === correctOptionIndex;

                                    let cardClasses = 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35] hover:bg-[var(--muted-bg)]/40 cursor-pointer';
                                    let chipClasses = 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground-muted)] group-hover:border-[#193D35] group-hover:text-[var(--foreground)]';
                                    let textClasses = 'text-[var(--foreground)]';
                                    let statusBadge = null;
                                    let trailingIcon = null;

                                    if (!isCurrentAnswered) {
                                        // Unanswered state
                                        if (isUserSelection) {
                                            cardClasses = 'bg-[#F3E5C5]/70 border-2 border-[#193D35] shadow-sm';
                                            chipClasses = 'bg-[#193D35] border-[#193D35] text-[#FCFAF4]';
                                            textClasses = 'font-bold text-[#193D35]';
                                        }
                                    } else if (isUserSelection && evalState?.isCorrect) {
                                        // 1. Selected CORRECT Answer
                                        cardClasses = 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 dark:border-emerald-500 shadow-sm cursor-default';
                                        chipClasses = 'bg-emerald-600 border-emerald-600 text-white';
                                        textClasses = 'font-bold text-emerald-950 dark:text-emerald-100';
                                        trailingIcon = <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
                                        statusBadge = (
                                            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                                <Check size={12} strokeWidth={3} className="shrink-0" />
                                                <span>Correct Answer</span>
                                            </div>
                                        );
                                    } else if (isUserSelection && !evalState?.isCorrect) {
                                        // 2. Selected INCORRECT Answer
                                        cardClasses = 'bg-red-50 dark:bg-red-950/40 border-2 border-red-500 shadow-sm cursor-default';
                                        chipClasses = 'bg-red-500 border-red-500 text-white';
                                        textClasses = 'font-bold text-red-950 dark:text-red-100';
                                        trailingIcon = <XCircle size={22} className="text-red-500 shrink-0" />;
                                        statusBadge = (
                                            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700">
                                                <X size={12} strokeWidth={3} className="shrink-0" />
                                                <span>Incorrect Answer</span>
                                            </div>
                                        );
                                    } else if (isCorrectOption) {
                                        // 3. Actual CORRECT answer revealed after mistake
                                        cardClasses = 'bg-emerald-50/90 dark:bg-emerald-950/35 border-2 border-emerald-600 dark:border-emerald-500 shadow-sm cursor-default';
                                        chipClasses = 'bg-emerald-600 border-emerald-600 text-white';
                                        textClasses = 'font-bold text-emerald-950 dark:text-emerald-100';
                                        trailingIcon = <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
                                        statusBadge = (
                                            <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                                <Check size={12} strokeWidth={3} className="shrink-0" />
                                                <span>Correct Answer</span>
                                            </div>
                                        );
                                    } else {
                                        // 4. Unselected neutral option
                                        cardClasses = 'bg-[var(--card-bg)]/60 border border-[var(--card-border)]/60 opacity-60 cursor-default';
                                        chipClasses = 'bg-[var(--muted-bg)] border-[var(--card-border)] text-[var(--foreground-muted)]';
                                        textClasses = 'text-[var(--foreground-muted)]';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            role="radio"
                                            aria-checked={isUserSelection}
                                            disabled={isCurrentAnswered}
                                            onClick={() => handleAnswerSelect(currentQ.id, idx)}
                                            aria-disabled={isCurrentAnswered}
                                            data-testid={`quiz-option-${idx}`}
                                            className={`w-full shrink-0 group text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center gap-3 sm:gap-3.5 relative ${cardClasses}`}
                                        >
                                            {/* Option Letter Chip */}
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center shrink-0 font-mono font-extrabold text-xs sm:text-sm transition-all duration-200 ${chipClasses}`}>
                                                {optionLetter}
                                            </div>

                                            {/* Option Text and Feedback Badge */}
                                            <div className="flex-1 min-w-0">
                                                <span className={`text-xs sm:text-sm font-medium leading-relaxed block break-words ${textClasses}`}>
                                                    {opt}
                                                </span>
                                                {statusBadge}
                                            </div>

                                            {/* Trailing Icon (Checkmark or Cross) */}
                                            {trailingIcon}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Step 5: Explanation Card */}
                            {isCurrentAnswered && (currentEvaluation?.explanation || currentQ?.explanation) && (
                                <div
                                    data-testid="quiz-explanation-card"
                                    className="w-full p-4 sm:p-5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-1.5 animate-fadeIn"
                                >
                                    <div className="flex items-center gap-2 text-[#193D35] dark:text-[#D19A45] font-display font-bold text-xs uppercase tracking-wider">
                                        <Sparkles size={16} className="shrink-0" />
                                        <span>Explanation</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed break-words whitespace-pre-line">
                                        {currentEvaluation?.explanation || currentQ?.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 6: Bottom Persistent Action Dock */}
                    <div className="shrink-0 border-t border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 z-10">
                        <div className="max-w-3xl lg:max-w-4xl mx-auto w-full flex items-center justify-between gap-2 sm:gap-3">
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
                    </div>
                </main>

                {/* Mobile Backdrop Overlay (only on < lg when open) */}
                {navigatorOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
                        onClick={() => setNavigatorOpen(false)}
                    />
                )}

                {/* Question Navigator Panel */}
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
                                    const evalQ = evaluatedAnswers[q.id];
                                    const flagged = flaggedQuestions.has(q.id);

                                    let btnClasses = 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] hover:border-[#193D35] dark:hover:border-emerald-400 hover:text-[var(--foreground)]';

                                    if (active) {
                                        btnClasses = 'bg-[#193D35] dark:bg-emerald-600 text-white shadow-md ring-2 ring-[#193D35]/50 dark:ring-emerald-500/50 scale-105 font-black';
                                    } else if (answered) {
                                        if (evalQ?.isCorrect) {
                                            btnClasses = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/60';
                                        } else if (evalQ && !evalQ.isCorrect) {
                                            btnClasses = 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-900/60';
                                        } else {
                                            btnClasses = 'bg-[#F3E5C5] dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] border border-[#E2D0A6] dark:border-[#D19A45]/40 hover:bg-[#ebd8b0]';
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleJumpToQuestion(idx)}
                                            className={`relative h-11 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${btnClasses}`}
                                        >
                                            {idx + 1}
                                            {flagged && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D19A45] ring-2 ring-white" />
                                            )}
                                            {answered && !active && (
                                                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                                                    evalQ?.isCorrect ? 'bg-emerald-600' : (evalQ && !evalQ.isCorrect) ? 'bg-red-500' : 'bg-[#193D35]'
                                                }`} />
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
                                <div className="w-3.5 h-3.5 rounded-md bg-[#193D35] dark:bg-emerald-600 ring-1 ring-[#193D35] dark:ring-emerald-500" />
                                <span>Current Question</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 dark:border-emerald-600" />
                                <span>Correct Answer</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-3.5 h-3.5 rounded-md bg-red-100 dark:bg-red-950/60 border border-red-400 dark:border-red-600" />
                                <span>Incorrect Answer</span>
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
                </aside>
            </div>

            {/* Resume Active Attempt Modal */}
            {pendingResumeAttempt && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="card p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-5 shadow-2xl border border-[var(--card-border)]">
                        <div className="w-14 h-14 rounded-2xl bg-[#193D35]/10 text-[#193D35] flex items-center justify-center mx-auto">
                            <PlayCircle size={28} />
                        </div>
                        <div className="text-center space-y-1.5">
                            <h3 className="text-lg font-display font-bold text-[var(--foreground)]">Resume In-Progress Quiz?</h3>
                            <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                                You have an existing unfinished quiz in <strong>{selectedCategory}</strong> ({pendingResumeAttempt.answeredCount || 0} of {pendingResumeAttempt.totalQuestions} questions answered, last saved {formatTimeAgo(pendingResumeAttempt.lastSavedAt)}).
                            </p>
                        </div>
                        <div className="space-y-2.5 pt-2">
                            <button
                                onClick={() => {
                                    const att = pendingResumeAttempt;
                                    setPendingResumeAttempt(null);
                                    restoreAttempt(att);
                                }}
                                className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                                <PlayCircle size={15} /> Resume Quiz (Question {(pendingResumeAttempt.currentQuestionIndex || 0) + 1})
                            </button>
                            <button
                                onClick={async () => {
                                    const oldId = pendingResumeAttempt.id;
                                    setPendingResumeAttempt(null);
                                    if (oldId) {
                                        try {
                                            await attemptService.discardAttempt(oldId);
                                        } catch (err) {
                                            console.debug('Failed to discard attempt:', err);
                                        }
                                    }
                                    await startFreshQuiz();
                                }}
                                className="w-full btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <RotateCcw size={15} /> Discard & Start Over
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Save & Exit Confirmation Modal */}
            {showSaveConfirmModal && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="card p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl border border-[var(--card-border)]">
                        <div className="w-12 h-12 rounded-2xl bg-[#D19A45]/15 text-[#D19A45] flex items-center justify-center mx-auto">
                            <BookmarkCheck size={24} />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Save Progress & Exit?</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Your answers, question index, and evaluated results will be securely saved. You can resume anytime from your dashboard.
                            </p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={() => setShowSaveConfirmModal(false)}
                                className="flex-1 btn-secondary py-2 text-xs font-bold cursor-pointer"
                            >
                                Continue Quiz
                            </button>
                            <button
                                onClick={() => {
                                    setShowSaveConfirmModal(false);
                                    handleSaveAndExit();
                                }}
                                className="flex-1 btn-primary py-2 text-xs font-bold cursor-pointer"
                            >
                                Save & Exit
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Confirm Submit Modal */}
            {showConfirmSubmit && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="card p-6 sm:p-7 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl border border-[var(--card-border)]">
                        <div className="w-12 h-12 rounded-2xl bg-[#193D35]/10 text-[#193D35] flex items-center justify-center mx-auto">
                            <Send size={22} />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Submit Assessment?</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                You have answered <strong className="text-[var(--foreground)]">{answeredCount}</strong> of <strong className="text-[var(--foreground)]">{questions.length}</strong> questions.
                                {questions.length - answeredCount > 0 && (
                                    <span className="block mt-1 text-[#D19A45] font-semibold">
                                        ⚠️ {questions.length - answeredCount} question(s) remain unanswered.
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2.5 pt-2">
                            <button
                                onClick={() => setShowConfirmSubmit(false)}
                                className="flex-1 btn-secondary py-2 text-xs font-bold cursor-pointer"
                            >
                                Review
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmSubmit(false);
                                    handleSubmitQuiz();
                                }}
                                className="flex-1 btn-primary py-2 text-xs font-bold cursor-pointer shadow-md"
                            >
                                Submit Now
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Exit Confirmation Modal */}
            {showExitConfirm && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
                    <div className="card p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl border border-[var(--card-border)]">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                            <AlertCircle size={24} />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Exit Quiz Session?</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Would you like to save your progress to resume later, or discard this attempt?
                            </p>
                        </div>
                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => {
                                    setShowExitConfirm(false);
                                    handleSaveAndExit();
                                }}
                                className="w-full btn-primary py-2 text-xs font-bold cursor-pointer"
                            >
                                Save Progress & Exit
                            </button>
                            <button
                                onClick={() => {
                                    setShowExitConfirm(false);
                                    handleDiscardAndExit();
                                }}
                                className="w-full btn-secondary py-2 text-xs font-bold cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                Discard & Exit
                            </button>
                            <button
                                onClick={() => setShowExitConfirm(false)}
                                className="w-full py-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer"
                            >
                                Cancel
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
