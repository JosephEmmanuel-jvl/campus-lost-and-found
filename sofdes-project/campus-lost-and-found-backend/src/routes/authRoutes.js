/**
 * src/routes/authRoutes.js  ->  mounted at /api/v1/auth
 */
const express = require('express');
const { login, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

const loginRules = {
  email: { required: true, type: 'string' },
  password: { required: true, type: 'string' },
};

router.post('/login', validateBody(loginRules), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
