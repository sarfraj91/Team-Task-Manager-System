const jwt = require("jsonwebtoken")
const env = require("../config/env")
const User = require("../models/User")
const Workspace = require("../models/Workspace")
const { sendVerificationOtpEmail } = require("../services/emailService")
const { issueSession, loadSessionUser } = require("../services/sessionService")
const {
  createWorkspaceForAdmin,
  getWorkspaceByTeamCode
} = require("../services/workspaceService")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const { generateOtp, hashOtp } = require("../utils/otp")
const {
  clearRefreshCookie,
  hashToken
} = require("../utils/generateTokens")

const setEmailVerificationOtp = (user) => {
  const otp = generateOtp()
  user.emailVerificationOtpHash = hashOtp(otp)
  user.emailVerificationOtpExpiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000)
  return otp
}

const ensureWorkspaceJoinContext = async ({ role, workspaceName, teamCode }) => {
  if (role === "admin") {
    return {
      pendingWorkspaceName: workspaceName?.trim(),
      pendingTeamCode: undefined
    }
  }

  const workspace = await getWorkspaceByTeamCode(teamCode)

  if (!workspace) {
    throw new ApiError(404, "Team code not found")
  }

  return {
    pendingWorkspaceName: undefined,
    pendingTeamCode: workspace.teamCode
  }
}

const requestRegisterOtp = asyncHandler(async (req, res) => {
  const { name, email, password, role, workspaceName, teamCode } = req.body
  const existingVerifiedUser = await User.findOne({
    email,
    isEmailVerified: true
  })

  if (existingVerifiedUser) {
    throw new ApiError(409, "An account with this email already exists")
  }

  const workspaceContext = await ensureWorkspaceJoinContext({
    role,
    workspaceName,
    teamCode
  })

  let user = await User.findOne({ email }).select(
    "+password +emailVerificationOtpHash +emailVerificationOtpExpiresAt +pendingWorkspaceName +pendingTeamCode"
  )

  if (!user) {
    user = new User({
      name,
      email,
      password,
      role,
      isEmailVerified: false
    })
  } else {
    user.name = name
    user.password = password
    user.role = role
    user.isEmailVerified = false
  }

  user.pendingWorkspaceName = workspaceContext.pendingWorkspaceName
  user.pendingTeamCode = workspaceContext.pendingTeamCode

  const otp = setEmailVerificationOtp(user)
  await user.save()

  await sendVerificationOtpEmail({
    email: user.email,
    name: user.name,
    otp
  })

  res.status(200).json({
    success: true,
    message: "Verification code sent to your email"
  })
})

const finalizeWorkspaceAssignment = async (user) => {
  if (user.role === "admin") {
    const workspace = await createWorkspaceForAdmin({
      name: user.pendingWorkspaceName || `${user.name}'s Workspace`,
      adminId: user._id
    })

    user.workspace = workspace._id
    return workspace
  }

  const workspace = await getWorkspaceByTeamCode(user.pendingTeamCode)

  if (!workspace) {
    throw new ApiError(404, "Team code no longer exists. Ask your admin for a new code.")
  }

  workspace.members = Array.from(
    new Set([...workspace.members.map((memberId) => memberId.toString()), user._id.toString()])
  )
  await workspace.save()

  user.workspace = workspace._id
  return workspace
}

const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body
  const user = await User.findOne({ email }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt +refreshToken +pendingWorkspaceName +pendingTeamCode"
  )

  if (!user) {
    throw new ApiError(404, "No signup request was found for this email")
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "This email is already verified. Please sign in.")
  }

  if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
    throw new ApiError(422, "Request a new verification code to continue")
  }

  if (user.emailVerificationOtpExpiresAt < new Date()) {
    throw new ApiError(410, "Verification code expired. Request a new one.")
  }

  if (hashOtp(otp) !== user.emailVerificationOtpHash) {
    throw new ApiError(422, "Invalid verification code")
  }

  await finalizeWorkspaceAssignment(user)

  user.isEmailVerified = true
  user.emailVerificationOtpHash = undefined
  user.emailVerificationOtpExpiresAt = undefined
  user.pendingWorkspaceName = undefined
  user.pendingTeamCode = undefined

  const session = await issueSession(user, res)

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: session
  })
})

const resendRegisterOtp = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email }).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt"
  )

  if (!user) {
    throw new ApiError(404, "No signup request was found for this email")
  }

  if (user.isEmailVerified) {
    throw new ApiError(409, "This email is already verified. Please sign in.")
  }

  const otp = setEmailVerificationOtp(user)
  await user.save({ validateBeforeSave: false })

  await sendVerificationOtpEmail({
    email: user.email,
    name: user.name,
    otp
  })

  res.json({
    success: true,
    message: "A new verification code has been sent"
  })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email }).select("+password +refreshToken")

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password")
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before signing in")
  }

  if (!user.workspace) {
    throw new ApiError(403, "No active workspace found for this account")
  }

  const session = await issueSession(user, res)

  res.json({
    success: true,
    message: "Welcome back",
    data: session
  })
})

const refreshSession = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing")
  }

  try {
    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret)
    const user = await User.findById(decoded.userId || decoded.sub).select("+refreshToken")

    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      clearRefreshCookie(res)
      throw new ApiError(401, "Refresh token is invalid")
    }

    const session = await issueSession(user, res)

    res.json({
      success: true,
      message: "Session refreshed",
      data: session
    })
  } catch (error) {
    clearRefreshCookie(res)
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(401, "Refresh token is invalid or expired")
  }
})

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret)
      const user = await User.findById(decoded.userId || decoded.sub).select("+refreshToken")

      if (user) {
        user.refreshToken = undefined
        await user.save({ validateBeforeSave: false })
      }
    } catch (_error) {
      // Ignore invalid refresh tokens during logout and always clear the cookie.
    }
  }

  clearRefreshCookie(res)

  res.json({
    success: true,
    message: "Logged out successfully"
  })
})

const getCurrentUser = asyncHandler(async (req, res) => {
  const sessionUser = await loadSessionUser(req.user._id)

  res.json({
    success: true,
    data: sessionUser
  })
})

module.exports = {
  getCurrentUser,
  login,
  logout,
  requestRegisterOtp,
  refreshSession,
  resendRegisterOtp,
  verifyRegisterOtp
}
