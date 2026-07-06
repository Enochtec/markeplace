import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Cart() {
  const { cartItems, total, itemCount, isLoading, updateItem, removeItem, clearCart } = useCart();

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-orange-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse our products and add items you love.</p>
        <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Cart <span className="text-orange-500">({itemCount})</span></h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const img = item.product.images?.[0];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                <Link to={`/products/${item.product.slug}`}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    {img ? (
                      <img src={img.url} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ShoppingBag size={28} />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.slug}`} className="text-sm font-semibold text-gray-800 hover:text-orange-500 line-clamp-2 transition-colors">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.product.shop?.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 min-w-[2.5rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900">{formatPrice(item.product.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.product.price)} each</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors self-start">
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium text-gray-800">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">{total >= 50 ? 'Free' : 'KES 4.99'}</span>
              </div>
              {total < 50 && (
                <p className="text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded-lg">
                  Add {formatPrice(50 - total)} more to get free shipping!
                </p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(total + (total >= 50 ? 0 : 4.99))}</span>
              </div>
            </div>
            <Link to="/checkout"
              className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="mt-3 w-full flex items-center justify-center text-sm text-gray-500 hover:text-orange-500 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
