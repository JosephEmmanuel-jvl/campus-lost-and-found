/**
 * src/middleware/authMiddleware.js
 * ---------------------------------------------------------------------------
 * JWT authentication. Provides:
 *
 *   authenticate      - Express middleware that verifies the Bearer token,
 *                       loads the user, and attaches it to req.user.
 *   signToken(user)   - Helper that Member 1's login controller uses to issue
 *                       a JWT after a successful password check.
 *
 * BOUNDARY NOTE (Member 6 -> Member 1):
 *   This file provides the reusable token machinery. Member 1 implements the
 *   actual login/registration flow and calls signToken() there. Member 6 does
 *   NOT implement login business logic here.
 * ---------------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { ApiError } = require('../utils/asyncHandler');
const userModel = require('../models/userModel');

/**
 * Creates a signed JWT for an authenticated user.
 * The token payload intentionally carries only non-sensitive identifiers.
 */
function signToken(user) {
  const payload = {
    university_id: user.university_id,
    role: user.role,
  };
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

/**
 * Express middleware: requires a valid "Authorization: Bearer <token>" header.
 * On success, sets req.user to the current user record (without password_hash).
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication required. Provide a Bearer token.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token.');
    }

    // Confirm the user still exists (e.g., not deleted since token issue).
    const user = await userModel.findById(decoded.university_id);
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    // Never expose the password hash downstream.
    delete user.password_hash;
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate, signToken };
