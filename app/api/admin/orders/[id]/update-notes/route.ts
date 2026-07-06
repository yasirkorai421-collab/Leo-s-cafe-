/**
 * PATCH /api/admin/orders/[id]/update-notes
 * Update admin notes for an order
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateNotesSchema = z.object({
  adminNotes: z.string().max(1000),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = updateNotesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { adminNotes } = validation.data;

    const order = await prisma.order.update({
      where: { id },
      data: { adminNotes },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "ORDER_NOTES_UPDATED",
        entityType: "order",
        entityId: id,
        details: { orderId: id },
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Update notes error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 }
    );
  }
}
