import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';
import { z } from 'zod';

// Store settings schema
const storeSettingsSchema = z.object({
  storeName: z.string().min(1).max(200).optional(),
  storeDescription: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  supportEmail: z.string().email().optional(),
  shippingCostFrance: z.number().min(0).optional(),
  shippingCostEurope: z.number().min(0).optional(),
  shippingCostWorld: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  currency: z.string().max(10).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  maintenanceMode: z.boolean().optional(),
  enableNewsletter: z.boolean().optional(),
  termsUrl: z.string().url().optional().or(z.literal('')),
  privacyUrl: z.string().url().optional().or(z.literal('')),
  returnPolicyUrl: z.string().url().optional().or(z.literal('')),
  // Billing / invoice
  companyLegalName: z.string().max(200).optional(),
  companyLegalForm: z.string().max(100).optional(),
  companyAddress: z.string().max(200).optional(),
  companyPostalCode: z.string().max(20).optional(),
  companyCity: z.string().max(100).optional(),
  companyCountry: z.string().max(100).optional(),
  companySiret: z.string().max(30).optional(),
  companyVatNumber: z.string().max(30).optional(),
  companyRcs: z.string().max(100).optional(),
  companyCapital: z.string().max(50).optional(),
  invoicePrefix: z.string().max(20).optional(),
  invoiceFooterNote: z.string().max(500).optional(),
});

type StoreSettings = z.infer<typeof storeSettingsSchema>;

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'Temporal',
  storeDescription: 'Streetwear moderne et authentique',
  contactEmail: 'contact@temporal-clothes.com',
  contactPhone: '07 68 28 13 95',
  supportEmail: 'contact@temporal-clothes.com',
  shippingCostFrance: 5.99,
  shippingCostEurope: 9.99,
  shippingCostWorld: 19.99,
  freeShippingThreshold: 80,
  currency: 'EUR',
  taxRate: 20,
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  maintenanceMode: false,
  enableNewsletter: true,
  termsUrl: '',
  privacyUrl: '',
  returnPolicyUrl: '',
  companyLegalName: 'Temporal',
  companyLegalForm: '',
  companyAddress: '22 Rue Pierre Brossolette',
  companyPostalCode: '27000',
  companyCity: 'Évreux',
  companyCountry: 'France',
  companySiret: '',
  companyVatNumber: '',
  companyRcs: '',
  companyCapital: '',
  invoicePrefix: 'FAC-',
  invoiceFooterNote: 'TVA non applicable, art. 293 B du CGI.',
};

/**
 * Get a setting value from database
 */
async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key },
  });
  return setting?.value || null;
}

/**
 * Set a setting value in database
 */
async function setSetting(key: string, value: string, type = 'string'): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value, type },
    create: { key, value, type },
  });
}

/**
 * Get all settings as an object
 */
async function getAllSettings(): Promise<StoreSettings> {
  const settings = await prisma.setting.findMany();
  const result: Record<string, unknown> = { ...defaultSettings };

  for (const setting of settings) {
    let value: unknown = setting.value;

    // Parse value based on type
    if (setting.type === 'number') {
      value = parseFloat(setting.value);
    } else if (setting.type === 'boolean') {
      value = setting.value === 'true';
    } else if (setting.type === 'json') {
      try {
        value = JSON.parse(setting.value);
      } catch {
        value = setting.value;
      }
    }

    result[setting.key] = value;
  }

  return result as StoreSettings;
}

/**
 * GET /api/admin/settings
 * Get store settings (admin only)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const settings = await getAllSettings();
    return successResponse(settings);
  } catch (error) {
    console.error('GET /api/admin/settings error:', error);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/admin/settings
 * Update store settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }
    if (!user.isAdmin) {
      return forbiddenResponse();
    }

    const body = await request.json();

    // Support single key/value update (for siteMode, countdownDate, etc.)
    if (body.key && body.value !== undefined) {
      const allowedKeys = ['siteMode', 'countdownDate', 'sitePassword'];
      if (!allowedKeys.includes(body.key)) {
        return errorResponse('Clé non autorisée');
      }
      await setSetting(body.key, String(body.value), body.type || 'string');
      return successResponse({ [body.key]: body.value });
    }

    // Bulk settings update
    const validation = storeSettingsSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse('Paramètres invalides');
    }

    const data = validation.data;

    // Update each setting
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        let type = 'string';
        let stringValue = String(value);

        if (typeof value === 'number') {
          type = 'number';
          stringValue = value.toString();
        } else if (typeof value === 'boolean') {
          type = 'boolean';
          stringValue = value ? 'true' : 'false';
        } else if (typeof value === 'object' && value !== null) {
          type = 'json';
          stringValue = JSON.stringify(value);
        }

        await setSetting(key, stringValue, type);
      }
    }

    // Return updated settings
    const settings = await getAllSettings();
    return successResponse(settings);
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error);
    return serverErrorResponse();
  }
}
