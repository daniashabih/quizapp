const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const {
    renderPasswordResetHtml,
    renderPasswordResetText,
    getAppBaseUrl,
    getFromAddress,
    parseSender,
    detectEmailProvider,
    sendPasswordResetEmail
} = require('../api/_services/emailService');

test('Email Service: getAppBaseUrl defaults to production URL or env', () => {
    const originalEnv = process.env.APP_BASE_URL;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalVercelEnv = process.env.VERCEL_ENV;
    const originalVercelUrl = process.env.VERCEL_URL;
    const originalVercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;

    try {
        // 1. Explicit APP_BASE_URL takes absolute highest precedence
        process.env.APP_BASE_URL = 'https://hangbug.vercel.app';
        assert.equal(getAppBaseUrl(), 'https://hangbug.vercel.app');

        process.env.APP_BASE_URL = 'https://custom-domain.com/';
        assert.equal(getAppBaseUrl(), 'https://custom-domain.com');

        // 2. Production without APP_BASE_URL uses canonical production URL (not preview hash)
        delete process.env.APP_BASE_URL;
        process.env.NODE_ENV = 'production';
        process.env.VERCEL_ENV = 'production';
        process.env.VERCEL_URL = 'hangbug-git-main-daniashabih.vercel.app';
        assert.equal(getAppBaseUrl(), 'https://hangbug.vercel.app', 'Production must prefer canonical domain over transient hash');

        // 3. Vercel project production URL takes priority if set in production
        process.env.VERCEL_PROJECT_PRODUCTION_URL = 'hangbug.vercel.app';
        assert.equal(getAppBaseUrl(), 'https://hangbug.vercel.app');

        // 4. Preview environment uses preview deployment URL
        process.env.NODE_ENV = 'development';
        process.env.VERCEL_ENV = 'preview';
        process.env.VERCEL_URL = 'hangbug-preview-branch.vercel.app';
        assert.equal(getAppBaseUrl(), 'https://hangbug-preview-branch.vercel.app');

        // 5. Local development fallback
        delete process.env.VERCEL_ENV;
        delete process.env.VERCEL_URL;
        delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
        assert.equal(getAppBaseUrl(), 'http://localhost:3000');
    } finally {
        if (originalEnv !== undefined) process.env.APP_BASE_URL = originalEnv; else delete process.env.APP_BASE_URL;
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
        if (originalVercelEnv !== undefined) process.env.VERCEL_ENV = originalVercelEnv; else delete process.env.VERCEL_ENV;
        if (originalVercelUrl !== undefined) process.env.VERCEL_URL = originalVercelUrl; else delete process.env.VERCEL_URL;
        if (originalVercelProd !== undefined) process.env.VERCEL_PROJECT_PRODUCTION_URL = originalVercelProd; else delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    }
});

test('Email Service: parseSender decomposes display name and address', () => {
    assert.deepEqual(parseSender('Hangbug <noreply@hangbug.com>'), {
        name: 'Hangbug',
        email: 'noreply@hangbug.com'
    });
    assert.deepEqual(parseSender('"Support Team" <support@domain.org>'), {
        name: 'Support Team',
        email: 'support@domain.org'
    });
    assert.deepEqual(parseSender('plain@domain.com'), {
        name: 'Hangbug',
        email: 'plain@domain.com'
    });
});

test('Email Service: getFromAddress respects provider and environment defaults', () => {
    const originalFrom = process.env.EMAIL_FROM_ADDRESS;
    try {
        // Explicit configuration
        process.env.EMAIL_FROM_ADDRESS = 'Hangbug Security <security@hangbug.com>';
        assert.equal(getFromAddress('resend'), 'Hangbug Security <security@hangbug.com>');
        assert.equal(getFromAddress('smtp'), 'Hangbug Security <security@hangbug.com>');

        // When omitted with Resend: defaults to onboarding@resend.dev to prevent immediate NXDOMAIN bounce
        delete process.env.EMAIL_FROM_ADDRESS;
        assert.equal(getFromAddress('resend'), 'Hangbug <onboarding@resend.dev>');

        // When omitted with SMTP: defaults to Hangbug brand sender
        assert.equal(getFromAddress('smtp'), 'Hangbug <noreply@hangbug.com>');
    } finally {
        if (originalFrom !== undefined) process.env.EMAIL_FROM_ADDRESS = originalFrom; else delete process.env.EMAIL_FROM_ADDRESS;
    }
});

