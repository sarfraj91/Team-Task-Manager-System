const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const activitySchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    action: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      default: "task"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const completionWorkflowSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      enum: ["idle", "pending", "approved", "reassigned"],
      default: "idle"
    },
    memberNote: {
      type: String,
      trim: true,
      maxlength: 500
    },
    submittedAt: {
      type: Date
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    adminFeedback: {
      type: String,
      trim: true,
      maxlength: 500
    },
    reviewedAt: {
      type: Date
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { _id: false }
)

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    dueDate: {
      type: Date
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true
    },
    status: {
      type: String,
      enum: ["backlog", "todo", "in-progress", "review", "done"],
      default: "todo"
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    position: {
      type: Number,
      default: 0
    },
    comments: [commentSchema],
    attachments: [attachmentSchema],
    activityLog: [activitySchema],
    completionWorkflow: {
      type: completionWorkflowSchema,
      default: () => ({ state: "idle" })
    }
  },
  {
    timestamps: true
  }
)

taskSchema.index({ title: "text", description: "text", tags: "text" })
taskSchema.index({ workspace: 1, updatedAt: -1 })

module.exports = mongoose.model("Task", taskSchema)
