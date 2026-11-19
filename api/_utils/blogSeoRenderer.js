const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

let markdownParser = null;
try {
    markdownParser = require('./blogMarkdownParser.mjs');
} catch {
    // Node < 22 fallback: loaded asynchronously via ensureMarkdownParser()
}

async function ensureMarkdownParser() {
    if (!markdownParser) {
        markdownParser = await import('./blogMarkdownParser.mjs');
    }
    return markdownParser;
}

function getMarkdownParser() {
    if (!markdownParser) {
        throw new Error('Markdown parser not yet initialized. Call ensureMarkdownParser() first.');
    }
    return markdownParser;
}

const decodeHtmlEntities = (...args) => getMarkdownParser().decodeHtmlEntities(...args);
const isSafeLinkUrl = (...args) => getMarkdownParser().isSafeLinkUrl(...args);
const parseInlineTokens = (...args) => getMarkdownParser().parseInlineTokens(...args);
const parseMarkdownBlocks = (...args) => getMarkdownParser().parseMarkdownBlocks(...args);
const stripMarkdownToPlainText = (...args) => getMarkdownParser().stripMarkdownToPlainText(...args);
const countPlainWords = (...args) => getMarkdownParser().countPlainWords(...args);

const BASE_URL = 'https://www.hangbug.com';
const SITE_HOME_URL = 'https://www.hangbug.com/';
const SITE_NAME = 'Hangbug';
const SITE_ALTERNATE_NAME = 'HangBug';
const OFFICIAL_DESCRIPTION =
    'Learn programming, practice interactive technology quizzes, play coding games, track your progress, and earn score-based certificates with Hangbug.';
const DEFAULT_LOGO_URL = 'https://www.hangbug.com/branding/hangbug-logo-full.png';
const SUPPORT_EMAIL = 'support@hangbug.com';
const BLOG_LIST_TITLE = 'Programming & Web Development Blog: Tutorials & Guides | Hangbug';
const BLOG_LIST_DESCRIPTION =
    'Learn programming step-by-step with practical tutorials, coding guides, and interview prep on HTML, CSS, JavaScript, PHP, Laravel, Flutter, C#, and databases.';

const VALID_TECH_SLUGS = new Set([
    'html',
    'css',
    'javascript',
    'react',
    'php',
    'laravel',
    'mysql',
    'mongodb',
    'flutter',
    'dart',
    'python',
    'programming-fundamentals'
]);

const TECH_ALIAS_MAP = {
    'react.js': 'react',
    reactjs: 'react',
    js: 'javascript',
    html5: 'html',
    css3: 'css',
    fundamentals: 'programming-fundamentals',
    'programming-logic': 'programming-fundamentals'
};

function loadEnvIfNeeded() {
    const rootDir = path.resolve(__dirname, '../..');
    const envLocalPath = path.join(rootDir, '.env.local');
    const envPath = path.join(rootDir, '.env');
    if (fs.existsSync(envLocalPath)) {
        dotenv.config({ path: envLocalPath });
    } else if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    }
}

function isMongoUriConfigured(uri) {
    if (!uri || typeof uri !== 'string') return false;
    const trimmed = uri.trim();
    if (!trimmed) return false;
    if (
        trimmed.includes('<username>') ||
        trimmed.includes('<password>') ||
        trimmed.includes('<cluster>')
    ) {
        return false;
    }
    return trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
}

function escapeAttr(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeText(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function safeJsonForScriptTag(payload) {
    return JSON.stringify(payload)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

function normalizeCanonicalUrl(pathOrUrl = '/') {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') return SITE_HOME_URL;
    const trimmed = pathOrUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        if (trimmed === BASE_URL || trimmed === SITE_HOME_URL) return SITE_HOME_URL;
        return trimmed.replace(/\/+$/, '');
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (cleanPath === '/') return SITE_HOME_URL;
    return `${BASE_URL}${cleanPath.replace(/\/+$/, '')}`;
}

function resolveArticleImageUrl(coverImage) {
    if (!coverImage || typeof coverImage !== 'string') return DEFAULT_LOGO_URL;
    const trimmed = coverImage.trim();
    if (!trimmed) return DEFAULT_LOGO_URL;
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
        return trimmed;
    }
    if (trimmed.startsWith('/')) {
        return `${BASE_URL}${trimmed}`;
    }
    return `${BASE_URL}/${trimmed}`;
}

function resolveTechQuizSlug(category, relatedQuizCategory) {
    const candidates = [relatedQuizCategory, category].filter(Boolean);
    for (const candidate of candidates) {
        const raw = String(candidate).toLowerCase().trim().replace(/\s+/g, '-');
        const resolved = TECH_ALIAS_MAP[raw] || raw;
        if (VALID_TECH_SLUGS.has(resolved)) {
            return resolved;
        }
    }
    return null;
}

function resolveTechQuizPath(category, relatedQuizCategory) {
    const slug = resolveTechQuizSlug(category, relatedQuizCategory);
    return slug ? `/technologies/${slug}` : '/technologies';
}

function toIsoDate(value, fallback = '2026-08-01T00:00:00.000Z') {
    if (!value) return fallback;
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return fallback;
        return d.toISOString();
    } catch {
        return fallback;
    }
}

function formatReadableDate(dateString) {
    if (!dateString) return 'Recent';
    try {
        const d = new Date(dateString);
        if (Number.isNaN(d.getTime())) return 'Recent';
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Recent';
    }
}

function truncateAtWordBoundary(text, maxLength = 158) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    if (clean.length <= maxLength) return clean;
    const sliced = clean.slice(0, maxLength - 3);
    const lastSpace = sliced.lastIndexOf(' ');
    return `${(lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced).trim()}...`;
}

function buildArticleSeoDescription(article) {
    const seoDesc = typeof article?.seoDescription === 'string' ? article.seoDescription.trim() : '';
    if (seoDesc) return seoDesc;

    const excerpt = typeof article?.excerpt === 'string' ? article.excerpt.trim() : '';
    if (excerpt) return truncateAtWordBoundary(excerpt, 160);

    const plainContent = stripMarkdownToPlainText(article?.content || '');
    if (plainContent) return truncateAtWordBoundary(plainContent, 160);

    return `${article?.title || 'Programming Guide'} — Developer tutorial and practical guide on Hangbug.`;
}

function buildArticleSeoTitle(article) {
    const seoTitle = typeof article?.seoTitle === 'string' ? article.seoTitle.trim() : '';
    if (seoTitle) return seoTitle;
    return `${article?.title || 'Article'} | Hangbug`;
}

function isOrganizationAuthor(authorName) {
    const name = String(authorName || '').trim().toLowerCase();
    return !name || name.includes('hangbug') || name.includes('editorial') || name.includes('team');
}

function buildArticleBreadcrumbs(article) {
    const crumbs = [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' }
    ];
    if (article?.category && String(article.category).trim()) {
        crumbs.push({
            name: String(article.category).trim(),
            path: `/blog?category=${encodeURIComponent(String(article.category).trim())}`
        });
    }
    if (article?.title && article?.slug) {
        crumbs.push({
            name: String(article.title).trim(),
            path: `/blog/${article.slug}`
        });
    }
    return crumbs;
}

function buildArticleSeoMeta(article) {
    const slug = String(article.slug || '').trim();
    const canonicalPath = `/blog/${slug}`;
    const canonicalUrl = normalizeCanonicalUrl(canonicalPath);
    const title = buildArticleSeoTitle(article);
    const description = buildArticleSeoDescription(article);
    const ogImage = resolveArticleImageUrl(article.coverImage);
    const ogImageAlt = `${article.title} — Hangbug`;
    const datePublished = toIsoDate(article.publishedAt || article.createdAt);
    const dateModified = toIsoDate(article.updatedAt || article.publishedAt || article.createdAt, datePublished);
    const breadcrumbs = buildArticleBreadcrumbs(article);

    return {
        title,
        description,
        canonicalPath,
        canonicalUrl,
        ogType: 'article',
        ogImage,
        ogImageAlt,
        datePublished,
        dateModified,
        breadcrumbs
    };
}

