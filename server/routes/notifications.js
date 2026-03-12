// server/routes/notifications.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { Notification } = require('../models');

// GET /api/notifications/count
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count }); // Returns an object like { "count": 1 }
  } catch (err) {
    console.error("Error getting notification count:", err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    console.error("Error in GET /api/notifications:", err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /api/notifications/:id/mark-read - Mark a single notification as read
router.post('/:id/mark-read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error("Error marking notification as read:", err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.post('/mark-all-read', auth, async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { userId: req.user.id, isRead: false } }
        );
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error("Error marking all notifications as read:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
