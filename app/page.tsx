"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  // Disable animations if user prefers reduced motion
  const animate = !prefersReducedMotion;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary px-4">
      <motion.main
        className="flex max-w-4xl flex-col items-center gap-8 text-center"
        variants={animate ? containerVariants : {}}
        initial={animate ? "hidden" : undefined}
        animate={animate ? "visible" : undefined}
      >
        <motion.h1
          className="font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          variants={animate ? itemVariants : {}}
        >
          Welcome to Leo's Cafe
        </motion.h1>

        <motion.p
          className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
          variants={animate ? itemVariants : {}}
        >
          Kot Addu's Premier Online Ordering Experience
        </motion.p>

        <motion.p
          className="max-w-xl text-muted-foreground"
          variants={animate ? itemVariants : {}}
        >
          Browse our delicious menu, customize your order, and enjoy fast delivery or dine-in with our QR ordering system.
        </motion.p>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          variants={animate ? itemVariants : {}}
        >
          <Link
            href="/menu"
            className="rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:opacity-90 hover:scale-105 transform"
          >
            Browse Menu
          </Link>
          <Link
            href="/favorites"
            className="rounded-full border border-border px-8 py-3 font-medium transition-colors hover:bg-accent"
          >
            My Favorites ❤️
          </Link>
          <Link
            href="/profile/rewards"
            className="rounded-full border border-border px-8 py-3 font-medium transition-colors hover:bg-accent"
          >
            Rewards
          </Link>
        </motion.div>

        <motion.div
          className="mt-8 grid gap-4 sm:grid-cols-2 w-full"
          variants={animate ? itemVariants : {}}
        >
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">🚚 Delivery</h3>
            <p className="text-sm text-muted-foreground">Fast delivery to your doorstep with real-time tracking</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">📱 Dine-In QR</h3>
            <p className="text-sm text-muted-foreground">Scan QR at your table and order instantly</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">⭐ Loyalty Rewards</h3>
            <p className="text-sm text-muted-foreground">Earn points on every order and redeem for discounts</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2">🎂 Birthday Treats</h3>
            <p className="text-sm text-muted-foreground">Special discounts on your birthday</p>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
