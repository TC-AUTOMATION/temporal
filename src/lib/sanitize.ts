/**
 * Input sanitization utilities
 * Prevents XSS attacks by removing potentially dangerous HTML/JavaScript
 */

/**
 * Sanitize HTML input by removing all HTML tags and dangerous content
 * This is a simple implementation - for production, consider using DOMPurify
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';

  return input
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize user notes (customer notes, admin notes, etc.)
 * Allows basic text but removes potentially dangerous content
 */
export function sanitizeNote(note: string | null | undefined): string | undefined {
  if (!note) return undefined;

  const sanitized = sanitizeHtml(note);

  // Limit length to prevent DoS attacks
  const maxLength = 5000;
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

/**
 * Sanitize text input (names, addresses, etc.)
 * More permissive than HTML sanitization but still removes dangerous content
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';

  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  return email
    .toLowerCase()
    .trim()
    // Remove any non-email characters
    .replace(/[^\w\-@.+]/g, '');
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';

  return phone
    .trim()
    // Keep only digits, spaces, +, -, (, )
    .replace(/[^\d\s+\-()]/g, '');
}

/**
 * Sanitize object with multiple fields
 * Useful for sanitizing form data
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: Array<keyof T>,
  sanitizer: (value: any) => any = sanitizeText
): T {
  const result = { ...obj };

  for (const field of fields) {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = sanitizer(result[field]);
    }
  }

  return result;
}
