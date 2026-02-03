import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth as authApi, users as usersApi, orders as ordersApi, type User as ApiUser, type Order as ApiOrder } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isAdmin: boolean;
  newsletter?: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  deliveryMethod: 'DELIVERY' | 'HAND_DELIVERY';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    color?: string | null;
    size?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingEmail: string | null;
  demoCode: string | null;
  error: string | null;

  // Actions
  setPendingEmail: (email: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; newsletter?: boolean }) => Promise<boolean>;
  sendVerificationCode: (email: string) => Promise<{ success: boolean; demoCode?: string }>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'newsletter'>>) => Promise<boolean>;
  fetchCurrentUser: () => Promise<User | null>;
  getUserOrders: () => Promise<Order[]>;
  isAdmin: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingEmail: null,
      demoCode: null,
      error: null,

      setPendingEmail: (email) => set({ pendingEmail: email, error: null }),

      // Login with email/password
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.login(email, password);
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            isAdmin: result.user.isAdmin,
            createdAt: new Date().toISOString(),
          };
          set({
            user,
            isAuthenticated: true,
            pendingEmail: null,
            demoCode: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Email ou mot de passe incorrect';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      // Register new account
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(data);
          set({
            pendingEmail: data.email,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      // Send OTP code
      sendVerificationCode: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.sendCode(email);
          set({
            pendingEmail: email,
            demoCode: result.demo_code || null,
            isLoading: false
          });
          return { success: true, demoCode: result.demo_code };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du code';
          set({ error: message, isLoading: false });
          return { success: false };
        }
      },

      // Verify OTP code (for passwordless login)
      verifyCode: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.verifyCode(email, code);
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            isAdmin: result.user.isAdmin,
            createdAt: new Date().toISOString(),
          };
          set({
            user,
            isAuthenticated: true,
            pendingEmail: null,
            demoCode: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Code invalide';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      // Verify email after registration
      verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.verifyEmail(email, code);
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            isAdmin: result.user.isAdmin,
            createdAt: new Date().toISOString(),
          };
          set({
            user,
            isAuthenticated: true,
            pendingEmail: null,
            demoCode: null,
            isLoading: false,
          });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Code invalide';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch {
          // Ignore logout errors - clear state anyway
        }
        set({
          user: null,
          isAuthenticated: false,
          pendingEmail: null,
          demoCode: null,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await usersApi.updateMe(data);
          set((state) => ({
            user: state.user ? {
              ...state.user,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              phone: updatedUser.phone,
              newsletter: updatedUser.newsletter,
            } : null,
            isLoading: false,
          }));
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const userData = await usersApi.getMe();
          const user: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            isAdmin: userData.isAdmin,
            newsletter: userData.newsletter,
            createdAt: userData.createdAt,
          };
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch {
          // User not authenticated
          set({ user: null, isAuthenticated: false, isLoading: false });
          return null;
        }
      },

      getUserOrders: async () => {
        try {
          const result = await ordersApi.list();
          return result.orders.map((order: ApiOrder) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerEmail: order.customerEmail,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            status: order.status,
            paymentStatus: order.paymentStatus,
            deliveryMethod: order.deliveryMethod,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            discount: order.discount,
            total: order.total,
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
              id: item.id,
              productName: item.productName,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          }));
        } catch {
          return [];
        }
      },

      isAdmin: () => {
        return get().user?.isAdmin || false;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'temporal-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
