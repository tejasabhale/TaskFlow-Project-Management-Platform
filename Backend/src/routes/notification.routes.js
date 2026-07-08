import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js";

const router = Router();

router.get("/", verifyJWT, getNotifications);

router.patch(
  "/:notificationId/read",
  verifyJWT,
  validateObjectId("notificationId"),
  markAsRead,
);

router.patch("/read-all", verifyJWT, markAllAsRead);

router.delete(
  "/:notificationId",
  verifyJWT,
  validateObjectId("notificationId"),
  deleteNotification,
);

router.get(
  "/unread-count",
  verifyJWT,
  getUnreadCount,
);

export default router;