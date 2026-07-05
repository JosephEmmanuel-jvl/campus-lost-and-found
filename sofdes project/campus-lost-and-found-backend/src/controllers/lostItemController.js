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

  // System-generated confirmation notification for the reporter.
  await notificationModel.create({
    university_id: req.user.university_id,
    title: 'Lost Report Submitted',
    message: `Your lost item report "${item_name}" has been recorded and is now pending a match.`,
    notification_type: 'General',
    related_report_id: report.lost_report_id,
  });

  return success(res, { statusCode: 201, message: 'Lost report created.', data: { report } });
});

module.exports = { getAll, getOne, create };
