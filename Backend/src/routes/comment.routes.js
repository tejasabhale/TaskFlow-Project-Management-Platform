import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import {
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

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
