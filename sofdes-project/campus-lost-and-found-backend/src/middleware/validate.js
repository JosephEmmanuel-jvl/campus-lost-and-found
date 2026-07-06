/**
 * src/middleware/validate.js
 * ---------------------------------------------------------------------------
 * A small, dependency-free request-body validator. Kept intentionally simple
 * so the project stays within the approved stack (no extra validation library).
 *
 * Each field rule supports:
 *   required   : boolean
 *   type       : 'string' | 'number' | 'boolean' | 'date'
 *   enum       : array of allowed values
 *   minLength  : number (for strings)
 *   maxLength  : number (for strings)
 *
 * Usage in a route:
 *   const rules = {
 *     item_name: { required: true, type: 'string', maxLength: 150 },
 *     category:  { required: true, enum: CATEGORIES },
 *   };
 *   router.post('/lost-items', authenticate, validateBody(rules), handler);
 *
 * On failure it responds 422 with a per-field error map. Reusable by
 * Members 1, 2, 3, and 5 for their write endpoints.
 * ---------------------------------------------------------------------------
 */

const { error } = require('../utils/apiResponse');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

function checkType(value, type) {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return typeof value === 'string' && DATE_REGEX.test(value) && !Number.isNaN(Date.parse(value));
    default:
      return true;
  }
}

function validateBody(rules) {
  return function (req, res, next) {
    const body = req.body || {};
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = body[field];
      const isMissing = value === undefined || value === null || value === '';

      if (rule.required && isMissing) {
        errors[field] = `${field} is required.`;
        continue;
      }
      if (isMissing) continue; // optional and absent -> skip further checks

      if (rule.type && !checkType(value, rule.type)) {
        errors[field] = `${field} must be a valid ${rule.type}.`;
        continue;
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rule.enum.join(', ')}.`;
        continue;
      }
      if (rule.minLength && typeof value === 'string' && value.trim().length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters.`;
        continue;
      }
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors[field] = `${field} must be at most ${rule.maxLength} characters.`;
        continue;
      }
    }

    if (Object.keys(errors).length > 0) {
      return error(res, { statusCode: 422, message: 'Validation failed.', errors });
    }
    next();
  };
}

module.exports = { validateBody };
