/**
 * PATCH /api/delivery/orders/[id]/update-status
 * Update delivery order status
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendOrderStatusSMS } from "@/lib/sms";

const updateStatusSchema = z.object({
  status: z.enum(["picked_up", "out_for_delivery", "delivered"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Validate request body
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { status, notes } = validation.data;

    // Find order and verify it's assigned to this delivery person
    const order = await prisma.order.findFirst({
      where: {
        id,
        deliveryPersonId: deliveryPerson.id,
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Validate status transition
    const allowedTransitions: Record<string, string[]> = {
      pending: ["picked_up"],
      confirmed: ["picked_up"],
      picked_up: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
    };

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${order.status} to ${status}`,
          allowedStatuses: allowed,
        },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(notes && { customerNotes: notes }),
      },
      include: {
        user: true,
        orderItems: {
          include: {
            item: true,
          },
        },
      },
    });

    // Send SMS notification to customer
    if (order.user.phone) {
      const statusMessages: Record<string, string> = {
        picked_up: `Your order #${order.id.slice(0, 8)} has been picked up by our delivery rider. It will reach you soon!`,
        out_for_delivery: `Your order #${order.id.slice(0, 8)} is out for delivery! Our rider is on the way to your location.`,
        delivered: `Your order #${order.id.slice(0, 8)} has been delivered. Thank you for ordering from Leo's Cafe! 😊`,
      };

      await sendOrderStatusSMS(
        order.user.phone,
        order.id,
        status,
        statusMessages[status]
      );
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: deliveryPerson.id,
        action: "DELIVERY_STATUS_UPDATED",
        entityType: "order",
        entityId: id,
        details: {
          oldStatus: order.status,
          newStatus: status,
          notes,
        },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Update delivery status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
