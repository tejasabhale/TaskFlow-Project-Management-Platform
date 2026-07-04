import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,
  resendOtp,
  updateAvatar,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/resend-otp", resendOtp);
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);
export default router;
