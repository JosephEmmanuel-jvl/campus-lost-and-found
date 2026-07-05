/**
 * src/config/env.js
 * ---------------------------------------------------------------------------
 * Loads and validates environment variables in one place so the rest of the
 * app never reads process.env directly. Fails fast if required values are
 * missing, which prevents confusing runtime errors later.
 * ---------------------------------------------------------------------------
 */

require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

function optional(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

const env = {
  // Server
  port: parseInt(optional('PORT', '5000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),

  // Database
  db: {
    host: required('DB_HOST'),
    port: parseInt(optional('DB_PORT', '3306'), 10),
    user: required('DB_USER'),
    password: optional('DB_PASSWORD', ''),
    database: required('DB_NAME'),
    connectionLimit: parseInt(optional('DB_CONNECTION_LIMIT', '10'), 10),
  },

  // Auth
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '1d'),
  },
  bcryptSaltRounds: parseInt(optional('BCRYPT_SALT_ROUNDS', '10'), 10),

  // CORS
  corsOrigin: optional('CORS_ORIGIN', 'http://localhost:5173'),
};

module.exports = env;
