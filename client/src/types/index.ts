export type Role = 'ADMIN' | 'SHOP_OWNER' | 'CUSTOMER';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type ShopStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  shop?: Shop | null;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  status: ShopStatus;
  rating: number;
  reviewCount: number;
  totalSales: number;
  ownerId: string;
  owner?: Partial<User>;
  createdAt: string;
  _count?: { products: number; orders: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  publicId?: string;
  isPrimary: boolean;
  productId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  shopId: string;
  categoryId: string;
  createdAt: string;
  images: ProductImage[];
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  shop: Pick<Shop, 'id' | 'name' | 'slug' | 'logo'>;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images'>;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;
  userId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  shop?: Pick<Shop, 'id' | 'name' | 'logo' | 'email' | 'phone'>;
  items: OrderItem[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  userId: string;
  productId: string;
  product: Pick<Product, 'id' | 'name' | 'slug' | 'price' | 'comparePrice' | 'stock' | 'images' | 'shop'>;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  productId: string;
  createdAt: string;
  user: Pick<User, 'firstName' | 'lastName' | 'avatar'>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  userId: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}
