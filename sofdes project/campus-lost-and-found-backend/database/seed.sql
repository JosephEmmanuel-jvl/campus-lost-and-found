-- ===========================================================================
-- Campus Lost and Found System - Seed Data
-- ---------------------------------------------------------------------------
-- Loads development/testing sample data that respects every foreign-key and
-- business-rule constraint defined in schema.sql.
--
-- Run AFTER schema.sql:
--   mysql -u <user> -p campus_lost_and_found < database/seed.sql
--
-- ---------------------------------------------------------------------------
-- IMPORTANT - PASSWORD HASHES
-- ---------------------------------------------------------------------------
-- Every seed user's password is:  Password123!
--
-- The password_hash values below are bcrypt hashes. If your bcrypt setup
-- rejects them (different cost/version), regenerate real hashes with the
-- helper script and paste the output over the values below:
--
--   node database/generate-hashes.js
--
-- The login flow (Member 1) verifies the plain password against these hashes
-- with bcrypt.compare(), so they must be valid bcrypt hashes of Password123!.
-- ===========================================================================

USE campus_lost_and_found;

-- Clear existing rows for a clean re-seed (child tables first).
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notification;
TRUNCATE TABLE claim_request;
TRUNCATE TABLE found_item_report;
TRUNCATE TABLE lost_item_report;
TRUNCATE TABLE user;

-- ---------------------------------------------------------------------------
-- USERS (1 Admin, 1 Staff, 3 Students) - password for all: Password123!
-- ---------------------------------------------------------------------------
INSERT INTO user (university_id, first_name, last_name, email, password_hash, contact_number, role) VALUES
('2021-00001', 'Alice',   'Santos',    'alice.santos@university.edu',   '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09171234567', 'Admin'),
('2021-00002', 'Benjamin','Cruz',      'benjamin.cruz@university.edu',  '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09181234567', 'Staff'),
('2022-10001', 'Carla',   'Reyes',     'carla.reyes@university.edu',    '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', NULL,          'Student'),
('2022-10002', 'Daniel',  'Mendoza',   'daniel.mendoza@university.edu', '$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', '09201234567', 'Student'),
('2022-10003', 'Erika',   'Villanueva','erika.villanueva@university.edu','$2b$10$Nds7rdJdMqcercnP3jQxsOC3pCUs5YsIlSG1UIGaFc0t.4lIF89cm', NULL,          'Student');

-- ---------------------------------------------------------------------------
-- LOST ITEM REPORTS
--   #1 Carla - Pending (no match yet)
--   #2 Daniel - will be Matched to Found #1
-- ---------------------------------------------------------------------------
INSERT INTO lost_item_report
(lost_report_id, university_id, item_name, description, category, keywords, photo_url, last_known_location, date_lost, status, matched_found_report_id) VALUES
(1, '2022-10001', 'Black Umbrella', 'A compact black automatic umbrella with a wooden handle.', 'Personal Belongings', 'umbrella,black,compact,wooden handle', NULL, 'Main Library, 2nd Floor', '2026-06-20', 'Pending', NULL),
(2, '2022-10002', 'Blue Water Bottle', 'A 1-liter blue Hydro Flask with a dented cap and a mountain sticker.', 'Personal Belongings', 'water bottle,blue,hydro flask,sticker', NULL, 'Gymnasium Lobby', '2026-06-22', 'Matched', 1);

-- ---------------------------------------------------------------------------
-- FOUND ITEM REPORTS
--   #1 Erika - Matched to Lost #2 (the blue water bottle)
--   #2 Benjamin (Staff) - Unclaimed
-- ---------------------------------------------------------------------------
INSERT INTO found_item_report
(found_report_id, university_id, item_name, description, category, keywords, photo_url, location_found, date_found, status, matched_lost_report_id) VALUES
(1, '2022-10003', 'Blue Hydro Flask', 'Found a blue metal water bottle with a mountain sticker near the gym.', 'Personal Belongings', 'water bottle,blue,hydro flask,sticker', NULL, 'Gymnasium Court A', '2026-06-23', 'Matched', 2),
(2, '2021-00002', 'Silver Wristwatch', 'A silver analog wristwatch found on a classroom desk.', 'Accessories', 'watch,silver,analog,wristwatch', NULL, 'Room 305, Engineering Building', '2026-06-25', 'Unclaimed', NULL);

-- ---------------------------------------------------------------------------
-- CLAIM REQUESTS
--   #1 Daniel claims Found #1 (his matched bottle) - Approved by Admin Alice
--   #2 Carla claims Found #2 (the watch) - Pending review
-- Note: business rule "cannot claim your own found report" is respected -
-- neither claimant is the finder of the report they claim.
-- ---------------------------------------------------------------------------
INSERT INTO claim_request
(claim_id, found_report_id, claimant_university_id, proof_of_ownership, status, reviewed_by_university_id, review_date, admin_remarks) VALUES
(1, 1, '2022-10002', 'The bottle has a small dent on the cap and a mountain sticker I placed on the side. My initials "DM" are scratched on the bottom.', 'Approved', '2021-00001', '2026-06-24 09:30:00', 'Verified against the finder''s description. Item released.'),
(2, 2, '2022-10001', 'The watch has a scratch on the 3 o''clock marker and an adjustable metal strap missing one pin.', 'Pending', NULL, NULL, NULL);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS (system-generated events)
--   related_report_id points to the relevant report where applicable.
-- ---------------------------------------------------------------------------
INSERT INTO notification
(university_id, title, message, notification_type, related_report_id, is_read) VALUES
('2022-10002', 'Possible Match Found', 'A found item may match your lost "Blue Water Bottle" report. Please review.', 'Match', 2, TRUE),
('2022-10003', 'Possible Match Found', 'Your found "Blue Hydro Flask" report was matched to a lost item report.', 'Match', 1, FALSE),
('2022-10002', 'Claim Approved', 'Your claim for the Blue Hydro Flask has been approved. You may retrieve the item from Campus Security.', 'Claim', 1, FALSE),
('2022-10001', 'Claim Submitted', 'Your claim for the Silver Wristwatch has been submitted and is awaiting administrative review.', 'Claim', 2, FALSE),
('2021-00002', 'New Found Report Recorded', 'Your found item report "Silver Wristwatch" has been recorded in the system.', 'General', 2, FALSE);

SET FOREIGN_KEY_CHECKS = 1;

