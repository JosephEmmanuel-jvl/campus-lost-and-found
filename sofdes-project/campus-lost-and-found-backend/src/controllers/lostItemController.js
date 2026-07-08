/**
 * src/controllers/lostItemController.js
 * ---------------------------------------------------------------------------
 * Lost Item Report endpoints.
 *   GET  /lost-items       - list all lost reports (optional status/category)
 *   GET  /lost-items/:id   - single lost report
 *   POST /lost-items       - create a lost report (locked after submission)
 *
 * On creation, a confirmation notification is generated for the reporter
 * (notifications are system-generated per ENTITY_LIST.md).
 * ---------------------------------------------------------------------------
 */

const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const lostItemModel = require('../models/lostItemModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');

const getAll = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const reports = await lostItemModel.findAll({ status, category });
  return success(res, { message: 'Lost reports retrieved.', data: { reports } });
});

const getOne = asyncHandler(async (req, res) => {
  const report = await lostItemModel.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Lost report not found.');
  return success(res, { message: 'Lost report retrieved.', data: { report } });
});

const create = asyncHandler(async (req, res) => {
  const { item_name, description, category, keywords, photo_url, last_known_location, date_lost } = req.body;

  const report = await lostItemModel.create({
    university_id: req.user.university_id,
    item_name,
    description,
    category,
    keywords,
    photo_url,
    last_known_location,
    date_lost,
  });

  // 1. Confirm submission to the reporter
  await notificationModel.create({
    university_id: req.user.university_id,
    title: 'Lost Report Submitted',
    message: `Your lost item report "${item_name}" has been recorded and is now pending a match.`,
    notification_type: 'Lost',
    related_report_id: report.lost_report_id,
  });

  // 2. Notify Admin and Staff users only (not all students)
  try {
    const users = await userModel.findAll();
    const adminsAndStaff = users.filter(u => (u.role === 'Admin' || u.role === 'Staff') && u.university_id !== req.user.university_id);
    for (const u of adminsAndStaff) {
      await notificationModel.create({
        university_id: u.university_id,
        title: 'New Lost Report',
        message: `A new lost item "${item_name}" has been reported at ${last_known_location || 'Campus'} by ${req.user.first_name || req.user.university_id}.`,
        notification_type: 'Lost',
        related_report_id: report.lost_report_id,
      });
    }
  } catch (err) {
    console.error('Error notifying staff/admin of new lost report:', err);
  }

  return success(res, { statusCode: 201, message: 'Lost report created.', data: { report } });
});

module.exports = { getAll, getOne, create };
