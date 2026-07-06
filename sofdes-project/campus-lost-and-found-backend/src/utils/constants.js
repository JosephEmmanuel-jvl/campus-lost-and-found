/**
 * src/utils/constants.js
 * ---------------------------------------------------------------------------
 * Shared enumerations used across models, controllers, and validation.
 * Keeping these in one place ensures the API, validation, and database stay
 * in sync with the approved schema (schema.sql).
 *
 * NOTE ON CATEGORIES:
 *   ENTITY_LIST.md / CHANGELOG mention "explicit category enumeration" but do
 *   not list the exact values. These were defined by Member 6 to fill that gap
 *   and MUST match the ENUM in schema.sql. If the team agrees on a different
 *   list, update BOTH this file and schema.sql together.
 * ---------------------------------------------------------------------------
 */

const CATEGORIES = [
  'Electronics',
  'Personal Belongings',
  'Documents',
  'Clothing',
  'Accessories',
  'Books',
  'Others',
];

const LOST_STATUS = ['Pending', 'Matched', 'Claimed'];
const FOUND_STATUS = ['Unclaimed', 'Matched', 'Claimed'];
const CLAIM_STATUS = ['Pending', 'Approved', 'Rejected'];
const NOTIFICATION_TYPES = ['General', 'Match', 'Claim', 'System'];
const ROLES = ['Student', 'Staff', 'Admin'];

module.exports = {
  CATEGORIES,
  LOST_STATUS,
  FOUND_STATUS,
  CLAIM_STATUS,
  NOTIFICATION_TYPES,
  ROLES,
};
