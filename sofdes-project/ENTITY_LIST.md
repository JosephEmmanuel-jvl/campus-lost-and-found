# ENTITY_LIST.md

---

# Campus Lost and Found System

## Status

🟢 **Approved**

---

# Purpose

This document defines the official database entities of the Campus Lost and Found System.

It serves as the primary reference for the:

* ER Diagram (ERD)
* Relational Schema
* SQL Database
* Backend Models
* Frontend Forms
* API Design

All database modifications must be reflected in this document before implementation.

---

# Entity 1 — User

## Purpose

Represents every authenticated user of the system.

The system uses a single User entity to represent Students, Staff/Faculty, and Campus Security/Admin. User permissions are determined by the `role` attribute rather than separate tables.

---

## Attributes

| Attribute      | Data Type | Constraints             | Description                                |
| -------------- | --------- | ----------------------- | ------------------------------------------ |
| university_id  | VARCHAR   | Primary Key             | Unique university-issued identifier        |
| first_name     | VARCHAR   | Required                | User's first name                          |
| last_name      | VARCHAR   | Required                | User's last name                           |
| email          | VARCHAR   | Required, Unique        | University email used for login            |
| password_hash  | VARCHAR   | Required                | Encrypted password                         |
| contact_number | VARCHAR   | Optional (NULL Allowed) | Contact number for communication if needed |
| role           | ENUM      | Student, Staff, Admin   | Determines system permissions              |
| created_at     | DATETIME  | Auto Generated          | Date and time the account was created      |

---

## Business Rules

* `university_id` is the Primary Key.
* University email addresses are used for authentication.
* Passwords are never stored in plain text.
* `contact_number` is optional.
* User roles are limited to:

  * Student
  * Staff
  * Admin
* `created_at` is automatically generated when the account is created.
* `updated_at` is intentionally omitted because profile modification history is outside the project's scope.

---

## Entity Relationships

A User may:

* Create many Lost Item Reports.
* Create many Found Item Reports.
* Submit many Claim Requests.
* Receive many Notifications.

Every Lost Item Report, Found Item Report, Claim Request, and Notification must belong to exactly one User.

---

## Review Status

🟢 **Approved**

### Final Decisions

* `university_id` replaces `user_id` as the Primary Key.
* `contact_number` is optional.
* `created_at` retained for auditing and account verification.
* `updated_at` removed.
* Single User table used for all system roles.

# Entity 2 — Lost Item Report

## Purpose

Represents an item that has been reported as lost by a registered user.

The Lost Item Report serves as the primary record for initiating the lost-and-found process. It stores the details necessary for searching, matching, claim verification, and record management.

Each Lost Item Report belongs to exactly one User and may be matched to at most one Found Item Report.

---

## Attributes

| Attribute               | Data Type | Constraints               | Description                                                                |
| ----------------------- | --------- | ------------------------- | -------------------------------------------------------------------------- |
| lost_report_id          | INT       | Primary Key               | Unique identifier for the lost item report                                 |
| university_id           | VARCHAR   | Foreign Key               | References the reporting user                                              |
| item_name               | VARCHAR   | Required                  | Name of the lost item                                                      |
| description             | TEXT      | Required                  | Detailed description of the item                                           |
| category                | ENUM      | Required                  | Item classification                                                        |
| keywords                | TEXT      | Required                  | Keywords used for searching and matching (minimum of one keyword required) |
| photo_url               | VARCHAR   | Optional (NULL Allowed)   | Uploaded image of the lost item                                            |
| last_known_location     | VARCHAR   | Required                  | Last known location of the item                                            |
| date_lost               | DATE      | Required                  | Date the item was lost                                                     |
| status                  | ENUM      | Pending, Matched, Claimed | Current report status                                                      |
| matched_found_report_id | INT       | Nullable Foreign Key      | References the matched Found Item Report                                   |
| created_at              | DATETIME  | Auto Generated            | Date and time the report was created                                       |

---

## Status Definitions

### Pending

The report has been submitted and is waiting for a possible match.

### Matched

Campus Security/Admin has confirmed a matching Found Item Report.

### Claimed

The rightful owner has successfully completed the claim process and the item has been released.

---

