/**
 * Next.js Middleware for Route Protection
 * Epic 1 - Auth & Route Protection
 *
 * Enforces the access control matrix from Security & Access Section 5.
 * CLAUDE.md rule 4: Defense in depth - middleware + per-handler checks.
 *
 * Clerk v6 compatible.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/menu(.*)",
  "/about",
  "/contact",
  "/privacy",
  "/auth/login",
  "/auth/signup",
  "/api/menu(.*)",         // Public menu API
  "/api/webhooks/(.*)",    // Clerk webhook must be public
  "/api/dine/scan(.*)",    // QR scan - auth checked inside handler
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
  const isAdmin =
    (sessionClaims?.metadata as { role?: string } | undefined)?.role === "admin";

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
      // CLAUDE.md rule 7: Return 404 to non-admin, not 403
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
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
