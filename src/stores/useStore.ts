import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  price: number;
  images: string[];
  modelImages: string[];
  colors: { name: string; hex: string; available: boolean }[];
  sizes: { name: string; available: boolean }[];
  category: string;
  categoryFr?: string;
  categoryEn?: string;
  description: string;
  descriptionFr?: string;
  descriptionEn?: string;
  modelInfo?: string;
  modelInfoFr?: string;
  modelInfoEn?: string;
}

// Cart sync utilities
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('temporal-cart-session-id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('temporal-cart-session-id', sessionId);
  }
  return sessionId;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSyncCart(cart: CartItem[], total: number) {
  if (typeof window === 'undefined') return;
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    // Try to get userId from auth store in localStorage
    let userId: string | null = null;
    try {
      const authRaw = localStorage.getItem('temporal-auth-store');
      if (authRaw) {
        const authData = JSON.parse(authRaw);
        userId = authData?.state?.user?.id || null;
      }
    } catch {
      // ignore parse errors
    }

    fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId,
        items: cart,
        total,
      }),
    }).catch(() => {
      // Silently fail - analytics should never block UX
    });
  }, 500);
}

interface StoreState {
  language: 'fr' | 'en';
  darkMode: boolean;
  cart: CartItem[];
  isCartOpen: boolean;
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  setLanguage: (lang: 'fr' | 'en') => void;
  toggleDarkMode: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  cartTotal: () => number;
}

function triggerSync(get: () => StoreState) {
  const state = get();
  const total = state.cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  debouncedSyncCart(state.cart, total);
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      darkMode: true,
      cart: [],
      isCartOpen: false,
      isSidebarOpen: false,
      isSearchOpen: false,
      setLanguage: (lang) => set({ language: lang }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      addToCart: (item) => {
        set((state) => {
          const existing = state.cart.find(
            (i) => i.id === item.id && i.size === item.size
          );
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        });
        triggerSync(get);
      },
      removeFromCart: (id, size) => {
        set((state) => ({
          cart: state.cart.filter((i) => !(i.id === id && i.size === size)),
        }));
        triggerSync(get);
      },
      updateQuantity: (id, size, quantity) => {
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        }));
        triggerSync(get);
      },
      clearCart: () => {
        set({ cart: [] });
        triggerSync(get);
      },
      setCartOpen: (open) => set({ isCartOpen: open }),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      cartTotal: () =>
        get().cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    }),
    {
      name: 'temporal-store',
      partialize: (state) => ({
        language: state.language,
        darkMode: state.darkMode,
        cart: state.cart,
      }),
    }
  )
);
