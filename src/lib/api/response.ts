import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

/**
 * Success response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Error response
 */
export function errorResponse(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Validation error response (from Zod)
 */
export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const errors: Record<string, string[]> = {};

  const issues = error.issues || [];
  issues.forEach((err) => {
    const path = err.path.map(String).join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(message = 'Non autorisé'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

/**
 * Forbidden response
 */
export function forbiddenResponse(message = 'Accès refusé'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

/**
 * Not found response
 */
export function notFoundResponse(message = 'Ressource non trouvée'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * Server error response
 */
export function serverErrorResponse(message = 'Erreur serveur'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
