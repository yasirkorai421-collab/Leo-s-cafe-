import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Helper function for transaction with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Optimized query helper with caching
 */
export class CachedQuery {
  private cache = new Map<string, { data: any; expiry: number }>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 60000 // 1 minute default
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, expiry: Date.now() + ttl });

    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }

    return data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp) {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

export const queryCache = new CachedQuery();

/**
 * Batch query helper for reducing database round trips
 */
export async function batchQueries<T extends readonly unknown[]>(
  queries: readonly [...{ [K in keyof T]: () => Promise<T[K]> }]
): Promise<T> {
  return Promise.all(queries.map((query) => query())) as unknown as Promise<T>;
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Optimized pagination helper
 */
export async function paginatedQuery<T>(
  model: any,
  options: {
    page?: number;
    limit?: number;
    where?: any;
    orderBy?: any;
    include?: any;
  }
): Promise<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10)); // Max 100 per page
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where: options.where,
      orderBy: options.orderBy,
      include: options.include,
      skip,
      take: limit,
    }),
    model.count({ where: options.where }),
  ]);

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

export default prisma;
