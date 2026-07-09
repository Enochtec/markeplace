import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, Search, Menu, X, Bell,
  ChevronDown, LogOut, Package, Settings, LayoutDashboard, Store,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  const topAds = [
    { text: 'Free delivery on orders over KES 50 — Shop with confidence', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80' },
    { text: 'Summer Sale — Up to 40% off selected items', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1920&q=80' },
    { text: 'New sellers welcome — Start your shop today', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80' },
  ];

  useEffect(() => {
    const t = setInterval(() => setAdIndex((p) => (p + 1) % topAds.length), 5000);
    return () => clearInterval(t);
  }, [topAds.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'SHOP_OWNER') return '/shop/dashboard';
    return '/account/orders';
  };

  const isSeller = user?.role === 'SHOP_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = isSeller || isAdmin
    ? [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        { to: isSeller ? '/shop/dashboard' : '/admin/dashboard', label: 'Dashboard', highlight: true },
        { to: '/contact', label: 'Contact' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        { to: '/products?category=electronics', label: 'Electronics' },
        { to: '/products?category=fashion', label: 'Fashion' },
        { to: '/products?category=home-garden', label: 'Home & Garden' },
        { to: '/products?featured=true', label: 'Deals', highlight: true },
        { to: '/contact', label: 'Contact' },
      ];

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
      {/* Top ad carousel */}
      <div className="relative h-10 overflow-hidden hidden md:block">
        {topAds.map((ad, i) => (
          <div key={i}
            className={`absolute inset-0 flex items-center justify-center text-white text-[11px] tracking-wide font-medium transition-all duration-700 ${
              i === adIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${ad.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
            <div className="absolute inset-0 bg-gray-900/60" />
            <span className="relative z-10">{ad.text}</span>
          </div>
        ))}
      </div>

      <div className="page-container">
        <div className="flex items-center gap-4 h-16">
          <Logo linkTo="/" />

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, shops..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-xl border border-transparent focus:border-orange-400 transition-all outline-none placeholder-gray-400"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {isAuthenticated ? (
              <>
                {user?.role === 'CUSTOMER' && (
                  <Link to="/wishlist" className="btn-icon hidden sm:flex" title="Wishlist">
                    <Heart size={20} />
                  </Link>
                )}

                {user?.role === 'CUSTOMER' && (
                  <Link to="/cart" className="btn-icon relative" title="Cart">
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}

                <Link to={`${getDashboardLink()}#notifications`} className="btn-icon hidden sm:flex" title="Notifications">
                  <Bell size={20} />
                </Link>

                {/* User dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center ring-2 ring-orange-50">
                        <span className="text-orange-600 text-xs font-bold">
                          {user?.firstName[0]}{user?.lastName[0]}
                        </span>
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.firstName}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                        <div className="px-4 py-2.5 border-b border-gray-50 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 capitalize mt-0.5">{user?.role?.toLowerCase().replace('_', ' ')}</p>
                        </div>
                        <Link to={getDashboardLink()} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 active:scale-[0.97]">
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        {user?.role === 'CUSTOMER' && (
                          <>
                            <Link to="/account/orders" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 active:scale-[0.97]">
                              <Package size={16} /> My Orders
                            </Link>
                            <Link to="/account/profile" onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 active:scale-[0.97]">
                              <Settings size={16} /> Profile Settings
                            </Link>
                          </>
                        )}
                        {user?.role === 'SHOP_OWNER' && (
                          <Link to="/shop/profile" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-200 active:scale-[0.97]">
                            <Store size={16} /> Shop Profile
                          </Link>
                        )}
                        <hr className="my-1 mx-2 border-gray-50" />
                        <button onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-[0.97]">
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-5 !py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-icon">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 py-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.97] ${
                link.highlight
                  ? 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch} className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 rounded-xl outline-none"
              />
            </form>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                    link.highlight ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
