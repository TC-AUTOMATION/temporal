import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  products as productsApi,
  orders as ordersApi,
  promo as promoApi,
  categories as categoriesApi,
  type Product as ApiProduct,
  type Order as ApiOrder,
  type PromoCode as ApiPromoCode,
  type Category as ApiCategory,
} from '@/lib/api/client';

// Types
export interface ProductSize {
  name: string;
  stock: number;
  available: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  description: string;
  descriptionFr?: string;
  descriptionEn?: string;
  materials?: string;
  materialsFr?: string;
  materialsEn?: string;
  careInstructions?: string;
  careInstructionsFr?: string;
  careInstructionsEn?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryFr?: string;
  categoryEn?: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  images: string[];
  modelImages: string[];
  modelInfo?: string;
  modelInfoFr?: string;
  modelInfoEn?: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew?: boolean;
  createdAt: string;
  updatedAt: string;
  totalStock: number;
  sku: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promoCode?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryMethod: 'delivery' | 'handDelivery';
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  activePromoCodes: number;
}

export interface Contest {
  id: string;
  number: string;
  prizeName: string;
  prizeNameEn: string;
  prizeValue: number;
  purchaseAmount: number;
  description: string;
  descriptionEn: string;
  prizeImage: string;
  isActive: boolean;
}

export interface MarqueeItem {
  id: string;
  textFr: string;
  textEn: string;
  isActive: boolean;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: { id: string; content: string; isAdmin: boolean; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PackProduct {
  productId: string;
  quantity: number;
}

export interface Pack {
  id: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  products: PackProduct[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  isActive: boolean;
  createdAt: string;
}

interface AdminState {
  // Loading states
  isLoading: boolean;
  error: string | null;

  // Countdown
  countdownDate: string;
  setCountdownDate: (date: string) => void;

  // Contests
  contests: Contest[];
  updateContest: (id: string, updates: Partial<Contest>) => void;

  // Marquee
  marqueeItems: MarqueeItem[];
  addMarqueeItem: (item: Omit<MarqueeItem, 'id'>) => void;
  updateMarqueeItem: (id: string, updates: Partial<MarqueeItem>) => void;
  deleteMarqueeItem: (id: string) => void;

  // Products
  products: AdminProduct[];
  fetchProducts: () => Promise<void>;
  addProduct: (product: Partial<AdminProduct>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Orders
  orders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status'], trackingNumber?: string, trackingUrl?: string) => Promise<void>;

  // Promo Codes
  promoCodes: PromoCode[];
  fetchPromoCodes: () => Promise<void>;
  addPromoCode: (promo: Partial<PromoCode>) => Promise<void>;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;

  // Dashboard
  getDashboardStats: () => DashboardStats;

  // Categories
  categories: { id: string; name: string; slug: string }[];
  fetchCategories: () => Promise<void>;

  // Tickets
  tickets: Ticket[];
  fetchTickets: () => Promise<void>;
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicketStatus: (id: string, status: Ticket['status']) => Promise<void>;
  addTicketReply: (ticketId: string, content: string, isAdmin: boolean) => Promise<void>;

  // Packs
  packs: Pack[];
  addPack: (pack: Omit<Pack, 'id' | 'createdAt'>) => void;
  updatePack: (id: string, updates: Partial<Pack>) => void;
  deletePack: (id: string) => void;

  // Utility
  clearError: () => void;
}

// Helper to convert API product to admin product format
function apiProductToAdmin(p: ApiProduct): AdminProduct {
  const sizeMap = new Map<string, ProductSize>();
  const colorMap = new Map<string, ProductColor>();

  for (const v of p.variants) {
    // Aggregate sizes
    const existingSize = sizeMap.get(v.size);
    if (existingSize) {
      existingSize.stock += v.stock;
      existingSize.available = existingSize.stock > 0;
    } else {
      sizeMap.set(v.size, { name: v.size, stock: v.stock, available: v.stock > 0 });
    }

    // Aggregate colors
    if (!colorMap.has(v.color)) {
      colorMap.set(v.color, { name: v.color, hex: v.colorHex || '#000000', available: v.stock > 0 });
    }
  }

  return {
    id: p.id,
    name: p.name,
    nameEn: (p as any).nameEn || undefined,
    description: p.description || '',
    descriptionEn: (p as any).descriptionEn || undefined,
    materials: (p as any).materials || undefined,
    materialsEn: (p as any).materialsEn || undefined,
    careInstructions: (p as any).careInstructions || undefined,
    careInstructionsEn: (p as any).careInstructionsEn || undefined,
    price: p.price,
    originalPrice: p.originalPrice || undefined,
    category: p.category.slug,
    sizes: Array.from(sizeMap.values()),
    colors: Array.from(colorMap.values()),
    images: p.images,
    modelImages: [],
    modelInfo: p.modelInfo || undefined,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isNew: (p as any).isNew,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    sku: p.sku,
  };
}

// Helper to convert API order to admin order format
function apiOrderToAdmin(o: ApiOrder): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customer: {
      firstName: o.customerFirstName,
      lastName: o.customerLastName,
      email: o.customerEmail,
      phone: o.customerPhone || undefined,
      address: o.shippingStreet || undefined,
      city: o.shippingCity || undefined,
      postalCode: o.shippingPostalCode || undefined,
      country: o.shippingCountry || 'France',
    },
    items: o.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      size: item.size || '',
      color: item.color || '',
      quantity: item.quantity,
      price: item.unitPrice,
      image: item.product?.images?.[0],
    })),
    subtotal: o.subtotal,
    shipping: o.shippingCost,
    discount: o.discount,
    total: o.total,
    promoCode: o.promoCode?.code,
    status: o.status.toLowerCase() as Order['status'],
    paymentStatus: o.paymentStatus.toLowerCase() as Order['paymentStatus'],
    deliveryMethod: o.deliveryMethod === 'HAND_DELIVERY' ? 'handDelivery' : 'delivery',
    trackingNumber: o.trackingNumber || undefined,
    trackingUrl: o.trackingUrl || undefined,
    notes: o.customerNotes || undefined,
    createdAt: o.createdAt,
    updatedAt: o.createdAt,
  };
}

