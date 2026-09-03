// In-memory sliding-window rate limiter, keyed by client IP. This is an
// MVP-level mitigation, not a production-grade one -- documented honestly
// here and in docs/THREAT-MODEL.md: on Vercel, each serverless function
// instance has its own memory, so this limit is per-instance, not global
// across the deployment, and resets on cold start. It still meaningfully
// slows a single abusive client hitting a single warm instance, and it
// costs nothing to run. A real production deployment would use a shared
// store (Vercel KV / Upstash Redis) -- noted as a roadmap item, not
// silently pretended away.

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterMs: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: windowMs - (now - existing.windowStart),
    };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterMs: 0 };
}

// Periodically drop stale buckets so this Map doesn't grow unbounded over
// a long-lived warm instance. Called opportunistically, not on a timer.
export function pruneRateLimitBuckets(windowMs: number, now: number = Date.now()) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= windowMs) buckets.delete(key);
  }
}

export function _resetRateLimitStateForTests() {
  buckets.clear();
}
