const express = require("express")
const {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} = require("../controllers/projectController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const validateRequest = require("../middleware/validateRequest")
const workspaceMiddleware = require("../middleware/workspaceMiddleware")
const { projectValidation } = require("../validations/projectValidation")

const router = express.Router()

router.use(authMiddleware, workspaceMiddleware)

router.get("/", getProjects)
router.get("/:id", getProjectById)
router.post("/", roleMiddleware("admin"), projectValidation, validateRequest, createProject)
router.put("/:id", roleMiddleware("admin"), projectValidation, validateRequest, updateProject)
router.delete("/:id", roleMiddleware("admin"), deleteProject)

module.exports = router
