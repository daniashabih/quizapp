const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const BlogPostModel = require('../api/_models/blogPostModel');
const { INITIAL_BLOG_ARTICLES } = require('../api/_models/blogArticles/initialBlogArticles');
const { buildSitemapXml, isKnownAppRoute, BLOG_SLUGS } = require('../api/_controllers/seoController');

test('1. Initial Blog Articles Catalog: Contains all 10 specified beginner-friendly tutorials', () => {
    assert.strictEqual(INITIAL_BLOG_ARTICLES.length, 10, 'Must have exactly 10 initial tutorials');
    const requiredSlugs = [
        'html-tutorial-for-beginners',
        'css-basics-beginners-guide',
        'javascript-fundamentals-beginners-guide',
        'php-programming-beginners-guide',
        'laravel-basics-mvc-architecture',
        'flutter-dart-mobile-app-development',
        'csharp-programming-beginners-guide',
        'mysql-database-tutorial-beginners',
        'programming-interview-questions-beginners',
        'improve-programming-skills-coding-practice'
    ];

    for (const slug of requiredSlugs) {
        const found = INITIAL_BLOG_ARTICLES.find(a => a.slug === slug);
        assert.ok(found, `Article with slug "${slug}" must exist in catalog`);
        assert.ok(found.title && found.title.length > 10, `Article ${slug} must have a valid title`);
        assert.ok(found.excerpt && found.excerpt.length > 20, `Article ${slug} must have an excerpt`);
        assert.ok(found.content && found.content.length > 500, `Article ${slug} must have comprehensive content`);
        assert.ok(found.seoTitle, `Article ${slug} must have SEO title`);
        assert.ok(found.seoDescription, `Article ${slug} must have SEO description`);
        assert.ok(found.canonicalUrl, `Article ${slug} must have canonical URL`);
        assert.strictEqual(found.isPublished, true, `Article ${slug} must be published`);
    }
});

test('2. Blog Model: getPublishedArticles() returns paginated published articles', async () => {
    const result = await BlogPostModel.getPublishedArticles({ page: 1, limit: 6 });
    assert.ok(result.articles && Array.isArray(result.articles));
    assert.ok(result.articles.length > 0 && result.articles.length <= 6);
    assert.strictEqual(result.page, 1);
    assert.ok(result.total >= 10);
    assert.strictEqual(result.totalPages, Math.ceil(result.total / 6));

    // Test category filter
    const htmlResult = await BlogPostModel.getPublishedArticles({ category: 'HTML' });
    assert.ok(htmlResult.articles.some(a => a.category === 'HTML'));
    assert.ok(htmlResult.articles.every(a => a.category === 'HTML' || a.tags?.includes('HTML')));

    // Test search filter
    const searchResult = await BlogPostModel.getPublishedArticles({ search: 'JavaScript' });
    assert.ok(searchResult.articles.length > 0);
    assert.ok(searchResult.articles.some(a => a.slug === 'javascript-fundamentals-beginners-guide'));
});

test('3. Blog Model: getCategoriesWithCount() only returns categories with published articles (count > 0)', async () => {
    const categories = await BlogPostModel.getCategoriesWithCount();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
    for (const cat of categories) {
        assert.ok(cat.count > 0, `Category "${cat.name}" must have count > 0`);
        assert.ok(cat.name && cat.slug);
    }
});

test('4. Blog Model: getBySlug() returns article + related articles and handles missing slug', async () => {
    const data = await BlogPostModel.getBySlug('html-tutorial-for-beginners');
    assert.ok(data && data.article);
    assert.strictEqual(data.article.slug, 'html-tutorial-for-beginners');
    assert.ok(Array.isArray(data.relatedArticles));

    const notFound = await BlogPostModel.getBySlug('non-existent-article-xyz-123');
    assert.strictEqual(notFound, null);
});

test('5. Blog Model: getFeaturedArticle() returns featured article', async () => {
    const featured = await BlogPostModel.getFeaturedArticle();
    assert.ok(featured);
    assert.ok(featured.slug);
    assert.ok(featured.title);
});

