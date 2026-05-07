const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require("../models/User")
const { buildActivity } = require("../services/activityService")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const parseMembers = (members) => {
  if (!members) {
    return []
  }

  if (Array.isArray(members)) {
    return members
  }

  try {
    return JSON.parse(members)
  } catch (_error) {
    return String(members)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

const findAccessibleProject = (projectId, userId, workspaceId) =>
  Project.findOne({
    _id: projectId,
    workspace: workspaceId,
    $or: [{ createdBy: userId }, { members: userId }]
  })
    .populate("members", "name email avatar role")
    .populate("createdBy", "name email avatar role")
    .populate("activityLog.actor", "name avatar")

const resolveMemberIds = async ({ members, currentUserId, workspace }) => {
  const requestedIds = [...new Set([currentUserId.toString(), ...parseMembers(members)])]
  const workspaceMemberIds = new Set(workspace.members.map((memberId) => memberId.toString()))
  const invalidMemberId = requestedIds.find((memberId) => !workspaceMemberIds.has(memberId))

  if (invalidMemberId) {
    throw new ApiError(422, "Choose only members from the current workspace")
  }

  const existingMembers = await User.find({
    _id: { $in: requestedIds },
    isEmailVerified: true
  }).select("_id")

  if (existingMembers.length !== requestedIds.length) {
    throw new ApiError(422, "Choose only valid verified members for the project")
  }

  return existingMembers.map((member) => member._id)
}

const getProjects = asyncHandler(async (req, res) => {
  const { search, status } = req.query
  const filters = [
    {
      workspace: req.workspaceId
    },
    {
      $or: [{ createdBy: req.user._id }, { members: req.user._id }]
    }
  ]

  if (search) {
    filters.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    })
  }

  if (status) {
    filters.push({ status })
  }

  const projects = await Project.find({ $and: filters })
    .populate("members", "name email avatar role")
    .populate("createdBy", "name email avatar role")
    .populate("activityLog.actor", "name avatar")
    .sort({ updatedAt: -1 })

  const projectIds = projects.map((project) => project._id)
  const relatedTasks = await Task.find({
    workspace: req.workspaceId,
    project: { $in: projectIds }
  }).select("project status dueDate")

  const projectSummary = relatedTasks.reduce((accumulator, task) => {
    const projectId = task.project.toString()

    if (!accumulator[projectId]) {
      accumulator[projectId] = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      }
    }

    accumulator[projectId].totalTasks += 1

    if (task.status === "done") {
      accumulator[projectId].completedTasks += 1
    }

    if (["todo", "in-progress", "review"].includes(task.status)) {
      accumulator[projectId].inProgressTasks += 1
    }

    if (task.dueDate && task.dueDate < new Date() && task.status !== "done") {
      accumulator[projectId].overdueTasks += 1
    }

    return accumulator
  }, {})

  res.json({
    success: true,
    data: projects.map((project) => ({
      ...project.toJSON(),
      summary: projectSummary[project._id.toString()] || {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      }
    }))
  })
})

const getProjectById = asyncHandler(async (req, res) => {
  const project = await findAccessibleProject(req.params.id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const tasks = await Task.find({
    workspace: req.workspaceId,
    project: project._id
  })
    .populate("assignedTo", "name avatar role")
    .populate("createdBy", "name avatar")
    .sort({ position: 1, updatedAt: -1 })

  const analytics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "done").length,
    activeTasks: tasks.filter((task) => task.status === "in-progress").length,
    reviewTasks: tasks.filter((task) => task.status === "review").length,
    overdueTasks: tasks.filter(
      (task) => task.dueDate && task.dueDate < new Date() && task.status !== "done"
    ).length
  }

  res.json({
    success: true,
    data: {
      ...project.toJSON(),
      analytics,
      tasks
    }
  })
})

const createProject = asyncHandler(async (req, res) => {
  const members = await resolveMemberIds({
    members: req.body.members,
    currentUserId: req.user._id,
    workspace: req.workspace
  })

  const project = await Project.create({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || "active",
    coverColor: req.body.coverColor,
    createdBy: req.user._id,
    workspace: req.workspaceId,
    members,
    activityLog: [
      buildActivity({
        actor: req.user._id,
        action: "project_created",
        message: `${req.user.name} created the project`,
        targetType: "project"
      })
    ]
  })

  req.workspace.projects = Array.from(
    new Set([...req.workspace.projects.map((projectId) => projectId.toString()), project._id.toString()])
  )
  await req.workspace.save()

  const populatedProject = await findAccessibleProject(project._id, req.user._id, req.workspaceId)

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: populatedProject
  })
})

const updateProject = asyncHandler(async (req, res) => {
  const project = await findAccessibleProject(req.params.id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const fields = ["title", "description", "status", "coverColor"]
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field]
    }
  })

  if (req.body.members !== undefined) {
    project.members = await resolveMemberIds({
      members: req.body.members,
      currentUserId: req.user._id,
      workspace: req.workspace
    })
  }

  project.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "project_updated",
      message: `${req.user.name} updated project details`,
      targetType: "project"
    })
  )

  await project.save()

  const refreshedProject = await findAccessibleProject(project._id, req.user._id, req.workspaceId)

  res.json({
    success: true,
    message: "Project updated successfully",
    data: refreshedProject
  })
})

const deleteProject = asyncHandler(async (req, res) => {
  const project = await findAccessibleProject(req.params.id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  await Task.deleteMany({
    workspace: req.workspaceId,
    project: project._id
  })
  await project.deleteOne()

  req.workspace.projects = req.workspace.projects.filter(
    (projectId) => projectId.toString() !== project._id.toString()
  )
  await req.workspace.save()

  res.json({
    success: true,
    message: "Project and related tasks deleted successfully"
  })
})

module.exports = {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
}
