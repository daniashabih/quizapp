const jwt = require('jsonwebtoken');
const prisma = require('../_config/prisma');

let cachedGuestAdminId = null;
let cachedGuestCandidateId = null;

const getGuestUserId = async (email, defaultRole) => {
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) return user.id;
        user = await prisma.user.create({
            data: {
                name: defaultRole === 'admin' ? 'System Admin' : 'Demo Candidate',
                email,
                password: '$2b$10$xX3bmli.FzFF4eJIMmMgmun1m9cOASuH3FkQ4joifxVXGplOfLev6',
                role: defaultRole
            }
        });
        return user.id;
    } catch (err) {
        console.error(`[Auth Middleware] Failed to get or create guest user ${email}:`, err.message);
        try {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) return existing.id;
        } catch { /* silent */ }
        throw err;
    }
};

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Support guest mode tokens seamlessly using verified DB user IDs
    if (token === 'guest-admin-token') {
        try {
            if (!cachedGuestAdminId) {
                cachedGuestAdminId = await getGuestUserId('admin@example.com', 'admin');
            }
            req.user = { id: cachedGuestAdminId, name: 'Guest Admin', email: 'admin@example.com', role: 'admin' };
            return next();
        } catch (err) {
            return res.status(500).json({ message: 'Database error resolving guest admin session', error: err.message });
        }
    }
    if (token === 'guest-candidate-token') {
        try {
            if (!cachedGuestCandidateId) {
                cachedGuestCandidateId = await getGuestUserId('user@example.com', 'candidate');
            }
            req.user = { id: cachedGuestCandidateId, name: 'Guest Candidate', email: 'user@example.com', role: 'candidate' };
            return next();
        } catch (err) {
            return res.status(500).json({ message: 'Database error resolving guest candidate session', error: err.message });
        }
    }

    try {
        const secret = process.env.JWT_SECRET || 'secret123';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (err) {
        console.warn('[Auth Middleware Warning] Invalid token:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
