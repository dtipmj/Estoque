import {
  listStockReport,
  listMovementReport,
} from "../models/movementModel.js";

export async function stockReportController(req, res, next) {
  try {
    const rows = await listStockReport({
      requester: req.user,   
      warehouseId: null,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function movementReportController(req, res, next) {
  try {
    const rows = await listMovementReport({
      requester: req.user,   
      warehouseId: null,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
