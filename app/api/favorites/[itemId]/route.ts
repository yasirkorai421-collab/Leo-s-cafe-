/**
 * DELETE /api/favorites/[itemId]
 * Epic 7 - Remove from favorites
 * CLAUDE.md rule 1: Ownership-checked
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    // CLAUDE.md rule 1: Only delete own favorites
    await prisma.favorite.delete({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error: any) {
    console.error("Remove favorite error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
