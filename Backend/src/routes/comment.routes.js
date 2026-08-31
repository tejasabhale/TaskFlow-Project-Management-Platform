import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.post("/task/:taskId", verifyJWT, validateObjectId("taskId"), addComment);

router.get("/task/:taskId", verifyJWT, validateObjectId("taskId"), getComments);

router.patch(
  "/:commentId",
  verifyJWT,
  validateObjectId("commentId"),
  updateComment,
);

router.delete(
  "/:commentId",
  verifyJWT,
  validateObjectId("commentId"),
  deleteComment,
);

export default router;
