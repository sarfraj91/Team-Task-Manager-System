const { body } = require("express-validator")

const requestRegisterOtpValidation = [
  body("name").trim().isLength({ min: 2, max: 60 }).withMessage("Name must be 2 to 60 characters"),
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("role").isIn(["admin", "member"]).withMessage("Choose either admin or member"),
  body("workspaceName")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Workspace name must be 2 to 80 characters"),
  body("teamCode")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[A-Z0-9-]{6,20}$/i)
    .withMessage("Enter a valid team code"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage("Password must include uppercase, lowercase, and a number"),
  body().custom((value) => {
    if (value.role === "admin" && !value.workspaceName) {
      throw new Error("Workspace name is required for admin signup")
    }

    if (value.role === "member" && !value.teamCode) {
      throw new Error("Team code is required for member signup")
    }

    return true
  })
]

const verifyRegisterOtpValidation = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("otp")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Verification code must be 6 digits")
]

const resendRegisterOtpValidation = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail()
]

const loginValidation = [
  body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
]

module.exports = {
  loginValidation,
  requestRegisterOtpValidation,
  resendRegisterOtpValidation,
  verifyRegisterOtpValidation
}
