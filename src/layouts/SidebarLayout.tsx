import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Building2, UserCircle, Users, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [isCMSOpen, setIsCMSOpen] = React.useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Inquiries', icon: Users, path: '/inquiries' },
    { name: 'Colleges', icon: Building2, path: '/colleges' },
  ];

  const cmsItems = [
    { name: 'Hero Banners', path: '/banners' },
    { name: 'Site Configuration', path: '/settings/global' },
    { name: 'Master Degrees', path: '/settings/degrees' },
    { name: 'Master Specializations', path: '/settings/specializations' },
    { name: 'Parent Universities', path: '/settings/universities' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight text-blue-600">Best College Admission</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}

          {/* CMS Dropdown Section */}
          <div className="pt-2">
            <button
              onClick={() => setIsCMSOpen(!isCMSOpen)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span>CMS Console</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCMSOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`mt-1 ml-4 space-y-1 overflow-hidden transition-all duration-300 ${isCMSOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
              {cmsItems.map((subItem) => (
                <NavLink
                  key={subItem.name}
                  to={subItem.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                      isActive
                        ? 'bg-blue-50/50 text-blue-700 border-blue-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-transparent'
                    }`
                  }
                >
                  {subItem.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.email || 'Admin User'}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h2 className="text-sm font-medium text-gray-500">Welcome back!</h2>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
