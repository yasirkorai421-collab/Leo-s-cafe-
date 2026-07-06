/**
 * POST /api/orders/[id]/select-payment
 * Select payment method (COD or Online)
 */

import { NextResponse } from "next/server";
import { checkOrderOwnership } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const selectPaymentSchema = z.object({
  paymentMethod: z.enum(["cash_on_delivery", "online_payment"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check ownership
    const authResult = await checkOrderOwnership(id);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = selectPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const { paymentMethod } = validation.data;

    // Update order with payment method
    const order = await prisma.order.update({
      where: { id },
      data: {
        paymentMethod,
        paymentStatus: paymentMethod === "cash_on_delivery" ? "cod_selected" : "pending",
        status: paymentMethod === "cash_on_delivery" ? "payment_cod" : "pending_payment",
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

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Payment selection error:", error);
    return NextResponse.json(
      { error: "Failed to select payment method" },
      { status: 500 }
    );
  }
}
