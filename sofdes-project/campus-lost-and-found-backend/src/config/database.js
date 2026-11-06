// PostgreSQL pool with the existing [rows, metadata] model interface.
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
  ssl: env.db.ssl ? { rejectUnauthorized: true, ...(env.db.sslCa ? { ca: env.db.sslCa } : {}) } : false,
  connectionTimeoutMillis: 10000,
});

function translateQuery(sql, params = []) {
  let index = 1;
  // Skip SQL literals, quoted identifiers and comments when replacing placeholders.
  const translatedSql = sql.replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*|\/\*[\s\S]*?\*\/|\$([a-zA-Z_][a-zA-Z_0-9]*|)\$[\s\S]*?\$\1\$|\?/g,
    token => token === '?' ? `$${index++}` : token);
  return { sql: translatedSql, params };
}

function formatResult(sql, res) {
  const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
  if (isSelect) {
    return [res.rows, null];
  }
  
  // For INSERT/UPDATE/DELETE, return a model-compatible result object
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

module.exports = { pool, pgPool, testConnection, translateQuery };
