const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { pathToFileURL } = require('node:url');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function readFile(relPath) {
    return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

function decodeBasicEntities(str) {
    return String(str || '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
}

function extractTagContent(html, tagRegex) {
    const match = html.match(tagRegex);
    return match ? decodeBasicEntities(match[1].replace(/<[^>]*>/g, '')) : '';
}

function extractMetaContent(html, attrName, attrValue) {
    const dq1 = new RegExp(`<meta\\s+[^>]*${attrName}=["']${attrValue}["'][^>]*content="([^"]*)"[^>]*\\/?>`, 'i');
    const dq2 = new RegExp(`<meta\\s+[^>]*content="([^"]*)"[^>]*${attrName}=["']${attrValue}["'][^>]*\\/?>`, 'i');
    const m1 = html.match(dq1) || html.match(dq2);
    if (m1) return decodeBasicEntities(m1[1]);
    const sq1 = new RegExp(`<meta\\s+[^>]*${attrName}=["']${attrValue}["'][^>]*content='([^']*)'[^>]*\\/?>`, 'i');
    const sq2 = new RegExp(`<meta\\s+[^>]*content='([^']*)'[^>]*${attrName}=["']${attrValue}["'][^>]*\\/?>`, 'i');
    const m2 = html.match(sq1) || html.match(sq2);
    return m2 ? decodeBasicEntities(m2[1]) : '';
}

function extractCanonical(html) {
    const m1 = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*\/?>/i);
    if (m1) return m1[1].trim();
    const m2 = html.match(/<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*\/?>/i);
    return m2 ? m2[1].trim() : '';
}

function extractRootInnerHtml(html) {
    const m = html.match(/<div id="root">([\s\S]*)<\/div>(?=\s*(?:<script|<\/body>))/);
    return m ? m[1] : '';
}

function extractJsonScript(html, scriptId) {
    const m = html.match(new RegExp(`<script id="${scriptId}"[^>]*>([\\s\\S]*?)<\\/script>`, 'i'));
    if (!m || !m[1]) return null;
    return JSON.parse(m[1].trim());
}

function stripTagsToWords(html) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean);
}

