import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if admin
    const admin = await prisma.user.findUnique({
      where: { clerkId: authUser.id },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { points, reason } = await request.json();

    if (typeof points !== "number" || !reason) {
      return NextResponse.json(
        { error: "Invalid request. Provide points (number) and reason (string)" },
        { status: 400 }
      );
    }

    const customerId = params.id;

    // Grant loyalty points
    await prisma.$transaction([
      prisma.loyaltyLedger.create({
        data: {
          userId: customerId,
          type: "adjustment",
          points,
          description: `Admin adjustment: ${reason}`,
          createdBy: admin.id,
        },
      }),
      prisma.user.update({
        where: { id: customerId },
        data: {
          loyaltyBalance: { increment: points },
        },
      }),
    ]);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "LOYALTY_ADJUSTMENT",
        entityType: "user",
        entityId: customerId,
        details: {
          points,
          reason,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${points > 0 ? "Granted" : "Deducted"} ${Math.abs(points)} points`,
    });
  } catch (error) {
    console.error("Failed to adjust loyalty points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
