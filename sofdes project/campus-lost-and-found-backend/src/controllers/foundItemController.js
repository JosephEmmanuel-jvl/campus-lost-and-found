/**
 * src/controllers/foundItemController.js
 * ---------------------------------------------------------------------------
 * Found Item Report endpoints.
 *   GET  /found-items      - list all found reports (optional status/category)
 *   GET  /found-items/:id  - single found report
 *   POST /found-items      - create a found report (locked after submission)
 * ---------------------------------------------------------------------------
 */

const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const foundItemModel = require('../models/foundItemModel');
const notificationModel = require('../models/notificationModel');

const getAll = asyncHandler(async (req, res) => {
  const { status, category } = req.query;
  const reports = await foundItemModel.findAll({ status, category });
  return success(res, { message: 'Found reports retrieved.', data: { reports } });
});

const getOne = asyncHandler(async (req, res) => {
  const report = await foundItemModel.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Found report not found.');
  return success(res, { message: 'Found report retrieved.', data: { report } });
});

const create = asyncHandler(async (req, res) => {
  const { item_name, description, category, keywords, photo_url, location_found, date_found } = req.body;

  const report = await foundItemModel.create({
    university_id: req.user.university_id,
    item_name,
    description,
    category,
    keywords,
    photo_url,
    location_found,
    date_found,
  });

  await notificationModel.create({
    university_id: req.user.university_id,
    title: 'Found Report Submitted',
    message: `Your found item report "${item_name}" has been recorded.`,
    notification_type: 'General',
    related_report_id: report.found_report_id,
  });

  return success(res, { statusCode: 201, message: 'Found report created.', data: { report } });
});

module.exports = { getAll, getOne, create };
