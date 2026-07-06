/**
 * GET /api/admin/stories - List all stories
 * POST /api/admin/stories - Create/upload new story
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().url("Valid image URL required"),
  status: z.enum(["pending", "approved"]).default("pending"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const stories = await prisma.story.findMany({
      where: whereClause,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate statistics
    const stats = {
      total: stories.length,
      pending: stories.filter((s) => s.status === "pending").length,
      approved: stories.filter((s) => s.status === "approved").length,
      active: stories.filter((s) => s.isActive).length,
    };

    return NextResponse.json({ stories, stats });
  } catch (error: any) {
    console.error("Fetch stories error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const validation = createStorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    const story = await prisma.story.create({
      data: {
        title: data.title,
        imageUrl: data.imageUrl,
        status: data.status,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        uploadedBy: admin.userId,
        // Auto-approve if admin sets status as approved
        ...(data.status === "approved" && {
          approvedBy: admin.userId,
          approvedAt: new Date(),
        }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "STORY_CREATED",
        entityType: "story",
        entityId: story.id,
        details: {
          title: story.title,
          status: story.status,
        },
      },
    });

    return NextResponse.json({ story }, { status: 201 });
  } catch (error: any) {
    console.error("Create story error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
