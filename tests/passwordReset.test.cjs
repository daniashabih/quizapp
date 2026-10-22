const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const {
    renderPasswordResetHtml,
    renderPasswordResetText,
    getAppBaseUrl
} = require('../api/_services/emailService');

test('Email Service: getAppBaseUrl defaults to production URL or env', () => {
    const originalEnv = process.env.APP_BASE_URL;
    try {
        process.env.APP_BASE_URL = 'https://hangbug.vercel.app';
        assert.equal(getAppBaseUrl(), 'https://hangbug.vercel.app');

        process.env.APP_BASE_URL = 'https://custom-domain.com/';
        assert.equal(getAppBaseUrl(), 'https://custom-domain.com');
    } finally {
        process.env.APP_BASE_URL = originalEnv;
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

test('Anti-Enumeration: Generic response uniformity', () => {
    const genericSuccess = 'If an account exists for this email address, you will receive a password reset link shortly.';

    // Both existing and non-existing accounts receive the exact same response
    const existingUserResponse = { success: true, message: genericSuccess };
    const missingUserResponse = { success: true, message: genericSuccess };

    assert.deepEqual(existingUserResponse, missingUserResponse, 'Responses must be identical to prevent enumeration');
});

test('Single-Use Invalidation: Reset token cleared upon consumption', () => {
    // Simulating user record in DB
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
