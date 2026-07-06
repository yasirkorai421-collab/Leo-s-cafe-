/**
 * GET /api/admin/delivery-personnel - List all delivery personnel
 * POST /api/admin/delivery-personnel - Create new delivery person
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const createDeliveryPersonSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function GET() {
  try {
    await requireAdmin();

    const deliveryPersonnel = await prisma.user.findMany({
      where: { role: "delivery_person" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        phoneVerifiedAt: true,
        _count: {
          select: {
            deliveryOrders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get delivery stats for each person
    const personnelWithStats = await Promise.all(
      deliveryPersonnel.map(async (person) => {
        const stats = await prisma.order.groupBy({
          by: ["status"],
          where: {
            deliveryPersonId: person.id,
          },
          _count: true,
        });

        return {
          ...person,
          stats: {
            total: person._count.deliveryOrders,
            delivered: stats.find((s) => s.status === "delivered")?._count || 0,
            inProgress: stats.filter((s) =>
              ["out_for_delivery", "picked_up"].includes(s.status)
            ).reduce((sum, s) => sum + s._count, 0),
          },
        };
      })
    );

    return NextResponse.json({ deliveryPersonnel: personnelWithStats });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch delivery personnel" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = createDeliveryPersonSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Create in Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Authentication service not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        name,
        role: "delivery_person",
      },
    });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create auth user" },
        { status: 500 }
      );
    }

    // Create in database
    const deliveryPerson = await prisma.user.create({
      data: {
        clerkId: authUser.user.id,
        name,
        email,
        phone,
        role: "delivery_person",
        phoneVerifiedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "DELIVERY_PERSON_CREATED",
        entityType: "user",
        entityId: deliveryPerson.id,
        details: { name, email, phone },
      },
    });

    return NextResponse.json({ deliveryPerson }, { status: 201 });
  } catch (error: any) {
    console.error("Create delivery person error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create delivery person" },
      { status: 500 }
    );
  }
}
