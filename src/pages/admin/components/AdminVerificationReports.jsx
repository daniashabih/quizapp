import { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    FileQuestion,
    Search,
    RefreshCw,
    BookOpen,
    History,
    Check,
    X,
    Trash2,
    Loader2,
    ShieldCheck,
    FileCheck2
} from 'lucide-react';
import { toast } from '../../../services/notificationService';
import aiVerificationService from '../../../services/aiVerificationService';

const STATUS_CONFIG = {
    verified: {
        label: 'Verified',
        badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
    },
    incorrect: {
        label: 'Incorrect Answer Detected',
        badge: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
    },
    ambiguous: {
        label: 'Ambiguous Question',
        badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
    },
    insufficient_evidence: {
        label: 'Insufficient Book Evidence',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
    }
};

export default function AdminVerificationReports({ standalone = false }) {
    const [activeView, setActiveView] = useState('reports'); // 'reports' | 'history'
    const [reports, setReports] = useState([]);
    const [history, setHistory] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [stats, setStats] = useState({
        totalVerified: 0,
        confirmedCorrect: 0,
        incorrectDetected: 0,
        ambiguousCount: 0,
        insufficientEvidenceCount: 0,
        pendingReviewCount: 0
    });

    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');
    const [reviewFilter, setReviewFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Review & Approval Modal
    const [reviewingReport, setReviewingReport] = useState(null);
    const [selectedCorrectedAnswer, setSelectedCorrectedAnswer] = useState('');
    const [correctedExplanation, setCorrectedExplanation] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [submittingApproval, setSubmittingApproval] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const [repRes, histRes] = await Promise.all([
                aiVerificationService.getVerificationReports({
                    status: statusFilter,
                    technology: techFilter,
                    reviewStatus: reviewFilter,
                    search: searchQuery
                }),
                aiVerificationService.getCorrectionHistory()
            ]);

            if (repRes?.success) {
                setReports(Array.isArray(repRes.reports) ? repRes.reports : []);
                if (repRes.stats) setStats(repRes.stats);
                if (Array.isArray(repRes.technologies)) setTechnologies(repRes.technologies);
            }
            if (histRes?.success) {
                setHistory(Array.isArray(histRes.history) ? histRes.history : []);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load AI Verification Reports.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, techFilter, reviewFilter, searchQuery]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const openReviewModal = (report) => {
        setReviewingReport(report);
        setSelectedCorrectedAnswer(report.verifiedCorrectAnswer || report.originalCorrectAnswer || '');
        setCorrectedExplanation(report.explanation || '');
        setAdminNotes('');
    };

    const handleApproveCorrection = async (e) => {
        e.preventDefault();
        if (!reviewingReport) return;
        if (!selectedCorrectedAnswer) {
            return toast.error('Please select the corrected answer from the question options.');
        }
        setSubmittingApproval(true);
        try {
            const res = await aiVerificationService.approveReportCorrection(reviewingReport.id, {
                correctedAnswer: selectedCorrectedAnswer,
                correctedExplanation,
                notes: adminNotes
            });
            toast.success(res?.message || 'Correction approved and question database updated!');
            setReviewingReport(null);
            fetchReports();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to approve correction.');
        } finally {
            setSubmittingApproval(false);
        }
    };

    const handleDismiss = async (report) => {
        try {
            await aiVerificationService.dismissReport(report.id, 'Dismissed by administrator.');
            toast.info('Report dismissed.');
            if (reviewingReport?.id === report.id) setReviewingReport(null);
            fetchReports();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to dismiss report.');
        }
    };

    const handleDeleteReport = async (report) => {
        if (!window.confirm('Remove this verification record from cache?')) return;
        try {
            await aiVerificationService.deleteReport(report.id);
            toast.success('Verification record deleted.');
            fetchReports();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete record.');
        }
    };

    return (
        <div className={`space-y-6 ${standalone ? 'animate-fade-up max-w-7xl mx-auto' : ''}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3E5C5] dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] border border-[#E2D0A6] dark:border-[#D19A45]/40 mb-2">
                        <ShieldCheck size={12} /> Quality Assurance & Editorial Control
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">
                        AI Verification Reports
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                        Review book-backed AI findings. Quiz database answers are never altered until an admin approves the correction.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[var(--muted-bg)] p-1 rounded-xl border border-[var(--card-border)]">
                        <button
                            type="button"
                            onClick={() => setActiveView('reports')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === 'reports' ? 'bg-[#193D35] text-white' : 'text-[var(--foreground-muted)]'
                            }`}
                        >
                            <FileCheck2 size={13} /> Reports ({stats.totalVerified})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView('history')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                activeView === 'history' ? 'bg-[#193D35] text-white' : 'text-[var(--foreground-muted)]'
                            }`}
                        >
                            <History size={13} /> History ({history.length})
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={fetchReports}
                        className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                    { label: 'Total Verified', value: stats.totalVerified, icon: ShieldCheck, color: 'text-[#193D35] dark:text-emerald-400', filter: 'all' },
                    { label: 'Confirmed Correct', value: stats.confirmedCorrect, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', filter: 'verified' },
                    { label: 'Incorrect Detected', value: stats.incorrectDetected, icon: AlertTriangle, color: 'text-red-500', filter: 'incorrect' },
                    { label: 'Ambiguous', value: stats.ambiguousCount, icon: HelpCircle, color: 'text-amber-600 dark:text-amber-400', filter: 'ambiguous' },
                    { label: 'Insufficient Evidence', value: stats.insufficientEvidenceCount, icon: FileQuestion, color: 'text-slate-500', filter: 'insufficient_evidence' }
                ].map(kpi => {
                    const Icon = kpi.icon;
                    const active = activeView === 'reports' && statusFilter === kpi.filter;
                    return (
                        <button
                            type="button"
                            key={kpi.label}
                            onClick={() => { setActiveView('reports'); setStatusFilter(kpi.filter); }}
                            className={`card p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                                active ? 'border-[#193D35] ring-2 ring-[#193D35]/20' : 'border-[var(--card-border)] hover:border-[#193D35]/40'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{kpi.label}</span>
                                <Icon size={15} className={kpi.color} />
                            </div>
                            <p className="text-2xl font-display font-extrabold text-[var(--foreground)]">{kpi.value}</p>
                        </button>
                    );
                })}
            </div>

            {activeView === 'reports' ? (
                <>
                    {/* Filter Controls */}
                    <div className="card p-4 rounded-2xl border border-[var(--card-border)] flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search question text, book title, or technology..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)]"
                        >
                            <option value="all">All Verification Statuses</option>
                            <option value="incorrect">Incorrect Answer Detected</option>
                            <option value="ambiguous">Ambiguous Question</option>
                            <option value="verified">Verified</option>
                            <option value="insufficient_evidence">Insufficient Book Evidence</option>
                        </select>
                        <select
                            value={techFilter}
                            onChange={(e) => setTechFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)]"
                        >
                            <option value="all">All Technologies</option>
                            {technologies.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <select
                            value={reviewFilter}
                            onChange={(e) => setReviewFilter(e.target.value)}
                            className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)]"
                        >
                            <option value="all">All Review States</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="card p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
                            <Loader2 size={26} className="animate-spin text-[#193D35] dark:text-[#D19A45]" />
                            <p className="text-xs text-[var(--foreground-muted)]">Loading AI verification reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="card p-12 rounded-2xl text-center space-y-2 border border-[var(--card-border)]">
                            <ShieldCheck size={28} className="mx-auto text-[var(--foreground-muted)]" />
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">No Verification Reports Match Your Filters</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Reports appear automatically whenever users or admins click "Verify with AI" on quiz questions.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map(report => {
                                const cfg = STATUS_CONFIG[report.verificationStatus] || STATUS_CONFIG.insufficient_evidence;
                                const canApprove = report.verificationStatus === 'incorrect' || report.verificationStatus === 'ambiguous';
                                return (
                                    <div key={report.id} className="card p-4 sm:p-5 rounded-2xl border border-[var(--card-border)] space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#193D35] text-white">
                                                    {report.technology}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
                                                    {cfg.label}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                                    report.reviewStatus === 'approved'
                                                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                                        : report.reviewStatus === 'dismissed'
                                                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                            : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                                                }`}>
                                                    Review: {report.reviewStatus}
                                                </span>
                                                <span className="text-[10px] text-[var(--foreground-muted)] font-mono">
                                                    Confidence: {Math.round((report.confidence || 0) * 100)}% · Requests: {report.requestCount || 1}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {canApprove && report.reviewStatus !== 'approved' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openReviewModal(report)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#193D35] hover:bg-[#14312a] text-white cursor-pointer"
                                                    >
                                                        <Check size={13} /> Review & Approve
                                                    </button>
                                                )}
                                                {report.reviewStatus === 'pending' && canApprove && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDismiss(report)}
                                                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-[var(--card-border)] text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)] cursor-pointer"
                                                    >
                                                        Dismiss
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteReport(report)}
                                                    className="p-1.5 rounded-xl text-red-500 hover:bg-red-500/10 cursor-pointer"
                                                    title="Remove cached report"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm font-bold text-[var(--foreground)] break-words">
                                            {report.questionText}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                            <div className="p-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)]">
                                                <span className="block text-[10px] font-bold uppercase text-[var(--foreground-muted)]">Stored DB Answer</span>
                                                <span className="font-bold text-[var(--foreground)] break-words">{report.originalCorrectAnswer || '—'}</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                                                <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Book-Verified Answer</span>
                                                <span className="font-bold text-emerald-900 dark:text-emerald-200 break-words">
                                                    {report.verifiedCorrectAnswer || 'Insufficient evidence'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed whitespace-pre-line">
                                            {report.explanation}
                                        </p>

                                        {report.sourceBook && (
                                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--foreground-muted)] pt-2 border-t border-[var(--card-border)]/70">
                                                <BookOpen size={12} className="text-[#193D35] dark:text-[#D19A45]" />
                                                <strong className="text-[var(--foreground)]">{report.sourceBook}</strong>
                                                {report.sourceAuthor && <span>({report.sourceAuthor})</span>}
                                                {report.sourceChapter && <span>· {report.sourceChapter}</span>}
                                                {report.sourcePage && <span>· Page {report.sourcePage}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* Correction Approval Audit History */
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="card p-12 rounded-2xl text-center space-y-2 border border-[var(--card-border)]">
                            <History size={28} className="mx-auto text-[var(--foreground-muted)]" />
                            <h3 className="text-sm font-display font-bold text-[var(--foreground)]">No Approved Corrections Yet</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Every time an administrator approves a suggested answer correction, the previous and updated values are archived here.
                            </p>
                        </div>
                    ) : (
                        history.map(item => (
                            <div key={item.id} className="card p-4 sm:p-5 rounded-2xl border border-[var(--card-border)] space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#193D35] text-white">
                                            {item.technology}
                                        </span>
                                        <span className="text-[var(--foreground-muted)]">
                                            Approved by <strong className="text-[var(--foreground)]">{item.approvedBy}</strong>
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-[var(--foreground-muted)]">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-sm font-bold text-[var(--foreground)]">{item.questionText}</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                    <div className="p-2.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
                                        <span className="block text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Previous Answer</span>
                                        <span className="font-semibold line-through text-red-800 dark:text-red-200">{item.previousCorrectAnswer}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800">
                                        <span className="block text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Approved New Answer</span>
                                        <span className="font-bold text-emerald-900 dark:text-emerald-200">{item.newCorrectAnswer}</span>
                                    </div>
                                </div>

                                {(item.sourceBook || item.notes) && (
                                    <div className="text-[11px] text-[var(--foreground-muted)] flex flex-wrap gap-3 pt-1">
                                        {item.sourceBook && (
                                            <span>Source: <strong>{item.sourceBook}</strong> {item.sourcePage ? `(Page ${item.sourcePage})` : ''}</span>
                                        )}
                                        {item.notes && <span>Notes: {item.notes}</span>}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Admin Correction Review & Approval Modal */}
            {reviewingReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
                    <div className="card w-full max-w-2xl rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-display font-bold text-[var(--foreground)]">Approve AI Correction</h3>
                                <p className="text-xs text-[var(--foreground-muted)]">Confirm the authoritative answer before updating MongoDB</p>
                            </div>
                            <button type="button" onClick={() => setReviewingReport(null)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleApproveCorrection} className="p-6 space-y-4 overflow-y-auto">
                            <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)] border border-[var(--card-border)] space-y-1">
                                <span className="text-[10px] font-bold uppercase text-[var(--foreground-muted)]">{reviewingReport.technology} Question</span>
                                <p className="text-sm font-bold text-[var(--foreground)]">{reviewingReport.questionText}</p>
                            </div>

                            {reviewingReport.supportingExcerpt && (
                                <blockquote className="p-3.5 rounded-2xl bg-[#F3E5C5]/35 dark:bg-[#D19A45]/10 border-l-4 border-l-[#D19A45] text-xs space-y-1">
                                    <p className="font-bold text-[#193D35] dark:text-[#F3E5C5]">
                                        Book Evidence: {reviewingReport.sourceBook} — {reviewingReport.sourceChapter} (Page {reviewingReport.sourcePage})
                                    </p>
                                    <p className="italic text-[var(--foreground)]">“{reviewingReport.supportingExcerpt}”</p>
                                </blockquote>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1.5">
                                    Select Approved Correct Answer *
                                </label>
                                <div className="space-y-2">
                                    {(reviewingReport.options || []).map((opt, idx) => {
                                        const isSelected = selectedCorrectedAnswer === opt;
                                        const isOriginal = reviewingReport.originalCorrectAnswer === opt;
                                        const isAiSuggested = reviewingReport.verifiedCorrectAnswer === opt;
                                        return (
                                            <label
                                                key={idx}
                                                className={`flex items-center justify-between gap-2 p-3 rounded-xl border cursor-pointer text-xs ${
                                                    isSelected
                                                        ? 'border-[#193D35] bg-emerald-50/70 dark:bg-emerald-950/30 font-bold'
                                                        : 'border-[var(--card-border)] bg-[var(--muted-bg)]/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="radio"
                                                        name="correctedAnswer"
                                                        checked={isSelected}
                                                        onChange={() => setSelectedCorrectedAnswer(opt)}
                                                    />
                                                    <span>{opt}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {isOriginal && <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-semibold">Current DB</span>}
                                                    {isAiSuggested && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-semibold">Book Verified</span>}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">
                                    Updated Question Explanation
                                </label>
                                <textarea
                                    rows={3}
                                    value={correctedExplanation}
                                    onChange={(e) => setCorrectedExplanation(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">
                                    Admin Audit Notes (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="e.g. Verified against Chapter 3, Page 42"
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setReviewingReport(null)}
                                    className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingApproval}
                                    className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                    {submittingApproval ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    <span>Approve & Update Question</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
