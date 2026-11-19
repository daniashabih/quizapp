const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { createQuestion, importQuestions, exportQuestions, getQuestions, getCategorySessions, checkNewQuestions, deleteQuestion, updateQuestion } = require('../_controllers/questionController');
const { generateQuestions } = require('../_controllers/aiController');
const authMiddleware = require('../_middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const aiGenerateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AI_ADMIN_TEST_RATE_LIMIT_MAX || '30', 10) || 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many AI question generation requests. Please wait a few minutes and try again.'
    }
});

// Check for admin role
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Public / User Routes
router.get('/', getQuestions);
router.get('/sessions', getCategorySessions);
router.get('/status', checkNewQuestions); // New status check
router.get('/export', authMiddleware, adminMiddleware, exportQuestions);

// Admin Routes
router.post('/', authMiddleware, adminMiddleware, createQuestion);
router.post('/import', authMiddleware, adminMiddleware, upload.single('file'), importQuestions);
router.post('/generate', authMiddleware, adminMiddleware, aiGenerateLimiter, generateQuestions); // AI Generation
router.put('/:id', authMiddleware, adminMiddleware, updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, deleteQuestion);

module.exports = router;
