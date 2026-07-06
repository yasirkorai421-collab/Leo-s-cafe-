/**
 * POST /api/admin/reservations/bulk-update - Update multiple reservations at once
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bulkUpdateSchema = z.object({
  reservationIds: z.array(z.string().uuid()),
  status: z.enum(["pending", "reviewing", "confirmed", "rejected", "cancelled"]),
  adminMessage: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { reservationIds, status, adminMessage } = validation.data;

    // Update all reservations
    await prisma.reservation.updateMany({
      where: {
        id: { in: reservationIds },
      },
      data: {
        status,
        adminMessage,
      },
    });

    // Audit logs
    await Promise.all(
      reservationIds.map((id) =>
        prisma.auditLog.create({
          data: {
            userId: admin.userId,
            action: "RESERVATION_BULK_UPDATE",
            entityType: "reservation",
            entityId: id,
            details: { status, adminMessage },
          },
        })
      )
    );

    return NextResponse.json({ 
      message: `${reservationIds.length} reservations updated`,
      count: reservationIds.length,
    });
  } catch (error: any) {
    console.error("Bulk update reservations error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update reservations" },
      { status: 500 }
    );
  }
}
