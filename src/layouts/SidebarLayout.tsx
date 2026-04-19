import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  Building2,
  UserCircle,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X,
  GraduationCap,
  ImageIcon,
  Globe,
  Dumbbell,
  University,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCMSOpen, setIsCMSOpen] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Close sidebar when route changes (mobile nav)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inquiries', icon: Users, path: '/inquiries' },
    { name: 'Support Center', icon: MessageSquare, path: '/support' },
    { name: 'Colleges', icon: Building2, path: '/colleges' },
  ];

  const cmsItems = [
    { name: 'Hero Banners', path: '/banners', icon: ImageIcon },
    { name: 'Site Configuration', path: '/settings/global', icon: Globe },
    { name: 'Campus Facilities', path: '/settings/facilities', icon: Dumbbell },
    { name: 'Master Degrees', path: '/settings/degrees', icon: GraduationCap },
    { name: 'Specializations', path: '/settings/specializations', icon: BookOpen },
    { name: 'Universities', path: '/settings/universities', icon: University },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-24 flex items-center px-6 border-b border-gray-100 shrink-0 bg-white">
        <img 
          src={`/logo-full.svg?v=10`} 
          alt="Best College Admission Admin" 
          className="h-14 w-auto object-contain transition-all"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.name}
          </NavLink>
        ))}

        {/* CMS Dropdown */}
        <div className="pt-2">
          <button
            onClick={() => setIsCMSOpen(!isCMSOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors text-sm"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" />
              <span>CMS Console</span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isCMSOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`mt-0.5 ml-3 space-y-0.5 overflow-hidden transition-all duration-300 ${
              isCMSOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {cmsItems.map((subItem) => (
              <NavLink
                key={subItem.name}
                to={subItem.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border-l-2 ${
                    isActive
                      ? 'bg-blue-50/60 text-blue-700 border-blue-500'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-transparent'
                  }`
                }
              >
                <subItem.icon className="w-3.5 h-3.5 shrink-0" />
                {subItem.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* User Card */}
      <div className="p-3 border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5 mb-3 px-2">
          <UserCircle className="w-7 h-7 text-gray-400 shrink-0" />
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-xs font-semibold truncate">{user?.email || 'Admin User'}</span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">

      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─────────── */}
      <aside className="hidden md:flex md:w-56 lg:w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* ─── MOBILE OVERLAY ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── MOBILE DRAWER ───────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 shadow-sm gap-3 shrink-0">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo (only shown when sidebar is hidden) */}
          <span className="text-sm font-bold text-blue-600 md:hidden">Admin Panel</span>

          <div className="flex-1" />

          {/* User indicator on header (mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <UserCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h2 className="hidden md:block text-sm font-medium text-gray-500">
            Welcome back, {user?.email?.split('@')[0] || 'Admin'}!
          </h2>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
