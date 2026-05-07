const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require("../models/User")
const { buildActivity } = require("../services/activityService")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const { ALL_TEAM_MEMBERS } = require("../validations/taskValidation")

const parseTags = (tags) => {
  if (!tags) {
    return []
  }

  if (Array.isArray(tags)) {
    return tags
  }

  try {
    return JSON.parse(tags)
  } catch (_error) {
    return String(tags)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
}

const buildAttachments = (files, req, userId) =>
  (files || []).map((file) => ({
    name: file.originalname,
    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    size: file.size,
    mimeType: file.mimetype,
    uploadedBy: userId
  }))

const getAccessibleProjectIds = async (userId, workspaceId) =>
  Project.find({
    workspace: workspaceId,
    $or: [{ createdBy: userId }, { members: userId }]
  }).distinct("_id")

const ensureProjectAccess = async (projectId, userId, workspaceId) =>
  Project.findOne({
    _id: projectId,
    workspace: workspaceId,
    $or: [{ createdBy: userId }, { members: userId }]
  })

const isProjectMember = (project, userId) =>
  project.members.some((memberId) => memberId.toString() === String(userId))

const getTaskByIdWithRelations = (taskId, workspaceId) =>
  Task.findOne({
    _id: taskId,
    workspace: workspaceId
  })
    .populate("assignedTo", "name email avatar role")
    .populate({
      path: "project",
      select: "title coverColor members createdBy",
      populate: [
        { path: "members", select: "name email avatar role" },
        { path: "createdBy", select: "name email avatar role" }
      ]
    })
    .populate("createdBy", "name avatar")
    .populate("comments.author", "name avatar")
    .populate("attachments.uploadedBy", "name avatar")
    .populate("activityLog.actor", "name avatar")
    .populate("completionWorkflow.submittedBy", "name avatar role")
    .populate("completionWorkflow.reviewedBy", "name avatar role")

const getWorkflowSnapshot = (task) =>
  task.completionWorkflow?.toObject?.() || task.completionWorkflow || { state: "idle" }

const getProjectMemberById = async (project, userId) => {
  const members = Array.isArray(project.members) ? project.members : []
  const matchedMember = members.find((member) => member?._id?.toString() === String(userId))

  if (matchedMember) {
    return matchedMember
  }

  return User.findById(userId).select("name avatar role")
}

const buildTaskFilters = (query, accessibleProjectIds, workspaceId) => {
  const filters = {
    workspace: workspaceId,
    project: { $in: accessibleProjectIds }
  }

  if (query.project) {
    const isAccessibleProject = accessibleProjectIds.some(
      (projectId) => projectId.toString() === query.project
    )
    filters.project = isAccessibleProject ? query.project : { $in: [] }
  }

  if (query.status) {
    filters.status = query.status
  }

  if (query.priority) {
    filters.priority = query.priority
  }

  if (query.assignedTo) {
    filters.assignedTo = query.assignedTo
  }

  if (query.mine === "true") {
    filters.assignedTo = query.currentUserId
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
      { tags: { $regex: query.search, $options: "i" } }
    ]
  }

  if (query.due === "overdue") {
    filters.dueDate = { $lt: new Date() }
    filters.status = { $ne: "done" }
  }

  if (query.due === "today") {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    filters.dueDate = { $gte: start, $lte: end }
  }

  if (query.due === "week") {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setDate(end.getDate() + 7)
    end.setHours(23, 59, 59, 999)
    filters.dueDate = { $gte: start, $lte: end }
  }

  return filters
}

const getTasks = asyncHandler(async (req, res) => {
  const accessibleProjectIds = await getAccessibleProjectIds(req.user._id, req.workspaceId)
  const filters = buildTaskFilters(
    {
      ...req.query,
      currentUserId: req.user._id
    },
    accessibleProjectIds,
    req.workspaceId
  )

  const tasks = await Task.find(filters)
    .populate("assignedTo", "name avatar role")
    .populate("project", "title coverColor")
    .populate("createdBy", "name avatar")
    .populate("comments.author", "name avatar")
    .sort({ position: 1, updatedAt: -1 })

  res.json({
    success: true,
    data: {
      tasks,
      summary: {
        total: tasks.length,
        completed: tasks.filter((task) => task.status === "done").length,
        pending: tasks.filter((task) => task.status !== "done").length,
        overdue: tasks.filter(
          (task) => task.dueDate && task.dueDate < new Date() && task.status !== "done"
        ).length
      }
    }
  })
})

