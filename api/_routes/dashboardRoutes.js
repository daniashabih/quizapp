const express = require('express');
const router = express.Router();
const {
    getUserDashboard,
    getAdminDashboard,
    getLeaderboard,
    getMyCertificates
} = require('../_controllers/dashboardController');
const { authMiddleware, adminMiddleware } = require('../_middlewares/authMiddleware');

function requireFullLeaderboardAuth(req, res, next) {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const requestedPage = Number.parseInt(req.query.page, 10);
    const fullRequested = ['true', '1'].includes(String(req.query.full || '').toLowerCase())
        || requestedLimit > 5
        || requestedPage > 1;

    if (fullRequested) {
        return authMiddleware(req, res, next);
    }

    req.leaderboardLimit = '5';
    req.leaderboardPage = '1';
    return next();
}

// 1. User Dashboard Endpoint (Securely relies on req.user.id from JWT)
router.get('/user', authMiddleware, getUserDashboard);
router.get('/my', authMiddleware, getUserDashboard); // Convenient alias

// 2. Admin Dashboard Endpoint (Requires Admin Role)
router.get('/admin', authMiddleware, adminMiddleware, getAdminDashboard);

// 3. Public top-five leaderboard; full rankings require an authenticated session.
router.get('/leaderboard', requireFullLeaderboardAuth, getLeaderboard);

// 4. Certificates Endpoint
router.get('/certificates', authMiddleware, getMyCertificates);
router.get('/certificates/my', authMiddleware, getMyCertificates);

module.exports = router;
module.exports.requireFullLeaderboardAuth = requireFullLeaderboardAuth;
