-- ===========================================================================
-- Campus Lost and Found System - Seed Data (PostgreSQL / Supabase version)
-- ---------------------------------------------------------------------------
-- Loads development/testing sample data that respects every foreign-key and
-- business-rule constraint defined in schema.sql.
-- ===========================================================================

-- Clear existing rows for a clean re-seed (child tables first or with CASCADE).
TRUNCATE TABLE notification, claim_request, found_item_report, lost_item_report, "user" RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- USERS (1 Admin, 1 Staff, 3 Students) - password for all: Password123!
-- ---------------------------------------------------------------------------
INSERT INTO "user" (university_id, first_name, last_name, email, password_hash, contact_number, role) VALUES
('2021-00001', 'Alice',   'Santos',    'alice.santos@university.edu',   '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09171234567', 'Admin'),
('2021-10002', 'Benjamin','Cruz',      'benjamin.cruz@university.edu',  '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09181234567', 'Staff'),
('2022-20001', 'Carla',   'Reyes',     'carla.reyes@university.edu',    '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', NULL,          'Student'),
('2022-20002', 'Daniel',  'Mendoza',   'daniel.mendoza@university.edu', '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09201234567', 'Student'),
('2022-20003', 'Erika',   'Villanueva','erika.villanueva@university.edu','$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', NULL,          'Student');

-- ---------------------------------------------------------------------------
-- LOST ITEM REPORTS
--   #1 Carla - Pending (no match yet)
--   #2 Daniel - will be Matched to Found #1 (set to NULL initially to avoid circular dependency check)
-- ---------------------------------------------------------------------------
INSERT INTO lost_item_report
(lost_report_id, university_id, item_name, description, category, keywords, photo_url, last_known_location, date_lost, status, matched_found_report_id) VALUES
(1, '2022-20001', 'Black Umbrella', 'A compact black automatic umbrella with a wooden handle.', 'Personal Belongings', 'umbrella,black,compact,wooden handle', NULL, 'Main Library, 2nd Floor', '2026-06-20', 'Pending', NULL),
(2, '2022-20002', 'Blue Water Bottle', 'A 1-liter blue Hydro Flask with a dented cap and a mountain sticker.', 'Personal Belongings', 'water bottle,blue,hydro flask,sticker', NULL, 'Gymnasium Lobby', '2026-06-22', 'Matched', NULL);

-- Since we forced ID values above, reset serial sequence to prevent duplicate key errors later
SELECT setval('lost_item_report_lost_report_id_seq', (SELECT MAX(lost_report_id) FROM lost_item_report));

-- ---------------------------------------------------------------------------
-- FOUND ITEM REPORTS
--   #1 Erika - Matched to Lost #2 (the blue water bottle, set to NULL initially)
--   #2 Benjamin (Staff) - Unclaimed
-- ---------------------------------------------------------------------------
INSERT INTO found_item_report
(found_report_id, university_id, item_name, description, category, keywords, photo_url, location_found, date_found, status, matched_lost_report_id) VALUES
(1, '2022-20003', 'Blue Hydro Flask', 'Found a blue metal water bottle with a mountain sticker near the gym.', 'Personal Belongings', 'water bottle,blue,hydro flask,sticker', NULL, 'Gymnasium Court A', '2026-06-23', 'Matched', NULL),
(2, '2021-10002', 'Silver Wristwatch', 'A silver analog wristwatch found on a classroom desk.', 'Accessories', 'watch,silver,analog,wristwatch', NULL, 'Room 305, Engineering Building', '2026-06-25', 'Unclaimed', NULL);

-- Reset serial sequence
SELECT setval('found_item_report_found_report_id_seq', (SELECT MAX(found_report_id) FROM found_item_report));

-- ---------------------------------------------------------------------------
-- UPDATE CIRCULAR MATCH REFERENCES
-- Now that both lost and found item records exist, we update them to point to each other.
-- ---------------------------------------------------------------------------
UPDATE lost_item_report SET matched_found_report_id = 1 WHERE lost_report_id = 2;
UPDATE found_item_report SET matched_lost_report_id = 2 WHERE found_report_id = 1;

-- ---------------------------------------------------------------------------
-- CLAIM REQUESTS
--   #1 Daniel claims Found #1 (his matched bottle) - Approved by Admin Alice
--   #2 Carla claims Found #2 (the watch) - Pending review
-- ---------------------------------------------------------------------------
INSERT INTO claim_request
(claim_id, found_report_id, claimant_university_id, proof_of_ownership, status, reviewed_by_university_id, review_date, admin_remarks) VALUES
(1, 1, '2022-20002', 'The bottle has a small dent on the cap and a mountain sticker I placed on the side. My initials "DM" are scratched on the bottom.', 'Approved', '2021-00001', '2026-06-24 09:30:00', 'Verified against the finder''s description. Item released.'),
(2, 2, '2022-20001', 'The watch has a scratch on the 3 o''clock marker and an adjustable metal strap missing one pin.', 'Pending', NULL, NULL, NULL);

-- Reset serial sequence
SELECT setval('claim_request_claim_id_seq', (SELECT MAX(claim_id) FROM claim_request));

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (system-generated events)
--   related_report_id points to the relevant report where applicable.
-- ---------------------------------------------------------------------------
INSERT INTO notification
(university_id, title, message, notification_type, related_report_id, is_read) VALUES
('2022-20002', 'Possible Match Found', 'A found item may match your lost "Blue Water Bottle" report. Please review.', 'Match', 2, TRUE),
('2022-20003', 'Possible Match Found', 'Your found "Blue Hydro Flask" report was matched to a lost item report.', 'Match', 1, FALSE),
('2022-20002', 'Claim Approved', 'Your claim for the Blue Hydro Flask has been approved. You may retrieve the item from Campus Security.', 'Claim', 1, FALSE),
('2022-20001', 'Claim Submitted', 'Your claim for the Silver Wristwatch has been submitted and is awaiting administrative review.', 'Claim', 2, FALSE),
('2021-10002', 'New Found Report Recorded', 'Your found item report "Silver Wristwatch" has been recorded in the system.', 'General', 2, FALSE);
