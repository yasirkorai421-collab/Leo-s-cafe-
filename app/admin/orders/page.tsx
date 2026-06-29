/**
 * Admin Orders - /admin/orders
 * Epic 4 - Order management
 */

"use client";

import { useState, useEffect } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const verifyPayment = async (orderId: string, action: "approve" | "reject") => {
    try {
      await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchOrders();
    } catch (error) {
      console.error("Failed to verify payment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-heading text-4xl font-bold">Orders</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter */}
        <div className="mb-6 flex gap-2">
          {["all", "payment_submitted", "confirmed", "preparing", "ready", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-lg px-4 py-2 text-sm ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders found</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-mono text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </div>
                    <div className="font-semibold">{order.user.name}</div>
                    <div className="text-sm text-muted-foreground">{order.user.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">Rs. {Number(order.total).toFixed(0)}</div>
                    <div className="text-sm">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="text-sm mb-4">
                  {order.orderItems.map((item: any) => (
                    <div key={item.id}>
                      {item.item.name} x {item.quantity}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {order.paymentStatus === "submitted" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => verifyPayment(order.id, "approve")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={() => verifyPayment(order.id, "reject")}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Reject Payment
                    </button>
                  </div>
                )}

                {order.status === "confirmed" && (
                  <button
                    onClick={() => updateStatus(order.id, "preparing")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                  >
                    Mark as Preparing
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                  >
                    Mark as Ready
                  </button>
                )}

                {order.status === "ready" && (
                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
