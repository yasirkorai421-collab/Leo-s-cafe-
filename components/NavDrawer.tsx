"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function NavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Menu", href: "/menu" },
    { name: "Stories", href: "/stories" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      {/* Slide-down panel — sits below the 64px header (top-16 md:top-20) */}
      <div
        className="fixed left-0 right-0 z-40 lg:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: "64px",
          maxHeight: isOpen ? "100vh" : "0",
          background: "var(--bg-dark-panel)",
        }}
      >
        <nav className="flex flex-col px-8 pt-4 pb-8">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className="py-[18px] text-xl border-b transition-colors"
                style={{
                  color: isActive ? "#ffffff" : "var(--color-label-gray)",
                  fontWeight: isActive ? 600 : 400,
                  borderColor: "rgba(255,255,255,0.07)",
                }}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="mt-6 mx-4">
            <Link
              href="/reservation"
              onClick={onClose}
              className="block w-full text-white text-center py-4 font-bold uppercase tracking-wider transition-colors"
              style={{ background: "var(--color-accent)" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--color-accent-hover)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.background =
                  "var(--color-accent)")
              }
            >
              Book a table
            </Link>
          </div>
        </nav>
      </div>

      {/* Backdrop to close drawer on outside tap */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ top: "64px" }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
