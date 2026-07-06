import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote, ShoppingBag, Store, Users, Package, Clock, TrendingUp,
  UserPlus, ArrowRight, CreditCard, AlertCircle, Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsApi } from '../../api/settings';
import { formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DashboardStats {
  totalUsers: number; totalShops: number; totalProducts: number;
  totalOrders: number; totalRevenue: number; pendingOrders: number;
  activeShops: number; newUsersThisMonth: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.getDashboard()
      .then(({ data }) => { setStats(data.stats); setMonthlyRevenue(data.monthlyRevenue); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!stats) return <div className="text-center py-10 text-gray-400">Could not load dashboard</div>;

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const kpiCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: Banknote },
    { label: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag },
    { label: 'Active Shops', value: stats.activeShops.toLocaleString(), icon: Store },
    { label: 'Customers', value: stats.totalUsers.toLocaleString(), icon: Users },
  ];

  const secondaryStats = [
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, link: '/admin/orders' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, link: '/admin/products' },
    { label: 'New Users', value: `+${stats.newUsersThisMonth}`, icon: UserPlus, link: '/admin/users' },
    { label: 'Total Shops', value: `${stats.activeShops} / ${stats.totalShops}`, icon: TrendingUp, link: '/admin/shops' },
  ];

  const quickActions = [
    { to: '/admin/shops', label: 'Manage Shops', icon: Store, desc: 'Approve, suspend, or review shops' },
    { to: '/admin/orders', label: 'All Orders', icon: ShoppingBag, desc: 'Track fulfillment and status' },
    { to: '/admin/users', label: 'User Management', icon: Users, desc: 'View and manage accounts' },
    { to: '/admin/products', label: 'All Products', icon: Package, desc: 'Review and feature products' },
    { to: '/admin/categories', label: 'Categories', icon: Activity, desc: 'Organize product catalog' },
    { to: '/admin/settings', label: 'Platform Settings', icon: CreditCard, desc: 'Configure application' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-bold mt-1 tracking-tight">
              Welcome back, {user?.firstName || 'Admin'}
            </h1>
            <p className="text-gray-400 text-sm mt-1 max-w-lg">
              Here's an overview of your marketplace. {stats.pendingOrders > 0 && `${stats.pendingOrders} orders need attention.`}
            </p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <Icon size={20} className="text-gray-400 mb-3" />
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-800">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly revenue for the last 6 months</p>
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">Last 6 months</span>
          </div>

          {monthlyRevenue.every(m => m.revenue === 0) ? (
            <div className="flex flex-col items-center justify-center h-44 text-gray-400">
              <TrendingUp size={32} className="text-gray-200 mb-2" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          ) : (
            <div className="relative h-44">
              <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-xs text-gray-400 pb-1">
                <span>KES {(maxRevenue / 1000).toFixed(1)}k</span>
                <span>KES {(maxRevenue / 2000).toFixed(1)}k</span>
                <span>KES 0</span>
              </div>
              <div className="ml-12 h-full flex items-end gap-3">
                {monthlyRevenue.map(({ month, revenue }) => {
                  const height = Math.max(6, (revenue / maxRevenue) * 100);
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-semibold text-gray-500">
                        {revenue >= 1000 ? `KES ${(revenue / 1000).toFixed(1)}k` : formatPrice(revenue)}
                      </span>
                      <div className="w-full bg-orange-500 rounded-t-lg transition-opacity hover:opacity-80" style={{ height: `${height}%` }} />
                      <span className="text-xs font-medium text-gray-500">{month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="ml-12 border-t border-gray-100" />
            </div>
          )}
        </div>

        {/* Secondary stats */}
        <div className="space-y-3">
          {secondaryStats.map(({ label, value, icon: Icon, link }) => (
            <Link key={label} to={link}
              className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-extrabold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-gray-300 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to}
              className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200 group text-center">
              <Icon size={20} className="text-gray-400 mx-auto mb-2.5 group-hover:text-orange-500 transition-colors" />
              <p className="text-xs font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending alert */}
      {stats.pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            <strong>{stats.pendingOrders}</strong> order{stats.pendingOrders !== 1 ? 's' : ''} pending{' '}
            {stats.pendingOrders === 1 ? 'action' : 'actions'}.
          </p>
          <Link to="/admin/orders?status=PENDING"
            className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline hover:no-underline flex-shrink-0">
            View Orders
          </Link>
        </div>
      )}
    </div>
  );
}
