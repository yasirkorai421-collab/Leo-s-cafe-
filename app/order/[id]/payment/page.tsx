/**
 * Payment Page - /order/[id]/payment
 * Epic 3 - WhatsApp screenshot payment flow
 */

"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { getPaymentSettings } from "@/lib/settings";
import { CldUploadWidget } from "next-cloudinary";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Fetch payment settings (will be server-side in production)
  const [settings] = useState({
    jazzCashNumber: "03001234567",
    easypaisaNumber: "03001234567",
    bankName: "HBL",
    bankAccountNumber: "1234567890123",
    bankAccountTitle: "Leo's Cafe",
    whatsappNumber: "923001234567",
  });

  const handleUploadSuccess = async (result: any) => {
    try {
      setUploading(true);
      setError("");

      const response = await fetch(`/api/orders/${id}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenshotUrl: result.info.secure_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment proof");
      }

      router.push(`/order/${id}/track`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    `Hi, I've placed order #${id.slice(0, 8)} and completed payment. Please find the screenshot attached.`
  )}`;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-heading text-3xl font-bold mb-6">Complete Payment</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            {error}
          </div>
        )}

        {/* Payment Instructions */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="font-semibold text-xl mb-4">Payment Methods</h2>

          <div className="space-y-4">
            {/* JazzCash */}
            <div>
              <div className="font-medium text-primary">JazzCash</div>
              <div className="font-mono text-lg">{settings.jazzCashNumber}</div>
            </div>

            {/* Easypaisa */}
            <div>
              <div className="font-medium text-primary">Easypaisa</div>
              <div className="font-mono text-lg">{settings.easypaisaNumber}</div>
            </div>

            {/* Bank Transfer */}
            <div>
              <div className="font-medium text-primary">Bank Transfer</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Bank:</span> {settings.bankName}
                </div>
                <div>
                  <span className="text-muted-foreground">Account:</span>{" "}
                  <span className="font-mono">{settings.bankAccountNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Title:</span> {settings.bankAccountTitle}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700 mb-6"
        >
          📱 Contact on WhatsApp
        </a>

        {/* Screenshot Upload */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold text-lg mb-4">Upload Payment Screenshot</h2>
          <p className="text-sm text-muted-foreground mb-4">
            After completing payment, upload a screenshot as proof. Our team will verify and
            confirm your order.
          </p>

          <CldUploadWidget
            uploadPreset="payment_proofs"
            options={{
              maxFiles: 1,
              maxFileSize: 5000000,
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
              sources: ["local", "camera"],
            }}
            onSuccess={handleUploadSuccess}
          >
            {({ open }) => (
              <button
                onClick={() => open()}
                disabled={uploading}
                className="w-full rounded-lg border-2 border-dashed border-border bg-accent p-8 text-center hover:border-primary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <div className="text-4xl mb-2">📸</div>
                    <div className="font-medium">Click to upload screenshot</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Max 5MB • JPG, PNG, WebP
                    </div>
                  </>
                )}
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
}
