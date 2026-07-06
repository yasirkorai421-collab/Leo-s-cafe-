/**
 * Admin Stories Management - /admin/stories
 * Manage homepage gallery/story images with approval workflow
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  status: "pending" | "approved";
  sortOrder: number;
  isActive: boolean;
  uploadedBy: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  active: number;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    status: "pending" as "pending" | "approved",
    isActive: true,
  });

  useEffect(() => {
    fetchStories();
  }, [filter]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stories?status=${filter}`);
      const data = await res.json();
      setStories(data.stories || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingStory(null);
    setFormData({
      title: "",
      imageUrl: "",
      status: "pending",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      imageUrl: story.imageUrl,
      status: story.status,
      isActive: story.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        sortOrder: editingStory?.sortOrder || stories.length,
      };

      const url = editingStory
        ? `/api/admin/stories/${editingStory.id}`
        : "/api/admin/stories";
      const method = editingStory ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save story");
      }

      toast.success(editingStory ? "Story updated successfully" : "Story uploaded successfully");
      setShowModal(false);
      fetchStories();
    } catch (error: any) {
      console.error("Save story error:", error);
      toast.error(error.message || "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) throw new Error("Failed to approve story");

      toast.success("Story approved successfully");
      fetchStories();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve story");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete story");

      toast.success("Story deleted successfully");
      fetchStories();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete story");
    }
  };

  const toggleActive = async (story: Story) => {
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !story.isActive }),
      });

      if (!res.ok) throw new Error("Failed to update story");

      toast.success(story.isActive ? "Story hidden" : "Story activated");
      fetchStories();
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update story");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = stories.findIndex((s) => s.id === draggedItem);
    const targetIndex = stories.findIndex((s) => s.id === targetId);

    const newStories = [...stories];
    const [removed] = newStories.splice(draggedIndex, 1);
    newStories.splice(targetIndex, 0, removed);

    setStories(newStories);
    setDraggedItem(null);

    // Save new order
    try {
      const storyIds = newStories.map((s) => s.id);
      const res = await fetch("/api/admin/stories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyIds }),
      });

      if (!res.ok) throw new Error("Failed to reorder");

      toast.success("Stories reordered successfully");
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to reorder stories");
      fetchStories(); // Revert on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">Stories & Gallery</h1>
              <p className="text-gray-600">Manage homepage story images with approval workflow</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchStories}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                🔄 Refresh
              </button>
              <button
                onClick={openCreateModal}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
              >
                + Upload Story
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total Stories</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats.active}</div>
            <div className="text-sm text-gray-600 mt-1">Active</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "approved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && stats.pending > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Drag and drop stories to reorder them. Approved stories appear on the homepage in this order.
          </p>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold mb-2">No stories found</h3>
            <p className="text-gray-600 mb-6">Upload your first story image</p>
            <button
              onClick={openCreateModal}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition"
            >
              + Upload Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                draggable
                onDragStart={() => handleDragStart(story.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, story.id)}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-move ${
                  draggedItem === story.id ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={story.imageUrl}
                    alt={story.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Status Badge */}
                  {story.status === "pending" ? (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-md">
                      ⏳ Pending
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md">
                      ✓ Approved
                    </div>
                  )}
                  {!story.isActive && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded-full shadow-md">
                      Hidden
                    </div>
                  )}
                  {/* Sort Order */}
                  <div className="absolute bottom-3 left-3 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    #{story.sortOrder + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2 truncate">{story.title}</h3>
                  <div className="text-xs text-gray-600 mb-3">
                    Uploaded: {new Date(story.createdAt).toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {story.status === "pending" && (
                      <button
                        onClick={() => handleApprove(story.id)}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        ✓ Approve
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(story)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(story)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          story.isActive
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {story.isActive ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingStory ? "Edit Story" : "Upload New Story"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                  placeholder="Beautiful Cafe Interior"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Recommended: 1080x1920 (portrait) or 1920x1080 (landscape)
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "pending" | "approved" })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="pending">Pending (needs approval)</option>
                  <option value="approved">Approved (publish immediately)</option>
                </select>
              </div>

              {/* Active Toggle */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm font-medium">Active (visible on homepage)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingStory ? "Update Story" : "Upload Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
