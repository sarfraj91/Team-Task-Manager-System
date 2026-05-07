const express = require("express")
const {
  addTaskComment,
  createTask,
  deleteTask,
  getBoard,
  getTaskById,
  getTasks,
  reviewTaskSubmission,
  submitTaskForReview,
  updateTask,
  uploadTaskAttachments
} = require("../controllers/taskController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const upload = require("../middleware/uploadMiddleware")
const validateRequest = require("../middleware/validateRequest")
const workspaceMiddleware = require("../middleware/workspaceMiddleware")
const {
  taskReviewValidation,
  taskSubmissionValidation,
  taskUpdateValidation,
  taskValidation
} = require("../validations/taskValidation")

const router = express.Router()

router.use(authMiddleware, workspaceMiddleware)

router.get("/", getTasks)
router.get("/board", getBoard)
router.get("/:id", getTaskById)
router.post("/", roleMiddleware("admin"), upload.array("attachments", 5), taskValidation, validateRequest, createTask)
router.post("/:id/submit", roleMiddleware("member"), taskSubmissionValidation, validateRequest, submitTaskForReview)
router.post("/:id/review", roleMiddleware("admin"), taskReviewValidation, validateRequest, reviewTaskSubmission)
router.put("/:id", taskUpdateValidation, validateRequest, updateTask)
router.delete("/:id", roleMiddleware("admin"), deleteTask)
router.post("/:id/comments", addTaskComment)
router.post("/:id/attachments", upload.array("attachments", 5), uploadTaskAttachments)

module.exports = router
