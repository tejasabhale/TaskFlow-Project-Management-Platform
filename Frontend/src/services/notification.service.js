import api from "../api/axios";

const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get("/notifications", {
    params: {
      page,
      limit,
    },
  });
  return response.data;
};

const markAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

const markAllAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
