const fs = require('fs');
const path = require('path');
const { requireResetConfirmation } = require('../src/config/developmentTools');

async function main() {
  requireResetConfirmation(process.argv.slice(2));
  const { pgPool } = require('../src/config/database');
  try {
    await pgPool.query(fs.readFileSync(path.join(__dirname, 'reset.sql'), 'utf8'));
    console.log('Application tables removed. Run db:init to create empty tables.');
  } finally {
    await pgPool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
