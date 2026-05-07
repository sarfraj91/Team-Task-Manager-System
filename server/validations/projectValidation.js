const { body } = require("express-validator")

const projectValidation = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Project title must be 3 to 100 characters"),
  body("description")
    .optional({ values: "falsy" })
    .isLength({ max: 500 })
    .withMessage("Description can be up to 500 characters"),
  body("status")
    .optional({ values: "falsy" })
    .isIn(["planning", "active", "on-hold", "completed"])
    .withMessage("Invalid project status")
]

module.exports = {
  projectValidation
}

