const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

const { getAllUsers } = require('../_controllers/authController');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../_controllers/categoryController');
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../_controllers/questionController');
const { getSettings, updateSettings } = require('../_controllers/settingController');
const gameController = require('../_controllers/gameController');
const blogController = require('../_controllers/blogController');
const knowledgeBaseController = require('../_controllers/knowledgeBaseController');
const verificationController = require('../_controllers/verificationController');
const aiController = require('../_controllers/aiController');
const seoDashboardController = require('../_controllers/seoDashboardController');
const { MAX_BOOK_FILE_SIZE_BYTES } = require('../_services/bookExtractorService');
const Setting = require('../_models/settingModel');
const prisma = require('../_config/prisma');

const adminAiTestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AI_ADMIN_TEST_RATE_LIMIT_MAX || '30', 10) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many admin AI test requests. Please wait a few minutes and try again.'
    }
});

const bookUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_BOOK_FILE_SIZE_BYTES,
        files: 1
    }
});

// Public OAuth 2.0 callback for Google Search Console (authenticated & CSRF-protected via signed state JWT)
router.get('/seo/gsc/oauth/callback', seoDashboardController.handleGscOAuthCallback);

// Enforce authentication & admin role across all /api/admin routes
router.use(authMiddleware, adminMiddleware);

