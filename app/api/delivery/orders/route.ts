/**
 * GET /api/delivery/orders - Get orders assigned to delivery person
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get delivery person from database
    const deliveryPerson = await prisma.user.findFirst({
      where: {
        clerkId: user.id,
        role: "delivery_person",
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: "Delivery person not found" },
        { status: 404 }
      );
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build where clause
    const whereClause: any = {
      deliveryPersonId: deliveryPerson.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Fetch assigned orders
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Active deliveries first
        { createdAt: "desc" },
      ],
    });

    // Calculate statistics
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      pickedUp: orders.filter((o) => o.status === "picked_up").length,
      outForDelivery: orders.filter((o) => o.status === "out_for_delivery").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };

    return NextResponse.json({ orders, stats });
  } catch (error) {
    console.error("Delivery orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
