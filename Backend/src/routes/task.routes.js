import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import {
  createTask,
  deleteAttachment,
  deleteTask,
  getTaskById,
  myTasks,
  updateTask,
  uploadAttachment,
} from "../controllers/task.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/me", verifyJWT, myTasks);
router.get("/:taskId", verifyJWT, validateObjectId("taskId"), getTaskById);
router.patch("/:taskId", verifyJWT, validateObjectId("taskId"), updateTask);
router.delete("/:taskId", verifyJWT, validateObjectId("taskId"), deleteTask);
router.post(
  "/:taskId/attachments",
  verifyJWT,
  upload.array("attachments", 10),
  validateObjectId("taskId"),
  uploadAttachment,
);
router.delete(
  "/:taskId/attachments/:attachmentId",
  verifyJWT,
  validateObjectId("taskId"),
  validateObjectId("attachmentId"),
  deleteAttachment,
);

export default router;
