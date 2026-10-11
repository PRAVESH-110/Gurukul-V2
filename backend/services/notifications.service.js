const Notification = require('../models/Notification');

const listForRecipient = (recipient) => Notification.find({ recipient }).sort({ createdAt: -1 }).limit(50);
const countUnreadForRecipient = (recipient) => Notification.countDocuments({ recipient, isRead: false });
const markRead = (id, recipient) => Notification.findOneAndUpdate(
  { _id: id, recipient }, { isRead: true }, { new: true, runValidators: true }
);
const markAllRead = (recipient) => Notification.updateMany({ recipient, isRead: false }, { isRead: true });
const deleteForRecipient = (id, recipient) => Notification.findOneAndDelete({ _id: id, recipient });

const notifyConnectedUsers = async (io, { type, content }) => {
  if (!io) return [];

  try {
    const sockets = await io.in('authenticated').fetchSockets();
    const recipientIds = [...new Set(sockets.map((socket) => socket.data.userId).filter(Boolean))];
    if (recipientIds.length === 0) return [];

    const notifications = await Notification.insertMany(recipientIds.map((recipient) => ({
      recipient,
      type,
      content
    })));

    notifications.forEach((notification) => {
      io.to(notification.recipient.toString()).emit('new_notification', notification);
    });
    return notifications;
  } catch (error) {
    console.error('Failed to persist and emit course announcement:', error);
    return [];
  }
};

module.exports = {
  listForRecipient,
  countUnreadForRecipient,
  markRead,
  markAllRead,
  deleteForRecipient,
  notifyConnectedUsers
};
