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

const env = require('../config/env');

const login = asyncHandler(async (req, res) => {
  const { university_id, password } = req.body;

  if (!university_id || !password) {
    throw new ApiError(400, 'University ID and password are required.');
  }

  // 1. Check if user already exists in the application's local user table
  let user = await userModel.findById(university_id);

  if (user) {
    // Existing user: verify the password (bcrypt)
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid University ID or password.');
    }
  } else {
    // 2. User does NOT exist in the USER table: First-Time Login
    // Validate University ID Format: YYYY-DXXXX (where D is 0, 1, or 2)
    const idRegex = /^\d{4}-[012]\d{4}$/;
    if (!idRegex.test(university_id)) {
      throw new ApiError(400, 'Invalid University ID format. Must follow YYYY-DXXXX (where D is 0, 1, or 2).');
    }

    // Public first-time login is student signup, regardless of ID digits or body.role.
    // Privileged roles can only be assigned with the trusted db:set-role command.
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new ApiError(422, 'New passwords must be at least 12 characters and at most 72 UTF-8 bytes.');
    }
    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

    // Create a new user record in the USER table with empty first_name, last_name, and email
    user = await userModel.create({
      university_id,
      first_name: '',
      last_name: '',
      email: '',
      passwordHash,
      contact_number: null,
      role: 'Student'
    });
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
