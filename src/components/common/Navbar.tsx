import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, Menu, X, Bell,
  ChevronDown, LogOut, Package, Settings, LayoutDashboard, Store, User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [search, setSearch]           = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adIndex, setAdIndex]         = useState(0);

  const topAds = [
    'Free delivery on orders over $50 — Shop thousands of products',
    'Summer Sale — Up to 40% off on selected items this week',
    'New sellers welcome — Open your shop today for free',
  ];

  useEffect(() => {
    const t = setInterval(() => setAdIndex(p => (p + 1) % topAds.length), 5000);
    return () => clearInterval(t);
  }, [topAds.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'SHOP_OWNER') return '/shop/dashboard';
    return '/account/orders';
  };

  const isSeller = user?.role === 'SHOP_OWNER';
  const isAdmin  = user?.role === 'ADMIN';

  const navLinks = isSeller || isAdmin
    ? [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'All Products' },
        { to: isSeller ? '/shop/dashboard' : '/admin/dashboard', label: 'My Dashboard', highlight: true },
        { to: '/contact', label: 'Contact' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'All Products' },
        { to: '/products?category=electronics', label: 'Electronics' },
        { to: '/products?category=fashion', label: 'Fashion' },
        { to: '/products?category=home-garden', label: 'Home & Garden' },
        { to: '/products?category=beauty', label: 'Beauty' },
        { to: '/products?featured=true', label: 'Deals', highlight: true },
      ];

  const isActive = (to: string) =>
    to === '/'
      ? location.pathname === '/'
      : !to.includes('?') && location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>

      {/* ── Layer 1: Utility bar ── */}
      <div className="hidden md:block bg-gray-900 text-gray-400 text-xs">
        <div className="page-container flex items-center justify-between h-8">
          <p key={adIndex} className="animate-fade-in truncate max-w-lg">{topAds[adIndex]}</p>
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/contact" className="hover:text-white transition-colors">Help & Support</Link>
            {!isAuthenticated ? (
              <>
                <span className="text-gray-700">|</span>
                <Link to="/login"    className="hover:text-white transition-colors">Sign In</Link>
                <span className="text-gray-700">|</span>
                <Link to="/register" className="hover:text-white transition-colors">Create Account</Link>
              </>
            ) : (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-gray-300">Hello, {user?.firstName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Layer 2: Main bar ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="page-container">
          <div className="flex items-center gap-5 h-[60px]">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 48 48" fill="none">
                  <path d="M12 16h24l-2.5 22h-19L12 16z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/>
                  <path d="M17 16v-3a7 7 0 0 1 14 0v3" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="19.5" cy="26" r="2" fill="currentColor"/>
                  <circle cx="28.5" cy="26" r="2" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-lg font-extrabold text-gray-900 tracking-tight hidden sm:block">
                Market<span className="text-orange-500">hub</span>
              </span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full h-[38px] border-2 border-orange-400 rounded overflow-hidden focus-within:border-orange-500">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products, brands and categories..."
                  className="flex-1 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none bg-white"
                />
                <button type="submit"
                  className="px-4 bg-orange-500 hover:bg-orange-600 text-white transition-colors flex-shrink-0 flex items-center justify-center">
                  <Search size={17} />
                </button>
              </div>
            </form>

            {/* Right action icons */}
            <div className="flex items-center gap-0 ml-auto">

              {/* Wishlist */}
              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <Link to="/wishlist"
                  className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors">
                  <Heart size={20} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Wishlist</span>
                </Link>
              )}

              {/* Cart */}
              {user?.role !== 'ADMIN' && user?.role !== 'SHOP_OWNER' && (
                <Link to="/cart"
                  className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors relative">
                  <div className="relative">
                    <ShoppingCart size={20} strokeWidth={1.5} />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">Cart</span>
                </Link>
              )}

              {/* Notifications */}
              {isAuthenticated && (
                <Link to={`${getDashboardLink()}#notifications`}
                  className="hidden sm:flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors">
                  <Bell size={20} strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">Alerts</span>
                </Link>
              )}

              {/* Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600 hover:text-orange-500 transition-colors">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      : <User size={20} strokeWidth={1.5} />
                    }
                    <span className="hidden sm:flex items-center gap-0.5 text-[10px] font-medium">
                      Account <ChevronDown size={9} />
                    </span>
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded shadow-lg z-50 py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
                        </div>
                        <div className="py-1">
                          <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <LayoutDashboard size={14} className="text-gray-400" /> Dashboard
                          </Link>
                          {user?.role === 'CUSTOMER' && (<>
                            <Link to="/account/orders" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Package size={14} className="text-gray-400" /> My Orders
                            </Link>
                            <Link to="/account/profile" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={14} className="text-gray-400" /> Profile Settings
                            </Link>
                          </>)}
                          {user?.role === 'SHOP_OWNER' && (
                            <Link to="/shop/profile" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Store size={14} className="text-gray-400" /> Shop Profile
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 py-1">
                          <button onClick={() => { logout(); setDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 ml-2">
                  <Link to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-orange-500 px-3 py-2 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary !px-4 !py-2 !text-sm">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-icon ml-1">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Category nav ── */}
      <div className="hidden md:block bg-gray-900">
        <div className="page-container">
          <nav className="flex items-center overflow-x-auto">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive(link.to)
                    ? 'bg-orange-500 text-white'
                    : link.highlight
                    ? 'text-orange-300 hover:bg-gray-800 hover:text-orange-200'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="p-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex h-9">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 border border-gray-300 border-r-0 px-3 text-sm rounded-l focus:outline-none focus:border-orange-400" />
              <button type="submit" className="px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-r transition-colors">
                <Search size={16} />
              </button>
            </form>
          </div>
          <nav className="py-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-sm font-medium border-b border-gray-50 transition-colors ${
                  link.highlight ? 'text-orange-500' : 'text-gray-700 hover:bg-gray-50'
                }`}>
                {link.label}
              </Link>
            ))}
          </nav>
          {!isAuthenticated ? (
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center !text-sm">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary  flex-1 justify-center !text-sm">Register</Link>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => { logout(); navigate('/login'); setMobileOpen(false); }}
                className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
