const { body } = require("express-validator")

const ALL_TEAM_MEMBERS = "all-team-members"

const taskValidation = [
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Task title must be 3 to 100 characters"),
  body("project").isMongoId().withMessage("A valid project id is required"),
  body("description")
    .optional({ values: "falsy" })
    .isLength({ max: 1000 })
    .withMessage("Description can be up to 1000 characters"),
  body("priority")
    .optional({ values: "falsy" })
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid task priority"),
  body("status")
    .optional({ values: "falsy" })
    .isIn(["backlog", "todo", "in-progress", "review", "done"])
    .withMessage("Invalid task status"),
  body("assignedTo")
    .optional({ values: "falsy" })
    .custom((value) => value === ALL_TEAM_MEMBERS || /^[a-f\d]{24}$/i.test(value))
    .withMessage("assignedTo must be a valid user id or all-team-members"),
  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid date")
]

const taskUpdateValidation = [
  body("title")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Task title must be 3 to 100 characters"),
  body("priority")
    .optional({ values: "falsy" })
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid task priority"),
  body("status")
    .optional({ values: "falsy" })
    .isIn(["backlog", "todo", "in-progress", "review", "done"])
    .withMessage("Invalid task status"),
  body("assignedTo")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("assignedTo must be a valid user id"),
  body("project")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("project must be a valid project id"),
  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("dueDate must be a valid date"),
  body("position")
    .optional({ values: "falsy" })
    .isInt({ min: 0 })
    .withMessage("position must be a non-negative integer")
]

const taskSubmissionValidation = [
  body("memberNote")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Submission note can be up to 500 characters")
]

const taskReviewValidation = [
  body("action")
    .trim()
    .isIn(["approve", "reassign"])
    .withMessage("Review action must be approve or reassign"),
  body("adminFeedback")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Admin feedback can be up to 500 characters"),
  body("assignedTo")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("assignedTo must be a valid user id")
]

module.exports = {
  ALL_TEAM_MEMBERS,
  taskReviewValidation,
  taskSubmissionValidation,
  taskUpdateValidation,
  taskValidation
}
