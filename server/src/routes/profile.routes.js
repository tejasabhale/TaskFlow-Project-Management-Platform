import { Router } from "express";

import {
  getMyProfile,
  getUserProfileById,
} from "../controllers/profile.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// Logged-in user's own profile
router.get("/me", getMyProfile);

// Admin views a specific user's profile
router.get("/users/:userId", getUserProfileById);

export default router;
