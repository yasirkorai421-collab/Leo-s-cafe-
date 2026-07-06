/**
 * PATCH /api/admin/reservations/[id] - Update reservation status with admin message
 * DELETE /api/admin/reservations/[id] - Delete reservation
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateReservationSchema = z.object({
  status: z.enum(["pending", "reviewing", "confirmed", "rejected", "cancelled"]),
  adminMessage: z.string().max(500).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = updateReservationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status, adminMessage } = validation.data;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        adminMessage,
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "RESERVATION_STATUS_UPDATED",
        entityType: "reservation",
        entityId: id,
        details: { 
          status, 
          adminMessage,
          reservationId: id,
        },
      },
    });

    // TODO: Send notification to customer (SMS/Email)
    // const message = adminMessage || `Your reservation for ${reservation.numberOfPeople} people on ${reservation.date} has been ${status}`;

    return NextResponse.json({ reservation });
  } catch (error: any) {
    console.error("Update reservation error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    await prisma.reservation.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "RESERVATION_DELETED",
        entityType: "reservation",
        entityId: id,
        details: { reservationId: id },
      },
    });

    return NextResponse.json({ message: "Reservation deleted" });
  } catch (error: any) {
    console.error("Delete reservation error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete reservation" },
      { status: 500 }
    );
  }
}
