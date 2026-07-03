/**
 * POST /api/review-claims - Submit Google review claim
 * Epic 5 - Google Review Rewards
 * CLAUDE.md rule 5: Requires admin approval before points credit
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const claimSchema = z.object({
  evidenceUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    const validation = claimSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error },
        { status: 400 }
      );
    }

    const { evidenceUrl } = validation.data;

    // Check if user already has a pending or approved claim
    const existingClaim = await prisma.reviewPointClaim.findFirst({
      where: {
        userId,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You already have a pending or approved claim" },
        { status: 400 }
      );
    }

    const claim = await prisma.reviewPointClaim.create({
      data: {
        userId,
        evidenceUrl,
        status: "pending",
      },
    });

    return NextResponse.json({
      message: "Review claim submitted successfully",
      claim,
    });
  } catch (error: any) {
    console.error("Review claim submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit review claim" },
      { status: 500 }
    );
  }
}
