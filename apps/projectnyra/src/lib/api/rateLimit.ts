export type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now = Date.now()
): RateLimitDecision {
  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + options.windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(options.limit - bucket.count, 0);
  const allowed = bucket.count <= options.limit;

  return {
    allowed,
    limit: options.limit,
    remaining,
    resetAt: bucket.resetAt,
    retryAfterSeconds: allowed
      ? undefined
      : Math.ceil((bucket.resetAt - now) / 1000),
  };
}

export function buildRateLimitHeaders(decision: RateLimitDecision) {
  return {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
    "X-RateLimit-Reset": String(Math.ceil(decision.resetAt / 1000)),
    ...(decision.retryAfterSeconds
      ? { "Retry-After": String(decision.retryAfterSeconds) }
      : {}),
  };
}

export function getRequestRateLimitKey(
  request: Request,
  scope: string
): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";

  return `${scope}:${clientIp}`;
}

export function resetRateLimitBucketsForTests() {
  buckets.clear();
}
