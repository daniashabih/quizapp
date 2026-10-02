const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

const { getAllUsers } = require('../_controllers/authController');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../_controllers/categoryController');
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../_controllers/questionController');
const { getSettings, updateSettings } = require('../_controllers/settingController');
const Setting = require('../_models/settingModel');
const prisma = require('../_config/prisma');

// Enforce authentication & admin role across all /api/admin routes
router.use(authMiddleware, adminMiddleware);

// 1. /api/admin/users
router.get('/users', getAllUsers);
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: String(id) } });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Role must be user or admin' });
        }
        const updated = await prisma.user.update({
            where: { id: String(id) },
            data: { role },
            select: { id: true, name: true, email: true, role: true }
        });
        res.json({ success: true, message: `User role updated to ${role}`, user: updated });
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

module.exports = router;
