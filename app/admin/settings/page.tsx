/**
 * /admin/settings - Admin Settings Page
 * Epic 5 - Configure loyalty, birthday, win-back settings
 */

"use client";

import { useEffect, useState } from "react";

interface Settings {
  payment: {
    jazzCashNumber: string;
    easypaisaNumber: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountTitle: string;
    whatsappNumber: string;
  };
  loyalty: {
    pointsPerCurrencyUnit: number;
    redemptionRate: number;
    reviewBonus: number;
  };
  birthday: {
    discount: number;
    validityDays: number;
    message: string;
  };
  winback: {
    thresholdDays: number;
    discount: number;
    validityDays: number;
    message: string;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">Failed to load settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>

        <div className="space-y-8">
          {/* Payment Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">JazzCash Number</label>
                <input
                  type="text"
                  value={settings.payment.jazzCashNumber}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Easypaisa Number</label>
                <input
                  type="text"
                  value={settings.payment.easypaisaNumber}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                <input
                  type="text"
                  value={settings.payment.bankName}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Note: Settings are currently managed via environment variables. Update .env file to change.
            </p>
          </div>

          {/* Loyalty Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Loyalty Settings</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Points Per Rs</label>
                <input
                  type="number"
                  value={settings.loyalty.pointsPerCurrencyUnit}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">How many points earned per Rs spent</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Redemption Rate</label>
                <input
                  type="number"
                  value={settings.loyalty.redemptionRate}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Rs value of 1 point when redeemed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Review Bonus</label>
                <input
                  type="number"
                  value={settings.loyalty.reviewBonus}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded for approved Google reviews</p>
              </div>
            </div>
          </div>

          {/* Birthday Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Birthday Program</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  value={settings.birthday.discount}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Validity (days)</label>
                <input
                  type="number"
                  value={settings.birthday.validityDays}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birthday Message</label>
                <textarea
                  value={settings.birthday.message}
                  disabled
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Win-Back Settings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Win-Back Program</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Inactivity Threshold (days)</label>
                <input
                  type="number"
                  value={settings.winback.thresholdDays}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Days since last order to trigger win-back</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  value={settings.winback.discount}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Validity (days)</label>
                <input
                  type="number"
                  value={settings.winback.validityDays}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Win-Back Message</label>
                <textarea
                  value={settings.winback.message}
                  disabled
                  rows={2}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
