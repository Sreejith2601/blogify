const Notification = require('../models/Notification');

// GET ALL NOTIFICATIONS FOR CURRENT USER
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50

    // Get count of unread
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// MARK SINGLE NOTIFICATION AS READ
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notifications as read' });
  }
};

// HELPER FUNCTION: Create Notification
// Used internally by other controllers, not a route handler
const createNotification = async ({ recipient, sender, type, post, message }) => {
  try {
    // Don't send notification to self
    if (recipient.toString() === sender.toString()) return null;

    // Check if duplicate (e.g. liking the same post twice shouldn't spam)
    if (type === 'LIKE' || type === 'FOLLOW') {
      const existing = await Notification.findOne({ recipient, sender, type, post });
      if (existing) return existing;
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
      message
    });

    return notification;
  } catch (error) {
    console.error('Error auto-creating notification:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