## Business Rules

* Every Lost Item Report belongs to exactly one registered User.
* Reports become **locked immediately after submission**.
* Reporting users **cannot edit** or delete their reports after submission.
* Only Campus Security/Admin may edit reports when corrections are necessary.
* Only Campus Security/Admin may delete reports when authorized.
* At least **one keyword** is required.
* `photo_url` is optional.
* A Lost Item Report may only be matched to **one** Found Item Report.
* `created_at` is automatically generated when the report is submitted.
* `updated_at` is intentionally omitted because report modification history is outside the project's scope.

---

## Entity Relationships

Each Lost Item Report:

* Belongs to one User.
* May be matched to one Found Item Report.
* May eventually become associated with one approved Claim Request through its matched Found Item Report.

---

## Design Decisions

### Keywords

Keywords are mandatory to improve search accuracy and support the semi-automated matching process recommended by the project adviser.

### Locked Reports

Reports become read-only immediately after submission.

This preserves the integrity of submitted information and prevents users from modifying reports after potential matches have already been generated.

### Bidirectional Matching

The field `matched_found_report_id` is retained to simplify report retrieval and reduce query complexity.

When a match is confirmed, both the Lost Item Report and Found Item Report are updated simultaneously by the system.

---

## Review Status

🟢 **Approved**

### Final Decisions

* Reports are locked immediately after submission.
* Users cannot edit or delete their own reports.
* Only Campus Security/Admin may modify reports.
* At least one keyword is required.
* `photo_url` remains optional.
* Bidirectional matching is retained.
* `created_at` retained.
* `updated_at` removed.

# Entity 3 — Found Item Report

## Purpose

Represents an item that has been found and submitted to the system by a registered user.

The Found Item Report serves as the official record of recovered items. It stores the information required for searching, matching, ownership verification, and eventual release to the rightful owner.

Each Found Item Report belongs to exactly one User and may be matched to at most one Lost Item Report.

---

## Attributes

| Attribute              | Data Type | Constraints                 | Description                                                                |
| ---------------------- | --------- | --------------------------- | -------------------------------------------------------------------------- |
| found_report_id        | INT       | Primary Key                 | Unique identifier for the found item report                                |
| university_id          | VARCHAR   | Foreign Key                 | References the user who submitted the found item                           |
| item_name              | VARCHAR   | Required                    | Name of the found item                                                     |
| description            | TEXT      | Required                    | Detailed description of the found item                                     |
| category               | ENUM      | Required                    | Item classification                                                        |
| keywords               | TEXT      | Required                    | Keywords used for searching and matching (minimum of one keyword required) |
| photo_url              | VARCHAR   | Optional (NULL Allowed)     | Uploaded image of the found item                                           |
| location_found         | VARCHAR   | Required                    | Location where the item was found                                          |
| date_found             | DATE      | Required                    | Date the item was found                                                    |
| status                 | ENUM      | Unclaimed, Matched, Claimed | Current report status                                                      |
| matched_lost_report_id | INT       | Nullable Foreign Key        | References the matched Lost Item Report                                    |
| created_at             | DATETIME  | Auto Generated              | Date and time the report was created                                       |

---

## Status Definitions

### Unclaimed

The found item has been submitted but has not yet been matched with a Lost Item Report.

### Matched

Campus Security/Admin has confirmed a matching Lost Item Report.

### Claimed

Ownership has been successfully verified, and the item has been released to its rightful owner.

---

## Business Rules

* Every Found Item Report belongs to exactly one registered User.
* Reports become **locked immediately after submission**.
* Reporting users **cannot edit** or delete their reports after submission.
* Only Campus Security/Admin may edit reports when corrections are necessary.
* Only Campus Security/Admin may delete reports when authorized.
* At least **one keyword** is required.
* `photo_url` is optional.
* A Found Item Report may only be matched to **one** Lost Item Report.
* `created_at` is automatically generated when the report is submitted.
* `updated_at` is intentionally omitted because report modification history is outside the project's scope.

---

## Entity Relationships

Each Found Item Report:

* Belongs to one User.
* May be matched to one Lost Item Report.
* May receive multiple Claim Requests.
* May only have **one approved Claim Request**.
* Generates notifications when important events occur (e.g., successful match or approved claim).

