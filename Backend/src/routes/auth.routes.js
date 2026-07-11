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
import { upload } from "../middlewares/multer.middleware.js";
import {
  authRateLimiter,
  loginRateLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/verify-otp", authRateLimiter, verifyOtp);
router.post("/login", loginRateLimiter, login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/resend-otp", authRateLimiter, resendOtp);

// forgot pass, reset pass

export default router;
