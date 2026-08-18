const express = require('express');
const router = express.Router();
const {
    signup,
    register,
    login,
    logout,
    googleLogin,
    getMe,
    getAllUsers,
    updateProfile,
    forgotPassword,
    resetPassword
} = require('../_controllers/authController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

router.post('/signup', signup);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getMe);
router.put('/update-profile', authMiddleware, updateProfile);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
