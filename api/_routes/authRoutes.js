const express = require('express');
const router = express.Router();
const { register, login, getMe, getAllUsers, updateProfile, forgotPassword, resetPassword } = require('../_controllers/authController');
const authMiddleware = require('../_middlewares/authMiddleware');

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);
router.put('/update-profile', authMiddleware, updateProfile);
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
