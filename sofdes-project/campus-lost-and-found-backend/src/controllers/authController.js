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

const MOCK_CAMPUS_DATABASE = [
  {
    university_id: '2021-00001',
    first_name: 'Alice',
    last_name: 'Santos',
    email: 'alice.santos@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', // Password123!
    contact_number: '09171234567'
  },
  {
    university_id: '2021-00002',
    first_name: 'Benjamin',
    last_name: 'Cruz',
    email: 'benjamin.cruz@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm',
    contact_number: '09181234567'
  },
  {
    university_id: '2022-10001',
    first_name: 'Carla',
    last_name: 'Reyes',
    email: 'carla.reyes@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2022-10002',
    first_name: 'Daniel',
    last_name: 'Mendoza',
    email: 'daniel.mendoza@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm',
    contact_number: '09201234567'
  },
  {
    university_id: '2022-10003',
    first_name: 'Erika',
    last_name: 'Villanueva',
    email: 'erika.villanueva@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  // Extra campus database users to test auto-registration / first-time login role assignment
  {
    university_id: '2026-00101',
    first_name: 'John',
    last_name: 'Admin',
    email: 'john.admin@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2026-10101',
    first_name: 'Jane',
    last_name: 'Staff',
    email: 'jane.staff@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  },
  {
    university_id: '2026-20101',
    first_name: 'Bob',
    last_name: 'Student',
    email: 'bob.student@university.edu',
    password_hash: '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm'
  }
];

const login = asyncHandler(async (req, res) => {
  const { university_id, password } = req.body;

  if (!university_id || !password) {
    throw new ApiError(400, 'University ID and password are required.');
  }

  // 1. Check if user already exists in the application's local user table
  let user = await userModel.findById(university_id);
  let passwordMatches = false;

  if (user) {
    // Existing user: check password against stored hash
    passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid University ID or password.');
    }
  } else {
    // 2. User does not exist locally: search in the mock campus database
    const campusUser = MOCK_CAMPUS_DATABASE.find(u => u.university_id === university_id);
    if (!campusUser) {
      throw new ApiError(401, 'Invalid University ID or password.');
    }

    // Verify password against campus database hash
    passwordMatches = await bcrypt.compare(password, campusUser.password_hash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid University ID or password.');
    }

    // Determine role based on University ID pattern: xxxx-0xxx (Admin), xxxx-1xxx (Staff), xxxx-2xxx (Student)
    // The format is 9 characters (e.g. '2026-20101'). Let's parse the character after the hyphen (index 5)
    const roleDigit = university_id.split('-')[1]?.[0];
    let assignedRole = 'Student';
    if (roleDigit === '0') {
      assignedRole = 'Admin';
    } else if (roleDigit === '1') {
      assignedRole = 'Staff';
    } else if (roleDigit === '2') {
      assignedRole = 'Student';
    }

    // Create user record in application's user table
    user = await userModel.create({
      university_id: campusUser.university_id,
      first_name: campusUser.first_name,
      last_name: campusUser.last_name,
      email: campusUser.email,
      passwordHash: campusUser.password_hash,
      contact_number: campusUser.contact_number || null,
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
