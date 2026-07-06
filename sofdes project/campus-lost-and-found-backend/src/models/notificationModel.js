/**
 * src/models/notificationModel.js
 * ---------------------------------------------------------------------------
 * Data access for the NOTIFICATION entity.
 *
 * Notifications are SYSTEM-GENERATED ONLY (per ENTITY_LIST.md). Other
 * controllers call notificationModel.create() when meaningful events occur
 * (new report, match confirmed, claim submitted/approved/rejected). There is
 * no public "create notification" endpoint.
 *
 * Field name `related_report_id` follows ENTITY_LIST.md (primary reference).
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');

const notificationModel = {
  /**
   * Create a notification for a single recipient.
   */
  async create({ university_id, title, message, notification_type = 'General', related_report_id = null }) {
    const [result] = await pool.execute(
      `INSERT INTO notification
         (university_id, title, message, notification_type, related_report_id)
       VALUES (?, ?, ?, ?, ?) RETURNING notification_id`,
      [university_id, title, message, notification_type, related_report_id]
    );
    return this.findById(result.insertId);
  },

  async findById(notificationId) {
    const [rows] = await pool.execute(
      `SELECT * FROM notification WHERE notification_id = ?`,
      [notificationId]
    );
    return rows[0] || null;
  },

  /**
   * List notifications for a user, newest first.
   */
  async findByUser(universityId) {
    const [rows] = await pool.execute(
      `SELECT * FROM notification
        WHERE university_id = ?
        ORDER BY created_at DESC`,
      [universityId]
    );
    return rows;
  },

  /**
   * Mark a single notification as read. Returns the updated row, or null if
   * it does not exist or does not belong to the given user.
   */
  async markAsRead(notificationId, universityId) {
    const [result] = await pool.execute(
      `UPDATE notification
          SET is_read = TRUE
        WHERE notification_id = ? AND university_id = ?`,
      [notificationId, universityId]
    );
    if (result.affectedRows === 0) return null;
    return this.findById(notificationId);
  },
};

module.exports = notificationModel;
