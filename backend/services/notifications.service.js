const Notification = require('../models/Notification');

const listForRecipient = (recipient) => Notification.find({ recipient }).sort({ createdAt: -1 }).limit(50);
const countUnreadForRecipient = (recipient) => Notification.countDocuments({ recipient, isRead: false });
const markRead = (id, recipient) => Notification.findOneAndUpdate(
  { _id: id, recipient }, { isRead: true }, { new: true, runValidators: true }
);
const markAllRead = (recipient) => Notification.updateMany({ recipient, isRead: false }, { isRead: true });
const deleteForRecipient = (id, recipient) => Notification.findOneAndDelete({ _id: id, recipient });

module.exports = { listForRecipient, countUnreadForRecipient, markRead, markAllRead, deleteForRecipient };
