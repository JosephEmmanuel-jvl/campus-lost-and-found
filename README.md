# Campus Lost and Found

Software Design course finals project, group of 7.

A web application for reporting lost and found items on campus. Students submit
reports and claims, while staff and administrators manage reports and returns.

## Tech stack

- React, Vite and Tailwind CSS
- Node.js and Express
- PostgreSQL with the pg driver
- JWT authentication and bcrypt password hashing

## Key features

- Lost and found reports with photos
- Item search and matching
- Claim requests, status tracking and notifications
- Student, staff and admin interfaces
- Editable user profiles

## Contributions

This was a seven-person group project. JiiGu developed the initial backend,
including its database foundation, before the project was added to GitHub.
My later contributions included authentication persistence, image uploads,
search improvements, access rules, and safer database startup.

## Run locally

Install Node.js 20 or newer, npm and PostgreSQL. Create an empty local database
named campus_lost_and_found using your PostgreSQL administrator tools.

From the repository root:

```powershell
cd sofdes-project/campus-lost-and-found-backend
npm ci
Copy-Item .env.example .env
```

Edit .env with your PostgreSQL host, port (normally 5432), user, password and
database name. Replace JWT_SECRET with a random signing secret. Keep
ENABLE_DEMO_DATA=false and ALLOW_DATABASE_RESET=false for normal use.

```powershell
npm run dev
```

Startup creates application tables only if none exist. It never drops tables
or inserts demo accounts. Existing tables and data are preserved; an incomplete
application schema stops startup for migration review.

In another terminal, from the repository root:

```powershell
cd sofdes-project/student-staff-frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. The backend runs on port 5000.

## Accounts and tests

First-time login creates only a Student account, regardless of ID digits or
submitted role fields. Existing accounts retain their passwords and roles.
A trusted backend operator assigns privileged roles through db:set-role.

Run npm test from the backend folder for database-free regression tests.
See the [backend README](sofdes-project/campus-lost-and-found-backend/README.md)
for role assignment, optional demo accounts and local integration testing.
