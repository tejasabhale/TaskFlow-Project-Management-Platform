import { useEffect, useState } from "react";
import { FiCheck, FiRefreshCw, FiTrash2, FiBell } from "react-icons/fi";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/notification.service";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNotifications(page, 20);

      const notificationData = response.data || {};
      const notificationList = notificationData.notifications || [];

      setNotifications(Array.isArray(notificationList) ? notificationList : []);

      setPagination(
        notificationData.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTime = (date) => {
    if (!date) return "";

    const createdAt = new Date(date);
    const now = new Date();

    const difference = Math.floor((now - createdAt) / 1000);

    if (difference < 60) {
      return "Just now";
    }

    const minutes = Math.floor(difference / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    return createdAt.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setActionLoading(notificationId);

      await markAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some(
      (notification) => !notification.isRead,
    );

    if (!hasUnread) return;

    try {
      setActionLoading("all");

      await markAllAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setActionLoading(notificationId);

      await deleteNotification(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.filter(
          (notification) => notification._id !== notificationId,
        ),
      );

      setPagination((currentPagination) => ({
        ...currentPagination,
        total: Math.max(0, currentPagination.total - 1),
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }

    if (notification.task) {
      navigate(`/tasks/${notification.task}`);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                {unreadCount} unread
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your workspace activity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={actionLoading === "all" || unreadCount === 0}
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {actionLoading === "all" ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            className="flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-900"
          >
            <FiRefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Notifications */}
      <div className="max-w-3xl overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-4 p-5">
                <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-gray-200" />

                <div className="flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FiBell size={20} className="text-gray-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No notifications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              You're all caught up. New notifications will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`group flex cursor-pointer items-center gap-4 p-5 transition hover:bg-gray-50 ${
                  !notification.isRead ? "bg-gray-50/50" : ""
                }`}
              >
                {/* Unread indicator */}
                <div
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.isRead ? "bg-gray-200" : "bg-blue-500"
                  }`}
                />

                {/* Notification content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm ${
                        notification.isRead
                          ? "font-normal text-gray-700"
                          : "font-medium text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>

                {/* Mark as read */}
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    disabled={actionLoading === notification._id}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Mark as read"
                  >
                    <FiCheck size={16} />
                  </button>
                )}

                {/* Delete */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  disabled={actionLoading === notification._id}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-5 flex max-w-3xl items-center justify-between">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => fetchNotifications(pagination.page - 1)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchNotifications(pagination.page + 1)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
