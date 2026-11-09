# Campus Lost and Found Student Frontend

React, Vite, and Tailwind CSS frontend for the student/staff lost-and-found interface.

Version: v0.2.0

## Screens

- Login
- Student Dashboard
- Navigation shell
- Lost Report Form
- Found Report Form
- Search Page
- Notifications
- Profile Page
- Claim Page
- Lost Report Details

## Run Locally

```bash
npm install
npm run dev
```

For same-network viewing:

```bash
npm run dev:lan
```

## Authentication and User Management

Steffi Hilario's contribution is frontend authentication and user management:
connecting the React interface to the existing backend API. Backend password
verification, JWT issuance and authorization are separate backend responsibilities.
The current frontend does not use React Context for authentication; it uses
localStorage, component state and a custom `userUpdated` browser event.

### API configuration

Start the backend using its [README](../campus-lost-and-found-backend/README.md).
`src/config.js` defaults to `http://127.0.0.1:5000`. To override it, set
`VITE_API_BASE_URL` before starting Vite, for example in an untracked `.env.local`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Use the server origin without `/api/v1`, because callers include that prefix.
On any hostname other than `localhost` or `127.0.0.1`, configuration pointing
to localhost is replaced with the production backend URL in `src/config.js`.
This also affects LAN viewing; use an explicit reachable non-loopback API URL
and ensure the backend CORS configuration permits the frontend origin.

### Login and session flow

1. `src/pages/Login.jsx` submits `university_id` and `password` to
   `POST /api/v1/auth/login`. It displays request errors and disables submission
   while signing in.
2. On success, it stores the JWT under localStorage key `token` and the returned
   user as JSON under `user`, then navigates to `/dashboard`.
3. `src/api/client.js` reads the stored token for each request and attaches
   `Authorization: Bearer <token>`. Storage survives page reloads and browser
   restarts until cleared.
4. On mount, `src/App.jsx` calls `GET /api/v1/auth/me`, refreshes the cached user
   and dispatches `userUpdated`. The shell and role-aware routing listen for
   this event. There is no shared authentication context/provider.
5. A non-login API response with status 401 clears both storage keys and
   redirects the browser to `/`. There is no refresh-token flow.

The existing backend also treats an unknown, valid-format University ID as
first-time Student signup through the login endpoint. It requires new passwords
to have at least 12 characters and at most 72 UTF-8 bytes. This does not verify
university enrollment, and the frontend has no separate registration screen.
See the backend README for trusted Staff/Admin role assignment.

### Protected routes and logout

`src/main.jsx` defines the routes and guards. `ProtectedRoute` redirects to `/`
when no token is stored. `RoleRoute` limits `/staff` to cached Staff/Admin roles;
`DashboardRouter` selects the staff/admin or student dashboard. The shell also
filters navigation by role. These are UI controls, not security boundaries:
the backend verifies JWTs and reloads the current database user for requests.

Logout in `src/App.jsx` posts to `POST /api/v1/auth/logout`, then removes `token`
and `user` and navigates to `/`, including when the request fails. The backend
logout endpoint is stateless: it does not revoke an already-issued JWT.

### API-backed profile

`src/pages/Profile.jsx` loads the current user using `GET /api/v1/auth/me`
(not the available `GET /api/v1/users/profile` endpoint). Saving sends
`first_name`, `last_name`, `email` and `contact_number` to
`PUT /api/v1/users/profile`. The response updates component state and the cached
user, dispatches `userUpdated`, and shows a temporary success message.
University ID is read-only; the displayed role comes from the API.
Report and unread-notification counts are also fetched from API endpoints.

### Known limitations

- The route guard checks token presence, not validity or expiration, and does
  not wait for `/auth/me`. Cached user/role information can appear before
  validation completes. Non-401 session-validation failures are only logged.
- Tokens in localStorage are accessible to JavaScript and therefore exposed
  if an XSS vulnerability occurs. There is no refresh token, proactive expiry
  timer or cross-tab storage-event synchronization.
- Logout waits for the request to finish before clearing storage; the API
  client has no request timeout. A copied JWT remains usable until expiry.
- Profile program, year level, preferred pickup office and emergency contact
  are local placeholder fields, not persisted by the profile request. The
  non-Student department label is also hardcoded.
- Profile load/save failures are logged to the console without a visible error
  message. A failed initial load can leave the loading screen indefinitely;
  saving has no in-flight button lock.
- The frontend has no password-change/reset or administrative user-management
  screen. Its user-management scope here is the signed-in user's profile.

## Verification

Run `npm run build` from this directory to check the production bundle. This
does not test live authentication or database persistence. Manual integration
checks should cover valid/invalid login, reload, expired-token handling,
Student versus Staff/Admin navigation, profile save/reload and logout.
