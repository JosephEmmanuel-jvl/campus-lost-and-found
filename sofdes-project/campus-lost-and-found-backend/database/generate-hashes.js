const bcrypt = require('bcrypt');
const { requireDemoPassword } = require('../src/config/developmentTools');

async function main() {
  const password = requireDemoPassword();
  if (process.argv.length > 2) throw new Error('Use DEMO_PASSWORD, not a command-line password.');
  // Print only the generated hash; never print or persist the plaintext password.
  console.log(await bcrypt.hash(password, 10));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
