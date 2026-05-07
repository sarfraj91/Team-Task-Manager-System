const { v2: cloudinary } = require("cloudinary")
const env = require("../config/env")
const ApiError = require("../utils/ApiError")

const isCloudinaryConfigured = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret
  })
}

const ensureCloudinaryConfigured = () => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, "Cloudinary is not configured")
  }
}

const uploadAvatar = async (file, userId) => {
  ensureCloudinaryConfigured()

  if (!file?.buffer) {
    throw new ApiError(422, "Please choose an avatar image")
  }

  const payload = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`

  return cloudinary.uploader.upload(payload, {
    folder: env.cloudinaryFolder,
    public_id: `avatar-${userId}-${Date.now()}`,
    overwrite: true,
    resource_type: "image",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
  })
}

const deleteAsset = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured) {
    return
  }

  await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image"
  })
}

module.exports = {
  deleteAsset,
  isCloudinaryConfigured,
  uploadAvatar
}
