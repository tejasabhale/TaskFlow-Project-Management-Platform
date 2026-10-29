import { Router } from "express";

import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from "../controllers/task.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

// Task management
router.post("/", createTask);
router.get("/", getTasks);

// Attachment management
router.post(
  "/:taskId/attachments",
  upload.single("file"),
  uploadTaskAttachment,
);

router.delete("/:taskId/attachments", deleteTaskAttachment);

// Keep task-specific routes after attachment routes.
router.get("/:taskId", getTaskById);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
