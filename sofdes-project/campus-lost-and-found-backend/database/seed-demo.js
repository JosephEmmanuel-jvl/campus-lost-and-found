const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { requireDemoPassword } = require('../src/config/developmentTools');
const { MOCK_CAMPUS_DATABASE } = require('../src/config/campusDb');

async function ensureMockUsersExist() {
  const password = requireDemoPassword(); // Guard before loading configuration or opening a connection.
  const { pgPool } = require('../src/config/database');
  const env = require('../src/config/env');
  const hash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.node_env', $1, true), set_config('app.enable_demo_data', $2, true)", ['development', 'true']);
    const result = await client.query(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'), [hash, JSON.stringify(MOCK_CAMPUS_DATABASE)]);
    await client.query('COMMIT');
    return result.rowCount;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  ensureMockUsersExist().then(count => console.log('Demo accounts inserted: ' + count))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(async () => {
      const cached = require.cache[require.resolve('../src/config/database')];
      if (cached) await cached.exports.pgPool.end();
    });
}
module.exports = { ensureMockUsersExist };
