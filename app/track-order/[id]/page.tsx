/**
 * Order Tracking Page - /track-order/[id]
 * Real-time order status tracking for customers
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    phone: string;
  };
  deliveryPerson: {
    name: string;
    phone: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      name: string;
      image: string | null;
    };
  }>;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: "📝" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready", label: "Ready", icon: "🎉" },
  { key: "picked_up", label: "Picked Up", icon: "📦" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✨" },
];

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found");
        } else if (res.status === 401) {
          setError("Please login to view this order");
        } else {
          setError("Failed to load order");
        }
        return;
      }

      const data = await res.json();
      setOrder(data.order);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string): number => {
    const index = statusSteps.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      preparing: "bg-purple-500",
      ready: "bg-indigo-500",
      picked_up: "bg-orange-500",
      out_for_delivery: "bg-amber-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-lg">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">{error || "Order Not Found"}</h2>
          <p className="text-gray-600 mb-6">
            {error === "Please login to view this order"
              ? "You need to be logged in to track your order."
              : "The order you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Track Your Order</h1>
              <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg p-8 shadow-lg mb-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>
            
            {/* Timeline */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-8 top-8 bottom-8 w-1 bg-gray-200"></div>
              <div
                className={`absolute left-8 top-8 w-1 ${getStatusColor(order.status)} transition-all duration-500`}
                style={{
                  height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              ></div>

              {/* Steps */}
              <div className="space-y-6">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="relative flex items-center gap-4">
                      {/* Icon */}
                      <div
                        className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                          isCompleted
                            ? `${getStatusColor(order.status)} text-white shadow-lg`
                            : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-4 ring-offset-2 ring-primary/30 scale-110" : ""}`}
                      >
                        {step.icon}
                      </div>

                      {/* Label */}
                      <div className={`flex-1 ${isCurrent ? "font-bold" : ""}`}>
                        <div className={`text-lg ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </div>
                        {isCurrent && (
                          <div className="text-sm text-primary font-semibold mt-1">
                            Current Status
                          </div>
                        )}
                      </div>

                      {/* Checkmark for completed steps */}
                      {isCompleted && !isCurrent && (
                        <div className="text-green-600 text-2xl">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Status Messages */}
            {order.status === "delivered" && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold text-center">
                  🎉 Your order has been delivered! Enjoy your meal!
                </p>
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold text-center">
                  ❌ This order has been cancelled
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>📍</span> Delivery Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Delivery Address:</span>
                  <p className="font-medium mt-1">{order.deliveryAddress}</p>
                </div>
                
                {order.deliveryPerson && (
                  <div>
                    <span className="text-gray-600">Delivery Person:</span>
                    <p className="font-medium mt-1">{order.deliveryPerson.name}</p>
                    <p className="text-primary text-sm">{order.deliveryPerson.phone}</p>
                  </div>
                )}

                {order.customerNotes && (
                  <div>
                    <span className="text-gray-600">Your Notes:</span>
                    <p className="font-medium mt-1 text-gray-700">{order.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>🍽️</span> Order Summary
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menuItem.name}
                    </span>
                    <span className="font-semibold">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>Rs. {order.total - order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Delivery Fee</span>
                    <span>Rs. {order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">Rs. {order.total}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-semibold ${
                      order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white rounded-lg p-6 shadow-lg mt-6">
            <h3 className="font-bold text-lg mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <a
                href="tel:+923001234567"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-2xl">📞</span>
                <div>
                  <div className="font-semibold">Call Us</div>
                  <div className="text-xs text-gray-600">Customer Support</div>
                </div>
              </a>
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-semibold">WhatsApp</div>
                  <div className="text-xs text-gray-600">Chat with us</div>
                </div>
              </a>
              <button
                onClick={() => router.push("/contact")}
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
              >
                <span className="text-2xl">📧</span>
                <div>
                  <div className="font-semibold">Contact Form</div>
                  <div className="text-xs text-gray-600">Send us a message</div>
                </div>
              </button>
            </div>
          </div>

          {/* Auto-refresh notice */}
          <div className="text-center text-sm text-gray-500 mt-6">
            This page refreshes automatically every 10 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
