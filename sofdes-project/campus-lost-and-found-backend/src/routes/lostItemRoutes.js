/**
 * src/routes/lostItemRoutes.js  ->  mounted at /api/v1/lost-items
 */
const express = require('express');
const { getAll, getOne, create } = require('../controllers/lostItemController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validate');
const { CATEGORIES } = require('../utils/constants');

const router = express.Router();

const createRules = {
  item_name: { required: true, type: 'string', maxLength: 150 },
  description: { required: true, type: 'string' },
  category: { required: true, enum: CATEGORIES },
  keywords: { required: true, type: 'string', minLength: 1 },
  last_known_location: { required: true, type: 'string', maxLength: 200 },
  date_lost: { required: true, type: 'date' },
  photo_url: { required: false, type: 'string' },
};

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.post('/', authenticate, validateBody(createRules), create);

module.exports = router;
