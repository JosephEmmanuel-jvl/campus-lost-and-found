/**
 * src/models/foundItemModel.js
 * ---------------------------------------------------------------------------
 * Data access for the FOUND_ITEM_REPORT entity. Mirrors lostItemModel.
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');

const foundItemModel = {
  async create({ university_id, item_name, description, category, keywords, photo_url = null, location_found, date_found }) {
    const [result] = await pool.execute(
      `INSERT INTO found_item_report
         (university_id, item_name, description, category, keywords,
          photo_url, location_found, date_found)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [university_id, item_name, description, category, keywords, photo_url, location_found, date_found]
    );
    return this.findById(result.insertId);
  },

  async findById(foundReportId) {
    const [rows] = await pool.execute(
      `SELECT f.*, u.first_name, u.last_name, u.email
         FROM found_item_report f
         JOIN user u ON u.university_id = f.university_id
        WHERE f.found_report_id = ?`,
      [foundReportId]
    );
    return rows[0] || null;
  },

  async findAll({ status = null, category = null } = {}) {
    const clauses = [];
    const params = [];
    if (status) { clauses.push('f.status = ?'); params.push(status); }
    if (category) { clauses.push('f.category = ?'); params.push(category); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT f.*, u.first_name, u.last_name
         FROM found_item_report f
         JOIN user u ON u.university_id = f.university_id
         ${where}
        ORDER BY f.created_at DESC`,
      params
    );
    return rows;
  },

  async findByUser(universityId) {
    const [rows] = await pool.execute(
      `SELECT * FROM found_item_report
        WHERE university_id = ?
        ORDER BY created_at DESC`,
      [universityId]
    );
    return rows;
  },

  async updateMatchAndStatus(foundReportId, { status, matched_lost_report_id }, conn = pool) {
    await conn.execute(
      `UPDATE found_item_report
          SET status = COALESCE(?, status),
              matched_lost_report_id = ?
        WHERE found_report_id = ?`,
      [status ?? null, matched_lost_report_id ?? null, foundReportId]
    );
  },

  /**
   * Set status only (used when a claim is approved -> Claimed).
   */
  async setStatus(foundReportId, status, conn = pool) {
    await conn.execute(
      `UPDATE found_item_report SET status = ? WHERE found_report_id = ?`,
      [status, foundReportId]
    );
  },

  async adminUpdate(foundReportId, fields) {
    const allowed = ['item_name', 'description', 'category', 'keywords', 'photo_url', 'location_found', 'date_found'];
    const sets = [];
    const params = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) { sets.push(`${key} = ?`); params.push(fields[key]); }
    }
    if (sets.length === 0) return this.findById(foundReportId);
    params.push(foundReportId);
    await pool.execute(
      `UPDATE found_item_report SET ${sets.join(', ')} WHERE found_report_id = ?`,
      params
    );
    return this.findById(foundReportId);
  },

  async remove(foundReportId) {
    const [result] = await pool.execute(
      `DELETE FROM found_item_report WHERE found_report_id = ?`,
      [foundReportId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = foundItemModel;
