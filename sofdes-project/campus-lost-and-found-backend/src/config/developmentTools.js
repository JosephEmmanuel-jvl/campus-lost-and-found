require('dotenv').config();

function requireDemoPassword(settings = process.env) {
  if (settings.NODE_ENV !== 'development' || settings.ENABLE_DEMO_DATA !== 'true') {
    throw new Error('Demo tools require NODE_ENV=development and ENABLE_DEMO_DATA=true.');
  }
  const password = settings.DEMO_PASSWORD;
  if (!password || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Set DEMO_PASSWORD to at least 12 characters and at most 72 UTF-8 bytes.');
  }
  return password;
}

function requireResetConfirmation(args, settings = process.env) {
  if (settings.NODE_ENV !== 'development' || settings.ALLOW_DATABASE_RESET !== 'true' ||
      !settings.DB_NAME || !args.includes('--confirm-database=' + settings.DB_NAME)) {
    throw new Error('Reset requires NODE_ENV=development, ALLOW_DATABASE_RESET=true and --confirm-database=<DB_NAME>.');
  }
}

module.exports = { requireDemoPassword, requireResetConfirmation };
