/**
 * GET /api/admin/delivery-personnel/[id] - Get delivery person details
 * PATCH /api/admin/delivery-personnel/[id] - Update delivery person
 * DELETE /api/admin/delivery-personnel/[id] - Delete delivery person
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const updateDeliveryPersonSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const deliveryPerson = await prisma.user.findFirst({
      where: {
        id,
        role: "delivery_person",
      },
      include: {
        deliveryOrders: {
          select: {
            id: true,
            status: true,
            total: true,
            deliveryAddress: true,
            createdAt: true,
            updatedAt: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: "Delivery person not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deliveryPerson });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch delivery person" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await request.json();
    const validation = updateDeliveryPersonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Find delivery person
    const deliveryPerson = await prisma.user.findFirst({
      where: {
        id,
        role: "delivery_person",
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: "Delivery person not found" },
        { status: 404 }
      );
    }

    // Update password in Supabase if provided
    if (updateData.password) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });

        await supabase.auth.admin.updateUserById(deliveryPerson.clerkId, {
          password: updateData.password,
        });
      }

      // Remove password from update data (not stored in database)
      delete updateData.password;
    }

    // Update in database
    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "DELIVERY_PERSON_UPDATED",
        entityType: "user",
        entityId: id,
        details: updateData,
      },
    });

    return NextResponse.json({ deliveryPerson: updated });
  } catch (error: any) {
    console.error("Update delivery person error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update delivery person" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    // Find delivery person
    const deliveryPerson = await prisma.user.findFirst({
      where: {
        id,
        role: "delivery_person",
      },
    });

    if (!deliveryPerson) {
      return NextResponse.json(
        { error: "Delivery person not found" },
        { status: 404 }
      );
    }

    // Check if has active deliveries
    const activeDeliveries = await prisma.order.count({
      where: {
        deliveryPersonId: id,
        status: {
          in: ["out_for_delivery", "picked_up"],
        },
      },
    });

    if (activeDeliveries > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete. This delivery person has ${activeDeliveries} active deliveries.`,
        },
        { status: 400 }
      );
    }

    // Delete from Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      await supabase.auth.admin.deleteUser(deliveryPerson.clerkId);
    }

    // Unassign from all orders (set to null)
    await prisma.order.updateMany({
      where: { deliveryPersonId: id },
      data: { deliveryPersonId: null },
    });

    // Delete from database
    await prisma.user.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "DELIVERY_PERSON_DELETED",
        entityType: "user",
        entityId: id,
        details: {
          name: deliveryPerson.name,
          email: deliveryPerson.email,
        },
      },
    });

    return NextResponse.json({ message: "Delivery person deleted" });
  } catch (error: any) {
    console.error("Delete delivery person error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete delivery person" },
      { status: 500 }
    );
  }
}
