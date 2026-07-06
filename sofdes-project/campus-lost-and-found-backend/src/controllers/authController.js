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

const { MOCK_CAMPUS_DATABASE } = require('../config/campusDb');

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

    // Determine the role from the first digit after the dash: 0 -> Admin, 1 -> Staff, 2 -> Student
    const parts = university_id.split('-');
    const roleDigit = parts[1]?.[0];
    let assignedRole = 'Student';
    if (roleDigit === '0') {
      assignedRole = 'Admin';
    } else if (roleDigit === '1') {
      assignedRole = 'Staff';
    } else if (roleDigit === '2') {
      assignedRole = 'Student';
    }

    // Hash and save the entered password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a new user record in the USER table with empty first_name, last_name, and email
    user = await userModel.create({
      university_id,
      first_name: '',
      last_name: '',
      email: '',
      passwordHash,
      contact_number: null,
      role: assignedRole
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
