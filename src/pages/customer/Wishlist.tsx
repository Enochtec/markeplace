import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/format';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, isLoading, removeItem } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist <span className="text-orange-500">({items.length})</span></h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Heart size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mt-1">Save products you like by clicking the heart icon.</p>
          <Link to="/products" className="mt-5 inline-flex px-6 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const img = item.product.images?.find((i) => i.isPrimary) || item.product.images?.[0];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <Link to={`/products/${item.product.slug}`} className="block relative">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {img ? (
                      <img src={img.url} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ShoppingCart size={40} />
                      </div>
                    )}
                  </div>
                  {item.product.comparePrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)}%
                    </span>
                  )}
                </Link>
                <div className="p-4">
                  <Link to={`/products/${item.product.slug}`}>
                    <h3 className="text-sm font-semibold text-gray-800 hover:text-orange-500 line-clamp-2 transition-colors">{item.product.name}</h3>
                  </Link>
                  <StarRating rating={item.product.rating} size={12} showCount={false} />
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-bold text-gray-900">{formatPrice(item.product.price)}</span>
                      {item.product.comparePrice && (
                        <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(item.product.comparePrice)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleAddToCart(item.product.id)}
                      disabled={item.product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-colors">
                      <ShoppingCart size={14} />
                      {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button onClick={() => removeItem(item.id)}
                      className="p-2 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
