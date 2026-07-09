/**
 * POST /api/orders - Create new order
 * Epic 2 - Order creation at pending_payment status
 * CLAUDE.md rule 3: Server recomputes all prices, never trusts client
 */

import { NextResponse } from "next/server";
import { createOrderSchema } from "@/schemas/checkout";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Auth check - inline with debug info
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized", details: "Supabase auth returned no user. You may not be logged in." },
        { status: 401 }
      );
    }

    // Look up user in database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: authUser.id },
      select: { id: true, role: true },
    });

    if (!dbUser) {
      // User is authenticated with Supabase but has no database record
      // Auto-create the user record
      const name = authUser.user_metadata?.full_name || 
                   authUser.user_metadata?.name || 
                   authUser.email?.split('@')[0] || 
                   'User';
      const phone = authUser.user_metadata?.phone || authUser.phone || authUser.id;

      const newUser = await prisma.user.create({
        data: {
          clerkId: authUser.id,
          name,
          phone,
          email: authUser.email,
          role: 'user',
        },
        select: { id: true, role: true },
      });

      // Use the newly created user
      var userId = newUser.id;
      var isAdmin = newUser.role === "admin";
    } else {
      var userId = dbUser.id;
      var isAdmin = dbUser.role === "admin";
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      const messages = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
      return NextResponse.json(
        { error: "Invalid input", details: messages },
        { status: 400 }
      );
    }

    const { name, phone, deliveryAddress, notes, items } = validation.data;

    // CLAUDE.md rule 3: Rebuild prices from database, never trust client
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: items.map((i) => i.itemId) },
        isActive: true,
      },
      select: { id: true, price: true, name: true, isAvailable: true },
    });

    if (menuItems.length !== items.length) {
      const foundIds = menuItems.map(m => m.id);
      const missingIds = items.filter(i => !foundIds.includes(i.itemId)).map(i => i.itemId);
      return NextResponse.json(
        { error: "Some items are not available", details: `Missing items: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if any items are marked as unavailable
    const unavailableItems = menuItems.filter(m => !m.isAvailable);
    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: "Some items are currently unavailable", details: `Unavailable: ${unavailableItems.map(i => i.name).join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate total from database prices
    let total = 0;
    const orderItemsToCreate = items.map((cartItem) => {
      const menuItem = menuItems.find((m) => m.id === cartItem.itemId);
      if (!menuItem) throw new Error("Item not found");

      const itemTotal = Number(menuItem.price) * cartItem.quantity;
      total += itemTotal;

      return {
        itemId: cartItem.itemId,
        quantity: cartItem.quantity,
        customization: cartItem.customizations ? cartItem.customizations : undefined,
        itemPrice: menuItem.price,
      };
    });

    const finalNotes = `Name: ${name}\nPhone: ${phone}\nNotes: ${notes || "None"}`;

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        userId: userId,
        status: "pending_payment",
        paymentStatus: "pending",
        total,
        deliveryAddress,
        customerNotes: finalNotes,
        orderItems: {
          create: orderItemsToCreate,
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
      where: { id: userId },
      data: { lastOrderAt: new Date() },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