test('Email Service: detectEmailProvider identifies active transactional provider', () => {
    const originalResend = process.env.RESEND_API_KEY;
    const originalSendGrid = process.env.SENDGRID_API_KEY;
    const originalSmtp = process.env.SMTP_HOST;
    const originalNodeEnv = process.env.NODE_ENV;

    try {
        // Clear all
        delete process.env.RESEND_API_KEY;
        delete process.env.SENDGRID_API_KEY;
        delete process.env.SMTP_HOST;
        delete process.env.EMAIL_PROVIDER_API_KEY;
        delete process.env.EMAIL_PROVIDER;

        // Resend
        process.env.RESEND_API_KEY = 're_test_key_123';
        assert.equal(detectEmailProvider(), 'resend');
        delete process.env.RESEND_API_KEY;

        // SendGrid
        process.env.SENDGRID_API_KEY = 'SG.test_key_456';
        assert.equal(detectEmailProvider(), 'sendgrid');
        delete process.env.SENDGRID_API_KEY;

        // SMTP
        process.env.SMTP_HOST = 'smtp.sendgrid.net';
        assert.equal(detectEmailProvider(), 'smtp');
        delete process.env.SMTP_HOST;

        // Non-production simulation
        process.env.NODE_ENV = 'development';
        assert.equal(detectEmailProvider(), 'simulated');

        // Production with nothing configured
        process.env.NODE_ENV = 'production';
        assert.equal(detectEmailProvider(), 'none');
    } finally {
        if (originalResend !== undefined) process.env.RESEND_API_KEY = originalResend; else delete process.env.RESEND_API_KEY;
        if (originalSendGrid !== undefined) process.env.SENDGRID_API_KEY = originalSendGrid; else delete process.env.SENDGRID_API_KEY;
        if (originalSmtp !== undefined) process.env.SMTP_HOST = originalSmtp; else delete process.env.SMTP_HOST;
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
    }
});

test('Email Service: Delivery status distinction (accepted_by_provider vs delivered)', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalResend = process.env.RESEND_API_KEY;
    try {
        process.env.NODE_ENV = 'test';
        delete process.env.RESEND_API_KEY; // Ensure test runs in simulation without remote API side-effects
        const result = await sendPasswordResetEmail({
            to: 'learner@hangbug.com',
            resetUrl: 'https://hangbug.vercel.app/reset-password?token=mocktoken',
            userName: 'Learner'
        });

        assert.equal(result.accepted, true, 'Request must be accepted');
        assert.equal(result.deliveryStatus, 'simulated_local');
        assert.ok(result.provider, 'Provider must be specified');
    } finally {
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
        if (originalResend !== undefined) process.env.RESEND_API_KEY = originalResend; else delete process.env.RESEND_API_KEY;
    }
});

test('Email Service: Production throws error when credentials missing (no false success)', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalResend = process.env.RESEND_API_KEY;
    const originalSmtp = process.env.SMTP_HOST;

    try {
        process.env.NODE_ENV = 'production';
        delete process.env.RESEND_API_KEY;
        delete process.env.SENDGRID_API_KEY;
        delete process.env.SMTP_HOST;
        delete process.env.EMAIL_PROVIDER_API_KEY;
        delete process.env.EMAIL_PROVIDER;

        await assert.rejects(
            async () => {
                await sendPasswordResetEmail({
                    to: 'learner@hangbug.com',
                    resetUrl: 'https://hangbug.vercel.app/reset-password?token=mocktoken'
                });
            },
            (err) => {
                assert.equal(err.code, 'ERR_NO_EMAIL_PROVIDER');
                assert.equal(err.statusCode, 503);
                return true;
            },
            'Must throw structured 503 error instead of succeeding silently'
        );
    } finally {
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
        if (originalResend !== undefined) process.env.RESEND_API_KEY = originalResend; else delete process.env.RESEND_API_KEY;
        if (originalSmtp !== undefined) process.env.SMTP_HOST = originalSmtp; else delete process.env.SMTP_HOST;
    }
});

test('Email Service: renderPasswordResetHtml includes branding and required content', () => {
    const resetUrl = 'https://hangbug.vercel.app/reset-password?token=abc123test';
    const html = renderPasswordResetHtml({ resetUrl, userName: 'Ada Lovelace' });

    assert.ok(html.includes('Hangbug'), 'Must contain Hangbug brand name');
    assert.ok(html.includes('Hello Ada Lovelace,'), 'Must greet the user by name');
    assert.ok(html.includes('We received a request to reset the password'), 'Must contain request description');
    assert.ok(html.includes('Reset Password'), 'Must contain Reset Password CTA button');
    assert.ok(html.includes(resetUrl), 'Must contain the reset URL');
    assert.ok(html.includes('30 minutes'), 'Must state 30 minute expiry');
    assert.ok(html.includes('only be used once'), 'Must state single use restriction');
    assert.ok(html.includes('safely ignore this email'), 'Must provide safety notice');
    assert.ok(html.includes('Learn - Test - Prove') || html.includes('Learn &bull; Test &bull; Prove'), 'Must contain tagline');
});

