import { Router } from "express";

import {
  getMyProfile,
  getUserProfileById,
  updateMyProfile,
} from "../controllers/profile.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.get("/users/:userId", getUserProfileById);

export default router;