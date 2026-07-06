import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import type { Order, PaginationMeta } from '../../types';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/format';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700', SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
};

export default function ShopOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    ordersApi.getShopOrders({ page, limit: 15, ...(statusFilter && { status: statusFilter }) })
      .then(({ data }) => { setOrders(data.orders); setMeta(data.meta); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      await ordersApi.updateStatus(orderId, status);
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Orders</h1>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none bg-white">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map(h => (
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
                      <p className="text-xs text-gray-400">{order.user?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{order.items?.length || 0} items</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <select
                        disabled={updating === order.id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-orange-400 bg-white disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                      </select>
                    </td>
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
