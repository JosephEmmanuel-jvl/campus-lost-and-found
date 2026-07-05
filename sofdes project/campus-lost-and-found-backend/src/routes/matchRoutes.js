/**
 * src/routes/matchRoutes.js  ->  mounted at /api/v1/matches
 */
const express = require('express');
const { getSuggestedMatches, confirmMatch } = require('../controllers/matchController');
const { authenticate } = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/:reportId', authenticate, getSuggestedMatches);
router.patch('/:reportId', authenticate, staffOrAdmin, confirmMatch);

module.exports = router;
