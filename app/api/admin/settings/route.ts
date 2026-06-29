/**
 * GET/PATCH /api/admin/settings
 * Epic 5 - Admin settings management
 * Note: For now, settings are in env vars. In production, move to database table.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import {
  getPaymentSettings,
  getLoyaltySettings,
  getBirthdaySettings,
  getWinbackSettings,
} from "@/lib/settings";

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

// Note: PATCH endpoint would update database table in production
// For MVP, settings are managed via .env file
