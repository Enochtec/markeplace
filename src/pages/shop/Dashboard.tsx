import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Banknote, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { shopsApi } from '../../api/shops';
import { formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700', SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
};

export default function ShopDashboard() {
  const [data, setData] = useState<{
    shop: { name: string; status: string; logo?: string; _count: { products: number; orders: number } };
    stats: { totalRevenue: number; pendingOrders: number; totalProducts: number; totalOrders: number };
    recentOrders: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string; user: { firstName: string; lastName: string } }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopsApi.getMyShop()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!data) return <div className="text-center py-10 text-gray-500">Could not load shop data</div>;

  const { shop, stats, recentOrders } = data;

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: Banknote, color: 'bg-green-50 text-green-600', change: '' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-50 text-yellow-600', change: '' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600', change: '' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', change: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Shop header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        {shop.logo ? (
          <img src={shop.logo} alt={shop.name} className="w-14 h-14 rounded-xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-500">
            {shop.name[0]}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-gray-800">{shop.name}</h2>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${shop.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {shop.status}
          </span>
        </div>
        <div className="ml-auto">
          <Link to="/shop/profile" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
            Manage Shop <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/shop/products/add', icon: Package, label: 'Add New Product', color: 'bg-orange-500 hover:bg-orange-600 text-white' },
          { to: '/shop/orders', icon: ShoppingBag, label: 'View Orders', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
          { to: '/shop/profile', icon: Users, label: 'Shop Settings', color: 'bg-gray-50 hover:bg-gray-100 text-gray-700' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-semibold text-sm transition-colors ${color}`}>
            <Icon size={20} /> {label} <ArrowRight size={16} className="ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp size={18} className="text-orange-500" /> Recent Orders</h3>
          <Link to="/shop/orders" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-800">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{order.user.firstName} {order.user.lastName} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
