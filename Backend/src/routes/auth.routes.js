import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshAccessToken,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  authRateLimiter,
  forgotPasswordLimiter,
  loginRateLimiter,
  resetPasswordLimiter,
} from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/verify-otp", authRateLimiter, verifyOtp);
router.post("/login", loginRateLimiter, login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/resend-otp", authRateLimiter, resendOtp);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

export default router;
