/**
 * POST /api/loyalty/redeem
 * Epic 5 - Redeem loyalty points for discount
 * CLAUDE.md rule 3: Server recomputes discount from live balance
 * CLAUDE.md rule 10: Transaction for balance deduction + ledger write
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getLoyaltySettings } from "@/lib/settings";
import { z } from "zod";

const redeemSchema = z.object({
  pointsToRedeem: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const validation = redeemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error },
        { status: 400 }
      );
    }

    const { pointsToRedeem } = validation.data;

    // CLAUDE.md rule 10: Transaction for recompute + deduct
    const result = await prisma.$transaction(async (tx) => {
      // Get current balance (never trust client)
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { loyaltyBalance: true },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // Recompute discount server-side (CLAUDE.md rule 3)
      if (pointsToRedeem > user.loyaltyBalance) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const loyaltySettings = await getLoyaltySettings();
      const discountAmount = pointsToRedeem * loyaltySettings.redemptionRate;

      // Deduct points
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyBalance: { decrement: pointsToRedeem },
        },
      });

      // Create ledger entry
      const ledgerEntry = await tx.loyaltyLedger.create({
        data: {
          userId,
          type: "redeem",
          points: -pointsToRedeem,
          description: `Redeemed ${pointsToRedeem} points for Rs. ${discountAmount} discount`,
        },
      });

      return {
        discountAmount,
        pointsRedeemed: pointsToRedeem,
        newBalance: user.loyaltyBalance - pointsToRedeem,
        ledgerEntry,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Loyalty redemption error:", error);

    if (error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "Insufficient loyalty points" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to redeem points" },
      { status: 500 }
    );
  }
}
