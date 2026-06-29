/**
 * /dine/[tableId] - Customer Dine-In Page
 * Epic 6 - Scan QR and place dine-in orders
 */

"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Session {
  id: string;
  table: { label: string };
  orders: any[];
  expiresAt: string;
}

export default function DineInPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/dine/session");
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      setSession(data.session);

      // If no session and token in URL, scan automatically
      if (!data.session) {
        const token = searchParams.get("token");
        if (token) {
          await handleScan(token);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (token: string) => {
    setScanning(true);
    try {
      const res = await fetch("/api/dine/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to scan QR");
      }

      const data = await res.json();
      alert(`Welcome to ${data.tableLabel}!`);
      await checkSession();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setScanning(false);
    }
  };

  const handleCheckout = async () => {
    if (!confirm("Close session and checkout?")) return;

    try {
      const res = await fetch("/api/dine/session", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to checkout");
      alert("Session closed. Thank you!");
      setSession(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
          <p className="text-gray-600 mb-6">
            Please scan the QR code on your table to start ordering.
          </p>
          {scanning && <p className="text-blue-600">Scanning...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{session.table.label}</h1>
              <p className="text-sm text-gray-500">
                Session expires: {new Date(session.expiresAt).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Checkout
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Browse Menu</h2>
          <button
            onClick={() => router.push("/menu")}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            View Menu & Order
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
          {session.orders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {session.orders.map((order) => (
                <div key={order.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-orange-600 font-semibold">
                      Rs. {Number(order.total).toFixed(0)}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    {order.orderItems.map((item: any) => (
                      <div key={item.id} className="text-gray-600">
                        {item.item.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Status: <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
