const express = require("express")
const avatarUpload = require("../middleware/avatarUploadMiddleware")
const authMiddleware = require("../middleware/authMiddleware")
const validateRequest = require("../middleware/validateRequest")
const workspaceMiddleware = require("../middleware/workspaceMiddleware")
const { getTeamMembers, updateProfile } = require("../controllers/userController")
const { updateProfileValidation } = require("../validations/userValidation")

const router = express.Router()

router.use(authMiddleware, workspaceMiddleware)

router.get("/team", getTeamMembers)
router.put(
  "/profile",
  avatarUpload.single("avatar"),
  updateProfileValidation,
  validateRequest,
  updateProfile
)

module.exports = router
