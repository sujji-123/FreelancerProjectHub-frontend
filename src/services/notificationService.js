// src/services/notificationService.js
import api from "./api";

// Get all notifications for logged-in user
export const getNotifications = () => api.get("/notifications");

// Mark a single notification as read
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`);

export default { getNotifications, markNotificationRead };
