/**
 * src/middleware/errorHandler.js
 * ---------------------------------------------------------------------------
 * Central error handling for the API.
 *
 *   notFound     - catches requests to unknown routes and returns 404 JSON.
 *   errorHandler - final middleware; converts thrown errors into consistent
 *                  JSON responses. Recognizes ApiError (with statusCode) and
 *                  common PostgreSQL errors (e.g., duplicate key, FK violations).
 * ---------------------------------------------------------------------------
 */

const env = require('../config/env');
const { error } = require('../utils/apiResponse');

function notFound(req, res) {
  return error(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Known, intentional API errors.
  if (err && err.isApiError) {
    return error(res, {
      statusCode: err.statusCode || 400,
      message: err.message,
      errors: err.errors,
    });
  }

  // Translate a few common PostgreSQL errors into friendly messages.
  if (err && err.code) {
    switch (err.code) {
      case '23505':
        return error(res, { statusCode: 409, message: 'A record with that value already exists.' });
      case '23503':
        return error(res, { statusCode: 409, message: 'Operation violates a database relationship constraint.' });
      case '23502':
      case '23514':
        return error(res, { statusCode: 422, message: 'A required field was missing.' });
      default:
        break;
    }
  }

  // Fallback: unexpected server error.
  // Log full detail server-side; expose stack only in development.
  console.error('[Unhandled Error]', err);
  return error(res, {
    statusCode: 500,
    message: 'Internal server error.',
    errors: env.nodeEnv === 'development' && err ? { stack: err.stack } : null,
  });
}

module.exports = { notFound, errorHandler };
