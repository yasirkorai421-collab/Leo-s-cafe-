/**
 * GET /api/orders/[id] - Track order
 * Epic 2 - Required for verification, ownership-checked
 * CLAUDE.md rule 1: Filter by session user_id, never trust URL ID alone
 */

import { NextResponse } from "next/server";
import { checkOrderOwnership } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CLAUDE.md rule 1: Check ownership before returning data
    const authResult = await checkOrderOwnership(id);

    if (!authResult.authorized) {
      if (authResult.reason === "unauthenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // CLAUDE.md: Return 404, not 403, to non-owners
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch order with related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            item: {
              select: { name: true, imageUrl: true, price: true },
            },
          },
        },
        paymentProofs: {
          orderBy: { uploadedAt: "desc" },
          take: 1,
        },
        user: {
          select: { name: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