test('6. Technical SEO & Sitemap: buildSitemapXml includes /blog and all 10 article URLs', () => {
    const xml = buildSitemapXml();
    assert.ok(xml.includes('<loc>https://www.hangbug.com/blog</loc>'), 'Sitemap must contain /blog');
    assert.ok(xml.includes('<loc>https://www.hangbug.com/resources</loc>'), 'Sitemap must contain /resources');

    for (const slug of BLOG_SLUGS) {
        assert.ok(
            xml.includes(`<loc>https://www.hangbug.com/blog/${slug}</loc>`),
            `Sitemap must contain article /blog/${slug}`
        );
    }
});

test('7. Technical SEO: isKnownAppRoute recognizes /blog and article slugs', () => {
    assert.strictEqual(isKnownAppRoute('/blog'), true);
    assert.strictEqual(isKnownAppRoute('/blog/'), true);
    assert.strictEqual(isKnownAppRoute('/resources'), true);
    assert.strictEqual(isKnownAppRoute('/blog/html-tutorial-for-beginners'), true);
    assert.strictEqual(isKnownAppRoute('/blog/javascript-fundamentals-beginners-guide'), true);
    assert.strictEqual(isKnownAppRoute('/blog/random-slug-article'), true);
    assert.strictEqual(isKnownAppRoute('/invalid/deep/unknown/path'), false);
});

test('8. Sitemap Synchronization: public/sitemap.xml and dist/sitemap.xml contain all blog articles', () => {
    const publicSitemap = fs.readFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), 'utf8');
    assert.ok(publicSitemap.includes('https://www.hangbug.com/blog'));
    assert.ok(publicSitemap.includes('https://www.hangbug.com/blog/html-tutorial-for-beginners'));
    assert.ok(publicSitemap.includes('https://www.hangbug.com/blog/css-basics-beginners-guide'));
    assert.ok(publicSitemap.includes('https://www.hangbug.com/blog/csharp-programming-beginners-guide'));

    const distSitemap = fs.readFileSync(path.join(__dirname, '..', 'dist', 'sitemap.xml'), 'utf8');
    assert.ok(distSitemap.includes('https://www.hangbug.com/blog'));
    assert.ok(distSitemap.includes('https://www.hangbug.com/blog/html-tutorial-for-beginners'));
});

test('9. Blog Controller: getPublishedArticles, getCategories, and getArticleBySlug HTTP responses', async () => {
    const blogController = require('../api/_controllers/blogController');

    // Test getPublishedArticles
    let publishedRes;
    await blogController.getPublishedArticles(
        { query: { page: '1', limit: '5' } },
        { json: (data) => { publishedRes = data; } }
    );
    assert.ok(publishedRes.success);
    assert.ok(Array.isArray(publishedRes.articles));
    assert.strictEqual(publishedRes.articles.length, 5);

    // Test getCategories
    let categoriesRes;
    await blogController.getCategories(
        {},
        { json: (data) => { categoriesRes = data; } }
    );
    assert.ok(categoriesRes.success);
    assert.ok(Array.isArray(categoriesRes.categories));
    assert.ok(categoriesRes.categories.length > 0);

    // Test getArticleBySlug
    let articleRes;
    await blogController.getArticleBySlug(
        { params: { slug: 'html-tutorial-for-beginners' } },
        { json: (data) => { articleRes = data; } }
    );
    assert.ok(articleRes.success);
    assert.strictEqual(articleRes.article.slug, 'html-tutorial-for-beginners');

    // Test 404 for missing slug
    let notFoundCode = 200;
    let notFoundRes;
    await blogController.getArticleBySlug(
        { params: { slug: 'non-existent-slug' } },
        {
            status: (code) => {
                notFoundCode = code;
                return { json: (data) => { notFoundRes = data; } };
            }
        }
    );
    assert.strictEqual(notFoundCode, 404);
    assert.strictEqual(notFoundRes.success, false);
});
