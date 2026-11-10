const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');
const { Client } = require('pg');

const enabled = process.env.RUN_LOCAL_SECURITY_TESTS === 'true';
test('fresh local PostgreSQL startup, roles, fixtures and restart preservation', { skip: !enabled, timeout: 120000 }, async t => {
  assert.equal(process.env.DB_HOST, '127.0.0.1');
  assert.match(process.env.DB_NAME, /^campus_security_test_[a-z0-9_]+$/);
  assert.ok(process.env.DB_PORT && process.env.DB_PORT !== '5432');
  const cwd = path.resolve(__dirname, '../..');
  const password = crypto.randomBytes(20).toString('hex');
  const environment = {
    ...process.env, NODE_ENV: 'production', DB_SSL: 'false', ENABLE_DEMO_DATA: 'true',
    DEMO_PASSWORD: password, JWT_SECRET: crypto.randomBytes(32).toString('hex'), BCRYPT_SALT_ROUNDS: '4',
  };
  const db = new Client({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, ssl: false });
  await db.connect();
  let server;
  let logs = '';
  async function stop() {
    if (server && server.exitCode === null) {
      const exited = once(server, 'exit');
      server.kill();
      await exited;
    }
  }
  async function start() {
    server = spawn(process.execPath, ['src/server.js'], { cwd, env: environment, windowsHide: true });
    server.stdout.on('data', chunk => { logs += chunk; });
    server.stderr.on('data', chunk => { logs += chunk; });
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error('Backend exited: ' + logs);
      try {
        const response = await fetch(`http://127.0.0.1:${environment.PORT}/health`);
        if (response.ok) return;
      } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Backend startup timeout: ' + logs);
  }
  async function request(route, body, token, method = 'POST') {
    const response = await fetch(`http://127.0.0.1:${environment.PORT}/api/v1${route}`, {
      method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  }
  function command(file, args = [], overrides = {}) {
    return spawnSync(process.execPath, [file, ...args], { cwd, env: { ...environment, ...overrides }, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  }
  try {
    await t.test('database is empty before backend starts; startup creates five tables and no demo accounts', async () => {
      assert.equal((await db.query("SELECT * FROM pg_tables WHERE schemaname='public'")).rowCount, 0);
      await start();
      assert.equal((await db.query("SELECT * FROM pg_tables WHERE schemaname='public'")).rowCount, 5);
      assert.equal((await db.query('SELECT * FROM public."user"')).rowCount, 0);
      const rls = await db.query("SELECT relname FROM pg_class JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace WHERE nspname = 'public' AND relkind = 'r' AND relrowsecurity = true");
      assert.deepEqual(rls.rows.map(row => row.relname).sort(),
        ['claim_request', 'found_item_report', 'lost_item_report', 'notification', 'user']);
    });
    const ids = ['2099-00001', '2099-10001', '2099-20001'];
    let studentToken;
    await t.test('public signup with any role digit or forged role creates only Students', async () => {
      for (const university_id of ids) {
        const response = await request('/auth/login', { university_id, password, role: 'Admin' });
        assert.equal(response.status, 200);
        assert.equal(response.body.data.user.role, 'Student');
        assert.equal(response.body.data.user.password_hash, undefined);
        studentToken = response.body.data.token;
      }
      assert.equal((await request('/admin/dashboard', null, studentToken, 'GET')).status, 403);
      assert.equal((await request('/auth/login', { university_id: '2099-20002', password: 'short' })).status, 422);
      assert.equal((await request('/auth/login', { university_id: 'invalid', password })).status, 400);
      assert.equal((await request('/auth/login', { university_id: ids[0], password: crypto.randomBytes(20).toString('hex') })).status, 401);
    });
    await t.test('trusted role command preserves existing passwords and Admin/Staff logins', async () => {
      for (const [id, role] of [[ids[0], 'Admin'], [ids[1], 'Staff']]) {
        const assigned = command('database/set-user-role.js', [id, role]);
        assert.equal(assigned.status, 0, assigned.stderr);
        const response = await request('/auth/login', { university_id: id, password });
        assert.equal(response.status, 200);
        assert.equal(response.body.data.user.role, role);
      }
      assert.notEqual(command('database/set-user-role.js', [ids[2], 'SuperAdmin']).status, 0);
      const profile = await request('/users/profile', { first_name: 'Test', role: 'Admin' }, studentToken, 'PUT');
      assert.equal(profile.status, 200);
      assert.equal(profile.body.data.user.role, 'Student');
      // The database role is checked on each authenticated request, including old tokens.
      assert.equal(command('database/set-user-role.js', [ids[2], 'Staff']).status, 0);
      assert.equal((await request('/admin/dashboard', null, studentToken, 'GET')).status, 200);
      assert.equal(command('database/set-user-role.js', [ids[2], 'Student']).status, 0);
      assert.equal((await request('/admin/dashboard', null, studentToken, 'GET')).status, 403);
    });
    await t.test('production blocks demo seed and hash commands even with the flag set', async () => {
      for (const file of ['database/seed-demo.js', 'database/generate-hashes.js']) {
        const result = command(file);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /require NODE_ENV=development/);
        assert.ok(!(result.stdout + result.stderr).includes(password));
        assert.notEqual(command(file, [], { NODE_ENV: 'development', ENABLE_DEMO_DATA: 'false' }).status, 0);
      }
      assert.equal((await db.query('SELECT * FROM public."user" WHERE university_id LIKE $1', ['DEMO-%'])).rowCount, 0);
    });
    await t.test('explicit development seed inserts only fake accounts and is non-destructive and repeatable', async () => {
      const before = (await db.query('SELECT * FROM public."user" ORDER BY university_id')).rows;
      for (let i = 0; i < 2; i++) {
        const result = command('database/seed-demo.js', [], { NODE_ENV: 'development', ENABLE_DEMO_DATA: 'true' });
        assert.equal(result.status, 0, result.stderr);
        assert.ok(!(result.stdout + result.stderr).includes(password));
      }
      const after = (await db.query('SELECT * FROM public."user" WHERE university_id NOT LIKE $1 ORDER BY university_id', ['DEMO-%'])).rows;
      assert.deepEqual(after, before);
      const fixtures = (await db.query('SELECT * FROM public."user" WHERE university_id LIKE $1', ['DEMO-%'])).rows;
      assert.equal(fixtures.length, 3);
      assert.ok(fixtures.every(row => row.email.endsWith('@example.com') && row.contact_number === null));
    });
    await t.test('restart and db:init preserve all existing rows and table identities', async () => {
      const before = (await db.query('SELECT * FROM public."user" ORDER BY university_id')).rows;
      const identities = (await db.query("SELECT tablename, ('public.' || quote_ident(tablename))::regclass::oid AS oid FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows;
      await stop();
      const initialized = command('database/init.js');
      assert.equal(initialized.status, 0, initialized.stderr);
      assert.match(initialized.stdout, /already exist/);
      await start();
      assert.deepEqual((await db.query('SELECT * FROM public."user" ORDER BY university_id')).rows, before);
      assert.deepEqual((await db.query("SELECT tablename, ('public.' || quote_ident(tablename))::regclass::oid AS oid FROM pg_tables WHERE schemaname='public' ORDER BY tablename")).rows, identities);
      assert.ok(!logs.includes(password));
    });
  } finally {
    await stop();
    await db.end();
  }
});
