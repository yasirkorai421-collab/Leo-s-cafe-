/**
 * Admin Dashboard - /admin
 * Real-time analytics and data overview
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AnalyticsData {
  orderCount: number;
  totalRevenue: number;
  pendingVerification: number;
  activeOrders: number;
  totalCustomers: number;
  todayOrders: number;
  todayRevenue: number;
  topItems: Array<{ name: string; totalQuantity: number; imageUrl?: string }>;
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    customerName: string;
    customerPhone: string;
    itemCount: number;
  }>;
  monthlyRevenue: Record<string, number>;
}

const statusColors: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
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

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const analyticsData = await res.json();
      setData(analyticsData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Dashboard Unavailable
          </h2>
          <p className="text-red-600 text-sm mb-2 font-mono bg-red-50 rounded px-3 py-2">
            {error}
          </p>
          <p className="text-gray-500 text-sm mb-4">
            This usually means the database connection is not configured. Check
            your DATABASE_URL in .env.local
          </p>
          <button
            onClick={() => { setLoading(true); fetchAnalytics(); }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const avgOrderValue =
    data.orderCount > 0 ? data.totalRevenue / data.orderCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time data from your database
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · Last updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAnalytics(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* Today's Highlights */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <p className="text-orange-100 text-sm font-medium mb-3">
          📅 Today&apos;s Highlights
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-3xl font-bold">{data.todayOrders}</div>
            <div className="text-orange-200 text-sm">Orders Today</div>
          </div>
          <div>
            <div className="text-3xl font-bold">
              Rs. {data.todayRevenue.toLocaleString()}
            </div>
            <div className="text-orange-200 text-sm">Revenue Today</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            {data.activeOrders > 0 && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {data.activeOrders} active
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {data.orderCount}
          </div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            Rs. {data.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            {data.pendingVerification > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                Action Needed
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {data.pendingVerification}
          </div>
          <div className="text-sm text-gray-500">Pending Verification</div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {data.totalCustomers}
          </div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              🕐 Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No orders yet
              </div>
            ) : (
              data.recentOrders.slice(0, 8).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 mt-0.5 truncate">
                      {order.customerName}{" "}
                      <span className="text-gray-400">
                        · {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 ml-3">
                    Rs. {order.total.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling + Quick Actions */}
        <div className="space-y-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                🔥 Top Selling Items
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {data.topItems.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No sales data yet
                </div>
              ) : (
                data.topItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">
                      {item.totalQuantity} sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                ⚡ Quick Actions
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                {
                  href: "/admin/orders",
                  emoji: "📦",
                  label: "Orders",
                  color: "orange",
                  badge: data.pendingVerification > 0 ? data.pendingVerification : null,
                },
                {
                  href: "/admin/menu",
                  emoji: "🍕",
                  label: "Menu",
                  color: "blue",
                  badge: null,
                },
                {
                  href: "/admin/customers",
                  emoji: "👥",
                  label: "Customers",
                  color: "green",
                  badge: null,
                },
                {
                  href: "/admin/reservations",
                  emoji: "📅",
                  label: "Reservations",
                  color: "purple",
                  badge: null,
                },
                {
                  href: "/admin/delivery-personnel",
                  emoji: "🚚",
                  label: "Delivery",
                  color: "teal",
                  badge: null,
                },
                {
                  href: "/admin/settings",
                  emoji: "⚙️",
                  label: "Settings",
                  color: "gray",
                  badge: null,
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="relative flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-orange-50 hover:border-orange-200 border border-gray-100 transition-all group"
                >
                  {action.badge && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {action.badge}
                    </span>
                  )}
                  <span className="text-2xl mb-1">{action.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-700">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-base font-bold text-gray-900 mb-4">
          📊 Summary Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              Rs.{" "}
              {avgOrderValue.toLocaleString("en-PK", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg. Order Value</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {data.activeOrders}
            </div>
            <div className="text-xs text-gray-500 mt-1">Active Orders</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {data.orderCount > 0
                ? (
                    (data.recentOrders.filter(
                      (o) => o.status === "delivered"
                    ).length /
                      Math.min(data.recentOrders.length, 10)) *
                    100
                  ).toFixed(0)
                : 0}
              %
            </div>
            <div className="text-xs text-gray-500 mt-1">Delivery Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {data.totalCustomers}
            </div>
            <div className="text-xs text-gray-500 mt-1">Registered Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
