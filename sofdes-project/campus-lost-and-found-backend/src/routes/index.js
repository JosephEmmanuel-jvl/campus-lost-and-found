/**
 * src/routes/index.js
 * ---------------------------------------------------------------------------
 * Aggregates all route modules and exposes them as a single router that
 * app.js mounts under /api/v1.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { success } = require('../utils/apiResponse');

const router = express.Router();

// API index / version check.
router.get('/', (req, res) =>
  success(res, {
    message: 'Campus Lost and Found API v1',
    data: { version: 'v1.0.0' },
  })
);

// --- Route modules --------------------------------------------------------
router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/lost-items', require('./lostItemRoutes'));
router.use('/found-items', require('./foundItemRoutes'));
router.use('/matches', require('./matchRoutes'));
router.use('/claims', require('./claimRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/search', require('./searchRoutes'));
router.use('/upload', require('./uploadRoutes'));

module.exports = router;
