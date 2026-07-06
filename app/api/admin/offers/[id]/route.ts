/**
 * GET /api/admin/offers/[id] - Get single offer
 * PATCH /api/admin/offers/[id] - Update offer
 * DELETE /api/admin/offers/[id] - Delete offer
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateOfferSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  termsAndConditions: z.string().optional().nullable(),
  discountType: z.enum(["percentage", "fixed_amount"]).optional(),
  discountValue: z.number().positive().optional(),
  code: z.string().optional().nullable(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        updater: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ offer });
  } catch (error: any) {
    console.error("Fetch offer error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch offer" },
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
    const validation = updateOfferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Find existing offer
    const existingOffer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Validate date range if both dates provided
    if (data.startsAt || data.endsAt) {
      const startsAt = data.startsAt
        ? new Date(data.startsAt)
        : existingOffer.startsAt;
      const endsAt = data.endsAt ? new Date(data.endsAt) : existingOffer.endsAt;

      if (endsAt <= startsAt) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Check if code is unique (if changed)
    if (data.code && data.code !== existingOffer.code) {
      const codeExists = await prisma.offer.findUnique({
        where: { code: data.code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Offer code already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      ...data,
      updatedBy: admin.userId,
    };

    if (data.startsAt) {
      updateData.startsAt = new Date(data.startsAt);
    }
    if (data.endsAt) {
      updateData.endsAt = new Date(data.endsAt);
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "OFFER_UPDATED",
        entityType: "offer",
        entityId: id,
        details: {
          changes: data,
        },
      },
    });

    return NextResponse.json({ offer });
  } catch (error: any) {
    console.error("Update offer error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update offer" },
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

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    await prisma.offer.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "OFFER_DELETED",
        entityType: "offer",
        entityId: id,
        details: {
          title: offer.title,
          code: offer.code,
        },
      },
    });

    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error: any) {
    console.error("Delete offer error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}
