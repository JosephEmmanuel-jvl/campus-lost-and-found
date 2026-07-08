-- ===========================================================================
-- Campus Lost and Found System - Database Schema (DDL) for PostgreSQL (Supabase)
-- ---------------------------------------------------------------------------
-- Source of truth : ENTITY_LIST.md (Version 1.0, Approved)
-- Cross-reference  : Data_Dictionary.md
-- Engine           : PostgreSQL
--
-- NOTE ON BIDIRECTIONAL MATCHING:
--   LOST_ITEM_REPORT.matched_found_report_id -> FOUND_ITEM_REPORT.found_report_id
--   FOUND_ITEM_REPORT.matched_lost_report_id -> LOST_ITEM_REPORT.lost_report_id
--   Because the two report tables reference each other, the self/cross foreign
--   keys are added with ALTER TABLE statements AFTER both tables exist.
-- ===========================================================================

-- Drop tables in reverse dependency order using CASCADE for clean setup.
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS claim_request CASCADE;
DROP TABLE IF EXISTS found_item_report CASCADE;
DROP TABLE IF EXISTS lost_item_report CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ===========================================================================
-- Entity 1 - USER
-- ---------------------------------------------------------------------------
-- university_id is the PRIMARY KEY (VARCHAR), not an auto-increment integer.
-- A single User table represents Students, Staff, and Admin via `role`.
-- ===========================================================================
CREATE TABLE "user" (
    university_id   VARCHAR(50)   NOT NULL,
    first_name      VARCHAR(100)  NOT NULL,
    last_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    contact_number  VARCHAR(20)   NULL,
    role            VARCHAR(50)   NOT NULL DEFAULT 'Student' CHECK (role IN ('Student', 'Staff', 'Admin')),
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (university_id),
    CONSTRAINT uq_user_email UNIQUE (email)
);

-- ===========================================================================
-- Entity 2 - LOST_ITEM_REPORT
-- ---------------------------------------------------------------------------
-- status: Pending | Matched | Claimed
-- matched_found_report_id: nullable FK to FOUND_ITEM_REPORT (added later).
-- ===========================================================================
CREATE TABLE lost_item_report (
    lost_report_id          SERIAL        PRIMARY KEY,
    university_id           VARCHAR(50)   NOT NULL,
    item_name               VARCHAR(150)  NOT NULL,
    description             TEXT          NOT NULL,
    category                VARCHAR(50)   NOT NULL CHECK (category IN (
                                'Electronics',
                                'Personal Belongings',
                                'Documents',
                                'Clothing',
                                'Accessories',
                                'Books',
                                'Others'
                            )),
    keywords                TEXT          NOT NULL,
    photo_url               TEXT          NULL,
    last_known_location     VARCHAR(200)  NOT NULL,
    date_lost               DATE          NOT NULL,
    status                  VARCHAR(50)   NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Matched', 'Claimed')),
    matched_found_report_id INT           NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lost_user
        FOREIGN KEY (university_id)
        REFERENCES "user" (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- ===========================================================================
-- Entity 3 - FOUND_ITEM_REPORT
-- ---------------------------------------------------------------------------
-- status: Unclaimed | Matched | Claimed
-- matched_lost_report_id: nullable FK to LOST_ITEM_REPORT (added later).
-- ===========================================================================
CREATE TABLE found_item_report (
    found_report_id        SERIAL        PRIMARY KEY,
    university_id          VARCHAR(50)   NOT NULL,
    item_name              VARCHAR(150)  NOT NULL,
    description            TEXT          NOT NULL,
    category               VARCHAR(50)   NOT NULL CHECK (category IN (
                                'Electronics',
                                'Personal Belongings',
                                'Documents',
                                'Clothing',
                                'Accessories',
                                'Books',
                                'Others'
                            )),
    keywords               TEXT          NOT NULL,
    photo_url              TEXT          NULL,
    location_found         VARCHAR(200)  NOT NULL,
    date_found             DATE          NOT NULL,
    status                 VARCHAR(50)   NOT NULL DEFAULT 'Unclaimed' CHECK (status IN ('Unclaimed', 'Matched', 'Claimed')),
    matched_lost_report_id INT           NULL,
    created_at             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_found_user
        FOREIGN KEY (university_id)
        REFERENCES "user" (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

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
    claim_id                  SERIAL        PRIMARY KEY,
    found_report_id           INT           NOT NULL,
    claimant_university_id    VARCHAR(50)   NOT NULL,
    proof_of_ownership        TEXT          NOT NULL,
    status                    VARCHAR(50)   NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by_university_id VARCHAR(50)   NULL,
    review_date               TIMESTAMP     NULL,
    admin_remarks             TEXT          NULL,
    created_at                TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_claim_found_report
        FOREIGN KEY (found_report_id)
        REFERENCES found_item_report (found_report_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_claim_claimant
        FOREIGN KEY (claimant_university_id)
        REFERENCES "user" (university_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_claim_reviewer
        FOREIGN KEY (reviewed_by_university_id)
        REFERENCES "user" (university_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ===========================================================================
-- Entity 5 - NOTIFICATION
-- ---------------------------------------------------------------------------
-- notification_type: General | Match | Claim | System
-- ===========================================================================
CREATE TABLE notification (
    notification_id   SERIAL        PRIMARY KEY,
    university_id     VARCHAR(50)   NOT NULL,
    title             VARCHAR(150)  NOT NULL,
    message           TEXT          NOT NULL,
    notification_type VARCHAR(50)   NOT NULL DEFAULT 'General' CHECK (notification_type IN ('General', 'Match', 'Claim', 'System')),
    related_report_id INT           NULL,
    is_read           BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (university_id)
        REFERENCES "user" (university_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ===========================================================================
-- Indexes for Performance
-- ===========================================================================
CREATE INDEX idx_lost_university_id ON lost_item_report (university_id);
CREATE INDEX idx_lost_status ON lost_item_report (status);
CREATE INDEX idx_lost_category ON lost_item_report (category);

CREATE INDEX idx_found_university_id ON found_item_report (university_id);
CREATE INDEX idx_found_status ON found_item_report (status);
CREATE INDEX idx_found_category ON found_item_report (category);

CREATE INDEX idx_claim_found_report ON claim_request (found_report_id);
CREATE INDEX idx_claim_claimant ON claim_request (claimant_university_id);
CREATE INDEX idx_claim_status ON claim_request (status);

CREATE INDEX idx_notification_user ON notification (university_id);
CREATE INDEX idx_notification_is_read ON notification (is_read);
