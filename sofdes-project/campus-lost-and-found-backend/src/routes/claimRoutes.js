/**
 * src/routes/claimRoutes.js  ->  mounted at /api/v1/claims
 * NOTE: '/user' is declared BEFORE '/:id' so it is not captured as an id.
 */
const express = require('express');
const {
  submitClaim, getUserClaims, getClaim, approveClaim, rejectClaim,
} = require('../controllers/claimController');
const { authenticate } = require('../middleware/authMiddleware');
const { staffOrAdmin } = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validate');

const router = express.Router();

const submitRules = {
  found_report_id: { required: true, type: 'number' },
  proof_of_ownership: { required: true, type: 'string', minLength: 1 },
};

router.post('/', authenticate, validateBody(submitRules), submitClaim);
router.get('/user', authenticate, getUserClaims);
router.get('/:id', authenticate, getClaim);
router.patch('/:id/approve', authenticate, staffOrAdmin, approveClaim);
router.patch('/:id/reject', authenticate, staffOrAdmin, rejectClaim);

module.exports = router;
