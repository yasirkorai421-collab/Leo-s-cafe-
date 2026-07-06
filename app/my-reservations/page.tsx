/**
 * My Reservations - /my-reservations
 * Customer view of their reservation requests and status
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
}

export default function MyReservationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login?redirect=/my-reservations");
      return;
    }

    setIsAuthenticated(true);
    fetchReservations();
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to cancel reservation");

      toast.success("Reservation cancelled");
      fetchReservations();
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      reviewing: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-gray-600">View and manage your table booking requests</p>
        </div>

        {/* New Reservation Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/reservation")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
          >
            + Make New Reservation
          </button>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">No reservations yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any table reservations</p>
            <button
              onClick={() => router.push("/reservation")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              Make Your First Reservation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{reservation.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        <span>{getStatusIcon(reservation.status)}</span>
                        <span>{reservation.status.toUpperCase()}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Submitted on {new Date(reservation.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Cancel Button - only for pending/reviewing */}
                  {["pending", "reviewing"].includes(reservation.status) && (
                    <button
                      onClick={() => cancelReservation(reservation.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Reservation Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Date</div>
                    <div className="font-semibold">
                      {new Date(reservation.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Time</div>
                    <div className="font-semibold">{reservation.time}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Guests</div>
                    <div className="font-semibold">{reservation.numberOfPeople} people</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">Contact</div>
                    <div className="text-sm text-gray-700">{reservation.phone}</div>
                  </div>
                </div>

                {/* Special Request */}
                {reservation.specialRequest && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 font-semibold uppercase mb-1">
                      Special Request
                    </div>
                    <div className="text-sm text-gray-700">{reservation.specialRequest}</div>
                  </div>
                )}

                {/* Admin Message */}
                {reservation.adminMessage && (
                  <div
                    className={`p-4 rounded-lg ${
                      reservation.status === "confirmed"
                        ? "bg-green-50 border border-green-200"
                        : reservation.status === "rejected"
                        ? "bg-red-50 border border-red-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {reservation.status === "confirmed"
                          ? "✅"
                          : reservation.status === "rejected"
                          ? "❌"
                          : "💬"}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">Message from Leo's Café:</div>
                        <div className="text-sm">{reservation.adminMessage}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status-specific messages */}
                {!reservation.adminMessage && (
                  <>
                    {reservation.status === "pending" && (
                      <div className="text-sm text-gray-600 italic">
                        ⏳ Your reservation is pending review. We'll contact you shortly!
                      </div>
                    )}
                    {reservation.status === "reviewing" && (
                      <div className="text-sm text-blue-600 italic">
                        👀 Our team is reviewing your reservation request...
                      </div>
                    )}
                    {reservation.status === "confirmed" && (
                      <div className="text-sm text-green-600 font-semibold">
                        ✅ Your reservation is confirmed! We look forward to seeing you.
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
