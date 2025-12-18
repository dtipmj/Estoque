import { Router } from "express";
import {
  stockReportController,
  movementReportController,
} from "../controllers/reportController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/estoque", authRequired, stockReportController);
router.get("/movimentacoes", authRequired, movementReportController);

export default router;
