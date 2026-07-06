/**
 * Admin Reservations - /admin/reservations
 * Manage table bookings with status updates and custom messages
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequest: string | null;
  status: string;
  adminMessage: string | null;
  createdAt: string;
  user: {
    name: string;
    phone: string;
    email: string | null;
  };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReservations();
  }, [filter]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations?status=${filter}`);
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setNewStatus(reservation.status);
    setAdminMessage(reservation.adminMessage || "");
    setShowModal(true);
  };

  const updateReservationStatus = async () => {
    if (!selectedReservation) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/reservations/${selectedReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminMessage: adminMessage.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to update reservation");

      toast.success("Reservation updated successfully");
      fetchReservations();
      setShowModal(false);
      setSelectedReservation(null);
      setAdminMessage("");
    } catch (error) {
      console.error("Failed to update reservation:", error);
      toast.error("Failed to update reservation");
    } finally {
      setUpdating(false);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reservation?")) return;

    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete reservation");

      toast.success("Reservation deleted");
      fetchReservations();
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      toast.error("Failed to delete reservation");
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedIds.size === 0) {
      toast.error("Please select reservations to update");
      return;
    }

    const message = prompt(`Enter a message for all ${selectedIds.size} selected reservations (optional):`);
    if (message === null) return; // User cancelled

    try {
      const res = await fetch(`/api/admin/reservations/bulk-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationIds: Array.from(selectedIds),
          status,
          adminMessage: message.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to bulk update");

      toast.success(`${selectedIds.size} reservations updated`);
      setSelectedIds(new Set());
      fetchReservations();
    } catch (error) {
      console.error("Failed to bulk update:", error);
      toast.error("Failed to bulk update");
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === reservations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reservations.map((r) => r.id)));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      reviewing: "👀",
      confirmed: "✅",
      rejected: "❌",
      cancelled: "🚫",
    };
    return icons[status] || "📋";
  };

  const filterButtons = [
    { value: "all", label: "All Reservations" },
    { value: "pending", label: "Pending" },
    { value: "reviewing", label: "Reviewing" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rejected", label: "Rejected" },
  ];

  const upcomingReservations = reservations.filter((r) => {
    const reservationDate = new Date(r.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservationDate >= today && r.status === "confirmed";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Reservation Management</h1>
              <p className="text-gray-600">Review and manage table booking requests</p>
            </div>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">
              {reservations.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">
              {reservations.filter((r) => r.status === "reviewing").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Reviewing</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600">
              {reservations.filter((r) => r.status === "confirmed").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Confirmed</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{upcomingReservations.length}</div>
            <div className="text-sm text-gray-600 mt-1">Upcoming</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-red-600">
              {reservations.filter((r) => r.status === "rejected").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 justify-between">
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

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                <button
                  onClick={() => bulkUpdateStatus("confirmed")}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Confirm All
                </button>
                <button
                  onClick={() => bulkUpdateStatus("rejected")}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Reject All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No reservations found</h3>
            <p className="text-gray-600">There are no reservations matching your filter</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === reservations.length && reservations.length > 0}
                        onChange={selectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Guests
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Request
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(reservation.id)}
                          onChange={() => toggleSelection(reservation.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{reservation.name}</div>
                        <div className="text-sm text-gray-600">{reservation.phone}</div>
                        <div className="text-xs text-gray-500">{reservation.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">
                          {new Date(reservation.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-600">{reservation.time}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-2xl">👥</span>
                          <span className="font-semibold text-gray-900">{reservation.numberOfPeople}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          <span>{getStatusIcon(reservation.status)}</span>
                          <span>{reservation.status.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {reservation.specialRequest ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-700 line-clamp-2">{reservation.specialRequest}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No special requests</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openUpdateModal(reservation)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => deleteReservation(reservation.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Update Reservation</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Reservation Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Customer</div>
                    <div className="font-semibold">{selectedReservation.name}</div>
                    <div className="text-sm text-gray-600">{selectedReservation.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Date & Time</div>
                    <div className="font-semibold">
                      {new Date(selectedReservation.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">{selectedReservation.time}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Party Size</div>
                    <div className="font-semibold">{selectedReservation.numberOfPeople} guests</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Current Status</div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedReservation.status
                      )}`}
                    >
                      {selectedReservation.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {selectedReservation.specialRequest && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Special Request</div>
                    <div className="text-sm">{selectedReservation.specialRequest}</div>
                  </div>
                )}
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Update Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {["pending", "reviewing", "confirmed", "rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        newStatus === status
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getStatusIcon(status)}</span>
                        <span className="font-semibold capitalize">{status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Message */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message to Customer{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="Enter a custom message for the customer..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {adminMessage.length}/500 characters
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={updateReservationStatus}
                  disabled={updating}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Reservation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
