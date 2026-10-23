const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Hangbug Transactional Email Service
 * Handles secure email delivery for password resets and system notifications.
 */

// Production base URL fallback
const DEFAULT_PRODUCTION_URL = 'https://hangbug.vercel.app';
const DEFAULT_FROM_ADDRESS = 'Hangbug <noreply@hangbug.com>';

/**
 * Parse RFC 5322 formatted sender string into display name and email address.
 * Example: "Hangbug <noreply@domain.com>" -> { name: "Hangbug", email: "noreply@domain.com" }
 */
function parseSender(fromStr) {
    const raw = String(fromStr || '').trim();
    const match = raw.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);
    if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: 'Hangbug', email: raw };
}

/**
 * Resolve application base URL for generating user-facing links.
 * Prefers explicit APP_BASE_URL, then production canonical domain, then preview or localhost.
 * Ensures production reset emails never generate transient deployment-hash or localhost URLs.
 */
function getAppBaseUrl() {
    if (process.env.APP_BASE_URL && process.env.APP_BASE_URL.trim()) {
        return process.env.APP_BASE_URL.trim().replace(/\/$/, '');
    }
    // In production, always default to the official canonical production domain
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
        }
        return DEFAULT_PRODUCTION_URL;
    }
    // In preview deployments (e.g. PR preview builds on Vercel)
    if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
    }
    // Other Vercel environment fallback
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
    }
    return 'http://localhost:3000';
}

/**
 * Check if an environment variable exists and has a non-empty, non-literal value
 */
function hasEnv(name) {
    const val = process.env[name];
    return Boolean(val && val !== 'undefined' && val !== 'null' && String(val).trim() !== '');
}

/**
 * Identify which transactional email provider is active based on environment variables.
 * @returns {'resend' | 'sendgrid' | 'smtp' | 'simulated' | 'none'}
 */
function detectEmailProvider() {
    if (
        hasEnv('RESEND_API_KEY') ||
        process.env.EMAIL_PROVIDER === 'resend' ||
        (hasEnv('EMAIL_PROVIDER_API_KEY') && process.env.EMAIL_PROVIDER_API_KEY.startsWith('re_'))
    ) {
        return 'resend';
    }

    if (
        hasEnv('SENDGRID_API_KEY') ||
        process.env.EMAIL_PROVIDER === 'sendgrid' ||
        (hasEnv('EMAIL_PROVIDER_API_KEY') && process.env.EMAIL_PROVIDER_API_KEY.startsWith('SG.'))
    ) {
        return 'sendgrid';
    }

    if (hasEnv('SMTP_HOST')) {
        return 'smtp';
    }

    if (process.env.NODE_ENV !== 'production') {
        return 'simulated';
    }

    return 'none';
}

/**
 * Resolve sender address from environment variables.
 * If Resend is active and no explicit EMAIL_FROM_ADDRESS is configured,
 * fall back to onboarding@resend.dev (Resend's default testing domain) to prevent immediate NXDOMAIN rejection.
 */
function getFromAddress(activeProvider) {
    if (process.env.EMAIL_FROM_ADDRESS && process.env.EMAIL_FROM_ADDRESS.trim()) {
        return process.env.EMAIL_FROM_ADDRESS.trim();
    }
    const provider = activeProvider || detectEmailProvider();
    if (provider === 'resend') {
        return 'Hangbug <onboarding@resend.dev>';
    }
    return DEFAULT_FROM_ADDRESS;
}

/**
 * Generate branded Hangbug HTML email template for password reset
 */
