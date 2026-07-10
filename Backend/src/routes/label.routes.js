import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";
import { deleteLabel, updateLabel } from "../controllers/label.controller.js";

const router = Router();

router.patch(
  "/:labelId",
  verifyJWT,
  validateObjectId("labelId"),
  updateLabel,
);

router.delete(
  "/:labelId",
  verifyJWT,
  validateObjectId("labelId"),
  deleteLabel,
);

export default router;
