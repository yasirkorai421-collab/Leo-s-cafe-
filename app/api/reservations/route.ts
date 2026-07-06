/**
 * GET /api/reservations - Get user's reservations
 * POST /api/reservations - Create new reservation
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReservationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  date: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Date must be today or in the future"),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  numberOfPeople: z.number().int().min(1).max(50),
  specialRequest: z.string().max(500).optional(),
});

// GET user's reservations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reservations = await prisma.reservation.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Get reservations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

// POST create reservation
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReservationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, date, time, numberOfPeople, specialRequest } = validation.data;

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.userId,
        name,
        email,
        phone,
        date: new Date(date),
        time,
        numberOfPeople,
        specialRequest,
        status: "pending",
      },
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error) {
    console.error("Create reservation error:", error);
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}
