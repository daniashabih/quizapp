const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    signup,
    register,
    login,
    logout,
    googleLogin,
    getMe,
    getAllUsers,
    updateProfile,
    deleteAccount,
    requestDeletion,
    forgotPassword,
    verifyResetToken,
    resetPassword
} = require('../_controllers/authController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

// Dedicated rate limiter for forgot password requests (prevents email bombing and abuse)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests from this IP. Please try again after 15 minutes.'
    }
});

// Dedicated rate limiter for reset attempts (prevents brute force token probing)
const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many reset attempts from this IP. Please try again after 15 minutes.'
    }
});

router.post('/signup', signup);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getMe);
router.put('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.post('/request-deletion', requestDeletion);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

// Password Reset Routes
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

module.exports = router;
