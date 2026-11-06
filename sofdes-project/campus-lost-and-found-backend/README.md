# Campus Lost and Found Backend

Software Design course finals project, group of 7.

Express REST API with PostgreSQL (pg), JWT authentication and bcrypt. My role
was backend and database work. See the [project README](../../README.md).

## Setup

Use Node.js 20 or newer and an empty PostgreSQL database. From this folder:

```powershell
npm ci
Copy-Item .env.example .env
```

Replace the placeholder database credentials and JWT signing secret. Set
DB_PORT=5432 for a default local installation. DB_SSL=false is for local
PostgreSQL without TLS. For hosted PostgreSQL requiring TLS, set DB_SSL=true;
certificates are verified. Supply DB_SSL_CA if your provider requires a custom
PEM CA certificate.

Run npm run dev, or npm start without the development file watcher.
Health endpoint: GET /health. API prefix: /api/v1.

## Safe database initialization

database/migrations/001-initial.sql creates the five tables, foreign keys and
indexes without reset statements. The old database/schema.sql is removed.
Startup and serverless requests share initialization. A transaction and
PostgreSQL advisory lock serialize first startup; parameterized catalog
queries check all five table names. An incomplete schema fails without
changing existing tables. Initialization errors block requests.

Run npm run db:init for the same non-destructive initialization explicitly.
Startup never seeds accounts or alters existing photo columns. Existing
installations needing schema changes require a reviewed migration. The
initializing database user needs permission to create tables in public.

## Signup and role assignment

POST /api/v1/auth/login retains the existing frontend's first-time signup
flow. Existing users keep their stored password hash and role. Unknown IDs
matching YYYY-DXXXX (D is 0, 1 or 2) always create Students. A submitted role is
ignored. New passwords require at least 12 characters and at most 72 UTF-8
bytes. Signup alone does not verify university enrollment.

Blank profile emails use hidden accounts.example.invalid placeholders;
legacy blank-profile placeholders remain compatible.

Only a trusted operator with authorized backend database credentials runs:

```powershell
npm run db:set-role -- <existing-university-id> Admin
npm run db:set-role -- <existing-university-id> Staff
```

Student is also accepted for demotion. This script updates only the role of
an existing account and never changes its password. There is no public
role-assignment endpoint. Authenticated requests load the current database role.

Existing deployed accounts are not removed or rotated by this change. Review
previously self-assigned roles and old demo credentials separately.

## Optional demo accounts

No demo accounts are created at startup. For explicit local seeding, set
NODE_ENV=development, ENABLE_DEMO_DATA=true and DEMO_PASSWORD in your ignored
.env. The password must be 12+ characters and at most 72 UTF-8 bytes.

```powershell
npm run db:init
npm run db:seed:demo
```

| ID | Role | Email |
| --- | --- | --- |
| DEMO-ADMIN-001 | Admin | demo.admin@example.com |
| DEMO-STAFF-001 | Staff | demo.staff@example.com |
| DEMO-STUDENT-001 | Student | demo.student@example.com |

Contact numbers are NULL. campusDb.js defines the fictional fixtures; seed.sql
receives them and a runtime bcrypt hash as parameters. SQL checks transaction-
local development settings. Seeding never truncates, deletes or overwrites
existing accounts. Old sample reports and notifications are no longer seeded.

npm run db:generate-demo-hash uses the same guards and prints only a bcrypt
hash. Plaintext command-line passwords are rejected. Do not paste generated
hashes into tracked files. Production rejects both demo commands even if the
flag is true. Running seed.sql directly is unsupported.

## Separate destructive reset

db:reset:destructive is an operator-only command, never called by startup or
tests. It requires NODE_ENV=development, ALLOW_DATABASE_RESET=true and an exact
--confirm-database=<DB_NAME> argument. It executes database/reset.sql and removes
the application tables. Use only for a disposable development database.

## Verification

npm test runs database-free unit tests. The separate integration suite requires
a fresh empty disposable PostgreSQL database with all of these settings:

- RUN_LOCAL_SECURITY_TESTS=true
- DB_HOST=127.0.0.1
- DB_PORT set to a non-default port (not 5432)
- DB_NAME beginning with campus_security_test_
- DB_USER and DB_PASSWORD for that local database
- PORT set to an unused local HTTP port

Then run npm run test:integration. Without opt-in, this suite skips. It starts
the backend, tests Student-only signup, existing Admin/Staff logins, trusted
role changes, production demo rejection and repeatable development fixtures.
Restart checks compare rows and table identities. It never runs schema.sql,
resets or database drops. Test data is retained.