// 1. /api/admin/users
router.get('/users', getAllUsers);
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
            where: { id: String(id) },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentAdminId = req.user?.id ? String(req.user.id) : null;
        if (currentAdminId && currentAdminId === String(targetUser.id)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own administrator account.'
            });
        }

        const currentRole = String(targetUser.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';
        if (currentRole === 'admin') {
            const adminCount = await prisma.user.count({
                where: {
                    role: { in: ['admin', 'ADMIN'] }
                }
            });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last remaining administrator account.'
                });
            }
        }

        await prisma.user.delete({ where: { id: String(id) } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const rawRole = req.body?.role;
        const role = String(rawRole || '').trim().toLowerCase();

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be user or admin' });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: String(id) },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const currentRole = String(targetUser.role || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user';

        if (currentRole === 'admin' && role === 'user') {
            const currentAdminId = req.user?.id ? String(req.user.id) : null;
            if (currentAdminId && currentAdminId === String(targetUser.id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote your own administrator account.'
                });
            }

            const adminCount = await prisma.user.count({
                where: {
                    role: { in: ['admin', 'ADMIN'] }
                }
            });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote the last remaining administrator account.'
                });
            }
        }

        const updated = await prisma.user.update({
            where: { id: String(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                ...updated,
                role: updated.role.toLowerCase()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. /api/admin/technologies
router.get('/technologies', getCategories);
router.post('/technologies', createCategory);
router.put('/technologies/:id', updateCategory);
router.delete('/technologies/:id', deleteCategory);

// 3. /api/admin/questions
router.get('/questions', getQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// 4. /api/admin/settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// 5. /api/admin/certificates
router.get('/certificates', async (req, res) => {
    try {
        const settings = await Setting.get();
        const certPassingScore = settings.certificatePassingScore || 80;

        const results = await prisma.quizResult.findMany({
            where: { percentage: { gte: certPassingScore } },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, certificates: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. /api/admin/results
router.get('/results', async (req, res) => {
    try {
        const results = await prisma.quizResult.findMany({
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 7. /api/admin/games
router.get('/games/categories', gameController.adminGetTechCategories);
router.post('/games/categories', gameController.adminCreateTechCategory);
router.put('/games/categories/:id', gameController.adminUpdateTechCategory);
router.delete('/games/categories/:id', gameController.adminDeleteTechCategory);

router.get('/games/technologies', gameController.adminGetTechnologies);
router.post('/games/technologies', gameController.adminCreateTechnology);
router.put('/games/technologies/:id', gameController.adminUpdateTechnology);
router.delete('/games/technologies/:id', gameController.adminDeleteTechnology);
router.patch('/games/technologies/:id/toggle', gameController.adminToggleTechnology);

router.get('/games/challenges', gameController.adminGetChallenges);
router.post('/games/challenges', gameController.adminCreateChallenge);
router.put('/games/challenges/:id', gameController.adminUpdateChallenge);
router.delete('/games/challenges/:id', gameController.adminDeleteChallenge);

router.get('/games/stats', gameController.adminGetStats);

router.get('/games', gameController.adminGetGames);
router.post('/games', gameController.adminCreateGame);
router.put('/games/:id', gameController.adminUpdateGame);
router.delete('/games/:id', gameController.adminDeleteGame);
router.patch('/games/:id/toggle-publish', gameController.adminTogglePublish);
router.patch('/games/:id/toggle-feature', gameController.adminToggleFeature);
router.post('/games/seed', gameController.adminSeedGames);

// 8. /api/admin/blog
router.get('/blog', blogController.adminGetArticles);
router.post('/blog', blogController.adminCreateArticle);
router.put('/blog/:id', blogController.adminUpdateArticle);
router.delete('/blog/:id', blogController.adminDeleteArticle);
router.patch('/blog/:id/toggle-publish', blogController.adminTogglePublish);
router.post('/blog/seed', blogController.adminSeedArticles);

// 9. /api/admin/knowledge-base (AI Book Knowledge Base - Admin Protected)
router.get('/knowledge-base/status', knowledgeBaseController.getKnowledgeBaseStatus);
router.get('/knowledge-base/search', knowledgeBaseController.searchKnowledgeBase);
router.post('/knowledge-base/setup-vector-index', knowledgeBaseController.setupVectorIndex);
router.get('/knowledge-base/books', knowledgeBaseController.listBooks);
router.get('/knowledge-base/books/:id', knowledgeBaseController.getBookDetails);
router.post('/knowledge-base/books', bookUpload.single('file'), knowledgeBaseController.uploadBook);
router.post('/knowledge-base/books/init-upload', knowledgeBaseController.initChunkedUpload);
router.post('/knowledge-base/books/:id/upload-part', bookUpload.single('chunk'), knowledgeBaseController.uploadBookPart);
router.post('/knowledge-base/books/:id/finalize-upload', knowledgeBaseController.finalizeChunkedUpload);
router.post('/knowledge-base/books/:id/process-step', knowledgeBaseController.processBookStep);
router.post('/knowledge-base/books/:id/resume', knowledgeBaseController.processBookStep);
router.put('/knowledge-base/books/:id', knowledgeBaseController.updateBookMetadata);
router.post('/knowledge-base/books/:id/replace', bookUpload.single('file'), knowledgeBaseController.replaceBook);
router.patch('/knowledge-base/books/:id/toggle', knowledgeBaseController.toggleBookEnabled);
router.post('/knowledge-base/books/:id/retry', knowledgeBaseController.retryBookProcessing);
router.post('/knowledge-base/books/:id/retry-ocr', knowledgeBaseController.retryBookOcr);
router.delete('/knowledge-base/books/:id', knowledgeBaseController.deleteBook);

// 10. /api/admin/verification-reports (AI Verification Reports & Approval History)
router.get('/verification-reports', verificationController.getVerificationReports);
router.get('/verification-reports/history', verificationController.getCorrectionHistory);
router.post('/verification-reports/:id/approve', verificationController.approveReportCorrection);
router.post('/verification-reports/:id/dismiss', verificationController.dismissReport);
router.post('/verification-reports/:id/reject', verificationController.dismissReport);
router.delete('/verification-reports/:id', verificationController.deleteReport);

// 11. /api/admin/ai (AI Controls, Usage & Diagnostics)
router.get('/ai/status', aiController.getAiStatus);
router.get('/ai/models', aiController.getAiModels);
router.get('/ai/usage', aiController.getAiUsage);
router.post('/ai/test', adminAiTestLimiter, aiController.testAiModels);
router.post('/ai/cache/clear', aiController.clearAiCache);

// 12. /api/admin/seo (Hangbug SEO & Growth Studio)
router.get('/seo/dashboard', seoDashboardController.getSeoDashboard);
router.post('/seo/audit/run', seoDashboardController.runAudit);
router.post('/seo/pagespeed/run', seoDashboardController.runPageSpeed);
router.post('/seo/inspect-url', seoDashboardController.inspectUrl);
router.patch('/seo/recommendations/:recKey', seoDashboardController.toggleRecommendation);
router.get('/seo/competitors', seoDashboardController.getCompetitors);
router.post('/seo/competitors', seoDashboardController.createCompetitor);
router.post('/seo/competitors/:id/refresh', seoDashboardController.refreshCompetitor);
router.delete('/seo/competitors/:id', seoDashboardController.removeCompetitor);
router.get('/seo/settings', seoDashboardController.getSeoSettings);
router.put('/seo/settings', seoDashboardController.updateSeoSettings);
router.post('/seo/integrations/test', seoDashboardController.testSeoIntegration);
router.post('/seo/backlinks/import', seoDashboardController.importBacklinks);
router.get('/seo/gsc/oauth/authorize', seoDashboardController.getGscOAuthAuthorizeUrl);
router.get('/seo/gsc/properties', seoDashboardController.getGscProperties);
router.put('/seo/gsc/property', seoDashboardController.selectGscProperty);
router.post('/seo/gsc/refresh', seoDashboardController.refreshGscData);
router.post('/seo/gsc/disconnect', seoDashboardController.disconnectGscAccount);

module.exports = router;
