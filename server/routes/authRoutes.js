const express = require("express")
const {
  getCurrentUser,
  login,
  logout,
  requestRegisterOtp,
  refreshSession,
  resendRegisterOtp,
  verifyRegisterOtp
} = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const { authRateLimiter } = require("../middleware/rateLimitMiddleware")
const validateRequest = require("../middleware/validateRequest")
const {
  loginValidation,
  requestRegisterOtpValidation,
  resendRegisterOtpValidation,
  verifyRegisterOtpValidation
} = require("../validations/authValidation")

const router = express.Router()

router.post(
  "/register/request-otp",
  authRateLimiter,
  requestRegisterOtpValidation,
  validateRequest,
  requestRegisterOtp
)
router.post(
  "/register/verify-otp",
  authRateLimiter,
  verifyRegisterOtpValidation,
  validateRequest,
  verifyRegisterOtp
)
router.post(
  "/register/resend-otp",
  authRateLimiter,
  resendRegisterOtpValidation,
  validateRequest,
  resendRegisterOtp
)
router.post("/login", authRateLimiter, loginValidation, validateRequest, login)
router.post("/logout", logout)
router.get("/refresh", authRateLimiter, refreshSession)
router.get("/me", authMiddleware, getCurrentUser)

module.exports = router
