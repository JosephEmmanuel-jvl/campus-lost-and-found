/**
 * src/config/database.js
 * ---------------------------------------------------------------------------
 * Creates and exports a MySQL connection pool using mysql2's promise API.
 * All models import `pool` from here and use pool.query() / pool.execute().
 *
 * A pool (rather than a single connection) is used so concurrent requests
 * do not block each other — this supports the non-functional requirement of
 * handling multiple simultaneous users.
 * ---------------------------------------------------------------------------
 */

const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  // Return DATE/DATETIME as strings to avoid timezone surprises across
  // the team's different local environments.
  dateStrings: true,
});

/**
 * Verifies the pool can reach MySQL. Called once on server startup so we
 * fail fast with a clear message instead of on the first request.
 */
async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
