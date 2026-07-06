/**
 * src/config/initDb.js
 * ---------------------------------------------------------------------------
 * Auto-initializes the database with schema and seed data if the tables
 * do not exist yet. This makes deploying to cloud environments like Railway
 * completely zero-configuration.
 * ---------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('./env');

async function initializeDatabase(pool) {
  try {
    console.log('[DB Init] Checking if database tables exist...');
    
    // We check if the 'user' table exists to determine if we need to initialize
    const [tables] = await pool.query("SHOW TABLES LIKE 'user'");

    if (tables.length > 0) {
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

    let schemaSql = fs.readFileSync(schemaPath, 'utf8');
    let seedSql = fs.readFileSync(seedPath, 'utf8');

    // Remove DB creation/selection statements so the scripts execute within
    // the database provided by Railway (which might have a custom name like 'railway')
    schemaSql = schemaSql
      .replace(/CREATE DATABASE[\s\S]*?COLLATE\s+\w+;/gi, '-- Removed CREATE DATABASE')
      .replace(/USE\s+\w+;/gi, '-- Removed USE DB');

    seedSql = seedSql.replace(/USE\s+\w+;/gi, '-- Removed USE DB');

    // Create a temporary connection with multipleStatements enabled to run the scripts
    console.log('[DB Init] Connecting with temporary multipleStatements connection...');
    const connection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      multipleStatements: true,
    });

    try {
      console.log('[DB Init] Running schema.sql...');
      await connection.query(schemaSql);
      console.log('[DB Init] schema.sql executed successfully.');

      console.log('[DB Init] Running seed.sql...');
      await connection.query(seedSql);
      console.log('[DB Init] seed.sql executed successfully.');

      console.log('[DB Init] Database initialization completed successfully!');
    } finally {
      await connection.end();
    }
  } catch (error) {
    console.error('[DB Init] Error during database initialization:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
