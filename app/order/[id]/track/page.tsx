/**
 * Track Order Page - /order/[id]/track
 * Epic 2 - Order tracking with ownership check
 */

import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;
  
  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please log in</h1>
          <p className="text-muted-foreground">You need to be logged in to track orders</p>
        </div>
      </div>
    );
  }

  // Fetch order with ownership check
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      orderItems: {
        include: {
          item: { select: { name: true, imageUrl: true } },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const statusSteps = [
    { key: "pending_payment", label: "Pending Payment" },
    { key: "payment_submitted", label: "Payment Submitted" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold mb-6">Track Order</h1>

        {/* Order Status */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-1">Order ID</div>
            <div className="font-mono text-sm">{order.id.slice(0, 16)}...</div>
          </div>

          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <div>
                    <div
                      className={`font-medium ${
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.item.name} x {item.quantity}
                </span>
                <span>Rs. {(Number(item.itemPrice) * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>Rs. {Number(order.total).toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="rounded-lg border border-border bg-card p-6 mt-6">
          <h2 className="font-semibold mb-2">Delivery Address</h2>
          <p className="text-muted-foreground">{order.deliveryAddress}</p>
        </div>
      </div>
    </div>
  );
}
