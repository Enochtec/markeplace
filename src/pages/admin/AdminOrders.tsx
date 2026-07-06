import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { Order, PaginationMeta } from '../../types';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/format';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700', SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-gray-50 text-gray-600',
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

  useEffect(() => {
    ordersApi.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    ordersApi.getAllAdmin({ page, limit: 15, search, ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setOrders(data.orders); setMeta(data.meta); })
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800">All Orders</h1>

      {/* Stats mini cards */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xl font-extrabold text-gray-900">{count as number}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{status.toLowerCase()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[180px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order # or customer..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400" />
        </div>
        <select value={statusFilter} onChange={(e) => { const v = e.target.value; setStatusFilter(v); setPage(1); setSearchParams(v ? { status: v } : {}); }}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">All Statuses</option>
          {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED'].map(s => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Shop', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-gray-800">#{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">{order.user?.firstName} {order.user?.lastName}</p>
                      <p className="text-xs text-gray-400">{(order.user as unknown as { email?: string })?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.shop?.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && <div className="px-5 py-3 border-t border-gray-50"><Pagination meta={meta} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  );
}
