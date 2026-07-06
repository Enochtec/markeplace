import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import type { Order, PaginationMeta } from '../../types';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/format';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  PROCESSING: 'bg-purple-50 text-purple-700 border-purple-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    ordersApi.getMy({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setOrders(data.orders); setMeta(data.meta); })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 bg-white">
          <option value="">All Orders</option>
          {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Package size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
          <p className="text-gray-400 text-sm mt-1">Your order history will appear here.</p>
          <Link to="/products" className="mt-5 inline-flex px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-50">
                <div>
                  <p className="text-sm font-bold text-gray-800">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {order.items?.slice(0, 3).map((item) => {
                    const img = item.product?.images?.[0];
                    return (
                      <div key={item.id} className="flex items-center gap-2">
                        {img && <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50"><img src={img.url} alt="" className="w-full h-full object-cover" /></div>}
                        <p className="text-xs text-gray-600 line-clamp-1 max-w-[120px]">{item.product?.name}</p>
                      </div>
                    );
                  })}
                  {(order.items?.length || 0) > 3 && (
                    <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">{order.shop?.name}</p>
                  <Link to={`/account/orders/${order.id}`}
                    className="flex items-center gap-1 text-xs text-orange-500 font-semibold hover:underline">
                    View Details <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {meta && <Pagination meta={meta} onPageChange={setPage} />}
        </div>
      )}
    </div>
  );
}
