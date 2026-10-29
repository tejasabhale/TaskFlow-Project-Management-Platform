import { Router } from "express";

import {
  forgotPassword,
  getSession,
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

// Registration and email verification
// router.post("/register", authRateLimiter, register);
router.post("/register", register);
router.post("/verify-otp", authRateLimiter, verifyOtp);
router.post("/resend-otp", authRateLimiter, resendOtp);

// Login and session management
router.post("/login", loginRateLimiter, login);
router.get("/session", getSession);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", verifyJWT, logout);

// Password reset
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPasswordLimiter, resetPassword);

export default router;
