const test = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
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
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', message: 'short' }).error);
    assert.ok(validateContactInput({ name: 'Ada', email: 'ada@example.com', subject: 'bad\nsubject', message: 'A sufficiently long message.' }).error);
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
