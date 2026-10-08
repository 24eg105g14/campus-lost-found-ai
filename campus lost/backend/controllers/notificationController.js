const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      read: false
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    notification.read = true;
    await notification.save();
    res.json({ message: 'Notification marked as read.', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating notification.' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error marking notifications read.' });
  }
};
