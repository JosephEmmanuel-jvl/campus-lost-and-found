/**
 * src/routes/uploadRoutes.js
 * ---------------------------------------------------------------------------
 * Routes for file upload.
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow authenticated users to upload files
router.post('/', authenticate, uploadFile);

module.exports = router;
