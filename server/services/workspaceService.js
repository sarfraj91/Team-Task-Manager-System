const Workspace = require("../models/Workspace")
const ApiError = require("../utils/ApiError")
const { generateUniqueTeamCode } = require("../utils/generateTeamCode")

const populateWorkspace = (query) =>
  query
    .populate("createdBy", "name email avatar role")
    .populate("members", "name email avatar role bio location")
    .populate("projects", "title status coverColor updatedAt")

const getAccessibleWorkspaces = (userId) =>
  populateWorkspace(
    Workspace.find({
      members: userId
    }).sort({ createdAt: -1 })
  )

const getWorkspaceByTeamCode = (teamCode) =>
  Workspace.findOne({ teamCode: String(teamCode || "").trim().toUpperCase() })

const createWorkspaceForAdmin = async ({ name, adminId }) => {
  const teamCode = await generateUniqueTeamCode(name)

  return Workspace.create({
    name,
    teamCode,
    createdBy: adminId,
    members: [adminId],
    projects: []
  })
}

const ensureWorkspaceMembership = async ({ workspaceId, userId }) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    members: userId
  })

  if (!workspace) {
    throw new ApiError(403, "You do not have access to this workspace")
  }

  return workspace
}

module.exports = {
  createWorkspaceForAdmin,
  ensureWorkspaceMembership,
  getAccessibleWorkspaces,
  getWorkspaceByTeamCode,
  populateWorkspace
}
