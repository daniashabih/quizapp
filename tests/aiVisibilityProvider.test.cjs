const test = require('node:test');
const assert = require('node:assert/strict');
const {
    buildMeasurement,
    getCredentials,
    getTaskResult,
    getTaskResults,
    isConfigured
} = require('../api/_services/aiVisibilityProviderService');

test('DataForSEO credentials require both server-side values', () => {
    assert.equal(isConfigured({ DATAFORSEO_LOGIN: 'login' }), false);
    assert.equal(isConfigured({ DATAFORSEO_PASSWORD: 'password' }), false);
    assert.deepEqual(
        getCredentials({ DATAFORSEO_LOGIN: ' login ', DATAFORSEO_PASSWORD: ' password ' }),
        { username: 'login', password: 'password' }
    );
});

test('provider task helpers preserve model lists and reject failed tasks', () => {
    const payload = {
        status_code: 20000,
        tasks: [{ status_code: 20000, result: [{ model_name: 'gpt-test' }, { model_name: 'gemini-test' }] }]
    };
    assert.equal(getTaskResults(payload, 'model list').length, 2);
    assert.equal(getTaskResult(payload, 'model list').model_name, 'gpt-test');
    assert.throws(() => getTaskResult({
        status_code: 20000,
        tasks: [{ status_code: 40100, status_message: 'Unauthorized', result: [] }]
    }, 'live query'), /Unauthorized/);
});

test('measurement reports only Hangbug mentions and cited Hangbug pages in the sample', () => {
    const measured = buildMeasurement({
        id: 'chatgpt',
        name: 'ChatGPT',
        responseText: 'Hangbug offers free coding quizzes.',
        citations: [
            { title: 'Hangbug', url: 'https://www.hangbug.com/technologies' },
            { title: 'Hangbug alternate host', url: 'https://hangbug.com/certificates' },
            { title: 'External source', url: 'https://example.com/' }
        ],
        modelName: 'gpt-test',
        prompt: 'Which coding quiz sites offer certificates?',
        domain: 'www.hangbug.com',
        checkedAt: '2026-11-26T00:00:00.000Z'
    });

    assert.equal(measured.mentions, 1);
    assert.equal(measured.citedPages, 2);
    assert.equal(measured.samplesChecked, 1);
    assert.equal(measured.evidence[0].citations.length, 2);
});

test('a successfully checked response with no Hangbug evidence reports a measured zero', () => {
    const measured = buildMeasurement({
        id: 'gemini',
        name: 'Google Gemini',
        responseText: 'Try several well-known coding quiz websites.',
        citations: [{ title: 'Example', url: 'https://example.com/' }],
        modelName: 'gemini-test',
        prompt: 'Which coding quiz sites offer certificates?',
        domain: 'www.hangbug.com',
        checkedAt: '2026-11-26T00:00:00.000Z'
    });

    assert.equal(measured.mentions, 0);
    assert.equal(measured.citedPages, 0);
});
