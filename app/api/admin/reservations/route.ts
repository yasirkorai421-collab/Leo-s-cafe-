/**
 * GET /api/admin/reservations - Get all reservations for admin
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 });
  }
}
