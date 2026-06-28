import { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,
  resendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/resend-otp", resendOtp);

export default router;
