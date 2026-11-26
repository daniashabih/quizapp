const { sendContactMessage } = require('../_services/emailService');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateContactInput(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'Please provide your name, a valid email address, and a message.' };
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) {
        return { error: 'Please enter a name of 1 to 100 characters.' };
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
        return { error: 'Please enter a valid email address.' };
    }
    if (subject.length > 150 || /[\r\n]/.test(subject)) {
        return { error: 'Please keep the subject under 150 characters and on one line.' };
    }
    if (message.length < 10 || message.length > 5000) {
        return { error: 'Please enter a message between 10 and 5,000 characters.' };
    }

    return { value: { name, email, subject, message } };
}

async function submitContactMessage(req, res) {
    const validation = validateContactInput(req.body);
    if (validation.error) {
        return res.status(400).json({ success: false, message: validation.error });
    }

    try {
        const result = await sendContactMessage(validation.value);
        if (!result.accepted || result.provider === 'simulated_dev') {
            return res.status(503).json({
                success: false,
                message: 'We could not send your message right now. Please email support@hangbug.com.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Your message has been sent to Hangbug support.'
        });
    } catch (error) {
        console.error('[Contact] Email delivery failed:', error.code || error.provider || 'EMAIL_DELIVERY_FAILED');
        return res.status(503).json({
            success: false,
            message: 'We could not send your message right now. Please email support@hangbug.com.'
        });
    }
}

module.exports = { submitContactMessage, validateContactInput };
