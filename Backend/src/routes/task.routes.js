import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  myTasks,
  updateTask,
  uploadAttachment,
} from "../controllers/task.controller.js";

const router = Router();

router.get("/me", verifyJWT, myTasks);
router.get("/:taskId", verifyJWT, validateObjectId("taskId"), getTaskById);
router.patch("/:taskId", verifyJWT, validateObjectId("taskId"), updateTask);
router.delete("/:taskId", verifyJWT, validateObjectId("taskId"), deleteTask);
router.post(
  "/:taskId/attachments",
  verifyJWT,
  validateObjectId("taskId"),
  uploadAttachment,
);

export default router;
