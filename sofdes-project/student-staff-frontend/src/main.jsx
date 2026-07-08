import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import AppShell from './App.jsx';
import ClaimRequest from './pages/ClaimRequest.jsx';
import Login from './pages/Login.jsx';
import LostReportDetails from './pages/LostReportDetails.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import ReportFoundItem from './pages/ReportFoundItem.jsx';
import ReportLostItem from './pages/ReportLostItem.jsx';
import SearchPage from './pages/SearchPage.jsx';
import StaffMenu from './pages/StaffMenu.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import './index.css';
import { apiClient } from './api/client.js';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Helpers (localStorage only for token check, never for role decisions)
// ─────────────────────────────────────────────────────────────────────────────

const isAuthenticated = () => !!localStorage.getItem('token');

const getCachedRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || '';
  } catch {
    return '';
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — redirects to login if no token
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────────────────────
// RoleRoute — role guard that reads from localStorage cache AND listens for
//             the `userUpdated` event so it stays in sync after auth/me fetches
// ─────────────────────────────────────────────────────────────────────────────
function RoleRoute({ allowedRoles }) {
  const [role, setRole] = useState(getCachedRole);

  useEffect(() => {
    const handleUpdate = () => setRole(getCachedRole());
    window.addEventListener('userUpdated', handleUpdate);
    return () => window.removeEventListener('userUpdated', handleUpdate);
  }, []);

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardRouter — routes to correct dashboard based on role stored in DB
//   Admin  → StaffMenu (Admin Control Center)
//   Staff  → StaffMenu (Staff Control Center)
//   Student → StudentDashboard
//
// Uses reactive state so the correct page shows even if the initial localStorage
// cache is stale (auth/me in AppShell will update it and fire `userUpdated`).
// ─────────────────────────────────────────────────────────────────────────────
function DashboardRouter() {
  const [role, setRole] = useState(getCachedRole);

  useEffect(() => {
    const handleUpdate = () => setRole(getCachedRole());
    window.addEventListener('userUpdated', handleUpdate);
    return () => window.removeEventListener('userUpdated', handleUpdate);
  }, []);

  if (role === 'Admin' || role === 'Staff') {
    return <StaffMenu />;
  }
  return <StudentDashboard />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — app routes
// ─────────────────────────────────────────────────────────────────────────────
function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected routes — require valid JWT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/report-lost" element={<ReportLostItem />} />
            <Route path="/report-found" element={<ReportFoundItem />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/found-items" element={<Navigate to="/search" replace />} />
            <Route path="/lost-reports/:id" element={<LostReportDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/claim" element={<ClaimRequest />} />
            <Route path="/claim/:foundId" element={<ClaimRequest />} />
            <Route path="/claim-request" element={<Navigate to="/claim" replace />} />
            <Route path="/profile" element={<Profile />} />

            {/* Staff Portal — accessible to Staff and Admin */}
            <Route element={<RoleRoute allowedRoles={['Staff', 'Admin']} />}>
              <Route path="/staff" element={<StaffMenu />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
