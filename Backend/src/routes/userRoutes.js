import { Router } from "express";
import { authRequired, requireRole } from "../middlewares/authMiddleware.js";
import {
    listUsersController,
    createUserController,
    updateUserController,
    deleteUserController,
    updateOwnProfileController,
    uploadAvatarController,
    getOwnProfileController,
} from "../controllers/userController.js";

import { uploadAvatar } from "../middlewares/uploadAvatar.js";


const router = Router();

router.get("/me", authRequired, getOwnProfileController); 
router.put("/me/profile", authRequired, updateOwnProfileController);

router.post(
    "/me/avatar",
    authRequired,
    uploadAvatar.single("avatar"),
    uploadAvatarController
);

router.get("/", authRequired, requireRole("admin", "super_admin", "supervisor"), listUsersController);
router.post("/", authRequired, requireRole("admin", "super_admin"), createUserController);
router.put("/:id", authRequired, requireRole("admin", "super_admin"), updateUserController);
router.delete("/:id", authRequired, requireRole("admin", "super_admin"), deleteUserController);


export default router;