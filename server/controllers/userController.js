const User = require("../models/User")
const { deleteAsset, uploadAvatar } = require("../services/cloudinaryService")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const buildDefaultAvatar = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "TaskFlow User"
  )}&background=0f172a&color=f8fafc`

const getTeamMembers = asyncHandler(async (req, res) => {
  const members = await User.find({
    _id: { $in: req.workspace.members }
  })
    .select("name email avatar role bio location createdAt workspace")
    .sort({ name: 1 })

  res.json({
    success: true,
    data: members
  })
})

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+avatarPublicId")

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  let hasChanges = false

  if (req.body.name !== undefined && req.body.name !== user.name) {
    user.name = req.body.name
    hasChanges = true

    if (!user.avatarPublicId && (!user.avatar || user.avatar.includes("ui-avatars.com/api"))) {
      user.avatar = buildDefaultAvatar(req.body.name)
    }
  }

  if (req.body.bio !== undefined && req.body.bio !== user.bio) {
    user.bio = req.body.bio
    hasChanges = true
  }

  if (req.body.location !== undefined && req.body.location !== user.location) {
    user.location = req.body.location
    hasChanges = true
  }

  let previousAvatarPublicId

  if (req.file) {
    const uploadResult = await uploadAvatar(req.file, user._id)
    previousAvatarPublicId = user.avatarPublicId
    user.avatar = uploadResult.secure_url
    user.avatarPublicId = uploadResult.public_id
    hasChanges = true
  }

  if (!hasChanges) {
    throw new ApiError(422, "Add at least one change before saving your profile")
  }

  await user.save()

  if (previousAvatarPublicId && previousAvatarPublicId !== user.avatarPublicId) {
    await deleteAsset(previousAvatarPublicId)
  }

  const updatedUser = await User.findById(user._id).populate("workspace", "name teamCode createdBy")

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser
  })
})

module.exports = {
  getTeamMembers,
  updateProfile
}
