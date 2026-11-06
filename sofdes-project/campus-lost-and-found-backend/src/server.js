/**
 * src/server.js
 * ---------------------------------------------------------------------------
 * Application entry point. Verifies the database connection first (fail fast
 * with a clear message), then starts the HTTP server.
 * ---------------------------------------------------------------------------
 */

const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/database');
const { ensureDatabaseReady } = require('./config/initDb');

async function start() {
  try {
    await testConnection();
    console.log(`[DB] Connected to PostgreSQL database "${env.db.database}" at ${env.db.host}:${env.db.port}`);

    // Create application tables only when absent; never reset or seed at startup.
    await ensureDatabaseReady();

    app.listen(env.port, () => {
      console.log(`[Server] Running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
      console.log(`[Server] API base path: /api/v1`);
    });
  } catch (err) {
    console.error('[Startup Error] Could not start the server.');
    console.error(err.message);
    console.error('Check that PostgreSQL is running and your .env values are correct.');
    process.exit(1);
  }
}

start();
