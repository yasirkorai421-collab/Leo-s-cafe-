/**
 * GET /api/menu - Fetch all menu items grouped by category
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        menuItems: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Transform to the format expected by the frontend
    const menuData: Record<string, any[]> = {};
    const categoryNames: string[] = [];

    categories.forEach((category) => {
      categoryNames.push(category.name);
      menuData[category.name] = category.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
      }));
    });

    return NextResponse.json({
      categories: categoryNames,
      menuData,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