// Helper to convert API promo to admin promo format
function apiPromoToAdmin(p: ApiPromoCode): PromoCode {
  return {
    id: p.id,
    code: p.code,
    type: p.type.toLowerCase() as PromoCode['type'],
    value: p.value,
    minPurchase: p.minPurchase || undefined,
    maxDiscount: p.maxDiscount || undefined,
    maxUses: p.maxUses || undefined,
    usedCount: p.usedCount,
    validFrom: p.validFrom,
    validUntil: p.validUntil || undefined,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,

      // Countdown - default to 7 days from now
      countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      setCountdownDate: (date) => set({ countdownDate: date }),

      // Contests - default values
      contests: [
        {
          id: '1',
          number: '01',
          prizeName: 'BONNET TEMPORAL',
          prizeNameEn: 'TEMPORAL BEANIE',
          prizeValue: 39,
          purchaseAmount: 150,
          description: 'Chaque commande de 150€ ou plus te donne automatiquement une participation au tirage au sort.',
          descriptionEn: 'Every order of 150€ or more automatically gives you one entry into the draw.',
          prizeImage: '/clothes/bonnet-face-noir.png',
          isActive: true,
        },
        {
          id: '2',
          number: '02',
          prizeName: 'VESTE TEMPORAL',
          prizeNameEn: 'TEMPORAL JACKET',
          prizeValue: 189,
          purchaseAmount: 200,
          description: 'Chaque commande de 200€ ou plus te donne automatiquement une participation au tirage au sort.',
          descriptionEn: 'Every order of 200€ or more automatically gives you one entry into the draw.',
          prizeImage: '/clothes/veste-face-noire.png',
          isActive: true,
        },
      ],
      updateContest: (id, updates) =>
        set((state) => ({
          contests: state.contests.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      // Marquee items - default values
      marqueeItems: [
        {
          id: '1',
          textFr: 'TENTER DE GAGNER LA PIÈCE UNIQUE',
          textEn: 'TRY TO WIN THE UNIQUE PIECE',
          isActive: true,
        },
        {
          id: '2',
          textFr: 'VIVEZ L\'EXPÉRIENCE TEMPORAL',
          textEn: 'LIVE THE TEMPORAL EXPERIENCE',
          isActive: true,
        },
      ],
      addMarqueeItem: (item) =>
        set((state) => ({
          marqueeItems: [...state.marqueeItems, { ...item, id: generateId() }],
        })),
      updateMarqueeItem: (id, updates) =>
        set((state) => ({
          marqueeItems: state.marqueeItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMarqueeItem: (id) =>
        set((state) => ({
          marqueeItems: state.marqueeItems.filter((m) => m.id !== id),
        })),

      // Products
      products: [],

      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await productsApi.list({ limit: 100 });
          const adminProducts = result.products.map(apiProductToAdmin);
          set({ products: adminProducts, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des produits';
          set({ error: message, isLoading: false });
        }
      },

      addProduct: async (product) => {
        set({ isLoading: true, error: null });
        try {
          const newProduct = await productsApi.create(product as Partial<ApiProduct>);
          const adminProduct = apiProductToAdmin(newProduct);
          set((state) => ({
            products: [...state.products, adminProduct],
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du produit';
          set({ error: message, isLoading: false });
        }
      },

      updateProduct: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProduct = await productsApi.update(id, updates as Partial<ApiProduct>);
          const adminProduct = apiProductToAdmin(updatedProduct);
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? adminProduct : p)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du produit';
          set({ error: message, isLoading: false });
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await productsApi.delete(id);
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression du produit';
          set({ error: message, isLoading: false });
        }
      },

      // Orders
      orders: [],

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await ordersApi.list({ limit: 100 });
          const adminOrders = result.orders.map(apiOrderToAdmin);
          set({ orders: adminOrders, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des commandes';
          set({ error: message, isLoading: false });
        }
      },

      updateOrderStatus: async (id, status, trackingNumber, trackingUrl) => {
        set({ isLoading: true, error: null });
        try {
          const statusMap: Record<string, ApiOrder['status']> = {
            pending: 'PENDING',
            confirmed: 'CONFIRMED',
            preparing: 'PREPARING',
            shipped: 'SHIPPED',
            delivered: 'DELIVERED',
            cancelled: 'CANCELLED',
            refunded: 'REFUNDED',
          };
          await ordersApi.updateStatus(id, {
            status: statusMap[status],
            trackingNumber,
            trackingUrl,
          });
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === id ? { ...o, status, trackingNumber, trackingUrl, updatedAt: new Date().toISOString() } : o
            ),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la commande';
          set({ error: message, isLoading: false });
        }
      },

      // Promo Codes
      promoCodes: [],

      fetchPromoCodes: async () => {
        set({ isLoading: true, error: null });
        try {
          const promos = await promoApi.list();
          const adminPromos = promos.map(apiPromoToAdmin);
          set({ promoCodes: adminPromos, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des codes promo';
          set({ error: message, isLoading: false });
        }
      },

      addPromoCode: async (promo) => {
        set({ isLoading: true, error: null });
        try {
          const typeMap: Record<string, 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'> = {
            percentage: 'PERCENTAGE',
            fixed: 'FIXED',
            free_shipping: 'FREE_SHIPPING',
          };
          const newPromo = await promoApi.create({
            ...promo,
            type: typeMap[promo.type || 'percentage'],
          } as Partial<ApiPromoCode>);
          const adminPromo = apiPromoToAdmin(newPromo);
          set((state) => ({
            promoCodes: [...state.promoCodes, adminPromo],
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du code promo';
          set({ error: message, isLoading: false });
        }
      },

      updatePromoCode: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const typeMap: Record<string, 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'> = {
            percentage: 'PERCENTAGE',
            fixed: 'FIXED',
            free_shipping: 'FREE_SHIPPING',
          };

          const updateData: Record<string, unknown> = { ...updates };
          if (updates.type) {
            updateData.type = typeMap[updates.type];
          }

          const response = await fetch(`/api/promo/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la mise à jour du code promo');
          }

          const result = await response.json();
          const updatedPromo = apiPromoToAdmin(result.data);

          set((state) => ({
            promoCodes: state.promoCodes.map((p) => (p.id === id ? updatedPromo : p)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du code promo';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deletePromoCode: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/promo/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la suppression du code promo');
          }

          const result = await response.json();

          // If it was deactivated instead of deleted, update the promo code
          if (result.data._deactivated) {
            set((state) => ({
              promoCodes: state.promoCodes.map((p) => (p.id === id ? { ...p, isActive: false } : p)),
              isLoading: false,
            }));
          } else {
            // Otherwise, remove it from the list
            set((state) => ({
              promoCodes: state.promoCodes.filter((p) => p.id !== id),
              isLoading: false,
            }));
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression du code promo';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      // Dashboard Stats
      getDashboardStats: () => {
        const state = get();
        const paidOrders = state.orders.filter((o) => o.paymentStatus === 'paid');
        const pendingOrders = state.orders.filter((o) => o.status === 'pending');
        const lowStockProducts = state.products.filter((p) => p.totalStock < 10);
        const activePromos = state.promoCodes.filter((p) => p.isActive);

        return {
          totalRevenue: paidOrders.reduce((sum, o) => sum + o.total, 0),
          totalOrders: state.orders.length,
          pendingOrders: pendingOrders.length,
          totalProducts: state.products.length,
          lowStockProducts: lowStockProducts.length,
          activePromoCodes: activePromos.length,
        };
      },

      // Categories
      categories: [],

      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const cats = await categoriesApi.list();
          set({
            categories: cats.map((c: ApiCategory) => ({ id: c.id, name: c.name, slug: c.slug })),
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des catégories';
          set({ error: message, isLoading: false });
        }
      },

      // Tickets
      tickets: [],

      fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/tickets');
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des tickets');
          }
          const result = await response.json();

          // Transform API tickets to admin format
          const tickets = result.data.map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticketNumber,
            customerName: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email,
            customerEmail: t.user.email,
            subject: t.subject,
            status: t.status.toLowerCase() as Ticket['status'],
            priority: t.priority.toLowerCase() as Ticket['priority'],
            messages: [
              {
                id: t.id,
                content: t.message,
                isAdmin: false,
                createdAt: t.createdAt,
              },
              ...t.replies.map((r: any) => ({
                id: r.id,
                content: r.message,
                isAdmin: r.isAdmin,
                createdAt: r.createdAt,
              })),
            ],
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }));

          set({ tickets, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des tickets';
          set({ error: message, isLoading: false });
        }
      },

      addTicket: async (ticket) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: ticket.subject,
              message: ticket.messages[0]?.content || '',
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la création du ticket');
          }

          const result = await response.json();
          const t = result.data;

          const newTicket: Ticket = {
            id: t.id,
            ticketNumber: t.ticketNumber,
            customerName: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email,
            customerEmail: t.user.email,
            subject: t.subject,
            status: t.status.toLowerCase() as Ticket['status'],
            priority: t.priority.toLowerCase() as Ticket['priority'],
            messages: [
              {
                id: t.id,
                content: t.message,
                isAdmin: false,
                createdAt: t.createdAt,
              },
            ],
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          };

          set((state) => ({
            tickets: [newTicket, ...state.tickets],
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du ticket';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateTicketStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const statusMap: Record<string, string> = {
            open: 'OPEN',
            in_progress: 'IN_PROGRESS',
            resolved: 'RESOLVED',
            closed: 'CLOSED',
          };

          const response = await fetch(`/api/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: statusMap[status] }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la mise à jour du ticket');
          }

          const result = await response.json();
          const t = result.data;

          const updatedTicket: Ticket = {
            id: t.id,
            ticketNumber: t.ticketNumber,
            customerName: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email,
            customerEmail: t.user.email,
            subject: t.subject,
            status: t.status.toLowerCase() as Ticket['status'],
            priority: t.priority.toLowerCase() as Ticket['priority'],
            messages: [
              {
                id: t.id,
                content: t.message,
                isAdmin: false,
                createdAt: t.createdAt,
              },
              ...t.replies.map((r: any) => ({
                id: r.id,
                content: r.message,
                isAdmin: r.isAdmin,
                createdAt: r.createdAt,
              })),
            ],
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          };

          set((state) => ({
            tickets: state.tickets.map((ticket) => (ticket.id === id ? updatedTicket : ticket)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du ticket';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      addTicketReply: async (ticketId, content, isAdmin) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de l\'ajout de la réponse');
          }

          const result = await response.json();
          const t = result.data;

          const updatedTicket: Ticket = {
            id: t.id,
            ticketNumber: t.ticketNumber,
            customerName: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email,
            customerEmail: t.user.email,
            subject: t.subject,
            status: t.status.toLowerCase() as Ticket['status'],
            priority: t.priority.toLowerCase() as Ticket['priority'],
            messages: [
              {
                id: t.id,
                content: t.message,
                isAdmin: false,
                createdAt: t.createdAt,
              },
              ...t.replies.map((r: any) => ({
                id: r.id,
                content: r.message,
                isAdmin: r.isAdmin,
                createdAt: r.createdAt,
              })),
            ],
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          };

          set((state) => ({
            tickets: state.tickets.map((ticket) => (ticket.id === ticketId ? updatedTicket : ticket)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de l\'ajout de la réponse';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      // Packs
      packs: [],
      addPack: (pack) =>
        set((state) => ({
          packs: [
            ...state.packs,
            { ...pack, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),
      updatePack: (id, updates) =>
        set((state) => ({
          packs: state.packs.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePack: (id) =>
        set((state) => ({
          packs: state.packs.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'temporal-admin-store',
      partialize: (state) => ({
        countdownDate: state.countdownDate,
        contests: state.contests,
        marqueeItems: state.marqueeItems,
        packs: state.packs,
      }),
    }
  )
);
