const express = require('express');
const { protect } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

const router = express.Router();

// All notification routes require the user to be logged in
router.use(protect);

// @desc    Get all notifications for logged in user
// @route   GET /api/notifications
// @access  Private
router.get('/', notificationsController.getNotifications);

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', notificationsController.getUnreadCount);

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', notificationsController.markNotificationRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', notificationsController.markAllNotificationsRead);

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
