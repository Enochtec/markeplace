import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Store,
  LogOut, Menu, X, ExternalLink, Plus, Bell,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/shop/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shop/products',  icon: Package,         label: 'Products' },
  { to: '/shop/orders',    icon: ShoppingBag,     label: 'Orders' },
  { to: '/shop/profile',   icon: Store,           label: 'Shop Profile' },
];

export default function ShopLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentItem = NAV_ITEMS.find(n => n.to === location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-100"
      style={{ boxShadow: '1px 0 0 0 #f1f5f9' }}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none">
              <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
              <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
              <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-black text-sm tracking-tight leading-none">Markethub</p>
            <p className="text-gray-400 text-[10px] font-semibold tracking-wider mt-0.5">SELLER</p>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Quick action */}
      <div className="px-3 pt-4 pb-2">
        <Link to="/shop/products/add" onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded transition-colors duration-150">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2 mt-2">Navigation</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-400 rounded-full" />
                )}
                <Icon size={17} className={active ? 'text-orange-500' : ''} />
                <span>{label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-gray-400">Shop Owner</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500/70 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-150">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-5 h-16 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-icon -ml-1">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{currentItem?.label || 'Shop'}</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Shop / {currentItem?.label || 'Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon">
              <Bell size={18} />
            </button>
            <Link to="/" target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded transition-all duration-200">
              View Store <ExternalLink size={12} />
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
