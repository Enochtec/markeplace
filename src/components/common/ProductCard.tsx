import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, ImageIcon } from 'lucide-react';
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

  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const isWished = isWishlisted(product.id);
  const outOfStock = product.stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    if (user?.role !== 'CUSTOMER') return toast.error('Only customers can add to cart');
    try { await addToCart(product.id); }
    catch { toast.error('Failed to add to cart'); }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to save items');
    try { await toggleWishlist(product.id); }
    catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block h-full">
      <div className="bg-white border border-gray-200 overflow-hidden h-full flex flex-col transition-all duration-150 hover:border-gray-300"
        style={{ boxShadow: 'var(--shadow-sm)' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>

        {/* ── Image ── */}
        <div className="relative bg-gray-50 flex-shrink-0" style={{ aspectRatio: '1' }}>
          {primaryImage ? (
            <img src={primaryImage.url} alt={product.name}
              className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={28} className="text-gray-200" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-tight">
                -{discountPercent}%
              </span>
            )}
            {product.isFeatured && !discountPercent && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-tight">
                Featured
              </span>
            )}
          </div>

          {/* Out of stock veil */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="bg-gray-700 text-white text-xs font-semibold px-3 py-1">Out of Stock</span>
            </div>
          )}

          {/* Wishlist (shows on hover) */}
          <button onClick={handleWishlist}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${
              isWished ? 'text-red-500 border-red-200' : 'text-gray-400 hover:text-red-400'
            }`}>
            <Heart size={13} className={isWished ? 'fill-current' : ''} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-3 flex flex-col flex-1">
          {product.shop?.name && (
            <p className="text-[11px] font-semibold text-orange-500 uppercase tracking-wider truncate mb-1">
              {product.shop.name}
            </p>
          )}
          <h3 className="text-sm text-gray-900 line-clamp-2 leading-snug flex-1">
            {product.name}
          </h3>

          <div className="mt-1.5">
            <StarRating rating={product.rating} count={product.reviewCount} size={11} />
          </div>

          <div className="mt-2">
            <span className="text-base font-bold text-orange-500">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <div className="mt-2.5">
            {outOfStock ? (
              <div className="text-center py-1.5 bg-gray-100 text-xs font-medium text-gray-500 rounded">
                Out of Stock
              </div>
            ) : (
              <button onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 py-2 border border-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-orange-500 text-xs font-semibold rounded transition-colors duration-150">
                <ShoppingCart size={13} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
