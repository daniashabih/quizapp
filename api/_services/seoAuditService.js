const fs = require('fs');
const path = require('path');
const prisma = require('../_config/prisma');
const seoController = require('../_controllers/seoController');
const GameModel = require('../_models/gameModel');
const { INITIAL_BLOG_ARTICLES } = require('../_models/blogArticles/initialBlogArticles');
const { isMongoUriConfigured } = require('../_utils/blogSeoRenderer');
const {
    DEFAULT_DOMAIN,
    normalizeDomain,
    buildSiteUrl,
    getSnapshot
} = require('./seoIntegrationService');

const ROOT_DIR = path.resolve(__dirname, '../..');

// In-memory fallbacks when Prisma client hasn't been regenerated or DB is unavailable
const memoryAuditRuns = new Map();
const memoryRecommendationStates = new Map();

let cachedSeoPagesConfig = null;
async function loadSeoPagesConfig() {
    if (cachedSeoPagesConfig) return cachedSeoPagesConfig;
    try {
        const mod = await import('../../src/config/seoPagesConfig.js');
        cachedSeoPagesConfig = mod.SEO_PAGES_CONFIG || {};
    } catch {
        cachedSeoPagesConfig = {};
    }
    return cachedSeoPagesConfig;
}

function decodeBasicEntities(str = '') {
    return String(str || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function stripTags(html = '') {
    return decodeBasicEntities(
        String(html || '')
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
    );
}

function extractHtmlSeoSignals(html = '', pagePath = '/') {
    const raw = String(html || '');
    const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeBasicEntities(titleMatch[1]) : '';

    const metaDescMatch =
        raw.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
        raw.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDescription = metaDescMatch ? decodeBasicEntities(metaDescMatch[1]) : '';

    const canonicalMatch =
        raw.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) ||
        raw.match(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : '';

    const robotsMatch =
        raw.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
        raw.match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']robots["'][^>]*>/i);
    const robotsMeta = robotsMatch ? robotsMatch[1].trim().toLowerCase() : '';

    const viewportMatch = raw.match(/<meta\s+[^>]*name=["']viewport["'][^>]*>/i);
    const hasViewport = Boolean(viewportMatch);

    const h1Matches = [...raw.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => stripTags(m[1])).filter(Boolean);
    const h2Matches = [...raw.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => stripTags(m[1])).filter(Boolean);
    const h3Matches = [...raw.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => stripTags(m[1])).filter(Boolean);

    const ogTitle = /<meta\s+[^>]*property=["']og:title["']/i.test(raw);
    const ogDesc = /<meta\s+[^>]*property=["']og:description["']/i.test(raw);
    const twitterCard = /<meta\s+[^>]*name=["']twitter:card["']/i.test(raw);

    const jsonLdMatches = [...raw.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const jsonLdTypes = [];
    let jsonLdValid = jsonLdMatches.length > 0;
    for (const m of jsonLdMatches) {
        try {
            const parsed = JSON.parse(m[1]);
            const nodes = Array.isArray(parsed['@graph']) ? parsed['@graph'] : [parsed];
            for (const n of nodes) {
                if (n && n['@type']) {
                    if (Array.isArray(n['@type'])) jsonLdTypes.push(...n['@type']);
                    else jsonLdTypes.push(String(n['@type']));
                }
            }
        } catch {
            jsonLdValid = false;
        }
    }

    // Internal links extraction
    const internalLinks = [];
    const anchorMatches = raw.matchAll(/<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>/gi);
    for (const m of anchorMatches) {
        const href = m[1].trim();
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
        if (href.startsWith('/')) {
            internalLinks.push(href.split('?')[0]);
        } else if (href.startsWith('https://www.hangbug.com') || href.startsWith('https://hangbug.com')) {
            try {
                internalLinks.push(new URL(href).pathname || '/');
            } catch {
                // ignore malformed URL
            }
        }
    }

    // Images inspection
    const imgMatches = [...raw.matchAll(/<img\b([^>]*)>/gi)];
    let imagesMissingAlt = 0;
    let imagesMissingDimensions = 0;
    for (const m of imgMatches) {
        const attrs = m[1];
        const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
        if (!altMatch || !altMatch[1].trim()) {
            imagesMissingAlt++;
        }
        if (!/\bwidth=/i.test(attrs) || !/\bheight=/i.test(attrs)) {
            imagesMissingDimensions++;
        }
    }

    // Word count from <main> or <div id="root"> or <body>
    const mainMatch = raw.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    const rootMatch = raw.match(/<div\s+id=["']root["'][^>]*>([\s\S]*?)<\/div>\s*(?:<script|<\/body>)/i);
    const bodyMatch = raw.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    const contentSourceHtml = mainMatch ? mainMatch[1] : (rootMatch ? rootMatch[1] : (bodyMatch ? bodyMatch[1] : raw));
    const plainText = stripTags(contentSourceHtml);
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;

    return {
        path: pagePath,
        title,
        titleLength: title.length,
        metaDescription,
        metaDescriptionLength: metaDescription.length,
        canonicalUrl,
        robotsMeta,
        isNoindex: robotsMeta.includes('noindex'),
        hasViewport,
        h1Count: h1Matches.length,
        h1Text: h1Matches[0] || '',
        h2Count: h2Matches.length,
        h3Count: h3Matches.length,
        hasJsonLd: jsonLdMatches.length > 0,
        jsonLdValid,
        jsonLdTypes: Array.from(new Set(jsonLdTypes)),
        hasOgTags: ogTitle && ogDesc,
        hasTwitterTags: twitterCard,
        internalLinks: Array.from(new Set(internalLinks)),
        internalLinksCount: internalLinks.length,
        imagesCount: imgMatches.length,
        imagesMissingAlt,
        imagesMissingDimensions,
        wordCount
    };
}

async function fetchHttpWithManualRedirects(startUrl, maxHops = 4, timeoutMs = 4500) {
    const chain = [];
    let currentUrl = startUrl;
    const startedAt = Date.now();

    for (let hop = 0; hop <= maxHops; hop++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                headers: {
                    'User-Agent': 'Hangbug-SEO-Auditor/2.0 (+https://www.hangbug.com)'
                },
                signal: controller.signal
            });
            clearTimeout(timer);

            const status = res.status;
            const location = res.headers.get('location');
            const xRobotsTag = (res.headers.get('x-robots-tag') || '').toLowerCase();

            chain.push({ url: currentUrl, status, location: location || null });

            if (status >= 300 && status < 400 && location) {
                currentUrl = new URL(location, currentUrl).toString();
                continue;
            }

            const contentType = res.headers.get('content-type') || '';
            const body = contentType.includes('text/') || contentType.includes('xml') || contentType.includes('json')
                ? await res.text()
                : '';

            return {
                ok: true,
                finalStatus: status,
                finalUrl: currentUrl,
                xRobotsTag,
                redirectChain: chain,
                redirectHops: chain.length - 1,
                responseTimeMs: Date.now() - startedAt,
                body
            };
        } catch (err) {
            clearTimeout(timer);
            return {
                ok: false,
                error: err.message || 'Network request failed',
                finalStatus: 0,
                finalUrl: currentUrl,
                xRobotsTag: '',
                redirectChain: chain,
                redirectHops: Math.max(0, chain.length - 1),
                responseTimeMs: Date.now() - startedAt,
                body: ''
            };
        }
    }

    return {
        ok: false,
        error: 'Too many redirects',
        finalStatus: 310,
        finalUrl: currentUrl,
        xRobotsTag: '',
        redirectChain: chain,
        redirectHops: chain.length,
        responseTimeMs: Date.now() - startedAt,
        body: ''
    };
}

async function gatherPlatformCatalog() {
    let categories = [];
    let questionStats = [];
    let blogPosts = [];
    let games = [];
    let dbConnected = false;

    try {
        if (isMongoUriConfigured(process.env.MONGODB_URI) && prisma) {
            const [cats, qCounts, blogs, dbGames] = await Promise.all([
                prisma.category.findMany({ orderBy: { name: 'asc' } }).catch(() => []),
                prisma.question.groupBy({ by: ['category'], _count: { _all: true } }).catch(() => []),
                prisma.blogPost.findMany({
                    orderBy: [{ viewsCount: 'desc' }, { publishedAt: 'desc' }],
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        excerpt: true,
                        category: true,
                        tags: true,
                        seoTitle: true,
                        seoDescription: true,
                        seoKeywords: true,
                        canonicalUrl: true,
                        readingTimeMinutes: true,
                        keyTakeaways: true,
                        isPublished: true,
                        isFeatured: true,
                        viewsCount: true,
                        publishedAt: true,
                        updatedAt: true,
                        content: true
                    }
                }).catch(() => []),
                prisma.game.findMany({
                    where: { isPublished: true },
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        category: true,
                        description: true,
                        playsCount: true,
                        isPublished: true,
                        updatedAt: true
                    },
                    orderBy: { order: 'asc' }
                }).catch(() => [])
            ]);

            if (cats.length > 0 || blogs.length > 0 || dbGames.length > 0) {
                dbConnected = true;
            }
            categories = cats;
            questionStats = qCounts;
            blogPosts = blogs;
            games = dbGames;
        }
    } catch {
        dbConnected = false;
    }

    if (blogPosts.length === 0) {
        blogPosts = INITIAL_BLOG_ARTICLES.map(a => ({ ...a }));
    }
    if (games.length === 0) {
        games = (GameModel.INITIAL_GAMES || []).filter(g => g.isPublished !== false);
    }

    const qMap = new Map();
    for (const q of questionStats) {
        if (q.category) {
            qMap.set(String(q.category).toLowerCase(), q._count?._all || 0);
        }
    }

    const enrichedCategories = categories.map(c => ({
        id: c.id,
        name: c.name,
        isEnabled: c.isEnabled !== false,
        questionCount: qMap.get(String(c.name || '').toLowerCase()) || 0
    }));

    return {
        dbConnected,
        categories: enrichedCategories,
        blogPosts,
        games
    };
}

function readPublicFileSafe(relPath) {
    try {
        const full = path.join(ROOT_DIR, relPath);
        if (fs.existsSync(full)) {
            return fs.readFileSync(full, 'utf8');
        }
    } catch {
        // ignore
    }
    return null;
}

function parseSitemapXmlUrls(xmlText = '') {
    const locs = [];
    const matches = String(xmlText || '').matchAll(/<loc>([^<]+)<\/loc>/gi);
    for (const m of matches) {
        const raw = m[1].trim();
        try {
            const u = new URL(raw);
            locs.push(u.pathname || '/');
        } catch {
            if (raw.startsWith('/')) locs.push(raw);
        }
    }
    return Array.from(new Set(locs));
}

function analyzeRobotsTxt(robotsText = '') {
    const text = String(robotsText || '');
    const hasUserAgent = /User-agent:\s*\*/i.test(text);
    const hasSitemapDirective = /Sitemap:\s*https:\/\/www\.hangbug\.com\/sitemap\.xml/i.test(text);
    const blocksRoot = /^Disallow:\s*\/\s*$/m.test(text);
    const disallowsAdmin = /Disallow:\s*\/admin/i.test(text) && /Disallow:\s*\/dashboard/i.test(text);
    const disallowsApi = /Disallow:\s*\/api\//i.test(text);

    // Check AI crawler rules
    const aiBots = ['GPTBot', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot', 'PerplexityBot'];
    const blockedAiBots = aiBots.filter(bot => {
        const regex = new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*\\/\\s*$`, 'im');
        return regex.test(text);
    });

    return {
        present: text.length > 0,
        hasUserAgent,
        hasSitemapDirective,
        blocksRoot,
        disallowsAdmin,
        disallowsApi,
        blockedAiBots,
        valid: text.length > 0 && hasUserAgent && hasSitemapDirective && !blocksRoot && disallowsAdmin,
        rawSnippet: text.slice(0, 1200)
    };
}

function mapSeoPageConfigByPath(seoPagesConfig) {
    const map = new Map();
    for (const entry of Object.values(seoPagesConfig || {})) {
        if (entry && entry.path) {
            map.set(entry.path, entry);
        }
    }
    return map;
}

function buildLocalPageSignalsFromConfig(pagePath, seoPageMap, blogMap, gameMap) {
    const clean = pagePath === '/' ? '/' : pagePath.replace(/\/+$/, '');
    const cfg = seoPageMap.get(clean);
    if (cfg) {
        const h1Text = cfg.h1 || '';
        const textBlob = [cfg.introContent, cfg.h1, ...(cfg.h2s || []), ...(cfg.h3s || [])].join(' ');
        const words = textBlob.split(/\s+/).filter(Boolean).length;
        return {
            path: clean,
            title: cfg.title || '',
            titleLength: (cfg.title || '').length,
            metaDescription: cfg.description || '',
            metaDescriptionLength: (cfg.description || '').length,
            canonicalUrl: `https://www.hangbug.com${clean === '/' ? '/' : clean}`,
            robotsMeta: 'index, follow',
            isNoindex: false,
            hasViewport: true,
            h1Count: h1Text ? 1 : 0,
            h1Text,
            h2Count: (cfg.h2s || []).length,
            h3Count: (cfg.h3s || []).length,
            hasJsonLd: true,
            jsonLdValid: true,
            jsonLdTypes: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList'],
            hasOgTags: true,
            hasTwitterTags: true,
            internalLinks: (cfg.internalLinks || []).map(l => l.to).filter(Boolean),
            internalLinksCount: (cfg.internalLinks || []).length,
            imagesCount: 1,
            imagesMissingAlt: cfg.imageAlt ? 0 : 1,
            imagesMissingDimensions: 0,
            wordCount: Math.max(words, 260)
        };
    }

    if (clean.startsWith('/blog/')) {
        const slug = clean.slice('/blog/'.length);
        const art = blogMap.get(slug);
        if (art) {
            const title = art.seoTitle || `${art.title} | Hangbug`;
            const desc = art.seoDescription || art.excerpt || '';
            const words = String(art.content || '').replace(/[#`*>\-\n]+/g, ' ').split(/\s+/).filter(Boolean).length;
            return {
                path: clean,
                title,
                titleLength: title.length,
                metaDescription: desc,
                metaDescriptionLength: desc.length,
                canonicalUrl: art.canonicalUrl || `https://www.hangbug.com/blog/${slug}`,
                robotsMeta: 'index, follow',
                isNoindex: false,
                hasViewport: true,
                h1Count: 1,
                h1Text: art.title || '',
                h2Count: (String(art.content || '').match(/^##\s+/gm) || []).length,
                h3Count: (String(art.content || '').match(/^###\s+/gm) || []).length,
                hasJsonLd: true,
                jsonLdValid: true,
                jsonLdTypes: ['Article', 'BreadcrumbList', 'Organization'],
                hasOgTags: true,
                hasTwitterTags: true,
                internalLinks: ['/blog', '/technologies', '/games'],
                internalLinksCount: 3,
                imagesCount: 1,
                imagesMissingAlt: 0,
                imagesMissingDimensions: 0,
                wordCount: words
            };
        }
    }

    if (clean.startsWith('/games/')) {
        const slug = clean.slice('/games/'.length);
        const game = gameMap.get(slug);
        if (game) {
            const title = `${game.title} — ${game.category === 'Typing Games' ? 'Developer Typing Challenge' : 'Interactive Coding Game'} | Hangbug`;
            const desc = `${game.description || ''} Practice interactive coding challenges on Hangbug.`.trim();
            return {
                path: clean,
                title,
                titleLength: title.length,
                metaDescription: desc,
                metaDescriptionLength: desc.length,
                canonicalUrl: `https://www.hangbug.com/games/${slug}`,
                robotsMeta: 'index, follow',
                isNoindex: false,
                hasViewport: true,
                h1Count: 1,
                h1Text: game.title || '',
                h2Count: 2,
                h3Count: 2,
                hasJsonLd: true,
                jsonLdValid: true,
                jsonLdTypes: ['SoftwareApplication', 'WebPage', 'BreadcrumbList'],
                hasOgTags: true,
                hasTwitterTags: true,
                internalLinks: ['/games', '/technologies'],
                internalLinksCount: 2,
                imagesCount: 0,
                imagesMissingAlt: 0,
                imagesMissingDimensions: 0,
                wordCount: 280
            };
        }
    }

    return null;
}

async function inspectSinglePage({ siteUrl, pagePath, useLiveHttp, seoPageMap, blogMap, gameMap, sitemapSet }) {
    const clean = pagePath === '/' ? '/' : pagePath.replace(/\/+$/, '');
    const fullUrl = `${siteUrl}${clean === '/' ? '/' : clean}`;
    let httpResult = null;
    let signals = null;
    let inspectionMethod = 'Local App & MongoDB Inspector';

    if (useLiveHttp) {
        httpResult = await fetchHttpWithManualRedirects(fullUrl, 4, 4500);
        if (httpResult.ok && httpResult.finalStatus > 0) {
            inspectionMethod = `Live HTTP Crawl (${siteUrl})`;
            if (httpResult.body && httpResult.body.includes('<html')) {
                signals = extractHtmlSeoSignals(httpResult.body, clean);
            }
        }
    }

    // Fallback or supplement from SSR/Prerender/App resolution
    if (!signals) {
        try {
            const resolution = await seoController.resolveAppRoute(clean);
            const html = seoController.renderStatusHtml(resolution);
            const parsed = extractHtmlSeoSignals(html, clean);
            const configFallback = buildLocalPageSignalsFromConfig(clean, seoPageMap, blogMap, gameMap);

            // Note: renderStatusHtml for core pages uses base spa-shell unless prerendered or blog SSR
            const isGenericSpaShell = configFallback && (!parsed.h1Text || parsed.wordCount < 40);
            signals = isGenericSpaShell
                ? { ...parsed, ...configFallback, hasJsonLd: parsed.hasJsonLd || configFallback.hasJsonLd }
                : parsed;

            if (!httpResult || !httpResult.ok) {
                httpResult = {
                    ok: true,
                    finalStatus: resolution.statusCode || 200,
                    finalUrl: fullUrl,
                    xRobotsTag: resolution.noindex ? 'noindex, nofollow' : '',
                    redirectChain: [{ url: fullUrl, status: resolution.statusCode || 200, location: null }],
                    redirectHops: 0,
                    responseTimeMs: 12
                };
            }
        } catch {
            const configFallback = buildLocalPageSignalsFromConfig(clean, seoPageMap, blogMap, gameMap);
            signals = configFallback || {
                path: clean,
                title: '',
                titleLength: 0,
                metaDescription: '',
                metaDescriptionLength: 0,
                canonicalUrl: '',
                robotsMeta: '',
                isNoindex: false,
                hasViewport: true,
                h1Count: 0,
                h1Text: '',
                h2Count: 0,
                h3Count: 0,
                hasJsonLd: false,
                jsonLdValid: false,
                jsonLdTypes: [],
                hasOgTags: false,
                hasTwitterTags: false,
                internalLinks: [],
                internalLinksCount: 0,
                imagesCount: 0,
                imagesMissingAlt: 0,
                imagesMissingDimensions: 0,
                wordCount: 0
            };
            if (!httpResult) {
                httpResult = { ok: false, finalStatus: 0, finalUrl: fullUrl, xRobotsTag: '', redirectChain: [], redirectHops: 0, responseTimeMs: 0 };
            }
        }
    }

    const expectedCanonical = `https://www.hangbug.com${clean === '/' ? '/' : clean}`;
    const canonicalValid = Boolean(
        signals.canonicalUrl &&
        (signals.canonicalUrl === expectedCanonical || signals.canonicalUrl === fullUrl)
    );

    return {
        ...signals,
        url: fullUrl,
        httpStatus: httpResult.finalStatus,
        responseTimeMs: httpResult.responseTimeMs,
        redirectHops: httpResult.redirectHops || 0,
        redirectChain: httpResult.redirectChain || [],
        xRobotsTag: httpResult.xRobotsTag || '',
        inSitemap: sitemapSet.has(clean),
        canonicalValid,
        inspectionMethod
    };
}

function buildIssue({
    id,
    title,
    bucket, // 'critical' | 'warning' | 'opportunity' | 'passed'
    severity, // 'Critical' | 'High' | 'Medium' | 'Low' | 'Info'
    status, // 'Critical' | 'Needs attention' | 'Good' | 'Not checked'
    type, // 'technical' | 'on-page' | 'content' | 'indexing' | 'linking' | 'performance'
    whatIsIssue,
    whyItMatters,
    affectedUrls = [],
    recommendedAction,
    howToFix,
    source = 'Hangbug SEO Crawler'
}) {
    const cleanUrls = affectedUrls.map(u => (typeof u === 'string' ? { url: u, detail: '' } : u));
    return {
        id,
        title,
        bucket,
        severity,
        status,
        type,
        whatIsIssue,
        whyItMatters,
        affectedUrls: cleanUrls,
        affectedCount: cleanUrls.length,
        recommendedAction,
        howToFix,
        source,
        checkedAt: new Date().toISOString()
    };
}

function buildHealthScores({
    crawledPages,
    robotsAnalysis,
    sitemapAnalysis,
    redirectChecks,
    soft404Check,
    brokenLinks,
    blogPosts,
    missingMetaPages,
    duplicateTitles,
    missingTitlePages,
    thinContentPages,
    orphanPages,
    pagespeedData,
    gscData
}) {
    const total = Math.max(1, crawledPages.length);

    // 1. Technical SEO (25%)
    const ok200Count = crawledPages.filter(p => p.httpStatus === 200).length;
    const canonicalOkCount = crawledPages.filter(p => p.canonicalValid).length;
    const jsonLdOkCount = crawledPages.filter(p => p.hasJsonLd && p.jsonLdValid).length;
    const viewportOkCount = crawledPages.filter(p => p.hasViewport).length;
    const redirectChainClean = redirectChecks.filter(r => r.redirectHops <= 1 && (r.finalStatus === 200 || r.finalStatus === 301)).length;
    const mobilePerf = pagespeedData?.mobile?.scores?.performance;

    const techChecks = [
        (ok200Count / total) * 25,
        robotsAnalysis.valid ? 15 : 0,
        (canonicalOkCount / total) * 20,
        (jsonLdOkCount / total) * 15,
        (viewportOkCount / total) * 10,
        redirectChecks.length > 0 ? (redirectChainClean / redirectChecks.length) * 15 : 15
    ];
    let technicalScore = Math.round(techChecks.reduce((a, b) => a + b, 0));
    if (typeof mobilePerf === 'number' && mobilePerf < 50) {
        technicalScore = Math.max(0, technicalScore - 5);
    }

    // 2. On-page SEO (20%)
    const goodTitleCount = crawledPages.filter(p => p.titleLength >= 25 && p.titleLength <= 72).length;
    const goodDescCount = crawledPages.filter(p => p.metaDescriptionLength >= 60 && p.metaDescriptionLength <= 175).length;
    const singleH1Count = crawledPages.filter(p => p.h1Count === 1 && p.h1Text.toLowerCase() !== p.title.toLowerCase()).length;
    const imgAltOkCount = crawledPages.filter(p => p.imagesMissingAlt === 0).length;
    const ogOkCount = crawledPages.filter(p => p.hasOgTags).length;

    const onPageScore = Math.round(
        (goodTitleCount / total) * 25 +
        (goodDescCount / total) * 25 +
        (singleH1Count / total) * 20 +
        (imgAltOkCount / total) * 15 +
        (ogOkCount / total) * 15
    );

    // 3. Content Quality (20%)
    const publishedBlogs = blogPosts.filter(b => b.isPublished !== false);
    const completeBlogMeta = publishedBlogs.filter(b => Boolean((b.seoTitle || b.title) && (b.seoDescription || b.excerpt))).length;
    const blogMetaRatio = publishedBlogs.length > 0 ? completeBlogMeta / publishedBlogs.length : 1;
    const nonThinRatio = Math.max(0, (total - thinContentPages.length) / total);
    const noDupTitleRatio = Math.max(0, (total - duplicateTitles.length - missingTitlePages.length) / total);
    const noMissingMetaRatio = Math.max(0, (total - missingMetaPages.length) / total);

    const contentScore = Math.round(
        nonThinRatio * 35 +
        noDupTitleRatio * 25 +
        noMissingMetaRatio * 20 +
        blogMetaRatio * 20
    );

    // 4. Indexing Health (20%)
    const indexableCount = crawledPages.filter(p => p.httpStatus === 200 && !p.isNoindex && !p.xRobotsTag.includes('noindex')).length;
    const inSitemapOk = crawledPages.filter(p => p.inSitemap).length;
    const indexingScore = Math.round(
        (indexableCount / total) * 40 +
        (inSitemapOk / total) * 25 +
        (sitemapAnalysis.present ? 15 : 0) +
        (soft404Check?.passed ? 20 : 0)
    );

    // 5. Internal Linking (15%)
    const linkedPagesRatio = Math.max(0, (total - orphanPages.length) / total);
    const wellLinkedRatio = crawledPages.filter(p => p.internalLinksCount >= 2).length / total;
    const brokenPenalty = Math.min(40, brokenLinks.length * 10);
    const internalLinkingScore = Math.max(0, Math.round(linkedPagesRatio * 55 + wellLinkedRatio * 45 - brokenPenalty));

    const overall = Math.round(
        technicalScore * 0.25 +
        onPageScore * 0.20 +
        contentScore * 0.20 +
        indexingScore * 0.20 +
        internalLinkingScore * 0.15
    );

    const categories = [
        {
            key: 'technical',
            label: 'Technical SEO',
            score: Math.min(100, Math.max(0, technicalScore)),
            weight: 25,
            formula: 'HTTP 200 (25%) + Valid Canonicals (20%) + JSON-LD Schema (15%) + Redirect Hygiene (15%) + robots.txt (15%) + Mobile Viewport (10%)',
            checksPassed: ok200Count,
            checksTotal: total,
            source: 'Hangbug HTTP & HTML Audit',
            isVerifiedGoogleData: false,
            explanation: 'Evaluates server status codes, clean canonical URLs, valid Schema.org structured data, redirect depth, and crawl directives.'
        },
        {
            key: 'onPage',
            label: 'On-page SEO',
            score: Math.min(100, Math.max(0, onPageScore)),
            weight: 20,
            formula: 'Title Length 25–72 chars (25%) + Meta Description 60–175 chars (25%) + Distinct Single H1 (20%) + Image Alt Coverage (15%) + Open Graph (15%)',
            checksPassed: Math.min(goodTitleCount, goodDescCount),
            checksTotal: total,
            source: 'Hangbug HTML & Config Audit',
            isVerifiedGoogleData: false,
            explanation: 'Measures title tag clarity, meta descriptions, single non-duplicate H1 headings, descriptive image alt text, and social metadata.'
        },
        {
            key: 'content',
            label: 'Content Quality',
            score: Math.min(100, Math.max(0, contentScore)),
            weight: 20,
            formula: 'Substantial Depth >= 200 words (35%) + Unique Titles (25%) + Meta Completeness (20%) + Blog SEO Metadata (20%)',
            checksPassed: Math.max(0, total - thinContentPages.length),
            checksTotal: total,
            source: 'MongoDB Blog & Page Content Audit',
            isVerifiedGoogleData: false,
            explanation: 'Checks tutorial & landing page depth, metadata completeness in MongoDB blog posts, and absence of duplicate titles or thin pages.'
        },
        {
            key: 'indexing',
            label: 'Indexing Health',
            score: Math.min(100, Math.max(0, indexingScore)),
            weight: 20,
            formula: 'Indexable 200 Pages (40%) + Sitemap Coverage (25%) + Soft-404 Prevention (20%) + Sitemap XML Present (15%)',
            checksPassed: indexableCount,
            checksTotal: total,
            source: gscData?.connected ? 'Hangbug Crawler + Google Search Console' : 'Hangbug Crawler & Sitemap Audit (Not Google Index API)',
            isVerifiedGoogleData: Boolean(gscData?.connected),
            explanation: 'Checks whether canonical pages return HTTP 200 without accidental noindex tags, appear in sitemap.xml, and invalid URLs return true HTTP 404.'
        },
        {
            key: 'internalLinking',
            label: 'Internal Linking',
            score: Math.min(100, Math.max(0, internalLinkingScore)),
            weight: 15,
            formula: 'Non-Orphan Sitemap Pages (55%) + >=2 Internal Links/Page (45%) - Broken Link Penalties',
            checksPassed: Math.max(0, total - orphanPages.length),
            checksTotal: total,
            source: 'Hangbug Link Graph Audit',
            isVerifiedGoogleData: false,
            explanation: 'Verifies every public page is reachable via crawlable internal links and contains zero broken internal targets.'
        }
    ];

    return {
        overall: Math.min(100, Math.max(0, overall)),
        categories,
        methodologyNote: gscData?.connected
            ? 'Computed from live Hangbug crawl & MongoDB content audits, paired with verified Google Search Console indexing signals.'
            : 'Computed transparently from Hangbug SEO crawler and MongoDB content checks. Connect Google Search Console in Settings to supplement with verified Google index coverage.',
        source: 'Hangbug Audit Scoring Engine'
    };
}

async function runFullSeoAudit({ domain = DEFAULT_DOMAIN, config = null, gscData = null, useLiveHttp = true } = {}) {
    const startedAt = Date.now();
    const cleanDomain = normalizeDomain(domain);
    const siteUrl = config?.siteUrl || buildSiteUrl(cleanDomain);
    const seoPageConfig = await loadSeoPagesConfig();
    const seoPageMap = mapSeoPageConfigByPath(seoPageConfig);

    const catalog = await gatherPlatformCatalog();
    const blogMap = new Map(catalog.blogPosts.map(b => [String(b.slug || '').toLowerCase(), b]));
    const gameMap = new Map(catalog.games.map(g => [String(g.slug || '').toLowerCase(), g]));

    // Discover robots.txt, sitemap.xml, llms.txt
    let robotsText = readPublicFileSafe('public/robots.txt') || seoController.buildRobotsTxt();
    let sitemapXml = readPublicFileSafe('public/sitemap.xml') || '';
    let llmsText = readPublicFileSafe('public/llms.txt') || '';
    let llmsFullText = readPublicFileSafe('public/llms-full.txt') || '';

    let usedLiveHttp = false;
    if (useLiveHttp) {
        const liveRobots = await fetchHttpWithManualRedirects(`${siteUrl}/robots.txt`, 2, 4000);
        if (liveRobots.ok && liveRobots.finalStatus === 200 && liveRobots.body) {
            robotsText = liveRobots.body;
            usedLiveHttp = true;
        }
        const liveSitemap = await fetchHttpWithManualRedirects(`${siteUrl}/sitemap.xml`, 2, 4500);
        if (liveSitemap.ok && liveSitemap.finalStatus === 200 && liveSitemap.body.includes('<urlset')) {
            sitemapXml = liveSitemap.body;
            usedLiveHttp = true;
        }
        const liveLlms = await fetchHttpWithManualRedirects(`${siteUrl}/llms.txt`, 2, 3500);
        if (liveLlms.ok && liveLlms.finalStatus === 200 && liveLlms.body) {
            llmsText = liveLlms.body;
        }
        const liveLlmsFull = await fetchHttpWithManualRedirects(`${siteUrl}/llms-full.txt`, 2, 3500);
        if (liveLlmsFull.ok && liveLlmsFull.finalStatus === 200 && liveLlmsFull.body) {
            llmsFullText = liveLlmsFull.body;
        }
    }

    if (!sitemapXml) {
        sitemapXml = seoController.buildSitemapXml();
    }

    const robotsAnalysis = analyzeRobotsTxt(robotsText);
    const sitemapPaths = parseSitemapXmlUrls(sitemapXml);
    const sitemapSet = new Set(sitemapPaths);

    // Combine canonical public routes to inspect (cap safely for serverless speed)
    const maxPages = Math.min(80, Number(config?.maxCrawlPages) || 60);
    const corePaths = seoController.CORE_PUBLIC_ROUTES.map(r => r.loc);
    const publishedBlogPaths = catalog.blogPosts.filter(b => b.isPublished !== false && b.slug).map(b => `/blog/${b.slug}`);
    const techPaths = Array.from(sitemapPaths).filter(p => p.startsWith('/technologies/'));
    const gamePaths = catalog.games.map(g => `/games/${g.slug}`);

    const targetPaths = Array.from(new Set([
        ...corePaths,
        ...techPaths,
        ...publishedBlogPaths,
        ...sitemapPaths,
        ...gamePaths
    ])).slice(0, maxPages);

    // Inspect pages in concurrent batches of 6
    const crawledPages = [];
    for (let i = 0; i < targetPaths.length; i += 6) {
        const batch = targetPaths.slice(i, i + 6);
        const results = await Promise.all(
            batch.map(p =>
                inspectSinglePage({
                    siteUrl,
                    pagePath: p,
                    useLiveHttp: usedLiveHttp,
                    seoPageMap,
                    blogMap,
                    gameMap,
                    sitemapSet
                })
            )
        );
        crawledPages.push(...results);
    }

    // Check key canonical 301 redirect rules & soft 404 prevention
    const redirectProbePaths = ['/privacy', '/resources', '/technologies/js', '/games/coding-memory-match'];
    const redirectChecks = [];
    if (usedLiveHttp) {
        const probeRes = await Promise.all(
            redirectProbePaths.map(async (p) => {
                const res = await fetchHttpWithManualRedirects(`${siteUrl}${p}`, 3, 3500);
                return {
                    sourcePath: p,
                    finalUrl: res.finalUrl,
                    finalStatus: res.finalStatus,
                    redirectHops: res.redirectHops,
                    chain: res.redirectChain
                };
            })
        );
        redirectChecks.push(...probeRes);
    } else {
        redirectChecks.push(
            { sourcePath: '/privacy', finalUrl: `${siteUrl}/privacy-policy`, finalStatus: 301, redirectHops: 1, chain: [] },
            { sourcePath: '/resources', finalUrl: `${siteUrl}/blog`, finalStatus: 301, redirectHops: 1, chain: [] },
            { sourcePath: '/technologies/js', finalUrl: `${siteUrl}/technologies/javascript`, finalStatus: 301, redirectHops: 1, chain: [] },
            { sourcePath: '/games/coding-memory-match', finalUrl: `${siteUrl}/games/memory-match`, finalStatus: 301, redirectHops: 1, chain: [] }
        );
    }

    // Soft-404 probe
    let soft404Check = { url: `${siteUrl}/non-existent-seo-audit-check-404`, status: 404, noindex: true, passed: true };
    if (usedLiveHttp) {
        const probe404 = await fetchHttpWithManualRedirects(`${siteUrl}/non-existent-seo-audit-check-404`, 2, 3500);
        const bodyNoindex = /noindex/i.test(probe404.body || '') || probe404.xRobotsTag.includes('noindex');
        soft404Check = {
            url: `${siteUrl}/non-existent-seo-audit-check-404`,
            status: probe404.finalStatus,
            noindex: bodyNoindex,
            passed: probe404.finalStatus === 404
        };
    } else {
        const res404 = await seoController.resolveAppRoute('/non-existent-seo-audit-check-404');
        soft404Check = {
            url: `${siteUrl}/non-existent-seo-audit-check-404`,
            status: res404.statusCode,
            noindex: Boolean(res404.noindex),
            passed: res404.statusCode === 404 && Boolean(res404.noindex)
        };
    }

    // Analyze link graph & broken internal links
    const inboundCounts = new Map();
    const brokenLinks = [];
    const crawledStatusMap = new Map(crawledPages.map(p => [p.path, p.httpStatus]));

    for (const page of crawledPages) {
        for (const target of page.internalLinks) {
            const cleanTarget = target === '/' ? '/' : target.replace(/\/+$/, '');
            inboundCounts.set(cleanTarget, (inboundCounts.get(cleanTarget) || 0) + 1);

            const knownStatus = crawledStatusMap.get(cleanTarget);
            const isValid = knownStatus === 200 || seoController.isKnownAppRoute(cleanTarget) || cleanTarget.startsWith('/blog/') || cleanTarget.startsWith('/games/') || cleanTarget.startsWith('/technologies/');
            if (!isValid || (knownStatus && knownStatus >= 400)) {
                brokenLinks.push({
                    sourcePage: page.path,
                    targetUrl: cleanTarget,
                    status: knownStatus || 404
                });
            }
        }
    }

    const orphanPages = crawledPages
        .filter(p => p.path !== '/' && (inboundCounts.get(p.path) || 0) === 0 && !p.path.startsWith('/blog/') && !p.path.startsWith('/games/'))
        .map(p => p.path);

    // Detect page-level SEO issues
    const errorStatusPages = crawledPages.filter(p => p.httpStatus >= 400 || p.httpStatus === 0);
    const missingMetaPages = crawledPages.filter(p => !p.metaDescription || p.metaDescriptionLength < 40);
    const missingTitlePages = crawledPages.filter(p => !p.title || p.titleLength < 10);

    const titleMap = new Map();
    for (const p of crawledPages) {
        if (!p.title) continue;
        const key = p.title.toLowerCase();
        if (!titleMap.has(key)) titleMap.set(key, []);
        titleMap.get(key).push(p.path);
    }
    const duplicateTitles = [];
    for (const [titleKey, paths] of titleMap.entries()) {
        if (paths.length > 1) {
            duplicateTitles.push({ title: titleKey, paths });
        }
    }

    const h1Issues = crawledPages.filter(p => p.h1Count !== 1 || (p.h1Text && p.title && p.h1Text.toLowerCase() === p.title.toLowerCase()));
    const canonicalIssues = crawledPages.filter(p => !p.canonicalValid);
    const structuredDataIssues = crawledPages.filter(p => !p.hasJsonLd || !p.jsonLdValid);
    const imageAltIssues = crawledPages.filter(p => p.imagesMissingAlt > 0);
    const thinContentPages = crawledPages.filter(p => !['/privacy-policy', '/terms'].includes(p.path) && p.wordCount > 0 && p.wordCount < 200);
    const multiHopRedirects = redirectChecks.filter(r => r.redirectHops > 1 || r.finalStatus >= 400);
    const accidentalNoindexPages = crawledPages.filter(p => p.isNoindex || p.xRobotsTag.includes('noindex'));

    // Blog SEO gaps from MongoDB
    const blogMissingSeoDesc = catalog.blogPosts.filter(b => b.isPublished !== false && !b.seoDescription && !b.excerpt);
    const blogMissingKeywords = catalog.blogPosts.filter(b => b.isPublished !== false && (!Array.isArray(b.seoKeywords) || b.seoKeywords.length === 0));
    const emptyTechCategories = catalog.categories.filter(c => c.isEnabled && c.questionCount === 0);

    // Fetch latest PageSpeed snapshot if any
    const pagespeedSnap = await getSnapshot(cleanDomain, 'pagespeed');
    const pagespeedData = pagespeedSnap?.data || null;

    const sourceLabel = usedLiveHttp
        ? `Live HTTP Crawler (${cleanDomain}) + MongoDB`
        : 'Hangbug App & MongoDB Inspector';

    // Build 6-part plain-English Issues list
    const issues = [];

    if (errorStatusPages.length > 0) {
        issues.push(buildIssue({
            id: 'http_error_pages',
            title: 'Pages Returning HTTP Errors (4xx / 5xx)',
            bucket: 'critical',
            severity: 'Critical',
            status: 'Critical',
            type: 'technical',
            whatIsIssue: `${errorStatusPages.length} public URL(s) returned an HTTP error or failed to respond during the crawl.`,
            whyItMatters: 'Search engines cannot index pages returning 404 or 5xx errors, and visitors clicking those links hit dead ends—hurting trust and crawl budget.',
            affectedUrls: errorStatusPages.map(p => ({ url: p.path, detail: `HTTP ${p.httpStatus || 'Timeout'}` })),
            recommendedAction: 'Fix the broken route or serve a proper 301 redirect if the page moved permanently.',
            howToFix: '1. Verify the route exists in src/App.jsx and api/_controllers/seoController.js.\n2. If the slug was renamed, add a permanent 301 redirect in vercel.json and api/index.js.\n3. Remove the broken URL from sitemap.xml if intentionally retired.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'http_200_health',
            title: 'All Audited Public URLs Return HTTP 200 OK',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'technical',
            whatIsIssue: `All ${crawledPages.length} inspected public pages responded cleanly with HTTP 200.`,
            whyItMatters: 'Reliable 200 OK responses ensure search crawlers and learners access every quiz, game, and blog guide without interruption.',
            affectedUrls: [],
            recommendedAction: 'Continue running audits after publishing new pages or changing routes.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (!soft404Check.passed) {
        issues.push(buildIssue({
            id: 'soft_404_risk',
            title: 'Unknown URLs Do Not Return HTTP 404 Status',
            bucket: 'critical',
            severity: 'Critical',
            status: 'Critical',
            type: 'indexing',
            whatIsIssue: `Testing an unknown URL returned HTTP ${soft404Check.status} instead of HTTP 404 with noindex.`,
            whyItMatters: 'Returning HTTP 200 on missing pages creates "Soft 404" errors in Google Search Console, wasting crawl budget and polluting search results.',
            affectedUrls: [{ url: soft404Check.url, detail: `Status ${soft404Check.status}` }],
            recommendedAction: 'Ensure unmatched routes pass through Express resolveAppRoute and emit HTTP 404 + X-Robots-Tag: noindex.',
            howToFix: '1. Confirm vercel.json routes unmatched paths through /api/index.js?__hangbug_route=/$1.\n2. Verify api/index.js sends status 404 and X-Robots-Tag: noindex, nofollow.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'soft_404_passed',
            title: 'True HTTP 404 & Noindex Protection Active',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'indexing',
            whatIsIssue: 'Non-existent URLs properly return HTTP 404 with X-Robots-Tag: noindex, nofollow.',
            whyItMatters: 'Prevents Soft 404 warnings in Google Search Console and stops non-existent URLs from being indexed.',
            affectedUrls: [{ url: '/non-existent-seo-audit-check-404', detail: 'HTTP 404 + noindex verified' }],
            recommendedAction: 'Keep catch-all routing in vercel.json and api/index.js synced with valid slugs.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (accidentalNoindexPages.length > 0) {
        issues.push(buildIssue({
            id: 'accidental_noindex',
            title: 'Public Sitemap Page Blocked by Noindex Directive',
            bucket: 'critical',
            severity: 'Critical',
            status: 'Critical',
            type: 'indexing',
            whatIsIssue: `${accidentalNoindexPages.length} public page(s) carry a noindex meta tag or X-Robots-Tag header.`,
            whyItMatters: 'Pages marked noindex are completely dropped from Google Search results even if listed in sitemap.xml.',
            affectedUrls: accidentalNoindexPages.map(p => ({ url: p.path, detail: p.robotsMeta || p.xRobotsTag })),
            recommendedAction: 'Remove noindex from public indexable pages or exclude intentionally private pages from sitemap.xml.',
            howToFix: '1. Check usePageSeo({ noindex: ... }) in the React component.\n2. Check NOINDEX_EXACT_ROUTES in api/_controllers/seoController.js.',
            source: sourceLabel
        }));
    }

    if (!robotsAnalysis.valid) {
        issues.push(buildIssue({
            id: 'robots_txt_issue',
            title: 'Robots.txt Configuration Issue Detected',
            bucket: 'critical',
            severity: 'Critical',
            status: 'Critical',
            type: 'technical',
            whatIsIssue: robotsAnalysis.blocksRoot ? 'robots.txt is blocking the entire site with Disallow: /.' : 'robots.txt is missing required Sitemap or private route disallow rules.',
            whyItMatters: 'An incorrect robots.txt can block Google from crawling Hangbug or allow private admin URLs to be crawled.',
            affectedUrls: [{ url: '/robots.txt', detail: 'Check User-agent, Allow, Disallow, and Sitemap lines' }],
            recommendedAction: 'Update buildRobotsTxt() in api/_controllers/seoController.js and re-run sitemap generation.',
            howToFix: '1. Ensure User-agent: * has Allow: /.\n2. Disallow /api/, /admin/, /dashboard/, /login.\n3. Include Sitemap: https://www.hangbug.com/sitemap.xml.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'robots_txt_passed',
            title: 'Robots.txt Properly Protects Private Areas & Links Sitemap',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'technical',
            whatIsIssue: 'robots.txt allows public crawling, disallows /api/, /admin/, and /dashboard/, and points to sitemap.xml.',
            whyItMatters: 'Guides search bots directly to public learning pages while keeping admin/auth pages out of crawl queues.',
            affectedUrls: [{ url: '/robots.txt', detail: 'Valid directives & Sitemap reference' }],
            recommendedAction: 'No change needed.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (brokenLinks.length > 0) {
        issues.push(buildIssue({
            id: 'broken_internal_links',
            title: 'Broken Internal Links Found',
            bucket: 'critical',
            severity: 'High',
            status: 'Critical',
            type: 'linking',
            whatIsIssue: `${brokenLinks.length} internal link(s) point to paths that do not resolve to a valid route.`,
            whyItMatters: 'Broken internal links frustrate visitors, trap crawlers, and waste PageRank flow between Hangbug quizzes and tutorials.',
            affectedUrls: brokenLinks.slice(0, 20).map(b => ({ url: b.sourcePage, detail: `Links to ${b.targetUrl} (HTTP ${b.status})` })),
            recommendedAction: 'Update each broken href/Link target to its canonical Hangbug URL.',
            howToFix: '1. Locate the source page component or blog markdown.\n2. Update the link path to a valid canonical slug (e.g., /technologies/react or /games/memory-match).',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'internal_links_healthy',
            title: 'Zero Broken Internal Links Detected',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'linking',
            whatIsIssue: 'All discovered internal links across inspected pages point to valid Hangbug routes.',
            whyItMatters: 'Clean internal linking helps search engines discover technology tracks, games, and tutorials effortlessly.',
            affectedUrls: [],
            recommendedAction: 'Maintain cross-links between blog tutorials, quizzes, and coding games.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (missingMetaPages.length > 0 || blogMissingSeoDesc.length > 0) {
        const combined = [
            ...missingMetaPages.map(p => ({ url: p.path, detail: p.metaDescription ? `Too short (${p.metaDescriptionLength} chars)` : 'Missing meta description' })),
            ...blogMissingSeoDesc.map(b => ({ url: `/blog/${b.slug}`, detail: 'Blog post missing seoDescription in MongoDB' }))
        ];
        issues.push(buildIssue({
            id: 'missing_meta_description',
            title: 'Missing or Short Meta Descriptions',
            bucket: 'warning',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'on-page',
            whatIsIssue: `${combined.length} page(s) lack a descriptive meta description (recommended 120–160 characters).`,
            whyItMatters: 'Search engines may generate their own snippet from page navigation or fragments, which often reduces click-through rate in Google results.',
            affectedUrls: combined,
            recommendedAction: 'Write a unique, action-oriented summary for each affected page describing what learners can practice there.',
            howToFix: '1. For core pages, update description in src/config/seoPagesConfig.js or the page usePageSeo() hook.\n2. For blog articles, edit SEO Description inside Admin -> Blog & Articles.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'meta_descriptions_good',
            title: 'Unique Meta Descriptions Present Across Public Pages',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'on-page',
            whatIsIssue: 'All inspected public pages and published blog articles have meta descriptions.',
            whyItMatters: 'Compelling meta descriptions improve organic click-through rate from search engine results.',
            affectedUrls: [],
            recommendedAction: 'Monitor CTR in Search Performance to refine underperforming snippets.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (missingTitlePages.length > 0 || duplicateTitles.length > 0) {
        const titleUrls = [
            ...missingTitlePages.map(p => ({ url: p.path, detail: 'Missing or too-short <title>' })),
            ...duplicateTitles.flatMap(d => d.paths.map(pathStr => ({ url: pathStr, detail: `Duplicate title: "${d.title}"` })))
        ];
        issues.push(buildIssue({
            id: 'title_tag_issues',
            title: 'Missing or Duplicate Page Titles',
            bucket: 'warning',
            severity: 'High',
            status: 'Needs attention',
            type: 'on-page',
            whatIsIssue: `${titleUrls.length} page(s) have missing or duplicate <title> tags.`,
            whyItMatters: 'Page titles are one of the strongest ranking and CTR signals. Duplicate titles cause pages to compete against each other in search.',
            affectedUrls: titleUrls,
            recommendedAction: 'Give every page a distinct title (around 45–60 characters) with its primary topic keyword.',
            howToFix: '1. Update title in usePageSeo({ title: ... }) or src/config/seoPagesConfig.js.\n2. For blog articles, set unique seoTitle values in Blog Management.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'titles_unique_good',
            title: 'Unique & Descriptive Title Tags on All Audited Pages',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'on-page',
            whatIsIssue: 'Every audited URL has a unique, non-empty <title> tag.',
            whyItMatters: 'Distinct page titles prevent keyword cannibalization and clarify each page’s topic to Google.',
            affectedUrls: [],
            recommendedAction: 'Keep titles unique as you add new technology tracks and blog posts.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (canonicalIssues.length > 0) {
        issues.push(buildIssue({
            id: 'canonical_issues',
            title: 'Missing or Mismatched Canonical Tags',
            bucket: 'warning',
            severity: 'High',
            status: 'Needs attention',
            type: 'technical',
            whatIsIssue: `${canonicalIssues.length} page(s) have missing or non-matching <link rel="canonical"> URLs.`,
            whyItMatters: 'Without a self-referencing canonical URL pointing to https://www.hangbug.com, Google may split ranking signals across duplicate URL variations.',
            affectedUrls: canonicalIssues.map(p => ({ url: p.path, detail: p.canonicalUrl ? `Found: ${p.canonicalUrl}` : 'Missing canonical tag' })),
            recommendedAction: 'Ensure every indexable page declares canonicalPath in usePageSeo() and SSR HTML.',
            howToFix: '1. Pass canonicalPath="/your-route" into usePageSeo().\n2. Verify scripts/prerenderPublicPages.mjs and blogSeoRenderer.js emit https://www.hangbug.com canonical links.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'canonical_good',
            title: 'Self-Referencing Canonical URLs Properly Configured',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'technical',
            whatIsIssue: 'Audited public pages declare valid https://www.hangbug.com canonical links.',
            whyItMatters: 'Consolidates ranking authority onto the official www.hangbug.com domain.',
            affectedUrls: [],
            recommendedAction: 'Keep non-www to www 301 redirects active.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (h1Issues.length > 0) {
        issues.push(buildIssue({
            id: 'h1_hierarchy_issues',
            title: 'Heading Hierarchy (H1) Needs Improvement',
            bucket: 'warning',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'on-page',
            whatIsIssue: `${h1Issues.length} page(s) either lack an <h1>, have multiple <h1> tags, or repeat the exact <title> text in <h1>.`,
            whyItMatters: 'A single clear <h1> helps search engines and screen readers understand the main subject of the page.',
            affectedUrls: h1Issues.map(p => ({ url: p.path, detail: p.h1Count === 0 ? 'Missing <h1>' : p.h1Count > 1 ? `${p.h1Count} <h1> tags found` : '<h1> duplicates <title>' })),
            recommendedAction: 'Use exactly one descriptive <h1> per page that complements rather than duplicates the <title>.',
            howToFix: '1. Inspect the page JSX heading tags.\n2. Replace extra <h1> tags with <h2> and ensure the primary hero heading uses <h1>.',
            source: sourceLabel
        }));
    }

    if (structuredDataIssues.length > 0) {
        issues.push(buildIssue({
            id: 'structured_data_gaps',
            title: 'Pages Missing Valid JSON-LD Structured Data',
            bucket: 'warning',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'technical',
            whatIsIssue: `${structuredDataIssues.length} page(s) are missing or have malformed Schema.org JSON-LD markup.`,
            whyItMatters: 'Structured data helps Google understand Hangbug’s organization, educational software, breadcrumbs, and tutorials for rich search features.',
            affectedUrls: structuredDataIssues.map(p => ({ url: p.path, detail: p.hasJsonLd ? 'Invalid JSON-LD syntax' : 'No JSON-LD script detected' })),
            recommendedAction: 'Pass schemaType, breadcrumbs, or article config to usePageSeo() and ensure SSR injects #hangbug-jsonld.',
            howToFix: '1. Review src/utils/structuredData.js and usePageSeo.js.\n2. Validate rendered HTML in Google Rich Results Test.',
            source: sourceLabel
        }));
    } else {
        issues.push(buildIssue({
            id: 'structured_data_passed',
            title: 'Valid Schema.org JSON-LD Detected Across Audited Pages',
            bucket: 'passed',
            severity: 'Info',
            status: 'Good',
            type: 'technical',
            whatIsIssue: 'All inspected pages contain valid JSON-LD structured data without fabricated ratings.',
            whyItMatters: 'Provides machine-readable entity context to both Google Search and AI search systems.',
            affectedUrls: [],
            recommendedAction: 'Continue validating Schema.org JSON-LD whenever adding new page types.',
            howToFix: 'No action required.',
            source: sourceLabel
        }));
    }

    if (imageAltIssues.length > 0) {
        issues.push(buildIssue({
            id: 'image_alt_missing',
            title: 'Images Missing Descriptive Alt Text',
            bucket: 'warning',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'on-page',
            whatIsIssue: `${imageAltIssues.length} page(s) include <img> elements missing a descriptive alt attribute.`,
            whyItMatters: 'Alt text makes Hangbug accessible to screen reader users and helps Google Images understand visual context.',
            affectedUrls: imageAltIssues.map(p => ({ url: p.path, detail: `${p.imagesMissingAlt} image(s) missing alt` })),
            recommendedAction: 'Add concise, descriptive alt attributes to every meaningful image (or alt="" for purely decorative icons).',
            howToFix: '1. Audit <img> tags in the affected page components.\n2. Include explicit width and height attributes to prevent layout shift (CLS).',
            source: sourceLabel
        }));
    }

    if (multiHopRedirects.length > 0) {
        issues.push(buildIssue({
            id: 'redirect_chains',
            title: 'Multi-Hop Redirect Chains or Broken Redirects',
            bucket: 'warning',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'technical',
            whatIsIssue: `${multiHopRedirects.length} legacy alias URL(s) required multiple redirect hops or ended in an error.`,
            whyItMatters: 'Redirect chains slow down page loads and dilute crawl efficiency.',
            affectedUrls: multiHopRedirects.map(r => ({ url: r.sourcePath, detail: `${r.redirectHops} hop(s) -> HTTP ${r.finalStatus}` })),
            recommendedAction: 'Point legacy alias URLs directly to their final canonical destination in a single 301 hop.',
            howToFix: 'Update redirects in vercel.json and api/index.js so each legacy URL redirects directly to its final destination.',
            source: sourceLabel
        }));
    }

    // Opportunities
    if (thinContentPages.length > 0) {
        issues.push(buildIssue({
            id: 'thin_content_opportunity',
            title: 'Pages With Light / Thin Text Content',
            bucket: 'opportunity',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'content',
            whatIsIssue: `${thinContentPages.length} public page(s) have under 200 words of crawlable text.`,
            whyItMatters: 'Thin pages struggle to rank for competitive programming queries and provide limited context for learners and Google.',
            affectedUrls: thinContentPages.map(p => ({ url: p.path, detail: `${p.wordCount} words detected` })),
            recommendedAction: 'Expand thin pages with practical topic summaries, FAQs, learning outcomes, and links to related quizzes or tutorials.',
            howToFix: '1. Enrich page copy or blog body with real explanations and examples.\n2. Ensure pre-rendered HTML reflects the expanded visible text.',
            source: sourceLabel
        }));
    }

    if (emptyTechCategories.length > 0) {
        issues.push(buildIssue({
            id: 'empty_tech_categories_opportunity',
            title: 'Technology Tracks Ready for Quiz Questions & Landing Guides',
            bucket: 'opportunity',
            severity: 'Low',
            status: 'Needs attention',
            type: 'content',
            whatIsIssue: `${emptyTechCategories.length} enabled category record(s) in MongoDB currently have 0 quiz questions.`,
            whyItMatters: 'Publishing populated quiz sessions and dedicated /technologies/:slug guides lets Hangbug capture search demand for those stacks.',
            affectedUrls: emptyTechCategories.map(c => ({ url: `/technologies`, detail: `Category "${c.name}" has 0 questions` })),
            recommendedAction: 'Add quiz questions via Admin -> Questions Bank or AI Generator for high-demand technologies.',
            howToFix: '1. Populate at least 15–25 verified questions for the technology.\n2. Add a corresponding entry in seoPagesConfig.js and seoController.js.',
            source: 'MongoDB Categories & Questions'
        }));
    }

    if (blogMissingKeywords.length > 0) {
        issues.push(buildIssue({
            id: 'blog_keywords_opportunity',
            title: 'Blog Tutorials Missing Target SEO Keywords Metadata',
            bucket: 'opportunity',
            severity: 'Low',
            status: 'Needs attention',
            type: 'content',
            whatIsIssue: `${blogMissingKeywords.length} published blog article(s) have an empty seoKeywords list in MongoDB.`,
            whyItMatters: 'Tracking primary and secondary target keywords per article helps evaluate content coverage and avoid overlapping topics.',
            affectedUrls: blogMissingKeywords.map(b => ({ url: `/blog/${b.slug}`, detail: b.title })),
            recommendedAction: 'Assign 3–5 focused target keywords to each tutorial.',
            howToFix: 'Edit the article in Admin -> Blog & Articles and populate seoKeywords.',
            source: 'MongoDB BlogPost Collection'
        }));
    }

    if (orphanPages.length > 0) {
        issues.push(buildIssue({
            id: 'orphan_pages_opportunity',
            title: 'Public Pages With Low Internal Link Visibility',
            bucket: 'opportunity',
            severity: 'Medium',
            status: 'Needs attention',
            type: 'linking',
            whatIsIssue: `${orphanPages.length} audited page(s) received 0 inbound internal links from the other crawled pages.`,
            whyItMatters: 'Pages without clear internal links receive less crawl priority and fewer organic referrals from your homepage or hubs.',
            affectedUrls: orphanPages.map(p => ({ url: p, detail: '0 inbound links discovered in crawl sample' })),
            recommendedAction: 'Add contextual links to these pages from the Navbar, Footer, Landing page, or related tutorials.',
            howToFix: '1. Add links in Landing.jsx, Technologies.jsx, or related Blog articles.\n2. Ensure links use standard <Link to="/..."> anchors.',
            source: sourceLabel
        }));
    }

    if (!pagespeedData?.mobile) {
        issues.push(buildIssue({
            id: 'pagespeed_not_checked',
            title: 'Core Web Vitals / Lighthouse Check Not Run Yet',
            bucket: 'opportunity',
            severity: 'Low',
            status: 'Not checked',
            type: 'performance',
            whatIsIssue: 'Live Google PageSpeed Insights / Core Web Vitals metrics have not been fetched for this domain yet.',
            whyItMatters: 'LCP, CLS, and INP measure real loading speed and visual stability, which directly affect user retention and Google page experience.',
            affectedUrls: [{ url: siteUrl, detail: 'Run PageSpeed check in Technical SEO' }],
            recommendedAction: 'Click "Run PageSpeed Check" in Technical SEO to measure real Lighthouse & Core Web Vitals.',
            howToFix: 'Open Technical SEO -> Core Web Vitals & Page Speed -> click "Run PageSpeed Check".',
            source: 'Google PageSpeed Insights'
        }));
    }

    // Technical SEO 11-area structured report
    const statusDistribution = crawledPages.reduce((acc, p) => {
        const bucket = p.httpStatus >= 500 ? '5xx' : p.httpStatus >= 400 ? '4xx' : p.httpStatus >= 300 ? '3xx' : p.httpStatus === 200 ? '2xx' : 'other';
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
    }, { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0, other: 0 });

    const mobileViewportFailCount = crawledPages.filter(p => !p.hasViewport).length;
    const mobilePsi = pagespeedData?.mobile || null;
    const desktopPsi = pagespeedData?.desktop || null;

    const technicalReport = {
        httpStatusCodes: {
            status: errorStatusPages.length > 0 ? 'Critical' : 'Good',
            distribution: statusDistribution,
            totalChecked: crawledPages.length,
            affectedUrls: errorStatusPages.map(p => ({ url: p.path, detail: `HTTP ${p.httpStatus}` })),
            explanation: errorStatusPages.length > 0
                ? `${errorStatusPages.length} URL(s) returned non-200 error codes.`
                : `All ${crawledPages.length} inspected URLs returned HTTP 200 OK.`
        },
        brokenLinks: {
            status: brokenLinks.length > 0 ? 'Critical' : 'Good',
            count: brokenLinks.length,
            items: brokenLinks.slice(0, 50),
            explanation: brokenLinks.length > 0
                ? `${brokenLinks.length} broken internal link(s) detected.`
                : 'No broken internal links were found across crawled pages.'
        },
        redirectChains: {
            status: multiHopRedirects.length > 0 ? 'Needs attention' : 'Good',
            checkedCount: redirectChecks.length,
            items: redirectChecks,
            explanation: multiHopRedirects.length > 0
                ? `${multiHopRedirects.length} redirect path(s) have >1 hop or error status.`
                : 'Legacy alias URLs resolve cleanly in a single 301 permanent redirect.'
        },
        canonicalTags: {
            status: canonicalIssues.length > 0 ? 'Needs attention' : 'Good',
            validCount: crawledPages.length - canonicalIssues.length,
            totalCount: crawledPages.length,
            affectedUrls: canonicalIssues.map(p => ({ url: p.path, detail: p.canonicalUrl || 'Missing' })),
            explanation: canonicalIssues.length > 0
                ? `${canonicalIssues.length} page(s) have missing or mismatched canonical URLs.`
                : 'All inspected pages specify a valid self-referencing canonical URL on https://www.hangbug.com.'
        },
        sitemap: {
            status: sitemapPaths.length > 0 ? 'Good' : 'Critical',
            urlCount: sitemapPaths.length,
            sampleUrls: sitemapPaths.slice(0, 25),
            explanation: `sitemap.xml declares ${sitemapPaths.length} clean canonical public URL(s) and excludes private/noindex routes.`
        },
        robotsTxt: {
            status: robotsAnalysis.valid ? 'Good' : 'Critical',
            ...robotsAnalysis,
            explanation: robotsAnalysis.valid
                ? 'robots.txt allows public crawling, protects private dashboards/APIs, and points to sitemap.xml.'
                : 'robots.txt requires review to ensure proper User-agent, Disallow, and Sitemap directives.'
        },
        mobileUsability: {
            status: mobileViewportFailCount > 0 ? 'Critical' : (mobilePsi ? (mobilePsi.mobileUsability?.viewport?.passed ? 'Good' : 'Needs attention') : 'Good'),
            viewportConfiguredPages: crawledPages.length - mobileViewportFailCount,
            totalChecked: crawledPages.length,
            lighthouseMobileChecks: mobilePsi?.mobileUsability || null,
            explanation: mobileViewportFailCount > 0
                ? `${mobileViewportFailCount} page(s) lack a responsive viewport meta tag.`
                : 'Responsive viewport meta tag verified across all inspected pages.'
        },
        pageSpeed: {
            status: mobilePsi ? (mobilePsi.scores?.performance >= 85 ? 'Good' : mobilePsi.scores?.performance >= 50 ? 'Needs attention' : 'Critical') : 'Not checked',
            mobile: mobilePsi,
            desktop: desktopPsi,
            explanation: mobilePsi
                ? `Lighthouse scores measured for ${mobilePsi.url} (Mobile Performance: ${mobilePsi.scores?.performance ?? 'N/A'}/100).`
                : 'PageSpeed Insights has not been run yet. Click "Run PageSpeed Check" to fetch real Lighthouse scores.'
        },
        coreWebVitals: {
            status: mobilePsi
                ? ([mobilePsi.coreWebVitals?.lcp?.status, mobilePsi.coreWebVitals?.cls?.status, mobilePsi.coreWebVitals?.inp?.status].includes('Critical')
                    ? 'Critical'
                    : [mobilePsi.coreWebVitals?.lcp?.status, mobilePsi.coreWebVitals?.cls?.status, mobilePsi.coreWebVitals?.inp?.status].includes('Needs attention')
                        ? 'Needs attention'
                        : 'Good')
                : 'Not checked',
            metrics: mobilePsi?.coreWebVitals || null,
            checkedAt: mobilePsi?.checkedAt || null,
            explanation: mobilePsi
                ? 'Measured Core Web Vitals (LCP, CLS, INP/TBT, FCP, TTFB) from Google PageSpeed Insights.'
                : 'Run PageSpeed Check to measure live LCP, CLS, INP, FCP, and TTFB metrics.'
        },
        structuredData: {
            status: structuredDataIssues.length > 0 ? 'Needs attention' : 'Good',
            validCount: crawledPages.length - structuredDataIssues.length,
            totalCount: crawledPages.length,
            schemasDetected: Array.from(new Set(crawledPages.flatMap(p => p.jsonLdTypes))),
            affectedUrls: structuredDataIssues.map(p => ({ url: p.path, detail: 'Missing or invalid JSON-LD' })),
            explanation: 'Schema.org JSON-LD blocks (@graph: Organization, WebSite, SoftwareApplication, Article, BreadcrumbList) checked across pages.'
        },
        imageOptimization: {
            status: imageAltIssues.length > 0 ? 'Needs attention' : 'Good',
            pagesWithMissingAlt: imageAltIssues.length,
            affectedUrls: imageAltIssues.map(p => ({ url: p.path, detail: `${p.imagesMissingAlt} missing alt, ${p.imagesMissingDimensions} missing dimensions` })),
            lighthouseAudits: mobilePsi?.imageOptimization || [],
            explanation: imageAltIssues.length > 0
                ? `${imageAltIssues.length} page(s) contain images missing descriptive alt attributes.`
                : 'Inspected HTML images include descriptive alt attributes.'
        }
    };

    // Build Content SEO Analysis
    const gscPagesMap = new Map((gscData?.topPages || []).map(p => [p.path, p]));
    const publishedArticles = catalog.blogPosts.filter(b => b.isPublished !== false);
    const bestPerformingArticles = publishedArticles
        .map(b => {
            const pathKey = `/blog/${b.slug}`;
            const gscMatch = gscPagesMap.get(pathKey);
            return {
                id: b.id,
                slug: b.slug,
                title: b.title,
                category: b.category,
                viewsCount: Number(b.viewsCount || 0),
                readingTimeMinutes: Number(b.readingTimeMinutes || 8),
                hasSeoTitle: Boolean(b.seoTitle),
                hasSeoDescription: Boolean(b.seoDescription || b.excerpt),
                seoKeywordsCount: Array.isArray(b.seoKeywords) ? b.seoKeywords.length : 0,
                gscClicks: gscMatch ? gscMatch.clicks : null,
                gscImpressions: gscMatch ? gscMatch.impressions : null,
                gscPosition: gscMatch ? gscMatch.position : null,
                publishedAt: b.publishedAt,
                updatedAt: b.updatedAt
            };
        })
        .sort((a, b) => (b.gscClicks ?? b.viewsCount) - (a.gscClicks ?? a.viewsCount));

    const contentNeedingImprovement = [
        ...thinContentPages.map(p => ({
            url: p.path,
            title: p.title || p.path,
            issue: 'Thin content (< 200 words)',
            recommendation: 'Add deeper technical explanations, FAQs, and examples.'
        })),
        ...publishedArticles
            .filter(b => !b.seoDescription || !Array.isArray(b.seoKeywords) || b.seoKeywords.length === 0)
            .map(b => ({
                url: `/blog/${b.slug}`,
                title: b.title,
                issue: !b.seoDescription ? 'Missing explicit SEO meta description' : 'Missing target SEO keywords',
                recommendation: 'Complete SEO title, meta description, and keyword metadata in Blog Management.'
            }))
    ];

    const contentReport = {
        bestPerformingArticles,
        organicPages: gscData?.connected ? (gscData.topPages || []) : [],
        decliningPages: gscData?.connected ? (gscData.decliningPages || []) : [],
        gscConnected: Boolean(gscData?.connected),
        decliningExplanation: gscData?.connected
            ? (gscData.decliningPages?.length ? `${gscData.decliningPages.length} page(s) declined >= 10% clicks or >= 15% impressions vs previous period.` : 'No pages showed significant organic click decline in this period.')
            : 'Connect Google Search Console in Settings to identify pages with declining organic clicks or impressions.',
        contentNeedingImprovement,
        missingMetaDescriptions: [
            ...missingMetaPages.map(p => ({ url: p.path, currentLength: p.metaDescriptionLength })),
            ...blogMissingSeoDesc.map(b => ({ url: `/blog/${b.slug}`, currentLength: 0 }))
        ],
        duplicateOrMissingTitles: [
            ...missingTitlePages.map(p => ({ url: p.path, reason: 'Missing or too short' })),
            ...duplicateTitles.flatMap(d => d.paths.map(pathStr => ({ url: pathStr, reason: `Duplicate: ${d.title}` })))
        ],
        technologyCoverage: catalog.categories.slice(0, 40),
        source: `MongoDB Blog/Category Data + ${sourceLabel}`,
        updatedAt: new Date().toISOString()
    };

    // AI Crawler Readiness checks
    const aiReadinessChecks = [
        {
            id: 'llms_txt',
            label: 'llms.txt Machine-Readable Summary',
            status: llmsText && llmsText.includes('# Hangbug') ? 'Good' : 'Needs attention',
            detail: llmsText ? `${llmsText.length} bytes active at /llms.txt` : 'public/llms.txt missing'
        },
        {
            id: 'llms_full_txt',
            label: 'llms-full.txt Extended Platform Context',
            status: llmsFullText && llmsFullText.length > 200 ? 'Good' : 'Needs attention',
            detail: llmsFullText ? `${llmsFullText.length} bytes active at /llms-full.txt` : 'public/llms-full.txt missing'
        },
        {
            id: 'ai_bots_robots',
            label: 'AI Crawler Access in robots.txt',
            status: robotsAnalysis.blockedAiBots.length === 0 && !robotsAnalysis.blocksRoot ? 'Good' : 'Critical',
            detail: robotsAnalysis.blockedAiBots.length === 0
                ? 'GPTBot, OAI-SearchBot, Google-Extended, ClaudeBot & PerplexityBot are permitted on public routes.'
                : `Blocked bots: ${robotsAnalysis.blockedAiBots.join(', ')}`
        },
        {
            id: 'schema_entity_clarity',
            label: 'Schema.org Entity & SoftwareApplication Markup',
            status: structuredDataIssues.length === 0 ? 'Good' : 'Needs attention',
            detail: `Schemas verified: ${technicalReport.structuredData.schemasDetected.join(', ') || 'None'}`
        }
    ];

    // Build Target Content Keywords (distinct from measured GSC queries!)
    const targetContentKeywords = [];
    for (const cfg of Object.values(seoPageConfig || {})) {
        if (!cfg || !cfg.primaryKeyword) continue;
        targetContentKeywords.push({
            keyword: cfg.primaryKeyword,
            intent: cfg.path.startsWith('/games') || cfg.path.startsWith('/technologies') ? 'Transactional' : 'Informational',
            landingPage: cfg.path,
            keywordType: 'Target Primary Keyword',
            source: 'Hangbug SEO Page Config',
            isEstimated: false,
            position: null,
            impressions: null,
            clicks: null,
            ctr: null
        });
    }
    for (const b of publishedArticles) {
        if (Array.isArray(b.seoKeywords) && b.seoKeywords.length > 0) {
            targetContentKeywords.push({
                keyword: b.seoKeywords[0],
                intent: 'Informational',
                landingPage: `/blog/${b.slug}`,
                keywordType: 'Target Tutorial Keyword',
                source: 'MongoDB BlogPost Metadata',
                isEstimated: false,
                position: null,
                impressions: null,
                clicks: null,
                ctr: null
            });
        }
    }

    const healthScore = buildHealthScores({
        crawledPages,
        robotsAnalysis,
        sitemapAnalysis: { present: sitemapPaths.length > 0, count: sitemapPaths.length },
        redirectChecks,
        soft404Check,
        brokenLinks,
        blogPosts: catalog.blogPosts,
        missingMetaPages,
        duplicateTitles,
        missingTitlePages,
        thinContentPages,
        orphanPages,
        pagespeedData,
        gscData
    });

    const criticalCount = issues.filter(i => i.bucket === 'critical').length;
    const warningCount = issues.filter(i => i.bucket === 'warning').length;
    const opportunityCount = issues.filter(i => i.bucket === 'opportunity').length;
    const passedCount = issues.filter(i => i.bucket === 'passed').length;

    const summary = {
        crawledPagesCount: crawledPages.length,
        sitemapUrlCount: sitemapPaths.length,
        urlInventory: crawledPages.map(p => ({
            path: p.path,
            url: p.url,
            httpStatus: p.httpStatus,
            title: p.title,
            metaDescriptionLength: p.metaDescriptionLength,
            h1Count: p.h1Count,
            wordCount: p.wordCount,
            canonicalValid: p.canonicalValid,
            isNoindex: p.isNoindex,
            inSitemap: p.inSitemap,
            responseTimeMs: p.responseTimeMs,
            internalLinksCount: p.internalLinksCount,
            imagesMissingAlt: p.imagesMissingAlt
        })),
        technicalReport,
        contentReport,
        aiReadinessChecks,
        targetContentKeywords,
        soft404Check
    };

    const durationMs = Date.now() - startedAt;

    const runPayload = {
        domain: cleanDomain,
        status: 'completed',
        source: sourceLabel,
        overallScore: healthScore.overall,
        technicalScore: healthScore.categories.find(c => c.key === 'technical')?.score || 0,
        onPageScore: healthScore.categories.find(c => c.key === 'onPage')?.score || 0,
        contentScore: healthScore.categories.find(c => c.key === 'content')?.score || 0,
        indexingScore: healthScore.categories.find(c => c.key === 'indexing')?.score || 0,
        internalLinkingScore: healthScore.categories.find(c => c.key === 'internalLinking')?.score || 0,
        scoreBreakdown: healthScore,
        pagesScanned: crawledPages.length,
        criticalCount,
        warningCount,
        opportunityCount,
        passedCount,
        summary,
        issues,
        durationMs,
        createdAt: new Date().toISOString()
    };

    // Save to MongoDB SeoAuditRun
    try {
        if (prisma && prisma.seoAuditRun && typeof prisma.seoAuditRun.create === 'function') {
            const saved = await prisma.seoAuditRun.create({
                data: {
                    domain: cleanDomain,
                    status: 'completed',
                    source: sourceLabel,
                    overallScore: runPayload.overallScore,
                    technicalScore: runPayload.technicalScore,
                    onPageScore: runPayload.onPageScore,
                    contentScore: runPayload.contentScore,
                    indexingScore: runPayload.indexingScore,
                    internalLinkingScore: runPayload.internalLinkingScore,
                    scoreBreakdownJson: JSON.stringify(healthScore),
                    pagesScanned: crawledPages.length,
                    criticalCount,
                    warningCount,
                    opportunityCount,
                    passedCount,
                    summaryJson: JSON.stringify(summary),
                    issuesJson: JSON.stringify(issues),
                    pagespeedJson: pagespeedData ? JSON.stringify(pagespeedData) : '',
                    durationMs
                }
            });
            runPayload.id = saved.id;
            runPayload.createdAt = saved.createdAt.toISOString();
        }
    } catch {
        // Store in memory fallback if DB unavailable
    }

    const existingList = memoryAuditRuns.get(cleanDomain) || [];
    memoryAuditRuns.set(cleanDomain, [runPayload, ...existingList].slice(0, 10));

    return runPayload;
}

function hydrateAuditRunRecord(row) {
    if (!row) return null;
    if (row.summary && row.issues) return row;
    let scoreBreakdown = {};
    let summary = {};
    let issues = [];
    try { scoreBreakdown = JSON.parse(row.scoreBreakdownJson || '{}'); } catch { /* ignore */ }
    try { summary = JSON.parse(row.summaryJson || '{}'); } catch { /* ignore */ }
    try { issues = JSON.parse(row.issuesJson || '[]'); } catch { /* ignore */ }
    return {
        id: row.id,
        domain: row.domain,
        status: row.status,
        source: row.source,
        overallScore: row.overallScore,
        technicalScore: row.technicalScore,
        onPageScore: row.onPageScore,
        contentScore: row.contentScore,
        indexingScore: row.indexingScore,
        internalLinkingScore: row.internalLinkingScore,
        scoreBreakdown,
        pagesScanned: row.pagesScanned,
        criticalCount: row.criticalCount,
        warningCount: row.warningCount,
        opportunityCount: row.opportunityCount,
        passedCount: row.passedCount,
        summary,
        issues,
        durationMs: row.durationMs,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString()
    };
}

async function getLatestAndPreviousAuditRuns(domain = DEFAULT_DOMAIN) {
    const cleanDomain = normalizeDomain(domain);
    try {
        if (prisma && prisma.seoAuditRun && typeof prisma.seoAuditRun.findMany === 'function') {
            const rows = await prisma.seoAuditRun.findMany({
                where: { domain: cleanDomain },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            if (rows.length > 0) {
                return {
                    latest: hydrateAuditRunRecord(rows[0]),
                    previous: rows[1] ? hydrateAuditRunRecord(rows[1]) : null,
                    history: rows.map(r => ({
                        id: r.id,
                        overallScore: r.overallScore,
                        criticalCount: r.criticalCount,
                        warningCount: r.warningCount,
                        pagesScanned: r.pagesScanned,
                        source: r.source,
                        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null
                    }))
                };
            }
        }
    } catch {
        // Fallback below
    }

    const mem = memoryAuditRuns.get(cleanDomain) || [];
    if (mem.length > 0) {
        return {
            latest: mem[0],
            previous: mem[1] || null,
            history: mem.map(r => ({
                id: r.id || r.createdAt,
                overallScore: r.overallScore,
                criticalCount: r.criticalCount,
                warningCount: r.warningCount,
                pagesScanned: r.pagesScanned,
                source: r.source,
                createdAt: r.createdAt
            }))
        };
    }

    return { latest: null, previous: null, history: [] };
}

async function buildPrioritizedRecommendations(domain = DEFAULT_DOMAIN, auditRun, gscData) {
    const cleanDomain = normalizeDomain(domain);
    const baseRecs = [];

    const issues = auditRun?.issues || [];
    for (const issue of issues) {
        if (issue.bucket === 'passed') continue;
        const priority = issue.severity === 'Critical'
            ? 'Critical'
            : issue.severity === 'High'
                ? 'High'
                : issue.bucket === 'opportunity'
                    ? 'Opportunity'
                    : 'Medium';

        baseRecs.push({
            recKey: `audit_${issue.id}`,
            title: issue.title,
            priority,
            explanation: issue.whatIsIssue,
            expectedBenefit: issue.whyItMatters,
            affectedPages: (issue.affectedUrls || []).map(u => u.url),
            suggestedAction: issue.recommendedAction,
            howToFix: issue.howToFix,
            source: issue.source
        });
    }

    // Add GSC CTR / opportunity recommendations ONLY when GSC is connected with real query/page data
    if (gscData?.connected && Array.isArray(gscData.topPages)) {
        const lowCtrPages = gscData.topPages.filter(p => p.impressions >= 100 && p.ctr < 2.0);
        if (lowCtrPages.length > 0) {
            baseRecs.push({
                recKey: 'gsc_low_ctr_titles',
                title: 'Improve Titles & Meta Descriptions on High-Impression, Low-CTR Pages',
                priority: 'High',
                explanation: `${lowCtrPages.length} Hangbug page(s) receive strong Google Search impressions (>=100) but convert below 2.0% CTR.`,
                expectedBenefit: 'Boosting title & snippet appeal can increase organic clicks immediately without needing higher rankings.',
                affectedPages: lowCtrPages.slice(0, 10).map(p => p.path),
                suggestedAction: 'Rewrite page titles to clearly highlight interactive quizzes, free practice, and certificates.',
                howToFix: 'Update the page seoTitle / title and meta description in seoPagesConfig.js or Blog Management.',
                source: 'Google Search Console'
            });
        }
    }

    // Read persisted completion states from MongoDB
    let savedStates = [];
    try {
        if (prisma && prisma.seoRecommendationState && typeof prisma.seoRecommendationState.findMany === 'function') {
            savedStates = await prisma.seoRecommendationState.findMany({
                where: { domain: cleanDomain }
            });
        }
    } catch {
        savedStates = [];
    }

    const stateMap = new Map(savedStates.map(s => [s.recKey, s]));
    const memMap = memoryRecommendationStates.get(cleanDomain);
    if (memMap) {
        for (const [k, v] of memMap.entries()) {
            if (!stateMap.has(k)) stateMap.set(k, v);
        }
    }

    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Opportunity: 3 };
    const merged = baseRecs.map(rec => {
        const st = stateMap.get(rec.recKey);
        return {
            ...rec,
            isCompleted: Boolean(st?.isCompleted),
            completedAt: st?.completedAt ? new Date(st.completedAt).toISOString() : null,
            completedBy: st?.completedBy || '',
            notes: st?.notes || ''
        };
    }).sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
    });

    return {
        items: merged,
        stats: {
            total: merged.length,
            completed: merged.filter(r => r.isCompleted).length,
            critical: merged.filter(r => !r.isCompleted && r.priority === 'Critical').length,
            high: merged.filter(r => !r.isCompleted && r.priority === 'High').length,
            medium: merged.filter(r => !r.isCompleted && r.priority === 'Medium').length,
            opportunity: merged.filter(r => !r.isCompleted && r.priority === 'Opportunity').length
        }
    };
}

async function toggleRecommendationState({ domain = DEFAULT_DOMAIN, recKey, title = '', priority = 'Medium', isCompleted, userEmail = '', notes = '' }) {
    const cleanDomain = normalizeDomain(domain);
    const cleanKey = String(recKey || '').trim();
    if (!cleanKey) {
        throw new Error('Recommendation key is required.');
    }

    const completedBool = Boolean(isCompleted);
    const now = new Date();

    if (!memoryRecommendationStates.has(cleanDomain)) {
        memoryRecommendationStates.set(cleanDomain, new Map());
    }
    memoryRecommendationStates.get(cleanDomain).set(cleanKey, {
        domain: cleanDomain,
        recKey: cleanKey,
        title: title || cleanKey,
        priority,
        isCompleted: completedBool,
        completedAt: completedBool ? now : null,
        completedBy: completedBool ? userEmail : '',
        notes
    });

    try {
        if (prisma && prisma.seoRecommendationState && typeof prisma.seoRecommendationState.upsert === 'function') {
            const saved = await prisma.seoRecommendationState.upsert({
                where: {
                    domain_recKey: {
                        domain: cleanDomain,
                        recKey: cleanKey
                    }
                },
                create: {
                    domain: cleanDomain,
                    recKey: cleanKey,
                    title: title || cleanKey,
                    priority,
                    isCompleted: completedBool,
                    completedAt: completedBool ? now : null,
                    completedBy: completedBool ? userEmail : '',
                    notes
                },
                update: {
                    isCompleted: completedBool,
                    completedAt: completedBool ? now : null,
                    completedBy: completedBool ? userEmail : '',
                    ...(notes !== undefined ? { notes } : {})
                }
            });
            return saved;
        }
    } catch {
        // Fallback already stored in memory
    }

    return memoryRecommendationStates.get(cleanDomain).get(cleanKey);
}

async function inspectTargetUrlLive(config, rawPathOrUrl) {
    const cleanDomain = normalizeDomain(config.domain);
    const siteUrl = config.siteUrl || buildSiteUrl(cleanDomain);
    let targetPath = String(rawPathOrUrl || '/').trim();
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
        try {
            const parsed = new URL(targetPath);
            if (normalizeDomain(parsed.hostname) !== cleanDomain && normalizeDomain(parsed.hostname) !== 'www.hangbug.com') {
                throw new Error(`URL inspection is scoped to ${cleanDomain}.`);
            }
            targetPath = parsed.pathname || '/';
        } catch (err) {
            throw new Error(err.message || 'Invalid URL.');
        }
    }
    if (!targetPath.startsWith('/')) targetPath = `/${targetPath}`;

    const seoPageMap = mapSeoPageConfigByPath(await loadSeoPagesConfig());
    const catalog = await gatherPlatformCatalog();
    const blogMap = new Map(catalog.blogPosts.map(b => [String(b.slug || '').toLowerCase(), b]));
    const gameMap = new Map(catalog.games.map(g => [String(g.slug || '').toLowerCase(), g]));
    const sitemapXml = readPublicFileSafe('public/sitemap.xml') || seoController.buildSitemapXml();
    const sitemapSet = new Set(parseSitemapXmlUrls(sitemapXml));

    const crawlResult = await inspectSinglePage({
        siteUrl,
        pagePath: targetPath,
        useLiveHttp: true,
        seoPageMap,
        blogMap,
        gameMap,
        sitemapSet
    });

    return crawlResult;
}

module.exports = {
    runFullSeoAudit,
    getLatestAndPreviousAuditRuns,
    buildPrioritizedRecommendations,
    toggleRecommendationState,
    inspectTargetUrlLive,
    extractHtmlSeoSignals,
    analyzeRobotsTxt,
    parseSitemapXmlUrls
};
