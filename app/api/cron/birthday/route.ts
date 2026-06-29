/**
 * GET /api/cron/birthday
 * Epic 5 - Daily cron job for birthday vouchers
 * CLAUDE.md rule 11: Idempotent - won't issue duplicate vouchers
 * CLAUDE.md rule 10: Transaction for voucher + ledger write
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBatchNotifications } from "@/lib/notificationService";

export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // Find users with birthday today
    const users = await prisma.user.findMany({
      where: {
        birthday: {
          not: null,
        },
      },
    });

    // Filter users with birthday today (month and day match)
    const birthdayUsers = users.filter((user) => {
      if (!user.birthday) return false;
      const birthday = new Date(user.birthday);
      return birthday.getMonth() + 1 === month && birthday.getDate() === day;
    });

    if (birthdayUsers.length === 0) {
      return NextResponse.json({
        message: "No birthdays today",
        count: 0,
      });
    }

    const vouchersIssued = [];
    const notifications = [];

    // Issue vouchers (CLAUDE.md rule 11: idempotent)
    for (const user of birthdayUsers) {
      const result = await prisma.$transaction(async (tx) => {
        // Check if voucher already issued today (idempotency)
        const existingVoucher = await tx.voucher.findFirst({
          where: {
            userId: user.id,
            type: "birthday",
            issuedAt: {
              gte: new Date(today.setHours(0, 0, 0, 0)),
              lte: new Date(today.setHours(23, 59, 59, 999)),
            },
          },
        });

        if (existingVoucher) {
          return { voucher: existingVoucher, alreadyIssued: true };
        }

        // Generate unique code
        const code = `BDAY${user.id.slice(0, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

        // Create voucher
        const voucher = await tx.voucher.create({
          data: {
            userId: user.id,
            code,
            type: "birthday",
            discountType: "percent",
            discountValue: parseFloat(process.env.BIRTHDAY_DISCOUNT || "20"),
            status: "active",
            expiresAt,
          },
        });

        return { voucher, alreadyIssued: false };
      });

      if (!result.alreadyIssued) {
        vouchersIssued.push(result.voucher);
        notifications.push({
          userId: user.id,
          phone: user.phone,
          type: "birthday" as const,
          data: {
            voucherCode: result.voucher.code,
            discount: `${result.voucher.discountValue}%`,
            expiresAt: result.voucher.expiresAt.toLocaleDateString(),
            message: process.env.BIRTHDAY_MESSAGE || "Enjoy your special day!",
          },
        });
      }
    }

    // Send notifications
    await sendBatchNotifications(notifications);

    return NextResponse.json({
      message: "Birthday vouchers processed",
      birthdayCount: birthdayUsers.length,
      vouchersIssued: vouchersIssued.length,
      voucherCodes: vouchersIssued.map((v) => v.code),
    });
  } catch (error: any) {
    console.error("Birthday cron error:", error);
    return NextResponse.json(
      { error: "Failed to process birthdays" },
      { status: 500 }
    );
  }
}
