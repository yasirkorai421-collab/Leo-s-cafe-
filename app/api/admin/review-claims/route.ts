/**
 * GET /api/admin/review-claims
 * Epic 5 - List all Google review claims
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const claims = await prisma.reviewPointClaim.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ claims });
  } catch (error: any) {
    console.error("Fetch review claims error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch review claims" },
      { status: 500 }
    );
  }
}
