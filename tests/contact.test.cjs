const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const nodemailer = require('nodemailer');
const contactRoutes = require('../api/_routes/contactRoutes');
const { submitContactMessage, validateContactInput } = require('../api/_controllers/contactController');

const originalCreateTransport = nodemailer.createTransport;
const envKeys = ['EMAIL_PROVIDER', 'SMTP_HOST', 'CONTACT_EMAIL_TO', 'RESEND_API_KEY', 'SENDGRID_API_KEY', 'EMAIL_PROVIDER_API_KEY'];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

function restoreEnvironment() {
    for (const key of envKeys) {
        if (originalEnv[key] === undefined) delete process.env[key];
        else process.env[key] = originalEnv[key];
    }
}

function createResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('contact input is trimmed and rejects malformed or oversized fields', () => {
    const valid = validateContactInput({
        name: '  Ada Lovelace ',
        email: ' ada@example.com ',
        subject: ' Help ',
        message: '  I need help with my quiz. '
    });

    assert.deepEqual(valid.value, {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'Help',
        message: 'I need help with my quiz.'
    });
    assert.equal(validateContactInput({ name: 'Ada', email: 'bad', message: 'Hello, this is long enough.' }).error, 'Please enter a valid email address.');
    assert.equal(validateContactInput({ name: 'Ada', email: 'ada@example.com,other@example.com', message: 'Hello, this is long enough.' }).error, 'Please enter a valid email address.');
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', message: 'short' }).error);
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', subject: 'bad\nsubject', message: 'A sufficiently long message.' }).error);
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', subject: 'x'.repeat(151), message: 'A sufficiently long message.' }).error);
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', website: 'spam.example', message: 'A sufficiently long message.' }).error);
});

test('contact submission is sent to the configured destination and failures are not reported as success', async (t) => {
    t.after(() => {
        nodemailer.createTransport = originalCreateTransport;
        restoreEnvironment();
    });

    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp.test.invalid';
    process.env.CONTACT_EMAIL_TO = 'configured-support@example.com';
    delete process.env.RESEND_API_KEY;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.EMAIL_PROVIDER_API_KEY;

    let deliveryOptions;
    nodemailer.createTransport = () => ({
        sendMail: async (options) => {
            deliveryOptions = options;
            return { messageId: 'test-message-id' };
        }
    });

    const request = {
        body: {
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            subject: 'Quiz support',
            message: 'I need help with a quiz result.'
        }
    };
    const successResponse = createResponse();
    await submitContactMessage(request, successResponse);

    assert.equal(successResponse.statusCode, 200);
    assert.equal(successResponse.body.success, true);
    assert.equal(deliveryOptions.to, 'configured-support@example.com');
    assert.equal(deliveryOptions.replyTo, 'ada@example.com');
    assert.match(deliveryOptions.text, /Ada Lovelace/);

    nodemailer.createTransport = () => ({
        sendMail: async () => {
            const error = new Error('test delivery failure');
            error.code = 'TEST_FAILURE';
            throw error;
        }
    });

    const failureResponse = createResponse();
    await submitContactMessage(request, failureResponse);
    assert.equal(failureResponse.statusCode, 503);
    assert.equal(failureResponse.body.success, false);
});

test('POST /api/contact delivers valid submissions, rejects spam, and rate limits requests', async (t) => {
    t.after(() => {
        nodemailer.createTransport = originalCreateTransport;
        restoreEnvironment();
    });

    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp.test.invalid';
    process.env.CONTACT_EMAIL_TO = 'configured-support@example.com';
    delete process.env.RESEND_API_KEY;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.EMAIL_PROVIDER_API_KEY;

    let deliveryOptions;
    let deliveryCount = 0;
    nodemailer.createTransport = () => ({
        sendMail: async (options) => {
            deliveryOptions = options;
            deliveryCount++;
            return { messageId: 'route-test-message-id' };
        }
    });

    const app = express();
    app.use(express.json());
    app.use('/api/contact', contactRoutes);
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    t.after(() => new Promise((resolve) => server.close(resolve)));

    const url = `http://127.0.0.1:${server.address().port}/api/contact`;
    const validSubmission = {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        subject: 'Quiz support',
        message: 'Please help with my quiz result.',
        website: ''
    };

    const accepted = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validSubmission)
    });
    assert.equal(accepted.status, 200);
    assert.equal((await accepted.json()).success, true);
    assert.equal(deliveryOptions.to, 'configured-support@example.com');
    assert.equal(deliveryOptions.replyTo, 'ada@example.com');
    assert.equal(deliveryCount, 1);

    const spam = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validSubmission, website: 'spam.example' })
    });
    assert.equal(spam.status, 400);
    assert.equal(deliveryCount, 1);

    for (const body of [
        { ...validSubmission, email: 'bad' },
        { ...validSubmission, subject: 'bad\r\nBcc: other@example.com' },
        { ...validSubmission, message: 'too short' }
    ]) {
        const rejected = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        assert.equal(rejected.status, 400);
        assert.equal((await rejected.json()).success, false);
    }
    assert.equal(deliveryCount, 1);

    const rateLimited = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validSubmission)
    });
    assert.equal(rateLimited.status, 429);
    assert.equal(deliveryCount, 1);
});
