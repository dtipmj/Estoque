import { Router } from "express";
import { authRequired } from "../middlewares/authMiddleware.js";
import {
  listExitOrdersController,
  signExitOrderController,
} from "../controllers/exitOrderController.js";

const router = Router();

router.get("/", authRequired, listExitOrdersController);
router.post("/:id/assinar", authRequired, signExitOrderController);

export default router;
