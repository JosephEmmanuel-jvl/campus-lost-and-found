/**
 * src/middleware/roleMiddleware.js
 * ---------------------------------------------------------------------------
 * Role-based access control (RBAC). Use AFTER `authenticate` so req.user is set.
 *
 * Usage:
 *   router.patch('/claims/:id/approve', authenticate, authorize('Admin'), handler)
 *   router.get('/some',                 authenticate, authorize('Staff','Admin'), handler)
 *
 * Per the approved Authorization Matrix (API_Specifications.md):
 *   - Admin-only : Confirm Match, Approve Claim, Reject Claim,
 *                  Admin Dashboard, User Management.
 *   - Any authenticated role (Student/Staff/Admin): everything else that
 *     requires auth (submit reports, submit claim, view notifications, etc.).
 *
 * A convenience `adminOnly` export is provided for the Admin-only endpoints.
 * ---------------------------------------------------------------------------
 */

const { ApiError } = require('../utils/asyncHandler');

const VALID_ROLES = ['Student', 'Staff', 'Admin'];

/**
 * Returns middleware that allows only the listed roles.
 * @param  {...string} allowedRoles - one or more of Student, Staff, Admin
 */
function authorize(...allowedRoles) {
  // Guard against typos in route definitions.
  for (const role of allowedRoles) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`authorize(): unknown role "${role}"`);
    }
  }

  return function (req, res, next) {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
}

// Shorthand for the Admin-only endpoints in the authorization matrix.
const adminOnly = authorize('Admin');
const staffOrAdmin = authorize('Staff', 'Admin');

module.exports = { authorize, adminOnly, staffOrAdmin, VALID_ROLES };
