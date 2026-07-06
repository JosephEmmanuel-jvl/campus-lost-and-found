/**
 * src/routes/searchRoutes.js  ->  mounted at /api/v1/search
 */
const express = require('express');
const { search } = require('../controllers/searchController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, search);

module.exports = router;
