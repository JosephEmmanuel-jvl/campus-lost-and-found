/**
 * src/config/initDb.js
 * ---------------------------------------------------------------------------
 * Auto-initializes the database with schema and seed data if the tables
 * do not exist yet. This makes deploying to cloud environments like Supabase
 * completely zero-configuration.
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const env = require('./env');

async function initializeDatabase(pool) {
  try {
    console.log('[DB Init] Checking if database tables exist...');
    
    // We check if the 'user' table exists in the public schema
    const [tables] = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user'`
    );

    if (tables && tables.length > 0) {
      console.log('[DB Init] "user" table already exists. Skipping database initialization.');
      return;
    }

    console.log('[DB Init] Database is empty. Starting automatic initialization...');

    // Resolve paths to the schema and seed SQL files
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');

    if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
      console.error('[DB Init] Critical Error: schema.sql or seed.sql is missing!');
      return;
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    // Create a temporary client to run the scripts
    console.log('[DB Init] Connecting with temporary pg client...');
    const client = new Client({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    });

    await client.connect();

    try {
      console.log('[DB Init] Running schema.sql...');
      await client.query(schemaSql);
      console.log('[DB Init] schema.sql executed successfully.');

      console.log('[DB Init] Running seed.sql...');
      await client.query(seedSql);
      console.log('[DB Init] seed.sql executed successfully.');

      console.log('[DB Init] Database initialization completed successfully!');
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('[DB Init] Error during database initialization:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
