const jwt = require("jsonwebtoken")
const env = require("../config/env")
const User = require("../models/User")
const Workspace = require("../models/Workspace")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || ""

  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, env.jwtSecret)
    const userId = decoded.userId || decoded.sub
    const workspaceId = decoded.workspaceId
    const user = await User.findById(userId).populate("workspace", "name teamCode createdBy")

    if (!user) {
      throw new ApiError(401, "User session is no longer valid")
    }

    if (!workspaceId) {
      throw new ApiError(401, "This session does not include an active workspace")
    }

    const hasWorkspaceAccess = await Workspace.exists({
      _id: workspaceId,
      members: user._id
    })

    if (!hasWorkspaceAccess) {
      throw new ApiError(403, "You do not have access to this workspace")
    }

    req.user = user
    req.workspaceId = workspaceId
    next()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(401, "Invalid or expired access token")
  }
})

module.exports = authMiddleware
