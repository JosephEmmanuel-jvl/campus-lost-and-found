// Trusted operator command: requires backend database credentials and is not an HTTP endpoint.
require('dotenv').config();

async function main() {
  const [universityId, role, ...extra] = process.argv.slice(2);
  if (!universityId || !['Student', 'Staff', 'Admin'].includes(role) || extra.length) {
    throw new Error('Usage: npm run db:set-role -- <existing-university-id> <Student|Staff|Admin>');
  }
  const { pgPool } = require('../src/config/database');
  try {
    const result = await pgPool.query('UPDATE public."user" SET role = $1 WHERE university_id = $2 RETURNING university_id, role', [role, universityId]);
    if (result.rowCount !== 1) throw new Error('User not found. Create a Student account first.');
    console.log('Role assigned to existing account: ' + result.rows[0].role);
  } finally {
    await pgPool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
