import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { WishlistItem } from '../types';
import { wishlistApi } from '../api/wishlist';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const { data } = await wishlistApi.get();
      setItems(data.items);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const toggleWishlist = async (productId: string) => {
    const { data } = await wishlistApi.toggle(productId);
    if (data.action === 'added') {
      toast.success('Added to wishlist');
    } else {
      toast.success('Removed from wishlist');
    }
    await refreshWishlist();
  };

  const removeItem = async (id: string) => {
    await wishlistApi.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Removed from wishlist');
  };

  const isWishlisted = (productId: string) => items.some((i) => i.productId === productId);

  return (
    <WishlistContext.Provider value={{ items, isLoading, toggleWishlist, removeItem, isWishlisted, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
