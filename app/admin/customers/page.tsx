"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  birthday: string | null;
  loyaltyBalance: number;
  googleReviewSubmitted: boolean;
  lastOrderAt: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers);
    } catch (error) {
      toast.error("Failed to load customers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendBirthdayWish = async (customerId: string, customerName: string) => {
    if (!confirm(`Send birthday wish to ${customerName}?`)) return;

    try {
      const res = await fetch(`/api/admin/customers/${customerId}/birthday-wish`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to send");
      toast.success("Birthday wish sent!");
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to send birthday wish");
    }
  };

  const grantLoyaltyPoints = async (customerId: string, customerName: string) => {
    const points = prompt(`Enter loyalty points to grant to ${customerName}:`);
    if (!points || isNaN(Number(points))) return;

    const reason = prompt("Enter reason for adjustment:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/customers/${customerId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: Number(points), reason }),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success(`Granted ${points} points!`);
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to grant points");
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
        <p className="text-gray-600">View and manage all registered customers</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">{customers.length}</div>
          <div className="text-sm text-gray-600">Total Customers</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {customers.filter((c) => c.googleReviewSubmitted).length}
          </div>
          <div className="text-sm text-gray-600">Google Reviews</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-purple-600">
            {customers.reduce((sum, c) => sum + c.loyaltyBalance, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Loyalty Points</div>
        </div>
        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">
            {customers.reduce((sum, c) => sum + c._count.orders, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birthday</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loyalty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Google Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const isBirthdayToday = customer.birthday
                  ? new Date(customer.birthday).toDateString() === new Date().toDateString()
                  : false;

                return (
                  <tr key={customer.id} className={isBirthdayToday ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.role === "admin" && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.phone}</div>
                      <div className="text-sm text-gray-500">{customer.email || "No email"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.birthday ? (
                        <div className="text-sm">
                          <div>{new Date(customer.birthday).toLocaleDateString()}</div>
                          {isBirthdayToday && (
                            <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-xs">
                              🎂 Today!
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-purple-600">{customer.loyaltyBalance}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{customer._count.orders} orders</div>
                      {customer.lastOrderAt && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(customer.lastOrderAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.googleReviewSubmitted ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          ✓ Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                          Not yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {isBirthdayToday && (
                          <button
                            onClick={() => sendBirthdayWish(customer.id, customer.name)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                          >
                            🎂 Send Wish
                          </button>
                        )}
                        <button
                          onClick={() => grantLoyaltyPoints(customer.id, customer.name)}
                          className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                        >
                          + Points
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No customers found matching your search.
        </div>
      )}
    </div>
  );
}
