/**
 * POST /api/admin/orders/[id]/confirm-cod
 * Confirm Cash on Delivery orders - moves them to confirmed status
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getLoyaltySettings } from "@/lib/settings";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.paymentMethod !== "cash_on_delivery") {
        throw new Error("NOT_COD_ORDER");
      }

      if (order.status === "confirmed") {
        return { order, alreadyConfirmed: true };
      }

      // Confirm the order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          paymentStatus: "verified",
          status: "confirmed",
        },
      });

      // Award loyalty points
      const loyaltySettings = await getLoyaltySettings();
      const points = Math.floor(Number(order.total) * loyaltySettings.pointsPerCurrencyUnit);

      await tx.loyaltyLedger.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: "earn_purchase",
          points,
          description: `Earned ${points} points from COD order ${order.id}`,
        },
      });

      await tx.user.update({
        where: { id: order.userId },
        data: {
          loyaltyBalance: { increment: points },
          lastOrderAt: new Date(),
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: admin.userId,
          action: "COD_ORDER_CONFIRMED",
          entityType: "order",
          entityId: id,
          details: { orderId: id },
        },
      });

      return { order: updatedOrder, alreadyConfirmed: false };
    });

    if (result.alreadyConfirmed) {
      return NextResponse.json({
        message: "Order already confirmed",
        order: result.order,
      });
    }

    return NextResponse.json({
      message: "COD order confirmed",
      order: result.order,
    });
  } catch (error: any) {
    console.error("COD confirmation error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (error.message === "NOT_COD_ORDER") {
      return NextResponse.json({ error: "This is not a COD order" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to confirm order" },
      { status: 500 }
    );
  }
}
