import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { SidebarLayout } from './layouts/SidebarLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Colleges } from './pages/Colleges';
import { CollegeDashboard } from './pages/CollegeDashboard';
import { Inquiries } from './pages/Inquiries';
import { Settings } from './pages/Settings';
import { Degrees } from './pages/Degrees';
import { Universities } from './pages/Universities';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes mapped inside SidebarLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/inquiries" element={<Inquiries />} />

          {/* Admin strictly protected boundaries */}
          <Route element={<AdminRoute />}>
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/colleges/:id" element={<CollegeDashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/degrees" element={<Degrees />} />
            <Route path="/settings/universities" element={<Universities />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
