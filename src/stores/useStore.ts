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
      addToCart: (item) =>
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
        }),
      removeFromCart: (id, size) =>
        set((state) => ({
          cart: state.cart.filter((i) => !(i.id === id && i.size === size)),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ cart: [] }),
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
