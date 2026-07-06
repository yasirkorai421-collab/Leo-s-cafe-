/**
 * POST /api/orders/[id]/payment-proof
 * Epic 3 - Submit payment screenshot
 * CLAUDE.md rule 14: Screenshot tied to order, ownership-checked
 */

import { NextResponse } from "next/server";
import { checkOrderOwnership } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentProofSchema = z.object({
  screenshotUrl: z.string().url(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // CLAUDE.md rule 1: Check ownership
    const authResult = await checkOrderOwnership(id);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = paymentProofSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid screenshot URL" },
        { status: 400 }
      );
    }

    const { screenshotUrl } = validation.data;

    // Create payment proof and update order status
    const paymentProof = await prisma.paymentProof.create({
      data: {
        orderId: id,
        screenshotUrl,
        status: "submitted",
      },
    });

    // Update order payment status
    await prisma.order.update({
      where: { id },
      data: {
        paymentMethod: "online_payment",
        paymentStatus: "screenshot_uploaded",
        status: "payment_online",
      },
    });

    return NextResponse.json({ paymentProof }, { status: 201 });
  } catch (error) {
    console.error("Payment proof submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment proof" },
      { status: 500 }
    );
  }
}
