/**
 * Next.js Middleware for Route Protection
 * Epic 1 - Auth & Route Protection
 * 
 * Enforces the access control matrix from Security & Access Section 5
 * CLAUDE.md rule 4: Defense in depth - middleware + per-handler checks
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/menu(.*)",
  "/about",
  "/contact",
  "/privacy",
  "/auth/login",
  "/auth/signup",
  "/api/menu(.*)", // Public menu API
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/auth/login",
  "/auth/signup",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const isAdmin = (sessionClaims?.metadata as { role?: string })?.role === "admin";

  // Public routes - allow everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Not authenticated - redirect to login
  if (!userId) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (isAdminRoute(req)) {
    if (!isAdmin) {
      // CLAUDE.md: Return 404 to non-admin, not 403
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Auth routes - redirect if already logged in
  if (isAuthRoute(req) && userId) {
    return NextResponse.redirect(new URL("/menu", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
