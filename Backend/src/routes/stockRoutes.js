import { Router } from "express";
import {
  stockEntryController,
  stockExitController,
  stockEntryBatchController,
} from "../controllers/stockController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/entrada", authRequired, requireRole("admin", "super_admin", "supervisor"), stockEntryController);
router.post("/entrada/lote", authRequired, requireRole("admin", "super_admin", "supervisor"), stockEntryBatchController); 
router.post("/saida", authRequired, requireRole("admin", "super_admin", "supervisor"), stockExitController);

export default router;
