import React from 'react';
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

// Helper function to check if the user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper function to get the current user's role
const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role || '';
  } catch {
    return '';
  }
};

// Route wrapper for protected routes
function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

// Route wrapper for role-based routes (e.g. Staff/Admin pages)
function RoleRoute({ allowedRoles }) {
  const role = getUserRole();
  if (!allowedRoles.includes(role)) {
    // If not authorized, redirect to general dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
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

            {/* Staff / Admin Only Route */}
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

