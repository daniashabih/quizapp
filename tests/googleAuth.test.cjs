const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { OAuth2Client } = require('google-auth-library');

const { googleLogin } = require('../api/_controllers/authController');
const User = require('../api/_models/userModel');

const EXPECTED_CLIENT_ID = '540959878402-4c2pda5555glmat0ajj11filc43ueedk.apps.googleusercontent.com';

test('Google Auth Config: .env and .env.example contain the correct Web Client ID and Origin notes', () => {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    assert.ok(envContent.includes(EXPECTED_CLIENT_ID), '.env must contain official Google Client ID');
    assert.ok(envContent.includes('VITE_GOOGLE_CLIENT_ID='), '.env must define VITE_GOOGLE_CLIENT_ID');
    assert.ok(envContent.includes('GOOGLE_CLIENT_ID='), '.env must define GOOGLE_CLIENT_ID');
    assert.ok(envContent.includes('https://www.hangbug.com'), '.env must define official APP_BASE_URL');

    const envExamplePath = path.join(__dirname, '..', '.env.example');
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    assert.ok(envExampleContent.includes('https://www.hangbug.com'), '.env.example must document official production origin');
    assert.ok(envExampleContent.includes('https://hangbug.com'), '.env.example must document apex domain origin');
    assert.ok(envExampleContent.includes('http://localhost:5173'), '.env.example must document local dev origin');
});

test('Google Auth Frontend: index.html loads Google Identity Services without duplication', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    assert.ok(
        indexContent.includes('id="google-gsi-client"'),
        'index.html script tag must have id="google-gsi-client"'
    );
    assert.ok(
        indexContent.includes('src="https://accounts.google.com/gsi/client"'),
        'index.html must load official Google Identity Services client'
    );

    const occurrences = (indexContent.match(/accounts\.google\.com\/gsi\/client/g) || []).length;
    assert.equal(occurrences, 1, 'Google Identity Services must only be loaded once in index.html');
});

test('Google Auth Frontend: Auth.jsx uses GIS ID-token flow with renderButton, duplicate guard and same Client ID', () => {
    const authPath = path.join(__dirname, '..', 'src', 'pages', 'auth', 'Auth.jsx');
    const authContent = fs.readFileSync(authPath, 'utf-8');

    assert.ok(authContent.includes(EXPECTED_CLIENT_ID), 'Auth.jsx must have DEFAULT_GOOGLE_CLIENT_ID matching official Client ID');
    assert.ok(authContent.includes('renderButton'), 'Auth.jsx must render the official Google button');
    assert.ok(authContent.includes('credential: response.credential'), 'Auth.jsx must send the Google ID token credential');
    assert.ok(authContent.includes('googleInFlightRef'), 'Auth.jsx must prevent duplicate Google requests');
    assert.ok(!authContent.includes('isDemo'), 'Auth.jsx must not use demo Google login');
    assert.ok(authContent.includes('loadGoogleGsiScript'), 'Auth.jsx must use safe script loader avoiding duplicates');
});

test('Google Auth Frontend: Login, Signup, and Register pages share the exact same Auth implementation', () => {
    const loginPath = path.join(__dirname, '..', 'src', 'pages', 'auth', 'Login.jsx');
    const signupPath = path.join(__dirname, '..', 'src', 'pages', 'auth', 'Signup.jsx');
    const registerPath = path.join(__dirname, '..', 'src', 'pages', 'auth', 'Register.jsx');

    const loginContent = fs.readFileSync(loginPath, 'utf-8');
    const signupContent = fs.readFileSync(signupPath, 'utf-8');
    const registerContent = fs.readFileSync(registerPath, 'utf-8');

    assert.ok(loginContent.includes("<Auth initialMode=\"login\""), 'Login must render Auth with initialMode login');
    assert.ok(signupContent.includes("<Auth initialMode=\"signup\""), 'Signup must render Auth with initialMode signup');
    assert.ok(registerContent.includes("<Auth initialMode=\"signup\""), 'Register must render Auth with initialMode signup');
});

test('Google Auth Backend: api/index.js sets COOP to same-origin-allow-popups for Google Sign-In popup', () => {
    const apiIndexPath = path.join(__dirname, '..', 'api', 'index.js');
    const apiIndexContent = fs.readFileSync(apiIndexPath, 'utf-8');

    assert.ok(
        apiIndexContent.includes("policy: 'same-origin-allow-popups'"),
        "api/index.js helmet config must specify same-origin-allow-popups for COOP"
    );
});

// ---------- Backend: googleLogin with stubbed Google verification ----------
const ORIGINAL_VERIFY = OAuth2Client.prototype.verifyIdToken;

function makeRes() {
    const res = { statusCode: null, body: null, cookies: [] };
    res.cookie = (...a) => { res.cookies.push(a); };
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (d) => { res.body = d; return res; };
    return res;
}

function stubGoogle(payload, { throws } = {}) {
    OAuth2Client.prototype.verifyIdToken = async function (opts) {
        assert.equal(opts.audience, EXPECTED_CLIENT_ID, 'audience must be the Web Client ID');
        if (throws) throw new Error(throws);
        return { getPayload: () => payload };
    };
}

