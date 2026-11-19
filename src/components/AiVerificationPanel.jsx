import { useState } from 'react';
import {
    Sparkles,
    BookOpen,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    FileQuestion,
    ChevronDown,
    ChevronUp,
    Loader2,
    RefreshCw,
    Quote
} from 'lucide-react';
import aiVerificationService from '../services/aiVerificationService';

const STATUS_META = {
    verified: {
        label: 'Verified',
        icon: CheckCircle2,
        badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        borderClass: 'border-emerald-300/80 dark:border-emerald-800/70',
        iconClass: 'text-emerald-600 dark:text-emerald-400'
    },
    incorrect: {
        label: 'Incorrect Answer Detected',
        icon: AlertTriangle,
        badgeClass: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
        borderClass: 'border-red-300/80 dark:border-red-800/70',
        iconClass: 'text-red-600 dark:text-red-400'
    },
    ambiguous: {
        label: 'Ambiguous Question',
        icon: HelpCircle,
        badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
        borderClass: 'border-amber-300/80 dark:border-amber-800/70',
        iconClass: 'text-amber-600 dark:text-amber-400'
    },
    insufficient_evidence: {
        label: 'Insufficient Book Evidence',
        icon: FileQuestion,
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        borderClass: 'border-[var(--card-border)]',
        iconClass: 'text-slate-500 dark:text-slate-400'
    }
};

