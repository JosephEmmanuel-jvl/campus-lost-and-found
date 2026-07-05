# Campus Lost and Found System — Backend

Backend foundation for the **Campus Lost and Found System** (Group 6).
Built and maintained by **Member 6 — Database & Backend Support**.

This README is the **authoritative reference for backend folder organization**.
All members (1–5) build their subsystems inside this structure and must not
reorganize it.

---

## Tech Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Runtime        | Node.js                 |
| Web framework  | Express.js              |
| Database       | MySQL 8.x               |
| DB driver      | mysql2                  |
| Auth tokens    | JSON Web Token (JWT)    |
| Password hash  | bcrypt                  |

---

## Folder Structure

```text
backend/
├── .env.example              # Template for environment variables (copy to .env)
├── package.json              # Dependencies and scripts
├── README.md                 # This file — folder structure + setup
│
├── database/
│   ├── schema.sql            # DDL — creates all 5 tables (source: ENTITY_LIST.md)
│   ├── seed.sql              # Sample data for development/testing
│   └── generate-hashes.js    # Helper: produces real bcrypt hashes for seed users
│
└── src/
    ├── server.js             # App entry point (created in Stage 2)
    ├── app.js                # Express app + middleware wiring (Stage 2)
    │
    ├── config/               # Configuration (DB connection pool, env loading)
    ├── middleware/           # JWT auth, role-based access, validation, errors
    ├── models/               # One data-access module per entity (5 total)
    ├── controllers/          # Request handlers implementing the API Specification
    ├── routes/               # Express routers, mounted under /api/v1
    └── utils/                # Shared helpers (response formatting, etc.)
```

### Folder responsibilities

| Folder             | Responsibility                                                        | Owner (primary)     |
| ------------------ | -------------------------------------------------------------------- | ------------------- |
| `database/`        | Schema, seed data, DB utilities                                      | Member 6            |
| `src/config/`      | MySQL connection pool, environment configuration                     | Member 6            |
| `src/middleware/`  | `authMiddleware` (JWT), `roleMiddleware` (RBAC), validation, errors  | Member 6 → Member 1 |
| `src/models/`      | Data access for User, Lost, Found, Claim, Notification               | Member 6            |
| `src/controllers/` | Business logic per module                                            | Members 1, 2, 3, 5  |
| `src/routes/`      | Endpoint definitions under `/api/v1`                                 | Members 1, 2, 3, 5  |
| `src/utils/`       | Cross-cutting helpers                                                 | Member 6            |

> **Boundary note:** Member 6 provides the User model plus reusable JWT and
> role-based-access middleware. Member 1 implements the actual login /
> registration / logout logic and role-gated page access on top of them.

---

## Database Overview

Five entities, per the approved `ENTITY_LIST.md`:

| Table               | Primary Key       | Key Foreign Keys                                              |
| ------------------- | ----------------- | ------------------------------------------------------------ |
| `user`              | `university_id`   | —                                                            |
| `lost_item_report`  | `lost_report_id`  | `university_id` → user; `matched_found_report_id` → found    |
| `found_item_report` | `found_report_id` | `university_id` → user; `matched_lost_report_id` → lost      |
| `claim_request`     | `claim_id`        | `found_report_id` → found; `claimant_university_id` → user; `reviewed_by_university_id` → user |
| `notification`      | `notification_id` | `university_id` → user                                       |

**Bidirectional matching:** `lost_item_report` and `found_item_report`
reference each other. The cross foreign keys are added with `ALTER TABLE`
*after* both tables exist (see `schema.sql`).

---

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+ recommended)
- MySQL Server 8.x running locally

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your real `DB_PASSWORD`, `JWT_SECRET`, etc.

### 4. Create the database schema

```bash
mysql -u root -p < database/schema.sql
```

This creates the `campus_lost_and_found` database and all five tables.

### 5. (Recommended) Generate real password hashes, then seed

The seed users all use the password **`Password123!`**. To guarantee the
bcrypt hashes match your local bcrypt setup, regenerate them first:

```bash
node database/generate-hashes.js
```

Paste the printed hashes into `database/seed.sql` (replacing the
`password_hash` values), then load the seed data:

```bash
mysql -u root -p campus_lost_and_found < database/seed.sql
```

### 6. Run the server

```bash
npm run dev     # development (auto-reload via nodemon)
# or
npm start       # production
```

The API is served under the base path **`/api/v1`**.

---

## Seed Accounts

All passwords: **`Password123!`**

| Role    | university_id | email                          |
| ------- | ------------- | ------------------------------ |
| Admin   | 2021-00001    | alice.santos@university.edu    |
| Staff   | 2021-00002    | benjamin.cruz@university.edu   |
| Student | 2022-10001    | carla.reyes@university.edu     |
| Student | 2022-10002    | daniel.mendoza@university.edu  |
| Student | 2022-10003    | erika.villanueva@university.edu|

---

## Architectural Rules (Frozen)

These are locked per the approved project documents. Do **not** change them
without updating `ENTITY_LIST.md` and getting re-approval:

- Do not modify table names, attributes, or the schema.
- Do not add, rename, or remove API endpoints (see `API_Specifications.md`).
- Reports are **locked after submission** — only Admin/Staff-Security may edit
  or delete them.
- Only **one claim** may be Approved per Found Item Report.
- `admin_remarks` is **required** when rejecting a claim, optional when approving.
- Users **cannot claim** a Found Item Report they submitted themselves.
- Notifications are **system-generated only**.

---

## Known Documentation Discrepancy (flagged for reconciliation)

The Notification report-link field is named:

- **`related_report_id`** in `ENTITY_LIST.md` (the primary reference) — **used here**
- `related_found_report_id` in `Data_Dictionary.md`

This backend follows `ENTITY_LIST.md`, since that document is designated the
primary reference for the SQL database and models. The `Data_Dictionary.md`
entry should be updated to `related_report_id` so the two documents agree.

---

## Build Status

| Stage | Scope                                             | Status         |
| ----- | ------------------------------------------------- | -------------- |
| 1     | Foundation & database                             | ✅ Complete    |
| 2     | App core & middleware (this stage)                | ✅ Complete    |
| 3     | Models, controllers, routes (this stage)          | ✅ Complete    |
| 4     | Self-verification & Backend Foundation Report     | ✅ Complete    |
