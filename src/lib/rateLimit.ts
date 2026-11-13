/**
 * Tiny in-memory sliding-window rate limiter.
 * Good enough for a single Node instance / dev. For multi-instance production,
 * swap the Map for Redis (REDIS_URL is already in .env.example).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterSeconds = Math.ceil((windowMs - (now - hits[0])) / 1000);
    return { ok: false, retryAfterSeconds };
  }

  hits.push(now);
  buckets.set(key, hits);

  // opportunistic cleanup so the Map cannot grow forever
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return { ok: true, retryAfterSeconds: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}
