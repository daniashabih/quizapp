import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    BookOpen,
    Search,
    Clock,
    Calendar,
    ArrowRight,
    Sparkles,
    Tag,
    X,
    Filter,
    Flame,
    ChevronLeft,
    ChevronRight,
    Code2,
    Gamepad2,
    GraduationCap,
    CheckCircle2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';
import blogService from '../../services/blogService';
import { INITIAL_BLOG_ARTICLES } from '../../services/blogArticles';

const GRADIENT_MAP = {
    'gradient-amber': 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-400',
    'gradient-cyan': 'from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30 text-cyan-400',
    'gradient-yellow': 'from-yellow-500/20 via-amber-500/10 to-transparent border-yellow-500/30 text-yellow-400',
    'gradient-indigo': 'from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/30 text-indigo-400',
    'gradient-rose': 'from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30 text-rose-400',
    'gradient-purple': 'from-purple-500/20 via-violet-500/10 to-transparent border-purple-500/30 text-purple-400',
    'gradient-emerald': 'from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30 text-emerald-400'
};

const CATEGORY_COLORS = {
    HTML: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    CSS: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    JavaScript: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    PHP: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    Laravel: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    MySQL: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    MongoDB: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    Flutter: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    Dart: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
    'C#': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    'Web Development': 'bg-primary/10 text-primary border-primary/30',
    'Programming Fundamentals': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
};

function formatDate(dateString) {
    if (!dateString) return 'Recent';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'Recent';
    }
}

