import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Store, Users, Tag, Package, ShoppingBag,
  Image, Settings, LogOut, Menu, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/shops', icon: Store, label: 'Shops' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="px-6 py-5 border-b border-gray-800">
        <Logo dark linkTo="/" size="sm" />
        <p className="text-[11px] text-gray-500 mt-1 ml-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                active ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={18} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.firstName[0]}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-xl transition-all duration-200 active:scale-[0.97]">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 border-r border-gray-200">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              {navItems.find((n) => n.to === location.pathname)?.label || 'Admin Panel'}
            </h1>
          </div>
          <Link to="/" target="_blank" className="btn-ghost text-xs">
            View Site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
