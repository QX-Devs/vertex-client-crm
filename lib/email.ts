import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'aivertex.noreply@gmail.com';
  const pass = process.env.SMTP_PASS || 'bdmfwweubyximevh';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

const FROM_HEADER = process.env.SMTP_FROM || '"Vertex CRM" <aivertex.noreply@gmail.com>';

export async function sendLoginCodeEmail(
  to: string,
  code: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();

    const greeting = userName ? `Hello ${userName},` : 'Hello,';

    const html = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 28px; }
          .logo { font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .code-box { background: #ecfdf5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
          .code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #047857; font-family: monospace; }
          .hint { font-size: 13px; color: #64748b; margin-top: 8px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VERTEX CRM</div>
            <div class="subtitle">Client Portal Login Code</div>
          </div>
          <p>${greeting}</p>
          <p>Use the 6-digit verification code below to sign in to your Vertex Client Portal:</p>
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="hint">Expires in 10 minutes</div>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you did not request this login code, you can safely ignore this email.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Vertex Automation Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to,
      subject: `${code} is your Vertex CRM Login Code`,
      text: `${greeting}\n\nYour Vertex CRM login code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending login code email:', error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();

    const greeting = userName ? `Hello ${userName},` : 'Hello,';

    const html = `
      <!DOCTYPE html>
      <html dir="ltr" lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { text-align: center; margin-bottom: 28px; }
          .logo { font-size: 26px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
          .code-box { background: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
          .code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #b45309; font-family: monospace; }
          .hint { font-size: 13px; color: #64748b; margin-top: 8px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">VERTEX CRM</div>
            <div class="subtitle">Password Reset Request</div>
          </div>
          <p>${greeting}</p>
          <p>We received a request to reset your password for the Vertex Client Portal. Use the verification code below to set a new password:</p>
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="hint">Expires in 10 minutes</div>
          </div>
          <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Vertex Automation Platform. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to,
      subject: `${code} is your Vertex CRM Password Reset Code`,
      text: `${greeting}\n\nYour Vertex CRM password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error?.message || 'Failed to send email' };
  }
}
