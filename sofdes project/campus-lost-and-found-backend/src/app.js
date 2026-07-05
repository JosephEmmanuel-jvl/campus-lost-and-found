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

const app = express();

// --- Global middleware ----------------------------------------------------
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
