import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Clock,
    Calendar,
    Share2,
    Check,
    Copy,
    Sparkles,
    CheckCircle2,
    Code2,
    Gamepad2,
    ChevronRight,
    GraduationCap,
    ArrowRight,
    Linkedin,
    Twitter
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import usePageSeo from '../../hooks/usePageSeo';
import blogService from '../../services/blogService';
import { INITIAL_BLOG_ARTICLES } from '../../services/blogArticles';
import { getTechnologySeoBySlug } from '../../config/seoPagesConfig';
import {
    decodeHtmlEntities,
    parseInlineTokens,
    parseMarkdownBlocks,
    stripMarkdownToPlainText,
    countPlainWords
} from '../../../api/_utils/blogMarkdownParser.mjs';
import NotFound from '../NotFound';

const SITE_BASE_URL = 'https://www.hangbug.com';
const DEFAULT_COVER_IMAGE = 'https://www.hangbug.com/branding/hangbug-logo-full.png';

function readEmbeddedBlogData(currentSlug) {
    if (typeof document === 'undefined' || !currentSlug) return null;
    try {
        const el = document.getElementById('hangbug-blog-data');
        if (!el || !el.textContent) return null;
        const parsed = JSON.parse(el.textContent);
        if (parsed?.article && String(parsed.article.slug).toLowerCase() === String(currentSlug).toLowerCase()) {
            return parsed;
        }
    } catch {
        // Ignore malformed embedded payload
    }
    return null;
}

function resolveCoverImageUrl(coverImage) {
    if (!coverImage || typeof coverImage !== 'string') return DEFAULT_COVER_IMAGE;
    const trimmed = coverImage.trim();
    if (!trimmed) return DEFAULT_COVER_IMAGE;
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
    if (trimmed.startsWith('/')) return `${SITE_BASE_URL}${trimmed}`;
    return `${SITE_BASE_URL}/${trimmed}`;
}

function toIsoDate(value, fallback = '2026-08-01T00:00:00.000Z') {
    if (!value) return fallback;
    try {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
    } catch {
        return fallback;
    }
}

function buildArticleSeoDescription(article) {
    const seoDesc = typeof article?.seoDescription === 'string' ? article.seoDescription.trim() : '';
    if (seoDesc) return seoDesc;
    const excerpt = typeof article?.excerpt === 'string' ? article.excerpt.trim() : '';
    if (excerpt) return excerpt.length <= 160 ? excerpt : `${excerpt.slice(0, 157).trim()}...`;
    const plain = stripMarkdownToPlainText(article?.content || '');
    if (plain) return plain.length <= 160 ? plain : `${plain.slice(0, 157).trim()}...`;
    return `${article?.title || 'Programming Guide'} — Developer tutorial and practical guide on Hangbug.`;
}

function isOrganizationAuthor(authorName) {
    const name = String(authorName || '').trim().toLowerCase();
    return !name || name.includes('hangbug') || name.includes('editorial') || name.includes('team');
}

function resolveTechQuizTarget(article) {
    const candidates = [article?.relatedQuizCategory, article?.category].filter(Boolean);
    for (const candidate of candidates) {
        const rawSlug = String(candidate).toLowerCase().trim().replace(/\s+/g, '-');
        const seoConfig = getTechnologySeoBySlug(rawSlug);
        if (seoConfig && seoConfig.path) {
            return { path: seoConfig.path, label: seoConfig.name || candidate };
        }
    }
    return { path: '/technologies', label: null };
}

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

function renderInlineTokens(tokens, keyPrefix = 't') {
    return (tokens || []).map((token, idx) => {
        const key = `${keyPrefix}-${idx}`;
        if (token.type === 'text') {
            return <React.Fragment key={key}>{token.value}</React.Fragment>;
        }
        if (token.type === 'code') {
            return (
                <code key={key} className="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] text-[#193D35] dark:text-emerald-400 font-mono text-xs border border-[var(--card-border)]">
                    {token.value}
                </code>
            );
        }
        if (token.type === 'strong') {
            return (
                <strong key={key} className="font-bold text-[var(--foreground)]">
                    {renderInlineTokens(token.tokens, `${key}-b`)}
                </strong>
            );
        }
        if (token.type === 'em') {
            return (
                <em key={key} className="italic">
                    {renderInlineTokens(token.tokens, `${key}-i`)}
                </em>
            );
        }
        if (token.type === 'link') {
            const href = token.href || '#';
            const isInternal = href.startsWith('/') || href.startsWith(SITE_BASE_URL);
            if (isInternal) {
                const toPath = href.startsWith(SITE_BASE_URL) ? (href.slice(SITE_BASE_URL.length) || '/') : href;
                return (
                    <Link
                        key={key}
                        to={toPath}
                        className="font-semibold text-[#193D35] dark:text-emerald-400 underline decoration-[#193D35]/40 hover:decoration-[#193D35]"
                    >
                        {renderInlineTokens(token.tokens, `${key}-a`)}
                    </Link>
                );
            }
            return (
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#193D35] dark:text-emerald-400 underline decoration-[#193D35]/40 hover:decoration-[#193D35]"
                >
                    {renderInlineTokens(token.tokens, `${key}-a`)}
                </a>
            );
        }
        return null;
    });
}