function buildOrganizationNode() {
    return {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        url: SITE_HOME_URL,
        logo: {
            '@type': 'ImageObject',
            '@id': `${BASE_URL}/#logo`,
            url: DEFAULT_LOGO_URL,
            contentUrl: DEFAULT_LOGO_URL,
            width: 1024,
            height: 1024,
            caption: 'Hangbug – Technology Learning, Programming Quizzes & Skill Assessment Platform'
        },
        image: DEFAULT_LOGO_URL,
        description: OFFICIAL_DESCRIPTION,
        email: SUPPORT_EMAIL,
        contactPoint: [
            {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: SUPPORT_EMAIL,
                url: `${BASE_URL}/contact`,
                availableLanguage: ['English']
            }
        ]
    };
}

function buildWebSiteNode() {
    return {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: SITE_HOME_URL,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAME,
        description: OFFICIAL_DESCRIPTION,
        inLanguage: 'en',
        publisher: {
            '@id': `${BASE_URL}/#organization`
        }
    };
}

function buildBreadcrumbListNode(breadcrumbs, pageUrl) {
    return {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: String(crumb.name || '').trim(),
            item: normalizeCanonicalUrl(crumb.url || crumb.path || '/')
        }))
    };
}

function buildBlogArticleStructuredData(article) {
    const meta = buildArticleSeoMeta(article);
    const pageUrl = meta.canonicalUrl;
    const authorName = (article.authorName || 'Hangbug Editorial Team').trim();
    const authorIsOrg = isOrganizationAuthor(authorName);
    const wordCount = countPlainWords(article.content || article.excerpt || '');

    const articleNode = {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        url: pageUrl,
        mainEntityOfPage: {
            '@id': `${pageUrl}#webpage`
        },
        headline: article.title,
        description: article.excerpt || meta.description,
        image: [meta.ogImage],
        datePublished: meta.datePublished,
        dateModified: meta.dateModified,
        author: {
            '@type': authorIsOrg ? 'Organization' : 'Person',
            name: authorName,
            url: SITE_HOME_URL
        },
        publisher: {
            '@id': `${BASE_URL}/#organization`
        },
        inLanguage: 'en'
    };

    if (article.category) {
        articleNode.articleSection = article.category;
    }
    if (Array.isArray(article.tags) && article.tags.length > 0) {
        articleNode.keywords = article.tags.join(', ');
    }
    if (wordCount > 0) {
        articleNode.wordCount = wordCount;
    }

    const breadcrumbNode = buildBreadcrumbListNode(meta.breadcrumbs, pageUrl);

    const webPageNode = {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        inLanguage: 'en',
        isPartOf: {
            '@id': `${BASE_URL}/#website`
        },
        about: {
            '@id': `${BASE_URL}/#organization`
        },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: meta.ogImage
        },
        breadcrumb: {
            '@id': breadcrumbNode['@id']
        },
        mainEntity: {
            '@id': articleNode['@id']
        },
        datePublished: meta.datePublished,
        dateModified: meta.dateModified
    };

    return {
        '@context': 'https://schema.org',
        '@graph': [
            buildOrganizationNode(),
            buildWebSiteNode(),
            breadcrumbNode,
            webPageNode,
            articleNode
        ]
    };
}

function buildBlogIndexStructuredData(articles = []) {
    const pageUrl = normalizeCanonicalUrl('/blog');
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' }
    ];
    const breadcrumbNode = buildBreadcrumbListNode(breadcrumbs, pageUrl);
    const validArticles = (Array.isArray(articles) ? articles : []).filter(a => a && a.slug && a.title);

    const graph = [
        buildOrganizationNode(),
        buildWebSiteNode(),
        breadcrumbNode
    ];

    let mainEntityId;
    if (validArticles.length > 0) {
        const itemListNode = {
            '@type': 'ItemList',
            '@id': `${pageUrl}#itemlist`,
            name: 'Hangbug Programming Tutorials & Guides',
            description: BLOG_LIST_DESCRIPTION,
            numberOfItems: validArticles.length,
            itemListElement: validArticles.map((art, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: art.title,
                url: normalizeCanonicalUrl(`/blog/${art.slug}`),
                ...(art.excerpt ? { description: art.excerpt } : {})
            }))
        };
        graph.push(itemListNode);
        mainEntityId = itemListNode['@id'];
    }

    graph.push({
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: BLOG_LIST_TITLE,
        description: BLOG_LIST_DESCRIPTION,
        inLanguage: 'en',
        isPartOf: {
            '@id': `${BASE_URL}/#website`
        },
        about: {
            '@id': `${BASE_URL}/#organization`
        },
        primaryImageOfPage: {
            '@type': 'ImageObject',
            url: DEFAULT_LOGO_URL
        },
        breadcrumb: {
            '@id': breadcrumbNode['@id']
        },
        ...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {})
    });

    return {
        '@context': 'https://schema.org',
        '@graph': graph
    };
}

const UNPUBLISHED_BLOG_FALLBACK_PATHS = {
    'mysql-database-tutorial-beginners': '/technologies/mysql',
    'csharp-programming-beginners-guide': '/technologies',
    'programming-interview-questions-beginners': '/technologies/programming-fundamentals',
    'improve-programming-skills-coding-practice': '/games',
    'php-interview-questions': '/technologies/php',
    'laravel-interview-questions': '/technologies/laravel',
    '50-html-interview-questions-and-answers': '/technologies/html',
    '50-css-interview-questions-and-answers': '/technologies/css',
    'javascript-mcqs-for-beginners': '/technologies/javascript',
    'mysql-practice-questions': '/technologies/mysql'
};

function sanitizeInternalBlogHref(rawHref, publishedSlugSet = null) {
    const href = String(rawHref || '#').trim();
    if (!isSafeLinkUrl(href)) return null;
    const isExternal = /^https?:\/\//i.test(href) && !href.startsWith(BASE_URL);
    if (isExternal) return { href, isExternal: true };

    const rawPath = href.startsWith(BASE_URL) ? (href.slice(BASE_URL.length) || '/') : href;
    const [pathOnly, query] = rawPath.split('?');
    const clean = pathOnly === '/' ? '/' : pathOnly.replace(/\/+$/, '');
    if (clean.startsWith('/blog/')) {
        const slug = clean.slice('/blog/'.length).toLowerCase();
        if (UNPUBLISHED_BLOG_FALLBACK_PATHS[slug]) {
            return { href: UNPUBLISHED_BLOG_FALLBACK_PATHS[slug], isExternal: false };
        }
        if (publishedSlugSet && !publishedSlugSet.has(slug)) {
            return { href: '/blog', isExternal: false };
        }
    }
    const redirectMap = {
        '/technologies/reactjs': '/technologies/react',
        '/technologies/react.js': '/technologies/react',
        '/technologies/js': '/technologies/javascript',
        '/technologies/html5': '/technologies/html',
        '/technologies/css3': '/technologies/css',
        '/technologies/fundamentals': '/technologies/programming-fundamentals',
        '/technologies/programming-logic': '/technologies/programming-fundamentals',
        '/games/coding-memory-match': '/games/memory-match',
        '/privacy': '/privacy-policy',
        '/resources': '/blog',
        '/quizzes': '/technologies',
        '/quiz': '/technologies',
        '/leaderboard/full': '/leaderboard'
    };
    const resolved = redirectMap[clean.toLowerCase()] || clean;
    return { href: query ? `${resolved}?${query}` : resolved, isExternal: false };
}

