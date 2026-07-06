/**
 * POST /api/admin/stories/reorder - Bulk update story order
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  storyIds: z.array(z.string()),
});

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const validation = reorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { storyIds } = validation.data;

    // Update sort order for each story
    await Promise.all(
      storyIds.map((id, index) =>
        prisma.story.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "STORIES_REORDERED",
        entityType: "story",
        entityId: "bulk",
        details: {
          newOrder: storyIds,
        },
      },
    });

    return NextResponse.json({ message: "Stories reordered successfully" });
  } catch (error: any) {
    console.error("Reorder stories error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to reorder stories" },
      { status: 500 }
    );
  }
}
