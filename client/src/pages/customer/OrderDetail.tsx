import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import type { Order } from '../../types';
import { ordersApi } from '../../api/orders';
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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    ordersApi.getMyById(id)
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[order.status] || 'bg-gray-50 text-gray-600'}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Items */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Items</h3>
            <div className="space-y-3">
              {order.items?.map((item) => {
                const img = item.product?.images?.[0];
                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    {img ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-gray-300 flex-shrink-0">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Shipping Address</h3>
            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-gray-400">{order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Order Summary</h3>
            <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={order.shippingFee === 0 ? 'text-green-600' : ''}>
                  {order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>${(order.totalAmount + order.shippingFee).toFixed(2)}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-gray-500 pt-1">
                  <span>Payment</span>
                  <span className="capitalize">{order.paymentMethod.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
