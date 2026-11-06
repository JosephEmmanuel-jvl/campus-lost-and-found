# Backend verification notes

Software Design course finals project, group of 7.

The backend now uses Express and PostgreSQL (pg). The earlier foundation
checklist and direct schema/seed commands are superseded by security-fixes.

- db:init and startup create the five tables only in an empty application schema.
- Partial schemas fail closed; existing tables and data are preserved.
- db:seed:demo is an explicit development-only, insert-only fixture command.
- db:set-role assigns roles to existing accounts through trusted operator access.
- db:reset:destructive is separate and is never invoked by tests or startup.

The schema is database/migrations/001-initial.sql. It preserves five tables,
eight foreign keys and bidirectional report matching.

Focused verification covers signup roles, existing password login, demo gates,
safe initialization and restart preservation against real local PostgreSQL.
See [README.md](README.md) for reproducible test prerequisites. These checks
do not certify unrelated report/claim workflows or deployed infrastructure.
Existing deployed demo accounts and historical role assignments still need
an authorized review; this change does not delete or rotate them.
