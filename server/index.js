const compression = require("compression")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const express = require("express")
const fs = require("fs")
const helmet = require("helmet")
const morgan = require("morgan")
const path = require("path")
const connectDatabase = require("./config/db")
const env = require("./config/env")
const { errorHandler, notFoundHandler } = require("./middleware/errorMiddleware")
const sanitizeMiddleware = require("./middleware/sanitizeMiddleware")
const { migrateLegacyWorkspaceData } = require("./services/legacyWorkspaceMigrationService")
const authRoutes = require("./routes/authRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const projectRoutes = require("./routes/projectRoutes")
const taskRoutes = require("./routes/taskRoutes")
const userRoutes = require("./routes/userRoutes")
const workspaceRoutes = require("./routes/workspaceRoutes")

const app = express()
const clientBuildPath = path.resolve(__dirname, "../client/dist")
const uploadsPath = path.resolve(__dirname, "./uploads")

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = env.clientUrl
        .split(",")
        .map((origin) => origin.trim())

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true
  })
)
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(sanitizeMiddleware)
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"))
app.use("/uploads", express.static(uploadsPath))

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "TaskFlow Pro API is healthy"
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/users", userRoutes)
app.use("/api/workspaces", workspaceRoutes)


if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath))
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next()
    }

    return res.sendFile(path.join(clientBuildPath, "index.html"))
  })
}

app.use(notFoundHandler)
app.use(errorHandler)

const startServer = async () => {
  await connectDatabase()
  await migrateLegacyWorkspaceData()
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`)
  })
}

startServer().catch((error) => {
  console.error("Unable to start server", error)
  process.exit(1)
})
