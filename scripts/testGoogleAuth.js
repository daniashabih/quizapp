const dotenv = require('dotenv');
dotenv.config();
const app = require('../api/index');

async function runGoogleAuthTests() {
    console.log('====================================================');
    console.log('       GOOGLE OAUTH AUTHENTICATION TEST SUITE       ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    const server = app.listen(5679);
    const baseUrl = 'http://localhost:5679/api';

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
        // TEST 1: Missing Token / Body Rejection
        console.log('--- 1. Testing Missing Google Token Rejection ---');
        const emptyRes = await fetch(`${baseUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const emptyData = await emptyRes.json();
        assert(emptyRes.status === 400 && emptyData.success === false, 'Rejects empty Google auth request (400)');

        // TEST 2: Invalid Google ID Token Rejection
        console.log('\n--- 2. Testing Invalid Google ID Token Rejection ---');
        const invalidRes = await fetch(`${baseUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: 'invalid_dummy_google_jwt_token_123' })
        });
        const invalidData = await invalidRes.json();
        assert(invalidRes.status === 401 && invalidData.success === false, 'Rejects invalid Google token (401)');

        // TEST 3: Instant Demo Google Authentication (New User Creation)
        console.log('\n--- 3. Testing Google Auth New User Creation & Cookie ---');
        const demoEmail = `google_tester_${Date.now()}@hangbug.dev`;
        const demoName = 'Google Test User';
        const demoAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

        const demoRes = await fetch(`${baseUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isDemo: true,
                email: demoEmail,
                name: demoName,
                avatar: demoAvatar
            })
        });
        const demoData = await demoRes.json();
        const setCookieHeader = demoRes.headers.get('set-cookie') || '';
        const authCookie = setCookieHeader.split(';')[0];

        assert(demoRes.status === 200, 'Google auth returns HTTP 200 OK');
        assert(demoData.success === true, 'Google auth returns success: true');
        assert(demoData.user && demoData.user.email === demoEmail, 'User created with Google email');
        assert(demoData.user.name === demoName, 'User created with Google name');
        assert(demoData.user.avatar === demoAvatar, 'User created with Google avatar');
        assert(demoData.user.isVerified === true, 'Google user marked as isVerified: true');
        assert(demoData.user.password === undefined, 'Password is NEVER exposed in response');
        assert(setCookieHeader.includes('token='), 'HttpOnly JWT cookie is set on response');

        // TEST 4: Existing Google User Login (Idempotent / Upsert)
        console.log('\n--- 4. Testing Subsequent Google Login (Existing User) ---');
        const loginAgainRes = await fetch(`${baseUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                isDemo: true,
                email: demoEmail,
                name: demoName,
                avatar: demoAvatar
            })
        });
        const loginAgainData = await loginAgainRes.json();
        assert(loginAgainRes.status === 200, 'Subsequent Google login returns HTTP 200 OK');
        assert(loginAgainData.user.id === demoData.user.id, 'Returns existing user ID without creating duplicate record');

        // TEST 5: Verify Session with /api/auth/me
        console.log('\n--- 5. Testing /api/auth/me with Google Auth Session Cookie ---');
        const meRes = await fetch(`${baseUrl}/auth/me`, {
            headers: { Cookie: authCookie }
        });
        const meData = await meRes.json();
        assert(meRes.status === 200, 'GET /api/auth/me authenticated successfully');
        assert(meData.user && meData.user.email === demoEmail, '/api/auth/me returns Google user info');

    } catch (err) {
        console.error('Test execution error:', err);
        failed++;
    } finally {
        server.close(() => {
            console.log('\n====================================================');
            console.log(`TOTAL GOOGLE AUTH TESTS PASSED: ${passed}`);
            console.log(`TOTAL GOOGLE AUTH TESTS FAILED: ${failed}`);
            console.log('====================================================\n');
            process.exit(failed > 0 ? 1 : 0);
        });
    }
}

runGoogleAuthTests();
