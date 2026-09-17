interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * In-memory sliding window / fixed window rate limiter
 * Enforces per-IP and per-API-Key quotas (e.g. 120 req/min for general endpoints, 10 req/min for renders)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 120,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const bucket = memoryStore.get(identifier);

  if (!bucket || now > bucket.resetAt) {
    const newBucket: RateLimitBucket = {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    };
    memoryStore.set(identifier, newBucket);
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (bucket.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  bucket.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    resetSeconds,
  };
}