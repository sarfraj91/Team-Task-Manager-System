const mongoose = require("mongoose")

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
      default: "project"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const projectSchema = new mongoose.Schema(
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
      maxlength: 500
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["planning", "active", "on-hold", "completed"],
      default: "active"
    },
    coverColor: {
      type: String,
      default: "from-cyan-500/20 via-blue-500/15 to-indigo-500/10"
    },
    activityLog: [activitySchema]
  },
  {
    timestamps: true
  }
)

projectSchema.index({ title: "text", description: "text" })
projectSchema.index({ workspace: 1, updatedAt: -1 })

module.exports = mongoose.model("Project", projectSchema)
