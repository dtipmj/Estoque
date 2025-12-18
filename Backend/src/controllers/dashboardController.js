import { getDashboardSummary } from "../models/dashboardModel.js";

export async function dashboardSummaryController(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const warehouseId = isAdmin ? null : req.user?.warehouse_id || null;

    const summary = await getDashboardSummary({ warehouseId });
    res.json(summary);
  } catch (err) {
    next(err);
  }
}
