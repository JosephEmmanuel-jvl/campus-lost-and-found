# Campus Lost and Found System

---

# Current Version

**v0.2.0**

---

# Current Phase

**Phase 1 – Planning & Architecture**

---

# Current Sprint

**Sprint 1 – Database Architecture**

---

# Current Goal

Create the project's ER Diagram based on the approved Entity List.

---

# Next Goal

Review database normalization and create the Relational Schema.

---

# Project Vision

Develop a centralized web-based Campus Lost and Found System for university use that enables students, staff, and Campus Security to efficiently report, track, match, and claim lost items while reducing fraudulent claims through secure verification and proper record management.

---

# Current Project Status

## Completed

* Initial project proposal completed.
* Professor feedback reviewed.
* Project scope finalized.
* Development workflow established.
* Technology stack selected.
* Root project structure created.
* Project documentation initialized.
* Final Entity List completed.
* Database entity review completed.
* Business rules finalized for all entities.
* Database architecture approved.

---

## In Progress

* ER Diagram
* Relational Schema
* Data Dictionary

---

## Next Tasks

* Create ER Diagram
* Review Database Normalization
* Create Relational Schema
* Create Data Dictionary
* Define API Endpoints
* Begin Module Specifications

---

# Approved Architecture Decisions

## User Entity

* `university_id` is the Primary Key.
* University email is used for authentication.
* `contact_number` is optional (NULL allowed).
* `created_at` is retained.
* `updated_at` has been removed.

---

## Lost Item Report

* Reports become locked immediately after submission.
* Only Campus Security/Admin may edit reports.
* Only Campus Security/Admin may delete reports.
* At least one keyword is required.
* `photo_url` is optional.
* Bidirectional matching is retained.
* `created_at` retained.
* `updated_at` removed.

---

## Found Item Report

* Reports become locked immediately after submission.
* Only Campus Security/Admin may edit reports.
* Only Campus Security/Admin may delete reports.
* At least one keyword is required.
* `photo_url` is optional.
* Bidirectional matching is retained.
* `created_at` retained.
* `updated_at` removed.

---

## Claim Request

* `claimant_university_id` replaces `claimant_id`.
* `reviewed_by_university_id` replaces `reviewed_by`.
* Proof of ownership remains a free-text field.
* Multiple claims may be submitted.
* Only one claim may be approved for each Found Item Report.
* `admin_remarks` is required when rejecting a claim.
* `admin_remarks` is optional when approving a claim.
* Manual verification by Campus Security/Admin remains the final authority.

---

## Notification

* Notifications are generated automatically by the system.
* Every notification belongs to one user.
* `notification_type` is retained.
* `target_scope` has been removed.
* `related_report_id` has been added to support direct navigation.
* `is_read` is retained.
* `created_at` is retained.

---

# Professor Recommendations

## Implemented

* Better notification logic
* Categories and keywords
* Semi-automated matching
* Manual administrative verification
* Improved notification workflow

---

# Current Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* MySQL

## Authentication

* JSON Web Token (JWT)
* bcrypt Password Hashing

---

# Team Status

| Area          | Status                   |
| ------------- | ------------------------ |
| Planning      | 🟢 Completed             |
| Database      | 🟢 Architecture Approved |
| ER Diagram    | 🟡 In Progress           |
| Backend       | ⚪ Not Started            |
| Frontend      | ⚪ Not Started            |
| Testing       | ⚪ Not Started            |
| Documentation | 🟢 Active                |

---

# Notes

This document serves as the project's official source of truth.

All architectural decisions must be documented here before implementation begins.

The database architecture is considered **functionally complete**. The next milestone is to validate normalization, produce the ER Diagram, and generate the Relational Schema before backend development begins.
