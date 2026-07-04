import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const publicRoutes = [
  /^\/auth\/login$/,
  /^\/auth\/signup$/,
  /^\/api\/webhooks\/(.*)/,
  /^\/api\/dine\/scan(.*)/,
];

const adminRoutes = [
  /^\/admin(.*)/,
  /^\/api\/admin(.*)/,
];

const authRoutes = [
  /^\/auth\/login$/,
  /^\/auth\/signup$/,
];

function isMatch(url: string, patterns: RegExp[]) {
  return patterns.some(pattern => pattern.test(url));
}

export async function middleware(request: NextRequest) {
  // updateSession updates the Supabase auth token
  const { supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // We decode sessionClaims in Clerk usually. With Supabase, role is usually in user.user_metadata
  // However, since we sync users to Prisma, the actual role should probably be checked against the DB.
  // For middleware, if we strictly need admin check, we might have to rely on app/api or layout.
  // Since we can't reliably query Prisma in edge middleware, we'll assume the role is in user_metadata,
  // or we let the actual route/handler do the hard rejection and just do basic auth routing here.
  // Actually, Supabase sets app_metadata or user_metadata. Let's assume role might be in user_metadata.role
  const isAdmin = user?.user_metadata?.role === "admin";

  // Public routes - allow everyone
  if (isMatch(pathname, publicRoutes)) {
    return supabaseResponse;
  }

  // Not authenticated - redirect to login
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role (or rely on layout/route handlers for strict DB check)
  if (isMatch(pathname, adminRoutes)) {
    if (!isAdmin) {
      // CLAUDE.md rule 7: Return 404 to non-admin, not 403
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Auth routes - redirect if already logged in
  if (isMatch(pathname, authRoutes) && user) {
    return NextResponse.redirect(new URL("/menu", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
