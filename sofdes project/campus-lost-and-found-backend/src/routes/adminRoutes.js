/**
 * src/routes/adminRoutes.js  ->  mounted at /api/v1/admin
 * All routes are Admin-only.
 */
const express = require('express');
const { dashboard, reportsQueue, claimsQueue, users } = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', dashboard);
router.get('/reports', reportsQueue);
router.get('/claims', claimsQueue);
router.get('/users', users);

module.exports = router;
