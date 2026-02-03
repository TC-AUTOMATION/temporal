/**
 * API Client for Temporal E-commerce
 * Centralized API calls with error handling
 */

const API_BASE = '/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error || 'Une erreur est survenue',
      response.status,
      data.errors
    );
  }

  return data.data as T;
}

// ==================== AUTH ====================

export const auth = {
  // Login with email/password
  login: async (email: string, password: string) => {
    return request<{
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register new account
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    newsletter?: boolean;
  }) => {
    return request<{
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Send OTP code (for password recovery or passwordless login)
  sendCode: async (email: string) => {
    return request<{ message: string; demo_code?: string }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify OTP code (creates session)
  verifyCode: async (email: string, code: string) => {
    return request<{
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
      };
    }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Verify email after registration
  verifyEmail: async (email: string, code: string) => {
    return request<{
      message: string;
      user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        isAdmin: boolean;
      };
    }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  logout: async () => {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },
};

// ==================== USERS ====================

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isAdmin: boolean;
  isActive: boolean;
  newsletter: boolean;
  createdAt: string;
  addresses?: Address[];
  _count?: { orders: number };
}

export interface Address {
  id: string;
  label: string | null;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export const users = {
  getMe: async () => {
    return request<User>('/users/me');
  },

  updateMe: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'newsletter'>>) => {
    return request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMe: async () => {
    return request<{ message: string }>('/users/me', {
      method: 'DELETE',
    });
  },

  getAddresses: async () => {
    return request<Address[]>('/users/me/addresses');
  },

  addAddress: async (address: Omit<Address, 'id'>) => {
    return request<Address>('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },
};

// ==================== PRODUCTS ====================

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  modelInfo: string | null;
  price: number;
  originalPrice: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string | null;
  size: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export const products = {
  list: async (params?: {
    category?: string;
    featured?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return request<{
      products: Product[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    }>(`/products${query ? `?${query}` : ''}`);
  },

  get: async (id: string) => {
    return request<Product>(`/products/${id}`);
  },

  create: async (product: Partial<Product>) => {
    return request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<Product>) => {
    return request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string) => {
    return request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

export const categories = {
  list: async () => {
    return request<Category[]>('/categories');
  },

  create: async (category: Partial<Category>) => {
    return request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },
};

// ==================== ORDERS ====================

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone: string | null;
  customerFirstName: string;
  customerLastName: string;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  deliveryMethod: 'DELIVERY' | 'HAND_DELIVERY';
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  items: OrderItem[];
  promoCode?: { code: string; type: string; value: number } | null;
  user?: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: { id: string; name: string; images: string[] };
}

export const orders = {
  list: async (params?: { status?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return request<{
      orders: Order[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    }>(`/orders${query ? `?${query}` : ''}`);
  },

  get: async (id: string) => {
    return request<Order>(`/orders/${id}`);
  },

  updateStatus: async (
    id: string,
    data: { status: Order['status']; trackingNumber?: string; trackingUrl?: string; adminNotes?: string }
  ) => {
    return request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancel: async (id: string) => {
    return request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== PROMO CODES ====================

export interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  maxUsesPerUser: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { orders: number };
}

export const promo = {
  list: async () => {
    return request<PromoCode[]>('/promo');
  },

  create: async (data: Partial<PromoCode>) => {
    return request<PromoCode>('/promo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  validate: async (code: string, cartTotal: number) => {
    return request<{
      valid: boolean;
      code: string;
      type: string;
      discount: number;
      discountLabel: string;
      newTotal: number;
    }>('/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal }),
    });
  },
};

// ==================== STRIPE ====================

export interface CheckoutData {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  deliveryMethod: 'DELIVERY' | 'RELAY' | 'HAND_DELIVERY';
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  // Home delivery address
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  // Relay point info
  relayPointId?: string;
  relayPointName?: string;
  relayPointAddress?: string;
  relayPointCity?: string;
  relayPointPostalCode?: string;
  relayCarrier?: string;
  // Other
  promoCode?: string;
  notes?: string;
}

export const stripe = {
  createCheckout: async (data: CheckoutData) => {
    return request<{
      sessionId: string;
      sessionUrl: string;
      orderNumber: string;
    }>('/stripe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ==================== ADMIN NOTIFICATIONS ====================

export interface AdminNotification {
  id: string;
  type: 'NEW_ORDER' | 'HAND_DELIVERY_REQUEST' | 'LOW_STOCK' | 'NEW_USER' | 'ORDER_CANCELLED' | 'PAYMENT_FAILED';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export const notifications = {
  list: async (params?: { unread?: boolean; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.unread) searchParams.set('unread', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return request<{
      notifications: AdminNotification[];
      unreadCount: number;
    }>(`/admin/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: async (ids?: string[]) => {
    return request<{ message: string }>('/admin/notifications', {
      method: 'PUT',
      body: JSON.stringify(ids ? { ids } : { markAllRead: true }),
    });
  },

  deleteOld: async (days: number = 30) => {
    return request<{ deleted: number }>(`/admin/notifications?days=${days}`, {
      method: 'DELETE',
    });
  },
};

// Export error class for handling
export { ApiError };
