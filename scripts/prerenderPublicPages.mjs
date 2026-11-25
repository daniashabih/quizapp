import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
    SEO_PAGES_CONFIG,
    TECHNOLOGY_SEO_SLUGS,
    getTechnologySeoBySlug,
    formatGameSeoTitle,
    SEO_NOT_FOUND_TITLE
} from '../src/config/seoPagesConfig.js';
import { buildPageStructuredData } from '../src/utils/structuredData.js';

import {
    stripMarkdownToPlainText
} from '../api/_utils/blogMarkdownParser.mjs';

const require = createRequire(import.meta.url);
const {
    ensureMarkdownParser,
    isMongoUriConfigured,
    buildArticleSeoTitle,
    buildArticleSeoDescription,
    applyHeadMetadata,
    renderStaticFooterHtml,
    renderVisible404BodyHtml,
    renderCompleteBlogArticleHtml,
    renderCompleteBlogIndexHtml,
    deriveCategoriesFromArticles,
    findRelatedForArticle,
    fetchPublishedBlogPostsFromSource
} = require('../api/_utils/blogSeoRenderer.js');
const {
    GAMES_SEO_LIST,
    TECH_SEO_KEYS,
    CORE_INDEXABLE_PAGE_KEYS,
    resolveDistinctH1,
    resolveStaticHeaderForPath,
    generatePublicBodyHtml,
    generateHomeBodyHtml,
    buildGameBodyHtml,
    renderPublicPageHtml
} = require('../api/_utils/publicPageSeoRenderer.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BASE_URL = 'https://www.hangbug.com';

if (!fs.existsSync(DIST_DIR)) {
    console.error('Dist directory does not exist. Run vite build first.');
    process.exit(1);
}

const templatePath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(templatePath)) {
    console.error('dist/index.html not found. Run vite build first.');
    process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf8');

// Helper to count words
function countWords(str) {
    if (!str) return 0;
    return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
}

// Persist clean un-prerendered Vite SPA shell for Express / Vercel serverless fallback
const generatedDir = path.join(ROOT_DIR, 'api', '_generated');
fs.mkdirSync(generatedDir, { recursive: true });
const cleanSpaShell = baseTemplate.replace(
    /<div id="root">[\s\S]*<\/div>(?=\s*(?:<script|<\/body>))/,
    '<div id="root"></div>'
);
fs.writeFileSync(path.join(generatedDir, 'spa-shell.html'), cleanSpaShell, 'utf8');

// Generate pre-rendered HTML for a given page definition via shared public page renderer
function renderPage(page) {
    const {
        path: routePath,
        title,
        description,
        schemaType = 'WebPage',
        breadcrumbs,
        includeApplicationSchema = false,
        softwareApplication = null,
        itemList = null,
        article = null,
        ogType = 'website',
        robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        omitCanonical = false,
        omitJsonLd = false,
        staticHeaderHtml = '',
        staticFooterHtml = '',
        bodyHtml
    } = page;

    const jsonLd = omitJsonLd
        ? null
        : buildPageStructuredData({
              title,
              description,
              canonicalPath: routePath,
              schemaType,
              breadcrumbs,
              includeApplicationSchema,
              softwareApplication,
              itemList,
              article
          });

    return renderPublicPageHtml(baseTemplate, {
        path: routePath,
        canonicalPath: routePath,
        title,
        description,
        ogType,
        robots,
        omitCanonical,
        omitJsonLd,
        includeApplicationSchema,
        softwareApplication,
        jsonLd,
        staticHeaderHtml,
        staticFooterHtml,
        bodyHtml
    });
}

// Ensure directory exists and write file
function writeStaticPage(routePath, htmlContent) {
    if (routePath === '/') {
        fs.writeFileSync(path.join(DIST_DIR, 'index.html'), htmlContent, 'utf8');
        return;
    }

    const cleanPath = routePath.replace(/^\/+|\/+$/g, '');
    const dirPath = path.join(DIST_DIR, cleanPath);
    const htmlFilePath = path.join(DIST_DIR, `${cleanPath}.html`);

    // Write directory/index.html
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, 'index.html'), htmlContent, 'utf8');

    // Also write cleanPath.html for maximum compatibility
    fs.mkdirSync(path.dirname(htmlFilePath), { recursive: true });
    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
}

console.log('--- Starting Hangbug Static Pre-rendering for Technical SEO ---');

let renderedCount = 0;

