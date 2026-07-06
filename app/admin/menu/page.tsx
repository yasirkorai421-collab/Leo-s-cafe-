/**
 * Admin Menu Management - /admin/menu
 * Manage menu item prices and availability
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

interface PendingChange {
  id: string;
  price?: number;
  isAvailable?: boolean;
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState("");

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
      }

      const res = await fetch(`/api/admin/menu?${params}`);
      const data = await res.json();
      setMenuItems(data.menuItems || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setTempPrice(item.price.toString());
  };

  const handlePriceSave = (itemId: string) => {
    const newPrice = parseFloat(tempPrice);
    
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const changes = new Map(pendingChanges);
    const existing = changes.get(itemId) || { id: itemId };
    existing.price = newPrice;
    changes.set(itemId, existing);
    
    setPendingChanges(changes);
    setEditingId(null);
    
    // Update local state for immediate UI feedback
    setMenuItems(menuItems.map(item =>
      item.id === itemId ? { ...item, price: newPrice } : item
    ));
  };

  const handlePriceCancel = () => {
    setEditingId(null);
    setTempPrice("");
  };

  const toggleAvailability = (item: MenuItem) => {
    const newAvailability = !item.isAvailable;
    
    const changes = new Map(pendingChanges);
    const existing = changes.get(item.id) || { id: item.id };
    existing.isAvailable = newAvailability;
    changes.set(item.id, existing);
    
    setPendingChanges(changes);
    
    // Update local state for immediate UI feedback
    setMenuItems(menuItems.map(i =>
      i.id === item.id ? { ...i, isAvailable: newAvailability } : i
    ));
  };

  const handleSaveAll = async () => {
    if (pendingChanges.size === 0) {
      toast.error("No changes to save");
      return;
    }

    if (!confirm(`Save ${pendingChanges.size} changes to menu items?`)) return;

    setSaving(true);
    try {
      const updates = Array.from(pendingChanges.values());
      
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes");
      }

      toast.success(data.message || "Changes saved successfully");
      setPendingChanges(new Map());
      fetchMenu();
    } catch (error: any) {
      console.error("Save changes error:", error);
      toast.error(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardAll = () => {
    if (pendingChanges.size === 0) return;
    
    if (!confirm(`Discard ${pendingChanges.size} pending changes?`)) return;
    
    setPendingChanges(new Map());
    fetchMenu(); // Reload to reset UI
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasPendingChange = (itemId: string) => pendingChanges.has(itemId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Menu Management</h1>
              <p className="text-gray-600">Update prices and manage item availability</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchMenu}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                🔄 Refresh
              </button>
              {pendingChanges.size > 0 && (
                <>
                  <button
                    onClick={handleDiscardAll}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition"
                  >
                    Discard ({pendingChanges.size})
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : `Save All (${pendingChanges.size})`}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Pending Changes Notice */}
        {pendingChanges.size > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 mb-1">
                  You have {pendingChanges.size} unsaved change{pendingChanges.size > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-yellow-800">
                  Click "Save All" to apply changes or "Discard" to cancel.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">No menu items found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition ${
                        hasPendingChange(item.id) ? "bg-yellow-50" : ""
                      }`}
                    >
                      {/* Item */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {item.category.name}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              step="0.01"
                              min="0"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handlePriceSave(item.id);
                                if (e.key === "Escape") handlePriceCancel();
                              }}
                            />
                            <button
                              onClick={() => handlePriceSave(item.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handlePriceCancel}
                              className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">Rs. {Number(item.price).toFixed(0)}</span>
                            {hasPendingChange(item.id) && (
                              <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                Changed
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Availability */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            item.isAvailable
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {item.isAvailable ? "✓ Available" : "✗ Unavailable"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handlePriceEdit(item)}
                          disabled={editingId !== null}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          Edit Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {menuItems.filter((i) => i.isAvailable).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Available</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {menuItems.filter((i) => !i.isAvailable).length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Unavailable</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{pendingChanges.size}</div>
            <div className="text-xs text-gray-600 mt-1">Pending Changes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
