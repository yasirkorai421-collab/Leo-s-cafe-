/**
 * PATCH /api/admin/orders/[id]/update-status
 * Update order status - admin only
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/ownership";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "pending_payment",
    "payment_cod",
    "payment_whatsapp",
    "confirmed",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
  ]),
  adminNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Admin check
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status, adminNotes } = validation.data;

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || undefined,
        updatedAt: new Date(),
      },
      include: {
        orderItems: {
          include: {
            item: { select: { name: true } },
          },
        },
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "ORDER_STATUS_CHANGED",
        entityType: "order",
        entityId: id,
        details: {
          newStatus: status,
          adminNotes,
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
