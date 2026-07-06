/**
 * GET /api/menu/[id]/availability - Check if menu item is available
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        isActive: true,
        price: true,
      },
    });

    if (!menuItem || !menuItem.isActive) {
      return NextResponse.json(
        { available: false, message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      available: menuItem.isAvailable,
      name: menuItem.name,
      price: menuItem.price,
    });
  } catch (error) {
    console.error("Check availability error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
