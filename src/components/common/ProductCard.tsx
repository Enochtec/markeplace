import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import StarRating from './StarRating';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    if (user?.role !== 'CUSTOMER') return toast.error('Only customers can add to cart');
    try { await addToCart(product.id); } catch { toast.error('Failed to add to cart'); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to save items');
    try { await toggleWishlist(product.id); } catch { toast.error('Failed to update wishlist'); }
  };

  const isWished = isWishlisted(product.id);

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="card-hover overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 aspect-square">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}

          {/* Discount badge */}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
              <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            title="Add to wishlist"
          >
            <Heart
              size={15}
              className={isWished ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5">
          {product.shop?.name && (
            <p className="text-[11px] text-orange-500 font-medium uppercase tracking-wide mb-1">{product.shop.name}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>
          <div className="mt-1.5">
            <StarRating rating={product.rating} count={product.reviewCount} size={11} />
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-icon !bg-orange-500 hover:!bg-orange-600 !text-white hover:!text-white disabled:!bg-gray-200 disabled:!text-gray-400"
              title="Add to cart"
            >
              <ShoppingCart size={15} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
