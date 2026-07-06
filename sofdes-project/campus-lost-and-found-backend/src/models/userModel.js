/**
 * src/models/userModel.js
 * ---------------------------------------------------------------------------
 * Data access for the USER entity. Uses the shared MySQL pool.
 *
 * This model is provided by Member 6 as part of the backend foundation.
 * Member 1 (Authentication) builds login/registration logic ON TOP of these
 * methods (e.g., calls create() during registration, findByEmail() during
 * login) rather than writing raw SQL.
 *
 * Schema reference: ENTITY_LIST.md — Entity 1 (User).
 *   PK: university_id (VARCHAR). Roles: Student | Staff | Admin.
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');

const USER_COLUMNS =
  'university_id, first_name, last_name, email, contact_number, role, created_at';

const userModel = {
  /**
   * Find a user by primary key. Includes password_hash (caller may strip it).
   */
  async findById(universityId) {
    const [rows] = await pool.execute(
      `SELECT university_id, first_name, last_name, email, password_hash,
              contact_number, role, created_at
         FROM user
        WHERE university_id = ?`,
      [universityId]
    );
    const user = rows[0] || null;
    if (user && user.email && user.email.includes('@temp.edu')) {
      user.email = '';
    }
    return user;
  },

  /**
   * Find a user by email (used for login). Includes password_hash.
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT university_id, first_name, last_name, email, password_hash,
              contact_number, role, created_at
         FROM user
        WHERE email = ?`,
      [email]
    );
    const user = rows[0] || null;
    if (user && user.email && user.email.includes('@temp.edu')) {
      user.email = '';
    }
    return user;
  },

  /**
   * Return a user's public profile (no password_hash).
   */
  async getProfile(universityId) {
    const [rows] = await pool.execute(
      `SELECT ${USER_COLUMNS} FROM user WHERE university_id = ?`,
      [universityId]
    );
    const user = rows[0] || null;
    if (user && user.email && user.email.includes('@temp.edu')) {
      user.email = '';
    }
    return user;
  },

  /**
   * Create a new user. `passwordHash` must already be bcrypt-hashed by the
   * caller.
   */
  async create({ university_id, first_name = '', last_name = '', email = '', passwordHash, contact_number = null, role = 'Student' }) {
    const dbFirstName = first_name || '';
    const dbLastName = last_name || '';
    const dbEmail = email || `${university_id.toLowerCase()}@temp.edu`;

    await pool.execute(
      `INSERT INTO user
         (university_id, first_name, last_name, email, password_hash, contact_number, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [university_id, dbFirstName, dbLastName, dbEmail, passwordHash, contact_number, role]
    );
    return this.getProfile(university_id);
  },

  /**
   * Update the editable profile fields (first name, last name, email, contact number).
   */
  async updateProfile(universityId, { first_name, last_name, email, contact_number }) {
    await pool.execute(
      `UPDATE user
          SET first_name = COALESCE(?, first_name),
              last_name  = COALESCE(?, last_name),
              email      = COALESCE(?, email),
              contact_number = ?
        WHERE university_id = ?`,
      [first_name ?? null, last_name ?? null, email ?? null, contact_number ?? null, universityId]
    );
    return this.getProfile(universityId);
  },

  /**
   * List all users (Admin user-management endpoint).
   */
  async findAll() {
    const [rows] = await pool.execute(
      `SELECT ${USER_COLUMNS} FROM user ORDER BY created_at DESC`
    );
    return rows.map(user => {
      if (user && user.email && user.email.includes('@temp.edu')) {
        user.email = '';
      }
      return user;
    });
  },
};

module.exports = userModel;
