import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: {
      name: string;
      slug: string;
    };
  };
}

interface WishlistStore {
  wishlist: WishlistItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      isLoading: false,
      error: null,

      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/wishlist', {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            set({ wishlist: data.items || [], isLoading: false });
          } else {
            // User not logged in or error - clear wishlist
            set({ wishlist: [], isLoading: false });
          }
        } catch (error) {
          console.error('Fetch wishlist error:', error);
          set({ error: 'Failed to load wishlist', isLoading: false });
        }
      },

      addToWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId }),
          });

          if (response.ok) {
            const data = await response.json();
            set((state) => ({
              wishlist: [data, ...state.wishlist],
              isLoading: false,
            }));
            return true;
          } else {
            const error = await response.json();
            set({ error: error.error || 'Failed to add to wishlist', isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Add to wishlist error:', error);
          set({ error: 'Failed to add to wishlist', isLoading: false });
          return false;
        }
      },

      removeFromWishlist: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/wishlist?productId=${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            set((state) => ({
              wishlist: state.wishlist.filter((item) => item.productId !== productId),
              isLoading: false,
            }));
            return true;
          } else {
            const error = await response.json();
            set({ error: error.error || 'Failed to remove from wishlist', isLoading: false });
            return false;
          }
        } catch (error) {
          console.error('Remove from wishlist error:', error);
          set({ error: 'Failed to remove from wishlist', isLoading: false });
          return false;
        }
      },

      isInWishlist: (productId: string) => {
        return get().wishlist.some((item) => item.productId === productId);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'temporal-wishlist',
      partialize: (state) => ({
        // Only persist wishlist items, not loading/error states
        wishlist: state.wishlist,
      }),
    }
  )
);
