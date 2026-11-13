const express = require('express');
const router = express.Router();
const blogController = require('../_controllers/blogController');

// Public Blog Routes
router.get('/', blogController.getPublishedArticles);
router.get('/featured', blogController.getFeaturedArticle);
router.get('/categories', blogController.getCategories);
router.get('/:slug', blogController.getArticleBySlug);

module.exports = router;
