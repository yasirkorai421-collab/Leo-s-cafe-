/**
 * GET /api/profile/rewards
 * Epic 5 - Fetch user's loyalty points, vouchers, and review claims
 * CLAUDE.md rule 1: Ownership-checked
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // CLAUDE.md rule 1: Scoped to session user
    const [user, ledger, vouchers, reviewClaim] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyBalance: true },
      }),
      prisma.loyaltyLedger.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.voucher.findMany({
        where: { userId },
        orderBy: { issuedAt: "desc" },
      }),
      prisma.reviewPointClaim.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.loyaltyBalance,
      ledger,
      vouchers,
      reviewClaim,
    });
  } catch (error: any) {
    console.error("Fetch rewards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}