function renderInlineTokensToHtml(tokens, publishedSlugSet = null) {
    return (tokens || [])
        .map((token) => {
            if (token.type === 'text') {
                return escapeText(token.value);
            }
            if (token.type === 'code') {
                return `<code class="px-1.5 py-0.5 rounded bg-[var(--muted-bg)] text-[#193D35] dark:text-emerald-400 font-mono text-xs border border-[var(--card-border)]">${escapeText(token.value)}</code>`;
            }
            if (token.type === 'strong') {
                return `<strong class="font-bold text-[var(--foreground)]">${renderInlineTokensToHtml(token.tokens, publishedSlugSet)}</strong>`;
            }
            if (token.type === 'em') {
                return `<em class="italic">${renderInlineTokensToHtml(token.tokens, publishedSlugSet)}</em>`;
            }
            if (token.type === 'link') {
                const resolved = sanitizeInternalBlogHref(token.href, publishedSlugSet);
                if (!resolved) {
                    return renderInlineTokensToHtml(token.tokens, publishedSlugSet);
                }
                const extraAttrs = resolved.isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `<a href="${escapeAttr(resolved.href)}"${extraAttrs} class="font-semibold text-[#193D35] dark:text-emerald-400 underline decoration-[#193D35]/40 hover:decoration-[#193D35]">${renderInlineTokensToHtml(token.tokens, publishedSlugSet)}</a>`;
            }
            return '';
        })
        .join('');
}

function renderInlineMarkdownToHtml(text, publishedSlugSet = null) {
    return renderInlineTokensToHtml(parseInlineTokens(text), publishedSlugSet);
}

