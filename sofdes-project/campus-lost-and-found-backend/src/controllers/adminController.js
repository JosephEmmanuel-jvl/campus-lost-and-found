/**
 * src/controllers/adminController.js
 * ---------------------------------------------------------------------------
 * Admin-only endpoints (all guarded by adminOnly in the routes).
 *   GET /admin/dashboard - summary statistics
 *   GET /admin/reports   - all lost + found reports (review queue)
 *   GET /admin/claims    - all claims (claim queue, optional status filter)
 *   GET /admin/users     - all users (user management)
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const lostItemModel = require('../models/lostItemModel');
const foundItemModel = require('../models/foundItemModel');
const claimModel = require('../models/claimModel');
const userModel = require('../models/userModel');

/**
 * Small helper to count rows for a simple aggregate query.
 */
async function scalar(sql) {
  const [rows] = await pool.query(sql);
  return rows[0].value;
}

const dashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalLost,
    totalFound,
    pendingClaims,
    approvedClaims,
    matchedLost,
  ] = await Promise.all([
    scalar('SELECT COUNT(*) AS value FROM user'),
    scalar('SELECT COUNT(*) AS value FROM lost_item_report'),
    scalar('SELECT COUNT(*) AS value FROM found_item_report'),
    scalar("SELECT COUNT(*) AS value FROM claim_request WHERE status = 'Pending'"),
    scalar("SELECT COUNT(*) AS value FROM claim_request WHERE status = 'Approved'"),
    scalar("SELECT COUNT(*) AS value FROM lost_item_report WHERE status = 'Matched'"),
  ]);

  // Recovery rate: approved claims over total found reports (guard divide-by-zero).
  const recoveryRate = totalFound > 0 ? Math.round((approvedClaims / totalFound) * 100) : 0;

  return success(res, {
    message: 'Dashboard statistics retrieved.',
    data: {
      statistics: {
        total_users: totalUsers,
        total_lost_reports: totalLost,
        total_found_reports: totalFound,
        pending_claims: pendingClaims,
        approved_claims: approvedClaims,
        matched_lost_reports: matchedLost,
        recovery_rate_percent: recoveryRate,
      },
    },
  });
});

const reportsQueue = asyncHandler(async (req, res) => {
  const [lost, found] = await Promise.all([
    lostItemModel.findAll({}),
    foundItemModel.findAll({}),
  ]);
  return success(res, {
    message: 'All reports retrieved.',
    data: { lost_reports: lost, found_reports: found },
  });
});

const claimsQueue = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const claims = await claimModel.findAll({ status });
  return success(res, { message: 'All claims retrieved.', data: { claims } });
});

const users = asyncHandler(async (req, res) => {
  const allUsers = await userModel.findAll();
  return success(res, { message: 'All users retrieved.', data: { users: allUsers } });
});

module.exports = { dashboard, reportsQueue, claimsQueue, users };
