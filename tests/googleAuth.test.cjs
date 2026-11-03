const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

const { googleLogin } = require('../api/_controllers/authController');
const User = require('../api/_models/userModel');

const EXPECTED_CLIENT_ID = '540959878402-dm79psv3n2jtungji4cvm4s8j9eoes3o.apps.googleusercontent.com';

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

test('Google Auth Frontend: Auth.jsx contains tokenClientRef, error handling, and same Client ID', () => {
    const authPath = path.join(__dirname, '..', 'src', 'pages', 'auth', 'Auth.jsx');
    const authContent = fs.readFileSync(authPath, 'utf-8');

    assert.ok(authContent.includes(EXPECTED_CLIENT_ID), 'Auth.jsx must have DEFAULT_GOOGLE_CLIENT_ID matching official Client ID');
    assert.ok(authContent.includes('tokenClientRef'), 'Auth.jsx must use tokenClientRef for synchronous popup handling');
    assert.ok(authContent.includes('popup_blocked'), 'Auth.jsx must handle popup_blocked error specifically');
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

test('Google Auth Backend: POST /api/auth/google rejects request with no credentials', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { body: {} };
    const res = {
        status: (code) => { statusCode = code; return res; },
        json: (data) => { jsonBody = data; return res; }
    };

    await googleLogin(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonBody.success, false);
    assert.ok(jsonBody.message.includes('required'));
});

test('Google Auth Backend: ID Token audience mismatch is rejected with 401', async () => {
    const originalAxiosGet = axios.get;
    try {
        axios.get = async (url) => {
            if (url.includes('tokeninfo')) {
                return {
                    data: {
                        aud: 'unauthorized-malicious-client-id.apps.googleusercontent.com',
                        email: 'test@example.com',
                        email_verified: 'true',
                        name: 'Test Hacker'
                    }
                };
            }
            throw new Error('Unexpected URL: ' + url);
        };

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { credential: 'mock-id-token' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 401);
        assert.equal(jsonBody.success, false);
        assert.ok(jsonBody.message.includes('audience mismatch'));
    } finally {
        axios.get = originalAxiosGet;
    }
});

test('Google Auth Backend: Unverified Google email is rejected with 401', async () => {
    const originalAxiosGet = axios.get;
    try {
        axios.get = async (url) => {
            if (url.includes('tokeninfo')) {
                return {
                    data: {
                        aud: EXPECTED_CLIENT_ID,
                        email: 'unverified@example.com',
                        email_verified: 'false',
                        name: 'Unverified User'
                    }
                };
            }
            throw new Error('Unexpected URL: ' + url);
        };

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { credential: 'mock-id-token' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 401);
        assert.equal(jsonBody.success, false);
        assert.ok(jsonBody.message.includes('Email address is not verified'));
    } finally {
        axios.get = originalAxiosGet;
    }
});

test('Google Auth Backend: Valid ID Token logs in existing user without duplicate account creation', async () => {
    const originalAxiosGet = axios.get;
    const originalFindByEmail = User.findByEmail;
    const originalCreate = User.create;
    const originalUpdate = User.update;

    let createCalled = false;
    let updateCalled = false;

    try {
        axios.get = async (url) => {
            if (url.includes('tokeninfo')) {
                return {
                    data: {
                        aud: EXPECTED_CLIENT_ID,
                        email: 'jane@hangbug.com',
                        email_verified: 'true',
                        name: 'Jane Developer',
                        picture: 'https://hangbug.com/avatar.png'
                    }
                };
            }
            throw new Error('Unexpected URL: ' + url);
        };

        User.findByEmail = async (email) => {
            assert.equal(email, 'jane@hangbug.com');
            return {
                id: 'existing_user_123',
                name: 'Jane Developer',
                email: 'jane@hangbug.com',
                role: 'user',
                avatar: 'https://hangbug.com/avatar.png',
                isVerified: true
            };
        };

        User.create = async () => {
            createCalled = true;
            throw new Error('User.create should not be called for existing user');
        };

        User.update = async () => {
            updateCalled = true;
            return {};
        };

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { credential: 'valid-id-token' } };
        const res = {
            cookie: () => {},
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 200);
        assert.equal(jsonBody.success, true);
        assert.equal(jsonBody.user.id, 'existing_user_123');
        assert.equal(jsonBody.user.email, 'jane@hangbug.com');
        assert.ok(jsonBody.token, 'Must return JWT token');
        assert.equal(createCalled, false, 'Existing user must not be recreated');
    } finally {
        axios.get = originalAxiosGet;
        User.findByEmail = originalFindByEmail;
        User.create = originalCreate;
        User.update = originalUpdate;
    }
});

test('Google Auth Backend: Valid ID Token creates new account when user does not exist', async () => {
    const originalAxiosGet = axios.get;
    const originalFindByEmail = User.findByEmail;
    const originalCreate = User.create;

    let createdUserData = null;

    try {
        axios.get = async (url) => {
            if (url.includes('tokeninfo')) {
                return {
                    data: {
                        aud: EXPECTED_CLIENT_ID,
                        email: 'newuser@hangbug.com',
                        email_verified: true,
                        name: 'New Coder',
                        picture: 'https://hangbug.com/new.png'
                    }
                };
            }
            throw new Error('Unexpected URL: ' + url);
        };

        User.findByEmail = async () => null;

        User.create = async (name, email, password, role, avatar, isVerified) => {
            createdUserData = { name, email, password, role, avatar, isVerified };
            return {
                id: 'new_user_456',
                name,
                email,
                role,
                avatar,
                isVerified,
                createdAt: new Date()
            };
        };

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { credential: 'valid-id-token' } };
        const res = {
            cookie: () => {},
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 200);
        assert.equal(jsonBody.success, true);
        assert.equal(jsonBody.user.id, 'new_user_456');
        assert.equal(jsonBody.user.email, 'newuser@hangbug.com');
        assert.ok(createdUserData, 'User.create must be called');
        assert.equal(createdUserData.isVerified, true, 'Created user must be marked verified');
        assert.ok(createdUserData.password.length > 20, 'Created user must have strong hashed password');
    } finally {
        axios.get = originalAxiosGet;
        User.findByEmail = originalFindByEmail;
        User.create = originalCreate;
    }
});

test('Google Auth Backend: Access Token client mismatch is rejected with 401', async () => {
    const originalAxiosGet = axios.get;
    try {
        axios.get = async (url) => {
            if (url.includes('tokeninfo')) {
                return {
                    data: {
                        aud: 'wrong-client.apps.googleusercontent.com',
                        azp: 'wrong-client.apps.googleusercontent.com',
                        email: 'user@example.com',
                        email_verified: 'true'
                    }
                };
            }
            throw new Error('Unexpected URL: ' + url);
        };

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { token: 'mock-access-token' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 401);
        assert.equal(jsonBody.success, false);
        assert.ok(jsonBody.message.includes('client mismatch'));
    } finally {
        axios.get = originalAxiosGet;
    }
});

test('Google Auth Backend: isDemo is blocked in production environment', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    try {
        process.env.NODE_ENV = 'production';

        let statusCode = null;
        let jsonBody = null;
        const req = { body: { isDemo: true, email: 'fake@example.com' } };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { jsonBody = data; return res; }
        };

        await googleLogin(req, res);
        assert.equal(statusCode, 403);
        assert.equal(jsonBody.success, false);
        assert.ok(jsonBody.message.includes('Demo mode is not available in production'));
    } finally {
        if (originalNodeEnv !== undefined) {
            process.env.NODE_ENV = originalNodeEnv;
        } else {
            delete process.env.NODE_ENV;
        }
    }
});