const getBoard = asyncHandler(async (req, res) => {
  const accessibleProjectIds = await getAccessibleProjectIds(req.user._id, req.workspaceId)
  const filters = buildTaskFilters(
    {
      ...req.query,
      currentUserId: req.user._id
    },
    accessibleProjectIds,
    req.workspaceId
  )

  const tasks = await Task.find(filters)
    .populate("assignedTo", "name avatar role")
    .populate("project", "title coverColor")
    .sort({ position: 1, updatedAt: -1 })

  const columns = ["backlog", "todo", "in-progress", "review", "done"].reduce(
    (accumulator, status) => {
      accumulator[status] = tasks.filter((task) => task.status === status)
      return accumulator
    },
    {}
  )

  res.json({
    success: true,
    data: {
      columns
    }
  })
})

const getTaskById = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  res.json({
    success: true,
    data: task
  })
})

const createTask = asyncHandler(async (req, res) => {
  const project = await ensureProjectAccess(req.body.project, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(404, "Project not found or inaccessible")
  }

  const assignToAllMembers = req.body.assignedTo === ALL_TEAM_MEMBERS

  if (
    req.body.assignedTo &&
    !assignToAllMembers &&
    !isProjectMember(project, req.body.assignedTo)
  ) {
    throw new ApiError(422, "Assignee must be a member of the selected project")
  }

  const basePosition = await Task.countDocuments({
    workspace: req.workspaceId,
    project: project._id,
    status: req.body.status || "todo"
  })

  const assigneeIds = assignToAllMembers
    ? project.members.map((memberId) => memberId.toString())
    : [req.body.assignedTo || undefined]

  const createdTasks = []

  for (const [index, assigneeId] of assigneeIds.entries()) {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || undefined,
      assignedTo: assigneeId,
      createdBy: req.user._id,
      project: project._id,
      workspace: req.workspaceId,
      status: req.body.status || "todo",
      tags: parseTags(req.body.tags),
      position: basePosition + index,
      attachments: buildAttachments(req.files, req, req.user._id),
      activityLog: [
        buildActivity({
          actor: req.user._id,
          action: "task_created",
          message: `${req.user.name} created the task`
        })
      ]
    })

    createdTasks.push(task)
  }

  project.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "task_added",
      message: `${req.user.name} added ${req.body.title} to the project`,
      targetType: "project"
    })
  )
  await project.save()

  const populatedTasks = await Promise.all(
    createdTasks.map((task) => getTaskByIdWithRelations(task._id, req.workspaceId))
  )

  res.status(201).json({
    success: true,
    message: assignToAllMembers
      ? "Tasks created for all team members"
      : "Task created successfully",
    data: assignToAllMembers ? populatedTasks : populatedTasks[0]
  })
})

const updateTask = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  const isTaskOwner =
    task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString()

  if (req.user.role === "member" && !isTaskOwner) {
    throw new ApiError(403, "Members can only update tasks assigned to them")
  }

  const previousStatus = task.status
  let nextProject = project

  if (req.user.role === "admin") {
    if (req.body.title) {
      task.title = req.body.title
    }

    if (req.body.description !== undefined) {
      task.description = req.body.description || undefined
    }

    if (req.body.priority) {
      task.priority = req.body.priority
    }

    if (req.body.dueDate !== undefined) {
      task.dueDate = req.body.dueDate || undefined
    }

    if (req.body.status) {
      task.status = req.body.status
    }

    if (req.body.position !== undefined) {
      task.position = Number(req.body.position)
    }

    if (req.body.tags !== undefined) {
      task.tags = parseTags(req.body.tags)
    }

    if (req.body.project && req.body.project !== task.project._id.toString()) {
      nextProject = await ensureProjectAccess(req.body.project, req.user._id, req.workspaceId)

      if (!nextProject) {
        throw new ApiError(404, "Target project not found")
      }

      task.project = nextProject._id
    }

    const nextAssignee =
      req.body.assignedTo !== undefined
        ? req.body.assignedTo || undefined
        : task.assignedTo?._id?.toString() || task.assignedTo?.toString()

    if (nextAssignee && !isProjectMember(nextProject, nextAssignee)) {
      throw new ApiError(422, "Assignee must be a member of the selected project")
    }

    if (req.body.assignedTo !== undefined) {
      task.assignedTo = nextAssignee
    }
  } else if (req.body.status !== undefined) {
    if (["review", "done"].includes(req.body.status)) {
      throw new ApiError(
        403,
        "Use the submit action to send work to admin review. Members cannot mark tasks as review or done from here."
      )
    }

    task.status = req.body.status
    if (req.body.position !== undefined) {
      task.position = Number(req.body.position)
    }
  }

  const statusChanged = previousStatus !== task.status

  if (statusChanged) {
    task.activityLog.unshift(
      buildActivity({
        actor: req.user._id,
        action: "status_changed",
        message: `${req.user.name} moved the task to ${task.status.replace("-", " ")}`
      })
    )
  } else {
    task.activityLog.unshift(
      buildActivity({
        actor: req.user._id,
        action: "task_updated",
        message: `${req.user.name} updated task details`
      })
    )
  }

  await task.save()

  const refreshedTask = await getTaskByIdWithRelations(task._id, req.workspaceId)

  res.json({
    success: true,
    message: "Task updated successfully",
    data: refreshedTask
  })
})

