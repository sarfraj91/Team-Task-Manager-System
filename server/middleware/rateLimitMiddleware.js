const rateLimit = require("express-rate-limit")

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please wait a few minutes and try again."
  }
})

module.exports = {
  authRateLimiter
}

