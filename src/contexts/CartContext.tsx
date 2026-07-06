import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem } from '../types';
import { cartApi } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  cartItems: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') return;
    try {
      setIsLoading(true);
      const { data } = await cartApi.get();
      setCartItems(data.cartItems);
      setTotal(data.total);
      setItemCount(data.itemCount);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    await cartApi.add(productId, quantity);
    await refreshCart();
    toast.success('Added to cart');
  };

  const updateItem = async (id: string, quantity: number) => {
    await cartApi.update(id, quantity);
    await refreshCart();
  };

  const removeItem = async (id: string) => {
    await cartApi.remove(id);
    await refreshCart();
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    await cartApi.clear();
    setCartItems([]);
    setTotal(0);
    setItemCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, total, itemCount, isLoading, addToCart, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
