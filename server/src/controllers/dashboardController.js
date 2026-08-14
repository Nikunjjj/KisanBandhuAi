import { asyncHandler } from "../utils/asyncHandler.js";
import { getDashboardSummary } from "../services/dashboardService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary(req.user);

  res.json({
    success: true,
    dashboard: summary
  });
});
