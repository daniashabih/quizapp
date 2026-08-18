const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Generate a JWT token and set an HttpOnly cookie on the response
 * @param {import('express').Response} res
 * @param {{ id: string, role: string }} user
 * @returns {string} token
 */
function generateTokenAndSetCookie(res, user) {
    const secret = process.env.JWT_SECRET || 'hangbug_secret_jwt_key_2026';
    const token = jwt.sign(
        { userId: user.id, role: user.role || 'user' },
        secret,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/'
    });

    return token;
}

/**
 * Clear the authentication cookie
 * @param {import('express').Response} res
 */
function clearTokenCookie(res) {
    const isProd = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/'
    });
}

module.exports = {
    generateTokenAndSetCookie,
    clearTokenCookie
};
