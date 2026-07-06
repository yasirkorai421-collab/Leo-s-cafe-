/**
 * GET /api/admin/stories/[id] - Get single story
 * PATCH /api/admin/stories/[id] - Update story
 * DELETE /api/admin/stories/[id] - Delete story
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStorySchema = z.object({
  title: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(["pending", "approved"]).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Fetch story error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch story" },
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
    const validation = updateStorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Find existing story
    const existingStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const updateData: any = { ...data };

    // If approving a story, set approval fields
    if (data.status === "approved" && existingStory.status !== "approved") {
      updateData.approvedBy = admin.userId;
      updateData.approvedAt = new Date();
    }

    const story = await prisma.story.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: data.status === "approved" ? "STORY_APPROVED" : "STORY_UPDATED",
        entityType: "story",
        entityId: id,
        details: {
          changes: data,
          oldStatus: existingStory.status,
          newStatus: data.status,
        },
      },
    });

    return NextResponse.json({ story });
  } catch (error: any) {
    console.error("Update story error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update story" },
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

    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    await prisma.story.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "STORY_DELETED",
        entityType: "story",
        entityId: id,
        details: {
          title: story.title,
          imageUrl: story.imageUrl,
        },
      },
    });

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error: any) {
    console.error("Delete story error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}
