const env = require("../config/env")
const ApiError = require("../utils/ApiError")

const isEmailConfigured = Boolean(env.resendApiKey && env.emailFrom)

const getFromAddress = () => {
  if (!env.emailFromName) {
    return env.emailFrom
  }

  return `${env.emailFromName} <${env.emailFrom}>`
}

const sendMail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured) {
    throw new ApiError(503, "Email service is not configured")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject,
      html,
      text
    })
  })

  if (!response.ok) {
    const details = await response.json().catch(() => ({}))
    throw new ApiError(
      502,
      details.message || details.error || "Email could not be sent"
    )
  }
}

const sendVerificationOtpEmail = async ({ email, name, otp }) => {
  const ttlMinutes = env.otpExpiresMinutes
  const greetingName = name || "there"

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
    `
  })
}

module.exports = {
  isEmailConfigured,
  sendVerificationOtpEmail
}
