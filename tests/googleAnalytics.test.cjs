const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('GA4 Integration: index.html contains official gtag script and configuration', () => {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');

    // 1. Script tag check
    assert.ok(
        html.includes('https://www.googletagmanager.com/gtag/js?id=G-BSZBBFZZH0'),
        'index.html must load the Google tag script with ID G-BSZBBFZZH0'
    );

    // 2. Exact configuration snippet check
    assert.ok(
        html.includes("gtag('config', 'G-BSZBBFZZH0');"),
        "index.html must initialize gtag with config 'G-BSZBBFZZH0'"
    );

    // 3. No duplicate script tags
    const scriptMatches = html.match(/googletagmanager\.com\/gtag\/js/g);
    assert.equal(
        scriptMatches ? scriptMatches.length : 0,
        1,
        'Google Tag script must be included exactly once in index.html'
    );

    const configMatches = html.match(/gtag\(\s*['"]config['"]\s*,\s*['"]G-BSZBBFZZH0['"]\s*\)/g);
    assert.equal(
        configMatches ? configMatches.length : 0,
        1,
        'gtag config for G-BSZBBFZZH0 must be called exactly once'
    );
});

test('GA4 Integration: analytics utility handles all required events and prevents duplicates', async () => {
    // Mock browser environment
    const events = [];
    global.window = {
        location: {
            pathname: '/',
            search: '',
            href: 'https://www.hangbug.com/'
        },
        document: {
            title: 'HangBug'
        },
        gtag: (type, name, params) => {
            events.push({ type, name, params });
        }
    };
    global.document = global.window.document;

    // Dynamically import ESM analytics module
    const analytics = await import('../src/utils/analytics.js');

    assert.equal(analytics.GA_MEASUREMENT_ID, 'G-BSZBBFZZH0');
    assert.equal(analytics.GA_STREAM_ID, '16254821680');

    // Test 1: Page view tracking & duplicate prevention
    events.length = 0;
    analytics.trackPageView('/technologies', 'Select Category');
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'page_view');
    assert.equal(events[0].params.page_path, '/technologies');

    // Consecutive identical path must NOT produce duplicate event
    analytics.trackPageView('/technologies', 'Select Category');
    assert.equal(events.length, 1, 'Duplicate consecutive page_view must be suppressed');

    // New route must fire
    analytics.trackPageView('/games', 'Games Hub');
    assert.equal(events.length, 2);
    assert.equal(events[1].params.page_path, '/games');

    // Test 2: User sign-ups (No PII)
    events.length = 0;
    analytics.trackSignUp('email');
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'sign_up');
    assert.equal(events[0].params.method, 'email');
    assert.equal(events[0].params.password, undefined, 'Password must NEVER be tracked');
    assert.equal(events[0].params.email, undefined, 'Personal email must NEVER be tracked');

    // Test 3: User login (No PII)
    events.length = 0;
    analytics.trackLogin('google');
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'login');
    assert.equal(events[0].params.method, 'google');
    assert.equal(events[0].params.token, undefined, 'Tokens must NEVER be tracked');

    // Test 4: Quiz starts
    events.length = 0;
    analytics.trackQuizStart({
        category: 'React',
        session: 1,
        totalQuestions: 15
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'quiz_start');
    assert.equal(events[0].params.quiz_category, 'React');
    assert.equal(events[0].params.total_questions, 15);

    // Test 5: Quiz completions
    events.length = 0;
    analytics.trackQuizCompletion({
        category: 'React',
        session: 1,
        score: 14,
        totalQuestions: 15,
        percentage: 93,
        passed: true,
        timeTaken: 120
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'quiz_complete');
    assert.equal(events[0].params.percentage, 93);
    assert.equal(events[0].params.passed, true);

    // Test 6: Certificate generation & download
    events.length = 0;
    analytics.trackCertificateGeneration({
        category: 'React',
        percentage: 93,
        certificateId: 'HB-CERT-123456'
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'certificate_generation');
    assert.equal(events[0].params.certificate_category, 'React');
    assert.equal(events[0].params.certificate_id, 'HB-CERT-123456');

    analytics.trackCertificateDownload({
        category: 'React',
        certificateId: 'HB-CERT-123456'
    });
    assert.equal(events.length, 2);
    assert.equal(events[1].name, 'certificate_download');

    // Test 7: Games started and completed
    events.length = 0;
    analytics.trackGameStart({
        slug: 'code-puzzle',
        name: 'Code Puzzle Challenge',
        category: 'Coding'
    });
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'game_start');
    assert.equal(events[0].params.game_slug, 'code-puzzle');

    analytics.trackGameComplete({
        slug: 'code-puzzle',
        name: 'Code Puzzle Challenge',
        score: 250,
        durationSeconds: 45,
        wpm: 60,
        accuracy: 98
    });
    assert.equal(events.length, 2);
    assert.equal(events[1].name, 'game_complete');
    assert.equal(events[1].params.score, 250);
    assert.equal(events[1].params.duration_seconds, 45);

    // Cleanup globals
    delete global.window;
    delete global.document;
});
