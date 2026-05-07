const Task = require("../models/Task")
const User = require("../models/User")
const Workspace = require("../models/Workspace")
const { issueSession } = require("../services/sessionService")
const {
  createWorkspaceForAdmin,
  ensureWorkspaceMembership,
  getAccessibleWorkspaces,
  populateWorkspace
} = require("../services/workspaceService")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const getWorkspaceStats = async (workspaceId) => {
  const [projectCount, taskCount, completedTaskCount] = await Promise.all([
    Workspace.aggregate([
      { $match: { _id: workspaceId } },
      { $project: { count: { $size: "$projects" } } }
    ]),
    Task.countDocuments({ workspace: workspaceId }),
    Task.countDocuments({ workspace: workspaceId, status: "done" })
  ])

  return {
    projectCount: projectCount[0]?.count || 0,
    taskCount,
    completedTaskCount
  }
}

const getCurrentWorkspace = asyncHandler(async (req, res) => {
  const workspace = await populateWorkspace(
    Workspace.findById(req.workspaceId)
  )

  if (!workspace) {
    throw new ApiError(404, "Workspace not found")
  }

  const stats = await getWorkspaceStats(workspace._id)

  res.json({
    success: true,
    data: {
      ...workspace.toJSON(),
      stats,
      isOwner: workspace.createdBy?._id?.toString() === req.user._id.toString()
    }
  })
})

const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await getAccessibleWorkspaces(req.user._id)

  res.json({
    success: true,
    data: workspaces.map((workspace) => ({
      ...workspace.toJSON(),
      isActive: workspace._id.toString() === req.workspaceId,
      isOwner: workspace.createdBy?._id?.toString() === req.user._id.toString(),
      memberCount: workspace.members?.length || 0,
      projectCount: workspace.projects?.length || 0
    }))
  })
})

const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await createWorkspaceForAdmin({
    name: req.body.name,
    adminId: req.user._id
  })

  const user = await User.findById(req.user._id).select("+refreshToken")
  user.workspace = workspace._id

  const session = await issueSession(user, res)
  const populatedWorkspace = await populateWorkspace(Workspace.findById(workspace._id))

  res.status(201).json({
    success: true,
    message: "Workspace created successfully",
    data: {
      ...session,
      workspace: populatedWorkspace
    }
  })
})

const switchWorkspace = asyncHandler(async (req, res) => {
  const targetWorkspace = await ensureWorkspaceMembership({
    workspaceId: req.params.id,
    userId: req.user._id
  })

  const user = await User.findById(req.user._id).select("+refreshToken")
  user.workspace = targetWorkspace._id

  const session = await issueSession(user, res)
  const populatedWorkspace = await populateWorkspace(Workspace.findById(targetWorkspace._id))

  res.json({
    success: true,
    message: "Workspace switched successfully",
    data: {
      ...session,
      workspace: populatedWorkspace
    }
  })
})

module.exports = {
  createWorkspace,
  getCurrentWorkspace,
  getWorkspaces,
  switchWorkspace
}
