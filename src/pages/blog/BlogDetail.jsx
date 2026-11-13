import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Calendar,
    ArrowLeft,
    Share2,
    Check,
    Copy,
    Sparkles,
    CheckCircle2,
    Code2,
    Gamepad2,
    ChevronRight,
    HelpCircle,
    User,
    ArrowRight,
    Tag,
    Linkedin,
    Twitter
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';
import blogService from '../../services/blogService';
import { INITIAL_BLOG_ARTICLES } from '../../services/blogArticles';

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
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Recent';
    }
}

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    {language || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-[11px]"
                >
                    {copied ? (
                        <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy size={12} />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function MarkdownRenderer({ content }) {
    if (!content) return null;

    // Split markdown content by code blocks: ```lang ... ```
    const parts = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                value: content.slice(lastIndex, match.index)
            });
        }
        parts.push({
            type: 'code',
            language: match[1] || 'text',
            value: match[2].trim()
        });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            value: content.slice(lastIndex)
        });
    }

    return (
        <div className="article-body space-y-6 text-[var(--foreground)] text-sm sm:text-base leading-relaxed">
            {parts.map((part, idx) => {
                if (part.type === 'code') {
                    return <CodeBlock key={idx} language={part.language} code={part.value} />;
                }

                // Render text paragraphs, headings, bullet lists
                const lines = part.value.split('\n');
                const elements = [];
                let currentList = [];

                const flushList = () => {
                    if (currentList.length > 0) {
                        elements.push(
                            <ul key={`ul-${elements.length}`} className="my-4 space-y-2 list-none pl-1">
                                {currentList.map((item, lIdx) => (
                                    <li key={lIdx} className="flex items-start gap-2 text-sm text-[var(--foreground)] leading-relaxed">
                                        <span className="text-[#193D35] dark:text-emerald-400 mt-1.5 shrink-0">•</span>
                                        <span>{renderInline(item)}</span>
                                    </li>
                                ))}
                            </ul>
                        );
                        currentList = [];
                    }
                };

                lines.forEach((line, lIdx) => {
                    const trimmed = line.trim();

                    if (!trimmed) {
                        flushList();
                        return;
                    }

                    if (trimmed.startsWith('### ')) {
                        flushList();
                        elements.push(
                            <h3 key={lIdx} className="text-lg sm:text-xl font-black text-[var(--foreground)] pt-4 pb-1">
                                {trimmed.replace('### ', '')}
                            </h3>
                        );
                    } else if (trimmed.startsWith('## ')) {
                        flushList();
                        elements.push(
                            <h2 key={lIdx} className="text-xl sm:text-2xl font-black text-[var(--foreground)] pt-6 pb-2 border-b border-[var(--card-border)]">
                                {trimmed.replace('## ', '')}
                            </h2>
                        );
                    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        currentList.push(trimmed.slice(2));
                    } else if (/^\d+\.\s/.test(trimmed)) {
                        flushList();
                        elements.push(
                            <p key={lIdx} className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed font-semibold">
                                {renderInline(trimmed)}
                            </p>
                        );
                    } else if (trimmed === '---') {
                        flushList();
                        elements.push(<hr key={lIdx} className="my-8 border-[var(--card-border)]" />);
                    } else {
                        flushList();
                        elements.push(
                            <p key={lIdx} className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed">
                                {renderInline(trimmed)}
                            </p>
                        );
                    }
                });

                flushList();
                return <React.Fragment key={idx}>{elements}</React.Fragment>;
            })}
        </div>
    );
}

