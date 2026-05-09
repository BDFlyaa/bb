import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.qq.com',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * 发送邮箱验证码
 * @param to 收件人邮箱
 * @param code 6位验证码
 */
export async function sendVerificationCode(to, code) {
  return transporter.sendMail({
    from: `"PureOcean" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'PureOcean 邮箱验证码',
    html: `
      <div style="max-width:480px;margin:0 auto;padding:24px;font-family:Arial,sans-serif">
        <h2 style="color:#00b4db">🌊 PureOcean 邮箱验证</h2>
        <p>您的验证码是：</p>
        <div style="background:#f0f9ff;padding:16px;border-radius:8px;text-align:center;margin:16px 0">
          <span style="font-size:28px;font-weight:bold;color:#0077b6;letter-spacing:4px">${code}</span>
        </div>
        <p style="color:#666;font-size:13px">验证码 5 分钟内有效，请勿转发给他人。</p>
        <p style="color:#999;font-size:12px">守护蔚蓝，共筑未来 💙</p>
      </div>
    `,
  });
}
