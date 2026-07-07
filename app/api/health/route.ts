import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health check endpoint for monitoring and load balancing
 * Returns system status including database connectivity
 */
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    const dbLatency = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'leos-cafe-api',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'leos-cafe-api',
      error: 'Database connection failed',
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}
