# DATA_DICTIONARY.md

---

# Campus Lost and Found System

## Version

v1.0.0

## Status

🟢 Approved

---

# Purpose

This document defines the data types, constraints, and purpose of each attribute used in the Campus Lost and Found System database.

---

# USER

| Attribute      | Type     | Nullable | Description                |
| -------------- | -------- | -------- | -------------------------- |
| university_id  | VARCHAR  | No       | Primary Key                |
| first_name     | VARCHAR  | No       | User's first name          |
| last_name      | VARCHAR  | No       | User's last name           |
| email          | VARCHAR  | No       | University email           |
| password_hash  | VARCHAR  | No       | Encrypted password         |
| contact_number | VARCHAR  | Yes      | Optional contact number    |
| role           | ENUM     | No       | Student, Staff, Admin      |
| created_at     | DATETIME | No       | Account creation timestamp |

---

# LOST_ITEM_REPORT

| Attribute               | Type     | Nullable | Description               |
| ----------------------- | -------- | -------- | ------------------------- |
| lost_report_id          | INT      | No       | Primary Key               |
| university_id           | VARCHAR  | No       | Report owner              |
| item_name               | VARCHAR  | No       | Item name                 |
| description             | TEXT     | No       | Item description          |
| category                | ENUM     | No       | Item category             |
| keywords                | TEXT     | No       | Search keywords           |
| photo_url               | VARCHAR  | Yes      | Uploaded image            |
| last_known_location     | VARCHAR  | No       | Last known location       |
| date_lost               | DATE     | No       | Date lost                 |
| status                  | ENUM     | No       | Pending, Matched, Claimed |
| matched_found_report_id | INT      | Yes      | Matched found report      |
| created_at              | DATETIME | No       | Report creation timestamp |

---

# FOUND_ITEM_REPORT

| Attribute              | Type     | Nullable | Description                 |
| ---------------------- | -------- | -------- | --------------------------- |
| found_report_id        | INT      | No       | Primary Key                 |
| university_id          | VARCHAR  | No       | Finder                      |
| item_name              | VARCHAR  | No       | Item name                   |
| description            | TEXT     | No       | Item description            |
| category               | ENUM     | No       | Item category               |
| keywords               | TEXT     | No       | Search keywords             |
| photo_url              | VARCHAR  | Yes      | Uploaded image              |
| location_found         | VARCHAR  | No       | Found location              |
| date_found             | DATE     | No       | Date found                  |
| status                 | ENUM     | No       | Unclaimed, Matched, Claimed |
| matched_lost_report_id | INT      | Yes      | Matched lost report         |
| created_at             | DATETIME | No       | Report creation timestamp   |

---

# CLAIM_REQUEST

| Attribute                 | Type     | Nullable | Description                 |
| ------------------------- | -------- | -------- | --------------------------- |
| claim_id                  | INT      | No       | Primary Key                 |
| found_report_id           | INT      | No       | Claimed report              |
| claimant_university_id    | VARCHAR  | No       | Claimant                    |
| proof_of_ownership        | TEXT     | No       | Ownership evidence          |
| status                    | ENUM     | No       | Pending, Approved, Rejected |
| reviewed_by_university_id | VARCHAR  | Yes      | Reviewing administrator     |
| review_date               | DATETIME | Yes      | Review timestamp            |
| admin_remarks             | TEXT     | Yes      | Administrative remarks      |
| created_at                | DATETIME | No       | Claim creation timestamp    |

---

# NOTIFICATION

| Attribute               | Type     | Nullable | Description                     |
| ----------------------- | -------- | -------- | ------------------------------- |
| notification_id         | INT      | No       | Primary Key                     |
| university_id           | VARCHAR  | No       | Notification recipient          |
| title                   | VARCHAR  | No       | Notification title              |
| message                 | TEXT     | No       | Notification body               |
| notification_type       | ENUM     | No       | General, Match, Claim, System   |
| related_found_report_id | INT      | Yes      | Related found report            |
| is_read                 | BOOLEAN  | No       | Read status                     |
| created_at              | DATETIME | No       | Notification creation timestamp |

---

# Review Status

🟢 Approved

This document is synchronized with ENTITY_LIST.md Version 1.0 and the Relational Schema.