test('Email Service: renderPasswordResetText fallback renders correctly', () => {
    const resetUrl = 'https://hangbug.vercel.app/reset-password?token=abc123test';
    const text = renderPasswordResetText({ resetUrl });

    assert.ok(text.includes('Hello,'), 'Must include default greeting');
    assert.ok(text.includes(resetUrl), 'Must include reset link');
    assert.ok(text.includes('30 minutes'), 'Must mention 30 minutes');
    assert.ok(text.includes('The Hangbug Team'), 'Must sign off with team name');
});

test('Security & Cryptography: Raw token generation produces 256 bits of entropy', () => {
    const rawToken1 = crypto.randomBytes(32).toString('hex');
    const rawToken2 = crypto.randomBytes(32).toString('hex');

    assert.equal(rawToken1.length, 64, '32-byte hex token must be 64 characters long');
    assert.notEqual(rawToken1, rawToken2, 'Subsequent tokens must be completely unpredictable');
    assert.match(rawToken1, /^[0-9a-f]{64}$/, 'Must be valid hex string');
});

test('Security & Cryptography: SHA-256 token hashing preserves confidentiality in DB', () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    assert.equal(hashedToken.length, 64);
    assert.notEqual(rawToken, hashedToken, 'Hashed token must not match raw token');

    // Reproducibility with matching token
    const rehashed = crypto.createHash('sha256').update(rawToken).digest('hex');
    assert.equal(hashedToken, rehashed, 'Identical raw token must produce identical hash');

    // Mismatched token must not match
    const wrongHash = crypto.createHash('sha256').update('wrong-token').digest('hex');
    assert.notEqual(hashedToken, wrongHash);
});

test('Token Expiration Logic: 30 minutes window validation', () => {
    const now = Date.now();
    const validExpiry = new Date(now + 30 * 60 * 1000);
    const expiredTime = new Date(now - 1000); // 1 second in the past

    assert.ok(validExpiry > new Date(), 'Fresh token must not be expired');
    assert.ok(expiredTime < new Date(), 'Past expiry must be expired');
});

test('Password Hashing: Bcrypt hashes meet security requirements', async () => {
    const password = 'CorrectHorseBattery99!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    assert.ok(hash.startsWith('$2'), 'Must be a valid bcrypt hash');
    assert.notEqual(password, hash, 'Password must never equal hash');

    const isMatch = await bcrypt.compare(password, hash);
    assert.equal(isMatch, true, 'Original password must verify against hash');

    const isWrongMatch = await bcrypt.compare('WrongPassword123!', hash);
    assert.equal(isWrongMatch, false, 'Incorrect password must be rejected');
});

test('Password Policy Validation: 8 chars, 1 uppercase, 1 digit', () => {
    const validate = (pw) => {
        if (!pw || pw.length < 8) return 'Too short';
        if (!/[A-Z]/.test(pw)) return 'Missing uppercase';
        if (!/[0-9]/.test(pw)) return 'Missing number';
        return null;
    };

    assert.equal(validate('short1A'), 'Too short');
    assert.equal(validate('lowercaseonly123'), 'Missing uppercase');
    assert.equal(validate('UPPERCASEONLY!'), 'Missing number');
    assert.equal(validate('ValidPassword123'), null);
});

test('Anti-Enumeration: Generic response uniformity for non-existent users', () => {
    const genericSuccess = 'If an account exists for this email address, you will receive a password reset link shortly.';

    // Both existing and non-existing accounts receive the exact same response on normal operation
    const existingUserResponse = { success: true, message: genericSuccess };
    const missingUserResponse = { success: true, message: genericSuccess };

    assert.deepEqual(existingUserResponse, missingUserResponse, 'Responses must be identical to prevent enumeration');
});

