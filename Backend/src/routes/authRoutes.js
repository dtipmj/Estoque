import { Router } from "express";
import { register, login, inviteUser, setPassword } from "../controllers/authController.js";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", authRequired, requireRole("admin", "super_admin"), register);
router.post("/login", login);

router.post("/invite", authRequired, requireRole("admin", "super_admin"), inviteUser);
router.post("/set-password", setPassword);

export default router;
