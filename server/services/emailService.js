const nodemailer = require("nodemailer");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");

let transporter;

const isEmailConfigured = Boolean(
  env.smtpHost &&
  env.smtpPort &&
  env.smtpUser &&
  env.smtpPass &&
  env.smtpFromEmail,
);

const getTransporter = () => {
  if (!isEmailConfigured) {
    throw new ApiError(503, "SMTP email service is not configured");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      // port: env.smtpPort,
      // secure: env.smtpSecure,
      port: Number(env.smtpPort),
      secure: env.smtpSecure === true || env.smtpSecure === "true",
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();
  const from = env.smtpFromName
    ? `"${env.smtpFromName}" <${env.smtpFromEmail}>`
    : env.smtpFromEmail;

  await mailer.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
};

const sendVerificationOtpEmail = async ({ email, name, otp }) => {
  const ttlMinutes = env.otpExpiresMinutes;
  const greetingName = name || "there";

  await sendMail({
    to: email,
    subject: "Verify your TaskFlow Pro account",
    text: `Hi ${greetingName}, your verification code is ${otp}. It expires in ${ttlMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">Verify your email</h2>
        <p style="margin: 0 0 16px;">Hi ${greetingName}, use the code below to finish creating your account.</p>
        <div style="margin: 24px 0; padding: 20px; border-radius: 16px; background: #eff6ff; text-align: center;">
          <div style="font-size: 30px; font-weight: 700; letter-spacing: 8px;">${otp}</div>
        </div>
        <p style="margin: 0; color: #475569;">This code expires in ${ttlMinutes} minutes.</p>
      </div>
    `,
  });
};

module.exports = {
  isEmailConfigured,
  sendVerificationOtpEmail,
};
