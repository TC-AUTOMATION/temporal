import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  images: string[];
  modelImages: string[];
  modelInfo?: string;
  isActive: boolean;
  isFeatured: boolean;
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
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableProducts?: string[]; // Product IDs, empty = all products
  applicableCategories?: string[];
  createdAt: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  products: { productId: string; quantity: number }[];
  originalPrice: number;
  packPrice: number;
  discount: number;
  images: string[];
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  activePromoCodes: number;
}

export interface TicketMessage {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  // Countdown
  countdownDate: string;
  setCountdownDate: (date: string) => void;

  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt' | 'totalStock'>) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, size: string, quantity: number) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, status: Order['paymentStatus']) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;

  // Promo Codes
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string, cartTotal: number) => { valid: boolean; discount: number; message: string };

  // Packs
  packs: Pack[];
  addPack: (pack: Omit<Pack, 'id' | 'createdAt' | 'updatedAt' | 'originalPrice' | 'discount'>) => void;
  updatePack: (id: string, updates: Partial<Pack>) => void;
  deletePack: (id: string) => void;

  // Dashboard
  getDashboardStats: () => DashboardStats;

  // Categories
  categories: string[];
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;

  // Tickets
  tickets: Ticket[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (id: string, status: Ticket['status']) => void;
  addTicketMessage: (ticketId: string, content: string, isAdmin: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateOrderNumber = () => `TP-${Date.now().toString(36).toUpperCase()}`;
const generateTicketNumber = () => `TK-${Date.now().toString(36).toUpperCase()}`;

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Countdown - default to 7 days from now
      countdownDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      setCountdownDate: (date) => set({ countdownDate: date }),

      // Initial Products from existing data
      products: [
        {
          id: '1',
          name: 'Hoodie Temporal Classic',
          description: 'Hoodie oversize premium avec logo brodé Temporal. Coupe moderne et confortable.',
          price: 89,
          originalPrice: 110,
          category: 'vestes',
          sizes: [
            { name: 'S', stock: 5, available: true },
            { name: 'M', stock: 12, available: true },
            { name: 'L', stock: 8, available: true },
            { name: 'XL', stock: 3, available: true },
          ],
          colors: [
            { name: 'Noir', hex: '#000000', available: true },
            { name: 'Blanc', hex: '#FFFFFF', available: true },
          ],
          images: ['/clothes/hoodie-black.jpg'],
          modelImages: [],
          modelInfo: 'Modèle porte la taille L (174cm)',
          isActive: true,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalStock: 28,
          sku: 'TPL-HOD-001',
        },
        {
          id: '2',
          name: 'T-Shirt Temporal Logo',
          description: 'T-shirt oversize avec logo Temporal imprimé. 100% coton biologique.',
          price: 45,
          category: 'tshirts',
          sizes: [
            { name: 'S', stock: 15, available: true },
            { name: 'M', stock: 20, available: true },
            { name: 'L', stock: 18, available: true },
            { name: 'XL', stock: 10, available: true },
          ],
          colors: [
            { name: 'Noir', hex: '#000000', available: true },
            { name: 'Blanc', hex: '#FFFFFF', available: true },
            { name: 'Violet', hex: '#5B2D8E', available: true },
          ],
          images: ['/clothes/tshirt-black.jpg'],
          modelImages: [],
          isActive: true,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalStock: 63,
          sku: 'TPL-TSH-001',
        },
        {
          id: '3',
          name: 'Pantalon Cargo Temporal',
          description: 'Pantalon cargo avec poches multiples et logo brodé.',
          price: 95,
          category: 'pantalons',
          sizes: [
            { name: 'S', stock: 8, available: true },
            { name: 'M', stock: 12, available: true },
            { name: 'L', stock: 10, available: true },
            { name: 'XL', stock: 5, available: true },
          ],
          colors: [
            { name: 'Noir', hex: '#000000', available: true },
            { name: 'Beige', hex: '#D4C4B0', available: true },
          ],
          images: ['/clothes/cargo-black.jpg'],
          modelImages: [],
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalStock: 35,
          sku: 'TPL-PNT-001',
        },
        {
          id: '4',
          name: 'Casquette Temporal',
          description: 'Casquette brodée avec logo Temporal. Taille ajustable.',
          price: 35,
          category: 'accessoires',
          sizes: [
            { name: 'Unique', stock: 25, available: true },
          ],
          colors: [
            { name: 'Noir', hex: '#000000', available: true },
            { name: 'Blanc', hex: '#FFFFFF', available: true },
          ],
          images: ['/clothes/cap-black.jpg'],
          modelImages: [],
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalStock: 25,
          sku: 'TPL-CAP-001',
        },
      ],

      addProduct: (product) => set((state) => {
        const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
        const newProduct: AdminProduct = {
          ...product,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalStock,
        };
        return { products: [...state.products, newProduct] };
      }),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => {
          if (p.id === id) {
            const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
            if (updates.sizes) {
              updated.totalStock = updates.sizes.reduce((sum, s) => sum + s.stock, 0);
            }
            return updated;
          }
          return p;
        }),
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),

      updateStock: (productId, size, quantity) => set((state) => ({
        products: state.products.map((p) => {
          if (p.id === productId) {
            const newSizes = p.sizes.map((s) => {
              if (s.name === size) {
                const newStock = Math.max(0, s.stock + quantity);
                return { ...s, stock: newStock, available: newStock > 0 };
              }
              return s;
            });
            return {
              ...p,
              sizes: newSizes,
              totalStock: newSizes.reduce((sum, s) => sum + s.stock, 0),
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        }),
      })),

      // Orders
      orders: [
        {
          id: '1',
          orderNumber: 'TP-DEMO001',
          customer: {
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@email.com',
            phone: '0612345678',
            address: '123 Rue de la Mode',
            city: 'Paris',
            postalCode: '75001',
            country: 'France',
          },
          items: [
            { productId: '1', productName: 'Hoodie Temporal Classic', size: 'M', color: 'Noir', quantity: 1, price: 89 },
            { productId: '2', productName: 'T-Shirt Temporal Logo', size: 'L', color: 'Blanc', quantity: 2, price: 45 },
          ],
          subtotal: 179,
          shipping: 5.90,
          discount: 0,
          total: 184.90,
          status: 'confirmed',
          paymentStatus: 'paid',
          deliveryMethod: 'delivery',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          orderNumber: 'TP-DEMO002',
          customer: {
            firstName: 'Marie',
            lastName: 'Martin',
            email: 'marie.martin@email.com',
            country: 'France',
          },
          items: [
            { productId: '3', productName: 'Pantalon Cargo Temporal', size: 'S', color: 'Noir', quantity: 1, price: 95 },
          ],
          subtotal: 95,
          shipping: 0,
          discount: 10,
          total: 85,
          promoCode: 'WELCOME10',
          status: 'pending',
          paymentStatus: 'pending',
          deliveryMethod: 'handDelivery',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      addOrder: (order) => set((state) => ({
        orders: [...state.orders, {
          ...order,
          id: generateId(),
          orderNumber: generateOrderNumber(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),

      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
        ),
      })),

      updatePaymentStatus: (id, status) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, paymentStatus: status, updatedAt: new Date().toISOString() } : o
        ),
      })),

      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
        ),
      })),

      // Promo Codes
      promoCodes: [
        {
          id: '1',
          code: 'WELCOME10',
          type: 'percentage',
          value: 10,
          minPurchase: 50,
          maxUses: 100,
          usedCount: 23,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          code: 'TEMPORAL20',
          type: 'fixed',
          value: 20,
          minPurchase: 100,
          maxUses: 50,
          usedCount: 8,
          validFrom: new Date().toISOString(),
          validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],

      addPromoCode: (promo) => set((state) => ({
        promoCodes: [...state.promoCodes, {
          ...promo,
          id: generateId(),
          usedCount: 0,
          createdAt: new Date().toISOString(),
        }],
      })),

      updatePromoCode: (id, updates) => set((state) => ({
        promoCodes: state.promoCodes.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),

      deletePromoCode: (id) => set((state) => ({
        promoCodes: state.promoCodes.filter((p) => p.id !== id),
      })),

      validatePromoCode: (code, cartTotal) => {
        const promo = get().promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase());

        if (!promo) {
          return { valid: false, discount: 0, message: 'Code promo invalide' };
        }

        if (!promo.isActive) {
          return { valid: false, discount: 0, message: 'Ce code promo n\'est plus actif' };
        }

        const now = new Date();
        if (new Date(promo.validFrom) > now || new Date(promo.validUntil) < now) {
          return { valid: false, discount: 0, message: 'Ce code promo a expiré' };
        }

        if (promo.maxUses && promo.usedCount >= promo.maxUses) {
          return { valid: false, discount: 0, message: 'Ce code promo a atteint sa limite d\'utilisation' };
        }

        if (promo.minPurchase && cartTotal < promo.minPurchase) {
          return { valid: false, discount: 0, message: `Minimum d'achat requis: ${promo.minPurchase}€` };
        }

        const discount = promo.type === 'percentage'
          ? (cartTotal * promo.value) / 100
          : promo.value;

        return { valid: true, discount: Math.min(discount, cartTotal), message: 'Code promo appliqué!' };
      },

      // Packs
      packs: [
        {
          id: '1',
          name: 'Pack Essentiel',
          description: 'Le combo parfait pour commencer: 1 Hoodie + 1 T-Shirt',
          products: [
            { productId: '1', quantity: 1 },
            { productId: '2', quantity: 1 },
          ],
          originalPrice: 134,
          packPrice: 115,
          discount: 14,
          images: [],
          isActive: true,
          stock: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      addPack: (pack) => set((state) => {
        const products = get().products;
        let originalPrice = 0;
        pack.products.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            originalPrice += product.price * item.quantity;
          }
        });
        const discount = Math.round(((originalPrice - pack.packPrice) / originalPrice) * 100);

        return {
          packs: [...state.packs, {
            ...pack,
            id: generateId(),
            originalPrice,
            discount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
        };
      }),

      updatePack: (id, updates) => set((state) => ({
        packs: state.packs.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
      })),

      deletePack: (id) => set((state) => ({
        packs: state.packs.filter((p) => p.id !== id),
      })),

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
      categories: ['vestes', 'tshirts', 'pantalons', 'accessoires', 'ensembles'],

      addCategory: (category) => set((state) => ({
        categories: [...state.categories, category.toLowerCase()],
      })),

      deleteCategory: (category) => set((state) => ({
        categories: state.categories.filter((c) => c !== category),
      })),

      // Tickets
      tickets: [
        {
          id: '1',
          ticketNumber: 'TK-DEMO001',
          customerName: 'Jean Dupont',
          customerEmail: 'jean.dupont@email.com',
          subject: 'Question sur ma commande',
          status: 'open',
          priority: 'medium',
          messages: [
            {
              id: '1',
              content: 'Bonjour, je voudrais savoir quand ma commande sera expédiée ?',
              isAdmin: false,
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],

      addTicket: (ticket) => set((state) => ({
        tickets: [...state.tickets, {
          ...ticket,
          id: generateId(),
          ticketNumber: generateTicketNumber(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),

      updateTicketStatus: (id, status) => set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
        ),
      })),

      addTicketMessage: (ticketId, content, isAdmin) => set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                messages: [...t.messages, {
                  id: generateId(),
                  content,
                  isAdmin,
                  createdAt: new Date().toISOString(),
                }],
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      })),
    }),
    {
      name: 'temporal-admin-store',
    }
  )
);