function renderPasswordResetHtml({ resetUrl, userName }) {
    const greeting = userName ? `Hello ${userName},` : 'Hello,';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Hangbug Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8F6F0;
      color: #1A1A1A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8F6F0;
      padding: 40px 16px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E6E1D6;
      box-shadow: 0 4px 16px rgba(25, 61, 53, 0.05);
    }
    .header {
      background-color: #193D35;
      padding: 32px 36px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #FCFAF4;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #E2D0A6;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 36px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #1A1A1A;
      margin: 0 0 16px 0;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      color: #4A4A4A;
      margin: 0 0 28px 0;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #193D35;
      color: #FCFAF4 !important;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(25, 61, 53, 0.25);
    }
    .notice {
      background-color: #FDFBF7;
      border-left: 4px solid #D19A45;
      padding: 14px 16px;
      border-radius: 6px;
      margin: 28px 0;
      font-size: 13px;
      line-height: 1.5;
      color: #63573D;
    }
    .footer {
      border-top: 1px solid #ECE7DD;
      padding: 24px 36px;
      background-color: #FAFAFA;
      font-size: 13px;
      color: #717171;
      line-height: 1.5;
    }
    .signature {
      margin-top: 16px;
      font-weight: 600;
      color: #193D35;
    }
    .tagline {
      font-size: 12px;
      color: #8C8270;
      font-style: italic;
    }
    .fallback-url {
      font-size: 11px;
      color: #888888;
      word-break: break-all;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header">
          <h1>Hangbug</h1>
          <p>Learn &bull; Test &bull; Prove</p>
        </td>
      </tr>
      <tr>
        <td class="content">
          <p class="greeting">${greeting}</p>
          <p class="message">
            We received a request to reset the password for your Hangbug account.<br>
            Click the button below to choose a new password.
          </p>
          <div class="btn-container">
            <a href="${resetUrl}" target="_blank" class="btn">Reset Password</a>
          </div>
          <div class="notice">
            <strong>Security Notice:</strong> This link expires in <strong>30 minutes</strong> and can only be used once.<br>
            If you did not request a password reset, you can safely ignore this email.
          </div>
          <div class="fallback-url">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #193D35;">${resetUrl}</a>
          </div>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <div>The Hangbug Team</div>
          <div class="tagline">Learn - Test - Prove</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `.trim();
}

/**
 * Generate plain text fallback for email clients that do not render HTML
 */
function renderPasswordResetText({ resetUrl, userName }) {
    const greeting = userName ? `Hello ${userName},` : 'Hello,';
    return `${greeting}

We received a request to reset the password for your Hangbug account.

Click the link below to choose a new password:
${resetUrl}

This link expires in 30 minutes and can only be used once.

If you did not request a password reset, you can safely ignore this email.

The Hangbug Team
Learn - Test - Prove
`.trim();
}

/**
 * Send password reset email
 * Supports Resend API (HTTP), SendGrid API (HTTP), SMTP (Nodemailer), and local simulation.
 *
 * @param {{ to: string, resetUrl: string, userName?: string }} params
 * @returns {Promise<{ accepted: boolean, provider: string, messageId?: string, deliveryStatus: string, details?: string }>}
 */
async function sendPasswordResetEmail({ to, resetUrl, userName }) {
    const provider = detectEmailProvider();
    const from = getFromAddress(provider);
    const subject = 'Reset Your Hangbug Password';
    const html = renderPasswordResetHtml({ resetUrl, userName });
    const text = renderPasswordResetText({ resetUrl, userName });

    // 1. Send via Resend HTTPS API if configured
    if (provider === 'resend') {
        const resendApiKey = process.env.RESEND_API_KEY || (
            process.env.EMAIL_PROVIDER === 'resend' ? process.env.EMAIL_PROVIDER_API_KEY : null
        ) || (
            process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_PROVIDER_API_KEY.startsWith('re_') ? process.env.EMAIL_PROVIDER_API_KEY : null
        );

        try {
            const response = await axios.post(
                'https://api.resend.com/emails',
                {
                    from,
                    to: [to],
                    subject,
                    html,
                    text
                },
                {
                    headers: {
                        Authorization: `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const messageId = response.data?.id;

            return {
                accepted: true,
                provider: 'resend',
                messageId,
                deliveryStatus: 'accepted_by_provider',
                details: 'Email request accepted by Resend API and queued for transmission.'
            };
        } catch (resendError) {
            const status = resendError.response?.status;
            const resendData = resendError.response?.data;
            const errorMsg = resendData?.message || resendError.message;
            const errorName = resendData?.name || (status ? `HTTP_${status}` : 'NETWORK_ERROR');

            let hint = '';
            if (status === 403) {
                hint = ' (Check if your sender domain is verified in Resend at https://resend.com/domains, or use EMAIL_FROM_ADDRESS="Hangbug <onboarding@resend.dev>" for account-owner testing.)';
            } else if (status === 401) {
                hint = ' (Invalid or missing RESEND_API_KEY in environment variables.)';
            }

            const err = new Error(`Resend API error [${errorName}]: ${errorMsg}${hint}`);
            err.provider = 'resend';
            err.statusCode = status || 500;
            err.code = resendData?.name || 'RESEND_DISPATCH_FAILED';
            throw err;
        }
    }

    // 2. Send via SendGrid REST API if configured
    if (provider === 'sendgrid') {
        const sendgridApiKey = process.env.SENDGRID_API_KEY || (
            process.env.EMAIL_PROVIDER === 'sendgrid' ? process.env.EMAIL_PROVIDER_API_KEY : null
        ) || (
            process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_PROVIDER_API_KEY.startsWith('SG.') ? process.env.EMAIL_PROVIDER_API_KEY : null
        );

        const parsedSender = parseSender(from);

        try {
            const response = await axios.post(
                'https://api.sendgrid.com/v3/mail/send',
                {
                    personalizations: [{ to: [{ email: to }] }],
                    from: parsedSender,
                    subject,
                    content: [
                        { type: 'text/plain', value: text },
                        { type: 'text/html', value: html }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${sendgridApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const messageId = response.headers?.['x-message-id'] || 'sendgrid-accepted';

            return {
                accepted: true,
                provider: 'sendgrid',
                messageId,
                deliveryStatus: 'accepted_by_provider',
                details: 'Email request accepted by SendGrid API and queued for transmission.'
            };
        } catch (sgError) {
            const status = sgError.response?.status;
            const sgErrors = sgError.response?.data?.errors;
            const errorMsg = sgErrors && sgErrors.length > 0 ? sgErrors.map(e => e.message).join('; ') : sgError.message;

            const err = new Error(`SendGrid API error [HTTP ${status || 500}]: ${errorMsg}`);
            err.provider = 'sendgrid';
            err.statusCode = status || 500;
            err.code = 'SENDGRID_DISPATCH_FAILED';
            throw err;
        }
    }

    // 3. Send via SMTP (Nodemailer) if configured
    if (provider === 'smtp') {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS || process.env.EMAIL_PROVIDER_API_KEY
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000
            });

            const info = await transporter.sendMail({
                from,
                to,
                subject,
                html,
                text
            });

            return {
                accepted: true,
                provider: 'smtp',
                messageId: info.messageId,
                deliveryStatus: 'accepted_by_provider',
                details: `Message relayed to SMTP server ${process.env.SMTP_HOST}.`
            };
        } catch (smtpError) {
            const err = new Error(`SMTP email delivery failed [${smtpError.code || 'SMTP_ERROR'}]: ${smtpError.message}`);
            err.provider = 'smtp';
            err.code = smtpError.code || 'SMTP_DISPATCH_FAILED';
            err.statusCode = 503;
            throw err;
        }
    }

    // 4. Non-production local simulation fallback
    if (provider === 'simulated') {
        console.log('[EmailService Diagnostic] Non-production environment: simulated delivery accepted without remote provider credentials.');
        console.log('[EmailService Diagnostic] Reset link generated successfully with path /reset-password?token=[REDACTED]');

        return {
            accepted: true,
            provider: 'simulated_dev',
            messageId: 'dev-simulated-msg-id',
            deliveryStatus: 'simulated_local',
            details: 'Email dispatch simulated locally in development mode.'
        };
    }

    // 5. In production, missing credentials must be explicitly reported
    const missingErr = new Error('No transactional email provider is configured. Configure RESEND_API_KEY or SMTP_HOST in your production environment variables.');
    missingErr.provider = 'none';
    missingErr.code = 'ERR_NO_EMAIL_PROVIDER';
    missingErr.statusCode = 503;
    throw missingErr;
}

module.exports = {
    sendPasswordResetEmail,
    getAppBaseUrl,
    getFromAddress,
    parseSender,
    detectEmailProvider,
    renderPasswordResetHtml,
    renderPasswordResetText
};
