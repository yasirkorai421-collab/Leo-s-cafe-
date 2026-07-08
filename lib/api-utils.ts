/**
 * API Utilities - Rate limiting, caching, validation, error handling
 */

import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error instanceof Error
      ? error.message
      : 'Unknown error';

  return NextResponse.json({ error: message }, { status: 500 });
}

// ============================================================================
// RATE LIMITING
// ============================================================================

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
    analytics: true,
    prefix: 'ratelimit',
  });
}

export async function checkRateLimit(
  identifier: string,
  config?: { limit?: number; window?: string }
): Promise<{ success: boolean; remaining?: number; reset?: number }> {
  // Skip rate limiting in development or if Upstash is not configured
  if (process.env.NODE_ENV === 'development' || !ratelimit) {
    return { success: true };
  }

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    if (!success) {
      throw new ApiError(
        429,
        'Too many requests. Please try again later.',
        'RATE_LIMIT_EXCEEDED'
      );
    }

    return { success, remaining, reset };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Rate limit check failed:', error);
    // Allow request on error (fail open)
    return { success: true };
  }
}

// ============================================================================
// CACHING HELPERS
// ============================================================================

const cache = new Map<string, { data: any; expiry: number }>();

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (cached.expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });

  // Cleanup old entries if cache grows too large
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (v.expiry < now) {
        cache.delete(k);
      }
    }
  }
}

export function invalidateCache(keyPattern: string | RegExp): void {
  const pattern = typeof keyPattern === 'string' ? new RegExp(keyPattern) : keyPattern;
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key);
    }
  }
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

export async function validateRequest<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw new ApiError(400, 'Invalid request body');
  }
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, error: message, code }, { status });
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export interface AuthContext {
  userId: string;
  role: string;
  email?: string;
}

export function requireAuth(user: any): AuthContext {
  if (!user) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
  }
  return {
    userId: user.id,
    role: user.user_metadata?.role || 'user',
    email: user.email,
  };
}

export function requireRole(authContext: AuthContext, allowedRoles: string[]) {
  if (!allowedRoles.includes(authContext.role)) {
    throw new ApiError(403, 'Insufficient permissions', 'FORBIDDEN');
  }
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
) {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

export function sanitizeHtml(input: string): string {
  // Remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeHtml(input.trim());
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

// ============================================================================
// LOGGING
// ============================================================================

export function logApiRequest(
  method: string,
  path: string,
  userId?: string,
  duration?: number
) {
  const log = {
    timestamp: new Date().toISOString(),
    method,
    path,
    userId,
    duration,
  };

  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Axiom, Datadog, etc.)
    console.log(JSON.stringify(log));
  } else {
    console.log(`[API] ${method} ${path} ${duration ? `(${duration}ms)` : ''}`);
  }
}

// ============================================================================
// ASYNC HANDLER WRAPPER
// ============================================================================

export function apiHandler(
  handler: (req: Request, ...args: any[]) => Promise<Response>
) {
  return async (req: Request, ...args: any[]) => {
    const start = Date.now();
    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - start;
      
      // Log successful requests
      logApiRequest(req.method, new URL(req.url).pathname, undefined, duration);
      
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      logApiRequest(req.method, new URL(req.url).pathname, undefined, duration);
      
      return handleApiError(error);
    }
  };
}
