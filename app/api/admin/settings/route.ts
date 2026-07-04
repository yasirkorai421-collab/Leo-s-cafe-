/**
 * GET/PUT /api/admin/settings
 * Epic 5 - Admin settings management
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import {
  getPaymentSettings,
  getLoyaltySettings,
  getBirthdaySettings,
  getWinbackSettings,
} from "@/lib/settings";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const payment = await getPaymentSettings();
    const loyalty = await getLoyaltySettings();
    const birthday = await getBirthdaySettings();
    const winback = await getWinbackSettings();

    return NextResponse.json({
      payment,
      loyalty,
      birthday,
      winback,
    });
  } catch (error: any) {
    console.error("Fetch settings error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { payment, loyalty, birthday, winback } = body;

    // Check if settings table/record exists
    let settings = await prisma.$queryRaw<any[]>`
      SELECT * FROM "SystemSettings" LIMIT 1
    `.catch(() => null);

    const settingsData = {
      // Payment
      jazzCashNumber: payment?.jazzCashNumber || '',
      easypaisaNumber: payment?.easypaisaNumber || '',
      bankName: payment?.bankName || '',
      bankAccountNumber: payment?.bankAccountNumber || '',
      bankAccountTitle: payment?.bankAccountTitle || '',
      whatsappNumber: payment?.whatsappNumber || '',
      
      // Loyalty
      loyaltyPointsPerCurrency: loyalty?.pointsPerCurrencyUnit || 10,
      loyaltyRedemptionRate: loyalty?.redemptionRate || 1,
      googleReviewBonus: loyalty?.reviewBonus || 200,
      
      // Birthday
      birthdayDiscount: birthday?.discount || 20,
      birthdayValidityDays: birthday?.validityDays || 7,
      birthdayMessage: birthday?.message || 'Happy Birthday! Here\'s a special gift for you!',
      
      // Winback
      winbackThresholdDays: winback?.thresholdDays || 30,
      winbackDiscount: winback?.discount || 15,
      winbackValidityDays: winback?.validityDays || 7,
      winbackMessage: winback?.message || 'We miss you! Come back for a special offer!',
      
      updatedAt: new Date(),
    };

    // If no settings exist, create them
    if (!settings || settings.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "SystemSettings" (
          "jazzCashNumber", "easypaisaNumber", "bankName", 
          "bankAccountNumber", "bankAccountTitle", "whatsappNumber",
          "loyaltyPointsPerCurrency", "loyaltyRedemptionRate", "googleReviewBonus",
          "birthdayDiscount", "birthdayValidityDays", "birthdayMessage",
          "winbackThresholdDays", "winbackDiscount", "winbackValidityDays", "winbackMessage",
          "updatedAt"
        ) VALUES (
          ${settingsData.jazzCashNumber}, ${settingsData.easypaisaNumber}, ${settingsData.bankName},
          ${settingsData.bankAccountNumber}, ${settingsData.bankAccountTitle}, ${settingsData.whatsappNumber},
          ${settingsData.loyaltyPointsPerCurrency}, ${settingsData.loyaltyRedemptionRate}, ${settingsData.googleReviewBonus},
          ${settingsData.birthdayDiscount}, ${settingsData.birthdayValidityDays}, ${settingsData.birthdayMessage},
          ${settingsData.winbackThresholdDays}, ${settingsData.winbackDiscount}, ${settingsData.winbackValidityDays}, ${settingsData.winbackMessage},
          ${settingsData.updatedAt}
        )
      `;
    } else {
      // Update existing settings
      await prisma.$executeRaw`
        UPDATE "SystemSettings" SET
          "jazzCashNumber" = ${settingsData.jazzCashNumber},
          "easypaisaNumber" = ${settingsData.easypaisaNumber},
          "bankName" = ${settingsData.bankName},
          "bankAccountNumber" = ${settingsData.bankAccountNumber},
          "bankAccountTitle" = ${settingsData.bankAccountTitle},
          "whatsappNumber" = ${settingsData.whatsappNumber},
          "loyaltyPointsPerCurrency" = ${settingsData.loyaltyPointsPerCurrency},
          "loyaltyRedemptionRate" = ${settingsData.loyaltyRedemptionRate},
          "googleReviewBonus" = ${settingsData.googleReviewBonus},
          "birthdayDiscount" = ${settingsData.birthdayDiscount},
          "birthdayValidityDays" = ${settingsData.birthdayValidityDays},
          "birthdayMessage" = ${settingsData.birthdayMessage},
          "winbackThresholdDays" = ${settingsData.winbackThresholdDays},
          "winbackDiscount" = ${settingsData.winbackDiscount},
          "winbackValidityDays" = ${settingsData.winbackValidityDays},
          "winbackMessage" = ${settingsData.winbackMessage},
          "updatedAt" = ${settingsData.updatedAt}
      `;
    }

    return NextResponse.json({ success: true, settings: settingsData });
  } catch (error: any) {
    console.error("Update settings error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
