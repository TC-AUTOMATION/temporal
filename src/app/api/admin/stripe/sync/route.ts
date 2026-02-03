import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { syncProductsToStripe, syncSingleProductToStripe } from '@/lib/stripe-sync';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/response';

/**
 * POST /api/admin/stripe/sync
 * Synchronise tous les produits vers Stripe
 * Ou un seul produit si productId est fourni
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (!user.isAdmin) {
      return forbiddenResponse('Accès réservé aux administrateurs');
    }

    const body = await request.json().catch(() => ({}));
    const { productId } = body;

    // Sync un seul produit
    if (productId) {
      const result = await syncSingleProductToStripe(productId);

      if (!result.success) {
        return errorResponse(result.error || 'Erreur de synchronisation', 400);
      }

      return successResponse({
        message: 'Produit synchronisé avec succès',
        productId,
      });
    }

    // Sync tous les produits
    const result = await syncProductsToStripe();

    return successResponse({
      message: `Synchronisation terminée`,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors,
      total: result.created + result.updated + result.skipped,
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return serverErrorResponse(error instanceof Error ? error.message : 'Erreur serveur');
  }
}
