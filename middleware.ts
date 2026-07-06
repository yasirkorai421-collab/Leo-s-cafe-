import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Optimized public routes - faster string matching
const publicPaths = new Set([
  '/',
  '/menu',
  '/about',
  '/contact',
  '/offers',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/admin/login',
  '/delivery/login',
]);

const publicPrefixes = [
  '/track-order/',
  '/api/auth/',
  '/api/otp/',
  '/api/offers',
  '/api/menu',
  '/api/webhooks/',
  '/api/dine/',
];



function isPublicRoute(pathname: string): boolean {
  if (publicPaths.has(pathname)) return true;
  return publicPrefixes.some(prefix => pathname.startsWith(prefix));
}

function isAdminRoute(pathname: string): boolean {
  return (pathname.startsWith('/admin') && pathname !== '/admin/login') || 
         pathname.startsWith('/api/admin');
}

function isDeliveryRoute(pathname: string): boolean {
  return (pathname.startsWith('/delivery') && pathname !== '/delivery/login') || 
         pathname.startsWith('/api/delivery');
}

export async function middleware(request: NextRequest) {
  // Security: Force HTTPS in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }

  // updateSession updates the Supabase auth token
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Security: Add comprehensive security headers
  const response = supabaseResponse || NextResponse.next();
  
  // Prevent clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy for privacy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - Strict but allows necessary resources
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live", // Next.js needs unsafe-inline/eval in dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Permissions Policy (formerly Feature Policy)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS - Force HTTPS for 1 year (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Public routes - allow everyone
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Not authenticated - redirect to login
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (isAdminRoute(pathname)) {
    if (user?.user_metadata?.role !== "admin") {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Delivery routes - require delivery_person role
  if (isDeliveryRoute(pathname)) {
    if (user?.user_metadata?.role !== "delivery_person") {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Auth routes - redirect if already logged in
  if ((pathname === '/auth/login' || pathname === '/auth/signup') && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
