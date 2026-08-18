const jwt = require('jsonwebtoken');
const User = require('../_models/userModel');

/**
 * Authentication Middleware
 * Reads JWT from HttpOnly cookie or Authorization Bearer header
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1. Check HttpOnly cookie first, then Authorization header
        let token = req.cookies?.token;

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7).trim();
            } else {
                token = authHeader.trim();
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No token provided.'
            });
        }

        // Support guest tokens for seamless demo access
        if (token === 'guest-admin-token') {
            req.user = {
                id: 'guest_admin',
                name: 'Guest Admin',
                email: 'admin@example.com',
                role: 'admin',
                avatar: '',
                isVerified: true
            };
            return next();
        }

        if (token === 'guest-candidate-token') {
            req.user = {
                id: 'guest_candidate',
                name: 'Guest Candidate',
                email: 'user@example.com',
                role: 'user',
                avatar: '',
                isVerified: true
            };
            return next();
        }

        // Verify JWT token
        const secret = process.env.JWT_SECRET || 'hangbug_secret_jwt_key_2026';
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                message: jwtErr.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.'
            });
        }

        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload.'
            });
        }

        // Fetch fresh user data from database (without password)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists.'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('[Auth Middleware Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
};

/**
 * Role-based Admin Authorization Middleware
 * Verifies req.user exists and has role "admin"
 */
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
    });
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
