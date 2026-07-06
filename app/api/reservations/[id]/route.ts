/**
 * GET /api/reservations/[id] - Get single reservation
 * DELETE /api/reservations/[id] - Cancel reservation (user)
 */

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error("Get reservation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find reservation
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Only allow cancellation if not already cancelled or confirmed
    if (reservation.status === "cancelled") {
      return NextResponse.json({ error: "Reservation already cancelled" }, { status: 400 });
    }

    // Update status to cancelled
    await prisma.reservation.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ message: "Reservation cancelled" });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}
