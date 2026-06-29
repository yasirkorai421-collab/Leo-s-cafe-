/**
 * PATCH /api/admin/orders/[id]/update-status
 * Epic 4 - Update order status through workflow
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["confirmed", "preparing", "ready", "delivered", "cancelled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { status } = validation.data;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // CLAUDE.md rule 15: Audit log (append-only)
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "ORDER_STATUS_CHANGED",
        entityType: "order",
        entityId: id,
        details: { newStatus: status },
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
