const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { authMiddleware } = require('../_middlewares/authMiddleware');
const { verifyQuestion } = require('../_controllers/verificationController');

const verifyQuestionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.AI_VERIFY_RATE_LIMIT_MAX || '40', 10) || 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many AI verification requests. Please wait a few minutes and try again.'
    }
});

router.post('/verify-question', authMiddleware, verifyQuestionLimiter, verifyQuestion);

module.exports = router;
