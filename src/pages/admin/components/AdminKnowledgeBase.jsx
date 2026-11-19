import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    BookOpen,
    Upload,
    Search,
    RefreshCw,
    Trash2,
    Edit2,
    RotateCcw,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileText,
    Layers,
    Database,
    Eye,
    EyeOff,
    X,
    FileUp,
    Sparkles,
    ScanText,
    ChevronDown
} from 'lucide-react';
import { toast } from '../../../services/notificationService';
import aiVerificationService from '../../../services/aiVerificationService';

const IN_PROGRESS_STATUSES = new Set([
    'Uploaded',
    'Processing',
    'Extracting Text',
    'Generating Embeddings',
    'Indexing'
]);

const STATUS_BADGES = {
    Uploaded: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    Processing: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'Extracting Text': 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    'Generating Embeddings': 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Indexing: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    Completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Failed: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
};

function formatFileSize(bytes = 0) {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminKnowledgeBase({ standalone = false }) {
    const [books, setBooks] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [aiProvider, setAiProvider] = useState(null);
    const [summary, setSummary] = useState({
        totalBooks: 0,
        activeBooks: 0,
        processingBooks: 0,
        failedBooks: 0,
        totalPages: 0,
        totalIndexedChunks: 0
    });

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [techFilter, setTechFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTechnology, setUploadTechnology] = useState('HTML');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Edit Metadata Modal State
    const [editingBook, setEditingBook] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        author: '',
        edition: '',
        description: '',
        publicationYear: '',
        technology: ''
    });

    // Replace File State
    const [replacingBook, setReplacingBook] = useState(null);
    const [replaceFile, setReplaceFile] = useState(null);
    const [replacing, setReplacing] = useState(false);

    // Vector Index Setup
    const [settingUpIndex, setSettingUpIndex] = useState(false);

    const pollIntervalRef = useRef(null);

    const fetchBooks = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await aiVerificationService.listBooks({
                technology: techFilter,
                status: statusFilter,
                search: searchQuery
            });
            if (res?.success) {
                setBooks(Array.isArray(res.books) ? res.books : []);
                if (res.summary) setSummary(res.summary);
                if (Array.isArray(res.technologies)) {
                    setTechnologies(res.technologies);
                    if (res.technologies.length > 0 && !uploadTechnology) {
                        setUploadTechnology(res.technologies[0].name);
                    }
                }
                if (res.aiProvider) setAiProvider(res.aiProvider);
            }
        } catch (err) {
            if (!silent) {
                toast.error(err?.response?.data?.message || 'Failed to load AI Knowledge Base books.');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [techFilter, statusFilter, searchQuery, uploadTechnology]);

    useEffect(() => {
        fetchBooks(false);
    }, [fetchBooks]);

    // Live polling whenever any book is in a background processing state
    useEffect(() => {
        const hasActiveJobs = books.some(b => IN_PROGRESS_STATUSES.has(b.processingStatus));
        if (hasActiveJobs) {
            pollIntervalRef.current = setInterval(() => {
                fetchBooks(true);
            }, 2500);
        } else if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [books, fetchBooks]);

    const handleFileSelect = (file) => {
        if (!file) return;
        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!['pdf', 'docx', 'txt'].includes(ext)) {
            toast.error('Only PDF, DOCX, and TXT files are allowed.');
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File exceeds the 50 MB maximum limit.');
            return;
        }
        setUploadFile(file);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile) return toast.error('Please select a PDF, DOCX, or TXT file.');
        if (!uploadTechnology) {
            return toast.error('Please select a technology/category.');
        }

        setUploading(true);
        setUploadProgress(5);
        try {
            const res = await aiVerificationService.uploadBook({
                file: uploadFile,
                technology: uploadTechnology,
                onProgress: (pct) => setUploadProgress(pct)
            });
            toast.success(res?.message || 'Book uploaded and queued for vector indexing!');
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadProgress(0);
            fetchBooks(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to upload book.');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleBook = async (book) => {
        try {
            const res = await aiVerificationService.toggleBookEnabled(book.id, !book.isEnabled);
            toast.success(res?.message || 'Book status updated.');
            fetchBooks(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to toggle book.');
        }
    };

    const handleRetryBook = async (book) => {
        try {
            const res = await aiVerificationService.retryBookProcessing(book.id);
            toast.info(res?.message || 'Re-processing started.');
            fetchBooks(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to retry processing.');
        }
    };

    const handleDeleteBook = async (book) => {
        if (!window.confirm(`Delete "${book.title}" and all ${book.indexedChunks || 0} indexed chunks permanently?`)) {
            return;
        }
        try {
            const res = await aiVerificationService.deleteBook(book.id);
            toast.success(res?.message || 'Book deleted.');
            fetchBooks(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete book.');
        }
    };

    const openEditModal = (book) => {
        setEditingBook(book);
        setEditForm({
            title: book.title || '',
            author: book.author || '',
            edition: book.edition || '',
            description: book.description || '',
            publicationYear: book.publicationYear ? String(book.publicationYear) : '',
            technology: book.technology || ''
        });
    };

    const handleSaveMetadata = async (e) => {
        e.preventDefault();
        if (!editingBook) return;
        try {
            await aiVerificationService.updateBookMetadata(editingBook.id, {
                ...editForm,
                publicationYear: editForm.publicationYear || null
            });
            toast.success('Book metadata updated.');
            setEditingBook(null);
            fetchBooks(true);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update metadata.');
        }
    };

    const handleReplaceSubmit = async (e) => {
        e.preventDefault();
        if (!replacingBook || !replaceFile) return toast.error('Select a replacement file first.');
        setReplacing(true);
        try {
            const res = await aiVerificationService.replaceBookFile(replacingBook.id, replaceFile);
            toast.success(res?.message || 'Book file replaced.');
            setReplacingBook(null);
            setReplaceFile(null);
            fetchBooks(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to replace book file.');
        } finally {
            setReplacing(false);
        }
    };

    const handleSetupVectorIndex = async () => {
        setSettingUpIndex(true);
        try {
            const res = await aiVerificationService.setupVectorIndex();
            if (res?.success) {
                toast.success(`MongoDB Atlas Vector Search index "${res.indexName}" provisioned!`);
            } else {
                toast.info(res?.message || 'Check MongoDB Atlas Search Indexes UI to verify index creation.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to trigger vector index setup.');
        } finally {
            setSettingUpIndex(false);
        }
    };

    return (
        <div className={`space-y-6 ${standalone ? 'animate-fade-up max-w-7xl mx-auto' : ''}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3E5C5] dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] border border-[#E2D0A6] dark:border-[#D19A45]/40 mb-2">
                        <Sparkles size={12} /> RAG Source of Truth
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">
                        AI Knowledge Base
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                        Upload authoritative reference books (PDF, DOCX, TXT) indexed into MongoDB Atlas Vector Search.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSetupVectorIndex}
                        disabled={settingUpIndex}
                        className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5 cursor-pointer"
                        title="Create or verify MongoDB Atlas Vector Search index"
                    >
                        {settingUpIndex ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                        <span>Sync Vector Index</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fetchBooks(false)}
                        className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <RefreshCw size={14} />
                        <span>Refresh</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        data-testid="upload-book-open-btn"
                        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Upload size={14} />
                        <span>Upload Book</span>
                    </button>
                </div>
            </div>

            {/* AI Provider Readiness Warning Banner */}
            {aiProvider && !aiProvider.configured && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <p className="font-bold">Server AI Provider Key Required for Embeddings & Verification</p>
                        <p>
                            Configure <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono">OPENAI_API_KEY</code> or{' '}
                            <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 font-mono">GEMINI_API_KEY</code> in your server environment variables to generate vector embeddings and run book-grounded verification.
                        </p>
                    </div>
                </div>
            )}

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Total Books', value: summary.totalBooks, icon: BookOpen, color: 'text-[#193D35] dark:text-emerald-400' },
                    { label: 'Active & Ready', value: summary.activeBooks, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Processing', value: summary.processingBooks, icon: Loader2, color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Failed', value: summary.failedBooks, icon: AlertCircle, color: 'text-red-500' },
                    { label: 'Total Pages', value: summary.totalPages, icon: FileText, color: 'text-[#193D35] dark:text-[#F3E5C5]' },
                    { label: 'Vector Chunks', value: summary.totalIndexedChunks, icon: Layers, color: 'text-[#D19A45]' }
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="card p-3.5 rounded-2xl border border-[var(--card-border)]">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{card.label}</span>
                                <Icon size={15} className={card.color} />
                            </div>
                            <p className="text-xl font-display font-extrabold text-[var(--foreground)]">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Filters Bar */}
            <div className="card p-4 rounded-2xl border border-[var(--card-border)] flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search books by title, author, technology, or filename..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#193D35]"
                    />
                </div>
                <select
                    value={techFilter}
                    onChange={(e) => setTechFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)]"
                >
                    <option value="all">All Technologies</option>
                    {technologies.map(t => (
                        <option key={t.normalized} value={t.name}>{t.name}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)]"
                >
                    <option value="all">All Statuses</option>
                    {['Uploaded', 'Processing', 'Extracting Text', 'Generating Embeddings', 'Indexing', 'Completed', 'Failed'].map(st => (
                        <option key={st} value={st}>{st}</option>
                    ))}
                </select>
            </div>

            {/* Books List */}
            {loading ? (
                <div className="card p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <Loader2 size={28} className="animate-spin text-[#193D35] dark:text-[#D19A45]" />
                    <p className="text-xs text-[var(--foreground-muted)]">Loading reference books...</p>
                </div>
            ) : books.length === 0 ? (
                <div className="card p-12 rounded-2xl text-center space-y-3 border border-[var(--card-border)]">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--muted-bg)] flex items-center justify-center mx-auto">
                        <BookOpen size={24} className="text-[var(--foreground-muted)]" />
                    </div>
                    <h3 className="text-base font-display font-bold text-[var(--foreground)]">No Reference Books Uploaded Yet</h3>
                    <p className="text-xs text-[var(--foreground-muted)] max-w-md mx-auto">
                        Upload official textbooks or documentation in PDF, DOCX, or TXT format. Hangbug will extract chapters, pages, and vector embeddings to verify quiz questions accurately.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <Upload size={14} /> Upload Your First Reference Book
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3.5">
                    {books.map(book => {
                        const isProcessing = IN_PROGRESS_STATUSES.has(book.processingStatus);
                        const statusClass = STATUS_BADGES[book.processingStatus] || STATUS_BADGES.Uploaded;
                        return (
                            <div
                                key={book.id}
                                className={`card p-4 sm:p-5 rounded-2xl border transition-all ${
                                    book.isEnabled ? 'border-[var(--card-border)]' : 'border-[var(--card-border)] opacity-70'
                                }`}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                    {/* Left Info */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#193D35] text-white">
                                                {book.technology}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusClass}`}>
                                                {isProcessing && <Loader2 size={11} className="animate-spin" />}
                                                {book.processingStatus}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[var(--muted-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)]">
                                                {book.fileType} · {formatFileSize(book.fileSize)}
                                            </span>
                                            {book.ocrUsed && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                    <ScanText size={11} /> OCR
                                                </span>
                                            )}
                                            {!book.isEnabled && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-sm sm:text-base font-display font-bold text-[var(--foreground)] break-words">
                                                {book.title}
                                            </h3>
                                            {(book.author || book.edition || book.publicationYear) && (
                                                <p className="text-xs text-[var(--foreground-muted)]">
                                                    {book.author ? <>by <strong className="text-[var(--foreground)]">{book.author}</strong></> : null}
                                                    {book.edition ? `${book.author ? ' · ' : ''}${book.edition}` : ''}
                                                    {book.publicationYear ? `${(book.author || book.edition) ? ' · ' : ''}${book.publicationYear}` : ''}
                                                </p>
                                            )}
                                            {book.description && (
                                                <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2">{book.description}</p>
                                            )}
                                        </div>

                                        {/* Processing Progress Bar */}
                                        {isProcessing && (
                                            <div className="space-y-1 max-w-md">
                                                <div className="flex justify-between text-[10px] font-bold text-[var(--foreground-muted)]">
                                                    <span>{book.processingStatus}...</span>
                                                    <span>{book.processingProgress || 0}%</span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-[var(--muted-bg)] overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#193D35] to-[#D19A45] transition-all duration-500"
                                                        style={{ width: `${Math.max(5, book.processingProgress || 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Processing Error Banner */}
                                        {book.processingStatus === 'Failed' && book.processingError && (
                                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                <span className="break-words">{book.processingError}</span>
                                            </div>
                                        )}

                                        {/* Metrics Strip */}
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--foreground-muted)] pt-1">
                                            <span>Pages: <strong className="text-[var(--foreground)]">{book.totalPages || 0}</strong></span>
                                            <span>Extracted Chunks: <strong className="text-[var(--foreground)]">{book.totalChunks || 0}</strong></span>
                                            <span>Indexed Vectors: <strong className="text-emerald-700 dark:text-emerald-400">{book.indexedChunks || 0}</strong></span>
                                            {book.embeddingModel && (
                                                <span>Model: <strong className="font-mono text-[10px]">{book.embeddingModel}</strong></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {book.processingStatus === 'Failed' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRetryBook(book)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                                            >
                                                <RotateCcw size={13} /> Retry
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleBook(book)}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                                book.isEnabled
                                                    ? 'border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30'
                                                    : 'border-[var(--card-border)] text-[var(--foreground-muted)] bg-[var(--muted-bg)]'
                                            }`}
                                            title={book.isEnabled ? 'Disable book from AI search' : 'Enable book for AI search'}
                                        >
                                            {book.isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
                                            <span>{book.isEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReplacingBook(book)}
                                            className="p-2 rounded-xl border border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[#193D35] hover:bg-[var(--muted-bg)] cursor-pointer"
                                            title="Replace book file"
                                        >
                                            <FileUp size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(book)}
                                            className="p-2 rounded-xl border border-[var(--card-border)] text-[var(--foreground-muted)] hover:text-[#193D35] hover:bg-[var(--muted-bg)] cursor-pointer"
                                            title="Edit book metadata"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteBook(book)}
                                            className="p-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-500/10 cursor-pointer"
                                            title="Delete book"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Reference Book Modal (Portaled to document.body for full-viewport backdrop) */}
            {showUploadModal && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => !uploading && setShowUploadModal(false)}
                >
                    <div
                        className="card w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                                    Upload Reference Book
                                </h3>
                                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                                    PDF (standard or scanned OCR), DOCX, or TXT up to 50 MB
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => setShowUploadModal(false)}
                                aria-label="Close modal"
                                className="p-1.5 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted-bg)] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="p-6 space-y-5 overflow-y-auto">
                            {/* File Drop Area */}
                            <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
                                    Reference Book File *
                                </label>
                                <label
                                    className={`block p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
                                        uploading
                                            ? 'border-[var(--card-border)] bg-[var(--muted-bg)]/40 opacity-80 cursor-not-allowed'
                                            : uploadFile
                                                ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer'
                                                : 'border-[var(--card-border)] hover:border-[#193D35] bg-[var(--muted-bg)]/50 cursor-pointer'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        disabled={uploading}
                                        accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        className="hidden"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0])}
                                    />
                                    <div className="w-11 h-11 rounded-2xl bg-[#193D35]/10 dark:bg-[#D19A45]/15 flex items-center justify-center mx-auto mb-3">
                                        {uploadFile ? (
                                            <FileText size={22} className="text-emerald-700 dark:text-emerald-400" />
                                        ) : (
                                            <Upload size={22} className="text-[#193D35] dark:text-[#D19A45]" />
                                        )}
                                    </div>
                                    {uploadFile ? (
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-bold text-[var(--foreground)] break-all px-2">
                                                {uploadFile.name}
                                            </p>
                                            <div className="inline-flex items-center gap-2 text-xs">
                                                <span className="px-2 py-0.5 rounded-md font-mono font-bold uppercase text-[10px] bg-[#193D35] text-white">
                                                    {(uploadFile.name.split('.').pop() || 'file').toUpperCase()}
                                                </span>
                                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                                    {formatFileSize(uploadFile.size)} · Ready to upload
                                                </span>
                                            </div>
                                            {!uploading && (
                                                <p className="text-[11px] text-[var(--foreground-muted)] pt-0.5">
                                                    Click anywhere here to choose a different file
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-[var(--foreground)]">
                                                Click to choose PDF, DOCX, or TXT file
                                            </p>
                                            <p className="text-xs text-[var(--foreground-muted)]">
                                                Scanned PDFs automatically trigger OCR processing
                                            </p>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Technology / Category Selector */}
                            <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider mb-1.5">
                                    Technology / Category *
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        disabled={uploading}
                                        value={uploadTechnology}
                                        onChange={(e) => setUploadTechnology(e.target.value)}
                                        className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-sm font-medium text-[var(--foreground)] focus:outline-none focus:border-[#193D35] focus:ring-2 focus:ring-[#193D35]/15 disabled:opacity-60 cursor-pointer"
                                    >
                                        {technologies.map(t => (
                                            <option key={t.normalized} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
                                    />
                                </div>
                            </div>

                            {/* Upload Progress */}
                            {uploading && (
                                <div className="p-3.5 rounded-2xl bg-[var(--muted-bg)]/70 border border-[var(--card-border)] space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-[#193D35] dark:text-[#F3E5C5]">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Loader2 size={13} className="animate-spin text-[#D19A45]" />
                                            <span>Uploading securely...</span>
                                        </span>
                                        <span className="font-mono">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-[var(--card-border)]/70 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#193D35] to-[#D19A45] transition-all duration-300"
                                            style={{ width: `${Math.max(4, uploadProgress)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--card-border)]/70">
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => setShowUploadModal(false)}
                                    className="btn-secondary text-xs sm:text-sm py-2.5 px-4 disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading || !uploadFile}
                                    className="btn-primary text-xs sm:text-sm py-2.5 px-5 inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                                >
                                    {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                    <span>{uploading ? 'Uploading...' : 'Upload & Index Book'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit Metadata Modal (Portaled to document.body) */}
            {editingBook && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setEditingBook(null)}
                >
                    <div
                        className="card w-full max-w-lg rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Edit Book Metadata</h3>
                            <button type="button" onClick={() => setEditingBook(null)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)] cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveMetadata} className="p-6 space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.title}
                                    onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Author</label>
                                    <input
                                        type="text"
                                        value={editForm.author}
                                        onChange={(e) => setEditForm(f => ({ ...f, author: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Technology</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.technology}
                                            onChange={(e) => setEditForm(f => ({ ...f, technology: e.target.value }))}
                                            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        >
                                            {technologies.map(t => (
                                                <option key={t.normalized} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Edition</label>
                                    <input
                                        type="text"
                                        value={editForm.edition}
                                        onChange={(e) => setEditForm(f => ({ ...f, edition: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Year</label>
                                    <input
                                        type="number"
                                        value={editForm.publicationYear}
                                        onChange={(e) => setEditForm(f => ({ ...f, publicationYear: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[var(--foreground-muted)] uppercase mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setEditingBook(null)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                                <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Replace Book File Modal (Portaled to document.body) */}
            {replacingBook && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => !replacing && setReplacingBook(null)}
                >
                    <div
                        className="card w-full max-w-md rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between">
                            <h3 className="text-base font-display font-bold text-[var(--foreground)]">Replace Book File</h3>
                            <button type="button" disabled={replacing} onClick={() => setReplacingBook(null)} className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--muted-bg)] cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleReplaceSubmit} className="p-6 space-y-4">
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Replacing <strong className="text-[var(--foreground)]">{replacingBook.title}</strong>. If the new file has identical content, existing embeddings will be preserved automatically.
                            </p>
                            <input
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                                className="w-full text-xs text-[var(--foreground)]"
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" disabled={replacing} onClick={() => setReplacingBook(null)} className="btn-secondary text-xs py-2 px-4 cursor-pointer">Cancel</button>
                                <button type="submit" disabled={replacing || !replaceFile} className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5 cursor-pointer">
                                    {replacing && <Loader2 size={13} className="animate-spin" />}
                                    <span>Replace & Index</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
