/**
 * GET /api/admin/analytics
 * Real analytics data from the database
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    // Order volume and revenue (exclude pending_payment orders)
    const orders = await prisma.order.findMany({
      where: { status: { not: "pending_payment" } },
      select: { total: true, status: true, createdAt: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = orders.length;

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt) >= todayStart
    );
    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    // Pending verification count
    const pendingVerification = await prisma.order.count({
      where: { paymentStatus: "screenshot_uploaded" },
    });

    // Active orders count
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          in: ["confirmed", "preparing", "ready", "out_for_delivery"],
        },
      },
    });

    // Total customers
    const totalCustomers = await prisma.user.count({
      where: { role: "user" },
    });

    // Top selling items
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ["itemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topItems = await Promise.all(
      topItemsRaw.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.itemId },
          select: { name: true, imageUrl: true },
        });
        return {
          name: menuItem?.name || "Unknown Item",
          imageUrl: menuItem?.imageUrl || null,
          totalQuantity: item._sum.quantity || 0,
        };
      })
    );

    // Recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      where: { status: { not: "pending_payment" } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, phone: true } },
        orderItems: { select: { quantity: true } },
      },
    });

    // Monthly revenue breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: "pending_payment" },
      },
      select: { total: true, createdAt: true },
    });

    // Group by month
    const monthlyRevenue: Record<string, number> = {};
    monthlyOrders.forEach((o) => {
      const month = new Date(o.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(o.total);
    });

    return NextResponse.json({
      orderCount,
      totalRevenue,
      pendingVerification,
      activeOrders,
      totalCustomers,
      todayOrders: todayOrders.length,
      todayRevenue,
      topItems,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt,
        customerName: o.user.name,
        customerPhone: o.user.phone,
        itemCount: o.orderItems.reduce((sum, i) => sum + i.quantity, 0),
      })),
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error("Analytics error:", error);

    if (error.message === "UNAUTHORIZED" || error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error.message },
      { status: 500 }
    );
  }
}
