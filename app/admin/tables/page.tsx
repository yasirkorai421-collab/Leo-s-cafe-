/**
 * /admin/tables - Admin Tables Management
 * Epic 6 - Manage tables, view sessions, rotate QR codes
 */

"use client";

import { useEffect, useState } from "react";

interface Table {
  id: string;
  label: string;
  qrToken: string;
  qrVersion: number;
  isActive: boolean;
  sessions: any[];
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch("/api/admin/tables");
      if (!res.ok) throw new Error("Failed to fetch tables");
      const data = await res.json();
      setTables(data.tables);
    } catch (error) {
      console.error(error);
      alert("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel }),
      });

      if (!res.ok) throw new Error("Failed to create table");
      
      setNewLabel("");
      await fetchTables();
      alert("Table created successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRotateQR = async (tableId: string) => {
    if (!confirm("Rotate QR code? This will invalidate the old QR.")) return;

    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateQR: true }),
      });

      if (!res.ok) throw new Error("Failed to rotate QR");

      await fetchTables();
      alert("QR code rotated successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleToggleActive = async (tableId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/tables/${tableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) throw new Error("Failed to update table");
      await fetchTables();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getQRCodeURL = (table: Table) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/dine/${table.id}?token=${encodeURIComponent(table.qrToken)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p>Loading tables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Table Management</h1>

        {/* Create Table Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Table</h2>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              placeholder="Table label (e.g., Table 5)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Table"}
            </button>
          </form>
        </div>

        {/* Tables List */}
        <div className="space-y-4">
          {tables.map((table) => (
            <div key={table.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{table.label}</h3>
                  <p className="text-sm text-gray-500">QR Version: {table.qrVersion}</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono break-all">
                    {table.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(table.id, table.isActive)}
                    className={`px-4 py-2 rounded-lg ${
                      table.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {table.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleRotateQR(table.id)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Rotate QR
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              {table.sessions.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Active Session</h4>
                  {table.sessions.map((session) => (
                    <div key={session.id} className="text-sm text-blue-800">
                      <p>Orders: {session.orders.length}</p>
                      <p>
                        Total: Rs.{" "}
                        {session.orders
                          .reduce((sum: number, o: any) => sum + Number(o.total), 0)
                          .toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* QR Code Link */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">QR Code URL:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getQRCodeURL(table)}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-xs font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getQRCodeURL(table));
                      alert("URL copied!");
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tables.length === 0 && (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500">No tables yet. Create one above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
