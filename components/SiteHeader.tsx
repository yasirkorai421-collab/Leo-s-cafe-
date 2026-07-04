"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavDrawer from "./NavDrawer";
import { createClient } from "@/utils/supabase/client";

export default function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show header on auth pages if not authenticated
  const isAuthPage = pathname?.startsWith('/auth/');
  
  if (!isAuthenticated && !isAuthPage) {
    return null; // Hide header when not logged in (except on auth pages)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          isScrolled
            ? "bg-black/65 backdrop-blur-md"
            : "bg-black"
        }`}
      >
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="font-heading font-bold text-white text-2xl" onClick={() => setIsMenuOpen(false)}>
            Leo's Café
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-accent font-medium">Home</Link>
            <Link href="/about" className="text-white hover:text-accent font-medium">About</Link>
            <Link href="/menu" className="text-white hover:text-accent font-medium">Menu</Link>
            <Link href="/stories" className="text-white hover:text-accent font-medium">Stories</Link>
            <Link href="/contact" className="text-white hover:text-accent font-medium">Contact</Link>
            <Link
              href="/reservation"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-2 font-bold uppercase text-sm tracking-wider transition-colors"
            >
              Book a table
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden flex items-center text-label-gray hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <span className="text-2xl mr-2">✕</span>
            ) : (
              <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            )}
            <span className="uppercase tracking-[2px] font-medium text-sm">Menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <NavDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
