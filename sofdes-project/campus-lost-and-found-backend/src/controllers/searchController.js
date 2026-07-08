/**
 * src/controllers/searchController.js
 * ---------------------------------------------------------------------------
 * GET /search - search across lost AND found reports.
 * Query parameters (all optional): keyword, category, date, location.
 *
 * Returns matching reports from both tables, tagged with report_type so the
 * frontend can distinguish them.
 * ---------------------------------------------------------------------------
 */

const { pool } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const search = asyncHandler(async (req, res) => {
  const { keyword, category, date, location } = req.query;

  // Build a WHERE clause dynamically for lost reports.
  function buildQuery(table, locationCol, dateCol) {
    const clauses = [];
    const params = [];
    if (keyword) {
      const match = keyword.trim().match(/^(lst|fnd)-(\d+)$/i);
      if (match) {
        const idVal = parseInt(match[2], 10);
        const prefix = match[1].toLowerCase();
        if ((table === 'lost_item_report' && prefix === 'lst') || (table === 'found_item_report' && prefix === 'fnd')) {
          clauses.push(`${table === 'lost_item_report' ? 'lost_report_id' : 'found_report_id'} = ?`);
          params.push(idVal);
        } else {
          clauses.push('1 = 0');
        }
      } else {
        clauses.push('(item_name ILIKE ? OR description ILIKE ? OR keywords ILIKE ?)');
        const like = `%${keyword}%`;
        params.push(like, like, like);
      }
    }
    if (category) { clauses.push('category ILIKE ?'); params.push(category); }
    if (location) { clauses.push(`${locationCol} ILIKE ?`); params.push(`%${location}%`); }
    if (date) { clauses.push(`${dateCol} = ?`); params.push(date); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return { where, params };
  }

  const lostQ = buildQuery('lost_item_report', 'last_known_location', 'date_lost');
  const foundQ = buildQuery('found_item_report', 'location_found', 'date_found');

  const [lostRows] = await pool.execute(
    `SELECT lost_report_id AS report_id, item_name, description, category, keywords,
            last_known_location AS location, date_lost AS date, status, created_at,
            'lost' AS report_type, photo_url
       FROM lost_item_report ${lostQ.where}
      ORDER BY created_at DESC`,
    lostQ.params
  );

  const [foundRows] = await pool.execute(
    `SELECT found_report_id AS report_id, item_name, description, category, keywords,
            location_found AS location, date_found AS date, status, created_at,
            'found' AS report_type, photo_url
       FROM found_item_report ${foundQ.where}
      ORDER BY created_at DESC`,
    foundQ.params
  );

  const results = [...lostRows, ...foundRows].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return success(res, {
    message: 'Search results retrieved.',
    data: { count: results.length, results },
  });
});

module.exports = { search };
