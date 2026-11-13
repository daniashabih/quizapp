const BlogPostModel = require('../_models/blogPostModel');

/**
 * Public: Get published articles with pagination and filtering
 * GET /api/blog?category=...&search=...&page=1&limit=9&tag=...
 */
exports.getPublishedArticles = async (req, res) => {
    try {
        const { category, search, page, limit, tag } = req.query;
        const result = await BlogPostModel.getPublishedArticles({
            category,
            search,
            page,
            limit,
            tag
        });

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error fetching blog articles'
        });
    }
};

/**
 * Public: Get featured article for hero showcase
 * GET /api/blog/featured
 */
exports.getFeaturedArticle = async (req, res) => {
    try {
        const article = await BlogPostModel.getFeaturedArticle();
        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'No featured article found'
            });
        }
        res.json({
            success: true,
            article
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error fetching featured article'
        });
    }
};

/**
 * Public: Get technology categories with published article counts
 * GET /api/blog/categories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await BlogPostModel.getCategoriesWithCount();
        res.json({
            success: true,
            categories
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error fetching blog categories'
        });
    }
};

/**
 * Public: Get single article by slug
 * GET /api/blog/:slug
 */
exports.getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = await BlogPostModel.getBySlug(slug);

        if (!data || !data.article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        res.json({
            success: true,
            article: data.article,
            relatedArticles: data.relatedArticles || []
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error fetching article'
        });
    }
};

/**
 * Admin: Get all articles (drafts & published) with pagination
 * GET /api/admin/blog
 */
exports.adminGetArticles = async (req, res) => {
    try {
        const { search, category, status, page, limit } = req.query;
        const result = await BlogPostModel.getAdminArticles({
            search,
            category,
            status,
            page,
            limit
        });
        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error fetching admin articles'
        });
    }
};

/**
 * Admin: Create article
 * POST /api/admin/blog
 */
exports.adminCreateArticle = async (req, res) => {
    try {
        const article = await BlogPostModel.createArticle(req.body);
        res.status(201).json({
            success: true,
            message: 'Article created successfully',
            article
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || 'Error creating article'
        });
    }
};

/**
 * Admin: Update article
 * PUT /api/admin/blog/:id
 */
exports.adminUpdateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await BlogPostModel.updateArticle(id, req.body);
        res.json({
            success: true,
            message: 'Article updated successfully',
            article
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || 'Error updating article'
        });
    }
};

/**
 * Admin: Delete article
 * DELETE /api/admin/blog/:id
 */
exports.adminDeleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await BlogPostModel.deleteArticle(id);
        res.json({
            success: true,
            message: 'Article deleted successfully'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || 'Error deleting article'
        });
    }
};

/**
 * Admin: Toggle publish status
 * PATCH /api/admin/blog/:id/toggle-publish
 */
exports.adminTogglePublish = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await BlogPostModel.togglePublish(id);
        res.json({
            success: true,
            message: `Article ${article.isPublished ? 'published' : 'moved to drafts'} successfully`,
            article
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message || 'Error toggling publish status'
        });
    }
};

/**
 * Admin: Seed / sync initial articles
 * POST /api/admin/blog/seed
 */
exports.adminSeedArticles = async (req, res) => {
    try {
        const result = await BlogPostModel.seedArticles();
        res.json({
            success: true,
            message: `Successfully synchronized ${result.count} blog articles`,
            count: result.count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Error seeding blog articles'
        });
    }
};
