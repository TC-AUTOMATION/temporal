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
  sizeGuideId?: string | null;
  careGuideId?: string | null;
  sizeGuideName?: string;
  careGuideName?: string;
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

export interface ShipmentInfo {
  id: string;
  boxtalReference?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  status: 'pending' | 'created' | 'shipped' | 'delivered';
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  createdAt?: string;
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
  deliveryMethod: 'delivery' | 'relay' | 'handDelivery';
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  // Relay point info
  relayCarrier?: string;
  relayPointCode?: string;
  relayPointName?: string;
  relayPointAddress?: string;
  // Shipment info
  shipment?: ShipmentInfo;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'per_tranche';
  value: number;
  trancheSize?: number;
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
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
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

  // Site mode: 'password' = landing page with password, 'countdown' = shop with countdown overlay
  siteMode: 'password' | 'countdown';
  setSiteMode: (mode: 'password' | 'countdown') => void;

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

  // Shipping / Delivery
  createShipment: (orderId: string, parcel?: { weight?: number; length?: number; width?: number; height?: number }) => Promise<{ success: boolean; trackingNumber?: string; labelUrl?: string; error?: string }>;
  getShipmentLabel: (orderId: string) => Promise<{ labelUrl?: string; error?: string }>;
  getOrderTracking: (orderId: string) => Promise<{ trackingNumber?: string; trackingUrl?: string; carrier?: string; status?: string; error?: string }>;

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
  fetchPacks: () => Promise<void>;
  addPack: (pack: Omit<Pack, 'id' | 'createdAt'>) => Promise<void>;
  updatePack: (id: string, updates: Partial<Pack>) => Promise<void>;
  deletePack: (id: string) => Promise<void>;

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
    price: Number(p.price),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
    category: p.category.slug,
    sizes: Array.from(sizeMap.values()),
    colors: Array.from(colorMap.values()),
    images: p.images,
    modelImages: [],
    modelInfo: p.modelInfo || undefined,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isNew: (p as any).isNew,
    sizeGuideId: (p as any).sizeGuideId || null,
    careGuideId: (p as any).careGuideId || null,
    sizeGuideName: (p as any).sizeGuide ? ((p as any).sizeGuide.nameFr || (p as any).sizeGuide.nameEn) : undefined,
    careGuideName: (p as any).careGuide ? ((p as any).careGuide.nameFr || (p as any).careGuide.nameEn) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    sku: p.sku,
  };
}

// Helper to convert API order to admin order format
function apiOrderToAdmin(o: ApiOrder): Order {
  const deliveryMethodMap: Record<string, Order['deliveryMethod']> = {
    'HAND_DELIVERY': 'handDelivery',
    'RELAY': 'relay',
    'DELIVERY': 'delivery',
  };

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
      price: Number(item.unitPrice),
      image: item.product?.images?.[0],
    })),
    subtotal: Number(o.subtotal),
    shipping: Number(o.shippingCost),
    discount: Number(o.discount),
    total: Number(o.total),
    promoCode: o.promoCode?.code,
    status: o.status.toLowerCase() as Order['status'],
    paymentStatus: o.paymentStatus.toLowerCase() as Order['paymentStatus'],
    deliveryMethod: deliveryMethodMap[o.deliveryMethod] || 'delivery',
    trackingNumber: o.trackingNumber || undefined,
    trackingUrl: o.trackingUrl || undefined,
    notes: o.customerNotes || undefined,
    relayCarrier: (o as any).relayCarrier || undefined,
    relayPointCode: (o as any).relayPointCode || undefined,
    relayPointName: (o as any).relayPointName || undefined,
    relayPointAddress: (o as any).relayPointAddress || undefined,
    shipment: (o as any).shipment ? {
      id: (o as any).shipment.id,
      boxtalReference: (o as any).shipment.boxtalReference,
      carrier: (o as any).shipment.carrier,
      trackingNumber: (o as any).shipment.trackingNumber,
      trackingUrl: (o as any).shipment.trackingUrl,
      labelUrl: (o as any).shipment.labelUrl,
      status: (o as any).shipment.status,
      weight: (o as any).shipment.weight ? Number((o as any).shipment.weight) : undefined,
      dimensions: (o as any).shipment.dimensions,
      createdAt: (o as any).shipment.createdAt,
    } : undefined,
    shippedAt: (o as any).shippedAt || undefined,
    deliveredAt: (o as any).deliveredAt || undefined,
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
    value: Number(p.value),
    trancheSize: p.trancheSize ? Number(p.trancheSize) : undefined,
    minPurchase: p.minPurchase ? Number(p.minPurchase) : undefined,
    maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : undefined,
    maxUses: p.maxUses || undefined,
    usedCount: p.usedCount,
    validFrom: p.validFrom,
    validUntil: p.validUntil || undefined,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to convert admin form data (sizes/colors) to API format (variants + categoryId)
