/**
 * src/utils/apiResponse.js
 * ---------------------------------------------------------------------------
 * Standardized JSON response shapes so every endpoint returns a consistent
 * structure. The frontend (Members 4 & 5) can rely on this contract.
 *
 * Success:  { success: true,  message, data }
 * Error:    { success: false, message, errors }
 * ---------------------------------------------------------------------------
 */

function success(res, { statusCode = 200, message = 'OK', data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function error(res, { statusCode = 400, message = 'Request failed', errors = null } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = { success, error };
