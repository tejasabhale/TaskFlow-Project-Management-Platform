import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Authentication
router.use(verifyJWT);

// Task management
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
