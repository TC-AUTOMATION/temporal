import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  isAdmin: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmail: string | null;
  verificationCodes: Record<string, { code: string; expiresAt: number }>;
  users: User[];
  orders: Record<string, Order[]>; // userId -> orders

  // Actions
  setPendingEmail: (email: string | null) => void;
  generateVerificationCode: (email: string) => string;
  verifyCode: (email: string, code: string) => boolean;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addOrder: (userId: string, order: Order) => void;
  getUserOrders: (userId: string) => Order[];
  isAdmin: () => boolean;
}

// Admin emails
const ADMIN_EMAILS = [
  'pradeltom08@gmail.com',
  'chloethiel201@gmail.com'
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingEmail: null,
      verificationCodes: {},
      users: [],
      orders: {},

      setPendingEmail: (email) => set({ pendingEmail: email }),

      generateVerificationCode: (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        set((state) => ({
          verificationCodes: {
            ...state.verificationCodes,
            [email]: { code, expiresAt }
          }
        }));

        return code;
      },

      verifyCode: (email, code) => {
        const state = get();
        const stored = state.verificationCodes[email];

        if (!stored) return false;
        if (Date.now() > stored.expiresAt) return false;
        if (stored.code !== code) return false;

        // Clear the used code
        set((state) => {
          const { [email]: _, ...rest } = state.verificationCodes;
          return { verificationCodes: rest };
        });

        return true;
      },

      login: (email) => {
        const state = get();
        let user = state.users.find(u => u.email === email);

        if (!user) {
          // Create new user
          user = {
            id: `user_${Date.now()}`,
            email,
            isAdmin: ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase()),
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            users: [...state.users, user!]
          }));
        }

        set({
          user,
          isAuthenticated: true,
          pendingEmail: null
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          pendingEmail: null
        });
      },

      updateProfile: (data) => {
        set((state) => {
          if (!state.user) return state;

          const updatedUser = { ...state.user, ...data };
          const updatedUsers = state.users.map(u =>
            u.id === state.user!.id ? updatedUser : u
          );

          return {
            user: updatedUser,
            users: updatedUsers
          };
        });
      },

      addOrder: (userId, order) => {
        set((state) => ({
          orders: {
            ...state.orders,
            [userId]: [...(state.orders[userId] || []), order]
          }
        }));
      },

      getUserOrders: (userId) => {
        return get().orders[userId] || [];
      },

      isAdmin: () => {
        const user = get().user;
        return user?.isAdmin || false;
      }
    }),
    {
      name: 'temporal-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
        orders: state.orders
      })
    }
  )
);
