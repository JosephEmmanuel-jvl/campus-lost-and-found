/**
 * generate-hashes.js
 * ---------------------------------------------------------------------------
 * Helper utility for Member 6 (Database & Backend Support).
 *
 * Generates real bcrypt hashes for the seed users so that login (Member 1)
 * works out of the box. Run this AFTER `npm install` (which installs bcrypt),
 * then paste the printed hashes into database/seed.sql, replacing the
 * password_hash values.
 *
 * Usage:
 *   node database/generate-hashes.js
 *   node database/generate-hashes.js "MyCustomPassword"
 *
 * The default seed password is "Password123!".
 * ---------------------------------------------------------------------------
 */

const bcrypt = require('bcrypt');
require('dotenv').config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
const password = process.argv[2] || 'Password123!';

const seedUsers = [
  '2021-00001 (Admin - Alice)',
  '2021-00002 (Staff - Benjamin)',
  '2022-10001 (Student - Carla)',
  '2022-10002 (Student - Daniel)',
  '2022-10003 (Student - Erika)',
];

(async () => {
  console.log(`\nGenerating bcrypt hashes for password: "${password}" (cost=${SALT_ROUNDS})\n`);
  for (const label of seedUsers) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(`${label}\n  ${hash}\n`);
  }
  console.log('Paste each hash into the matching row in database/seed.sql.\n');
})();
