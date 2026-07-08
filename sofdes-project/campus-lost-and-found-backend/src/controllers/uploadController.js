/**
 * src/controllers/uploadController.js
 * ---------------------------------------------------------------------------
 * Handles base64 file uploads and saves them to the static /uploads directory.
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const uploadFile = asyncHandler(async (req, res) => {
  const { file } = req.body;

  if (!file) {
    throw new ApiError(400, 'No file data provided.');
  }

  // Simply return the base64 data URL itself instead of writing to disk.
  // This avoids read-only filesystem errors (ENOENT) on serverless environments like Vercel.
  return success(res, {
    message: 'File processed successfully.',
    data: { url: file }
  });
});

module.exports = { uploadFile };
