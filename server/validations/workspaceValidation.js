const { body, param } = require("express-validator")

const createWorkspaceValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Workspace name must be 2 to 80 characters")
]

const switchWorkspaceValidation = [
  param("id").isMongoId().withMessage("Workspace id must be valid")
]

module.exports = {
  createWorkspaceValidation,
  switchWorkspaceValidation
}
