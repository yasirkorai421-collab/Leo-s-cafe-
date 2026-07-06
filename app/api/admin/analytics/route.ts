/**
 * GET /api/admin/analytics
 * Epic 4 - Dashboard stats
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    // Order volume and revenue
    const orders = await prisma.order.findMany({
      where: { status: { not: "pending_payment" } },
      select: { total: true, status: true, createdAt: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;

    // Pending verification count
    const pendingVerification = await prisma.order.count({
      where: { paymentStatus: "screenshot_uploaded" },
    });

    // Top selling items
    const topItems = await prisma.orderItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.itemId },
          select: { name: true, imageUrl: true },
        });
        return {
          ...menuItem,
          totalQuantity: item._sum.quantity || 0,
        };
      })
    );

    return NextResponse.json({
      orderCount,
      totalRevenue,
      pendingVerification,
      topItems: topItemsWithDetails,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
