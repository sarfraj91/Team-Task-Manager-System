const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")

const buildDefaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "TaskFlow User"
  )}&background=0f172a&color=f8fafc`

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    avatar: {
      type: String,
      default: function setAvatar() {
        return buildDefaultAvatar(this.name)
      }
    },
    avatarPublicId: {
      type: String,
      select: false
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member"
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 240,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationOtpHash: {
      type: String,
      select: false
    },
    emailVerificationOtpExpiresAt: {
      type: Date,
      select: false
    },
    pendingWorkspaceName: {
      type: String,
      trim: true,
      maxlength: 80,
      select: false
    },
    pendingTeamCode: {
      type: String,
      trim: true,
      uppercase: true,
      select: false
    },
    refreshToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true
  }
)

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next()
  }

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password
    delete ret.refreshToken
    delete ret.avatarPublicId
    delete ret.emailVerificationOtpHash
    delete ret.emailVerificationOtpExpiresAt
    delete ret.pendingWorkspaceName
    delete ret.pendingTeamCode
    delete ret.__v
    return ret
  }
})

module.exports = mongoose.model("User", userSchema)
