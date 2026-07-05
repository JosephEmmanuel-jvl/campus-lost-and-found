/**
 * src/controllers/userController.js
 * ---------------------------------------------------------------------------
 * User profile endpoints.
 *   GET /users/profile  - return the authenticated user's profile
 *   PUT /users/profile  - update editable profile fields
 * ---------------------------------------------------------------------------
 */

const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const userModel = require('../models/userModel');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await userModel.getProfile(req.user.university_id);
  if (!profile) throw new ApiError(404, 'User profile not found.');
  return success(res, { message: 'Profile retrieved.', data: { user: profile } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { first_name, last_name, contact_number } = req.body;
  const updated = await userModel.updateProfile(req.user.university_id, {
    first_name,
    last_name,
    contact_number,
  });
  return success(res, { message: 'Profile updated.', data: { user: updated } });
});

module.exports = { getProfile, updateProfile };
