const { initializeDatabase } = require('../src/config/initDb');
const { pgPool } = require('../src/config/database');
initializeDatabase().then(result => console.log(result.created ? 'Application tables created.' : 'Application tables already exist; no changes.'))
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => pgPool.end());
