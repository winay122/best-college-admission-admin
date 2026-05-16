import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { SidebarLayout } from './layouts/SidebarLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Colleges } from './pages/Colleges';
import { CollegeDashboard } from './pages/CollegeDashboard';
import { Inquiries } from './pages/Inquiries';
import { Degrees } from './pages/Degrees';
import { Universities } from './pages/Universities';
import { GlobalSettings } from './pages/GlobalSettings';
import { Banners } from './pages/Banners';
import { News } from './pages/News';
import { Pages } from './pages/Pages';
import { Specializations } from './pages/Specializations';
import { Facilities } from './pages/Facilities';
import SupportCenter from './pages/SupportCenter';

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
          <Route path="/support" element={<SupportCenter />} />

          {/* Admin strictly protected boundaries */}
          <Route element={<AdminRoute />}>
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/colleges/:id" element={<CollegeDashboard />} />
            <Route path="/settings/degrees" element={<Degrees />} />
            <Route path="/settings/specializations" element={<Specializations />} />
            <Route path="/settings/universities" element={<Universities />} />
            <Route path="/settings/global" element={<GlobalSettings />} />
            <Route path="/settings/facilities" element={<Facilities />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/news" element={<News />} />
            <Route path="/pages" element={<Pages />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
