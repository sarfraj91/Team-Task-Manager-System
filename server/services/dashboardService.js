const Project = require("../models/Project")
const Task = require("../models/Task")

const getAccessibleProjects = async (userId, workspaceId) =>
  Project.find({
    workspace: workspaceId,
    $or: [{ createdBy: userId }, { members: userId }]
  })
    .populate("members", "name email avatar role")
    .populate("createdBy", "name avatar")
    .populate("activityLog.actor", "name avatar")

const getDashboardOverview = async (user, workspaceId) => {
  const projects = await getAccessibleProjects(user._id, workspaceId)
  const projectIds = projects.map((project) => project._id)

  const tasks = await Task.find({
    workspace: workspaceId,
    project: { $in: projectIds }
  })
    .populate("assignedTo", "name avatar role")
    .populate("project", "title coverColor")
    .populate("createdBy", "name avatar")
    .populate("comments.author", "name avatar")
    .populate("activityLog.actor", "name avatar")
    .sort({ updatedAt: -1 })

  const now = new Date()
  const completedTasks = tasks.filter((task) => task.status === "done")
  const pendingTasks = tasks.filter((task) => task.status !== "done")
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && task.dueDate < now && task.status !== "done"
  )

  const productivity = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date()
    date.setDate(now.getDate() - (6 - index))
    const label = date.toLocaleDateString("en-US", { weekday: "short" })
    const completed = completedTasks.filter((task) => {
      const completedAt = task.updatedAt
      return completedAt.toDateString() === date.toDateString()
    }).length

    return {
      day: label,
      completed,
      active: pendingTasks.filter((task) => task.updatedAt >= date).length
    }
  })

  const statusMap = ["backlog", "todo", "in-progress", "review", "done"].map((status) => ({
    name: status,
    value: tasks.filter((task) => task.status === status).length
  }))

  const priorityMap = ["low", "medium", "high", "urgent"].map((priority) => ({
    name: priority,
    value: tasks.filter((task) => task.priority === priority).length
  }))

  const recentActivity = [
    ...projects.flatMap((project) =>
      project.activityLog.map((entry) => ({
        id: `${project._id}-${entry.createdAt.getTime()}-${entry.action}`,
        source: "project",
        title: project.title,
        message: entry.message,
        actor: entry.actor,
        createdAt: entry.createdAt
      }))
    ),
    ...tasks.flatMap((task) =>
      task.activityLog.map((entry) => ({
        id: `${task._id}-${entry.createdAt.getTime()}-${entry.action}`,
        source: "task",
        title: task.title,
        message: entry.message,
        actor: entry.actor,
        createdAt: entry.createdAt
      }))
    )
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)

  const upcomingTasks = tasks
    .filter((task) => task.dueDate && task.status !== "done")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6)

  const recentTasks = tasks.slice(0, 6)

  const memberLoad = Object.values(
    tasks.reduce((accumulator, task) => {
      if (!task.assignedTo) {
        return accumulator
      }

      const key = task.assignedTo._id.toString()
      if (!accumulator[key]) {
        accumulator[key] = {
          id: key,
          name: task.assignedTo.name,
          avatar: task.assignedTo.avatar,
          openTasks: 0,
          completedTasks: 0
        }
      }

      if (task.status === "done") {
        accumulator[key].completedTasks += 1
      } else {
        accumulator[key].openTasks += 1
      }

      return accumulator
    }, {})
  ).slice(0, 6)

  return {
    stats: {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length
    },
    productivity,
    statusDistribution: statusMap,
    priorityDistribution: priorityMap,
    recentActivity,
    upcomingTasks,
    recentTasks,
    teamSnapshot: memberLoad,
    projects
  }
}

module.exports = {
  getAccessibleProjects,
  getDashboardOverview
}
