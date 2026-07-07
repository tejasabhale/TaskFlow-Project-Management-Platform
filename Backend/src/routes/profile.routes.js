import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  changePassword,
  deleteAvatar,
  getCurrentUser,
  updateAvatar,
  updateProfile,
} from "../controllers/profile.controller.js";

const router = Router();

router.patch("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);
router.delete("/avatar", verifyJWT, deleteAvatar);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update", verifyJWT, updateProfile);
router.patch("/change-password", verifyJWT, changePassword)

export default router;