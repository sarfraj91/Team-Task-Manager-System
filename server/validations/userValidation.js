const { body } = require("express-validator")

const updateProfileValidation = [
  body("name")
    .optional({ values: "undefined" })
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be 2 to 60 characters"),
  body("bio")
    .optional({ values: "undefined" })
    .trim()
    .isLength({ max: 240 })
    .withMessage("Bio can be up to 240 characters"),
  body("location")
    .optional({ values: "undefined" })
    .trim()
    .isLength({ max: 80 })
    .withMessage("Location can be up to 80 characters")
]

module.exports = {
  updateProfileValidation
}
