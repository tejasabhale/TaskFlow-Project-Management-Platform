import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipient: req.user._id,
  })
    .populate("sender", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalNotifications = await Notification.countDocuments({
    recipient: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          page,
          limit,
          total: totalNotifications,
          totalPages: Math.ceil(totalNotifications / limit),
        },
      },
      "Notifications fetched successfully.",
    ),
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: req.user._id,
    },
    {
      isRead: true,
    },
    {
      returnDocument: "after",
    },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification marked as read."));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read."));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  await notification.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted successfully."));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        unreadCount,
        "Unread notifications counted successfully.",
      ),
    );
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
