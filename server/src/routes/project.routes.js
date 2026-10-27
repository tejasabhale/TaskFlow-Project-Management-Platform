import { Router } from "express";

import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication
router.use(verifyJWT);

// Project management
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.patch("/:projectId", updateProject);
router.delete("/:projectId", deleteProject);

export default router;
