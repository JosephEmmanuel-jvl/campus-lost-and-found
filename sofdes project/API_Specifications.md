# API_SPECIFICATION.md

---

# Campus Lost and Found System

## Version

v1.0.0

## Status

🟢 Approved

---

# Purpose

This document defines the high-level REST API endpoints for the Campus Lost and Found System.

The API specification serves as the reference for backend implementation and frontend integration.

Authentication is handled using JSON Web Tokens (JWT).

---

# Base URL

```text
/api/v1
```

---

# Authentication

## Login

| Method | Endpoint      |
| ------ | ------------- |
| POST   | `/auth/login` |

Description

Authenticates a registered user.

---

## Logout

| Method | Endpoint       |
| ------ | -------------- |
| POST   | `/auth/logout` |

Description

Ends the current user session.

---

## Current User

| Method | Endpoint   |
| ------ | ---------- |
| GET    | `/auth/me` |

Description

Returns the authenticated user's information.

---

# User

## Get Profile

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/users/profile` |

---

## Update Profile

| Method | Endpoint         |
| ------ | ---------------- |
| PUT    | `/users/profile` |

---

# Lost Item Reports

## Get All Lost Reports

| Method | Endpoint      |
| ------ | ------------- |
| GET    | `/lost-items` |

---

## Get Lost Report

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/lost-items/{id}` |

---

## Create Lost Report

| Method | Endpoint      |
| ------ | ------------- |
| POST   | `/lost-items` |

---

# Found Item Reports

## Get All Found Reports

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/found-items` |

---

## Get Found Report

| Method | Endpoint            |
| ------ | ------------------- |
| GET    | `/found-items/{id}` |

---

## Create Found Report

| Method | Endpoint       |
| ------ | -------------- |
| POST   | `/found-items` |

---

# Matching

## Suggested Matches

| Method | Endpoint              |
| ------ | --------------------- |
| GET    | `/matches/{reportId}` |

Description

Returns possible matches generated using:

* Category
* Keywords
* Item Name
* Date
* Location

---

## Confirm Match (Admin)

| Method | Endpoint              |
| ------ | --------------------- |
| PATCH  | `/matches/{reportId}` |

Description

Confirms the selected match between Lost and Found reports.

Administrator only.

---

# Claim Requests

## Submit Claim

| Method | Endpoint  |
| ------ | --------- |
| POST   | `/claims` |

---

## View Claim

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/claims/{id}` |

---

## View User Claims

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/claims/user` |

---

## Approve Claim (Admin)

| Method | Endpoint               |
| ------ | ---------------------- |
| PATCH  | `/claims/{id}/approve` |

---

## Reject Claim (Admin)

| Method | Endpoint              |
| ------ | --------------------- |
| PATCH  | `/claims/{id}/reject` |

---

# Notifications

## Get Notifications

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/notifications` |

---

## Mark Notification as Read

| Method | Endpoint              |
| ------ | --------------------- |
| PATCH  | `/notifications/{id}` |

---

# Admin

## Dashboard

| Method | Endpoint           |
| ------ | ------------------ |
| GET    | `/admin/dashboard` |

---

## Reports Queue

| Method | Endpoint         |
| ------ | ---------------- |
| GET    | `/admin/reports` |

---

## Claim Queue

| Method | Endpoint        |
| ------ | --------------- |
| GET    | `/admin/claims` |

---

## Users

| Method | Endpoint       |
| ------ | -------------- |
| GET    | `/admin/users` |

---

# Search

## Search Reports

| Method | Endpoint  |
| ------ | --------- |
| GET    | `/search` |

Query Parameters

* keyword
* category
* date
* location

---

# Authorization Matrix

| Endpoint            | Student | Staff | Admin |
| ------------------- | :-----: | :---: | :---: |
| Login               |    ✅    |   ✅   |   ✅   |
| Submit Lost Report  |    ✅    |   ✅   |   ✅   |
| Submit Found Report |    ✅    |   ✅   |   ✅   |
| Submit Claim        |    ✅    |   ✅   |   ✅   |
| View Notifications  |    ✅    |   ✅   |   ✅   |
| Confirm Match       |    ❌    |   ❌   |   ✅   |
| Approve Claim       |    ❌    |   ❌   |   ✅   |
| Reject Claim        |    ❌    |   ❌   |   ✅   |
| Admin Dashboard     |    ❌    |   ❌   |   ✅   |
| User Management     |    ❌    |   ❌   |   ✅   |

---

# Development Notes

* All endpoints return JSON responses.
* Protected endpoints require JWT authentication.
* Role-based authorization is enforced using middleware.
* Business rules defined in `ENTITY_LIST.md` remain authoritative.
* API endpoints should not modify the approved database architecture.

---

# Review Status

🟢 Approved

This document serves as the official API reference for backend implementation.
