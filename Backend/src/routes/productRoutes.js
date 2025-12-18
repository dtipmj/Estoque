import { Router } from "express";
import {
  createProductController,
  listProductsController,
  updateProductController,
  deleteProductController,
  getProductByBarcodeController,
} from "../controllers/productController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/barcode", authRequired, getProductByBarcodeController);

router.get("/", authRequired, requireRole("admin", "super_admin", "supervisor"), listProductsController);
router.post("/", authRequired, requireRole("admin", "super_admin", "supervisor"), createProductController);
router.put("/:id", authRequired, requireRole("admin", "super_admin", "supervisor"), updateProductController);
router.delete("/:id", authRequired, requireRole("admin", "super_admin", "supervisor"), deleteProductController);

export default router;
