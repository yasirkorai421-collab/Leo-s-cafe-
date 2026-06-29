/**
 * PATCH /api/admin/review-claims/[id]
 * Epic 5 - Approve/reject Google review claims
 * CLAUDE.md rule 11: Idempotent - won't credit points twice
 * CLAUDE.md rule 10: Transaction for points credit + ledger
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getLoyaltySettings } from "@/lib/settings";
import { z } from "zod";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CLAUDE.md rule 4: Re-check admin role
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = reviewSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action } = validation.data;

    // CLAUDE.md rule 10 + 11: Transaction with idempotency
    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.reviewPointClaim.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!claim) {
        throw new Error("CLAIM_NOT_FOUND");
      }

      // CLAUDE.md rule 11: Idempotency check
      if (claim.status === "approved" && action === "approve") {
        return { claim, alreadyApproved: true };
      }

      if (claim.status === "rejected" && action === "reject") {
        return { claim, alreadyRejected: true };
      }

      // Update claim status
      const updatedClaim = await tx.reviewPointClaim.update({
        where: { id },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          reviewedBy: admin.userId,
          reviewedAt: new Date(),
        },
      });

      // Credit points if approved (CLAUDE.md rule 10: in same transaction)
      if (action === "approve") {
        const loyaltySettings = await getLoyaltySettings();
        const points = loyaltySettings.reviewBonus;

        await tx.loyaltyLedger.create({
          data: {
            userId: claim.userId,
            type: "earn_google_review",
            points,
            description: `Earned ${points} points from Google review bonus`,
          },
        });

        await tx.user.update({
          where: { id: claim.userId },
          data: {
            loyaltyBalance: { increment: points },
          },
        });
      }

      // CLAUDE.md rule 15: Audit log
      await tx.auditLog.create({
        data: {
          userId: admin.userId,
          action: "REVIEW_CLAIM_PROCESSED",
          entityType: "review_claim",
          entityId: id,
          details: { action, claimId: id },
        },
      });

      return { claim: updatedClaim, alreadyApproved: false, alreadyRejected: false };
    });

    if (result.alreadyApproved) {
      return NextResponse.json({
        message: "Claim already approved",
        claim: result.claim,
      });
    }

    if (result.alreadyRejected) {
      return NextResponse.json({
        message: "Claim already rejected",
        claim: result.claim,
      });
    }

    return NextResponse.json({
      message: action === "approve" ? "Claim approved" : "Claim rejected",
      claim: result.claim,
    });
  } catch (error: any) {
    console.error("Review claim processing error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (error.message === "CLAIM_NOT_FOUND") {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to process review claim" },
      { status: 500 }
    );
  }
}
