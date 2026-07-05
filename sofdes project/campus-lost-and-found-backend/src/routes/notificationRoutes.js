/**
 * src/routes/notificationRoutes.js  ->  mounted at /api/v1/notifications
 */
const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/:id', authenticate, markAsRead);

module.exports = router;
