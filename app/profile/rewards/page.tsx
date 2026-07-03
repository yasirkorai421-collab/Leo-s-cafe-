/**
 * /profile/rewards - Customer Rewards Page
 * Epic 5 - View loyalty points, vouchers, and submit review claims
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface LoyaltyData {
  balance: number;
  ledger: {
    id: string;
    type: string;
    points: number;
    description: string;
    createdAt: string;
  }[];
  vouchers: {
    id: string;
    code: string;
    type: string;
    discountType: string;
    discountValue: number;
    status: string;
    expiresAt: string;
  }[];
  reviewClaim: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

export default function RewardsPage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const res = await fetch("/api/profile/rewards");
      if (!res.ok) throw new Error("Failed to fetch rewards");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Failed to load rewards data");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemPoints = async () => {
    const pointsStr = prompt("How many points would you like to redeem?");
    if (!pointsStr) return;

    const points = parseInt(pointsStr);
    if (isNaN(points) || points <= 0) {
      alert("Please enter a valid number");
      return;
    }

    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pointsToRedeem: points }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Redemption failed");
      }

      const result = await res.json();
      alert(`Success! Discount: Rs. ${result.discountAmount}. New balance: ${result.newBalance} points`);
      fetchRewardsData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmitReviewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/review-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidenceUrl: evidenceUrl || undefined }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Submission failed");
      }

      alert("Review claim submitted successfully!");
      setEvidenceUrl("");
      fetchRewardsData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">Failed to load rewards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">My Rewards</h1>

        {/* Loyalty Points Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Loyalty Points</h2>
              <p className="text-4xl font-bold text-orange-600 mt-2">{data.balance}</p>
            </div>
            <button
              onClick={handleRedeemPoints}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              disabled={data.balance === 0}
            >
              Redeem Points
            </button>
          </div>
        </div>

        {/* Vouchers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Vouchers</h2>
          {data.vouchers.length === 0 ? (
            <p className="text-gray-500">No vouchers available</p>
          ) : (
            <div className="space-y-3">
              {data.vouchers.map((voucher) => (
                <div key={voucher.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-lg font-bold">{voucher.code}</p>
                      <p className="text-sm text-gray-600 capitalize">{voucher.type.replace("_", " ")}</p>
                      <p className="text-sm">
                        {voucher.discountType === "percent" ? `${voucher.discountValue}% OFF` : `Rs. ${voucher.discountValue} OFF`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          voucher.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {voucher.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Expires: {new Date(voucher.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Review Claim */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Google Review Bonus</h2>
          {data.reviewClaim ? (
            <div className="border p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status: <span className="font-semibold capitalize">{data.reviewClaim.status}</span></p>
              <p className="text-xs text-gray-500 mt-2">
                Submitted: {new Date(data.reviewClaim.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReviewClaim} className="space-y-4">
              <p className="text-sm text-gray-600">
                Leave us a Google review and earn bonus points! Submit the link to your review below.
              </p>
              <input
                type="url"
                placeholder="https://g.page/r/... (optional)"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Review Claim"}
              </button>
            </form>
          )}
        </div>

        {/* Points History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Points History</h2>
          {data.ledger.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {data.ledger.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{entry.description}</p>
                    <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-semibold ${entry.points > 0 ? "text-green-600" : "text-red-600"}`}>
                    {entry.points > 0 ? "+" : ""}{entry.points}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
