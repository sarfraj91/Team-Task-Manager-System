const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require("../models/User")
const Workspace = require("../models/Workspace")
const { createWorkspaceForAdmin } = require("./workspaceService")

const legacyWorkspaceFilter = {
  $or: [{ workspace: { $exists: false } }, { workspace: null }]
}

const migrateLegacyWorkspaceData = async () => {
  const [legacyUsersCount, legacyProjectsCount, legacyTasksCount] = await Promise.all([
    User.countDocuments({
      isEmailVerified: true,
      ...legacyWorkspaceFilter
    }),
    Project.countDocuments(legacyWorkspaceFilter),
    Task.countDocuments(legacyWorkspaceFilter)
  ])

  if (!legacyUsersCount && !legacyProjectsCount && !legacyTasksCount) {
    return
  }

  let workspace = await Workspace.findOne().sort({ createdAt: 1 })

  if (!workspace) {
    const owner =
      (await User.findOne({ role: "admin", isEmailVerified: true }).sort({ createdAt: 1 })) ||
      (await User.findOne({ isEmailVerified: true }).sort({ createdAt: 1 }))

    if (!owner) {
      return
    }

    workspace = await createWorkspaceForAdmin({
      name: "Primary Workspace",
      adminId: owner._id
    })
  }

  const verifiedUsers = await User.find({ isEmailVerified: true }).select("_id workspace")
  const verifiedUserIds = verifiedUsers.map((user) => user._id)

  if (verifiedUserIds.length) {
    const existingMembers = new Set(workspace.members.map((memberId) => memberId.toString()))
    verifiedUserIds.forEach((userId) => existingMembers.add(userId.toString()))
    workspace.members = Array.from(existingMembers)
  }

  await User.updateMany(
    {
      _id: { $in: verifiedUserIds },
      ...legacyWorkspaceFilter
    },
    {
      $set: {
        workspace: workspace._id
      }
    }
  )

  await Project.updateMany(legacyWorkspaceFilter, {
    $set: {
      workspace: workspace._id
    }
  })

  await Task.updateMany(legacyWorkspaceFilter, {
    $set: {
      workspace: workspace._id
    }
  })

  const workspaceProjectIds = await Project.find({ workspace: workspace._id }).distinct("_id")
  workspace.projects = workspaceProjectIds
  await workspace.save()
}

module.exports = {
  migrateLegacyWorkspaceData
}
