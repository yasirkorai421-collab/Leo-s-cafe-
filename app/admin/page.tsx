/**
 * Admin Dashboard - /admin
 * Epic 4 - Analytics and overview
 */

import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAnalytics() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/analytics`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminDashboard() {
  const data = await getAnalytics();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Failed to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-heading text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage orders, menu, and settings</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Links */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">📦 Orders</h3>
            <p className="text-sm text-muted-foreground">Manage and track orders</p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">👥 Users</h3>
            <p className="text-sm text-muted-foreground">Create & manage accounts</p>
          </Link>
          <Link
            href="/admin/customers"
            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">🎁 Customers</h3>
            <p className="text-sm text-muted-foreground">Loyalty & birthdays</p>
          </Link>
          <Link
            href="/admin/settings"
            className="rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold text-lg mb-2">⚙️ Settings</h3>
            <p className="text-sm text-muted-foreground">Configure system</p>
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Orders</div>
            <div className="text-3xl font-bold">{data.orderCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Revenue</div>
            <div className="text-3xl font-bold">Rs. {data.totalRevenue.toFixed(0)}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Pending Verification</div>
            <div className="text-3xl font-bold text-orange-600">{data.pendingVerification}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-2">Avg. Order Value</div>
            <div className="text-3xl font-bold">
              Rs. {data.orderCount > 0 ? (data.totalRevenue / data.orderCount).toFixed(0) : 0}
            </div>
          </div>
        </div>

        {/* Top Items */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold text-xl mb-4">Top Selling Items</h2>
          <div className="space-y-3">
            {data.topItems.map((item: any) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.totalQuantity} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