const submitTaskForReview = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  if (!task.assignedTo || task.assignedTo._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the assigned member can submit this task for review")
  }

  if (task.status === "done") {
    throw new ApiError(422, "Completed tasks cannot be submitted again")
  }

  task.status = "review"
  task.completionWorkflow = {
    state: "pending",
    memberNote: req.body.memberNote || "",
    submittedAt: new Date(),
    submittedBy: req.user._id,
    adminFeedback: undefined,
    reviewedAt: undefined,
    reviewedBy: undefined
  }

  task.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "task_submitted_for_review",
      message: `${req.user.name} submitted the task for admin review`
    })
  )

  await task.save()

  const refreshedTask = await getTaskByIdWithRelations(task._id, req.workspaceId)

  res.json({
    success: true,
    message: "Task submitted for admin review",
    data: refreshedTask
  })
})

const reviewTaskSubmission = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  if (task.completionWorkflow?.state !== "pending" || task.status !== "review") {
    throw new ApiError(422, "This task is not waiting for admin review")
  }

  const workflowSnapshot = getWorkflowSnapshot(task)
  const feedback = req.body.adminFeedback?.trim() || ""

  if (req.body.action === "approve") {
    task.status = "done"
    task.completionWorkflow = {
      ...workflowSnapshot,
      state: "approved",
      adminFeedback: feedback || undefined,
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    }

    task.activityLog.unshift(
      buildActivity({
        actor: req.user._id,
        action: "task_completed",
        message: `${req.user.name} approved the task and marked it complete`
      })
    )
  } else {
    const nextAssignee = req.body.assignedTo

    if (!nextAssignee) {
      throw new ApiError(422, "Choose the member you want to assign next")
    }

    if (!feedback) {
      throw new ApiError(422, "Add feedback so the member knows what needs to change")
    }

    if (!isProjectMember(project, nextAssignee)) {
      throw new ApiError(422, "Reassignment target must be a member of the project")
    }

    const assignee = await getProjectMemberById(task.project, nextAssignee)

    task.assignedTo = nextAssignee
    task.status = "todo"
    task.position = await Task.countDocuments({
      workspace: req.workspaceId,
      project: project._id,
      status: "todo"
    })
    task.completionWorkflow = {
      ...workflowSnapshot,
      state: "reassigned",
      adminFeedback: feedback,
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    }

    task.activityLog.unshift(
      buildActivity({
        actor: req.user._id,
        action: "task_reassigned_after_review",
        message: `${req.user.name} reassigned the task to ${assignee?.name || "a team member"} after review`
      })
    )
  }

  await task.save()

  const refreshedTask = await getTaskByIdWithRelations(task._id, req.workspaceId)

  res.json({
    success: true,
    message:
      req.body.action === "approve"
        ? "Task approved and completed"
        : "Task reassigned with admin feedback",
    data: refreshedTask
  })
})

const deleteTask = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  await task.deleteOne()

  project.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "task_deleted",
      message: `${req.user.name} deleted ${task.title}`,
      targetType: "project"
    })
  )
  await project.save()

  res.json({
    success: true,
    message: "Task deleted successfully"
  })
})

const addTaskComment = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  if (!req.body.message) {
    throw new ApiError(422, "Comment message is required")
  }

  task.comments.push({
    author: req.user._id,
    message: req.body.message
  })
  task.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "comment_added",
      message: `${req.user.name} added a comment`
    })
  )

  await task.save()

  const refreshedTask = await getTaskByIdWithRelations(task._id, req.workspaceId)

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: refreshedTask
  })
})

const uploadTaskAttachments = asyncHandler(async (req, res) => {
  const task = await getTaskByIdWithRelations(req.params.id, req.workspaceId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  const project = await ensureProjectAccess(task.project._id, req.user._id, req.workspaceId)

  if (!project) {
    throw new ApiError(403, "You do not have access to this task")
  }

  if (!req.files?.length) {
    throw new ApiError(422, "Please attach at least one file")
  }

  task.attachments.push(...buildAttachments(req.files, req, req.user._id))
  task.activityLog.unshift(
    buildActivity({
      actor: req.user._id,
      action: "attachment_added",
      message: `${req.user.name} uploaded attachment${req.files.length > 1 ? "s" : ""}`
    })
  )

  await task.save()

  const refreshedTask = await getTaskByIdWithRelations(task._id, req.workspaceId)

  res.status(201).json({
    success: true,
    message: "Attachments uploaded successfully",
    data: refreshedTask
  })
})

module.exports = {
  addTaskComment,
  createTask,
  deleteTask,
  getBoard,
  getTaskById,
  getTasks,
  reviewTaskSubmission,
  submitTaskForReview,
  updateTask,
  uploadTaskAttachments
}
