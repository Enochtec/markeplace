const express = require('express');
const router = express.Router();
const {
  getNotifications, markAsRead, deleteNotification, sendNotification, broadcastNotification,
} = require('../controllers/notification.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin only
router.post('/send', authorize('ADMIN'), sendNotification);
router.post('/broadcast', authorize('ADMIN'), broadcastNotification);

module.exports = router;