export default function AiVerificationPanel({
    questionId,
    questionText,
    options = [],
    correctAnswer = '',
    technology = '',
    userSelectedAnswer = '',
    cachedResult = null,
    onVerified
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(cachedResult);
    const [isReferenceOpen, setIsReferenceOpen] = useState(false);

    // Sync local result when parent switches questions
    const activeResult = cachedResult || result;

    const handleVerify = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const response = await aiVerificationService.verifyQuestion({
                questionId,
                questionText,
                options,
                correctAnswer,
                technology,
                userSelectedAnswer
            });
            if (response?.success && response?.verification) {
                const payload = {
                    ...response.verification,
                    _cached: Boolean(response.cached)
                };
                setResult(payload);
                if (onVerified) onVerified(questionId, payload);
            } else {
                setError(response?.message || 'Could not verify this question.');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Unable to verify with AI right now.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const statusKey = activeResult?.verification_status || 'insufficient_evidence';
    const statusInfo = STATUS_META[statusKey] || STATUS_META.insufficient_evidence;
    const StatusIcon = statusInfo.icon;

    return (
        <div
            data-testid="ai-verification-panel"
            className="w-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden transition-all"
        >
            {/* Action Header Row */}
            <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-[var(--muted-bg)]/50 border-b border-[var(--card-border)]/70">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#193D35] text-[#F3E5C5] flex items-center justify-center shrink-0">
                        <BookOpen size={14} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-display font-bold text-[var(--foreground)] truncate">
                            AI Book-Based Verification
                        </p>
                        <p className="text-[10px] text-[var(--foreground-muted)] truncate">
                            Grounded in Hangbug reference books ({technology || 'Technology'})
                        </p>
                    </div>
                </div>

                {!activeResult ? (
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={loading}
                        data-testid="verify-with-ai-btn"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#193D35] hover:bg-[#14312a] text-[#FCFAF4] shadow-xs transition-all disabled:opacity-60 cursor-pointer shrink-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={13} className="animate-spin text-[#D19A45]" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={13} className="text-[#D19A45]" />
                                <span>Verify with AI</span>
                            </>
                        )}
                    </button>
                ) : (
                    <span
                        data-testid="ai-verification-status-badge"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}
                    >
                        <StatusIcon size={13} className={statusInfo.iconClass} />
                        <span>{statusInfo.label}</span>
                    </span>
                )}
            </div>

            {/* Loading Skeleton */}
            {loading && (
                <div className="p-4 space-y-2.5 animate-pulse" data-testid="ai-verification-loading">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#193D35] dark:text-[#D19A45]">
                        <Loader2 size={14} className="animate-spin shrink-0" />
                        <span>Searching uploaded reference books & checking answer accuracy...</span>
                    </div>
                    <div className="h-3 bg-[var(--muted-bg)] rounded-full w-11/12" />
                    <div className="h-3 bg-[var(--muted-bg)] rounded-full w-4/5" />
                    <div className="h-3 bg-[var(--muted-bg)] rounded-full w-2/3" />
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-red-50/60 dark:bg-red-950/20">
                    <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300 flex-1 min-w-0">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <span className="break-words">{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleVerify}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 hover:bg-red-100/60 cursor-pointer"
                    >
                        <RefreshCw size={12} />
                        <span>Retry</span>
                    </button>
                </div>
            )}

            {/* Verification Result Body */}
            {!loading && activeResult && (
                <div className={`p-4 space-y-3 border-t ${statusInfo.borderClass}`}>
                    {/* Verified Answer Highlight */}
                    {activeResult.verified_correct_answer && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-[var(--muted-bg)]/70 border border-[var(--card-border)]">
                            <div className="flex-1 min-w-0">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                    {statusKey === 'incorrect' ? 'Book-Verified Correct Answer' : 'Verified Answer'}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-[#193D35] dark:text-emerald-300 break-words">
                                    {activeResult.verified_correct_answer}
                                </span>
                            </div>

                            {statusKey === 'incorrect' && activeResult.original_correct_answer && (
                                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-[var(--card-border)] pt-2 sm:pt-0 sm:pl-3">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                                        Stored Quiz Answer
                                    </span>
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-300 line-through break-words">
                                        {activeResult.original_correct_answer}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3-4 Line Beginner-Friendly Explanation */}
                    <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line break-words">
                            {activeResult.explanation}
                        </p>
                    </div>

                    {/* Issue Note when Incorrect or Ambiguous */}
                    {(statusKey === 'incorrect' || statusKey === 'ambiguous') && activeResult.issue_description && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200">
                            <strong className="font-bold">Flagged for Admin Review: </strong>
                            {activeResult.issue_description}
                        </div>
                    )}

                    {/* Reference Book Citation Metadata */}
                    {activeResult.source_book && (
                        <div className="pt-2 border-t border-[var(--card-border)]/70 flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--foreground-muted)]">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                                    <span className="inline-flex items-center gap-1 font-bold text-[var(--foreground)]">
                                        <BookOpen size={12} className="text-[#193D35] dark:text-[#D19A45] shrink-0" />
                                        <span className="break-words">{activeResult.source_book}</span>
                                    </span>
                                    {activeResult.source_author && (
                                        <span>by {activeResult.source_author}</span>
                                    )}
                                    {activeResult.source_chapter && (
                                        <span className="px-2 py-0.5 rounded-md bg-[var(--muted-bg)] border border-[var(--card-border)] font-medium">
                                            {activeResult.source_chapter}
                                        </span>
                                    )}
                                    {activeResult.source_page && (
                                        <span className="px-2 py-0.5 rounded-md bg-[#F3E5C5]/70 dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] font-mono font-bold">
                                            Page {activeResult.source_page}
                                        </span>
                                    )}
                                </div>

                                {activeResult.supporting_excerpt && (
                                    <button
                                        type="button"
                                        onClick={() => setIsReferenceOpen(prev => !prev)}
                                        data-testid="toggle-book-reference-btn"
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#193D35] dark:text-[#D19A45] hover:underline cursor-pointer shrink-0"
                                    >
                                        <Quote size={12} />
                                        <span>View Book Reference</span>
                                        {isReferenceOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                )}
                            </div>

                            {/* Expandable Supporting Excerpt */}
                            {isReferenceOpen && activeResult.supporting_excerpt && (
                                <blockquote
                                    data-testid="book-reference-excerpt"
                                    className="p-3 rounded-xl bg-[var(--muted-bg)]/80 border-l-4 border-l-[#D19A45] border border-[var(--card-border)] text-xs text-[var(--foreground)] italic leading-relaxed break-words"
                                >
                                    “{activeResult.supporting_excerpt}”
                                </blockquote>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
