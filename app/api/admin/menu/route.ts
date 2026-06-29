/**
 * POST /api/admin/menu - Create menu item
 * Epic 4 - Menu management
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const menuItemSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  imageUrl: z.string().url(),
  isAvailable: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const validation = menuItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: validation.data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "MENU_ITEM_CREATED",
        entityType: "menu_item",
        entityId: menuItem.id,
        details: { name: menuItem.name },
      },
    });

    return NextResponse.json({ menuItem }, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
