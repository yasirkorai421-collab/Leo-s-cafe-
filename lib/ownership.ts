/**
 * Ownership Check Helper
 * Epic 1 - Required by CLAUDE.md rule 1 and Security & Access Section 11
 * 
 * Ensures every user-data query is scoped to the session's user_id.
 * Never trust a user/order ID from the URL, query string, or request body alone.
 * 
 * This is the single shared helper used by every user-data route to enforce
 * object-level authorization (IDOR prevention).
 */

import { createClient } from "@/utils/supabase/server";
import { prisma } from "./prisma";

export type OwnershipCheckResult =
  | { authorized: true; userId: string; isAdmin: boolean }
  | { authorized: false; reason: "unauthenticated" | "forbidden" | "not_found" };

/**
 * Check if the current user owns a specific order
 * Used by: /api/orders/[id], /api/orders/[id]/payment-proof, track-order pages
 * 
 * @param orderId - The order ID to check
 * @returns Authorization result with user context
 */
export async function checkOrderOwnership(
  orderId: string
): Promise<OwnershipCheckResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const userId = authUser.id;

  // Get user from database to check role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const isAdmin = user.role === "admin";

  // Admins can access any order
  if (isAdmin) {
    return { authorized: true, userId: user.id, isAdmin: true };
  }

  // Regular users can only access their own orders
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id, // CLAUDE.md rule 1: scoped to session's user_id
    },
    select: { id: true },
  });

  if (!order) {
    return { authorized: false, reason: "not_found" };
  }

  return { authorized: true, userId: user.id, isAdmin: false };
}

/**
 * Check if the current user can access loyalty/voucher data
 * Used by: /api/loyalty/*, /api/vouchers/*
 * 
 * @param targetUserId - The user ID whose data is being accessed
 * @returns Authorization result
 */
export async function checkUserDataOwnership(
  targetUserId: string
): Promise<OwnershipCheckResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const userId = authUser.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const isAdmin = user.role === "admin";

  // Admins can access any user's data
  if (isAdmin) {
    return { authorized: true, userId: user.id, isAdmin: true };
  }

  // Regular users can only access their own data
  if (user.id !== targetUserId) {
    return { authorized: false, reason: "forbidden" };
  }

  return { authorized: true, userId: user.id, isAdmin: false };
}

/**
 * Get current authenticated user with role check
 * Used by: Most API routes for general auth + role verification
 * 
 * @returns User ID and role, or null if not authenticated
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  isAdmin: boolean;
} | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const userId = authUser.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    isAdmin: user.role === "admin",
  };
}

/**
 * Require admin role - throws error if not admin
 * Used by: All /api/admin/* routes
 * 
 * Per CLAUDE.md rule 4 (defense in depth): every /api/admin/* handler
 * independently re-checks the role itself, not just middleware.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!user.isAdmin) {
    // CLAUDE.md: Admin-only endpoints return 404 to non-admin, not 403
    throw new Error("NOT_FOUND");
  }

  return { userId: user.userId };
}
