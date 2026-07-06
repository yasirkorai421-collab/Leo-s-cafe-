/**
 * GET /api/admin/menu - Get all menu items with categories for price management
 * PATCH /api/admin/menu/bulk-update - Bulk update menu items
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const whereClause: any = {
      isActive: true,
    };

    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [menuItems, categories] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { category: { name: "asc" } },
          { name: "asc" },
        ],
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ menuItems, categories });
  } catch (error: any) {
    console.error("Fetch menu items error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

const bulkUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      price: z.number().positive().optional(),
      isAvailable: z.boolean().optional(),
    })
  ),
});

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { updates } = validation.data;

    // Perform bulk update
    await Promise.all(
      updates.map((update) =>
        prisma.menuItem.update({
          where: { id: update.id },
          data: {
            ...(update.price !== undefined && { price: update.price }),
            ...(update.isAvailable !== undefined && { isAvailable: update.isAvailable }),
          },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "MENU_BULK_UPDATED",
        entityType: "menu_item",
        entityId: "bulk",
        details: {
          updatedCount: updates.length,
          updates,
        },
      },
    });

    return NextResponse.json({
      message: `${updates.length} menu items updated successfully`,
    });
  } catch (error: any) {
    console.error("Bulk update menu error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update menu items" },
      { status: 500 }
    );
  }
}
