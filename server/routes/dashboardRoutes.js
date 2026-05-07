const express = require("express")
const { getOverview } = require("../controllers/dashboardController")
const authMiddleware = require("../middleware/authMiddleware")
const workspaceMiddleware = require("../middleware/workspaceMiddleware")

const router = express.Router()

router.get("/overview", authMiddleware, workspaceMiddleware, getOverview)

module.exports = router