// Remove stale /resources pre-render artifacts (redirects to /blog)
fs.rmSync(path.join(DIST_DIR, 'resources'), { recursive: true, force: true });
fs.rmSync(path.join(DIST_DIR, 'resources.html'), { force: true });

await ensureMarkdownParser();
const { source: blogSource, articles: fetchedBlogArticles, unpublishedSlugs: earlyUnpublishedSlugs } = await fetchPublishedBlogPostsFromSource({
    allowRemoteApiFallback: true
});
const normalizedPublishedBlogArticles = (fetchedBlogArticles || [])
    .filter(a => a && typeof a.slug === 'string' && a.slug.trim() && a.isPublished === true)
    .map(a => ({ ...a, slug: String(a.slug).trim().toLowerCase() }));
const sharedStaticFooterHtml = renderStaticFooterHtml(normalizedPublishedBlogArticles);

// 1. Core Public Pages from SEO_PAGES_CONFIG
for (const key of CORE_INDEXABLE_PAGE_KEYS) {
    const config = SEO_PAGES_CONFIG[key];
    if (!config) continue;

    const distinctH1 = resolveDistinctH1(config);

    const coreBreadcrumbsMap = {
        '/': [{ name: 'Home', path: '/' }],
        '/technologies': [{ name: 'Home', path: '/' }, { name: 'Technologies', path: '/technologies' }],
        '/games': [{ name: 'Home', path: '/' }, { name: 'Games', path: '/games' }],
        '/leaderboard': [{ name: 'Home', path: '/' }, { name: 'Leaderboard', path: '/leaderboard' }],
        '/about': [{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }],
        '/contact': [{ name: 'Home', path: '/' }, { name: 'Contact Support', path: '/contact' }],
        '/privacy-policy': [{ name: 'Home', path: '/' }, { name: 'Privacy Policy', path: '/privacy-policy' }],
        '/terms': [{ name: 'Home', path: '/' }, { name: 'Terms of Service', path: '/terms' }]
    };

    let coreItemList = null;
    if (config.path === '/technologies') {
        const techItems = TECH_SEO_KEYS
            .map(slug => getTechnologySeoBySlug(slug))
            .filter(Boolean)
            .map(t => ({
                name: `${t.name} Quizzes`,
                url: `${BASE_URL}${t.path}`,
                description: t.description
            }));
        if (techItems.length > 0) {
            coreItemList = {
                name: 'Hangbug Technology Quiz Tracks',
                description: config.description,
                items: techItems
            };
        }
    } else if (config.path === '/games') {
        coreItemList = {
            name: 'Hangbug Coding & Typing Games',
            description: config.description,
            items: GAMES_SEO_LIST.map(g => ({
                name: g.name,
                url: `${BASE_URL}/games/${g.slug}`,
                description: g.description
            }))
        };
    }

    const pageDef = {
        path: config.path,
        title: config.title,
        description: config.description,
        h1: distinctH1,
        schemaType: 'WebPage',
        breadcrumbs: coreBreadcrumbsMap[config.path],
        includeApplicationSchema: config.path === '/' || config.path === '/games',
        itemList: coreItemList,
        staticHeaderHtml: resolveStaticHeaderForPath(config.path),
        staticFooterHtml: sharedStaticFooterHtml,
        bodyHtml:
            config.path === '/'
                ? generateHomeBodyHtml({ ...config, h1: distinctH1 }, normalizedPublishedBlogArticles)
                : generatePublicBodyHtml({ ...config, h1: distinctH1 })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(config.path, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered ${config.path.padEnd(25)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 2. Additional Utility Pages (Noindex)
const additionalPages = [
    {
        path: '/certificate/view',
        title: 'Free Coding Certificates: Earn & Verify Online | Hangbug',
        h1: 'Hangbug Developer Certificate Verification & Credential Lookup',
        description: 'Verify the authenticity of Hangbug developer completion certificates. Look up unique certificate IDs to confirm quiz mastery, score tiers, and completion dates.',
        robots: 'noindex, nofollow',
        omitCanonical: true,
        introContent: 'Hangbug provides transparent, instant digital credential verification. Employers, recruiters, and educational institutions can verify the authenticity of any developer certificate issued by Hangbug by entering the certificate identifier below.',
        h2s: [
            'How Certificate Verification Works',
            'Passing Thresholds & Performance Score Tiers',
            'Authoritative Anti-Tamper Verification Architecture',
            'Sharing Verified Credentials on Professional Networks'
        ],
        h3s: [
            'Distinction Tier (90%+ Accuracy)',
            'Merit Tier (75%–89% Accuracy)',
            'Pass Tier (60%–74% Accuracy)',
            'Direct LinkedIn Add-to-Profile Integration'
        ],
        internalLinks: [
            { label: 'Explore Technology Tracks', to: '/technologies' },
            { label: 'Global Leaderboard', to: '/leaderboard' },
            { label: 'About Hangbug Certificates', to: '/about' },
            { label: 'Contact Support', to: '/contact' }
        ]
    }
];

for (const p of additionalPages) {
    const pageDef = {
        path: p.path,
        title: p.title,
        description: p.description,
        h1: p.h1,
        staticHeaderHtml: resolveStaticHeaderForPath(p.path),
        staticFooterHtml: sharedStaticFooterHtml,
        ...(p.robots ? { robots: p.robots } : {}),
        ...(p.omitCanonical ? { omitCanonical: true } : {}),
        ...(p.robots && p.robots.includes('noindex') ? { omitJsonLd: true } : {}),
        bodyHtml: generatePublicBodyHtml(p)
    };
    const renderedHtml = renderPage(pageDef);
    writeStaticPage(p.path, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered ${p.path.padEnd(25)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 3. Technology Detail Pages
for (const slug of TECH_SEO_KEYS) {
    const config = getTechnologySeoBySlug(slug);
    if (!config) continue;

    const distinctH1 = resolveDistinctH1(config, `${config.name} Programming Quizzes & Hands-On Practice`);

    const pageDef = {
        path: `/technologies/${slug}`,
        title: config.title,
        description: config.description,
        h1: distinctH1,
        schemaType: 'WebPage',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Technologies', path: '/technologies' },
            { name: `${config.name || config.badge || slug} Quizzes`, path: `/technologies/${slug}` }
        ],
        staticHeaderHtml: resolveStaticHeaderForPath(`/technologies/${slug}`),
        staticFooterHtml: sharedStaticFooterHtml,
        bodyHtml: generatePublicBodyHtml({
            ...config,
            h1: distinctH1,
            introContent: config.introContent || `Practice ${config.name} programming and software development with Hangbug interactive quizzes and coding challenges. Master core concepts, syntax nuances, and interview topics.`
        })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(`/technologies/${slug}`, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered /technologies/${slug.padEnd(16)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 4. All 20 Developer Games
for (const game of GAMES_SEO_LIST) {
    const resolvedGameTitle = formatGameSeoTitle(game.name, game.category);
    const pageDef = {
        path: `/games/${game.slug}`,
        title: resolvedGameTitle,
        description: game.description,
        h1: game.h1,
        schemaType: 'WebPage',
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: 'Games', path: '/games' },
            { name: game.name, path: `/games/${game.slug}` }
        ],
        includeApplicationSchema: true,
        staticHeaderHtml: resolveStaticHeaderForPath(`/games/${game.slug}`),
        staticFooterHtml: sharedStaticFooterHtml,
        softwareApplication: {
            slug: game.slug,
            name: game.name,
            category: game.category,
            description: game.description
        },
        bodyHtml: buildGameBodyHtml(game, {
            canonicalSlug: game.slug,
            title: resolvedGameTitle,
            h1: game.h1,
            description: game.description
        })
    };

    const renderedHtml = renderPage(pageDef);
    writeStaticPage(`/games/${game.slug}`, renderedHtml);
    const words = countWords(pageDef.bodyHtml);
    console.log(`✓ Pre-rendered /games/${game.slug.padEnd(20)} [Title & H1 unique | Word Count: ${words}]`);
    renderedCount++;
}

// 5. Pre-render Blog Index (/blog) & every valid published Blog Article (/blog/:slug) from MongoDB
async function prerenderBlogSystem() {
    // Clean any stale blog build artifacts so unpublished/deleted articles never persist
    const blogDistDir = path.join(DIST_DIR, 'blog');
    const blogDistFile = path.join(DIST_DIR, 'blog.html');
    fs.rmSync(blogDistDir, { recursive: true, force: true });
    fs.rmSync(blogDistFile, { force: true });

    const source = blogSource;
    const unpublishedSlugs = earlyUnpublishedSlugs;

    if (unpublishedSlugs.length > 0) {
        console.log(`ℹ Excluded ${unpublishedSlugs.length} unpublished blog article(s): ${unpublishedSlugs.join(', ')}`);
    }

    // Strictly filter to published articles with valid slugs
    const publishedArticles = (fetchedBlogArticles || []).filter(
        a => a && typeof a.slug === 'string' && a.slug.trim() && a.isPublished === true
    );

    // Ensure unique title and meta description per article
    const seenTitles = new Set();
    const seenDescriptions = new Set();
    const normalizedArticles = publishedArticles.map((rawArticle) => {
        const article = { ...rawArticle, slug: String(rawArticle.slug).trim().toLowerCase() };

        let resolvedTitle = buildArticleSeoTitle(article);
        if (seenTitles.has(resolvedTitle.toLowerCase())) {
            const rawBase = article.category && !String(article.title || '').toLowerCase().includes(article.category.toLowerCase())
                ? `${article.title} (${article.category})`
                : `${article.title} ${article.slug}`;
            resolvedTitle = buildArticleSeoTitle({ title: rawBase });
        }
        seenTitles.add(resolvedTitle.toLowerCase());
        article.seoTitle = resolvedTitle;

        let resolvedDesc = buildArticleSeoDescription(article);
        if (seenDescriptions.has(resolvedDesc.toLowerCase())) {
            const plain = stripMarkdownToPlainText(article.content || '');
            const candidate = plain && plain.length > 40
                ? `${article.title}: ${plain.slice(0, 125).trim()}...`
                : `${article.title} — ${resolvedDesc}`;
            resolvedDesc = candidate.slice(0, 160);
        }
        seenDescriptions.add(resolvedDesc.toLowerCase());
        article.seoDescription = resolvedDesc;

        return article;
    });

    // 5a. Pre-render /blog index using actual published articles
    const categories = deriveCategoriesFromArticles(normalizedArticles);
    const featuredArticle = normalizedArticles.find(a => a.isFeatured) || normalizedArticles[0] || null;
    const blogIndexHtml = renderCompleteBlogIndexHtml(cleanSpaShell, {
        articles: normalizedArticles.slice(0, 9),
        featuredArticle,
        categories,
        total: normalizedArticles.length
    });
    writeStaticPage('/blog', blogIndexHtml);
    console.log(`✓ Pre-rendered /blog                     [Source: ${source} | ${normalizedArticles.length} published articles]`);
    renderedCount++;

    // 5b. Pre-render every valid published blog article
    for (const article of normalizedArticles) {
        const relatedArticles = findRelatedForArticle(article, normalizedArticles);
        const renderedHtml = renderCompleteBlogArticleHtml(cleanSpaShell, article, relatedArticles, normalizedArticles);
        writeStaticPage(`/blog/${article.slug}`, renderedHtml);
        const words = countWords(article.content || article.excerpt || '');
        console.log(`✓ Pre-rendered /blog/${article.slug.padEnd(36)} [Source: ${source} | Words: ${words}]`);
        renderedCount++;
    }
}

await prerenderBlogSystem();

// 6. Generate static 404.html error shell with noindex metadata for missing static files on Vercel
const notFoundHtml = applyHeadMetadata(cleanSpaShell, {
    title: SEO_NOT_FOUND_TITLE,
    description: "The page you are looking for doesn't exist, has been removed, or was moved to another URL.",
    robots: 'noindex, nofollow',
    omitCanonical: true,
    jsonLd: null,
    bodyHtml: renderVisible404BodyHtml()
});
fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');
console.log('✓ Generated dist/404.html with noindex, nofollow metadata');

// 7. Copy llms.txt and llms-full.txt to dist/
const publicDir = path.join(ROOT_DIR, 'public');
for (const f of ['llms.txt', 'llms-full.txt']) {
    const src = path.join(publicDir, f);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(DIST_DIR, f));
    }
}

if (isMongoUriConfigured(process.env.MONGODB_URI)) {
    try {
        const prisma = require('../api/_config/prisma');
        await prisma.$disconnect();
    } catch {
        // ignore disconnect errors
    }
}

console.log(`\n🎉 Successfully pre-rendered ${renderedCount} public pages into dist/`);
console.log('✓ Every pre-rendered page has:');
console.log('  - Distinct <title>');
console.log('  - Distinct <meta name="description">');
console.log('  - Dedicated <link rel="canonical">');
console.log('  - Unique <h1> (different from <title>)');
console.log('  - Visible, crawlable article content consistent with React rendering');
console.log('  - 100% compliant Schema.org JSON-LD (Article + BreadcrumbList + Organization + WebSite)');
console.log('  - Open Graph & Twitter card metadata');
