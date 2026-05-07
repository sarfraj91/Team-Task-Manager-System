const multer = require("multer")
const ApiError = require("../utils/ApiError")

const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`))
}

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(422).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file is too large"
          : error.message || "Upload failed"
    })
  }

  const statusCode = error.statusCode || 500
  const payload = {
    success: false,
    message: error.message || "Something went wrong"
  }

  if (error.details?.length) {
    payload.details = error.details
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.stack = error.stack
  }

  res.status(statusCode).json(payload)
}

module.exports = {
  errorHandler,
  notFoundHandler
}
