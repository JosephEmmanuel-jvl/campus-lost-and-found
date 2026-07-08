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

  try {
    // Expecting format: data:image/png;base64,iVBORw0K...
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new ApiError(400, 'Invalid file format. Base64 data URL is required.');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Validate file size (e.g. 5MB limit)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new ApiError(400, 'File size exceeds the 5MB limit.');
    }

    const extension = mimeType.split('/')[1] || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    const relativeUrl = `/uploads/${filename}`;

    return success(res, {
      message: 'File uploaded successfully.',
      data: { url: relativeUrl }
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `File upload failed: ${err.message}`);
  }
});

module.exports = { uploadFile };
