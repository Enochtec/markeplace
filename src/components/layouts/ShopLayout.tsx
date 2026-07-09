import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Store,
  LogOut, Menu, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

const navItems = [
  { to: '/shop/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shop/products', icon: Package, label: 'Products' },
  { to: '/shop/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/shop/profile', icon: Store, label: 'Shop Profile' },
];

export default function ShopLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="px-6 py-5 border-b border-gray-100">
        <Logo linkTo="/" size="sm" />
        <p className="text-[11px] text-gray-500 mt-1 ml-0.5 flex items-center gap-1">
          <Store size={11} /> Shop Dashboard
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                active
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon size={18} className={active ? 'text-orange-500' : ''} />
              <span>{label}</span>
              {active && <ChevronRight size={14} className="ml-auto text-orange-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
            {user?.firstName[0]}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">Shop Owner</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-[0.97]">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              {navItems.find((n) => n.to === location.pathname)?.label || 'Shop Dashboard'}
            </h1>
          </div>
          <Link to="/" target="_blank" className="btn-ghost text-xs">
            View Store
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
