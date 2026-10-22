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
 * Resolve application base URL for generating user-facing links.
 * Prefers explicit environment variable, then production fallback or local host.
 */
function getAppBaseUrl() {
    if (process.env.APP_BASE_URL && process.env.APP_BASE_URL.trim()) {
        return process.env.APP_BASE_URL.trim().replace(/\/$/, '');
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
    }
    if (process.env.NODE_ENV === 'production') {
        return DEFAULT_PRODUCTION_URL;
    }
    return 'http://localhost:3000';
}

/**
 * Resolve sender address from environment variables.
 */
function getFromAddress() {
    return process.env.EMAIL_FROM_ADDRESS || DEFAULT_FROM_ADDRESS;
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
 * Supports Resend API (HTTP), SMTP (Nodemailer), and local development logging.
 *
 * @param {{ to: string, resetUrl: string, userName?: string }} params
 * @returns {Promise<{ delivered: boolean, provider: string, messageId?: string }>}
 */
async function sendPasswordResetEmail({ to, resetUrl, userName }) {
    const from = getFromAddress();
    const subject = 'Reset Your Hangbug Password';
    const html = renderPasswordResetHtml({ resetUrl, userName });
    const text = renderPasswordResetText({ resetUrl, userName });

    const resendApiKey = process.env.RESEND_API_KEY || (
        process.env.EMAIL_PROVIDER === 'resend' ? process.env.EMAIL_PROVIDER_API_KEY : null
    ) || (
        process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_PROVIDER_API_KEY.startsWith('re_') ? process.env.EMAIL_PROVIDER_API_KEY : null
    );

    // 1. Send via Resend HTTPS API if configured
    if (resendApiKey) {
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

            return {
                delivered: true,
                provider: 'resend',
                messageId: response.data?.id
            };
        } catch (resendError) {
            console.error('[EmailService - Resend API Error]:', resendError.response?.data || resendError.message);
            throw new Error(`Email provider error: ${resendError.response?.data?.message || resendError.message}`);
        }
    }

    // 2. Send via SMTP (Nodemailer) if configured
    if (process.env.SMTP_HOST) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS || process.env.EMAIL_PROVIDER_API_KEY
                },
                timeout: 10000
            });

            const info = await transporter.sendMail({
                from,
                to,
                subject,
                html,
                text
            });

            return {
                delivered: true,
                provider: 'smtp',
                messageId: info.messageId
            };
        } catch (smtpError) {
            console.error('[EmailService - SMTP Error]:', smtpError.message);
            throw new Error(`SMTP email delivery failed: ${smtpError.message}`);
        }
    }

    // 3. Fallback for Local Development & Testing Environments
    // If no provider is configured, do not crash local developers; log safely to console.
    if (process.env.NODE_ENV !== 'production') {
        console.log('----------------------------------------------------');
        console.log('[EmailService Local Simulation]');
        console.log(`Recipient: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('To deliver real emails, set RESEND_API_KEY or SMTP_HOST in .env');
        console.log('----------------------------------------------------');

        return {
            delivered: true,
            provider: 'simulated_dev',
            messageId: 'dev-simulated-msg-id'
        };
    }

    // In production, missing credentials should be reported clearly
    console.error('[EmailService Error]: No email provider configured. Please configure RESEND_API_KEY or SMTP_HOST in production environment.');
    throw new Error('Email service is not configured on this server.');
}

module.exports = {
    sendPasswordResetEmail,
    getAppBaseUrl,
    getFromAddress,
    renderPasswordResetHtml,
    renderPasswordResetText
};