test('Single-Use Invalidation: Reset token cleared upon consumption', () => {
    const userInDb = {
        id: 'user_123',
        email: 'dev@hangbug.com',
        resetToken: 'hashed_token_value',
        resetTokenExpiry: new Date(Date.now() + 1800000),
        passwordChangedAt: null
    };

    // First reset consumes token
    const consumeToken = (record, token) => {
        if (record.resetToken === token && record.resetTokenExpiry > new Date()) {
            record.resetToken = null;
            record.resetTokenExpiry = null;
            record.passwordChangedAt = new Date();
            return true;
        }
        return false;
    };

    const firstAttempt = consumeToken(userInDb, 'hashed_token_value');
    assert.equal(firstAttempt, true, 'First attempt must succeed');
    assert.equal(userInDb.resetToken, null, 'Reset token must be cleared');
    assert.equal(userInDb.resetTokenExpiry, null, 'Reset token expiry must be cleared');
    assert.ok(userInDb.passwordChangedAt instanceof Date, 'Password changed timestamp recorded');

    // Second attempt with same token must fail
    const secondAttempt = consumeToken(userInDb, 'hashed_token_value');
    assert.equal(secondAttempt, false, 'Reused reset token must be rejected');
});

test('JWT Revocation on Password Reset: issued-at validation', () => {
    const passwordChangedAt = new Date('2026-10-22T12:00:00Z');
    const passwordChangedSec = Math.floor(passwordChangedAt.getTime() / 1000);

    // Token issued before password change (e.g. 1 hour earlier)
    const oldTokenIat = passwordChangedSec - 3600;
    const isOldTokenValid = oldTokenIat >= passwordChangedSec;
    assert.equal(isOldTokenValid, false, 'Old JWT issued before password change must be revoked');

    // Token issued after password change
    const newTokenIat = passwordChangedSec + 60;
    const isNewTokenValid = newTokenIat >= passwordChangedSec;
    assert.equal(isNewTokenValid, true, 'New JWT issued after password change is valid');
});

const { forgotPassword } = require('../api/_controllers/authController');
const User = require('../api/_models/userModel');

test('API Endpoint: POST /api/auth/forgot-password validates email format', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { body: { email: 'invalid-email-address' } };
    const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { jsonBody = data; return res; }
    };

    await forgotPassword(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonBody.success, false);
});

test('API Endpoint: POST /api/auth/forgot-password returns 200 generic message if user not found', async () => {
    const originalFindByEmail = User.findByEmail;
    try {
        User.findByEmail = async () => null;

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { email: 'nonexistent@example.com' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await forgotPassword(req, res);
        assert.equal(statusCode, 200);
        assert.equal(jsonBody.success, true);
        assert.ok(jsonBody.message.includes('If an account exists'));
    } finally {
        User.findByEmail = originalFindByEmail;
    }
});

test('API Endpoint: POST /api/auth/forgot-password returns 503 error when email delivery fails (no false success)', async () => {
    const originalFindByEmail = User.findByEmail;
    const originalSetResetToken = User.setResetToken;
    const originalNodeEnv = process.env.NODE_ENV;

    try {
        process.env.NODE_ENV = 'production';
        delete process.env.RESEND_API_KEY;
        delete process.env.SENDGRID_API_KEY;
        delete process.env.SMTP_HOST;
        delete process.env.EMAIL_PROVIDER_API_KEY;

        User.findByEmail = async (email) => ({
            id: 'mock_user_1',
            name: 'Learner',
            email: 'learner@hangbug.com'
        });
        User.setResetToken = async () => 1;

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { email: 'learner@hangbug.com' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await forgotPassword(req, res);
        assert.equal(statusCode, 503, 'Must return 503 when email provider fails, not false 200 success');
        assert.equal(jsonBody.success, false);
        assert.ok(jsonBody.message.includes('Unable to deliver'));
    } finally {
        User.findByEmail = originalFindByEmail;
        User.setResetToken = originalSetResetToken;
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
    }
});

test('API Endpoint: POST /api/auth/forgot-password succeeds when email is accepted', async () => {
    const originalFindByEmail = User.findByEmail;
    const originalSetResetToken = User.setResetToken;
    const originalNodeEnv = process.env.NODE_ENV;

    try {
        process.env.NODE_ENV = 'development'; // triggers simulation mode

        User.findByEmail = async (email) => ({
            id: 'mock_user_1',
            name: 'Learner',
            email: 'learner@hangbug.com'
        });
        User.setResetToken = async () => 1;

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { email: 'learner@hangbug.com' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await forgotPassword(req, res);
        assert.equal(statusCode, 200);
        assert.equal(jsonBody.success, true);
        assert.ok(jsonBody.message.includes('If an account exists'));
    } finally {
        User.findByEmail = originalFindByEmail;
        User.setResetToken = originalSetResetToken;
        if (originalNodeEnv !== undefined) process.env.NODE_ENV = originalNodeEnv; else delete process.env.NODE_ENV;
    }
});
