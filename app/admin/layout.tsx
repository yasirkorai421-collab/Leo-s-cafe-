/**
 * Admin Layout - Professional dashboard with sidebar navigation
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Orders", href: "/admin/orders", icon: "📦" },
  { name: "Menu", href: "/admin/menu", icon: "🍕" },
  { name: "Reservations", href: "/admin/reservations", icon: "📅" },
  { name: "Tables", href: "/admin/tables", icon: "🪑" },
  { name: "Customers", href: "/admin/customers", icon: "👥" },
  { name: "Users", href: "/admin/users", icon: "🔐" },
  { name: "Delivery", href: "/admin/delivery-personnel", icon: "🚚" },
  { name: "Offers", href: "/admin/offers", icon: "🎁" },
  { name: "Stories", href: "/admin/stories", icon: "📱" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gradient-to-b from-gray-900 to-gray-800 w-64`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center mb-8 px-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
              L
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Leo's Café</h1>
              <p className="text-gray-400 text-xs">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <ul className="space-y-2">
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <span className="text-xl mr-3">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
            >
              <span className="text-xl mr-3">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-gray-600 hover:text-orange-600 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Site
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
