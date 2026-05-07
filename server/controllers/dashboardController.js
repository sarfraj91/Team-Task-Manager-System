const asyncHandler = require("../utils/asyncHandler")
const { getDashboardOverview } = require("../services/dashboardService")

const getOverview = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardOverview(req.user, req.workspaceId)

  res.json({
    success: true,
    data: dashboard
  })
})

module.exports = {
  getOverview
}