export default function BlogList() {
    usePageSeo({
        title: 'Programming & Web Development Blog: Tutorials & Guides | Hangbug',
        description: 'Learn programming step-by-step with practical tutorials, coding guides, and interview prep on HTML, CSS, JavaScript, PHP, Laravel, Flutter, C#, and databases.',
        canonicalPath: '/blog',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' }
        ]
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || 'All';
    const searchQuery = searchParams.get('q') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const [articles, setArticles] = useState([]);
    const [featuredArticle, setFeaturedArticle] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalArticles, setTotalArticles] = useState(0);

    // Fetch categories with counts
    useEffect(() => {
        let isMounted = true;
        blogService.getCategories()
            .then(res => {
                if (isMounted && res?.success && Array.isArray(res.categories)) {
                    setCategories(res.categories);
                }
            })
            .catch(() => {
                // Fallback: derive categories from INITIAL_BLOG_ARTICLES
                if (isMounted) {
                    const counts = {};
                    INITIAL_BLOG_ARTICLES.filter(a => a.isPublished).forEach(a => {
                        counts[a.category] = (counts[a.category] || 0) + 1;
                    });
                    const fallbackCats = Object.entries(counts).map(([name, count]) => ({
                        name,
                        slug: name.toLowerCase().replace(/\s+/g, '-'),
                        count
                    }));
                    setCategories(fallbackCats);
                }
            });
        return () => { isMounted = false; };
    }, []);

    // Fetch articles
    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        blogService.getPublishedArticles({
            category: activeCategory !== 'All' ? activeCategory : '',
            search: searchQuery,
            page: currentPage,
            limit: 9
        })
            .then(res => {
                if (isMounted && res?.success) {
                    setArticles(res.articles || []);
                    setTotalPages(res.totalPages || 1);
                    setTotalArticles(res.total || 0);
                }
            })
            .catch(err => {
                console.error('[BlogList] Error fetching articles:', err);
                if (isMounted) {
                    // Fallback to static articles
                    let filtered = INITIAL_BLOG_ARTICLES.filter(a => a.isPublished);
                    if (activeCategory !== 'All') {
                        filtered = filtered.filter(a => a.category?.toLowerCase() === activeCategory.toLowerCase());
                    }
                    if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase().trim();
                        filtered = filtered.filter(a =>
                            a.title.toLowerCase().includes(q) ||
                            a.excerpt.toLowerCase().includes(q) ||
                            a.content.toLowerCase().includes(q)
                        );
                    }
                    setArticles(filtered);
                    setTotalPages(Math.ceil(filtered.length / 9) || 1);
                    setTotalArticles(filtered.length);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [activeCategory, searchQuery, currentPage]);

    // Fetch featured article for top banner
    useEffect(() => {
        let isMounted = true;
        blogService.getFeaturedArticle()
            .then(res => {
                if (isMounted && res?.success && res.article) {
                    setFeaturedArticle(res.article);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setFeaturedArticle(INITIAL_BLOG_ARTICLES.find(a => a.isFeatured) || INITIAL_BLOG_ARTICLES[0]);
                }
            });
        return () => { isMounted = false; };
    }, []);

    const handleCategoryClick = (categoryName) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (categoryName === 'All') {
                next.delete('category');
            } else {
                next.set('category', categoryName);
            }
            next.delete('page');
            return next;
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value.trim()) {
                next.set('q', value);
            } else {
                next.delete('q');
            }
            next.delete('page');
            return next;
        });
    };

    const handleClearSearch = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('q');
            next.delete('page');
            return next;
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('page', String(newPage));
            return next;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
                {/* Hero Header */}
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#193D35]/15 via-[var(--card-bg)] to-[var(--muted-bg)] border border-[var(--card-border)] p-8 sm:p-12 shadow-sm">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#193D35]/10 blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-3xl space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#193D35]/10 text-[#193D35] dark:text-emerald-400 border border-[#193D35]/20">
                            <Sparkles size={14} />
                            <span>Hangbug Educational Blog &amp; Guides</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
                            Learn Programming <span className="text-[#193D35] dark:text-emerald-400">Step by Step</span>
                        </h1>
                        <p className="text-sm sm:text-base text-[var(--foreground-muted)] leading-relaxed">
                            In-depth programming tutorials, clean code architectures, practical beginner guides, and software engineering interview questions designed to help you write cleaner code and master modern technologies.
                        </p>

                        {/* Search Bar */}
                        <div className="pt-2 max-w-xl">
                            <div className="relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search tutorials (e.g. HTML, JavaScript, MVC, MySQL)..."
                                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--input-bg)] border border-[var(--input-border)] text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:border-[#193D35] focus:ring-2 focus:ring-[#193D35]/20 transition-all shadow-inner"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={handleClearSearch}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology Categories - Only display categories that have published articles */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-[#193D35] dark:text-emerald-400" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                Browse by Technology
                            </h2>
                        </div>
                        <span className="text-xs text-[var(--foreground-muted)]">
                            {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleCategoryClick('All')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                activeCategory === 'All'
                                    ? 'bg-[#193D35] text-white border-[#193D35] shadow-sm'
                                    : 'bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border-[var(--card-border)] hover:border-[#193D35]/40'
                            }`}
                        >
                            All Topics ({categories.reduce((acc, c) => acc + (c.count || 0), 0) || totalArticles})
                        </button>

                        {categories.map((cat) => {
                            const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();
                            const pillColor = CATEGORY_COLORS[cat.name] || 'border-[var(--card-border)] text-[var(--foreground)]';

                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                                        isSelected
                                            ? 'bg-[#193D35] text-white border-[#193D35] shadow-sm'
                                            : `bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] border-[var(--card-border)] hover:border-[#193D35]/40`
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                            isSelected ? 'bg-white/20 text-white' : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)]'
                                        }`}
                                    >
                                        {cat.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Featured Article Hero (Shown on page 1 when no search query is active) */}
                {featuredArticle && currentPage === 1 && !searchQuery && activeCategory === 'All' && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Flame size={18} className="text-amber-500" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
                                Featured Guide
                            </h2>
                        </div>

                        <article className="relative group overflow-hidden rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35]/50 transition-all duration-300 shadow-md hover:shadow-xl">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${CATEGORY_COLORS[featuredArticle.category] || 'bg-primary/10 text-primary border-primary/20'}`}>
                                                {featuredArticle.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                                <Clock size={13} />
                                                <span>{featuredArticle.readingTimeMinutes || 8} min read</span>
                                            </div>
                                            <span className="text-[var(--foreground-muted)]">•</span>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                                                <Calendar size={13} />
                                                <span>{formatDate(featuredArticle.publishedAt)}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] group-hover:text-[#193D35] dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                            <Link to={`/blog/${featuredArticle.slug}`}>
                                                {featuredArticle.title}
                                            </Link>
                                        </h3>

                                        <p className="text-sm text-[var(--foreground-muted)] line-clamp-3 leading-relaxed">
                                            {featuredArticle.excerpt}
                                        </p>
                                    </div>

                                    {/* Author & CTA */}
                                    <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#193D35] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                                {featuredArticle.authorAvatar || 'HB'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--foreground)]">{featuredArticle.authorName || 'Hangbug Editorial Team'}</p>
                                                <p className="text-[11px] text-[var(--foreground-muted)]">{featuredArticle.authorRole || 'Technical Educators'}</p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/blog/${featuredArticle.slug}`}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#193D35] hover:bg-[#132e28] text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all"
                                        >
                                            <span>Read Tutorial</span>
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Visual Artwork Card */}
                                <div className="lg:col-span-5 relative min-h-[220px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex flex-col justify-between border border-white/10 shadow-inner">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#193D35]/30 rounded-full blur-2xl pointer-events-none" />
                                    <div className="relative z-10 flex items-center justify-between">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                                            {featuredArticle.difficulty || 'Beginner Friendly'}
                                        </span>
                                        <GraduationCap size={20} className="text-emerald-400" />
                                    </div>

                                    <div className="relative z-10 space-y-2 my-auto py-4">
                                        <p className="text-xs font-mono text-emerald-300">
                                            $ hangbug learn --track {featuredArticle.category?.toLowerCase()}
                                        </p>
                                        <p className="text-white text-base font-bold line-clamp-2">
                                            {featuredArticle.title}
                                        </p>
                                    </div>

                                    <div className="relative z-10 flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                                        {(featuredArticle.tags || []).slice(0, 3).map(tag => (
                                            <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-slate-200">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>
                )}

                {/* Latest Articles Grid */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-[#193D35] dark:text-emerald-400" />
                            <h2 className="text-lg font-bold text-[var(--foreground)]">
                                {searchQuery
                                    ? `Search Results for "${searchQuery}"`
                                    : activeCategory !== 'All'
                                    ? `${activeCategory} Tutorials & Articles`
                                    : 'Latest Articles & Guides'}
                            </h2>
                        </div>
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="text-xs text-[#193D35] dark:text-emerald-400 hover:underline"
                            >
                                Clear search filter
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 space-y-4">
                                    <div className="h-4 bg-[var(--muted-bg)] rounded w-1/3" />
                                    <div className="h-6 bg-[var(--muted-bg)] rounded w-3/4" />
                                    <div className="h-16 bg-[var(--muted-bg)] rounded" />
                                    <div className="h-4 bg-[var(--muted-bg)] rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--muted-bg)] flex items-center justify-center mx-auto text-[var(--foreground-muted)]">
                                <Search size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--foreground)]">No articles found</h3>
                            <p className="text-xs text-[var(--foreground-muted)] max-w-md mx-auto leading-relaxed">
                                We couldn't find any articles matching your search criteria. Try choosing a different technology category or clearing your search term.
                            </p>
                            <button
                                onClick={() => {
                                    handleClearSearch();
                                    handleCategoryClick('All');
                                }}
                                className="px-4 py-2 rounded-xl bg-[#193D35] text-white text-xs font-semibold hover:bg-[#132e28] transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => {
                                const categoryColor = CATEGORY_COLORS[article.category] || 'bg-primary/10 text-primary border-primary/20';

                                return (
                                    <article
                                        key={article.id || article.slug}
                                        className="group relative flex flex-col justify-between rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35]/50 hover:shadow-lg transition-all duration-300 p-6"
                                    >
                                        <div className="space-y-3.5">
                                            {/* Category & Reading Time */}
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${categoryColor}`}>
                                                    {article.category}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] text-[var(--foreground-muted)]">
                                                    <Clock size={12} />
                                                    <span>{article.readingTimeMinutes || 8} min read</span>
                                                </div>
                                            </div>

                                            {/* Article Title */}
                                            <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[#193D35] dark:group-hover:text-emerald-400 transition-colors leading-snug">
                                                <Link to={`/blog/${article.slug}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-xs text-[var(--foreground-muted)] line-clamp-3 leading-relaxed">
                                                {article.excerpt}
                                            </p>
                                        </div>

                                        {/* Footer Metadata */}
                                        <div className="pt-4 mt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                <span className="text-[11px]">{formatDate(article.publishedAt)}</span>
                                            </div>

                                            <Link
                                                to={`/blog/${article.slug}`}
                                                className="inline-flex items-center gap-1 font-semibold text-[#193D35] dark:text-emerald-400 hover:gap-1.5 transition-all text-xs"
                                            >
                                                <span>Read</span>
                                                <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav aria-label="Blog pagination" className="pt-6 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#193D35] transition-all flex items-center gap-1"
                            >
                                <ChevronLeft size={14} />
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                            currentPage === page
                                                ? 'bg-[#193D35] text-white shadow-sm'
                                                : 'border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[#193D35]'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                                className="px-3 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] text-xs font-semibold text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#193D35] transition-all flex items-center gap-1"
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </nav>
                    )}
                </section>

                {/* Practical Skill Assessment CTA */}
                <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/30 p-8 sm:p-10 text-white shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-8 space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Sparkles size={12} />
                                <span>Interactive Skill Validation</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                Put Your Learning Into Practice with Hangbug
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                                Reading tutorials is step one. Cement your knowledge with Hangbug's topic-specific programming quizzes, test your speed in 60-Second Challenge, and earn verified developer certificates.
                            </p>
                        </div>

                        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                            <Link
                                to="/technologies"
                                className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
                            >
                                <Code2 size={16} />
                                <span>Explore Tech Quizzes</span>
                            </Link>
                            <Link
                                to="/games"
                                className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
                            >
                                <Gamepad2 size={16} />
                                <span>Play Coding Games</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
