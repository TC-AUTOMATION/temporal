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

// --- Migration: anciens "ensembles" (article unique) -> produits du pack ---
// Les ensembles Temporal Noir/Blanc n'existent plus en tant qu'article : ils sont
// désormais des packs (veste + jogging). On remplace donc dans les paniers déjà
// enregistrés l'ancien article ensemble par ses deux produits, comme le ferait
// l'ajout du pack au panier (cf. src/app/packs/[slug]/page.tsx).
type EnsembleComponent = Pick<CartItem, 'id' | 'name' | 'price' | 'color' | 'image'>;

const ENSEMBLE_TO_PACK: Record<string, EnsembleComponent[]> = {
  prod_ensemble_noir: [
    {
      id: 'cmolu6gzg000ko3012zpw2qli',
      name: 'Veste temporal - Noir',
      price: 89.98,
      color: 'Noir',
      image: '/clothes/img_1242-mnvl9l04.jpg',
    },
    {
      id: 'cmizyi5oj000vrxtfxefj0f86',
      name: 'Jogging Temporal - Noir',
      price: 59.98,
      color: 'Noir',
      image: '/clothes/img_1257-mnvmk6dr.jpg',
    },
  ],
  prod_ensemble_blanc: [
    {
      id: 'cmizyi5o8000jrxtfzyw5sa4t',
      name: 'Veste Temporal - Blanche',
      price: 89.98,
      color: 'Blanc',
      image: '/clothes/img_1245-mnvmi4ym.jpg',
    },
    {
      id: 'cmizyi5od000prxtf83icbpwb',
      name: 'Jogging Temporal - Blanc',
      price: 59.98,
      color: 'Blanc',
      image: '/clothes/img_1256-mnvmlby5.jpg',
    },
  ],
};

export function migrateEnsembleCart(cart: CartItem[]): CartItem[] {
  const result: CartItem[] = [];

  const pushMerged = (item: CartItem) => {
    const existing = result.find((i) => i.id === item.id && i.size === item.size);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      result.push({ ...item });
    }
  };

  for (const item of cart) {
    const components = ENSEMBLE_TO_PACK[item.id];
    if (!components) {
      pushMerged(item);
      continue;
    }
    // Remplace l'ensemble par ses produits, en conservant taille et quantité.
    for (const comp of components) {
      pushMerged({
        id: comp.id,
        name: comp.name,
        price: comp.price,
        size: item.size,
        color: comp.color,
        quantity: item.quantity,
        image: comp.image,
      });
    }
  }

  return result;
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
      version: 1,
      migrate: (persistedState, version) => {
        const state = (persistedState ?? {}) as Partial<StoreState>;
        const cart = Array.isArray(state.cart) ? state.cart : [];
        return {
          language: state.language ?? 'fr',
          darkMode: state.darkMode ?? true,
          cart: version < 1 ? migrateEnsembleCart(cart) : cart,
        };
      },
      partialize: (state) => ({
        language: state.language,
        darkMode: state.darkMode,
        cart: state.cart,
      }),
    }
  )
);
