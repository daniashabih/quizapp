const express = require('express');
const router = express.Router();
const {
    getUserDashboard,
    getAdminDashboard,
    getLeaderboard,
    getMyCertificates
} = require('../_controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

// 1. User Dashboard Endpoint (Securely relies on req.user.id from JWT)
router.get('/user', authMiddleware, getUserDashboard);
router.get('/my', authMiddleware, getUserDashboard); // Convenient alias

// 2. Admin Dashboard Endpoint (Requires Admin Role)
router.get('/admin', authMiddleware, adminMiddleware, getAdminDashboard);

// 3. Global Leaderboard Endpoint (Derived live from MongoDB)
router.get('/leaderboard', getLeaderboard);

// 4. Certificates Endpoint
router.get('/certificates', authMiddleware, getMyCertificates);
router.get('/certificates/my', authMiddleware, getMyCertificates);

module.exports = router;
