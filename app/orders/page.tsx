/**
 * Orders Page - /orders
 * View all user orders with status
 */

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/auth/login?redirect=/orders");
  }

  const userId = authUser.id;

  // Get user from database using Supabase auth ID
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground">Please complete your profile</p>
        </div>
      </div>
    );
  }

  // Fetch all orders for the user
  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    include: {
      orderItems: {
        include: {
          item: { select: { name: true, imageUrl: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
      case "preparing":
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "payment_whatsapp":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">My Orders</h1>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Order Again
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start ordering your favorite food from Leo's Café
            </p>
            <Link
              href="/menu"
              className="inline-block rounded-full bg-primary px-6 py-2 text-primary-foreground hover:opacity-90"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Order #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div
                    className={`mt-2 sm:mt-0 inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.orderItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.item.name} x {item.quantity}
                      </span>
                      <span>Rs. {(Number(item.itemPrice) * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{order.orderItems.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="font-bold">
                    Total: Rs. {Number(order.total).toFixed(0)}
                  </div>
                  <Link
                    href={`/order/${order.id}/track`}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
