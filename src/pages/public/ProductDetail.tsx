import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Share2, ChevronLeft, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import type { Product } from '../../types';
import { productsApi } from '../../api/products';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsApi.getById(id)
      .then(({ data }) => {
        setProduct(data.product);
        const primaryIdx = data.product.images?.findIndex((i: { isPrimary: boolean }) => i.isPrimary);
        setSelectedImage(primaryIdx >= 0 ? primaryIdx : 0);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return toast.error('Please login to add to cart');
    if (user?.role !== 'CUSTOMER') return toast.error('Only customers can add to cart');
    if (!product) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please login to save items');
    if (!product) return;
    await toggleWishlist(product.id);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">Product not found</p>
      <Link to="/products" className="text-orange-500 hover:underline flex items-center gap-1">
        <ArrowLeft size={16} /> Back to products
      </Link>
    </div>
  );

  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const images = product.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-orange-500">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-orange-500">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-orange-500">{product.category?.name}</Link>
        <span>/</span>
        <span className="text-gray-800 line-clamp-1">{product.name}</span>
      </nav>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Images */}
          <div className="p-6 lg:p-8">
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-4">
              {images.length > 0 ? (
                <img src={images[selectedImage]?.url} alt={product.name}
                  className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setSelectedImage((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-orange-400' : 'border-gray-200'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 lg:p-8 lg:border-l border-gray-100">
            {/* Shop */}
            <Link to={`/shops/${product.shop?.slug}`}
              className="inline-flex items-center gap-2 text-sm text-orange-500 font-medium mb-3 hover:underline">
              <Store size={14} /> {product.shop?.name}
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <StarRating rating={product.rating} count={product.reviewCount} size={16} />
              {product.soldCount > 0 && (
                <span className="text-xs text-gray-400">• {product.soldCount} sold</span>
              )}
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mt-4">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                </span>
              )}
            </div>

            {/* Category */}
            <div className="mt-3">
              <span className="text-xs text-gray-500">Category: </span>
              <Link to={`/products?category=${product.category?.slug}`} className="text-xs text-orange-500 hover:underline">
                {product.category?.name}
              </Link>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 text-lg font-medium transition-colors">−</button>
                    <span className="px-4 py-2.5 text-sm font-semibold text-gray-800 min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-4 py-2.5 text-gray-500 hover:bg-gray-50 text-lg font-medium transition-colors">+</button>
                  </div>
                  <span className="text-sm text-gray-400">Max {product.stock}</span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
                <ShoppingCart size={18} />
                {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button onClick={handleWishlist}
                className={`p-3.5 border rounded-xl transition-colors ${isWishlisted(product.id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'}`}>
                <Heart size={20} className={isWishlisted(product.id) ? 'fill-red-500' : ''} />
              </button>
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
                className="p-3.5 border border-gray-200 text-gray-500 hover:border-gray-300 rounded-xl transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Description & Reviews */}
        <div className="border-t border-gray-100 p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Product Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Customer Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={18} className={s <= Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ({product.reviewCount})</span>
                </div>
              </div>

              {(product as unknown as { reviews?: { id: string; rating: number; comment?: string; user: { firstName: string; lastName: string }; createdAt: string }[] }).reviews?.length === 0 ? (
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {(product as unknown as { reviews?: { id: string; rating: number; comment?: string; user: { firstName: string; lastName: string }; createdAt: string }[] }).reviews?.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">
                          {review.user.firstName} {review.user.lastName}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={13} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                        ))}
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
