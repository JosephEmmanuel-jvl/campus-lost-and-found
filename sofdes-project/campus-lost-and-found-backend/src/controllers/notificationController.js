/**
 * src/controllers/notificationController.js
 * ---------------------------------------------------------------------------
 * Notification endpoints.
 *   GET   /notifications      - list the current user's notifications
 *   PATCH /notifications/:id  - mark a notification as read
 *
 * Notifications are system-generated only; there is no create endpoint here.
 * ---------------------------------------------------------------------------
 */

const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const notificationModel = require('../models/notificationModel');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationModel.findByUser(req.user.university_id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  return success(res, {
    message: 'Notifications retrieved.',
    data: { notifications, unread_count: unreadCount },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const updated = await notificationModel.markAsRead(req.params.id, req.user.university_id);
  if (!updated) {
    throw new ApiError(404, 'Notification not found or does not belong to you.');
  }
  return success(res, { message: 'Notification marked as read.', data: { notification: updated } });
});

module.exports = { getNotifications, markAsRead };
