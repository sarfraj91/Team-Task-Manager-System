const multer = require("multer")
const ApiError = require("../utils/ApiError")

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new ApiError(422, "Avatar must be a JPG, PNG, or WEBP image"))
    }

    callback(null, true)
  }
})

module.exports = upload