function renderInline(text) {
    if (!text) return '';
    // Bold **text** and inline `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-[var(--foreground)]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] text-[#193D35] dark:text-emerald-400 font-mono text-xs border border-[var(--card-border)]">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

export default function BlogDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedShare, setCopiedShare] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        blogService.getArticleBySlug(slug)
            .then(res => {
                if (isMounted && res?.success && res.article) {
                    setArticle(res.article);
                    setRelatedArticles(res.relatedArticles || []);
                } else if (isMounted) {
                    // Fallback to static articles
                    const fallback = INITIAL_BLOG_ARTICLES.find(a => a.slug === slug);
                    setArticle(fallback || null);
                    if (fallback) {
                        const related = INITIAL_BLOG_ARTICLES
                            .filter(a => a.slug !== slug && a.category === fallback.category)
                            .slice(0, 3);
                        setRelatedArticles(related);
                    }
                }
            })
            .catch(() => {
                if (isMounted) {
                    const fallback = INITIAL_BLOG_ARTICLES.find(a => a.slug === slug);
                    setArticle(fallback || null);
                    if (fallback) {
                        const related = INITIAL_BLOG_ARTICLES
                            .filter(a => a.slug !== slug && a.category === fallback.category)
                            .slice(0, 3);
                        setRelatedArticles(related);
                    }
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [slug]);

    // Dynamic SEO Configuration
    usePageSeo({
        title: article?.seoTitle || (article?.title ? `${article.title} | Hangbug` : 'Tutorial Not Found | Hangbug'),
        description: article?.seoDescription || article?.excerpt || 'Read programming guides and tutorials on Hangbug.',
        canonicalPath: `/blog/${slug}`,
        schemaType: 'Article',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            ...(article?.category ? [{ name: article.category, path: `/blog?category=${encodeURIComponent(article.category)}` }] : []),
            ...(article?.title ? [{ name: article.title, path: `/blog/${slug}` }] : [])
        ],
        article: article ? {
            headline: article.title,
            description: article.excerpt,
            authorName: article.authorName || 'Hangbug Editorial Team',
            datePublished: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
            dateModified: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
            image: 'https://www.hangbug.com/branding/hangbug-logo-full.png'
        } : null
    });

    const handleCopyShareLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
                <Navbar />
                <main className="flex-grow pt-28 pb-16 px-4 max-w-4xl mx-auto w-full animate-pulse space-y-6">
                    <div className="h-4 bg-[var(--muted-bg)] rounded w-1/4" />
                    <div className="h-10 bg-[var(--muted-bg)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--muted-bg)] rounded w-1/2" />
                    <div className="h-64 bg-[var(--muted-bg)] rounded-3xl" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
                <Navbar />
                <main className="flex-grow pt-32 pb-16 px-4 max-w-2xl mx-auto w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                        <BookOpen size={28} />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
                        Article Not Found
                    </h1>
                    <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                        The tutorial or guide you are looking for may have been moved, renamed, or is temporarily unavailable.
                    </p>
                    <div className="pt-2">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#193D35] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#132e28] transition-all shadow"
                        >
                            <ArrowLeft size={14} />
                            <span>Return to Blog Listing</span>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const categoryColor = CATEGORY_COLORS[article.category] || 'bg-primary/10 text-primary border-primary/20';
    const techSlug = article.category?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] overflow-x-auto py-1">
                    <Link to="/" className="hover:text-[var(--foreground)] transition-colors shrink-0">Home</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <Link to="/blog" className="hover:text-[var(--foreground)] transition-colors shrink-0">Blog</Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <Link to={`/blog?category=${encodeURIComponent(article.category)}`} className="hover:text-[var(--foreground)] transition-colors shrink-0 font-medium">
                        {article.category}
                    </Link>
                    <ChevronRight size={12} className="shrink-0" />
                    <span className="text-[var(--foreground)] truncate shrink-0 max-w-[200px] font-semibold">
                        {article.title}
                    </span>
                </nav>

                {/* Article Header */}
                <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            to={`/blog?category=${encodeURIComponent(article.category)}`}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${categoryColor}`}
                        >
                            {article.category}
                        </Link>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)]">
                            {article.difficulty || 'Beginner'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                            <Clock size={13} />
                            <span>{article.readingTimeMinutes || 8} min read</span>
                        </div>
                    </div>

                    {/* Single Meaningful H1 Heading */}
                    <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                        {article.title}
                    </h1>

                    <p className="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed">
                        {article.excerpt}
                    </p>

                    {/* Author & Share Bar */}
                    <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#193D35] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {article.authorAvatar || 'HB'}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[var(--foreground)]">{article.authorName || 'Hangbug Editorial Team'}</p>
                                <div className="flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
                                    <span>{article.authorRole || 'Technical Educators'}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={11} />
                                        <span>{formatDate(article.publishedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Links */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyShareLink}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#193D35] text-xs font-semibold text-[var(--foreground)] transition-all shadow-xs"
                            >
                                {copiedShare ? (
                                    <>
                                        <Check size={13} className="text-emerald-500" />
                                        <span className="text-emerald-500">Link Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 size={13} />
                                        <span>Share</span>
                                    </>
                                )}
                            </button>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on Twitter"
                                className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#193D35] text-[var(--foreground-muted)] hover:text-[#193D35] transition-all"
                            >
                                <Twitter size={14} />
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on LinkedIn"
                                className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#193D35] text-[var(--foreground-muted)] hover:text-[#193D35] transition-all"
                            >
                                <Linkedin size={14} />
                            </a>
                        </div>
                    </div>
                </header>

                {/* Key Takeaways Callout */}
                {Array.isArray(article.keyTakeaways) && article.keyTakeaways.length > 0 && (
                    <aside aria-label="Key takeaways" className="rounded-2xl bg-gradient-to-br from-[#193D35]/10 via-[var(--card-bg)] to-[var(--card-bg)] border border-[#193D35]/30 p-6 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 text-[#193D35] dark:text-emerald-400">
                            <Sparkles size={16} />
                            <h2 className="text-xs font-bold uppercase tracking-wider">
                                Key Takeaways
                            </h2>
                        </div>
                        <ul className="space-y-2">
                            {article.keyTakeaways.map((takeaway, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                                    <CheckCircle2 size={15} className="text-[#193D35] dark:text-emerald-400 mt-0.5 shrink-0" />
                                    <span>{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* Main Article Body */}
                <article className="prose prose-slate dark:prose-invert max-w-none">
                    <MarkdownRenderer content={article.content} />
                </article>

                {/* Interactive Practice Callout (Hangbug Quizzes & Games) */}
                <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 p-6 sm:p-8 text-white space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <GraduationCap size={20} />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                            Hands-On Practice: Test Your Skills
                        </h2>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white">
                        Mastered this concept? Prove it on Hangbug.
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        Solidify what you just learned with interactive multiple-choice quizzes, bug-fixing challenges, and speed drills designed for developers.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3">
                        <Link
                            to={`/technologies/${techSlug}`}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                        >
                            <Code2 size={14} />
                            <span>Take {article.category} Quiz</span>
                        </Link>

                        {article.relatedGameSlug && (
                            <Link
                                to={`/games/${article.relatedGameSlug}`}
                                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
                            >
                                <Gamepad2 size={14} />
                                <span>Play Related Coding Challenge</span>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Author Bio Box */}
                <section className="rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-[#193D35] text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
                        {article.authorAvatar || 'HB'}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">About the Author</p>
                        <h3 className="text-base font-bold text-[var(--foreground)]">{article.authorName || 'Hangbug Editorial Team'}</h3>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            {article.authorBio || 'The Hangbug team creates practical programming quizzes, interactive coding games, and actionable developer tutorials to help software engineers thrive.'}
                        </p>
                    </div>
                </section>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="space-y-4 pt-6 border-t border-[var(--card-border)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[var(--foreground)]">
                                Related Tutorials in {article.category}
                            </h2>
                            <Link to={`/blog?category=${encodeURIComponent(article.category)}`} className="text-xs text-[#193D35] dark:text-emerald-400 hover:underline">
                                View all {article.category} articles
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedArticles.map((rel) => (
                                <Link
                                    key={rel.id || rel.slug}
                                    to={`/blog/${rel.slug}`}
                                    className="group rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[#193D35]/50 p-4 space-y-2.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CATEGORY_COLORS[rel.category] || 'bg-primary/10 text-primary border-primary/20'}`}>
                                                {rel.category}
                                            </span>
                                            <span className="text-[10px] text-[var(--foreground-muted)]">
                                                {rel.readingTimeMinutes || 8} min
                                            </span>
                                        </div>
                                        <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[#193D35] dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {rel.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#193D35] dark:text-emerald-400 pt-2 border-t border-[var(--card-border)]">
                                        <span>Read Guide</span>
                                        <ArrowRight size={11} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
