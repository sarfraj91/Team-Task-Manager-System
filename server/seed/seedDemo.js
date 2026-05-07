const connectDatabase = require("../config/db")
const env = require("../config/env")
const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require("../models/User")
const { buildActivity } = require("../services/activityService")

const upsertUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email }).select("+password")

  if (!user) {
    user = new User({ name, email, password, role })
  } else {
    user.name = name
    user.password = password
    user.role = role
  }

  user.isEmailVerified = true
  user.emailVerificationOtpHash = undefined
  user.emailVerificationOtpExpiresAt = undefined

  await user.save()
  return user
}

const seed = async () => {
  await connectDatabase()

  const admin = await upsertUser({
    name: "Ariana Patel",
    email: env.demoAdminEmail,
    password: env.demoAdminPassword,
    role: "admin"
  })

  const member = await upsertUser({
    name: "Kabir Mehta",
    email: env.demoMemberEmail,
    password: env.demoMemberPassword,
    role: "member"
  })

  const designer = await upsertUser({
    name: "Maya Shah",
    email: "maya@taskflow.dev",
    password: "Designer123!",
    role: "member"
  })

  await Task.deleteMany({ createdBy: admin._id })
  await Project.deleteMany({ createdBy: admin._id })

  const projects = await Project.insertMany([
    {
      title: "Launch Sprint",
      description: "Coordinate the public launch plan, onboarding funnel, and GTM assets.",
      createdBy: admin._id,
      members: [admin._id, member._id, designer._id],
      status: "active",
      coverColor: "from-emerald-500/20 via-cyan-500/15 to-slate-500/5",
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "project_created",
          message: "Ariana created the launch sprint project",
          targetType: "project"
        })
      ]
    },
    {
      title: "Design System 2.0",
      description: "Refresh shared primitives, motion language, and accessibility guidelines.",
      createdBy: admin._id,
      members: [admin._id, designer._id],
      status: "planning",
      coverColor: "from-fuchsia-500/20 via-violet-500/15 to-cyan-500/10",
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "project_created",
          message: "Ariana started the design system refresh",
          targetType: "project"
        })
      ]
    },
    {
      title: "Enterprise Pilot",
      description: "Prepare implementation milestones and stakeholder reporting for the next pilot.",
      createdBy: admin._id,
      members: [admin._id, member._id],
      status: "on-hold",
      coverColor: "from-amber-500/20 via-orange-500/15 to-rose-500/10",
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "project_created",
          message: "Ariana created the enterprise pilot workspace",
          targetType: "project"
        })
      ]
    }
  ])

  const [launchProject, designProject, enterpriseProject] = projects

  await Task.insertMany([
    {
      title: "Finalize launch messaging",
      description: "Polish the homepage value props and release notes before stakeholder review.",
      priority: "urgent",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      assignedTo: member._id,
      createdBy: admin._id,
      project: launchProject._id,
      status: "in-progress",
      position: 0,
      tags: ["marketing", "release"],
      comments: [
        {
          author: admin._id,
          message: "Let’s keep the headline more outcome-focused."
        }
      ],
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "task_created",
          message: "Ariana created the task"
        }),
        buildActivity({
          actor: member._id,
          action: "status_changed",
          message: "Kabir moved the task to in progress"
        })
      ]
    },
    {
      title: "Animate onboarding hero",
      description: "Add premium motion patterns to the hero and feature reveal states.",
      priority: "high",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      assignedTo: designer._id,
      createdBy: admin._id,
      project: designProject._id,
      status: "review",
      position: 0,
      tags: ["motion", "ui"],
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "task_created",
          message: "Ariana created the task"
        })
      ]
    },
    {
      title: "Draft pilot milestone deck",
      description: "Summarize phases, risk register, and success metrics for the enterprise sponsor.",
      priority: "medium",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      assignedTo: member._id,
      createdBy: admin._id,
      project: enterpriseProject._id,
      status: "todo",
      position: 0,
      tags: ["enterprise", "ops"],
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "task_created",
          message: "Ariana created the task"
        })
      ]
    },
    {
      title: "Audit spacing scale",
      description: "Verify consistency across cards, lists, drawers, and empty states.",
      priority: "low",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
      assignedTo: designer._id,
      createdBy: admin._id,
      project: designProject._id,
      status: "done",
      position: 0,
      tags: ["system", "qa"],
      activityLog: [
        buildActivity({
          actor: admin._id,
          action: "task_created",
          message: "Ariana created the task"
        }),
        buildActivity({
          actor: designer._id,
          action: "status_changed",
          message: "Maya completed the task"
        })
      ]
    }
  ])

  console.log("Demo data seeded successfully")
  console.log(`Admin: ${env.demoAdminEmail} / ${env.demoAdminPassword}`)
  console.log(`Member: ${env.demoMemberEmail} / ${env.demoMemberPassword}`)
  process.exit(0)
}

seed().catch((error) => {
  console.error("Failed to seed demo data", error)
  process.exit(1)
})
