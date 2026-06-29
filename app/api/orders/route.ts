/**
 * POST /api/orders - Create new order
 * Epic 2 - Order creation at pending_payment status
 * CLAUDE.md rule 3: Server recomputes all prices, never trusts client
 */

import { NextResponse } from "next/server";
import { createOrderSchema } from "@/schemas/checkout";
import { getCurrentUser } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, phone, deliveryAddress, notes, items } = validation.data;

    // CLAUDE.md rule 3: Rebuild prices from database, never trust client
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map((i) => i.itemId) },
        isActive: true,
        isAvailable: true,
      },
      select: { id: true, price: true, name: true },
    });

    if (menuItems.length !== items.length) {
      return NextResponse.json(
        { error: "Some items are not available" },
        { status: 400 }
      );
    }

    // Calculate total from database prices
    let total = 0;
    const orderItems = items.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.itemId);
      if (!menuItem) throw new Error("Item not found");

      const itemTotal = Number(menuItem.price) * cartItem.quantity;
      total += itemTotal;

      return {
        item: { connect: { id: cartItem.itemId } },
        quantity: cartItem.quantity,
        customization: (cartItem.customizations || {}) as any,
        itemPrice: menuItem.price,
      };
    });

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        status: "pending_payment",
        paymentStatus: "awaiting_screenshot",
        total,
        deliveryAddress,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            item: {
              select: { name: true, imageUrl: true },
            },
          },
        },
      },
    });

    // Update user's lastOrderAt for win-back engine (Epic 5)
    await prisma.user.update({
      where: { id: user.userId },
      data: { lastOrderAt: new Date() },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
