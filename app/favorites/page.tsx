/**
 * /favorites - User Favorites Page
 * Epic 7 - View and manage favorite items
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FavoriteItem {
  id: string;
  createdAt: string;
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    ratingsAvg: number;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error(error);
      alert("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const res = await fetch(`/api/favorites/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove");
      await fetchFavorites();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

        {favorites.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-4">No favorites yet</p>
            <button
              onClick={() => router.push("/menu")}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <div key={fav.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={fav.item.imageUrl}
                  alt={fav.item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{fav.item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {fav.item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-bold">
                      Rs. {Number(fav.item.price).toFixed(0)}
                    </span>
                    {!fav.item.isAvailable && (
                      <span className="text-xs text-red-600">Unavailable</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/menu`)}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                      disabled={!fav.item.isAvailable}
                    >
                      Order
                    </button>
                    <button
                      onClick={() => handleRemove(fav.item.id)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
