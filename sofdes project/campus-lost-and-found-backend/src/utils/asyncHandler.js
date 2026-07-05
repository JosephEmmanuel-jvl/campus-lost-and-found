/**
 * src/utils/asyncHandler.js
 * ---------------------------------------------------------------------------
 * Wraps async route handlers so thrown errors (or rejected promises) are
 * forwarded to Express's error-handling middleware automatically, instead of
 * requiring try/catch in every controller.
 *
 * Also exports ApiError — a small custom error class that lets controllers
 * throw errors with an HTTP status code that the error middleware understands.
 * ---------------------------------------------------------------------------
 */

class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isApiError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler, ApiError };
