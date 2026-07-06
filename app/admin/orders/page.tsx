/**
 * Admin Orders - /admin/orders
 * Enhanced order management with payment verification and status tracking
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  total: number;
  deliveryAddress: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  user: {
    name: string;
    phone: string;
    email: string | null;
  };
  deliveryPerson: {
    name: string;
  } | null;
  orderItems: Array<{
    id: string;
    quantity: number;
    itemPrice: number;
    item: {
      name: string;
      imageUrl: string;
    };
  }>;
  paymentProofs: Array<{
    id: string;
    screenshotUrl: string;
    status: string;
    uploadedAt: string;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [assigningDelivery, setAssigningDelivery] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersonnel();
  }, [filter]);

  const fetchDeliveryPersonnel = async () => {
    try {
      const res = await fetch("/api/admin/delivery-personnel");
      const data = await res.json();
      setDeliveryPersonnel(
        (data.deliveryPersonnel || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          phone: p.phone,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch delivery personnel:", error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const openAssignModal = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPerson(order.deliveryPerson?.name || "");
    setShowAssignModal(true);
  };

  const assignDeliveryPerson = async () => {
    if (!selectedOrder || !selectedDeliveryPerson) return;

    setAssigningDelivery(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/assign-delivery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryPersonId: selectedDeliveryPerson }),
      });

      if (!res.ok) throw new Error("Failed to assign delivery person");
      
      toast.success("Delivery person assigned successfully");
      setShowAssignModal(false);
      fetchOrders();
    } catch (error) {
      console.error("Failed to assign delivery:", error);
      toast.error("Failed to assign delivery person");
    } finally {
      setAssigningDelivery(false);
    }
  };

  const verifyPayment = async (orderId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to verify payment");
      
      toast.success(`Payment ${action === "approve" ? "approved" : "rejected"}`);
      fetchOrders();
      setShowPaymentProof(false);
    } catch (error) {
      console.error("Failed to verify payment:", error);
      toast.error("Failed to verify payment");
    }
  };

  const confirmCOD = async (orderId: string) => {
    if (!confirm("Confirm this Cash on Delivery order?")) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-cod`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to confirm order");
      
      toast.success("COD order confirmed");
      fetchOrders();
    } catch (error) {
      console.error("Failed to confirm order:", error);
      toast.error("Failed to confirm order");
    }
  };

  const updateAdminNotes = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (!res.ok) throw new Error("Failed to update notes");
      
      toast.success("Notes updated");
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update notes:", error);
      toast.error("Failed to update notes");
    }
  };

  const viewPaymentProof = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentProof(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: "bg-gray-100 text-gray-800",
      payment_cod: "bg-yellow-100 text-yellow-800",
      payment_online: "bg-orange-100 text-orange-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-indigo-100 text-indigo-800",
      picked_up: "bg-cyan-100 text-cyan-800",
      out_for_delivery: "bg-teal-100 text-teal-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodBadge = (method: string | null) => {
    if (!method) return null;
    if (method === "cash_on_delivery") {
      return <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">COD</span>;
    }
    return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Online</span>;
  };

  const filterButtons = [
    { value: "all", label: "All Orders" },
    { value: "payment_cod", label: "COD" },
    { value: "payment_online", label: "Online Payment" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Order Management</h1>
              <p className="text-gray-600">Review payments, manage order status, and track deliveries</p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  filter === btn.value
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{orders.filter(o => o.paymentStatus === "screenshot_uploaded").length}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Verification</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === "confirmed" || o.status === "preparing").length}</div>
            <div className="text-sm text-gray-600 mt-1">In Progress</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{orders.filter(o => o.status === "out_for_delivery").length}</div>
            <div className="text-sm text-gray-600 mt-1">Out for Delivery</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{orders.filter(o => o.status === "delivered").length}</div>
            <div className="text-sm text-gray-600 mt-1">Delivered Today</div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-gray-600">There are no orders matching your filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                      {getPaymentMethodBadge(order.paymentMethod)}
                      {order.paymentStatus === "screenshot_uploaded" && (
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium animate-pulse">
                          ⚠️ Needs Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <span className="font-semibold ml-2">{order.user.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium ml-2">{order.user.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">Rs. {Number(order.total).toFixed(0)}</div>
                    <div className="text-sm text-gray-600">{order.orderItems.length} items</div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <Image
                            src={item.item.imageUrl}
                            alt={item.item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.item.name}</div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.quantity} × Rs. {Number(item.itemPrice).toFixed(0)}
                          </div>
                        </div>
                        <div className="font-semibold text-sm">
                          Rs. {(Number(item.itemPrice) * item.quantity).toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {order.deliveryAddress && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-xs font-semibold text-blue-900 mb-1">DELIVERY ADDRESS</div>
                    <div className="text-sm text-blue-800">{order.deliveryAddress}</div>
                  </div>
                )}

                {/* Customer Notes */}
                {order.customerNotes && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xs font-semibold text-yellow-900 mb-1">CUSTOMER NOTES</div>
                    <div className="text-sm text-yellow-800">{order.customerNotes}</div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {/* Payment Verification for Online Payments */}
                  {order.paymentMethod === "online_payment" && order.paymentStatus === "screenshot_uploaded" && (
                    <>
                      <button
                        onClick={() => viewPaymentProof(order)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition text-sm"
                      >
                        🔍 View Payment Proof
                      </button>
                      <button
                        onClick={() => verifyPayment(order.id, "approve")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                      >
                        ✓ Approve Payment
                      </button>
                      <button
                        onClick={() => verifyPayment(order.id, "reject")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm"
                      >
                        ✗ Reject Payment
                      </button>
                    </>
                  )}

                  {/* COD Confirmation */}
                  {order.paymentMethod === "cash_on_delivery" && order.status === "payment_cod" && (
                    <button
                      onClick={() => confirmCOD(order.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                    >
                      ✓ Confirm COD Order
                    </button>
                  )}

                  {/* Status Updates */}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(order.id, "preparing")}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition text-sm"
                    >
                      👨‍🍳 Start Preparing
                    </button>
                  )}

                  {order.status === "preparing" && (
                    <button
                      onClick={() => updateStatus(order.id, "ready")}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-sm"
                    >
                      ✓ Mark as Ready
                    </button>
                  )}

                  {order.status === "ready" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "out_for_delivery")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                      >
                        🚚 Out for Delivery
                      </button>
                      {!order.deliveryPerson && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                        >
                          👤 Assign Delivery Person
                        </button>
                      )}
                    </>
                  )}

                  {/* Assign Delivery Person for any confirmed+ order */}
                  {["confirmed", "preparing"].includes(order.status) && !order.deliveryPerson && (
                    <button
                      onClick={() => openAssignModal(order)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                    >
                      👤 Assign Delivery Person
                    </button>
                  )}

                  {/* Show assigned delivery person */}
                  {order.deliveryPerson && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-800 rounded-lg text-sm font-medium">
                      <span>🚴</span>
                      <span>Assigned to: {order.deliveryPerson.name}</span>
                      <button
                        onClick={() => openAssignModal(order)}
                        className="ml-2 text-green-600 hover:text-green-700 underline text-xs"
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {order.status === "out_for_delivery" && (
                    <button
                      onClick={() => updateStatus(order.id, "delivered")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                    >
                      ✓ Mark as Delivered
                    </button>
                  )}

                  {/* Cancel Order */}
                  {!["delivered", "cancelled"].includes(order.status) && (
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel this order?")) {
                          updateStatus(order.id, "cancelled");
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {showPaymentProof && selectedOrder && selectedOrder.paymentProofs.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Payment Proof - Order #{selectedOrder.id.slice(0, 8)}</h3>
                <button
                  onClick={() => setShowPaymentProof(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <img
                  src={selectedOrder.paymentProofs[0].screenshotUrl}
                  alt="Payment proof"
                  className="w-full rounded-lg border border-gray-200"
                />
                <div className="mt-2 text-sm text-gray-600">
                  Uploaded: {new Date(selectedOrder.paymentProofs[0].uploadedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => verifyPayment(selectedOrder.id, "approve")}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  ✓ Approve Payment
                </button>
                <button
                  onClick={() => verifyPayment(selectedOrder.id, "reject")}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  ✗ Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Person Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Assign Delivery Person</h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Order #{selectedOrder.id.slice(0, 8)}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  Select Delivery Person <span className="text-red-500">*</span>
                </label>
                {deliveryPersonnel.length === 0 ? (
                  <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    No delivery personnel available. Please add delivery personnel first.
                  </div>
                ) : (
                  <select
                    value={selectedDeliveryPerson}
                    onChange={(e) => setSelectedDeliveryPerson(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  >
                    <option value="">Choose a delivery person...</option>
                    {deliveryPersonnel.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.phone}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Both the delivery person and customer will be notified via SMS once assigned.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={assignDeliveryPerson}
                  disabled={!selectedDeliveryPerson || assigningDelivery || deliveryPersonnel.length === 0}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningDelivery ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
