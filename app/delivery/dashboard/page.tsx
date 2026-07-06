/**
 * Delivery Personnel Dashboard - /delivery/dashboard
 * Manage assigned deliveries
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  total: number;
  deliveryAddress: string;
  deliveryFee: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  customerNotes: string | null;
  user: {
    name: string;
    phone: string;
    email: string;
  };
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

interface Stats {
  total: number;
  pending: number;
  pickedUp: number;
  outForDelivery: number;
  delivered: number;
}

export default function DeliveryDashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    pickedUp: 0,
    outForDelivery: 0,
    delivered: 0,
  });
  const [filter, setFilter] = useState("active"); // active, delivered, all
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading === false) {
      fetchOrders();
    }
  }, [filter, loading]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/delivery/login");
      return;
    }

    // Verify delivery person role
    const { data: dbUser } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.id)
      .single();

    if (dbUser?.role !== "delivery_person") {
      await supabase.auth.signOut();
      router.push("/delivery/login");
      return;
    }

    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const statusParam = filter === "active" 
        ? "" 
        : filter === "delivered" 
        ? "?status=delivered" 
        : "?status=all";

      const res = await fetch(`/api/delivery/orders${statusParam}`);
      const data = await res.json();

      setOrders(data.orders || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/delivery/login");
    toast.success("Logged out successfully");
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryNotes("");
    setShowModal(true);
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: "picked_up",
      confirmed: "picked_up",
      picked_up: "out_for_delivery",
      out_for_delivery: "delivered",
    };
    return statusFlow[currentStatus] || null;
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: "Pending Pickup",
      confirmed: "Ready for Pickup",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
    };
    return labels[status] || status;
  };

  const getActionLabel = (currentStatus: string): string | null => {
    const actions: Record<string, string> = {
      pending: "Mark as Picked Up",
      confirmed: "Mark as Picked Up",
      picked_up: "Mark as Out for Delivery",
      out_for_delivery: "Mark as Delivered",
    };
    return actions[currentStatus] || null;
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    const nextStatus = getNextStatus(selectedOrder.status);
    if (!nextStatus) {
      toast.error("Cannot update status");
      return;
    }

    setUpdating(true);

    try {
      const res = await fetch(`/api/delivery/orders/${selectedOrder.id}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          notes: deliveryNotes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(`Order marked as ${getStatusLabel(nextStatus)}`);
      setShowModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error("Update status error:", error);
      toast.error(error.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      picked_up: "bg-purple-100 text-purple-800",
      out_for_delivery: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return ["pending", "confirmed", "picked_up", "out_for_delivery"].includes(order.status);
    }
    if (filter === "delivered") {
      return order.status === "delivered";
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
                🚚
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold">Delivery Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your deliveries</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchOrders}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                🔄
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.pickedUp}</div>
            <div className="text-xs text-gray-600 mt-1">Picked Up</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.outForDelivery}</div>
            <div className="text-xs text-gray-600 mt-1">Out for Delivery</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs text-gray-600 mt-1">Delivered</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active ({stats.pending + stats.pickedUp + stats.outForDelivery})
          </button>
          <button
            onClick={() => setFilter("delivered")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "delivered"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Delivered ({stats.delivered})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All ({stats.total})
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filter === "active"
                ? "You don't have any active deliveries"
                : filter === "delivered"
                ? "No delivered orders yet"
                : "No orders assigned to you"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">Rs. {order.total}</div>
                    <div className="text-xs text-gray-600">{order.paymentMethod}</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{order.user.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <a href={`tel:${order.user.phone}`} className="ml-2 font-medium text-blue-600 hover:underline">
                        {order.user.phone}
                      </a>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2 font-medium">{order.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-sm">Order Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="font-medium">Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.customerNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-yellow-800 mb-1">Customer Notes:</p>
                    <p className="text-sm text-yellow-900">{order.customerNotes}</p>
                  </div>
                )}

                {/* Action Button */}
                {getNextStatus(order.status) && (
                  <button
                    onClick={() => openOrderModal(order)}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition"
                  >
                    {getActionLabel(order.status)}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold">Update Order Status</h3>
              <p className="text-sm text-gray-600 mt-1">
                Order #{selectedOrder.id.slice(0, 8)}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getNextStatus(selectedOrder.status) || "")}`}>
                    {getStatusLabel(getNextStatus(selectedOrder.status) || "")}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                  placeholder="Add any notes about the delivery..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
