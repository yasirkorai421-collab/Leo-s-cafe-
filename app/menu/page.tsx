/**
 * Menu Page - /menu
 * Epic 2 - Browse all menu items with search and filters
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering since we need database access
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  // Fetch all categories and items
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const items = await prisma.menuItem.findMany({
    where: { isActive: true, isAvailable: true },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { ratingsAvg: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-heading text-4xl font-bold">Our Menu</h1>
          <p className="text-muted-foreground">Browse our delicious offerings</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Categories */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu/${category.slug}`}
                className="rounded-lg border border-border bg-card p-4 text-center transition-colors hover:bg-accent"
              >
                <div className="font-medium">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">All Items</h2>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/menu/item/${item.slug}`}
              className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="aspect-square bg-muted"></div>
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
          ))}
        </div>
      </div>
    </div>
  );
}
