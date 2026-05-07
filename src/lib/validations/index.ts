import { z } from 'zod';

// ==================== AUTH ====================

export const emailSchema = z.string().email('Email invalide');

export const sendCodeSchema = z.object({
  email: emailSchema,
});

export const verifyCodeSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

// ==================== USER ====================

export const updateUserSchema = z.object({
  firstName: z.union([z.literal(''), z.string().min(1, 'Prénom requis').max(50)]).optional(),
  lastName: z.union([z.literal(''), z.string().min(1, 'Nom requis').max(50)]).optional(),
  phone: z.union([z.literal(''), z.string().min(10).max(20)]).optional(),
  newsletter: z.boolean().optional(),
});

// ==================== ADDRESS ====================

export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  firstName: z.string().min(1, 'Prénom requis').max(50),
  lastName: z.string().min(1, 'Nom requis').max(50),
  street: z.string().min(1, 'Adresse requise').max(200),
  city: z.string().min(1, 'Ville requise').max(100),
  postalCode: z.string().min(1, 'Code postal requis').max(20),
  country: z.string().min(1, 'Pays requis').max(100).default('France'),
  phone: z.string().max(20).optional(),
  isDefault: z.boolean().optional(),
});

// ==================== PRODUCT ====================

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50),
  name: z.string().min(1, 'Nom requis').max(200),
  nameEn: z.string().max(200).optional(),
  slug: z.string().min(1, 'Slug requis').max(200),
  description: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  materials: z.string().max(2000).optional(),
  materialsEn: z.string().max(2000).optional(),
  careInstructions: z.string().max(2000).optional(),
  careInstructionsEn: z.string().max(2000).optional(),
  modelInfo: z.string().max(500).optional(),
  price: z.number().min(0, 'Le prix ne peut pas être négatif'),
  originalPrice: z.number().min(0).optional(),
  categoryId: z.string().min(1, 'Catégorie requise'),
  images: z.array(z.string().min(1)),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(true),
  sizeGuideId: z.string().nullable().optional(),
  careGuideId: z.string().nullable().optional(),
  variants: z.array(z.object({
    sku: z.string().min(1).max(100),
    color: z.string().min(1).max(50),
    colorHex: z.string().nullable().optional(),
    size: z.string().min(1).max(20),
    stock: z.number().int().min(0),
    isActive: z.boolean().default(true),
  })).optional(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU requis').max(50),
  color: z.string().min(1, 'Couleur requise').max(50),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide').optional(),
  size: z.string().min(1, 'Taille requise').max(20),
  stock: z.number().int().min(0, 'Stock invalide'),
  isActive: z.boolean().default(true),
});

// ==================== CATEGORY ====================

export const categorySchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  slug: z.string().min(1, 'Slug requis').max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ==================== ORDER ====================

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().positive('Quantité invalide'),
  size: z.string().optional(),
  color: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Le panier est vide'),
  deliveryMethod: z.enum(['DELIVERY', 'RELAY', 'HAND_DELIVERY']),
  customerEmail: emailSchema,
  customerPhone: z.string().min(10).max(20).optional(),
  customerFirstName: z.string().min(1).max(50),
  customerLastName: z.string().min(1).max(50),
  shippingStreet: z.string().max(200).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingPostalCode: z.string().max(20).optional(),
  shippingCountry: z.string().max(100).default('France'),
  // Relay point info
  relayCarrier: z.string().max(50).optional(),
  relayPointCode: z.string().max(50).optional(),
  relayPointName: z.string().max(200).optional(),
  relayPointAddress: z.string().max(200).optional(),
  promoCode: z.string().max(50).optional(),
  customerNotes: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().max(100).optional(),
  trackingUrl: z.string().url().optional(),
  adminNotes: z.string().max(1000).optional(),
});

// ==================== PROMO CODE ====================

export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Code requis').max(50).toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'PER_TRANCHE']),
  value: z.number().positive('Valeur invalide'),
  trancheSize: z.number().positive().optional(),
  minPurchase: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => data.type !== 'PER_TRANCHE' || (data.trancheSize !== undefined && data.trancheSize > 0),
  { message: 'trancheSize requis pour PER_TRANCHE', path: ['trancheSize'] }
);

export const validatePromoCodeSchema = z.object({
  code: z.string().min(1).max(50),
  cartTotal: z.number().positive(),
});

// ==================== TICKET ====================

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Sujet requis').max(200),
  message: z.string().min(1, 'Message requis').max(5000),
  orderId: z.string().optional(),
});

export const createGuestTicketSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Nom requis').max(100),
  subject: z.string().min(1, 'Sujet requis').max(200),
  message: z.string().min(1, 'Message requis').max(5000),
  orderId: z.string().optional(),
});

export const ticketReplySchema = z.object({
  message: z.string().min(1, 'Message requis').max(5000),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// ==================== PACK ====================

export const packSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  slug: z.string().min(1, 'Slug requis').max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive('Le prix doit être positif'),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().default(1),
  })).min(1, 'Au moins un produit requis'),
});

// ==================== SETTINGS ====================

export const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
});

// ==================== CHECKOUT ====================

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Le panier est vide'),
  deliveryMethod: z.enum(['DELIVERY', 'RELAY', 'HAND_DELIVERY']),
  email: emailSchema,
  phone: z.string().min(10).max(20),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  // Billing address — always required (the real person, never a relay)
  // Used for the invoice and as the default shipping address for home delivery
  address: z.string().min(1, 'Adresse requise').max(200),
  city: z.string().min(1, 'Ville requise').max(100),
  postalCode: z.string().min(1, 'Code postal requis').max(20),
  country: z.string().max(100).default('France'),
  // Relay point info
  relayPointId: z.string().max(50).optional(),
  relayPointCode: z.string().max(50).optional(), // Boxtal parcelshop code for shipment creation
  relayPointName: z.string().max(200).optional(),
  relayPointAddress: z.string().max(200).optional(),
  relayPointCity: z.string().max(100).optional(),
  relayPointPostalCode: z.string().max(20).optional(),
  relayCarrier: z.string().max(50).optional(),
  // Opt-in: create an account with this email after checkout (guest → user)
  createAccount: z.boolean().optional(),
  // Other
  promoCode: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
}).refine((data) => {
  // Validate address is required for home delivery
  if (data.deliveryMethod === 'DELIVERY') {
    return data.address && data.city && data.postalCode;
  }
  // Validate relay point is required for relay delivery
  if (data.deliveryMethod === 'RELAY') {
    return data.relayPointId && data.relayPointName;
  }
  return true;
}, {
  message: 'Adresse requise pour la livraison à domicile, ou point relais requis pour la livraison en point relais',
});

// ==================== HELPERS ====================

export type SendCodeInput = z.infer<typeof sendCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;
export type ValidatePromoCodeInput = z.infer<typeof validatePromoCodeSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type CreateGuestTicketInput = z.infer<typeof createGuestTicketSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
export type PackInput = z.infer<typeof packSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
