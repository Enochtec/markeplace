const prisma = require('../config/db');

// Get user notifications
const getNotifications = async (req, res) => {
  const { unreadOnly } = req.query;

  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
      ...(unreadOnly === 'true' && { isRead: false }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: req.user.id, isRead: false },
  });

  res.json({ notifications, unreadCount });
};

// Mark notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;

  if (id === 'all') {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ message: 'All notifications marked as read' });
  }

  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  res.json({ message: 'Notification marked as read' });
};

// Delete notification
const deleteNotification = async (req, res) => {
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });

  await prisma.notification.delete({ where: { id: req.params.id } });
  res.json({ message: 'Notification deleted' });
};

// Admin: Send notification to user
const sendNotification = async (req, res) => {
  const { userId, title, message, type } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ message: 'userId, title, and message are required' });
  }

  const notification = await prisma.notification.create({
    data: { userId, title, message, type: type || 'INFO' },
  });

  res.status(201).json({ message: 'Notification sent', notification });
};

// Admin: Broadcast notification to all users
const broadcastNotification = async (req, res) => {
  const { title, message, type, role } = req.body;
  if (!title || !message) {
    return res.status(400).json({ message: 'title and message are required' });
  }

  const users = await prisma.user.findMany({
    where: { isActive: true, ...(role && { role }) },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, title, message, type: type || 'INFO' })),
  });

  res.json({ message: `Notification sent to ${users.length} users` });
};

module.exports = { getNotifications, markAsRead, deleteNotification, sendNotification, broadcastNotification };
