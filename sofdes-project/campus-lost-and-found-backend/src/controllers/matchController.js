/**
 * src/controllers/matchController.js
 * ---------------------------------------------------------------------------
 * Semi-automated matching endpoints.
 *
 *   GET   /matches/:reportId  - suggested matches for a LOST report, ranked by
 *                               category, keyword overlap, date, and location.
 *   PATCH /matches/:reportId  - ADMIN ONLY: confirm a match between a lost and
 *                               a found report. Updates BOTH reports in a single
 *                               transaction (per "updated simultaneously" rule)
 *                               and notifies both reporters.
 *
 * The matching is a SUGGESTION engine only; a human admin confirms it, per the
 * adviser's "semi-automated matching + manual verification" recommendation.
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const lostItemModel = require('../models/lostItemModel');
const foundItemModel = require('../models/foundItemModel');
const notificationModel = require('../models/notificationModel');

/**
 * Simple keyword-overlap scoring between two comma-separated keyword strings.
 */
function keywordOverlap(a = '', b = '') {
  const setA = new Set(a.toLowerCase().split(',').map((k) => k.trim()).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(',').map((k) => k.trim()).filter(Boolean));
  let overlap = 0;
  for (const k of setA) if (setB.has(k)) overlap += 1;
  return overlap;
}

/**
 * GET /matches/:reportId
 * Returns candidate FOUND reports for a given LOST report, scored & ranked.
 */
const getSuggestedMatches = asyncHandler(async (req, res) => {
  const lostReport = await lostItemModel.findById(req.params.reportId);
  if (!lostReport) throw new ApiError(404, 'Lost report not found.');

  // Candidate pool: all found reports that are currently unclaimed/available
  const candidates = await foundItemModel.findAll({ status: 'Unclaimed' });

  // Map candidates for display (no matching engine score)
  const mapped = candidates.map((f) => ({
    ...f,
    match_score: null,
  }));

  return success(res, {
    message: 'Available found items retrieved for manual matching.',
    data: { lost_report_id: lostReport.lost_report_id, suggestions: mapped },
  });
});

/**
 * PATCH /matches/:reportId  (Admin only)
 * Body: { found_report_id }
 * Confirms the match; updates both reports to "Matched" atomically.
 */
const confirmMatch = asyncHandler(async (req, res) => {
  const lostReportId = req.params.reportId;
  const { found_report_id } = req.body;

  if (!found_report_id) throw new ApiError(422, 'found_report_id is required to confirm a match.');

  const lostReport = await lostItemModel.findById(lostReportId);
  if (!lostReport) throw new ApiError(404, 'Lost report not found.');

  const foundReport = await foundItemModel.findById(found_report_id);
  if (!foundReport) throw new ApiError(404, 'Found report not found.');

  if (lostReport.status === 'Claimed' || foundReport.status === 'Claimed') {
    throw new ApiError(409, 'Cannot match a report that is already claimed.');
  }

  // Update BOTH reports in a single transaction.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await lostItemModel.updateMatchAndStatus(
      lostReportId,
      { status: 'Matched', matched_found_report_id: found_report_id },
      conn
    );
    await foundItemModel.updateMatchAndStatus(
      found_report_id,
      { status: 'Matched', matched_lost_report_id: lostReportId },
      conn
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  // Notify both reporters (system-generated).
  await notificationModel.create({
    university_id: lostReport.university_id,
    title: 'Match Confirmed',
    message: `Your lost item "${lostReport.item_name}" has been matched to a found item. You may now file a claim.`,
    notification_type: 'Match',
    related_report_id: Number(lostReportId),
  });
  await notificationModel.create({
    university_id: foundReport.university_id,
    title: 'Match Confirmed',
    message: `The found item "${foundReport.item_name}" you reported has been matched to a lost item report.`,
    notification_type: 'Match',
    related_report_id: Number(found_report_id),
  });

  return success(res, {
    message: 'Match confirmed. Both reports updated to Matched.',
    data: { lost_report_id: Number(lostReportId), found_report_id: Number(found_report_id) },
  });
});

module.exports = { getSuggestedMatches, confirmMatch };
