const Workspace = require("../models/Workspace")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const workspaceMiddleware = asyncHandler(async (req, _res, next) => {
  if (!req.workspaceId) {
    throw new ApiError(403, "No active workspace found for this session")
  }

  const workspace = await Workspace.findOne({
    _id: req.workspaceId,
    members: req.user._id
  }).select("_id name teamCode createdBy members projects")

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this workspace")
  }

  req.workspace = workspace
  next()
})

module.exports = workspaceMiddleware
