import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/layouts/PublicLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ShopLayout from './components/layouts/ShopLayout';
import ProtectedRoute from './components/routes/ProtectedRoute';

import Home from './pages/public/Home';
import Products from './pages/public/Products';
import ProductDetail from './pages/public/ProductDetail';
import Contact from './pages/public/Contact';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Orders from './pages/customer/Orders';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Wishlist from './pages/customer/Wishlist';

import ShopDashboard from './pages/shop/Dashboard';
import ShopProducts from './pages/shop/ShopProducts';
import AddEditProduct from './pages/shop/AddEditProduct';
import ShopOrders from './pages/shop/ShopOrders';
import ShopProfile from './pages/shop/ShopProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
        <Route element={<PublicLayout />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/account/orders" element={<Orders />} />
          <Route path="/account/orders/:id" element={<OrderDetail />} />
          <Route path="/account/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Shop owner protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['SHOP_OWNER']} />}>
        <Route element={<ShopLayout />}>
          <Route path="/shop/dashboard" element={<ShopDashboard />} />
          <Route path="/shop/products" element={<ShopProducts />} />
          <Route path="/shop/products/add" element={<AddEditProduct />} />
          <Route path="/shop/products/edit/:id" element={<AddEditProduct />} />
          <Route path="/shop/orders" element={<ShopOrders />} />
          <Route path="/shop/profile" element={<ShopProfile />} />
        </Route>
      </Route>

      {/* Admin protected routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}
