/**
 * MenuItemCard Component
 * Epic 7 - Menu item card with favorites and motion
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  item: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    ratingsAvg: number;
    ratingsCount: number;
  };
  index: number;
}

export function MenuItemCard({ item, index }: MenuItemCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites/${item.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove");
        setIsFavorite(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.id }),
        });
        if (!res.ok) throw new Error("Failed to add");
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg relative"
    >
      <Link href={`/menu/item/${item.slug}`}>
        <div className="aspect-square bg-muted relative">
          <button
            onClick={handleFavoriteToggle}
            disabled={loading}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10 disabled:opacity-50"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {loading ? "..." : isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">
              Rs. {Number(item.price).toFixed(0)}
            </span>
            {item.ratingsCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ⭐ {Number(item.ratingsAvg).toFixed(1)} ({item.ratingsCount})
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
