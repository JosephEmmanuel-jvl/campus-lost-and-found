-- ===========================================================================
-- Campus Lost and Found System - Database Schema (DDL)
-- ---------------------------------------------------------------------------
-- Source of truth : ENTITY_LIST.md (Version 1.0, Approved)
-- Cross-reference  : Data_Dictionary.md
-- Engine           : MySQL 8.x (InnoDB, utf8mb4)
--
-- NOTE ON BIDIRECTIONAL MATCHING:
--   LOST_ITEM_REPORT.matched_found_report_id -> FOUND_ITEM_REPORT.found_report_id
--   FOUND_ITEM_REPORT.matched_lost_report_id -> LOST_ITEM_REPORT.lost_report_id
--   Because the two report tables reference each other, the self/cross foreign
--   keys are added with ALTER TABLE statements AFTER both tables exist.
-- ===========================================================================

-- Create the database if it does not exist, then select it.
CREATE DATABASE IF NOT EXISTS campus_lost_and_found
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_lost_and_found;

-- For a clean re-run, drop in reverse dependency order.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS claim_request;
DROP TABLE IF EXISTS found_item_report;
DROP TABLE IF EXISTS lost_item_report;
DROP TABLE IF EXISTS user;
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================================================
-- Entity 1 - USER
-- ---------------------------------------------------------------------------
-- university_id is the PRIMARY KEY (VARCHAR), not an auto-increment integer.
-- A single User table represents Students, Staff, and Admin via `role`.
-- `updated_at` intentionally omitted per approved architecture.
-- ===========================================================================
CREATE TABLE user (
    university_id   VARCHAR(50)   NOT NULL,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    contact_number  VARCHAR(20)   NULL,
    role            ENUM('Student', 'Staff', 'Admin') NOT NULL DEFAULT 'Student',
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (university_id),
    UNIQUE KEY uq_user_email (email)
) ENGINE = InnoDB;

