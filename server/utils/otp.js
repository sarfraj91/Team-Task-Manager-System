const crypto = require("crypto")

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`

const hashOtp = (otp) => crypto.createHash("sha256").update(String(otp)).digest("hex")

module.exports = {
  generateOtp,
  hashOtp
}