async function withUserStubs(stubs, fn) {
    const originals = {};
    process.env.GOOGLE_CLIENT_ID = EXPECTED_CLIENT_ID;
    for (const k of Object.keys(stubs)) { originals[k] = User[k]; User[k] = stubs[k]; }
    try { await fn(); } finally {
        for (const k of Object.keys(originals)) User[k] = originals[k];
        OAuth2Client.prototype.verifyIdToken = ORIGINAL_VERIFY;
    }
}

test('Google Auth Backend: rejects request with no credential (400)', async () => {
    process.env.GOOGLE_CLIENT_ID = EXPECTED_CLIENT_ID;
    const res = makeRes();
    await googleLogin({ body: {} }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
});

test('Google Auth Backend: legacy access-token/demo payloads are not accepted', async () => {
    process.env.GOOGLE_CLIENT_ID = EXPECTED_CLIENT_ID;
    const res = makeRes();
    await googleLogin({ body: { token: 'x', isDemo: true, email: 'a@b.com' } }, res);
    assert.equal(res.statusCode, 400);
});

test('Google Auth Backend: invalid/forged/wrong-audience token is rejected (401)', async () => {
    await withUserStubs({}, async () => {
        stubGoogle(null, { throws: 'Wrong recipient, payload audience != requiredAudience' });
        const res = makeRes();
        await googleLogin({ body: { credential: 'forged' } }, res);
        assert.equal(res.statusCode, 401);
        assert.equal(res.cookies.length, 0, 'no session cookie on failure');
    });
});

test('Google Auth Backend: unverified Google email is rejected (401)', async () => {
    await withUserStubs({}, async () => {
        stubGoogle({ sub: '1', email: 'u@example.com', email_verified: false });
        const res = makeRes();
        await googleLogin({ body: { credential: 't' } }, res);
        assert.equal(res.statusCode, 401);
        assert.ok(res.body.message.includes('not verified'));
    });
});

test('Google Auth Backend: new Google user is registered once with googleId and random password', async () => {
    let created = null;
    await withUserStubs({
        findByGoogleId: async () => null,
        findByEmail: async () => null,
        createFromGoogle: async (d) => { created = d; return { id: 'new1', name: d.name, email: d.email, role: 'user', avatar: d.avatar, createdAt: new Date() }; }
    }, async () => {
        stubGoogle({ sub: 'g-123', email: 'New@HangBug.com', email_verified: true, name: 'New Coder', picture: 'https://x/y.png' });
        const res = makeRes();
        await googleLogin({ body: { credential: 't' } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.user.email, 'new@hangbug.com');
        assert.ok(res.body.token);
        assert.equal(res.cookies.length, 1);
        assert.equal(created.googleId, 'g-123');
        assert.ok(created.password.startsWith('$2'), 'password must be a bcrypt hash of random secret');
    });
});

test('Google Auth Backend: existing email/password user is linked without overwriting password or duplicating', async () => {
    let createCalled = false; let linkArgs = null;
    await withUserStubs({
        findByGoogleId: async () => null,
        findByEmail: async () => ({ id: 'u1', name: 'Jane', email: 'jane@hangbug.com', role: 'user', avatar: '', password: 'HASH', is_verified: false }),
        linkGoogleAccount: async (id, gid, avatar) => { linkArgs = { id, gid, avatar }; return { id, googleId: gid, avatar }; },
        createFromGoogle: async () => { createCalled = true; }
    }, async () => {
        stubGoogle({ sub: 'g-9', email: 'jane@hangbug.com', email_verified: true, name: 'Jane', picture: 'p' });
        const res = makeRes();
        await googleLogin({ body: { credential: 't' } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.user.id, 'u1');
        assert.equal(createCalled, false);
        assert.deepEqual(linkArgs, { id: 'u1', gid: 'g-9', avatar: 'p' });
        assert.equal(res.body.user.password, undefined);
    });
});

test('Google Auth Backend: email already linked to a different Google account is refused (409)', async () => {
    await withUserStubs({
        findByGoogleId: async () => null,
        findByEmail: async () => ({ id: 'u1', email: 'jane@hangbug.com', googleId: 'other', role: 'user' })
    }, async () => {
        stubGoogle({ sub: 'g-9', email: 'jane@hangbug.com', email_verified: true });
        const res = makeRes();
        await googleLogin({ body: { credential: 't' } }, res);
        assert.equal(res.statusCode, 409);
    });
});

test('Google Auth Backend: returning Google user is matched by googleId (no create)', async () => {
    let createCalled = false;
    await withUserStubs({
        findByGoogleId: async (g) => g === 'g-5' ? { id: 'u5', name: 'X', email: 'x@hangbug.com', role: 'user', avatar: 'a', googleId: 'g-5', is_verified: true } : null,
        createFromGoogle: async () => { createCalled = true; }
    }, async () => {
        stubGoogle({ sub: 'g-5', email: 'x@hangbug.com', email_verified: true });
        const res = makeRes();
        await googleLogin({ body: { credential: 't' } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.user.id, 'u5');
        assert.equal(createCalled, false);
    });
});
