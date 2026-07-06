import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Package, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export default function Checkout() {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: { country: 'Nigeria' },
  });

  const shippingFee = total >= 50 ? 0 : 4.99;

  const onSubmit = async (shippingAddress: CheckoutForm) => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    setIsSubmitting(true);
    try {
      const items = cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      await ordersApi.create({ items, shippingAddress, paymentMethod });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/account/orders');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Order failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Package size={56} className="text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No items to checkout</h2>
        <button onClick={() => navigate('/products')} className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-5">
            {/* Shipping info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><Truck size={18} className="text-orange-500" /> Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'fullName' as const, label: 'Full Name', placeholder: 'John Doe', rules: { required: 'Required' } },
                  { name: 'phone' as const, label: 'Phone Number', placeholder: '+1 234 567 890', rules: { required: 'Required' } },
                ].map(({ name, label, placeholder, rules }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input {...register(name, rules)} placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                  <input {...register('address', { required: 'Required' })} placeholder="123 Main Street"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
                {[
                  { name: 'city' as const, label: 'City', placeholder: 'Lagos' },
                  { name: 'state' as const, label: 'State / Province', placeholder: 'Lagos State' },
                  { name: 'country' as const, label: 'Country', placeholder: 'Nigeria' },
                  { name: 'zipCode' as const, label: 'ZIP Code (optional)', placeholder: '100001' },
                ].map(({ name, label, placeholder }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input {...register(name, name !== 'zipCode' ? { required: 'Required' } : {})} placeholder={placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                    {name !== 'zipCode' && errors[name] && <p className="text-red-500 text-xs mt-1">{(errors[name] as { message?: string })?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><CreditCard size={18} className="text-orange-500" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer', desc: 'Transfer to our bank account' },
                  { value: 'CARD', label: 'Credit / Debit Card', desc: 'Coming soon — secure online payment' },
                ].map((method) => (
                  <label key={method.value} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === method.value ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {cartItems.map((item) => {
                  const img = item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        {img && <img src={img.url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className={shippingFee === 0 ? 'text-green-600' : ''}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span></div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
                  <span>Total</span><span>{formatPrice(total + shippingFee)}</span>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="mt-5 w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition-colors text-sm">
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                By placing your order, you agree to our Terms & Conditions.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
