const User = require("../models/User")
const {
  createAccessToken,
  createRefreshToken,
  hashToken,
  setRefreshCookie
} = require("../utils/generateTokens")

const loadSessionUser = (userId) =>
  User.findById(userId).populate("workspace", "name teamCode createdBy")

const issueSession = async (user, res) => {
  const accessToken = createAccessToken(user)
  const refreshToken = createRefreshToken(user)

  user.refreshToken = hashToken(refreshToken)
  await user.save({ validateBeforeSave: false })
  setRefreshCookie(res, refreshToken)

  const safeUser = await loadSessionUser(user._id)

  return {
    accessToken,
    user: safeUser
  }
}

module.exports = {
  issueSession,
  loadSessionUser
}
