const path = require("path")
const dotenv = require("dotenv")

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  uploadsDir: process.env.UPLOADS_DIR || "uploads",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "onboarding@resend.dev",
  emailFromName: process.env.EMAIL_FROM_NAME || "TaskFlow Pro",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || "taskflow-pro/avatars",
  demoAdminEmail: process.env.DEMO_ADMIN_EMAIL || "admin@taskflow.dev",
  demoAdminPassword: process.env.DEMO_ADMIN_PASSWORD || "Admin123!",
  demoMemberEmail: process.env.DEMO_MEMBER_EMAIL || "member@taskflow.dev",
  demoMemberPassword: process.env.DEMO_MEMBER_PASSWORD || "Member123!"
}

module.exports = env
