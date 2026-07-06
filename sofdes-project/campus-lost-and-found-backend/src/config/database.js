/**
 * src/config/database.js
 * ---------------------------------------------------------------------------
 * Creates and exports a PostgreSQL connection pool wrapper that mimics
 * the mysql2 API to minimize refactoring across the codebase.
 *
 * It dynamically translates SQL syntax (MySQL ? placeholders to PostgreSQL $1, $2,
 * and quotes the reserved keyword "user").
 * ---------------------------------------------------------------------------
 */

const { Pool } = require('pg');
const env = require('./env');

const pgPool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  max: env.db.connectionLimit,
  // SSL is required for production databases like Supabase
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

function translateQuery(sql, params = []) {
  let index = 1;
  let translatedSql = sql.replace(/\?/g, () => `$${index++}`);
  // Quote the reserved keyword "user" as "\"user\"" for PostgreSQL compatibility
  translatedSql = translatedSql.replace(/\buser\b/gi, '"user"');
  return { sql: translatedSql, params };
}

function formatResult(sql, res) {
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
  if (isSelect) {
    return [res.rows, null];
  }
  
  // For INSERT/UPDATE/DELETE, return a mysql2-compatible result object
  let insertId = null;
  if (res.rows && res.rows[0]) {
    const row = res.rows[0];
    insertId = row.claim_id || row.found_report_id || row.lost_report_id || row.notification_id || null;
  }
  
  const resultObject = {
    insertId,
    affectedRows: res.rowCount,
    rowCount: res.rowCount,
  };
  return [resultObject, null];
}

const pool = {
  async query(sql, params) {
    const { sql: pgSql, params: pgParams } = translateQuery(sql, params);
    const res = await pgPool.query(pgSql, pgParams);
    return formatResult(sql, res);
  },

  async execute(sql, params) {
    return this.query(sql, params);
  },

  async getConnection() {
    const client = await pgPool.connect();
    return {
      async execute(sql, params) {
        const { sql: pgSql, params: pgParams } = translateQuery(sql, params);
        const res = await client.query(pgSql, pgParams);
        return formatResult(sql, res);
      },
      async query(sql, params) {
        return this.execute(sql, params);
      },
      async beginTransaction() {
        await client.query('BEGIN');
      },
      async commit() {
        await client.query('COMMIT');
      },
      async rollback() {
        await client.query('ROLLBACK');
      },
      release() {
        client.release();
      }
    };
  },
  
  // Direct client acquisition
  async connect() {
    return this.getConnection();
  }
};

async function testConnection() {
  const client = await pgPool.connect();
  try {
    await client.query('SELECT NOW()');
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
