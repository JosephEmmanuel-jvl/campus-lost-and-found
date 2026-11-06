const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// Unit tests never open a database connection.
Object.assign(process.env, {
  DB_HOST: '127.0.0.1', DB_PORT: '1', DB_USER: 'unit_test', DB_NAME: 'unit_test',
  JWT_SECRET: crypto.randomBytes(32).toString('hex'), NODE_ENV: 'test', DB_SSL: 'false',
});
const { translateQuery } = require('../src/config/database');
const { requireDemoPassword, requireResetConfirmation } = require('../src/config/developmentTools');
const { initializeDatabase } = require('../src/config/initDb');

test('SQL adapter preserves the user literal, quoted identifiers and literal question marks', () => {
  const sql = `SELECT 'user', '?', "user", $$? user$$, $body$? user$body$ FROM "user" WHERE university_id = ? -- user ?\n/* user ? */ AND role = ?`;
  const result = translateQuery(sql, ['id', 'Student']);
  assert.equal(result.sql, sql.replace('university_id = ?', 'university_id = $1').replace('role = ?', 'role = $2'));
  assert.deepEqual(result.params, ['id', 'Student']);
  assert.equal(translateQuery("SELECT tablename FROM pg_tables WHERE tablename = 'user'").sql,
    "SELECT tablename FROM pg_tables WHERE tablename = 'user'");
});

test('demo tools require explicit development, flag and a supplied password', () => {
  const password = crypto.randomBytes(20).toString('hex');
  for (const NODE_ENV of [undefined, 'test', 'production']) {
    assert.throws(() => requireDemoPassword({ NODE_ENV, ENABLE_DEMO_DATA: 'true', DEMO_PASSWORD: password }));
  }
  for (const ENABLE_DEMO_DATA of [undefined, 'false', '1']) {
    assert.throws(() => requireDemoPassword({ NODE_ENV: 'development', ENABLE_DEMO_DATA, DEMO_PASSWORD: password }));
  }
  assert.throws(() => requireDemoPassword({ NODE_ENV: 'development', ENABLE_DEMO_DATA: 'true' }));
  assert.equal(requireDemoPassword({ NODE_ENV: 'development', ENABLE_DEMO_DATA: 'true', DEMO_PASSWORD: password }), password);
});

test('reset confirmation guard fails closed (no reset command is executed)', () => {
  const settings = { NODE_ENV: 'development', ALLOW_DATABASE_RESET: 'true', DB_NAME: 'local_test' };
  assert.throws(() => requireResetConfirmation([], settings));
  assert.throws(() => requireResetConfirmation(['--confirm-database=wrong'], settings));
  assert.throws(() => requireResetConfirmation(['--confirm-database=local_test'], { ...settings, NODE_ENV: 'production' }));
  assert.throws(() => requireResetConfirmation(['--confirm-database=local_test'], { ...settings, ALLOW_DATABASE_RESET: 'false' }));
  assert.doesNotThrow(() => requireResetConfirmation(['--confirm-database=local_test'], settings));
});

test('initial migration and demo seed contain no destructive statements', () => {
  for (const file of ['database/migrations/001-initial.sql', 'database/seed.sql']) {
    const sql = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace(/--[^\n]*/g, '');
    assert.doesNotMatch(sql, /^\s*(DROP|TRUNCATE|DELETE)\b/im);
  }
});

test('partial schemas fail without migration execution and release the connection', async () => {
  const calls = [];
  let released = false;
  const client = {
    async query(sql) {
      calls.push(sql);
      return { rows: sql.startsWith('SELECT tablename') ? [{ tablename: 'user' }] : [] };
    },
    release() { released = true; },
  };
  await assert.rejects(initializeDatabase({ connect: async () => client }), /Incomplete application schema/);
  assert.equal(calls.at(-1), 'ROLLBACK');
  assert.equal(released, true);
  assert.ok(calls.every(sql => !/CREATE TABLE|DROP TABLE|TRUNCATE/i.test(sql)));
});
