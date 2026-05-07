const express = require("express")
const {
  createWorkspace,
  getCurrentWorkspace,
  getWorkspaces,
  switchWorkspace
} = require("../controllers/workspaceController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const validateRequest = require("../middleware/validateRequest")
const workspaceMiddleware = require("../middleware/workspaceMiddleware")
const {
  createWorkspaceValidation,
  switchWorkspaceValidation
} = require("../validations/workspaceValidation")

const router = express.Router()

router.use(authMiddleware)

router.get("/", getWorkspaces)
router.post("/", roleMiddleware("admin"), createWorkspaceValidation, validateRequest, createWorkspace)
router.post("/:id/switch", switchWorkspaceValidation, validateRequest, switchWorkspace)
router.get("/current", workspaceMiddleware, getCurrentWorkspace)

module.exports = router
