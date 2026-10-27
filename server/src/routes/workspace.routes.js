import { Router } from "express";

import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../controllers/workspace.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication
router.use(verifyJWT);

// Workspace management
router.post("/", createWorkspace);
router.get("/", getWorkspaces);
router.get("/:workspaceId", getWorkspaceById);
router.patch("/:workspaceId", updateWorkspace);
router.delete("/:workspaceId", deleteWorkspace);

// Workspace members
router.post("/:workspaceId/members", addWorkspaceMember);
router.patch("/:workspaceId/members/:memberId/role", updateWorkspaceMemberRole);
router.delete("/:workspaceId/members/:memberId", removeWorkspaceMember);

export default router;
