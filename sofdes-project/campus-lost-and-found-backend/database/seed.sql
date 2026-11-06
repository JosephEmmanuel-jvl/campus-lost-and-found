-- Development-only, insert-only fixtures: DEMO-ADMIN-001, DEMO-STAFF-001,
-- DEMO-STUDENT-001 with example.com emails and NULL contact numbers.
-- Run through npm run db:seed:demo, never directly. $1 is a runtime bcrypt
-- hash of DEMO_PASSWORD; $2 contains the fake accounts from campusDb.js.
INSERT INTO public."user"
  (university_id, first_name, last_name, email, password_hash, contact_number, role)
SELECT university_id, first_name, last_name, email, $1, NULL, role
FROM jsonb_to_recordset($2::jsonb) AS demo(
  university_id text, first_name text, last_name text, email text, role text
)
WHERE current_setting('app.node_env', true) = 'development'
  AND current_setting('app.enable_demo_data', true) = 'true'
ON CONFLICT DO NOTHING;