test('1. Pre-rendered /blog index has complete SEO metadata, BreadcrumbList, visible catalog, and zero hidden boilerplate', async () => {
    const { validateStructuredData } = await import(
        pathToFileURL(path.join(ROOT_DIR, 'src', 'utils', 'structuredData.js')).href
    );

    const blogIndexPath = path.join(DIST_DIR, 'blog', 'index.html');
    const blogHtmlPath = path.join(DIST_DIR, 'blog.html');
    assert.ok(fs.existsSync(blogIndexPath), 'dist/blog/index.html must exist');
    assert.ok(fs.existsSync(blogHtmlPath), 'dist/blog.html must exist');

    const html = fs.readFileSync(blogIndexPath, 'utf8');
    const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

    const title = extractTagContent(html, /<title>([\s\S]*?)<\/title>/i);
    const homeTitle = extractTagContent(homeHtml, /<title>([\s\S]*?)<\/title>/i);
    const desc = extractMetaContent(html, 'name', 'description');
    const homeDesc = extractMetaContent(homeHtml, 'name', 'description');

    assert.ok(title.length > 20, '/blog must have a descriptive <title>');
    assert.notStrictEqual(title, homeTitle, '/blog title must differ from homepage title');
    assert.ok(desc.length > 50, '/blog must have a descriptive meta description');
    assert.notStrictEqual(desc, homeDesc, '/blog meta description must differ from homepage');
    assert.strictEqual(extractCanonical(html), 'https://www.hangbug.com/blog');

    assert.strictEqual(extractMetaContent(html, 'property', 'og:type'), 'website');
    assert.strictEqual(extractMetaContent(html, 'property', 'og:url'), 'https://www.hangbug.com/blog');
    assert.strictEqual(extractMetaContent(html, 'property', 'og:title'), title);
    assert.strictEqual(extractMetaContent(html, 'property', 'og:description'), desc);
    assert.ok(extractMetaContent(html, 'property', 'og:image').startsWith('https://www.hangbug.com/'));
    assert.strictEqual(extractMetaContent(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.strictEqual(extractMetaContent(html, 'name', 'twitter:title'), title);
    assert.strictEqual(extractMetaContent(html, 'name', 'twitter:description'), desc);

    const jsonLd = extractJsonScript(html, 'hangbug-jsonld');
    assert.ok(jsonLd && Array.isArray(jsonLd['@graph']), '/blog must contain JSON-LD @graph');
    const validation = validateStructuredData(jsonLd);
    assert.strictEqual(validation.valid, true, `/blog JSON-LD failed validation: ${validation.errors.join('; ')}`);
    assert.ok(jsonLd['@graph'].some(n => n['@type'] === 'BreadcrumbList'), '/blog JSON-LD must include BreadcrumbList');

    const rootHtml = extractRootInnerHtml(html);
    assert.ok(rootHtml.length > 500, '/blog #root must contain visible pre-rendered HTML');
    assert.ok(!rootHtml.includes('sr-only'), '/blog #root must NOT contain sr-only hidden SEO boilerplate');
    assert.ok(!rootHtml.includes('seo-static-content'), '/blog #root must NOT contain #seo-static-content');

    const h1s = rootHtml.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
    assert.strictEqual(h1s.length, 1, '/blog must contain exactly one visible <h1>');

    const listPayload = extractJsonScript(html, 'hangbug-blog-list-data');
    assert.ok(listPayload && Array.isArray(listPayload.articles) && listPayload.articles.length >= 3, '/blog must embed published blog list payload');
    for (const art of listPayload.articles) {
        assert.notStrictEqual(art.isPublished, false, `Unpublished article ${art.slug} must not appear in /blog index`);
        assert.ok(rootHtml.includes(`/blog/${art.slug}`), `/blog must visibly link to /blog/${art.slug}`);
    }
});

test('2. All pre-rendered blog articles have unique titles/descriptions, valid canonical/OG/Twitter/JSON-LD, visible H1 & content, and no hidden boilerplate', async () => {
    const { validateStructuredData } = await import(
        pathToFileURL(path.join(ROOT_DIR, 'src', 'utils', 'structuredData.js')).href
    );

    const blogDir = path.join(DIST_DIR, 'blog');
    const blogIndexHtml = fs.readFileSync(path.join(blogDir, 'index.html'), 'utf8');
    const listPayload = extractJsonScript(blogIndexHtml, 'hangbug-blog-list-data');
    const homeHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
    const homeTitle = extractTagContent(homeHtml, /<title>([\s\S]*?)<\/title>/i);
    const homeDesc = extractMetaContent(homeHtml, 'name', 'description');

    const slugDirs = fs
        .readdirSync(blogDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();

    assert.ok(slugDirs.length >= 3, `Expected at least 3 pre-rendered blog articles, found ${slugDirs.length}`);

    const requiredValidSlugs = [
        'html-tutorial-for-beginners',
        'css-basics-beginners-guide',
        'javascript-fundamentals-beginners-guide'
    ];
    for (const reqSlug of requiredValidSlugs) {
        assert.ok(slugDirs.includes(reqSlug), `Expected pre-rendered directory for ${reqSlug}`);
    }

    if (listPayload && Array.isArray(listPayload.articles) && listPayload.total <= 9) {
        const expectedSlugs = listPayload.articles.map(a => a.slug).sort();
        assert.deepStrictEqual(slugDirs, expectedSlugs, 'Pre-rendered blog directories must match published catalog slugs 1:1');
    }

    const sitemapXml = readFile('dist/sitemap.xml');
    const seenTitles = new Set([homeTitle.toLowerCase()]);
    const seenDescriptions = new Set([homeDesc.toLowerCase()]);

    for (const slug of slugDirs) {
        const htmlPath = path.join(blogDir, slug, 'index.html');
        const flatPath = path.join(blogDir, `${slug}.html`);
        assert.ok(fs.existsSync(htmlPath), `Missing ${htmlPath}`);
        assert.ok(fs.existsSync(flatPath), `Missing ${flatPath}`);

        const html = fs.readFileSync(htmlPath, 'utf8');
        const expectedUrl = `https://www.hangbug.com/blog/${slug}`;

        // Unique <title> & <meta name="description">
        const title = extractTagContent(html, /<title>([\s\S]*?)<\/title>/i);
        const description = extractMetaContent(html, 'name', 'description');
        assert.ok(title.length >= 20, `${slug}: <title> too short`);
        assert.ok(description.length >= 50, `${slug}: <meta description> too short`);
        assert.notStrictEqual(title, homeTitle, `${slug}: <title> must not match homepage`);
        assert.notStrictEqual(description, homeDesc, `${slug}: description must not match homepage`);
        assert.ok(!seenTitles.has(title.toLowerCase()), `${slug}: duplicate <title> detected: ${title}`);
        assert.ok(!seenDescriptions.has(description.toLowerCase()), `${slug}: duplicate <meta description> detected: ${description}`);
        seenTitles.add(title.toLowerCase());
        seenDescriptions.add(description.toLowerCase());

        // Canonical & Robots
        assert.strictEqual(extractCanonical(html), expectedUrl, `${slug}: canonical URL mismatch`);
        const robots = extractMetaContent(html, 'name', 'robots');
        assert.ok(robots.includes('index') && robots.includes('follow') && !robots.includes('noindex'), `${slug}: published article must allow indexing`);

        // Open Graph & Twitter
        assert.strictEqual(extractMetaContent(html, 'property', 'og:type'), 'article', `${slug}: og:type must be article`);
        assert.strictEqual(extractMetaContent(html, 'property', 'og:url'), expectedUrl, `${slug}: og:url mismatch`);
        assert.strictEqual(extractMetaContent(html, 'property', 'og:title'), title, `${slug}: og:title mismatch`);
        assert.strictEqual(extractMetaContent(html, 'property', 'og:description'), description, `${slug}: og:description mismatch`);
        assert.ok(extractMetaContent(html, 'property', 'og:image').startsWith('https://www.hangbug.com/'), `${slug}: og:image missing`);
        assert.ok(extractMetaContent(html, 'property', 'og:image:alt').length > 5, `${slug}: og:image:alt missing`);
        assert.ok(extractMetaContent(html, 'property', 'article:published_time').length > 5, `${slug}: article:published_time missing`);
        assert.ok(extractMetaContent(html, 'property', 'article:section').length > 0, `${slug}: article:section missing`);

        assert.strictEqual(extractMetaContent(html, 'name', 'twitter:card'), 'summary_large_image');
        assert.strictEqual(extractMetaContent(html, 'name', 'twitter:url'), expectedUrl);
        assert.strictEqual(extractMetaContent(html, 'name', 'twitter:title'), title);
        assert.strictEqual(extractMetaContent(html, 'name', 'twitter:description'), description);
        assert.ok(extractMetaContent(html, 'name', 'twitter:image').startsWith('https://www.hangbug.com/'));

        // JSON-LD Article + BreadcrumbList + WebPage + Organization + WebSite
        const jsonLd = extractJsonScript(html, 'hangbug-jsonld');
        assert.ok(jsonLd && Array.isArray(jsonLd['@graph']), `${slug}: missing JSON-LD @graph`);
        const validation = validateStructuredData(jsonLd);
        assert.strictEqual(validation.valid, true, `${slug} JSON-LD invalid: ${validation.errors.join('; ')}`);

        const articleNode = jsonLd['@graph'].find(n => n['@type'] === 'Article');
        const breadcrumbNode = jsonLd['@graph'].find(n => n['@type'] === 'BreadcrumbList');
        assert.ok(articleNode, `${slug}: missing Article JSON-LD node`);
        assert.strictEqual(articleNode.url, expectedUrl, `${slug}: Article url mismatch`);
        assert.strictEqual(articleNode.mainEntityOfPage['@id'], `${expectedUrl}#webpage`, `${slug}: Article mainEntityOfPage mismatch`);
        assert.ok(articleNode.datePublished && articleNode.dateModified, `${slug}: Article missing dates`);
        assert.ok(articleNode.wordCount > 100, `${slug}: Article missing realistic wordCount`);
        assert.ok(breadcrumbNode && breadcrumbNode.itemListElement.length === 4, `${slug}: BreadcrumbList must have 4 hierarchy items`);
        assert.strictEqual(breadcrumbNode.itemListElement[3].item, expectedUrl, `${slug}: final BreadcrumbList item URL mismatch`);

        // Embedded hydration data consistency
        const blogData = extractJsonScript(html, 'hangbug-blog-data');
        assert.ok(blogData && blogData.article, `${slug}: missing #hangbug-blog-data payload`);
        assert.strictEqual(blogData.article.slug, slug);
        assert.strictEqual(blogData.article.isPublished, true);

        // Visible H1, meaningful article body, zero sr-only / hidden boilerplate
        const rootHtml = extractRootInnerHtml(html);
        assert.ok(!rootHtml.includes('sr-only'), `${slug}: must NOT contain sr-only class`);
        assert.ok(!rootHtml.includes('seo-static-content'), `${slug}: must NOT contain #seo-static-content`);
        assert.ok(!rootHtml.includes('Practice interactive technology quizzes across HTML, CSS, JavaScript, React, PHP'), `${slug}: must NOT contain generic homepage SEO boilerplate`);

        const h1Matches = rootHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
        assert.strictEqual(h1Matches.length, 1, `${slug}: must contain exactly one <h1>`);
        const h1Text = decodeBasicEntities(h1Matches[0].replace(/<[^>]*>/g, ''));
        assert.strictEqual(h1Text, blogData.article.title, `${slug}: H1 text must match actual article.title`);
        assert.notStrictEqual(h1Text, title, `${slug}: H1 must remain distinct from <title>`);
        assert.strictEqual(articleNode.headline, blogData.article.title, `${slug}: Article headline must match actual article.title`);

        const articleBodyMatch = rootHtml.match(/<article class="prose[\s\S]*?<\/article>/i);
        assert.ok(articleBodyMatch, `${slug}: missing visible <article class="prose"> content container`);
        const bodyWords = stripTagsToWords(articleBodyMatch[0]);
        assert.ok(bodyWords.length >= 180, `${slug}: expected meaningful article body (>=180 words), got ${bodyWords.length}`);
        assert.ok(/<h2\b/i.test(articleBodyMatch[0]), `${slug}: article body must render section <h2> headings`);

        // Sitemap coverage
        assert.ok(sitemapXml.includes(`<loc>${expectedUrl}</loc>`), `${slug}: missing from dist/sitemap.xml`);
    }
});

test('3. Unpublished articles and nonexistent slugs are excluded from sitemap, DB lookup, SSR route resolution, and dist/404.html is visible', async () => {
    // 3a. Verify dist/404.html has noindex, no canonical, and visible 404 UI without sr-only
    const html404 = readFile('dist/404.html');
    assert.ok(html404.includes('noindex, nofollow'), 'dist/404.html must include noindex, nofollow');
    assert.ok(!html404.includes('<link rel="canonical"'), 'dist/404.html must omit canonical link');
    assert.ok(!html404.includes('sr-only'), 'dist/404.html must NOT use sr-only');
    assert.ok(extractRootInnerHtml(html404).includes('Oops! Lost in the Code?'), 'dist/404.html must include visible 404 content');

    // 3b. Verify mocked MongoDB / Prisma enforces isPublished filtering & 404 on unpublished/nonexistent slugs
    const prisma = require('../api/_config/prisma');
    const BlogPostModel = require('../api/_models/blogPostModel');
    const seoController = require('../api/_controllers/seoController');
    const blogSeoRenderer = require('../api/_utils/blogSeoRenderer');

    const prevUri = process.env.MONGODB_URI;
    const origBlogPost = prisma.blogPost;
    const origGame = prisma.game;

    const mockRecords = [
        {
            id: 'pub-1',
            slug: 'published-mongo-guide',
            title: 'Published MongoDB SEO Verification Guide',
            excerpt: 'This guide verifies published MongoDB articles render with full SEO metadata and visible article content.',
            content: '## Why Real Content Matters\n\nSearch engines index visible content directly from initial HTML.\n\n## Structured Data Checklist\n\nEnsure Article and BreadcrumbList schemas align with visible headings.',
            category: 'Web Development',
            tags: ['SEO', 'MongoDB'],
            difficulty: 'Intermediate',
            readingTimeMinutes: 6,
            authorName: 'Hangbug Team',
            authorRole: 'Engineering Educators',
            seoTitle: 'Published MongoDB SEO Guide | Hangbug',
            seoDescription: 'Verified published MongoDB article description for pre-rendering and SSR SEO checks.',
            keyTakeaways: ['Only published MongoDB records are pre-rendered'],
            isFeatured: true,
            isPublished: true,
            order: 1,
            publishedAt: new Date('2026-03-10T10:00:00.000Z'),
            createdAt: new Date('2026-03-10T10:00:00.000Z'),
            updatedAt: new Date('2026-03-11T10:00:00.000Z')
        },
        {
            id: 'draft-1',
            slug: 'unpublished-draft-secret-guide',
            title: 'Unpublished Draft Guide Should 404',
            excerpt: 'Draft articles must never be pre-rendered, listed in sitemap.xml, or served publicly.',
            content: '## Confidential Draft\n\nThis unpublished article must never leak into public routes or sitemaps.',
            category: 'Web Development',
            tags: ['Draft'],
            difficulty: 'Beginner',
            readingTimeMinutes: 4,
            authorName: 'Hangbug Team',
            authorRole: 'Engineering Educators',
            isFeatured: false,
            isPublished: false,
            order: 2,
            publishedAt: new Date('2026-03-12T10:00:00.000Z'),
            createdAt: new Date('2026-03-12T10:00:00.000Z'),
            updatedAt: new Date('2026-03-12T10:00:00.000Z')
        }
    ];

    process.env.MONGODB_URI = 'mongodb+srv://seoaudit:testpass@cluster0.mongodb.net/HangBug?retryWrites=true&w=majority';
    prisma.game = {
        findMany: async () => []
    };
    prisma.blogPost = {
        count: async ({ where } = {}) => {
            if (!where) return mockRecords.length;
            if (where.isPublished !== undefined) {
                return mockRecords.filter(r => r.isPublished === where.isPublished).length;
            }
            return mockRecords.length;
        },
        findMany: async ({ where } = {}) => {
            return mockRecords.filter(r => {
                if (where?.isPublished !== undefined && r.isPublished !== where.isPublished) return false;
                if (where?.slug?.not && r.slug === where.slug.not) return false;
                return true;
            });
        },
        findFirst: async ({ where } = {}) => {
            return mockRecords.find(r => {
                if (where?.slug && r.slug !== where.slug) return false;
                if (where?.isPublished !== undefined && r.isPublished !== where.isPublished) return false;
                return true;
            }) || null;
        },
        update: async () => null
    };

    try {
        // Fetch via blogSeoRenderer must include published and exclude unpublished
        const fetched = await blogSeoRenderer.fetchPublishedBlogPostsFromSource({ allowRemoteApiFallback: false });
        assert.strictEqual(fetched.source, 'mongodb');
        assert.deepStrictEqual(fetched.articles.map(a => a.slug), ['published-mongo-guide']);
        assert.deepStrictEqual(fetched.unpublishedSlugs, ['unpublished-draft-secret-guide']);

        // BlogPostModel.getBySlug must serve published DB article, exclude unpublished, and return null (not memArticles) for unknown slug
        const modelPub = await BlogPostModel.getBySlug('published-mongo-guide', { incrementView: false });
        assert.ok(modelPub && modelPub.article && modelPub.article.slug === 'published-mongo-guide');
        const modelDraft = await BlogPostModel.getBySlug('unpublished-draft-secret-guide', { incrementView: false });
        assert.strictEqual(modelDraft, null, 'BlogPostModel.getBySlug must return null for unpublished article');
        const modelNonexistent = await BlogPostModel.getBySlug('csharp-programming-beginners-guide', { incrementView: false });
        assert.strictEqual(modelNonexistent, null, 'BlogPostModel.getBySlug must NOT fall back to memArticles when DB has records');

        // seoController.resolveAppRoute must return 200 for published, 404 for unpublished and missing slugs
        const resPub = await seoController.resolveAppRoute('/blog/published-mongo-guide');
        assert.strictEqual(resPub.statusCode, 200);
        assert.strictEqual(resPub.noindex, false);
        assert.strictEqual(resPub.meta.article.slug, 'published-mongo-guide');

        const renderedPub = seoController.renderStatusHtml(resPub);
        assert.ok(renderedPub.includes('Published MongoDB SEO Verification Guide'));
        assert.ok(!renderedPub.includes('sr-only'));

        const resDraft = await seoController.resolveAppRoute('/blog/unpublished-draft-secret-guide');
        assert.strictEqual(resDraft.statusCode, 404, 'Unpublished article route must return 404');
        assert.strictEqual(resDraft.noindex, true);

        const resMissing = await seoController.resolveAppRoute('/blog/this-slug-never-existed');
        assert.strictEqual(resMissing.statusCode, 404, 'Nonexistent blog slug must return 404');
        assert.strictEqual(resMissing.noindex, true);

        // Dynamic sitemap must include published and exclude unpublished
        let sentStatus = null;
        let sentXml = '';
        await seoController.getDynamicSitemap({}, {
            setHeader: () => {},
            status: (code) => {
                sentStatus = code;
                return { send: (body) => { sentXml = body; } };
            }
        });
        assert.strictEqual(sentStatus, 200);
        assert.ok(sentXml.includes('https://www.hangbug.com/blog/published-mongo-guide'));
        assert.ok(!sentXml.includes('unpublished-draft-secret-guide'));
    } finally {
        prisma.blogPost = origBlogPost;
        prisma.game = origGame;
        if (prevUri === undefined) {
            delete process.env.MONGODB_URI;
        } else {
            process.env.MONGODB_URI = prevUri;
        }
    }
});

test('4. Express server returns HTTP 200 with unique article SEO & content for 3+ valid blog URLs and HTTP 404 noindex for invalid slugs', async () => {
    const app = require('../api/index.js');
    const server = await new Promise((resolve) => {
        const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });

    try {
        const { port } = server.address();
        const requestRoute = (reqPath) => new Promise((resolve, reject) => {
            const req = http.get(`http://127.0.0.1:${port}${reqPath}`, (res) => {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
            });
            req.on('error', reject);
        });

        const validArticles = [
            '/blog/html-tutorial-for-beginners',
            '/blog/css-basics-beginners-guide',
            '/blog/javascript-fundamentals-beginners-guide'
        ];

        const titles = new Set();
        for (const route of validArticles) {
            const res = await requestRoute(route);
            assert.strictEqual(res.status, 200, `${route} expected 200, got ${res.status}`);
            const title = extractTagContent(res.body, /<title>([\s\S]*?)<\/title>/i);
            const canonical = extractCanonical(res.body);
            assert.strictEqual(canonical, `https://www.hangbug.com${route}`);
            assert.strictEqual(extractMetaContent(res.body, 'property', 'og:type'), 'article');
            assert.ok(!titles.has(title), `${route} title must be unique`);
            titles.add(title);
            assert.ok(!res.body.includes('sr-only'), `${route} response must not include sr-only`);
            assert.ok(res.body.includes('"@type": "Article"') || res.body.includes('"@type":"Article"'));
            assert.ok(res.body.includes('"@type": "BreadcrumbList"') || res.body.includes('"@type":"BreadcrumbList"'));

            // Also verify Vercel rewrite entry /api/index.js?__hangbug_route=...
            const rewriteRes = await requestRoute(`/api/index.js?__hangbug_route=${encodeURIComponent(route)}`);
            assert.strictEqual(rewriteRes.status, 200);
            assert.strictEqual(extractCanonical(rewriteRes.body), `https://www.hangbug.com${route}`);
        }

        const invalidRoutes = [
            '/blog/nonexistent-blog-article-404-check',
            '/blog/nonexistent-blog-article-404-check/',
            '/api/index.js?__hangbug_route=/blog/nonexistent-blog-article-404-check'
        ];

        for (const badRoute of invalidRoutes) {
            const res = await requestRoute(badRoute);
            assert.strictEqual(res.status, 404, `${badRoute} must return HTTP 404, got ${res.status}`);
            assert.strictEqual(res.headers.location, undefined, `${badRoute} must NOT redirect`);
            assert.strictEqual(res.headers['x-robots-tag'], 'noindex, nofollow');
            assert.strictEqual(extractMetaContent(res.body, 'name', 'robots'), 'noindex, nofollow');
            assert.strictEqual(extractCanonical(res.body), '', `${badRoute} 404 must omit canonical`);
            assert.ok(!res.body.includes('sr-only'), `${badRoute} 404 must not contain sr-only`);
        }
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }
});