function adminToApiData(
  formData: Partial<AdminProduct>,
  categories: { id: string; name: string; slug: string }[]
): Record<string, unknown> {
  const apiData: Record<string, unknown> = {};

  if (formData.sku) apiData.sku = formData.sku;
  if (formData.name) {
    apiData.name = formData.name;
    // Generate slug from name
    apiData.slug = formData.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  if (formData.nameEn !== undefined) apiData.nameEn = formData.nameEn || undefined;
  if (formData.description !== undefined) apiData.description = formData.description || undefined;
  if ((formData as any).descriptionEn !== undefined) apiData.descriptionEn = (formData as any).descriptionEn || undefined;
  if ((formData as any).materials !== undefined) apiData.materials = (formData as any).materials || undefined;
  if ((formData as any).materialsEn !== undefined) apiData.materialsEn = (formData as any).materialsEn || undefined;
  if ((formData as any).careInstructions !== undefined) apiData.careInstructions = (formData as any).careInstructions || undefined;
  if ((formData as any).careInstructionsEn !== undefined) apiData.careInstructionsEn = (formData as any).careInstructionsEn || undefined;
  if (formData.modelInfo !== undefined) apiData.modelInfo = formData.modelInfo || undefined;
  if (formData.price !== undefined) apiData.price = Number(formData.price);
  if (formData.originalPrice) apiData.originalPrice = Number(formData.originalPrice);
  if (formData.images !== undefined) apiData.images = formData.images;
  if (formData.isActive !== undefined) apiData.isActive = formData.isActive;
  if (formData.isFeatured !== undefined) apiData.isFeatured = formData.isFeatured;
  if (formData.isNew !== undefined) apiData.isNew = formData.isNew;
  if (formData.sizeGuideId !== undefined) apiData.sizeGuideId = formData.sizeGuideId || null;
  if (formData.careGuideId !== undefined) apiData.careGuideId = formData.careGuideId || null;

  // Convert category slug → categoryId
  if (formData.category) {
    const cat = categories.find(c => c.slug === formData.category);
    if (cat) apiData.categoryId = cat.id;
  }

  // Convert sizes + colors → variants
  if (formData.sizes && formData.colors && formData.sizes.length > 0 && formData.colors.length > 0) {
    const sku = formData.sku || 'TPL';
    const colorCount = formData.colors.length;
    const variants: Record<string, unknown>[] = [];

    for (let ci = 0; ci < colorCount; ci++) {
      const color = formData.colors[ci];
      for (const size of formData.sizes) {
        // Distribute stock evenly across colors, remainder to first colors
        const baseStock = Math.floor(size.stock / colorCount);
        const extra = ci < (size.stock % colorCount) ? 1 : 0;
        variants.push({
          sku: `${sku}-${color.name}-${size.name}`.toUpperCase().replace(/\s+/g, '-'),
          color: color.name,
          colorHex: color.hex || null,
          size: size.name,
          stock: baseStock + extra,
          isActive: size.available !== false && color.available !== false,
        });
      }
    }
    apiData.variants = variants;
  }

  return apiData;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isLoading: false,
      error: null,

      // Site mode
      siteMode: 'password',
      setSiteMode: (mode) => {
        set({ siteMode: mode });
        // Persist to database so all visitors see the change
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'siteMode', value: mode, type: 'string' }),
        }).catch(() => {});
      },

      // Countdown - default to 7 days from now
      countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      setCountdownDate: (date) => {
        set({ countdownDate: date });
        // Persist to database
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'countdownDate', value: date, type: 'string' }),
        }).catch(() => {});
      },

      // Contests - default values
      contests: [
        {
          id: '1',
          number: '01',
          prizeName: 'BONNET TEMPORAL',
          prizeNameEn: 'TEMPORAL BEANIE',
          prizeValue: 39,
          purchaseAmount: 70,
          description: 'Chaque commande entre 70€ et 149€ te donne automatiquement une participation au tirage au sort du bonnet.',
          descriptionEn: 'Every order between 70€ and 149€ automatically gives you one entry into the beanie draw.',
          prizeImage: '/clothes/bonnet-face-noir.webp',
          isActive: true,
        },
        {
          id: '2',
          number: '02',
          prizeName: 'VESTE TEMPORAL',
          prizeNameEn: 'TEMPORAL JACKET',
          prizeValue: 189,
          purchaseAmount: 150,
          description: 'Chaque commande de 150€ ou plus te donne automatiquement une participation au tirage au sort de la veste.',
          descriptionEn: 'Every order of 150€ or more automatically gives you one entry into the jacket draw.',
          prizeImage: '/clothes/veste-face-noire.webp',
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
          const apiData = adminToApiData(product as Partial<AdminProduct>, get().categories);
          const newProduct = await productsApi.create(apiData);
          const adminProduct = apiProductToAdmin(newProduct);
          set((state) => ({
            products: [...state.products, adminProduct],
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du produit';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updateProduct: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const apiData = adminToApiData(updates as Partial<AdminProduct>, get().categories);
          const updatedProduct = await productsApi.update(id, apiData);
          const adminProduct = apiProductToAdmin(updatedProduct);
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? adminProduct : p)),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du produit';
          set({ error: message, isLoading: false });
          throw error;
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

      // Shipping / Delivery
      createShipment: async (orderId, parcel) => {
        try {
          const res = await fetch(`/api/admin/orders/${orderId}/shipment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parcel || {}),
          });
          const data = await res.json();
          if (!data.success) {
            return { success: false, error: data.error || 'Erreur création envoi' };
          }
          // Update local order with shipment info
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? {
                ...o,
                trackingNumber: data.data.trackingNumber,
                shipment: data.data.shipment,
              } : o
            ),
          }));
          return { success: true, trackingNumber: data.data.trackingNumber, labelUrl: data.data.labelUrl };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : 'Erreur réseau' };
        }
      },

      getShipmentLabel: async (orderId) => {
        try {
          const res = await fetch(`/api/admin/orders/${orderId}/label`);
          const data = await res.json();
          if (!data.success) return { error: data.error || 'Aucune étiquette trouvée' };
          return { labelUrl: data.data.labelUrl };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Erreur réseau' };
        }
      },

      getOrderTracking: async (orderId) => {
        try {
          const res = await fetch(`/api/admin/orders/${orderId}/tracking`);
          const data = await res.json();
          if (!data.success) return { error: data.error || 'Aucun suivi trouvé' };
          return {
            trackingNumber: data.data.trackingNumber,
            trackingUrl: data.data.trackingUrl,
            carrier: data.data.carrier,
            status: data.data.status,
          };
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Erreur réseau' };
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
          const typeMap: Record<string, 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'PER_TRANCHE'> = {
            percentage: 'PERCENTAGE',
            fixed: 'FIXED',
            free_shipping: 'FREE_SHIPPING',
            per_tranche: 'PER_TRANCHE',
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
          const typeMap: Record<string, 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'PER_TRANCHE'> = {
            percentage: 'PERCENTAGE',
            fixed: 'FIXED',
            free_shipping: 'FREE_SHIPPING',
            per_tranche: 'PER_TRANCHE',
          };

          const updateData: Record<string, unknown> = { ...updates };
          if (updates.type) {
            updateData.type = typeMap[updates.type];
          }

          const updatedPromoApi = await promoApi.update(id, updateData as Partial<ApiPromoCode>);
          const updatedPromo = apiPromoToAdmin(updatedPromoApi);

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
          const result = await promoApi.delete(id);

          // If it was deactivated instead of deleted, update the promo code
          if (result._deactivated) {
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
            customerName: t.user ? (`${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email) : (t.guestName || t.guestEmail || 'Invité'),
            customerEmail: t.user?.email || t.guestEmail || '',
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
            waiting_customer: 'WAITING_CUSTOMER',
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

      fetchPacks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/packs');
          if (!response.ok) throw new Error('Erreur lors du chargement des packs');
          const result = await response.json();
          const packs = (result.data?.packs || []).map((p: any) => ({
            id: p.id,
            nameFr: p.name,
            nameEn: p.name,
            descriptionFr: p.description || '',
            descriptionEn: p.description || '',
            products: p.items?.map((item: any) => ({ productId: item.productId, quantity: item.quantity })) || [],
            discountType: 'fixed' as const,
            discountValue: p.discount || 0,
            isActive: p.isActive,
            createdAt: p.createdAt,
          }));
          set({ packs, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors du chargement des packs';
          set({ error: message, isLoading: false });
        }
      },

      addPack: async (pack) => {
        set({ isLoading: true, error: null });
        try {
          const slug = pack.nameFr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const response = await fetch('/api/admin/packs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: pack.nameFr,
              slug,
              description: pack.descriptionFr,
              price: pack.discountValue || 0,
              isActive: pack.isActive,
              items: pack.products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
            }),
          });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erreur lors de la création du pack');
          }
          // Refresh packs from API
          await get().fetchPacks();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la création du pack';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      updatePack: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const body: Record<string, unknown> = {};
          if (updates.nameFr !== undefined) body.name = updates.nameFr;
          if (updates.descriptionFr !== undefined) body.description = updates.descriptionFr;
          if (updates.isActive !== undefined) body.isActive = updates.isActive;
          if (updates.products) body.items = updates.products.map((p) => ({ productId: p.productId, quantity: p.quantity }));

          const response = await fetch(`/api/admin/packs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erreur lors de la mise à jour du pack');
          }
          await get().fetchPacks();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du pack';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      deletePack: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/admin/packs/${id}`, { method: 'DELETE' });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Erreur lors de la suppression du pack');
          }
          set((state) => ({
            packs: state.packs.filter((p) => p.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression du pack';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'temporal-admin-store',
      partialize: (state) => ({
        siteMode: state.siteMode,
        countdownDate: state.countdownDate,
        contests: state.contests,
        marqueeItems: state.marqueeItems,
      }),
    }
  )
);