function renderMarkdownToHtml(content, publishedSlugSet = null) {
    const blocks = parseMarkdownBlocks(content);
    if (blocks.length === 0) return '';

    const htmlParts = blocks.map((block) => {
        switch (block.type) {
            case 'code': {
                const lang = escapeText(block.language || 'code');
                const code = escapeText(block.value || '');
                return `
                  <div class="my-6 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl font-mono text-xs">
                    <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                      <span class="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">${lang}</span>
                    </div>
                    <pre class="p-4 overflow-x-auto text-slate-200 leading-relaxed font-mono"><code>${code}</code></pre>
                  </div>`;
            }
            case 'heading': {
                const inner = renderInlineMarkdownToHtml(block.text, publishedSlugSet);
                const idAttr = block.id ? ` id="${escapeAttr(block.id)}"` : '';
                if (block.level === 2) {
                    return `<h2${idAttr} class="text-xl sm:text-2xl font-black text-[var(--foreground)] pt-6 pb-2 border-b border-[var(--card-border)]">${inner}</h2>`;
                }
                if (block.level === 4) {
                    return `<h4${idAttr} class="text-base sm:text-lg font-bold text-[var(--foreground)] pt-3 pb-1">${inner}</h4>`;
                }
                return `<h3${idAttr} class="text-lg sm:text-xl font-black text-[var(--foreground)] pt-4 pb-1">${inner}</h3>`;
            }
            case 'hr':
                return '<hr class="my-8 border-[var(--card-border)]" />';
            case 'blockquote':
                return `<blockquote class="my-4 pl-4 border-l-4 border-[#193D35] dark:border-emerald-400 bg-[var(--muted-bg)]/50 py-3 pr-4 rounded-r-xl text-sm text-[var(--foreground)] leading-relaxed">${block.lines.map(l => `<p>${renderInlineMarkdownToHtml(l, publishedSlugSet)}</p>`).join('')}</blockquote>`;
            case 'ul':
                return `<ul class="my-4 space-y-2 list-none pl-1">${block.items.map(item => `<li class="flex items-start gap-2 text-sm text-[var(--foreground)] leading-relaxed"><span class="text-[#193D35] dark:text-emerald-400 mt-1 shrink-0" aria-hidden="true">•</span><span>${renderInlineMarkdownToHtml(item, publishedSlugSet)}</span></li>`).join('')}</ul>`;
            case 'ol':
                return `<ol class="my-4 space-y-2 list-decimal pl-6 text-sm text-[var(--foreground)] leading-relaxed">${block.items.map(item => `<li>${renderInlineMarkdownToHtml(item, publishedSlugSet)}</li>`).join('')}</ol>`;
            case 'table': {
                const headHtml = block.headers
                    .map((h, idx) => `<th class="px-4 py-2.5 text-left text-xs font-bold text-[var(--foreground)] border-b border-[var(--card-border)]" style="text-align:${block.alignments[idx] || 'left'}">${renderInlineMarkdownToHtml(h, publishedSlugSet)}</th>`)
                    .join('');
                const bodyHtml = block.rows
                    .map(row => `<tr class="border-b border-[var(--card-border)]/60 last:border-b-0">${row.map((cell, idx) => `<td class="px-4 py-2.5 text-xs sm:text-sm text-[var(--foreground)]" style="text-align:${block.alignments[idx] || 'left'}">${renderInlineMarkdownToHtml(cell, publishedSlugSet)}</td>`).join('')}</tr>`)
                    .join('');
                return `<div class="my-6 overflow-x-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)]"><table class="w-full border-collapse text-left"><thead class="bg-[var(--muted-bg)]/60"><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
            }
            case 'paragraph':
            default:
                return `<p class="text-sm sm:text-base text-[var(--foreground)] leading-relaxed">${renderInlineMarkdownToHtml(block.text, publishedSlugSet)}</p>`;
        }
    });

    return `<div class="article-body space-y-6 text-[var(--foreground)] text-sm sm:text-base leading-relaxed">${htmlParts.join('\n')}</div>`;
}

function renderStaticNavbarHtml({ activeNav = 'blog' } = {}) {
    const blogLinkClass = activeNav === 'blog'
        ? 'px-3.5 py-1.5 rounded-lg bg-[var(--card-bg)] text-[#193D35] dark:text-emerald-300 border border-[var(--card-border)]'
        : 'px-3.5 py-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)]';
    return `
      <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--card-border)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" class="flex items-center gap-2 font-display font-extrabold text-lg text-[var(--foreground)]">
            <img src="/branding/hangbug-logo-compact.png" alt="HangBug developer platform logo" width="140" height="48" class="h-8 w-auto object-contain" />
          </a>
          <nav aria-label="Primary Navigation" class="hidden md:flex items-center gap-1 bg-[var(--muted-bg)]/80 p-1 rounded-xl border border-[var(--card-border)] text-xs font-semibold">
            <a href="/" class="px-3.5 py-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Home</a>
            <a href="/technologies" class="px-3.5 py-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Quizzes</a>
            <a href="/games" class="px-3.5 py-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Games</a>
            <a href="/blog" class="${blogLinkClass}">Blog</a>
            <a href="/leaderboard" class="px-3.5 py-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Leaderboard</a>
          </nav>
          <div class="flex items-center gap-2 text-xs font-semibold">
            <a href="/login" class="px-3 py-1.5 rounded-xl text-[var(--foreground-secondary)] hover:text-[var(--foreground)]">Sign In</a>
            <a href="/register" class="btn-primary text-xs py-2 px-4">Get Started</a>
          </div>
        </div>
      </header>`;
}

function renderStaticFooterHtml() {
    const year = new Date().getFullYear();
    return `
      <footer class="prerender-seo-footer w-full border-t border-[var(--card-border)] bg-[var(--card-bg)] pt-8 pb-6 px-4 sm:px-6 lg:px-8 shrink-0 mt-auto">
        <section class="max-w-7xl mx-auto space-y-6">
          <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <section class="space-y-2.5">
              <p class="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Technologies</p>
              <ul class="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                <li><a href="/technologies" class="hover:text-[var(--foreground)] font-semibold">All Technologies</a></li>
                <li><a href="/technologies/html" class="hover:text-[var(--foreground)]">HTML Quizzes</a></li>
                <li><a href="/technologies/css" class="hover:text-[var(--foreground)]">CSS Quizzes</a></li>
                <li><a href="/technologies/javascript" class="hover:text-[var(--foreground)]">JavaScript Quizzes</a></li>
                <li><a href="/technologies/react" class="hover:text-[var(--foreground)]">React.js Quizzes</a></li>
                <li><a href="/technologies/python" class="hover:text-[var(--foreground)]">Python Quizzes</a></li>
                <li><a href="/technologies/php" class="hover:text-[var(--foreground)]">PHP Quizzes</a></li>
                <li><a href="/technologies/laravel" class="hover:text-[var(--foreground)]">Laravel Quizzes</a></li>
                <li><a href="/technologies/mysql" class="hover:text-[var(--foreground)]">MySQL Quizzes</a></li>
                <li><a href="/technologies/mongodb" class="hover:text-[var(--foreground)]">MongoDB Quizzes</a></li>
                <li><a href="/technologies/flutter" class="hover:text-[var(--foreground)]">Flutter Quizzes</a></li>
                <li><a href="/technologies/dart" class="hover:text-[var(--foreground)]">Dart Quizzes</a></li>
                <li><a href="/technologies/programming-fundamentals" class="hover:text-[var(--foreground)]">Fundamentals &amp; OOP</a></li>
              </ul>
            </section>
            <section class="space-y-2.5 lg:col-span-2">
              <p class="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Coding &amp; Typing Games</p>
              <ul class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                <li><a href="/games" class="hover:text-[var(--foreground)] font-semibold">All Developer Games</a></li>
                <li><a href="/games/code-puzzle" class="hover:text-[var(--foreground)]">Code Puzzle</a></li>
                <li><a href="/games/find-the-bug" class="hover:text-[var(--foreground)]">Find The Bug</a></li>
                <li><a href="/games/output-predictor" class="hover:text-[var(--foreground)]">Output Predictor</a></li>
                <li><a href="/games/code-scramble" class="hover:text-[var(--foreground)]">Code Scramble</a></li>
                <li><a href="/games/missing-code" class="hover:text-[var(--foreground)]">Missing Code</a></li>
                <li><a href="/games/logic-builder" class="hover:text-[var(--foreground)]">Logic Builder</a></li>
                <li><a href="/games/sql-challenge" class="hover:text-[var(--foreground)]">SQL Challenge</a></li>
                <li><a href="/games/memory-match" class="hover:text-[var(--foreground)]">Memory Match</a></li>
                <li><a href="/games/speed-typing" class="hover:text-[var(--foreground)]">Speed Typing</a></li>
                <li><a href="/games/code-typing" class="hover:text-[var(--foreground)]">Code Typing</a></li>
                <li><a href="/games/sixty-second-challenge" class="hover:text-[var(--foreground)]">60-Second Challenge</a></li>
                <li><a href="/games/error-free-typing" class="hover:text-[var(--foreground)]">Error-Free Typing</a></li>
                <li><a href="/games/syntax-typing" class="hover:text-[var(--foreground)]">Syntax Typing</a></li>
                <li><a href="/games/word-rain" class="hover:text-[var(--foreground)]">Word Rain</a></li>
                <li><a href="/games/complete-the-code" class="hover:text-[var(--foreground)]">Complete The Code</a></li>
                <li><a href="/games/csharp-oop-challenge" class="hover:text-[var(--foreground)]">C# OOP Challenge</a></li>
                <li><a href="/games/csharp-collections-challenge" class="hover:text-[var(--foreground)]">C# Collections</a></li>
                <li><a href="/games/csharp-linq-challenge" class="hover:text-[var(--foreground)]">C# LINQ Challenge</a></li>
                <li><a href="/games/csharp-exception-handling" class="hover:text-[var(--foreground)]">C# Exceptions</a></li>
                <li><a href="/games/csharp-quiz-challenge" class="hover:text-[var(--foreground)]">C# Quiz Challenge</a></li>
              </ul>
            </section>
            <section class="space-y-2.5">
              <p class="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Tutorials &amp; Guides</p>
              <ul class="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                <li><a href="/blog" class="hover:text-[var(--foreground)] font-semibold">All Blog Articles</a></li>
                <li><a href="/blog/html-tutorial-for-beginners" class="hover:text-[var(--foreground)]">HTML Tutorial</a></li>
                <li><a href="/blog/css-basics-beginners-guide" class="hover:text-[var(--foreground)]">CSS Basics Guide</a></li>
                <li><a href="/blog/javascript-fundamentals-beginners-guide" class="hover:text-[var(--foreground)]">JavaScript Fundamentals</a></li>
                <li><a href="/blog/php-programming-beginners-guide" class="hover:text-[var(--foreground)]">PHP Programming Guide</a></li>
                <li><a href="/blog/laravel-basics-mvc-architecture" class="hover:text-[var(--foreground)]">Laravel MVC Guide</a></li>
                <li><a href="/blog/flutter-dart-mobile-app-development" class="hover:text-[var(--foreground)]">Flutter &amp; Dart Guide</a></li>
              </ul>
            </section>
            <section class="space-y-2.5">
              <p class="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Platform &amp; Legal</p>
              <ul class="space-y-1.5 text-xs text-[var(--foreground-muted)] font-medium">
                <li><a href="/leaderboard" class="hover:text-[var(--foreground)]">Global Leaderboard</a></li>
                <li><a href="/about" class="hover:text-[var(--foreground)]">About Hangbug</a></li>
                <li><a href="/contact" class="hover:text-[var(--foreground)]">Contact Support</a></li>
                <li><a href="/privacy-policy" class="hover:text-[var(--foreground)]">Privacy Policy</a></li>
                <li><a href="/terms" class="hover:text-[var(--foreground)]">Terms of Service</a></li>
              </ul>
            </section>
          </section>
          <section class="pt-6 border-t border-[var(--card-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--foreground-muted)]">
            <p>© ${year} Hangbug. All rights reserved.</p>
            <a href="mailto:support@hangbug.com" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)]">
              support@hangbug.com
            </a>
          </section>
        </section>
      </footer>`;
}

function renderBlogDetailBodyHtml(article, relatedArticles = [], publishedSlugs = null) {
    const category = article.category || 'Programming';
    const techPath = resolveTechQuizPath(article.category, article.relatedQuizCategory);
    const hasSpecificTech = techPath !== '/technologies';
    const publishedIso = toIsoDate(article.publishedAt || article.createdAt);
    const publishedLabel = formatReadableDate(article.publishedAt || article.createdAt);
    const takeaways = Array.isArray(article.keyTakeaways) ? article.keyTakeaways.filter(Boolean) : [];
    const publishedSlugSet = publishedSlugs instanceof Set && publishedSlugs.size > 0
        ? publishedSlugs
        : null;
    const articleHtml = renderMarkdownToHtml(article.content || '', publishedSlugSet);
    const relatedList = Array.isArray(relatedArticles) ? relatedArticles.filter(r => r && r.slug) : [];

    return `
    <div class="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      ${renderStaticNavbarHtml()}

      <main class="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs text-[var(--foreground-muted)] overflow-x-auto py-1">
          <a href="/" class="hover:text-[var(--foreground)] transition-colors shrink-0">Home</a>
          <span aria-hidden="true">›</span>
          <a href="/blog" class="hover:text-[var(--foreground)] transition-colors shrink-0">Blog</a>
          <span aria-hidden="true">›</span>
          <span class="font-medium shrink-0">${escapeText(category)}</span>
          <span aria-hidden="true">›</span>
          <span class="text-[var(--foreground)] truncate shrink-0 max-w-[240px] font-semibold">${escapeText(article.title)}</span>
        </nav>

        <header class="space-y-4">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="px-3 py-1 rounded-lg text-xs font-bold border bg-[#193D35]/10 text-[#193D35] dark:text-emerald-400 border-[#193D35]/30">
              ${escapeText(category)}
            </span>
            <span class="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[var(--muted-bg)] border border-[var(--card-border)] text-[var(--foreground-muted)]">
              ${escapeText(article.difficulty || 'Beginner')}
            </span>
            <span class="text-xs text-[var(--foreground-muted)]">
              ${escapeText(String(article.readingTimeMinutes || 8))} min read
            </span>
          </div>

          <h1 class="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight leading-tight">
            ${escapeText(decodeHtmlEntities(article.title))}
          </h1>

          ${article.excerpt ? `<p class="text-base sm:text-lg text-[var(--foreground-muted)] leading-relaxed">${escapeText(decodeHtmlEntities(article.excerpt))}</p>` : ''}

          <div class="pt-4 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#193D35] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                ${escapeText(article.authorAvatar || 'HB')}
              </div>
              <div>
                <p class="text-xs font-bold text-[var(--foreground)]">${escapeText(article.authorName || 'Hangbug Editorial Team')}</p>
                <div class="flex items-center gap-2 text-[11px] text-[var(--foreground-muted)]">
                  <span>${escapeText(article.authorRole || 'Technical Educators & Full-Stack Developers')}</span>
                  <span aria-hidden="true">•</span>
                  <time datetime="${escapeAttr(publishedIso)}">${escapeText(publishedLabel)}</time>
                </div>
              </div>
            </div>
          </div>
        </header>

        ${takeaways.length > 0 ? `
        <aside aria-label="Key takeaways" class="rounded-2xl bg-gradient-to-br from-[#193D35]/10 via-[var(--card-bg)] to-[var(--card-bg)] border border-[#193D35]/30 p-6 space-y-3 shadow-sm">
          <h2 class="text-xs font-bold uppercase tracking-wider text-[#193D35] dark:text-emerald-400">Key Takeaways</h2>
          <ul class="space-y-2">
            ${takeaways.map(t => `<li class="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--foreground)] leading-relaxed"><span class="text-[#193D35] dark:text-emerald-400 font-bold" aria-hidden="true">✓</span><span>${escapeText(decodeHtmlEntities(t))}</span></li>`).join('\n            ')}
          </ul>
        </aside>` : ''}

        <article class="prose prose-slate dark:prose-invert max-w-none">
          ${articleHtml}
        </article>

        <section class="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 border border-emerald-500/30 p-6 sm:p-8 text-white space-y-4 shadow-xl">
          <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-300">Hands-On Practice: Test Your Skills</h2>
          <h3 class="text-xl sm:text-2xl font-black text-white">Mastered this concept? Prove it on Hangbug.</h3>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            Solidify what you just learned with interactive multiple-choice quizzes, bug-fixing challenges, and speed drills designed for developers.
          </p>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="${escapeAttr(techPath)}" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-md">
              <span>${hasSpecificTech ? `Take ${escapeText(category)} Quiz` : 'Explore Technology Quizzes'}</span>
            </a>
            ${article.relatedGameSlug ? `
            <a href="/games/${escapeAttr(article.relatedGameSlug)}" class="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2">
              <span>Play Related Coding Challenge</span>
            </a>` : ''}
          </div>
        </section>

        <section class="rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
          <div class="w-14 h-14 rounded-2xl bg-[#193D35] text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
            ${escapeText(article.authorAvatar || 'HB')}
          </div>
          <div class="space-y-1.5 text-center sm:text-left">
            <p class="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">About the Author</p>
            <h3 class="text-base font-bold text-[var(--foreground)]">${escapeText(article.authorName || 'Hangbug Editorial Team')}</h3>
            <p class="text-xs text-[var(--foreground-muted)] leading-relaxed">
              ${escapeText(article.authorBio || 'The Hangbug team creates practical programming quizzes, interactive coding games, and actionable developer tutorials to help software engineers thrive.')}
            </p>
          </div>
        </section>

        ${relatedList.length > 0 ? `
        <section class="space-y-4 pt-6 border-t border-[var(--card-border)]">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-[var(--foreground)]">Continue Reading Developer Guides</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            ${relatedList.map(rel => `
            <a href="/blog/${escapeAttr(rel.slug)}" class="group rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-4 space-y-2.5 flex flex-col justify-between">
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border border-[var(--card-border)] text-[var(--foreground)]">${escapeText(rel.category || category)}</span>
                  <span class="text-[10px] text-[var(--foreground-muted)]">${escapeText(String(rel.readingTimeMinutes || 8))} min</span>
                </div>
                <h3 class="text-xs font-bold text-[var(--foreground)] leading-snug">${escapeText(rel.title)}</h3>
              </div>
              <div class="text-[11px] font-semibold text-[#193D35] dark:text-emerald-400 pt-2 border-t border-[var(--card-border)]">
                Read Guide →
              </div>
            </a>`).join('\n            ')}
          </div>
        </section>` : ''}
      </main>

      ${renderStaticFooterHtml()}
    </div>`;
}

function renderBlogListBodyHtml({ articles = [], featuredArticle = null, categories = [], total = 0 }) {
    const validArticles = (Array.isArray(articles) ? articles : []).filter(a => a && a.slug && a.title);
    const totalCount = total || validArticles.length;
    const featured = featuredArticle || validArticles.find(a => a.isFeatured) || validArticles[0] || null;
    const gridArticles = featured ? validArticles.filter(a => a.slug !== featured.slug) : validArticles;

    return `
    <div class="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-300">
      ${renderStaticNavbarHtml()}

      <main class="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        <section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#193D35]/15 via-[var(--card-bg)] to-[var(--muted-bg)] border border-[var(--card-border)] p-8 sm:p-12 shadow-sm">
          <div class="relative z-10 max-w-3xl space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#193D35]/10 text-[#193D35] dark:text-emerald-400 border border-[#193D35]/20">
              <span>Hangbug Educational Blog &amp; Guides</span>
            </div>
            <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-[var(--foreground)] leading-tight">
              Learn Programming <span class="text-[#193D35] dark:text-emerald-400">Step by Step</span>
            </h1>
            <p class="text-sm sm:text-base text-[var(--foreground-muted)] leading-relaxed">
              In-depth programming tutorials, clean code architectures, practical beginner guides, and software engineering interview questions designed to help you write cleaner code and master modern technologies.
            </p>
          </div>
        </section>

        ${categories.length > 0 ? `
        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Browse by Technology</h2>
            <span class="text-xs text-[var(--foreground-muted)]">${totalCount} ${totalCount === 1 ? 'article' : 'articles'}</span>
          </div>
          <div aria-label="Blog Categories" class="flex flex-wrap items-center gap-2">
            <span class="px-4 py-2 rounded-xl text-xs font-semibold border bg-[#193D35] text-white border-[#193D35]">All Topics (${totalCount})</span>
            ${categories.map(cat => `<span class="px-3.5 py-2 rounded-xl text-xs font-medium border bg-[var(--card-bg)] text-[var(--foreground-muted)] border-[var(--card-border)]">${escapeText(cat.name)} (${escapeText(String(cat.count || 0))})</span>`).join('\n            ')}
          </div>
        </section>` : ''}

        ${featured ? `
        <section class="space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Featured Guide</h2>
          <article class="relative rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 sm:p-8 shadow-md">
            <div class="space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--card-border)]">${escapeText(featured.category)}</span>
                <span class="text-xs text-[var(--foreground-muted)]">${escapeText(String(featured.readingTimeMinutes || 8))} min read</span>
                <span class="text-xs text-[var(--foreground-muted)]">• ${escapeText(formatReadableDate(featured.publishedAt))}</span>
              </div>
              <h3 class="text-2xl sm:text-3xl font-black text-[var(--foreground)] leading-snug">
                ${escapeText(featured.title)}
              </h3>
              <p class="text-sm text-[var(--foreground-muted)] leading-relaxed">${escapeText(featured.excerpt || '')}</p>
              <div class="pt-2">
                <a href="/blog/${escapeAttr(featured.slug)}" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#193D35] text-white font-semibold text-xs after:absolute after:inset-0">Read Tutorial →</a>
              </div>
            </div>
          </article>
        </section>` : ''}

        <section class="space-y-6">
          <h2 class="text-lg font-bold text-[var(--foreground)]">Latest Articles &amp; Guides</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${gridArticles.map(article => `
            <article class="relative flex flex-col justify-between rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6">
              <div class="space-y-3.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold border border-[var(--card-border)]">${escapeText(article.category)}</span>
                  <span class="text-[11px] text-[var(--foreground-muted)]">${escapeText(String(article.readingTimeMinutes || 8))} min read</span>
                </div>
                <h3 class="text-base font-bold text-[var(--foreground)] leading-snug">
                  ${escapeText(article.title)}
                </h3>
                <p class="text-xs text-[var(--foreground-muted)] leading-relaxed">${escapeText(article.excerpt || '')}</p>
              </div>
              <div class="pt-4 mt-4 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                <span class="text-[11px]">${escapeText(formatReadableDate(article.publishedAt))}</span>
                <a href="/blog/${escapeAttr(article.slug)}" class="font-semibold text-[#193D35] dark:text-emerald-400 after:absolute after:inset-0">Read →</a>
              </div>
            </article>`).join('\n            ')}
          </div>
        </section>

        <section class="rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 text-white space-y-4">
          <h2 class="text-xl font-black text-white">Practice What You Learn on Hangbug</h2>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Apply these tutorials immediately across interactive coding quizzes, debugging games, and developer typing challenges:
          </p>
          <div class="flex flex-wrap gap-2">
            <a href="/technologies/html" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">HTML Quizzes</a>
            <a href="/technologies/css" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">CSS Quizzes</a>
            <a href="/technologies/javascript" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">JavaScript Quizzes</a>
            <a href="/technologies/react" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">React.js Quizzes</a>
            <a href="/technologies/php" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">PHP Quizzes</a>
            <a href="/technologies/laravel" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Laravel Quizzes</a>
            <a href="/technologies/mysql" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">MySQL Quizzes</a>
            <a href="/technologies/mongodb" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">MongoDB Quizzes</a>
            <a href="/technologies/flutter" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Flutter Quizzes</a>
            <a href="/technologies/dart" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Dart Quizzes</a>
            <a href="/technologies/python" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Python Quizzes</a>
            <a href="/games/code-puzzle" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Code Puzzle</a>
            <a href="/games/find-the-bug" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">Find the Bug</a>
            <a href="/games/sql-challenge" class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-xs font-semibold text-emerald-100">SQL Challenge</a>
          </div>
        </section>
      </main>

      ${renderStaticFooterHtml()}
    </div>`;
}

function renderVisible404BodyHtml() {
    return `
    <div class="min-h-screen bg-[var(--page-bg)] text-[var(--foreground)] flex flex-col">
      ${renderStaticNavbarHtml({ activeNav: null })}
      <main class="flex-1 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center">
        <div class="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 sm:p-12 shadow-sm space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20">
            <span>HTTP 404 — Page Not Found</span>
          </div>
          <div class="space-y-2">
            <h1 class="text-6xl sm:text-7xl font-display font-black tracking-tight text-[var(--foreground)]">404</h1>
            <h2 class="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">Oops! Lost in the Code?</h2>
            <p class="text-xs sm:text-sm text-[var(--foreground-muted)] max-w-sm mx-auto leading-relaxed">
              The page or resource you are trying to access does not exist, has been moved, or is temporarily unavailable.
            </p>
          </div>
          <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/" class="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-3 px-6 rounded-xl font-bold">Return to Home</a>
            <a href="/blog" class="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs py-3 px-5 rounded-xl font-semibold border border-[var(--card-border)]">Browse Blog</a>
          </div>
        </div>
      </main>
      ${renderStaticFooterHtml()}
    </div>`;
}

function replaceOrInsertMeta(html, attrName, attrValue, content) {
    const safeContent = escapeAttr(content);
    const regex = new RegExp(`<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
    const altRegex = new RegExp(`<meta\\s+content="[^"]*"\\s+${attrName}="${attrValue}"\\s*\\/?>`, 'i');
    const tag = `<meta ${attrName}="${attrValue}" content="${safeContent}" />`;

    if (regex.test(html)) {
        return html.replace(regex, () => tag);
    }
    if (altRegex.test(html)) {
        return html.replace(altRegex, () => tag);
    }
    return html.replace('</head>', () => `    ${tag}\n  </head>`);
}

function removeMetaTag(html, attrName, attrValue) {
    const regex = new RegExp(`\\s*<meta\\s+${attrName}="${attrValue}"[^>]*\\/?>`, 'gi');
    return html.replace(regex, '');
}

function replaceRootHtml(html, innerHtml) {
    const rootPattern = /<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/;
    if (rootPattern.test(html)) {
        return html.replace(rootPattern, () => `<div id="root">\n${innerHtml}\n    </div>`);
    }
    return html;
}

function applyHeadMetadata(baseHtml, {
    title,
    description,
    canonicalUrl,
    robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    ogType = 'website',
    ogImage = DEFAULT_LOGO_URL,
    ogImageAlt = 'Hangbug – Technology Learning, Programming Quizzes & Skill Assessment Platform',
    articleMeta = null,
    omitCanonical = false,
    jsonLd = null,
    embeddedScriptId = null,
    embeddedData = null,
    bodyHtml = ''
} = {}) {
    let html = baseHtml;

    // Clean any previously injected article/blog embedded tags to stay idempotent
    html = removeMetaTag(html, 'property', 'article:published_time');
    html = removeMetaTag(html, 'property', 'article:modified_time');
    html = removeMetaTag(html, 'property', 'article:section');
    html = removeMetaTag(html, 'property', 'article:tag');
    html = html.replace(/\s*<script id="hangbug-blog-data" type="application\/json">[\s\S]*?<\/script>/gi, '');
    html = html.replace(/\s*<script id="hangbug-blog-list-data" type="application\/json">[\s\S]*?<\/script>/gi, '');

    if (title) {
        html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeText(title)}</title>`);
        html = replaceOrInsertMeta(html, 'property', 'og:title', title);
        html = replaceOrInsertMeta(html, 'name', 'twitter:title', title);
    }

    if (description) {
        html = replaceOrInsertMeta(html, 'name', 'description', description);
        html = replaceOrInsertMeta(html, 'property', 'og:description', description);
        html = replaceOrInsertMeta(html, 'name', 'twitter:description', description);
    }

    html = replaceOrInsertMeta(html, 'name', 'robots', robots);

    if (omitCanonical || !canonicalUrl) {
        html = html.replace(/\s*<link\s+rel="canonical"[^>]*\/?>/gi, '');
        html = removeMetaTag(html, 'property', 'og:url');
        html = removeMetaTag(html, 'name', 'twitter:url');
    } else {
        const canonicalTag = `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`;
        html = html.replace(/\s*<link\s+rel="canonical"[^>]*\/?>/gi, '');
        html = html.replace(/(<meta\s+name="description"[^>]*\/?>)/i, (_, m) => `${m}\n    ${canonicalTag}`);
        html = replaceOrInsertMeta(html, 'property', 'og:url', canonicalUrl);
        html = replaceOrInsertMeta(html, 'name', 'twitter:url', canonicalUrl);
    }

    html = replaceOrInsertMeta(html, 'property', 'og:type', ogType);
    html = replaceOrInsertMeta(html, 'property', 'og:site_name', SITE_NAME);

    const resolvedImage = ogImage || DEFAULT_LOGO_URL;
    html = replaceOrInsertMeta(html, 'property', 'og:image', resolvedImage);
    html = replaceOrInsertMeta(html, 'property', 'og:image:alt', ogImageAlt);
    if (resolvedImage !== DEFAULT_LOGO_URL) {
        html = removeMetaTag(html, 'property', 'og:image:width');
        html = removeMetaTag(html, 'property', 'og:image:height');
    }

    html = replaceOrInsertMeta(html, 'name', 'twitter:card', 'summary_large_image');
    html = replaceOrInsertMeta(html, 'name', 'twitter:image', resolvedImage);
    html = replaceOrInsertMeta(html, 'name', 'twitter:image:alt', ogImageAlt);

    if (ogType === 'article' && articleMeta) {
        const extraTags = [];
        if (articleMeta.datePublished) {
            extraTags.push(`<meta property="article:published_time" content="${escapeAttr(articleMeta.datePublished)}" />`);
        }
        if (articleMeta.dateModified) {
            extraTags.push(`<meta property="article:modified_time" content="${escapeAttr(articleMeta.dateModified)}" />`);
        }
        if (articleMeta.section) {
            extraTags.push(`<meta property="article:section" content="${escapeAttr(articleMeta.section)}" />`);
        }
        if (Array.isArray(articleMeta.tags)) {
            for (const tag of articleMeta.tags.slice(0, 8)) {
                if (tag) extraTags.push(`<meta property="article:tag" content="${escapeAttr(tag)}" />`);
            }
        }
        if (extraTags.length > 0) {
            html = html.replace('</head>', () => `    ${extraTags.join('\n    ')}\n  </head>`);
        }
    }

    if (jsonLd) {
        const jsonLdStr = safeJsonForScriptTag(jsonLd);
        const jsonLdTag = `<script id="hangbug-jsonld" type="application/ld+json">\n${jsonLdStr}\n    </script>`;
        if (/<script id="hangbug-jsonld"[^>]*>[\s\S]*?<\/script>/i.test(html)) {
            html = html.replace(/<script id="hangbug-jsonld"[^>]*>[\s\S]*?<\/script>/i, () => jsonLdTag);
        } else {
            html = html.replace('</head>', () => `    ${jsonLdTag}\n  </head>`);
        }
    } else {
        html = html.replace(/\s*<script id="hangbug-jsonld"[^>]*>[\s\S]*?<\/script>/gi, '');
    }

    if (embeddedScriptId && embeddedData !== null && embeddedData !== undefined) {
        const dataScript = `<script id="${escapeAttr(embeddedScriptId)}" type="application/json">${safeJsonForScriptTag(embeddedData)}</script>`;
        html = html.replace('</head>', () => `    ${dataScript}\n  </head>`);
    }

    if (typeof bodyHtml === 'string') {
        html = replaceRootHtml(html, bodyHtml);
    }

    return html;
}

function renderCompleteBlogArticleHtml(baseHtml, article, relatedArticles = []) {
    const meta = buildArticleSeoMeta(article);
    const jsonLd = buildBlogArticleStructuredData(article);
    const bodyHtml = renderBlogDetailBodyHtml(article, relatedArticles);

    return applyHeadMetadata(baseHtml, {
        title: meta.title,
        description: meta.description,
        canonicalUrl: meta.canonicalUrl,
        ogType: 'article',
        ogImage: meta.ogImage,
        ogImageAlt: meta.ogImageAlt,
        articleMeta: {
            datePublished: meta.datePublished,
            dateModified: meta.dateModified,
            section: article.category,
            tags: article.tags
        },
        jsonLd,
        embeddedScriptId: 'hangbug-blog-data',
        embeddedData: { article, relatedArticles },
        bodyHtml
    });
}

function renderCompleteBlogIndexHtml(baseHtml, { articles = [], featuredArticle = null, categories = [], total = 0 }) {
    const jsonLd = buildBlogIndexStructuredData(articles);
    const bodyHtml = renderBlogListBodyHtml({ articles, featuredArticle, categories, total });

    return applyHeadMetadata(baseHtml, {
        title: BLOG_LIST_TITLE,
        description: BLOG_LIST_DESCRIPTION,
        canonicalUrl: normalizeCanonicalUrl('/blog'),
        ogType: 'website',
        ogImage: DEFAULT_LOGO_URL,
        ogImageAlt: 'Hangbug Programming & Web Development Blog',
        jsonLd,
        embeddedScriptId: 'hangbug-blog-list-data',
        embeddedData: {
            articles,
            featuredArticle,
            categories,
            total: total || articles.length
        },
        bodyHtml
    });
}

function deriveCategoriesFromArticles(articles = []) {
    const { BLOG_CATEGORIES } = require('../_models/blogPostModel');
    const counts = {};
    for (const art of articles) {
        if (art?.category) {
            const key = String(art.category).toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        }
    }
    const knownNames = new Set(BLOG_CATEGORIES.map(c => c.name.toLowerCase()));
    const result = BLOG_CATEGORIES.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        count: counts[cat.name.toLowerCase()] || counts[cat.slug.toLowerCase()] || 0
    })).filter(c => c.count > 0);

    for (const art of articles) {
        if (art?.category && !knownNames.has(String(art.category).toLowerCase())) {
            const lower = String(art.category).toLowerCase();
            knownNames.add(lower);
            result.push({
                name: art.category,
                slug: lower.replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
                description: '',
                count: counts[lower] || 1
            });
        }
    }
    return result;
}

function findRelatedForArticle(article, allPublished) {
    if (!article) return [];
    const artTags = Array.isArray(article.tags) ? article.tags : [];
    return allPublished
        .filter(a => a.slug !== article.slug && a.isPublished !== false)
        .filter(a => a.category === article.category || (Array.isArray(a.tags) && a.tags.some(t => artTags.includes(t))))
        .slice(0, 3)
        .map(a => ({
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            readingTimeMinutes: a.readingTimeMinutes,
            coverGradient: a.coverGradient,
            publishedAt: a.publishedAt
        }));
}

async function fetchJsonWithTimeout(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return null;
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Fetches actual published blog records from MongoDB via Prisma.
 * When MONGODB_URI is not configured/placeholder in local dev, optionally fetches
 * live published MongoDB records from the production API before offline static fallback.
 */
async function fetchPublishedBlogPostsFromSource({ allowRemoteApiFallback = false } = {}) {
    loadEnvIfNeeded();

    if (isMongoUriConfigured(process.env.MONGODB_URI)) {
        try {
            const prisma = require('../_config/prisma');
            if (prisma && prisma.blogPost) {
                const [published, unpublished, dbGames] = await Promise.all([
                    prisma.blogPost.findMany({
                        where: { isPublished: true },
                        orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }]
                    }),
                    prisma.blogPost.findMany({
                        where: { isPublished: false },
                        select: { slug: true }
                    }),
                    prisma.game
                        ? prisma.game.findMany({
                              where: { isPublished: true },
                              select: { slug: true, updatedAt: true, createdAt: true },
                              orderBy: { order: 'asc' }
                          }).catch(() => [])
                        : Promise.resolve([])
                ]);

                const totalInDb = published.length + unpublished.length;
                if (totalInDb > 0) {
                    return {
                        source: 'mongodb',
                        articles: published,
                        unpublishedSlugs: unpublished.map(u => u.slug).filter(Boolean),
                        games: Array.isArray(dbGames) ? dbGames : [],
                        gameSlugs: Array.isArray(dbGames) ? dbGames.map(g => g.slug).filter(Boolean) : []
                    };
                }
            }
        } catch (err) {
            console.warn(`[Blog SEO] MongoDB query failed (${err.message}).`);
        }
    }

    if (allowRemoteApiFallback) {
        const remoteBase = (process.env.APP_BASE_URL || BASE_URL).replace(/\/+$/, '');
        try {
            const firstPage = await fetchJsonWithTimeout(`${remoteBase}/api/blog?page=1&limit=50`, 8000);
            if (firstPage && firstPage.success && Array.isArray(firstPage.articles)) {
                const allSummaries = [...firstPage.articles];
                const totalPages = firstPage.totalPages || 1;
                for (let p = 2; p <= totalPages; p++) {
                    const nextPage = await fetchJsonWithTimeout(`${remoteBase}/api/blog?page=${p}&limit=50`, 8000);
                    if (nextPage && nextPage.success && Array.isArray(nextPage.articles)) {
                        allSummaries.push(...nextPage.articles);
                    }
                }

                // Fetch full article payload (with content) for each published MongoDB article
                const fullArticles = [];
                const BATCH = 5;
                for (let i = 0; i < allSummaries.length; i += BATCH) {
                    const chunk = allSummaries.slice(i, i + BATCH);
                    const resolved = await Promise.all(
                        chunk.map(async (summary) => {
                            if (!summary?.slug) return null;
                            try {
                                const detail = await fetchJsonWithTimeout(
                                    `${remoteBase}/api/blog/${encodeURIComponent(summary.slug)}?noTrack=1`,
                                    8000
                                );
                                if (detail && detail.success && detail.article && detail.article.isPublished !== false) {
                                    return detail.article;
                                }
                            } catch {
                                // Ignore individual detail failure
                            }
                            return null;
                        })
                    );
                    for (const item of resolved) {
                        if (item) fullArticles.push(item);
                    }
                }

                if (fullArticles.length > 0) {
                    return {
                        source: 'api',
                        articles: fullArticles,
                        unpublishedSlugs: [],
                        gameSlugs: []
                    };
                }
            }
        } catch (err) {
            console.warn(`[Blog SEO] Remote API fallback failed (${err.message}).`);
        }
    }

    const { INITIAL_BLOG_ARTICLES } = require('../_models/blogArticles/initialBlogArticles');
    const publishedInitial = (INITIAL_BLOG_ARTICLES || []).filter(a => a && a.slug && a.isPublished === true);
    return {
        source: 'fallback',
        articles: publishedInitial,
        unpublishedSlugs: [],
        games: [],
        gameSlugs: []
    };
}

/**
 * Fetches full sitemap catalog (published blog posts, published games, and populated quiz categories)
 * from MongoDB via Prisma, or from the live API when MONGODB_URI is unavailable locally.
 */
async function fetchSitemapCatalogFromSource({ allowRemoteApiFallback = true } = {}) {
    loadEnvIfNeeded();

    const blogResult = await fetchPublishedBlogPostsFromSource({ allowRemoteApiFallback });
    let games = Array.isArray(blogResult.games) && blogResult.games.length > 0 ? blogResult.games : null;
    let categoriesWithStats = null;

    if (isMongoUriConfigured(process.env.MONGODB_URI)) {
        try {
            const prisma = require('../_config/prisma');
            if (prisma) {
                if (!games && prisma.game) {
                    const [totalGames, dbGames] = await Promise.all([
                        prisma.game.count(),
                        prisma.game.findMany({
                            where: { isPublished: true },
                            select: { slug: true, updatedAt: true, createdAt: true },
                            orderBy: { order: 'asc' }
                        })
                    ]);
                    if (totalGames > 0 && Array.isArray(dbGames)) {
                        games = dbGames;
                    }
                }
                if (prisma.category && prisma.question) {
                    const [cats, qStats] = await Promise.all([
                        prisma.category.findMany(),
                        prisma.question.groupBy({
                            by: ['category'],
                            _count: { id: true },
                            _max: { createdAt: true }
                        })
                    ]);
                    if (Array.isArray(cats) && Array.isArray(qStats)) {
                        const qMap = new Map(
                            qStats.map(q => [
                                String(q.category || '').toLowerCase(),
                                {
                                    count: q._count?.id || 0,
                                    latestQuestionAt: q._max?.createdAt || null
                                }
                            ])
                        );
                        categoriesWithStats = cats.map(c => {
                            const stat = qMap.get(String(c.name || '').toLowerCase());
                            return {
                                name: c.name,
                                isEnabled: c.isEnabled !== false,
                                questionCount: stat ? stat.count : 0,
                                latestQuestionAt: stat ? stat.latestQuestionAt : null
                            };
                        });
                    }
                }
            }
        } catch (err) {
            console.warn(`[Sitemap] MongoDB catalog query failed (${err.message}).`);
        }
    }

    if (allowRemoteApiFallback && (!games || !categoriesWithStats)) {
        const remoteBase = (process.env.APP_BASE_URL || BASE_URL).replace(/\/+$/, '');
        if (!games) {
            try {
                const gamesPayload = await fetchJsonWithTimeout(`${remoteBase}/api/games`, 8000);
                if (gamesPayload && gamesPayload.success && Array.isArray(gamesPayload.data) && gamesPayload.data.length > 0) {
                    games = gamesPayload.data.filter(g => g && g.slug && g.isPublished !== false);
                }
            } catch (err) {
                console.warn(`[Sitemap] Remote /api/games fetch failed (${err.message}).`);
            }
        }

        if (!categoriesWithStats) {
            try {
                const catsPayload = await fetchJsonWithTimeout(`${remoteBase}/api/categories`, 8000);
                if (Array.isArray(catsPayload)) {
                    const active = catsPayload.filter(c => c && c.isEnabled !== false && Number(c.questionCount || 0) > 0);
                    const latestByName = new Map();
                    await Promise.all(
                        active.map(async (cat) => {
                            try {
                                const qs = await fetchJsonWithTimeout(
                                    `${remoteBase}/api/questions?category=${encodeURIComponent(cat.name)}`,
                                    8000
                                );
                                if (Array.isArray(qs) && qs.length > 0) {
                                    let maxMs = 0;
                                    for (const q of qs) {
                                        const ts = q.createdAt || q.created_at;
                                        if (ts) {
                                            const ms = new Date(ts).getTime();
                                            if (!Number.isNaN(ms) && ms > maxMs) maxMs = ms;
                                        }
                                    }
                                    if (maxMs > 0) {
                                        latestByName.set(String(cat.name).toLowerCase(), new Date(maxMs).toISOString());
                                    }
                                }
                            } catch {
                                // Keep null if per-category fetch times out
                            }
                        })
                    );

                    categoriesWithStats = catsPayload.map(c => ({
                        name: c.name,
                        isEnabled: c.isEnabled !== false,
                        questionCount: Number(c.questionCount || 0),
                        latestQuestionAt: latestByName.get(String(c.name || '').toLowerCase()) || null
                    }));
                }
            } catch (err) {
                console.warn(`[Sitemap] Remote /api/categories fetch failed (${err.message}).`);
            }
        }
    }

    return {
        source: blogResult.source,
        articles: blogResult.articles || [],
        games,
        categoriesWithStats
    };
}

module.exports = {
    BASE_URL,
    SITE_HOME_URL,
    DEFAULT_LOGO_URL,
    BLOG_LIST_TITLE,
    BLOG_LIST_DESCRIPTION,
    ensureMarkdownParser,
    loadEnvIfNeeded,
    isMongoUriConfigured,
    escapeAttr,
    escapeText,
    safeJsonForScriptTag,
    normalizeCanonicalUrl,
    resolveArticleImageUrl,
    resolveTechQuizSlug,
    resolveTechQuizPath,
    toIsoDate,
    formatReadableDate,
    buildArticleSeoDescription,
    buildArticleSeoTitle,
    buildArticleBreadcrumbs,
    buildArticleSeoMeta,
    buildBlogArticleStructuredData,
    buildBlogIndexStructuredData,
    renderMarkdownToHtml,
    renderBlogDetailBodyHtml,
    renderBlogListBodyHtml,
    renderVisible404BodyHtml,
    replaceOrInsertMeta,
    removeMetaTag,
    replaceRootHtml,
    applyHeadMetadata,
    renderCompleteBlogArticleHtml,
    renderCompleteBlogIndexHtml,
    deriveCategoriesFromArticles,
    findRelatedForArticle,
    fetchPublishedBlogPostsFromSource,
    fetchSitemapCatalogFromSource
};
