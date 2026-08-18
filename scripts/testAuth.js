const dotenv = require('dotenv');
dotenv.config();
const app = require('../api/index');

async function runAuthTests() {
    console.log('====================================================');
    console.log('         HANGBUG AUTHENTICATION TEST SUITE          ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    const server = app.listen(5678);
    const baseUrl = 'http://localhost:5678/api';

    function assert(condition, name) {
        if (condition) {
            console.log(`✅ [PASS] ${name}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${name}`);
            failed++;
        }
    }

    try {
        const testEmail = `auth_test_${Date.now()}@example.com`;
        const testPassword = 'TestPassword123';
        let authCookie = '';

        // TEST 1: Weak Password Rejection
        console.log('\n--- 1. Testing Password Validation ---');
        const weakRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Weak User', email: 'weak@example.com', password: 'weak' })
        });
        const weakData = await weakRes.json();
        assert(weakRes.status === 400 && weakData.success === false, 'Rejects password shorter than 8 characters (400)');

        const noUpperRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'No Upper', email: 'noupper@example.com', password: 'password123' })
        });
        assert(noUpperRes.status === 400, 'Rejects password without uppercase letter (400)');

        const noNumRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'No Num', email: 'nonum@example.com', password: 'PasswordUpper' })
        });
        assert(noNumRes.status === 400, 'Rejects password without number (400)');

        // TEST 2: Valid User Signup
        console.log('\n--- 2. Testing User Signup & HttpOnly Cookie ---');
        const signupRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Auth Tester', email: testEmail, password: testPassword })
        });
        const signupData = await signupRes.json();
        const signupCookieHeader = signupRes.headers.get('set-cookie') || '';

        assert(signupRes.status === 201, 'Signup returns HTTP 201 Created');
        assert(signupData.success === true, 'Signup returns success: true');
        assert(signupData.user && signupData.user.email === testEmail, 'User object returned with correct email');
        assert(signupData.user.password === undefined, 'Password is NEVER returned in response');
        assert(signupCookieHeader.includes('token='), 'Set-Cookie header includes JWT token');
        assert(signupCookieHeader.toLowerCase().includes('httponly'), 'Cookie has HttpOnly flag set');

        // TEST 3: Duplicate Email Handling
        console.log('\n--- 3. Testing Duplicate Email Handling ---');
        const dupRes = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Duplicate User', email: testEmail, password: testPassword })
        });
        const dupData = await dupRes.json();
        assert(dupRes.status === 409, 'Duplicate email returns HTTP 409 Conflict');
        assert(dupData.message === 'An account with this email already exists', 'Duplicate message matches requirement');

        // TEST 4: Login with Wrong Credentials
        console.log('\n--- 4. Testing Login Validation ---');
        const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'WrongPassword123' })
        });
        const badLoginData = await badLoginRes.json();
        assert(badLoginRes.status === 401, 'Invalid password returns HTTP 401 Unauthorized');
        assert(badLoginData.message === 'Invalid email or password', 'Invalid credentials message matches requirement');

        // TEST 5: Login with Correct Credentials
        console.log('\n--- 5. Testing Successful Login ---');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: testPassword })
        });
        const loginData = await loginRes.json();
        const setCookieHeader = loginRes.headers.get('set-cookie') || '';
        authCookie = setCookieHeader.split(';')[0]; // Extract token=...

        assert(loginRes.status === 200, 'Login returns HTTP 200 OK');
        assert(loginData.success === true, 'Login returns success: true');
        assert(loginData.user && loginData.user.role === 'user', 'Default user role is "user"');
        assert(loginData.user.password === undefined, 'Password is not present in login response');
        assert(authCookie.startsWith('token='), 'Cookie was captured for authenticated requests');

        // TEST 6: Get Current User via /api/auth/me
        console.log('\n--- 6. Testing /api/auth/me Endpoint ---');
        const meRes = await fetch(`${baseUrl}/auth/me`, {
            headers: { Cookie: authCookie }
        });
        const meData = await meRes.json();
        assert(meRes.status === 200, 'GET /api/auth/me returns HTTP 200 OK with valid cookie');
        assert(meData.user && meData.user.email === testEmail, '/api/auth/me returns authenticated user details');
        assert(meData.user.password === undefined, 'Password is not present in /api/auth/me');

        const noAuthMeRes = await fetch(`${baseUrl}/auth/me`);
        assert(noAuthMeRes.status === 401, 'GET /api/auth/me returns HTTP 401 without cookie');

        // TEST 7: Role-Based Authorization
        console.log('\n--- 7. Testing Admin Protection ---');
        const forbiddenRes = await fetch(`${baseUrl}/admin/users`, {
            headers: { Cookie: authCookie }
        });
        assert(forbiddenRes.status === 403, 'Normal user receives HTTP 403 Forbidden on /api/admin/users');

        // Login as Admin
        const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'AdminPassword123!' })
        });
        const adminCookie = (adminLoginRes.headers.get('set-cookie') || '').split(';')[0];

        const adminUsersRes = await fetch(`${baseUrl}/admin/users`, {
            headers: { Cookie: adminCookie }
        });
        const adminUsersData = await adminUsersRes.json();
        assert(adminUsersRes.status === 200, 'Admin receives HTTP 200 OK on /api/admin/users');
        assert(Array.isArray(adminUsersData.users), 'Admin receives list of users');

        // TEST 8: Logout
        console.log('\n--- 8. Testing Logout ---');
        const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
            method: 'POST',
            headers: { Cookie: authCookie }
        });
        const logoutData = await logoutRes.json();
        const logoutCookieHeader = logoutRes.headers.get('set-cookie') || '';

        assert(logoutRes.status === 200, 'Logout returns HTTP 200 OK');
        assert(logoutData.message === 'Logged out successfully', 'Logout message confirmed');
        assert(logoutCookieHeader.includes('token=;') || logoutCookieHeader.includes('Max-Age=0') || logoutCookieHeader.includes('Expires='), 'Token cookie is cleared');

    } catch (err) {
        console.error('Test execution error:', err);
        failed++;
    } finally {
        server.close(() => {
            console.log('\n====================================================');
            console.log(`TOTAL TESTS PASSED: ${passed}`);
            console.log(`TOTAL TESTS FAILED: ${failed}`);
            console.log('====================================================\n');
            process.exit(failed > 0 ? 1 : 0);
        });
    }
}

runAuthTests();
