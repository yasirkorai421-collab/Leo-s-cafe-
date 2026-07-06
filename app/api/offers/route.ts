/**
 * GET /api/offers - Get active offers for customers
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const now = new Date();

    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        termsAndConditions: true,
        discountType: true,
        discountValue: true,
        code: true,
        startsAt: true,
        endsAt: true,
        isFeatured: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Fetch offers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
