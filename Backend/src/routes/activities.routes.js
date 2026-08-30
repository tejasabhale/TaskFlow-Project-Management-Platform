import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import {
  getProjectActivities,
  getTaskActivities,
  getWorkspaceActivities,
} from "../controllers/activity.controller.js";

const router = Router();

router.get(
  "/workspace/:workspaceId",
  verifyJWT,
  validateObjectId("projectId"),
  getWorkspaceActivities,
);

router.get(
  "/project/:projectId",
  verifyJWT,
  validateObjectId("projectId"),
  getProjectActivities,
);

router.get(
  "/task/:taskId",
  verifyJWT,
  validateObjectId("taskId"),
  getTaskActivities,
);

export default router;
