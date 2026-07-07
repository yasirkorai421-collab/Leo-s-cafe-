/**
 * POST /api/orders/[id]/payment-proof
 * Epic 3 - Submit payment screenshot
 * CLAUDE.md rule 14: Screenshot tied to order, ownership-checked
 */

import { NextResponse } from "next/server";
import { checkOrderOwnership } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const paymentProofSchema = z.object({
  screenshotUrl: z.string().url(),
});

/**
 * Generate a hash of the screenshot URL for duplicate detection
 * Uses the Cloudinary public ID (unique identifier)
 */
function getScreenshotHash(url: string): string {
  try {
    // Extract Cloudinary public ID from URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234/payment_proofs/abc123.jpg
    // Public ID: payment_proofs/abc123
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    const publicId = match ? match[1] : url;
    
    // Create SHA-256 hash of the public ID
    return crypto.createHash('sha256').update(publicId).digest('hex');
  } catch (error) {
    // Fallback to hashing the full URL
    return crypto.createHash('sha256').update(url).digest('hex');
  }
}

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
    const screenshotHash = getScreenshotHash(screenshotUrl);

    // SECURITY: Check for duplicate screenshot usage
    const existingProof = await prisma.paymentProof.findFirst({
      where: {
        screenshotUrl,
        orderId: {
          not: id, // Allow re-uploading for the same order
        },
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (existingProof) {
      // Log security incident
      console.warn("[SECURITY] Duplicate screenshot detected:", {
        screenshotHash,
        currentOrder: id,
        existingOrder: existingProof.orderId,
        currentUser: authResult.userId,
        existingUser: existingProof.order.userId,
      });

      // Check if it's the same user (might be accidental)
      if (existingProof.order.userId === authResult.userId) {
        return NextResponse.json(
          { 
            error: "This screenshot has already been used for another order. Please upload a unique screenshot.",
            code: "DUPLICATE_SCREENSHOT_SAME_USER"
          },
          { status: 400 }
        );
      }

      // Different user - potential fraud
      return NextResponse.json(
        { 
          error: "This payment screenshot has already been submitted. Please upload a valid, unique screenshot.",
          code: "DUPLICATE_SCREENSHOT_FRAUD"
        },
        { status: 400 }
      );
    }

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
    
    // Don't leak internal error details in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to submit payment proof" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to submit payment proof", details: (error as Error).message },
      { status: 500 }
    );
  }
}
