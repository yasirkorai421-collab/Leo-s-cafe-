import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create Redis client only if credentials are available
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create rate limiter
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
}

/**
 * Rate limiting middleware for API routes
 * Usage: const { success } = await rateLimitCheck(request);
 */
export async function rateLimitCheck(
  request: Request | { ip?: string; headers: Headers }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // If no rate limiter configured, allow all requests
  if (!ratelimit) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  // Get IP address
  let ip: string;
  
  if ('ip' in request && request.ip) {
    ip = request.ip;
  } else {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    ip = forwarded?.split(",")[0] || realIp || "127.0.0.1";
  }

  // Check rate limit
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  return { success, limit, remaining, reset };
}

/**
 * Rate limiter specifically for auth routes (stricter)
 */
export async function authRateLimitCheck(
  request: Request | { ip?: string; headers: Headers }
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!redis) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  // Stricter rate limit for auth: 5 attempts per 15 minutes
  const authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  });

  // Get IP address
  let ip: string;
  
  if ('ip' in request && request.ip) {
    ip = request.ip;
  } else {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    ip = forwarded?.split(",")[0] || realIp || "127.0.0.1";
  }

  const { success, limit, remaining, reset } = await authLimiter.limit(ip);

  return { success, limit, remaining, reset };
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  rateLimit: { limit: number; remaining: number; reset: number }
): Response {
  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  headers.set("X-RateLimit-Reset", new Date(rateLimit.reset).toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
