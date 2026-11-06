const fs = require('fs');
const path = require('path');
const { pgPool } = require('./database');

const TABLES = ['user', 'lost_item_report', 'found_item_report', 'claim_request', 'notification'];

async function initializeDatabase(dbPool = pgPool) {
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET LOCAL search_path TO public');
    // Serialize first startup across processes/serverless instances.
    await client.query('SELECT pg_advisory_xact_lock(742311, 1)');
    const { rows } = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = $1 AND tablename = ANY($2::text[])",
      ['public', TABLES]
    );
    if (rows.length > 0 && rows.length !== TABLES.length) {
      throw new Error('Incomplete application schema. Startup will not reset or repair existing tables; apply a reviewed migration.');
    }
    const created = rows.length === 0;
    if (created) {
      const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations/001-initial.sql'), 'utf8');
      await client.query(sql);
    }
    await client.query('COMMIT');
    return { created };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

let initialization;
function ensureDatabaseReady() {
  if (!initialization) {
    initialization = initializeDatabase().catch(error => {
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

module.exports = { initializeDatabase, ensureDatabaseReady };
