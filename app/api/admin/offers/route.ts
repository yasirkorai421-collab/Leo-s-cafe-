/**
 * GET /api/admin/offers - List all offers
 * POST /api/admin/offers - Create new offer
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOfferSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Valid image URL required"),
  termsAndConditions: z.string().optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().positive("Discount value must be positive"),
  code: z.string().optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {};

    if (status === "active") {
      whereClause.isActive = true;
      whereClause.endsAt = { gte: new Date() };
    } else if (status === "expired") {
      whereClause.endsAt = { lt: new Date() };
    } else if (status === "inactive") {
      whereClause.isActive = false;
    }

    const offers = await prisma.offer.findMany({
      where: whereClause,
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
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate statistics
    const stats = {
      total: offers.length,
      active: offers.filter((o) => o.isActive && o.endsAt >= new Date()).length,
      expired: offers.filter((o) => o.endsAt < new Date()).length,
      featured: offers.filter((o) => o.isFeatured && o.isActive).length,
    };

    return NextResponse.json({ offers, stats });
  } catch (error: any) {
    console.error("Fetch offers error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const validation = createOfferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Validate date range
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (endsAt <= startsAt) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check if code is unique (if provided)
    if (data.code) {
      const existingOffer = await prisma.offer.findUnique({
        where: { code: data.code },
      });

      if (existingOffer) {
        return NextResponse.json(
          { error: "Offer code already exists" },
          { status: 400 }
        );
      }
    }

    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        termsAndConditions: data.termsAndConditions,
        discountType: data.discountType,
        discountValue: data.discountValue,
        code: data.code || null,
        startsAt,
        endsAt,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        createdBy: admin.userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        action: "OFFER_CREATED",
        entityType: "offer",
        entityId: offer.id,
        details: {
          title: offer.title,
          code: offer.code,
        },
      },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error: any) {
    console.error("Create offer error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}
