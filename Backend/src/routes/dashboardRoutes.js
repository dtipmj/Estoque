import { Router } from "express";
import { authRequired } from "../middlewares/authMiddleware.js";
import { dashboardSummaryController } from "../controllers/dashboardController.js";

const router = Router();

router.get("/resumo", authRequired, dashboardSummaryController);

export default router;