---

## Design Decisions

### Keywords

Keywords are mandatory to improve search accuracy and support the semi-automated matching process.

### Photos

Photos remain optional because not every finder will have an image available. However, when provided, they significantly improve item identification.

### Locked Reports

Reports become read-only immediately after submission.

Only Campus Security/Admin may modify reports to preserve record integrity.

### Bidirectional Matching

The field `matched_lost_report_id` is retained to simplify report retrieval and maintain consistency with the Lost Item Report.

When a match is confirmed, both reports are updated simultaneously by the system.

---

## Review Status

🟢 **Approved**

### Final Decisions

* Reports are locked immediately after submission.
* Users cannot edit or delete their own reports.
* Only Campus Security/Admin may modify reports.
* Only Campus Security/Admin may delete reports.
* At least one keyword is required.
* `photo_url` remains optional.
* Bidirectional matching is retained.
* `created_at` retained.
* `updated_at` removed.

# Entity 4 — Claim Request

## Purpose

Represents a user's formal request to claim ownership of a found item.

The Claim Request serves as the verification stage of the lost-and-found process. It allows Campus Security/Admin to evaluate evidence provided by the claimant before approving or rejecting the release of a found item.

This entity is the primary mechanism used by the system to reduce fraudulent claims.

Each Claim Request belongs to exactly one Found Item Report and is submitted by exactly one registered User.

---

## Attributes

| Attribute                 | Data Type | Constraints                 | Description                                                 |
| ------------------------- | --------- | --------------------------- | ----------------------------------------------------------- |
| claim_id                  | INT       | Primary Key                 | Unique identifier for the claim request                     |
| found_report_id           | INT       | Foreign Key                 | References the Found Item Report being claimed              |
| claimant_university_id    | VARCHAR   | Foreign Key                 | References the user submitting the claim                    |
| proof_of_ownership        | TEXT      | Required                    | Description provided by the claimant to prove ownership     |
| status                    | ENUM      | Pending, Approved, Rejected | Current review status                                       |
| reviewed_by_university_id | VARCHAR   | Nullable Foreign Key        | References the Campus Security/Admin who reviewed the claim |
| review_date               | DATETIME  | Nullable                    | Date and time the claim was reviewed                        |
| admin_remarks             | TEXT      | Nullable                    | Remarks provided by the reviewing administrator             |
| created_at                | DATETIME  | Auto Generated              | Date and time the claim request was submitted               |

---

## Status Definitions

### Pending

The claim request has been submitted and is awaiting review.

### Approved

Ownership has been successfully verified.

The associated item is released to the claimant, and both the Lost Item Report and Found Item Report are updated to **Claimed**.

### Rejected

The provided evidence was insufficient or failed ownership verification.

The claimant may submit another claim if permitted by Campus Security/Admin.

---

## Business Rules

* Every Claim Request belongs to exactly one Found Item Report.
* Every Claim Request belongs to exactly one registered User.
* Every claim must include proof of ownership.
* Only Campus Security/Admin may approve or reject claims.
* A Found Item Report may receive multiple Claim Requests.
* Only **one Claim Request** may be approved for each Found Item Report.
* If a claim is **Rejected**, `admin_remarks` is **required**.
* If a claim is **Approved**, `admin_remarks` is optional.
* `review_date` is automatically recorded once a decision has been made.
* `created_at` is automatically generated when the claim is submitted.

---

## Entity Relationships

Each Claim Request:

* Belongs to one Found Item Report.
* Belongs to one User (Claimant).
* Is reviewed by one Campus Security/Admin.
* May trigger one or more Notifications depending on the review outcome.

---

## Design Decisions

### Proof of Ownership

Instead of requiring predefined fields (color, brand, serial number, etc.), the system accepts a free-text description.

This provides flexibility because different items require different methods of verification.

Examples include:

* Distinctive markings
* Item contents
* Stickers
* Accessories
* Physical characteristics

---

### Multiple Claims

The system allows multiple users to submit claims for the same Found Item Report.

This reflects real-world situations where multiple individuals may attempt to claim the same item.

Campus Security/Admin is responsible for determining the rightful owner.

