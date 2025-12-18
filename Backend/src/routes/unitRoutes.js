import { Router } from "express";
import { authRequired, requireMinRole } from "../middlewares/authMiddleware.js";
import {
  listUnitsController,
  createUnitController,
  updateUnitController,
  deleteUnitController,
} from "../controllers/unitController.js";

const router = Router();

// super_admin e admin
router.get("/", authRequired, listUnitsController);

router.post("/", authRequired, requireMinRole("admin", "super_admin"), createUnitController);
router.put("/:id", authRequired, requireMinRole("admin", "super_admin"), updateUnitController);
router.delete("/:id", authRequired, requireMinRole("admin", "super_admin"), deleteUnitController);

export default router;
