/**
 * src/app.js
 * ---------------------------------------------------------------------------
 * Builds and configures the Express application:
 *   - Global middleware (CORS, JSON body parsing)
 *   - Health check
 *   - API routes mounted under /api/v1
 *   - 404 + central error handling (must be registered LAST)
 *
 * The app is exported without calling listen() so it can be started by
 * server.js (and imported by tests if needed).
 * ---------------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { success } = require('./utils/apiResponse');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const path = require('path');

const app = express();

// --- Database Auto-Initialization for Serverless (Vercel) -----------------
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      const { pool } = require('./config/database');
      const { initializeDatabase, ensureMockUsersExist } = require('./config/initDb');
      await initializeDatabase(pool);
      await ensureMockUsersExist(pool);

      // Ensure photo_url can store base64 data URLs
      try {
        await pool.query('ALTER TABLE lost_item_report ALTER COLUMN photo_url TYPE TEXT');
        await pool.query('ALTER TABLE found_item_report ALTER COLUMN photo_url TYPE TEXT');
      } catch (migrationErr) {
        console.error('[Vercel DB Migration Error]', migrationErr);
      }

      dbInitialized = true;
    } catch (err) {
      console.error('[Vercel DB Init Error]', err);
    }
  }
  next();
});

// --- Global middleware ----------------------------------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Static files --------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Health check ---------------------------------------------------------
app.get('/health', (req, res) =>
  success(res, { message: 'Campus Lost and Found API is running.', data: { status: 'ok' } })
);

// --- API routes (all under /api/v1) --------------------------------------
app.use('/api/v1', apiRoutes);

// --- Fallbacks (registered last) -----------------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
