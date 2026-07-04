"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";

export default function BottomNavBar() {
  const pathname = usePathname();
  const { items } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: "Menu",
      href: "/menu",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      isPrimary: true,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: totalItems,
    },
    {
      name: "Contact",
      href: "/contact",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden"
      style={{
        borderColor: "var(--color-border-light)",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-center justify-around" style={{ height: '72px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center transition-all relative"
              style={{
                width: '72px',
                height: '72px',
                minWidth: '72px',
                minHeight: '72px',
                color: isActive
                  ? "var(--color-accent)"
                  : "var(--color-label-gray)",
              }}
            >
              {/* Primary action (Menu) gets special styling */}
              {item.isPrimary ? (
                <div
                  className="absolute -top-6 flex items-center justify-center rounded-full shadow-xl"
                  style={{
                    width: '64px',
                    height: '64px',
                    background: isActive
                      ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)'
                      : 'linear-gradient(135deg, #c8a87e 0%, #b8956a 100%)',
                  }}
                >
                  <div className="text-white">{item.icon}</div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    {item.icon}
                    {/* Badge for cart */}
                    {item.badge && item.badge > 0 && (
                      <div
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center"
                        style={{
                          width: '18px',
                          height: '18px',
                          minWidth: '18px',
                          fontSize: '10px',
                        }}
                      >
                        {item.badge > 9 ? '9+' : item.badge}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-xs mt-1 font-medium"
                    style={{
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