function renderInline(text) {
    if (!text) return '';
    return renderInlineTokens(parseInlineTokens(text));
}

function MarkdownRenderer({ content }) {
    if (!content) return null;
    const blocks = parseMarkdownBlocks(content);

    return (
        <div className="article-body space-y-6 text-[var(--foreground)] text-sm sm:text-base leading-relaxed">
            {blocks.map((block, idx) => {
                if (block.type === 'code') {
                    return <CodeBlock key={idx} language={block.language} code={block.value} />;
                }
                if (block.type === 'heading') {
                    if (block.level === 2) {
                        return (
                            <h2 key={idx} id={block.id || undefined} className="text-xl sm:text-2xl font-black text-[var(--foreground)] pt-6 pb-2 border-b border-[var(--card-border)]">
                                {renderInline(block.text)}
                            </h2>
                        );
                    }
                    if (block.level === 4) {
                        return (
                            <h4 key={idx} id={block.id || undefined} className="text-base sm:text-lg font-bold text-[var(--foreground)] pt-3 pb-1">
                                {renderInline(block.text)}
                            </h4>
                        );
                    }
                    return (
                        <h3 key={idx} id={block.id || undefined} className="text-lg sm:text-xl font-black text-[var(--foreground)] pt-4 pb-1">
                            {renderInline(block.text)}
                        </h3>
                    );
                }
                if (block.type === 'hr') {
                    return <hr key={idx} className="my-8 border-[var(--card-border)]" />;
                }
                if (block.type === 'blockquote') {
                    return (
                        <blockquote key={idx} className="my-4 pl-4 border-l-4 border-[#193D35] dark:border-emerald-400 bg-[var(--muted-bg)]/50 py-3 pr-4 rounded-r-xl text-sm text-[var(--foreground)] leading-relaxed space-y-2">
                            {block.lines.map((line, lIdx) => (
                                <p key={lIdx}>{renderInline(line)}</p>
                            ))}
                        </blockquote>
                    );
                }
                if (block.type === 'ul') {
                    return (
                        <ul key={idx} className="my-4 space-y-2 list-none pl-1">
                            {block.items.map((item, lIdx) => (
                                <li key={lIdx} className="flex items-start gap-2 text-sm text-[var(--foreground)] leading-relaxed">
                                    <span className="text-[#193D35] dark:text-emerald-400 mt-1 shrink-0" aria-hidden="true">•</span>
                                    <span>{renderInline(item)}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }
                if (block.type === 'ol') {
                    return (
                        <ol key={idx} className="my-4 space-y-2 list-decimal pl-6 text-sm text-[var(--foreground)] leading-relaxed">
                            {block.items.map((item, lIdx) => (
                                <li key={lIdx}>{renderInline(item)}</li>
                            ))}
                        </ol>
                    );
                }
                if (block.type === 'table') {
                    return (
                        <div key={idx} className="my-6 overflow-x-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-[var(--muted-bg)]/60">
                                    <tr>
                                        {block.headers.map((header, hIdx) => (
                                            <th
                                                key={hIdx}
                                                className="px-4 py-2.5 text-xs font-bold text-[var(--foreground)] border-b border-[var(--card-border)]"
                                                style={{ textAlign: block.alignments[hIdx] || 'left' }}
                                            >
                                                {renderInline(header)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {block.rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="border-b border-[var(--card-border)]/60 last:border-b-0">
                                            {row.map((cell, cIdx) => (
                                                <td
                                                    key={cIdx}
                                                    className="px-4 py-2.5 text-xs sm:text-sm text-[var(--foreground)]"
                                                    style={{ textAlign: block.alignments[cIdx] || 'left' }}
                                                >
                                                    {renderInline(cell)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                return (
                    <p key={idx} className="text-sm sm:text-base text-[var(--foreground)] leading-relaxed">
                        {renderInline(block.text)}
                    </p>
                );
            })}
        </div>
    );
}

export default function BlogDetail() {
    const { slug } = useParams();
    const initialEmbedded = readEmbeddedBlogData(slug);

    const [article, setArticle] = useState(() => initialEmbedded?.article || null);
    const [relatedArticles, setRelatedArticles] = useState(() => initialEmbedded?.relatedArticles || []);
    const [loading, setLoading] = useState(() => !initialEmbedded?.article);
    const [copiedShare, setCopiedShare] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const embeddedForSlug = readEmbeddedBlogData(slug);

        if (embeddedForSlug?.article) {
            setArticle(embeddedForSlug.article);
            setRelatedArticles(embeddedForSlug.relatedArticles || []);
            setLoading(false);
        } else {
            setArticle(null);
            setRelatedArticles([]);
            setLoading(true);
        }

        blogService.getArticleBySlug(slug)
            .then(res => {
                if (!isMounted) return;
                if (res?.success && res.article) {
                    setArticle(res.article);
                    setRelatedArticles(res.relatedArticles || []);
                } else if (!embeddedForSlug?.article) {
                    setArticle(null);
                    setRelatedArticles([]);
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                const status = err?.response?.status;
                // Strictly return 404 when server confirms article is missing or unpublished
                if (status === 404 || status === 400) {
                    setArticle(null);
                    setRelatedArticles([]);
                    return;
                }
                if (embeddedForSlug?.article) {
                    return;
                }
                // Network/offline fallback only for published static articles
                const fallback = INITIAL_BLOG_ARTICLES.find(a => a.slug === slug && a.isPublished !== false);
                setArticle(fallback || null);
                if (fallback) {
                    const related = INITIAL_BLOG_ARTICLES
                        .filter(a => a.slug !== slug && a.isPublished !== false && a.category === fallback.category)
                        .slice(0, 3);
                    setRelatedArticles(related);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [slug]);

    const activeArticle = article && String(article.slug).toLowerCase() === String(slug || '').toLowerCase()
        ? article
        : null;
    const seoDescription = activeArticle ? buildArticleSeoDescription(activeArticle) : '';
    const seoTitle = activeArticle ? ((activeArticle.seoTitle || '').trim() || `${activeArticle.title} | Hangbug`) : '';
    const coverImageUrl = activeArticle ? resolveCoverImageUrl(activeArticle.coverImage) : undefined;
    const datePublishedIso = activeArticle ? toIsoDate(activeArticle.publishedAt || activeArticle.createdAt) : undefined;
    const dateModifiedIso = activeArticle ? toIsoDate(activeArticle.updatedAt || activeArticle.publishedAt || activeArticle.createdAt, datePublishedIso) : undefined;

    // Dynamic SEO Configuration
    usePageSeo({
        skip: loading && !activeArticle,
        title: activeArticle ? seoTitle : '404: Page Not Found — HangBug',
        description: activeArticle
            ? seoDescription
            : "The page you are looking for doesn't exist, has been removed, or was moved to another URL.",
        canonicalPath: activeArticle ? `/blog/${activeArticle.slug}` : undefined,
        ogType: activeArticle ? 'article' : 'website',
        ogImage: coverImageUrl,
        ogImageAlt: activeArticle ? `${activeArticle.title} — Hangbug` : undefined,
        noindex: !loading && !activeArticle,
        disableStructuredData: !activeArticle,
        schemaType: 'Article',
        breadcrumbs: activeArticle ? [
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            ...(activeArticle.category ? [{ name: activeArticle.category, path: `/blog?category=${encodeURIComponent(activeArticle.category)}` }] : []),
            { name: activeArticle.title, path: `/blog/${activeArticle.slug}` }
        ] : undefined,
        article: activeArticle ? {
            headline: activeArticle.title,
            description: activeArticle.excerpt || seoDescription,
            authorName: activeArticle.authorName || 'Hangbug Editorial Team',
            authorType: isOrganizationAuthor(activeArticle.authorName) ? 'Organization' : 'Person',
            datePublished: datePublishedIso,
            dateModified: dateModifiedIso,
            articleSection: activeArticle.category,
            keywords: Array.isArray(activeArticle.tags) ? activeArticle.tags.join(', ') : undefined,
            wordCount: countPlainWords(activeArticle.content || activeArticle.excerpt || ''),
            image: coverImageUrl
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

    if (!activeArticle) {
        return <NotFound />;
    }

    const categoryColor = CATEGORY_COLORS[activeArticle.category] || 'bg-primary/10 text-primary border-primary/20';
    const techTarget = resolveTechQuizTarget(activeArticle);

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
                    <span className="font-medium shrink-0">
                        {activeArticle.category}
                    </span>
                    <ChevronRight size={12} className="shrink-0" />
                    <span className="text-[var(--foreground)] truncate shrink-0 max-w-[200px] font-semibold">
                        {decodeHtmlEntities(activeArticle.title)}
                    </span>
                </nav>

                {/* Article Header */}
                <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${categoryColor}`}
                        >
                            {activeArticle.category}
                        </span>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)]">
                            {activeArticle.difficulty || 'Beginner'}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
                            <Clock size={13} />
                            <span>{activeArticle.readingTimeMinutes || 8} min read</span>
                        </div>
                    </div>

                    {/* Single Meaningful H1 Heading */}
                    <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                        {decodeHtmlEntities(activeArticle.title)}
                    </h1>

                    <p className="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed">
                        {decodeHtmlEntities(activeArticle.excerpt)}
                    </p>

                    {/* Author & Share Bar */}
                    <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#193D35] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                {activeArticle.authorAvatar || 'HB'}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[var(--foreground)]">{activeArticle.authorName || 'Hangbug Editorial Team'}</p>
                                <div className="flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
                                    <span>{activeArticle.authorRole || 'Technical Educators'}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={11} />
                                        <time dateTime={datePublishedIso}>{formatDate(activeArticle.publishedAt)}</time>
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
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeArticle.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Share on Twitter"
                                className="p-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#193D35] text-[var(--foreground-muted)] hover:text-[#193D35] transition-all"
                            >
                                <Twitter size={14} />
                            </a>
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
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
                {Array.isArray(activeArticle.keyTakeaways) && activeArticle.keyTakeaways.length > 0 && (
                    <aside aria-label="Key takeaways" className="rounded-2xl bg-gradient-to-br from-[#193D35]/10 via-[var(--card-bg)] to-[var(--card-bg)] border border-[#193D35]/30 p-6 space-y-3 shadow-sm">
                        <div className="flex items-center gap-2 text-[#193D35] dark:text-emerald-400">
                            <Sparkles size={16} />
                            <h2 className="text-xs font-bold uppercase tracking-wider">
                                Key Takeaways
                            </h2>
                        </div>
                        <ul className="space-y-2">
                            {activeArticle.keyTakeaways.map((takeaway, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed">
                                    <CheckCircle2 size={15} className="text-[#193D35] dark:text-emerald-400 mt-0.5 shrink-0" />
                                    <span>{decodeHtmlEntities(takeaway)}</span>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}

                {/* Main Article Body */}
                <article className="prose prose-slate dark:prose-invert max-w-none">
                    <MarkdownRenderer content={activeArticle.content} />
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
                            to={techTarget.path}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
                        >
                            <Code2 size={14} />
                            <span>{techTarget.label ? `Take ${techTarget.label} Quiz` : 'Explore Technology Quizzes'}</span>
                        </Link>

                        {activeArticle.relatedGameSlug && (
                            <Link
                                to={`/games/${activeArticle.relatedGameSlug}`}
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
                        {activeArticle.authorAvatar || 'HB'}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">About the Author</p>
                        <h3 className="text-base font-bold text-[var(--foreground)]">{activeArticle.authorName || 'Hangbug Editorial Team'}</h3>
                        <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                            {activeArticle.authorBio || 'The Hangbug team creates practical programming quizzes, interactive coding games, and actionable developer tutorials to help software engineers thrive.'}
                        </p>
                    </div>
                </section>

                {/* Related Articles */}
                {relatedArticles.length > 0 && (
                    <section className="space-y-4 pt-6 border-t border-[var(--card-border)]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[var(--foreground)]">
                                Continue Reading Developer Guides
                            </h2>
                            <Link to="/blog" className="text-xs text-[#193D35] dark:text-emerald-400 hover:underline">
                                View all articles
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
