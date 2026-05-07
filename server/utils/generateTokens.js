const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const env = require("../config/env")

const getWorkspaceId = (user) =>
  user?.workspace?._id?.toString?.() || user?.workspace?.toString?.() || undefined

const createAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      userId: user._id.toString(),
      workspaceId: getWorkspaceId(user),
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn
    }
  )

const createRefreshToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      userId: user._id.toString()
    },
    env.jwtRefreshSecret,
    {
      expiresIn: env.jwtRefreshExpiresIn
    }
  )

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex")

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production" || env.cookieSecure,
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/"
})

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, getRefreshCookieOptions())
}

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", getRefreshCookieOptions())
}

module.exports = {
  clearRefreshCookie,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshCookie
}
