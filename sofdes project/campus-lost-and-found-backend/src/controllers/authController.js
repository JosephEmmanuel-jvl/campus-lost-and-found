/**
 * src/controllers/authController.js
 * ---------------------------------------------------------------------------
 * Authentication endpoints. Member 6 provides a WORKING baseline so the rest
 * of the team can authenticate immediately. Member 1 (Authentication) owns
 * this module going forward and may extend registration, validation, etc.
 *
 * Endpoints:
 *   POST /auth/login   - verify email + password, return JWT
 *   POST /auth/logout  - stateless JWT: client discards the token
 *   GET  /auth/me      - return the authenticated user
 * ---------------------------------------------------------------------------
 */

const bcrypt = require('bcrypt');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { signToken } = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  // Use a generic message to avoid revealing whether the email exists.
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user);
  delete user.password_hash;

  return success(res, {
    message: 'Login successful.',
    data: { token, user },
  });
});

const logout = asyncHandler(async (req, res) => {
  // JWT is stateless; logout is handled client-side by discarding the token.
  // Endpoint exists for API completeness and future token-blacklist support.
  return success(res, { message: 'Logout successful. Please discard your token.' });
});

const me = asyncHandler(async (req, res) => {
  // req.user is set by the authenticate middleware (password_hash stripped).
  return success(res, { message: 'Current user retrieved.', data: { user: req.user } });
});

module.exports = { login, logout, me };
