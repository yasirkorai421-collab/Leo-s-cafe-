/**
 * /admin/settings - Admin Settings Page
 * Epic 5 - Configure loyalty, birthday, win-back settings
 */

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      
      toast.success("Settings saved successfully!");
      setEditMode(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof Settings, key: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load settings</p>
          <button 
            onClick={fetchSettings}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-1">System Settings</h1>
              <p className="text-muted-foreground">Configure payments, loyalty, and rewards</p>
            </div>
            <div className="flex gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      fetchSettings();
                    }}
                    className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Edit Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8 max-w-4xl">
          {/* Payment Settings */}
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <h2 className="text-xl font-semibold mb-4">💳 Payment Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">JazzCash Number</label>
                <input
                  type="text"
                  value={settings.payment.jazzCashNumber}
                  onChange={(e) => updateSetting('payment', 'jazzCashNumber', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Easypaisa Number</label>
                <input
                  type="text"
                  value={settings.payment.easypaisaNumber}
                  onChange={(e) => updateSetting('payment', 'easypaisaNumber', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.payment.whatsappNumber}
                  onChange={(e) => updateSetting('payment', 'whatsappNumber', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="+92 XXX XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Name</label>
                <input
                  type="text"
                  value={settings.payment.bankName}
                  onChange={(e) => updateSetting('payment', 'bankName', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Bank Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Bank Account Number</label>
                <input
                  type="text"
                  value={settings.payment.bankAccountNumber}
                  onChange={(e) => updateSetting('payment', 'bankAccountNumber', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Account Title</label>
                <input
                  type="text"
                  value={settings.payment.bankAccountTitle}
                  onChange={(e) => updateSetting('payment', 'bankAccountTitle', e.target.value)}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Account Holder Name"
                />
              </div>
            </div>
          </div>

          {/* Loyalty Settings */}
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <h2 className="text-xl font-semibold mb-4">🎁 Loyalty Program</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Points Per Rs. 100</label>
                <input
                  type="number"
                  value={settings.loyalty.pointsPerCurrencyUnit}
                  onChange={(e) => updateSetting('loyalty', 'pointsPerCurrencyUnit', parseFloat(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-muted-foreground mt-1">How many points earned per Rs. 100 spent</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Redemption Rate (Rs per point)</label>
                <input
                  type="number"
                  value={settings.loyalty.redemptionRate}
                  onChange={(e) => updateSetting('loyalty', 'redemptionRate', parseFloat(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="0"
                  step="0.1"
                />
                <p className="text-xs text-muted-foreground mt-1">Rs value of 1 point when redeemed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Google Review Bonus Points</label>
                <input
                  type="number"
                  value={settings.loyalty.reviewBonus}
                  onChange={(e) => updateSetting('loyalty', 'reviewBonus', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="0"
                  step="10"
                />
                <p className="text-xs text-muted-foreground mt-1">Points awarded for approved Google reviews</p>
              </div>
            </div>
          </div>

          {/* Birthday Settings */}
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <h2 className="text-xl font-semibold mb-4">🎂 Birthday Rewards</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Birthday Discount (%)</label>
                <input
                  type="number"
                  value={settings.birthday.discount}
                  onChange={(e) => updateSetting('birthday', 'discount', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="0"
                  max="100"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Voucher Validity (days)</label>
                <input
                  type="number"
                  value={settings.birthday.validityDays}
                  onChange={(e) => updateSetting('birthday', 'validityDays', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Birthday Message</label>
                <textarea
                  value={settings.birthday.message}
                  onChange={(e) => updateSetting('birthday', 'message', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Happy Birthday message..."
                />
              </div>
            </div>
          </div>

          {/* Win-Back Settings */}
          <div className="bg-card p-6 rounded-lg shadow border border-border">
            <h2 className="text-xl font-semibold mb-4">🎯 Win-Back Campaign</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Inactivity Threshold (days)</label>
                <input
                  type="number"
                  value={settings.winback.thresholdDays}
                  onChange={(e) => updateSetting('winback', 'thresholdDays', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-muted-foreground mt-1">Days since last order to trigger win-back</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Win-Back Discount (%)</label>
                <input
                  type="number"
                  value={settings.winback.discount}
                  onChange={(e) => updateSetting('winback', 'discount', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="0"
                  max="100"
                  step="5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Voucher Validity (days)</label>
                <input
                  type="number"
                  value={settings.winback.validityDays}
                  onChange={(e) => updateSetting('winback', 'validityDays', parseInt(e.target.value))}
                  disabled={!editMode}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Win-Back Message</label>
                <textarea
                  value={settings.winback.message}
                  onChange={(e) => updateSetting('winback', 'message', e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="We miss you message..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
