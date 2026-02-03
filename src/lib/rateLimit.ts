/**
 * In-memory rate limiter for API routes
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store rate limit data in memory (per email/IP)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Unique identifier (e.g., email, IP address)
   */
  identifier: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxRequests, windowMs, identifier } = config;
  const now = Date.now();

  // Get or create entry for this identifier
  let entry = store.get(identifier);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(identifier, entry);

    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier
 * Useful for testing or manual resets
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Get current rate limit status without incrementing
 * @param identifier - The identifier to check
 * @param maxRequests - Maximum requests allowed (needed to calculate remaining)
 */
export function getRateLimitStatus(identifier: string, maxRequests: number): RateLimitResult | null {
  const entry = store.get(identifier);
  const now = Date.now();

  if (!entry || entry.resetAt < now) {
    return null;
  }

  return {
    success: entry.count < maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}
