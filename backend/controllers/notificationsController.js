const notificationService = require('../services/notifications.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.listForRecipient(req.user._id);
    return res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) { return next(error); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.countUnreadForRecipient(req.user._id);
    return res.status(200).json({ success: true, count });
  } catch (error) { return next(error); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user._id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.status(200).json({ success: true, data: notification });
  } catch (error) { return next(error); }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await notificationService.markAllRead(req.user._id);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { return next(error); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.deleteForRecipient(req.params.id, req.user._id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) { return next(error); }
};

module.exports = { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification };
