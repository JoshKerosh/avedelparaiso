/**
 * Minimal in-memory rate limiter (fixed window).
 *
 * Suitable for a single process / single serverless instance. For real
 * multi-instance scale (multiple Vercel lambdas), replace the backing `Map`
 * with a shared store such as Upstash Redis. Documented as future work.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (for a Retry-After header). */
  retryAfter: number;
}

/**
 * Records a hit for `key` and reports whether it is within `limit` per `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfter: 0 };
}

/**
 * Best-effort client IP extraction from proxy headers (Vercel sets x-forwarded-for).
 */
export function getClientIp(headers: Headers | { get(name: string): string | null | undefined }): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
