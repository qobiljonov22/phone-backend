// Notification system
import express from 'express';
const router = express.Router();

// In-memory notifications storage
let notifications = new Map();
let notificationCounter = 1;

// Get user notifications
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { unreadOnly = false, limit = 20, page = 1 } = req.query;
  
  let userNotifications = Array.from(notifications.values())
    .filter(notification => notification.userId === userId);
  
  if (unreadOnly === 'true') {
    userNotifications = userNotifications.filter(n => !n.read);
  }
  
  // Sort by newest first
  userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
  
  const unreadCount = Array.from(notifications.values())
    .filter(n => n.userId === userId && !n.read).length;
  
  res.json({
    notifications: paginatedNotifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: userNotifications.length,
      pages: Math.ceil(userNotifications.length / parseInt(limit))
    }
  });
});

// Create notification
router.post('/', (req, res) => {
  const { 
    userId, 
    title, 
    message, 
    type = 'info', 
    actionUrl,
    data = {} 
  } = req.body;
  
  if (!userId || !title || !message) {
    return res.status(400).json({ 
      error: 'User ID, title, and message are required' 
    });
  }
  
  const validTypes = ['info', 'success', 'warning', 'error', 'order', 'promotion', 'system'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid notification type',
      validTypes 
    });
  }
  
  const notificationId = `notif_${notificationCounter++}`;
  const notification = {
    notificationId,
    userId,
    title,
    message,
    type,
    actionUrl: actionUrl || null,
    data,
    read: false,
    createdAt: new Date(),
    readAt: null
  };
  
  notifications.set(notificationId, notification);
  
  res.status(201).json({
    notification,
    message: 'Notification created successfully'
  });
});

// Mark notification as read
router.put('/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  
  const notification = notifications.get(notificationId);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notification.read = true;
  notification.readAt = new Date();
  notifications.set(notificationId, notification);
  
  res.json({
    notification,
    message: 'Notification marked as read'
  });
});

// Mark all notifications as read for user
router.put('/user/:userId/read-all', (req, res) => {
  const { userId } = req.params;
  
  let updatedCount = 0;
  Array.from(notifications.values())
    .filter(n => n.userId === userId && !n.read)
    .forEach(notification => {
      notification.read = true;
      notification.readAt = new Date();
      notifications.set(notification.notificationId, notification);
      updatedCount++;
    });
  
  res.json({
    message: `${updatedCount} notifications marked as read`
  });
});

// Delete notification
router.delete('/:notificationId', (req, res) => {
  const { notificationId } = req.params;
  
  const notification = notifications.get(notificationId);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notifications.delete(notificationId);
  
  res.json({
    message: 'Notification deleted successfully'
  });
});

// Send bulk notifications
router.post('/bulk', (req, res) => {
  const { userIds, title, message, type = 'info', actionUrl, data = {} } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'User IDs array is required' });
  }
  
  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }
  
  const createdNotifications = [];
  
  userIds.forEach(userId => {
    const notificationId = `notif_${notificationCounter++}`;
    const notification = {
      notificationId,
      userId,
      title,
      message,
      type,
      actionUrl: actionUrl || null,
      data,
      read: false,
      createdAt: new Date(),
      readAt: null
    };
    
    notifications.set(notificationId, notification);
    createdNotifications.push(notification);
  });
  
  res.status(201).json({
    message: `${createdNotifications.length} notifications sent`,
    notifications: createdNotifications
  });
});

// Get notification statistics
router.get('/stats/summary', (req, res) => {
  const allNotifications = Array.from(notifications.values());
  
  const stats = {
    total: allNotifications.length,
    unread: allNotifications.filter(n => !n.read).length,
    byType: {
      info: allNotifications.filter(n => n.type === 'info').length,
      success: allNotifications.filter(n => n.type === 'success').length,
      warning: allNotifications.filter(n => n.type === 'warning').length,
      error: allNotifications.filter(n => n.type === 'error').length,
      order: allNotifications.filter(n => n.type === 'order').length,
      promotion: allNotifications.filter(n => n.type === 'promotion').length,
      system: allNotifications.filter(n => n.type === 'system').length
    },
    recentNotifications: allNotifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
  };
  
  res.json(stats);
});

export default router;