---

### Administrative Decision

Every claim requires manual review.

The system assists administrators by organizing records but **never automatically approves or rejects claims**.

---

### Fraud Prevention

This entity directly supports the project's vision of reducing fraudulent claims by requiring:

* Proof of ownership
* Administrative verification
* Recorded review history
* Optional administrative remarks

---

## Review Status

🟢 **Approved**

### Final Decisions

* `claimant_university_id` replaces `claimant_id`.
* `reviewed_by_university_id` replaces `reviewed_by`.
* Proof of ownership remains a flexible text field.
* Multiple claim requests are permitted.
* Only one claim may be approved.
* `admin_remarks` is mandatory when rejecting a claim and optional when approving.
* Manual administrative verification remains the final authority.

# Entity 5 — Notification

## Purpose

Represents a notification generated automatically by the system to inform users of important events related to their reports, claims, or system activities.

The Notification entity improves communication between users and Campus Security by ensuring that users are informed whenever meaningful actions occur within the system.

Each Notification belongs to exactly one User.

---

## Attributes

| Attribute         | Data Type | Constraints                   | Description                                      |
| ----------------- | --------- | ----------------------------- | ------------------------------------------------ |
| notification_id   | INT       | Primary Key                   | Unique identifier for the notification           |
| university_id     | VARCHAR   | Foreign Key                   | References the notification recipient            |
| title             | VARCHAR   | Required                      | Short notification title                         |
| message           | TEXT      | Required                      | Notification message displayed to the user       |
| notification_type | ENUM      | General, Match, Claim, System | Type of notification                             |
| related_report_id | INT       | Nullable                      | References the related report when applicable    |
| is_read           | BOOLEAN   | Default FALSE                 | Indicates whether the notification has been read |
| created_at        | DATETIME  | Auto Generated                | Date and time the notification was generated     |

---

## Notification Types

### General

System-wide notifications such as newly submitted Lost or Found reports and important announcements.

---

### Match

Generated when the system identifies a possible match between Lost and Found reports.

---

### Claim

Generated whenever a claim is submitted, approved, or rejected.
* Users cannot submit a claim request for a Found Item Report that they originally submitted themselves.


---

### System

Administrative announcements, maintenance notices, or other system-generated messages.

---

## Business Rules

* Notifications are generated automatically by the system.
* Users cannot manually create notifications.
* Users cannot edit notifications.
* Users may mark notifications as read.
* Every notification belongs to exactly one User.
* `related_report_id` is optional because not all notifications reference a report.
* Clicking a notification should navigate the user directly to the related report whenever applicable.
* `created_at` is automatically generated when the notification is created.
* General notifications are generated individually for each recipient by the system rather than being stored as a single shared notification.


---

## Entity Relationships

Each Notification:

* Belongs to one User.
* May reference one Lost Item Report or one Found Item Report depending on the notification type.
* Is generated automatically by system events.

---

## Design Decisions

### Automatic Generation

Notifications are never created manually.

They are generated automatically whenever predefined system events occur.

Examples include:

* New Lost Item Report
* New Found Item Report
* Possible Match Found
* Claim Submitted
* Claim Approved
* Claim Rejected
* System Announcement

---

### Direct Navigation

When a notification references a report, selecting the notification should immediately open the associated report.

This improves usability by allowing users to navigate directly to the relevant information without performing additional searches.

---

### Read Status

The `is_read` attribute enables the system to distinguish between unread and previously viewed notifications.

Unread notifications may be highlighted within the user interface to improve visibility.

---

### Targeted Notifications

Targeted notifications are generated by comparing newly submitted Lost Item Reports and Found Item Reports based on category, keywords, date, and location.

The system identifies potentially matching reports and notifies the users associated with those reports.

No separate user preference settings are required because matching is performed using information already stored in Lost Item Reports and Found Item Reports.



---

## Review Status

🟢 **Approved**

### Final Decisions

* Notifications are system-generated only.
* Every notification belongs to one user.
* `notification_type` is retained.
* `target_scope` has been removed because it represents application logic rather than business data.
* `related_report_id` has been added to support direct navigation from notifications.
* `is_read` is retained.
* `created_at` is retained.
