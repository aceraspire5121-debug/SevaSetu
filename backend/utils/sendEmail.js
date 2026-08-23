/**
 * Brevo (Sendinblue) Transactional Email Utility for SevaSetu
 */
const sendEmail = async (options) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'support@sevasetu.org';
  const senderName = process.env.BREVO_SENDER_NAME || 'SevaSetu Cooperative Platform';

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: options.email,
        name: options.name || 'SevaSetu User',
      },
    ],
    subject: options.subject,
    htmlContent: options.html,
  };

  if (brevoApiKey) {
    try {
      console.log(`[Brevo Email] Sending transactional email to: ${options.email}...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email via Brevo API');
      }

      console.log(`✅ [Brevo Email] Email sent successfully. MessageId: ${data.messageId || 'OK'}`);
      return { success: true, messageId: data.messageId };
    } catch (err) {
      console.error('❌ [Brevo Email Error]:', err.message);
      throw err;
    }
  } else {
    // Fallback mode when BREVO_API_KEY is not yet added in .env
    console.log('\n=============================================================');
    console.log('⚠️ [EMAIL SIMULATION MODE - BREVO_API_KEY NOT SET IN .ENV]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Reset URL / Content:\n${options.resetUrl || options.html}`);
    console.log('=============================================================\n');
    return { success: true, simulated: true };
  }
};

/**
 * Generate Responsive HTML Email Template for Password Reset
 */
const generatePasswordResetEmailHtml = ({ name, resetUrl, userEmail }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your SevaSetu Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #042f2e 0%, #0f766e 100%);
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .brand-icon {
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #fef08a;
      margin-top: 4px;
      font-weight: 700;
    }
    .content {
      padding: 40px 35px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 15px;
    }
    .message {
      font-size: 14px;
      color: #475569;
      margin-bottom: 25px;
      line-height: 1.7;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0;
    }
    .btn-reset {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 800;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
      letter-spacing: 0.2px;
    }
    .security-notice {
      background-color: #f1f5f9;
      border-left: 4px solid #0d9488;
      padding: 14px 18px;
      border-radius: 8px;
      margin: 25px 0;
      font-size: 12px;
      color: #334155;
    }
    .security-notice strong {
      color: #0f172a;
    }
    .link-backup {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .link-backup a {
      color: #0d9488;
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px 30px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
    }
    .footer-links {
      margin-top: 10px;
    }
    .footer-links a {
      color: #64748b;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="brand-icon">
        <span style="font-size: 24px;">🤝</span>
      </div>
      <h1 class="brand-title">SevaSetu</h1>
      <div class="brand-subtitle">Cooperative Home Services Platform</div>
    </div>

    <div class="content">
      <div class="greeting">Hello ${name || 'Valued User'},</div>
      
      <p class="message">
        We received a request to reset the password for your SevaSetu account associated with <strong>${userEmail}</strong>.
      </p>

      <p class="message">
        Please click the secure button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
      </p>

      <div class="btn-container">
        <a href="${resetUrl}" class="btn-reset" target="_blank">
          Reset My Password
        </a>
      </div>

      <div class="security-notice">
        <strong>🔒 Security Reminder:</strong> If you did not make this request, you can safely ignore this email. Your current password will remain unchanged and your account is secure.
      </div>

      <div class="link-backup">
        If the button above does not work, copy and paste this link into your web browser:<br>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      </div>
    </div>

    <div class="footer">
      <div>&copy; 2026 SevaSetu Cooperative Platform. All rights reserved.</div>
      <div style="margin-top: 4px;">SIH 2026 Innovation • Democratic Labour Cooperative Model</div>
      <div class="footer-links">
        <span>Helpline: 8887708757</span> • 
        <span>Support: shashwattiwari712@gmail.com</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  generatePasswordResetEmailHtml,
};
