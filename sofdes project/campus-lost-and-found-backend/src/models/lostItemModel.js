/**
 * src/models/lostItemModel.js
 * ---------------------------------------------------------------------------
 * Data access for the LOST_ITEM_REPORT entity.
 *
 * Business rules relevant here (enforced in controllers, surfaced via these
 * methods): reports are locked after submission; only Admin/Staff-Security may
 * edit or delete. Bidirectional matching is updated together with the found
 * report inside the match controller (transaction).
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');

const lostItemModel = {
  async create({ university_id, item_name, description, category, keywords, photo_url = null, last_known_location, date_lost }) {
    const [result] = await pool.execute(
      `INSERT INTO lost_item_report
         (university_id, item_name, description, category, keywords,
          photo_url, last_known_location, date_lost)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [university_id, item_name, description, category, keywords, photo_url, last_known_location, date_lost]
    );
    return this.findById(result.insertId);
  },

  async findById(lostReportId) {
    const [rows] = await pool.execute(
      `SELECT l.*, u.first_name, u.last_name, u.email
         FROM lost_item_report l
         JOIN user u ON u.university_id = l.university_id
        WHERE l.lost_report_id = ?`,
      [lostReportId]
    );
    return rows[0] || null;
  },

  /**
   * List all lost reports with optional filters (status, category).
   */
  async findAll({ status = null, category = null } = {}) {
    const clauses = [];
    const params = [];
    if (status) { clauses.push('l.status = ?'); params.push(status); }
    if (category) { clauses.push('l.category = ?'); params.push(category); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT l.*, u.first_name, u.last_name
         FROM lost_item_report l
         JOIN user u ON u.university_id = l.university_id
         ${where}
        ORDER BY l.created_at DESC`,
      params
    );
    return rows;
  },

  async findByUser(universityId) {
    const [rows] = await pool.execute(
      `SELECT * FROM lost_item_report
        WHERE university_id = ?
        ORDER BY created_at DESC`,
      [universityId]
    );
    return rows;
  },

  /**
   * Update status and/or matched found report. Used by the match/claim flows.
   * Accepts an optional external connection for use inside a transaction.
   */
  async updateMatchAndStatus(lostReportId, { status, matched_found_report_id }, conn = pool) {
    await conn.execute(
      `UPDATE lost_item_report
          SET status = COALESCE(?, status),
              matched_found_report_id = ?
        WHERE lost_report_id = ?`,
      [status ?? null, matched_found_report_id ?? null, lostReportId]
    );
  },

  /**
   * Admin/Staff edit of report fields (reports are otherwise locked).
   */
  async adminUpdate(lostReportId, fields) {
    const allowed = ['item_name', 'description', 'category', 'keywords', 'photo_url', 'last_known_location', 'date_lost'];
    const sets = [];
    const params = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) { sets.push(`${key} = ?`); params.push(fields[key]); }
    }
    if (sets.length === 0) return this.findById(lostReportId);
    params.push(lostReportId);
    await pool.execute(
      `UPDATE lost_item_report SET ${sets.join(', ')} WHERE lost_report_id = ?`,
      params
    );
    return this.findById(lostReportId);
  },

  async remove(lostReportId) {
    const [result] = await pool.execute(
      `DELETE FROM lost_item_report WHERE lost_report_id = ?`,
      [lostReportId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = lostItemModel;
