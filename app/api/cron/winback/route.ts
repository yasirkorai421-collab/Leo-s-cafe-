/**
 * GET /api/cron/winback
 * Epic 5 - Daily cron job for win-back vouchers
 * CLAUDE.md rule 11: Idempotent - won't issue duplicate vouchers
 * CLAUDE.md rule 10: Transaction for voucher + ledger write
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBatchNotifications } from "@/lib/notificationService";

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const winbackThresholdDays = parseInt(process.env.WINBACK_THRESHOLD_DAYS || "30");
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - winbackThresholdDays);

    // Find users who haven't ordered in X days
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastOrderAt: {
          lte: thresholdDate,
          not: null,
        },
      },
    });

    if (inactiveUsers.length === 0) {
      return NextResponse.json({
        message: "No inactive users found",
        count: 0,
      });
    }

    const vouchersIssued = [];
    const notifications = [];

    // Issue vouchers (CLAUDE.md rule 11: idempotent)
    for (const user of inactiveUsers) {
      const result = await prisma.$transaction(async (tx) => {
        // Check if win-back voucher already issued in last 90 days (idempotency)
        const recentVoucher = await tx.voucher.findFirst({
          where: {
            userId: user.id,
            type: "winback",
            issuedAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            },
          },
        });

        if (recentVoucher) {
          return { voucher: recentVoucher, alreadyIssued: true };
        }

        // Generate unique code
        const code = `WINBACK${user.id.slice(0, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + parseInt(process.env.WINBACK_VALIDITY_DAYS || "14")
        );

        // Create voucher
        const voucher = await tx.voucher.create({
          data: {
            userId: user.id,
            code,
            type: "winback",
            discountType: "percent",
            discountValue: parseFloat(process.env.WINBACK_DISCOUNT || "15"),
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
          type: "winback" as const,
          data: {
            voucherCode: result.voucher.code,
            discount: `${result.voucher.discountValue}%`,
            expiresAt: result.voucher.expiresAt.toLocaleDateString(),
            message: process.env.WINBACK_MESSAGE || "We'd love to see you again!",
          },
        });
      }
    }

    // Send notifications
    await sendBatchNotifications(notifications);

    return NextResponse.json({
      message: "Win-back vouchers processed",
      inactiveCount: inactiveUsers.length,
      vouchersIssued: vouchersIssued.length,
      voucherCodes: vouchersIssued.map((v) => v.code),
    });
  } catch (error: any) {
    console.error("Win-back cron error:", error);
    return NextResponse.json(
      { error: "Failed to process win-back" },
      { status: 500 }
    );
  }
}
