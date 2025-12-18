import { Router } from "express";
import {
  createWarehouseController,
  listWarehousesController,
  updateWarehouseController,
  deleteWarehouseController,
} from "../controllers/warehouseController.js";
import { authRequired } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authRequired, createWarehouseController);
router.get("/", authRequired, listWarehousesController);
router.put("/:id", authRequired, updateWarehouseController);
router.delete("/:id", authRequired, deleteWarehouseController);

export default router;
