/**
 * src/models/claimModel.js
 * ---------------------------------------------------------------------------
 * Data access for the CLAIM_REQUEST entity.
 *
 * Supports the key business rules (enforced in the controller):
 *   - Multiple claims allowed per found report.
 *   - Only ONE claim may be Approved per found report -> hasApprovedClaim().
 *   - Self-claim prevention checked in controller using the found report owner.
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');

const claimModel = {
  async create({ found_report_id, claimant_university_id, proof_of_ownership }) {
    const [result] = await pool.execute(
      `INSERT INTO claim_request
         (found_report_id, claimant_university_id, proof_of_ownership)
       VALUES (?, ?, ?)`,
      [found_report_id, claimant_university_id, proof_of_ownership]
    );
    return this.findById(result.insertId);
  },

  async findById(claimId) {
    const [rows] = await pool.execute(
      `SELECT c.*,
              u.first_name AS claimant_first_name,
              u.last_name  AS claimant_last_name,
              f.item_name  AS found_item_name
         FROM claim_request c
         JOIN user u ON u.university_id = c.claimant_university_id
         JOIN found_item_report f ON f.found_report_id = c.found_report_id
        WHERE c.claim_id = ?`,
      [claimId]
    );
    return rows[0] || null;
  },

  async findByUser(universityId) {
    const [rows] = await pool.execute(
      `SELECT c.*, f.item_name AS found_item_name
         FROM claim_request c
         JOIN found_item_report f ON f.found_report_id = c.found_report_id
        WHERE c.claimant_university_id = ?
        ORDER BY c.created_at DESC`,
      [universityId]
    );
    return rows;
  },

  async findAll({ status = null } = {}) {
    const where = status ? 'WHERE c.status = ?' : '';
    const params = status ? [status] : [];
    const [rows] = await pool.execute(
      `SELECT c.*,
              u.first_name AS claimant_first_name,
              u.last_name  AS claimant_last_name,
              f.item_name  AS found_item_name
         FROM claim_request c
         JOIN user u ON u.university_id = c.claimant_university_id
         JOIN found_item_report f ON f.found_report_id = c.found_report_id
         ${where}
        ORDER BY c.created_at DESC`,
      params
    );
    return rows;
  },

  /**
   * Whether a given found report already has an Approved claim.
   * Enforces "only one approved claim per found report".
   */
  async hasApprovedClaim(foundReportId, conn = pool) {
    const [rows] = await conn.execute(
      `SELECT COUNT(*) AS cnt
         FROM claim_request
        WHERE found_report_id = ? AND status = 'Approved'`,
      [foundReportId]
    );
    return rows[0].cnt > 0;
  },

  /**
   * Record a review decision (Approved/Rejected) with reviewer + remarks.
   * Accepts an optional connection for transactional use.
   */
  async review(claimId, { status, reviewed_by_university_id, admin_remarks = null }, conn = pool) {
    await conn.execute(
      `UPDATE claim_request
          SET status = ?,
              reviewed_by_university_id = ?,
              admin_remarks = ?,
              review_date = NOW()
        WHERE claim_id = ?`,
      [status, reviewed_by_university_id, admin_remarks, claimId]
    );
  },
};

module.exports = claimModel;
