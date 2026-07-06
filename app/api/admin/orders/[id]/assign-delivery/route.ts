/**
 * PATCH /api/admin/orders/[id]/assign-delivery
 * Assign order to delivery person
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendSMS } from "@/lib/sms";

const assignDeliverySchema = z.object({
  deliveryPersonId: z.string().min(1),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = assignDeliverySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { deliveryPersonId } = validation.data;

    // Verify delivery person exists
    const deliveryPerson = await prisma.user.findFirst({
      where: {
        id: deliveryPersonId,
        role: "delivery_person",
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: "Delivery person not found" },
        { status: 404 }
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with delivery person
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        deliveryPersonId,
      },
      include: {
        deliveryPerson: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        user: true,
      },
    });

    // Notify delivery person via SMS
    if (deliveryPerson.phone) {
      await sendSMS(
        deliveryPerson.phone,
        `New delivery assigned! Order #${order.id.slice(0, 8)} - ${order.deliveryAddress}. Login to your dashboard for details.`
      );
    }

    // Notify customer via SMS
    if (order.user.phone) {
      await sendSMS(
        order.user.phone,
        `Your order #${order.id.slice(0, 8)} has been assigned to ${deliveryPerson.name}. You'll receive updates as it progresses!`
      );
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "DELIVERY_ASSIGNED",
        entityType: "order",
        entityId: id,
        details: {
          deliveryPersonId,
          deliveryPersonName: deliveryPerson.name,
        },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Assign delivery error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to assign delivery person" },
      { status: 500 }
    );
  }
}
