/**
 * src/controllers/claimController.js
 * ---------------------------------------------------------------------------
 * Claim Request endpoints. Enforces the claim business rules from ENTITY_LIST.md.
 *
 *   POST  /claims             - submit a claim (self-claim prevention)
 *   GET   /claims/user        - claims submitted by the current user
 *   GET   /claims/:id         - single claim
 *   PATCH /claims/:id/approve - ADMIN: approve (only one approved per found report;
 *                               sets both reports to Claimed atomically)
 *   PATCH /claims/:id/reject  - ADMIN: reject (admin_remarks REQUIRED)
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const claimModel = require('../models/claimModel');
const foundItemModel = require('../models/foundItemModel');
const lostItemModel = require('../models/lostItemModel');
const notificationModel = require('../models/notificationModel');

/**
 * POST /claims
 * Body: { found_report_id, proof_of_ownership }
 */
const submitClaim = asyncHandler(async (req, res) => {
  const { found_report_id, proof_of_ownership } = req.body;

  const foundReport = await foundItemModel.findById(found_report_id);
  if (!foundReport) throw new ApiError(404, 'Found report not found.');

  // Business rule: a user cannot claim a found item they reported themselves.
  if (foundReport.university_id === req.user.university_id) {
    throw new ApiError(403, 'You cannot submit a claim for a found item you reported.');
  }

  // If the item is already fully claimed, no further claims make sense.
  if (foundReport.status === 'Claimed') {
    throw new ApiError(409, 'This found item has already been claimed.');
  }

  const claim = await claimModel.create({
    found_report_id,
    claimant_university_id: req.user.university_id,
    proof_of_ownership,
  });

  // Notify the claimant (submission acknowledgement).
  await notificationModel.create({
    university_id: req.user.university_id,
    title: 'Claim Submitted',
    message: `Your claim for "${foundReport.item_name}" has been submitted and is awaiting review.`,
    notification_type: 'Claim',
    related_report_id: Number(found_report_id),
  });

  // Notify all Admin users
  try {
    const userModel = require('../models/userModel');
    const allUsers = await userModel.findAll();
    const admins = allUsers.filter(u => u.role === 'Admin');
    for (const admin of admins) {
      if (admin.university_id !== req.user.university_id) {
        await notificationModel.create({
          university_id: admin.university_id,
          title: 'New Claim Request',
          message: `A new claim request has been submitted for "${foundReport.item_name}" by ${req.user.first_name || 'Student'} (${req.user.university_id}).`,
          notification_type: 'Claim',
          related_report_id: Number(found_report_id),
        });
      }
    }
  } catch (err) {
    console.error('Error generating Admin notifications for new claim:', err);
  }

  return success(res, { statusCode: 201, message: 'Claim submitted.', data: { claim } });
});

const getUserClaims = asyncHandler(async (req, res) => {
  const claims = await claimModel.findByUser(req.user.university_id);
  return success(res, { message: 'Your claims retrieved.', data: { claims } });
});

const getClaim = asyncHandler(async (req, res) => {
  const claim = await claimModel.findById(req.params.id);
  if (!claim) throw new ApiError(404, 'Claim not found.');

  // A non-admin/non-staff may only view their own claim.
  if (req.user.role !== 'Admin' && req.user.role !== 'Staff' && claim.claimant_university_id !== req.user.university_id) {
    throw new ApiError(403, 'You do not have permission to view this claim.');
  }
  return success(res, { message: 'Claim retrieved.', data: { claim } });
});

/**
 * PATCH /claims/:id/approve  (Admin only)
 * Body: { admin_remarks? }  (optional on approval)
 */
const approveClaim = asyncHandler(async (req, res) => {
  const claimId = req.params.id;
  const { admin_remarks = null } = req.body;

  const claim = await claimModel.findById(claimId);
  if (!claim) throw new ApiError(404, 'Claim not found.');
  if (claim.status !== 'Pending') {
    throw new ApiError(409, `Claim is already ${claim.status}. Only pending claims can be approved.`);
  }

  const foundReport = await foundItemModel.findById(claim.found_report_id);
  if (!foundReport) throw new ApiError(404, 'Associated found report not found.');

  // Business rule: only ONE approved claim per found report.
  const alreadyApproved = await claimModel.hasApprovedClaim(claim.found_report_id);
  if (alreadyApproved) {
    throw new ApiError(409, 'Another claim for this found item has already been approved.');
  }

  // Approve the claim and set BOTH reports to Claimed, atomically.
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await claimModel.review(
      claimId,
      { status: 'Approved', reviewed_by_university_id: req.user.university_id, admin_remarks },
      conn
    );
    await foundItemModel.setStatus(claim.found_report_id, 'Claimed', conn);
    // If a lost report is matched to this found report, mark it Claimed too.
    if (foundReport.matched_lost_report_id) {
      await lostItemModel.updateMatchAndStatus(
        foundReport.matched_lost_report_id,
        { status: 'Claimed', matched_found_report_id: claim.found_report_id },
        conn
      );
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  await notificationModel.create({
    university_id: claim.claimant_university_id,
    title: 'Claim Approved',
    message: `Your claim for "${foundReport.item_name}" has been approved. Please coordinate with Campus Security to retrieve the item.`,
    notification_type: 'Claim',
    related_report_id: claim.found_report_id,
  });

  const updated = await claimModel.findById(claimId);
  return success(res, { message: 'Claim approved.', data: { claim: updated } });
});

/**
 * PATCH /claims/:id/reject  (Admin only)
 * Body: { admin_remarks }  (REQUIRED on rejection)
 */
const rejectClaim = asyncHandler(async (req, res) => {
  const claimId = req.params.id;
  const { admin_remarks } = req.body;

  // Business rule: admin_remarks is REQUIRED when rejecting.
  if (!admin_remarks || String(admin_remarks).trim() === '') {
    throw new ApiError(422, 'admin_remarks is required when rejecting a claim.');
  }

  const claim = await claimModel.findById(claimId);
  if (!claim) throw new ApiError(404, 'Claim not found.');
  if (claim.status !== 'Pending') {
    throw new ApiError(409, `Claim is already ${claim.status}. Only pending claims can be rejected.`);
  }

  await claimModel.review(claimId, {
    status: 'Rejected',
    reviewed_by_university_id: req.user.university_id,
    admin_remarks,
  });

  await notificationModel.create({
    university_id: claim.claimant_university_id,
    title: 'Claim Rejected',
    message: `Your claim for "${claim.found_item_name}" was rejected. Reason: ${admin_remarks}`,
    notification_type: 'Claim',
    related_report_id: claim.found_report_id,
  });

  const updated = await claimModel.findById(claimId);
  return success(res, { message: 'Claim rejected.', data: { claim: updated } });
});

module.exports = { submitClaim, getUserClaims, getClaim, approveClaim, rejectClaim };
