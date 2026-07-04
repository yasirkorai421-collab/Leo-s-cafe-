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

    const customerId = params.id;

    // Get customer details
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Create birthday voucher (20% discount, valid for 7 days)
    const voucherCode = `BDAY${Date.now().toString().slice(-6)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const voucher = await prisma.voucher.create({
      data: {
        userId: customerId,
        code: voucherCode,
        type: "birthday",
        discountType: "percent",
        discountValue: 20,
        status: "active",
        expiresAt,
      },
    });

    // Grant bonus loyalty points (100 points)
    await prisma.$transaction([
      prisma.loyaltyLedger.create({
        data: {
          userId: customerId,
          type: "birthday_bonus",
          points: 100,
          description: "Birthday bonus points! Happy Birthday! 🎂",
          createdBy: admin.id,
        },
      }),
      prisma.user.update({
        where: { id: customerId },
        data: {
          loyaltyBalance: { increment: 100 },
          birthdayNotificationSent: new Date(),
        },
      }),
    ]);

    // In production, you would send an actual SMS/email here
    // For now, we'll just log it
    console.log(`
🎂 BIRTHDAY WISH SENT TO ${customer.name}
Phone: ${customer.phone}
Message: 
Happy Birthday ${customer.name}! 🎉
Celebrate with Leo's Café!

Your special gifts:
🎁 20% OFF voucher: ${voucherCode}
🎁 100 Loyalty Points added
✨ Valid for 7 days

Order now: ${process.env.NEXT_PUBLIC_SITE_URL}/menu

Thank you for being part of our family! 💖
    `);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "BIRTHDAY_WISH_SENT",
        entityType: "user",
        entityId: customerId,
        details: {
          voucherCode,
          pointsGranted: 100,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Birthday wish sent!",
      voucher: {
        code: voucherCode,
        discount: "20%",
        expiresAt,
      },
      pointsGranted: 100,
    });
  } catch (error) {
    console.error("Failed to send birthday wish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
