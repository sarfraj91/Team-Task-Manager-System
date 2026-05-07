const buildActivity = ({ actor, action, message, targetType = "task" }) => ({
  actor,
  action,
  message,
  targetType,
  createdAt: new Date()
})

module.exports = {
  buildActivity
}

