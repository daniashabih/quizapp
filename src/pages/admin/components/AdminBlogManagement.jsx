import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    Check,
    X,
    Sparkles,
    AlertCircle,
    Calendar,
    Clock,
    Tag,
    RefreshCw,
    ExternalLink,
    Filter,
    Flame
} from 'lucide-react';
import { toast } from '../../../services/notificationService';
import blogService from '../../../services/blogService';
import { INITIAL_BLOG_ARTICLES } from '../../../services/blogArticles';

const CATEGORIES = [
    'HTML', 'CSS', 'JavaScript', 'PHP', 'Laravel', 'MySQL',
    'MongoDB', 'Flutter', 'Dart', 'C#', 'Web Development', 'Programming Fundamentals'
];

const GRADIENTS = [
    'gradient-amber', 'gradient-cyan', 'gradient-yellow', 'gradient-indigo',
    'gradient-rose', 'gradient-purple', 'gradient-emerald'
];

export default function AdminBlogManagement() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isSeeding, setIsSeeding] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalArticle, setDeleteModalArticle] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        category: 'Web Development',
        difficulty: 'Beginner',
        readingTimeMinutes: 8,
        excerpt: '',
        content: '',
        tags: '',
        keyTakeaways: '',
        authorName: 'Hangbug Editorial Team',
        authorRole: 'Technical Educators & Full-Stack Developers',
        seoTitle: '',
        seoDescription: '',
        relatedQuizCategory: 'Web Development',
        relatedGameSlug: 'code-puzzle',
        coverGradient: 'gradient-indigo',
        isPublished: true,
        isFeatured: false
    });

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await blogService.adminGetArticles({
                search: searchQuery,
                category: categoryFilter,
                status: statusFilter !== 'all' ? statusFilter : '',
                limit: 100
            });
            if (res?.success && Array.isArray(res.articles)) {
                setArticles(res.articles);
            } else {
                setArticles(INITIAL_BLOG_ARTICLES);
            }
        } catch {
            setArticles(INITIAL_BLOG_ARTICLES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [categoryFilter, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchArticles();
    };

    const handleOpenCreateModal = () => {
        setEditingArticle(null);
        setFormData({
            title: '',
            slug: '',
            category: 'Web Development',
            difficulty: 'Beginner',
            readingTimeMinutes: 8,
            excerpt: '',
            content: '## Introduction\n\nWrite your tutorial content here...\n\n```javascript\n// Code snippet\nconsole.log("Hello, Hangbug!");\n```\n',
            tags: 'Web Development, Programming',
            keyTakeaways: 'Key concept 1\nKey concept 2\nKey concept 3',
            authorName: 'Hangbug Editorial Team',
            authorRole: 'Technical Educators & Full-Stack Developers',
            seoTitle: '',
            seoDescription: '',
            relatedQuizCategory: 'Web Development',
            relatedGameSlug: 'code-puzzle',
            coverGradient: 'gradient-indigo',
            isPublished: true,
            isFeatured: false
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (article) => {
        setEditingArticle(article);
        setFormData({
            title: article.title || '',
            slug: article.slug || '',
            category: article.category || 'Web Development',
            difficulty: article.difficulty || 'Beginner',
            readingTimeMinutes: article.readingTimeMinutes || 8,
            excerpt: article.excerpt || '',
            content: article.content || '',
            tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
            keyTakeaways: Array.isArray(article.keyTakeaways) ? article.keyTakeaways.join('\n') : (article.keyTakeaways || ''),
            authorName: article.authorName || 'Hangbug Editorial Team',
            authorRole: article.authorRole || 'Technical Educators & Full-Stack Developers',
            seoTitle: article.seoTitle || '',
            seoDescription: article.seoDescription || '',
            relatedQuizCategory: article.relatedQuizCategory || article.category || 'Web Development',
            relatedGameSlug: article.relatedGameSlug || 'code-puzzle',
            coverGradient: article.coverGradient || 'gradient-indigo',
            isPublished: article.isPublished !== undefined ? Boolean(article.isPublished) : true,
            isFeatured: Boolean(article.isFeatured)
        });
        setIsModalOpen(true);
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: !editingArticle ? val.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') : prev.slug,
            seoTitle: !editingArticle ? `${val} | Hangbug` : prev.seoTitle
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Article title is required.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                keyTakeaways: formData.keyTakeaways.split('\n').map(k => k.trim()).filter(Boolean),
                readingTimeMinutes: parseInt(formData.readingTimeMinutes, 10) || 8
            };

            if (editingArticle) {
                await blogService.adminUpdateArticle(editingArticle.id || editingArticle.slug, payload);
                toast.success('Article updated successfully.');
            } else {
                await blogService.adminCreateArticle(payload);
                toast.success('Article published successfully.');
            }

            setIsModalOpen(false);
            fetchArticles();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Error saving article.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTogglePublish = async (article) => {
        try {
            const res = await blogService.adminTogglePublish(article.id || article.slug);
            toast.success(res.message || 'Status updated.');
            fetchArticles();
        } catch (err) {
            toast.error('Failed to toggle publish status.');
        }
    };

    const handleDeleteArticle = async () => {
        if (!deleteModalArticle) return;
        try {
            await blogService.adminDeleteArticle(deleteModalArticle.id || deleteModalArticle.slug);
            toast.success('Article deleted.');
            setDeleteModalArticle(null);
            fetchArticles();
        } catch (err) {
            toast.error('Failed to delete article.');
        }
    };

    const handleSeedArticles = async () => {
        if (!window.confirm('Sync default 10 educational tutorials to MongoDB Atlas?')) return;
        setIsSeeding(true);
        try {
            const res = await blogService.adminSeedArticles();
            toast.success(res.message || 'Initial articles synchronized!');
            fetchArticles();
        } catch (err) {
            toast.error('Error synchronizing default articles.');
        } finally {
            setIsSeeding(false);
        }
    };

    // Calculate metrics
    const totalCount = articles.length;
    const publishedCount = articles.filter(a => a.isPublished).length;
    const draftCount = totalCount - publishedCount;
    const totalViews = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Total Articles</p>
                    <p className="text-2xl font-black text-[var(--foreground)]">{totalCount}</p>
                </div>
                <div className="card p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Published</p>
                    <p className="text-2xl font-black text-emerald-500">{publishedCount}</p>
                </div>
                <div className="card p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Drafts</p>
                    <p className="text-2xl font-black text-amber-500">{draftCount}</p>
                </div>
                <div className="card p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-400">Total Views</p>
                    <p className="text-2xl font-black text-[var(--foreground)]">{totalViews.toLocaleString()}</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="card p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title or slug..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#193D35]"
                        />
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="py-2 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#193D35]"
                    >
                        <option value="All">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 px-3 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[#193D35]"
                    >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                    </select>
                </form>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={handleSeedArticles}
                        disabled={isSeeding}
                        className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                    >
                        <RefreshCw size={13} className={isSeeding ? 'animate-spin' : ''} />
                        <span>Sync 10 Articles</span>
                    </button>

                    <button
                        onClick={handleOpenCreateModal}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        <span>New Article</span>
                    </button>
                </div>
            </div>

            {/* Articles Table */}
            <div className="card overflow-hidden rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[var(--foreground)]">
                        <thead className="bg-[var(--muted-bg)]/60 text-[var(--foreground-muted)] font-bold uppercase tracking-wider border-b border-[var(--card-border)]">
                            <tr>
                                <th className="p-4">Article</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Reading Time</th>
                                <th className="p-4">Views</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                                        Loading articles...
                                    </td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-xs text-[var(--foreground-muted)]">
                                        No articles found. Click "New Article" or "Sync 10 Articles" to populate.
                                    </td>
                                </tr>
                            ) : (
                                articles.map(article => (
                                    <tr key={article.id || article.slug} className="hover:bg-[var(--muted-bg)]/30 transition-colors">
                                        <td className="p-4 max-w-sm">
                                            <p className="font-bold text-[var(--foreground)] truncate">{article.title}</p>
                                            <p className="text-[11px] font-mono text-[var(--foreground-muted)] truncate">/blog/{article.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-[#193D35]/30 bg-[#193D35]/10 text-[#193D35] dark:text-emerald-400">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--foreground-muted)]">
                                            {article.readingTimeMinutes || 8} min
                                        </td>
                                        <td className="p-4 font-mono">
                                            {article.viewsCount || 0}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleTogglePublish(article)}
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                                                    article.isPublished
                                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                                                }`}
                                            >
                                                {article.isPublished ? 'Published' : 'Draft'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <a
                                                    href={`/blog/${article.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg border border-[var(--card-border)] hover:border-[#193D35] text-[var(--foreground-muted)] hover:text-[#193D35] transition-colors"
                                                    title="View live article"
                                                >
                                                    <ExternalLink size={13} />
                                                </a>
                                                <button
                                                    onClick={() => handleOpenEditModal(article)}
                                                    className="p-1.5 rounded-lg border border-[var(--card-border)] hover:border-[#193D35] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                                                    title="Edit article"
                                                >
                                                    <Edit2 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalArticle(article)}
                                                    className="p-1.5 rounded-lg border border-[var(--card-border)] hover:border-red-500 text-[var(--foreground-muted)] hover:text-red-500 transition-colors"
                                                    title="Delete article"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-3xl rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)]">
                            <h3 className="text-lg font-black text-[var(--foreground)]">
                                {editingArticle ? 'Edit Blog Article' : 'Create New Educational Article'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] font-mono text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Technology Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value, relatedQuizCategory: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="All Levels">All Levels</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Reading Time (minutes)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={formData.readingTimeMinutes}
                                        onChange={(e) => setFormData({ ...formData, readingTimeMinutes: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-[var(--foreground)]">Excerpt (Meta &amp; Card Summary) *</label>
                                <textarea
                                    required
                                    rows="2"
                                    value={formData.excerpt}
                                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value, seoDescription: formData.seoDescription || e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)] leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-[var(--foreground)]">Article Markdown Content *</label>
                                    <span className="text-[10px] text-[var(--foreground-muted)]">Supports ## Headings and ```code blocks</span>
                                </div>
                                <textarea
                                    required
                                    rows="12"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] font-mono text-xs text-[var(--foreground)] leading-relaxed"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-[var(--foreground)]">Key Takeaways (one per line)</label>
                                <textarea
                                    rows="3"
                                    value={formData.keyTakeaways}
                                    onChange={(e) => setFormData({ ...formData, keyTakeaways: e.target.value })}
                                    placeholder="Takeaway point 1&#10;Takeaway point 2"
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">Related Game Slug</label>
                                    <input
                                        type="text"
                                        value={formData.relatedGameSlug}
                                        onChange={(e) => setFormData({ ...formData, relatedGameSlug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] font-mono text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">SEO Title</label>
                                    <input
                                        type="text"
                                        value={formData.seoTitle}
                                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="font-bold text-[var(--foreground)]">SEO Description</label>
                                    <input
                                        type="text"
                                        value={formData.seoDescription}
                                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-xs text-[var(--foreground)]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer font-bold text-[var(--foreground)]">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="rounded text-[#193D35] focus:ring-[#193D35]"
                                    />
                                    <span>Published (Search Engine Crawlable)</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer font-bold text-[var(--foreground)]">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="rounded text-amber-500 focus:ring-amber-500"
                                    />
                                    <span>Featured Article</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-secondary text-xs py-2 px-4"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="btn-primary text-xs py-2 px-6"
                                >
                                    {isSaving ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 space-y-4 shadow-2xl">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-[var(--foreground)]">Delete Article</h3>
                            <p className="text-xs text-[var(--foreground-muted)]">
                                Are you sure you want to permanently delete <strong>{deleteModalArticle.title}</strong>?
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setDeleteModalArticle(null)}
                                className="btn-secondary text-xs py-2 px-4"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteArticle}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