-- ===========================================================================
-- Entity 2 - LOST_ITEM_REPORT
-- ---------------------------------------------------------------------------
-- status: Pending | Matched | Claimed
-- matched_found_report_id: nullable FK to FOUND_ITEM_REPORT (added later).
-- ===========================================================================
CREATE TABLE lost_item_report (
    lost_report_id          INT           NOT NULL AUTO_INCREMENT,
    university_id           VARCHAR(50)   NOT NULL,
    item_name               VARCHAR(150)  NOT NULL,
    description             TEXT          NOT NULL,
    category                ENUM(
                                'Electronics',
                                'Personal Belongings',
                                'Documents',
                                'Clothing',
                                'Accessories',
                                'Books',
                                'Others'
                            ) NOT NULL,
    keywords                TEXT          NOT NULL,
    photo_url               VARCHAR(255)  NULL,
    last_known_location     VARCHAR(200)  NOT NULL,
    date_lost               DATE          NOT NULL,
    status                  ENUM('Pending', 'Matched', 'Claimed') NOT NULL DEFAULT 'Pending',
    matched_found_report_id INT           NULL,
    created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (lost_report_id),
    KEY idx_lost_university_id (university_id),
    KEY idx_lost_status (status),
    KEY idx_lost_category (category),

    CONSTRAINT fk_lost_user
        FOREIGN KEY (university_id)
        REFERENCES user (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ===========================================================================
-- Entity 3 - FOUND_ITEM_REPORT
-- ---------------------------------------------------------------------------
-- status: Unclaimed | Matched | Claimed
-- matched_lost_report_id: nullable FK to LOST_ITEM_REPORT (added later).
-- ===========================================================================
CREATE TABLE found_item_report (
    found_report_id        INT           NOT NULL AUTO_INCREMENT,
    university_id          VARCHAR(50)   NOT NULL,
    item_name              VARCHAR(150)  NOT NULL,
    description            TEXT          NOT NULL,
    category               ENUM(
                                'Electronics',
                                'Personal Belongings',
                                'Documents',
                                'Clothing',
                                'Accessories',
                                'Books',
                                'Others'
                            ) NOT NULL,
    keywords               TEXT          NOT NULL,
    photo_url              VARCHAR(255)  NULL,
    location_found         VARCHAR(200)  NOT NULL,
    date_found             DATE          NOT NULL,
    status                 ENUM('Unclaimed', 'Matched', 'Claimed') NOT NULL DEFAULT 'Unclaimed',
    matched_lost_report_id INT           NULL,
    created_at             DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (found_report_id),
    KEY idx_found_university_id (university_id),
    KEY idx_found_status (status),
    KEY idx_found_category (category),

    CONSTRAINT fk_found_user
        FOREIGN KEY (university_id)
        REFERENCES user (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------------
-- Bidirectional matching foreign keys (added after both tables exist).
-- ON DELETE SET NULL: if a matched report is deleted by an Admin, the
-- counterpart's match pointer is cleared rather than blocking the delete.
-- ---------------------------------------------------------------------------
ALTER TABLE lost_item_report
    ADD CONSTRAINT fk_lost_matched_found
        FOREIGN KEY (matched_found_report_id)
        REFERENCES found_item_report (found_report_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;

ALTER TABLE found_item_report
    ADD CONSTRAINT fk_found_matched_lost
        FOREIGN KEY (matched_lost_report_id)
        REFERENCES lost_item_report (lost_report_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL;

-- ===========================================================================
-- Entity 4 - CLAIM_REQUEST
-- ---------------------------------------------------------------------------
-- status: Pending | Approved | Rejected
-- Business rules enforced at the CONTROLLER level (not the DB):
--   * Only ONE claim may be Approved per found_report_id.
--   * admin_remarks required when Rejected, optional when Approved.
--   * A user cannot claim a Found Item Report they submitted themselves.
-- ===========================================================================
CREATE TABLE claim_request (
    claim_id                  INT          NOT NULL AUTO_INCREMENT,
    found_report_id           INT          NOT NULL,
    claimant_university_id    VARCHAR(50)  NOT NULL,
    proof_of_ownership        TEXT         NOT NULL,
    status                    ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    reviewed_by_university_id VARCHAR(50)  NULL,
    review_date               DATETIME     NULL,
    admin_remarks             TEXT         NULL,
    created_at                DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (claim_id),
    KEY idx_claim_found_report (found_report_id),
    KEY idx_claim_claimant (claimant_university_id),
    KEY idx_claim_status (status),

    CONSTRAINT fk_claim_found_report
        FOREIGN KEY (found_report_id)
        REFERENCES found_item_report (found_report_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_claim_claimant
        FOREIGN KEY (claimant_university_id)
        REFERENCES user (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_claim_reviewer
        FOREIGN KEY (reviewed_by_university_id)
        REFERENCES user (university_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE = InnoDB;

-- ===========================================================================
-- Entity 5 - NOTIFICATION
-- ---------------------------------------------------------------------------
-- notification_type: General | Match | Claim | System
-- Field name `related_report_id` follows ENTITY_LIST.md (the primary
-- reference). NOTE: Data_Dictionary.md currently calls this
-- `related_found_report_id` -- discrepancy flagged for reconciliation.
-- It is intentionally NOT a hard FK because it may point to either a Lost or
-- a Found report depending on notification_type; referential target is
-- resolved in application logic.
-- ===========================================================================
CREATE TABLE notification (
    notification_id   INT          NOT NULL AUTO_INCREMENT,
    university_id     VARCHAR(50)  NOT NULL,
    title             VARCHAR(150) NOT NULL,
    message           TEXT         NOT NULL,
    notification_type ENUM('General', 'Match', 'Claim', 'System') NOT NULL DEFAULT 'General',
    related_report_id INT          NULL,
    is_read           BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (notification_id),
    KEY idx_notification_user (university_id),
    KEY idx_notification_is_read (is_read),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (university_id)
        REFERENCES user (university_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE = InnoDB;
