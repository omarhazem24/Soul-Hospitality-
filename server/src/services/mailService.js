import nodemailer from 'nodemailer';

const buildTransport = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || ''
          }
        : undefined
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = buildTransport();

const getFromAddress = () => process.env.MAIL_FROM || 'Soul Hospitality <no-reply@soulhospitality.local>';

export const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  const info = await transporter.sendMail({
    from: getFromAddress(),
    to: email,
    subject: 'Reset your Soul Hospitality password',
    html: `
      <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:32px;color:#0f172a;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
          <div style="padding:28px 28px 12px;background:linear-gradient(135deg,#283f5e,#102b5f);color:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.75;">Password recovery</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2;">Reset your password</h1>
          </div>
          <div style="padding:28px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">Hello ${String(name || 'there')},</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">We received a request to reset your Soul Hospitality account password. This secure link will expire in 1 hour.</p>
            <div style="margin:28px 0;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#f28c28;color:#ffffff;text-decoration:none;font-weight:700;">Reset Password</a>
            </div>
            <p style="margin:0 0 10px;font-size:14px;line-height:1.7;">If the button does not work, copy and paste this link into your browser:</p>
            <p style="margin:0 0 16px;font-size:13px;line-height:1.7;word-break:break-word;color:#334155;">${resetUrl}</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">If you did not request this, you can ignore this email.</p>
          </div>
        </div>
      </div>
    `
  });

  if (info.message) {
    console.log('Password reset email generated', info.message.toString());
  }

  return info;
};