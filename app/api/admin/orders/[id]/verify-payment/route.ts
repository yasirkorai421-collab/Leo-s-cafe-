/**
 * PATCH /api/admin/orders/[id]/verify-payment
 * Epic 3 - THE ONLY code path that can set order.status=confirmed
 * CLAUDE.md rule 2: Single payment-confirm path
 * CLAUDE.md rules 10-11: Transaction + idempotency
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getLoyaltySettings } from "@/lib/settings";
import { z } from "zod";

const verifySchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CLAUDE.md rule 4: Re-check admin role in handler (defense in depth)
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { action, reason } = validation.data;

    // CLAUDE.md rule 11: Idempotency check - check current state in transaction
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { paymentProofs: true, user: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // Idempotency: If already verified, return success without changes
      if (order.paymentStatus === "verified" && action === "approve") {
        return { order, alreadyVerified: true };
      }

      if (order.paymentStatus === "rejected" && action === "reject") {
        return { order, alreadyRejected: true };
      }

      // Update payment proof
      const latestProof = order.paymentProofs[order.paymentProofs.length - 1];
      if (latestProof) {
        await tx.paymentProof.update({
          where: { id: latestProof.id },
          data: {
            status: action === "approve" ? "verified" : "rejected",
            verifiedBy: admin.userId,
            verifiedAt: new Date(),
          },
        });
      }

      // CLAUDE.md rule 2: THE ONLY PLACE that can set status=confirmed
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: action === "approve" ? "verified" : "rejected",
          status: action === "approve" ? "confirmed" : (order.paymentMethod === "cash_on_delivery" ? "payment_cod" : "payment_online"),
        },
      });

      // Epic 5: Award loyalty points here in same transaction (CLAUDE.md rule 10)
      if (action === "approve") {
        const loyaltySettings = await getLoyaltySettings();
        const points = Math.floor(Number(order.total) * loyaltySettings.pointsPerCurrencyUnit);

        // Create loyalty ledger entry
        await tx.loyaltyLedger.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            type: "earn_purchase",
            points,
            description: `Earned ${points} points from order ${order.id}`,
          },
        });

        // Update user loyalty balance
        await tx.user.update({
          where: { id: order.userId },
          data: {
            loyaltyBalance: { increment: points },
            lastOrderAt: new Date(),
          },
        });
      }

      // CLAUDE.md rule 15: Audit log (append-only)
      await tx.auditLog.create({
        data: {
          userId: admin.userId,
          action: "PAYMENT_VERIFIED",
          entityType: "payment_proof",
          entityId: latestProof?.id || id,
          details: { action, orderId: id },
        },
      });

      return { order: updatedOrder, alreadyVerified: false, alreadyRejected: false };
    });

    if (result.alreadyVerified) {
      return NextResponse.json({
        message: "Payment already verified",
        order: result.order,
      });
    }

    if (result.alreadyRejected) {
      return NextResponse.json({
        message: "Payment already rejected",
        order: result.order,
      });
    }

    // TODO Epic 3: Send notification to customer

    return NextResponse.json({
      message: action === "approve" ? "Payment verified" : "Payment rejected",
      order: result.order,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
