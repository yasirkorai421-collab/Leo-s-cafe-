/**
 * Payment Page - /order/[id]/payment
 * Dual payment options: Cash on Delivery + Online Payment with screenshot
 */

"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";

interface PaymentSettings {
  jazzCashNumber: string;
  easypaisaNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountTitle: string;
  whatsappNumber: string;
}

type PaymentMethodType = "cod" | "online" | null;

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.payment);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleCODSelection = async () => {
    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(`/api/orders/${id}/select-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "cash_on_delivery",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to select payment method");
      }

      router.push(`/order/${id}/track`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  const whatsappLink = settings
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        `Hi, I've placed order #${id.slice(0, 8)} and completed payment. Please find the screenshot attached.`
      )}`
    : "";

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold mb-2">Choose Payment Method</h1>
        <p className="text-muted-foreground mb-8">
          Select how you'd like to pay for your order
        </p>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>{error}</div>
          </div>
        )}

        {/* Payment Method Selection */}
        {selectedMethod === null && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cash on Delivery Option */}
            <button
              onClick={() => setSelectedMethod("cod")}
              className="group rounded-xl border-2 border-border bg-card p-8 text-left hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">
                  💵
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary transition-colors" />
              </div>
              <h3 className="font-bold text-xl mb-2">Cash on Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Pay with cash when your order is delivered to your doorstep
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                No advance payment needed
              </div>
            </button>

            {/* Online Payment Option */}
            <button
              onClick={() => setSelectedMethod("online")}
              className="group rounded-xl border-2 border-border bg-card p-8 text-left hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                  📱
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary transition-colors" />
              </div>
              <h3 className="font-bold text-xl mb-2">Online Payment</h3>
              <p className="text-sm text-muted-foreground">
                Pay via JazzCash, Easypaisa, or Bank Transfer and upload screenshot
              </p>
              <div className="mt-4 inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Quick verification
              </div>
            </button>
          </div>
        )}

        {/* Cash on Delivery Confirmation */}
        {selectedMethod === "cod" && (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl flex-shrink-0">
                💵
              </div>
              <div>
                <h2 className="font-bold text-2xl">Cash on Delivery</h2>
                <p className="text-muted-foreground">Pay when you receive your order</p>
              </div>
            </div>

            <div className="bg-accent rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3">Important Instructions:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary flex-shrink-0">✓</span>
                  <span>Keep exact cash ready to avoid delays</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary flex-shrink-0">✓</span>
                  <span>Our delivery person will collect payment at your doorstep</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary flex-shrink-0">✓</span>
                  <span>You will receive order tracking updates via SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary flex-shrink-0">✓</span>
                  <span>Check your order before making payment</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedMethod(null)}
                className="px-6 py-3 border border-border rounded-full font-semibold hover:bg-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCODSelection}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  "Confirm Cash on Delivery"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Online Payment Flow */}
        {selectedMethod === "online" && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedMethod(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to payment options
            </button>

            {/* Payment Account Details */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl flex-shrink-0">
                  📱
                </div>
                <div>
                  <h2 className="font-bold text-2xl">Make Payment</h2>
                  <p className="text-muted-foreground">Transfer to any of the accounts below</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* JazzCash */}
                <div className="bg-accent rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      JazzCash
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(settings?.jazzCashNumber || "")}
                      className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-full hover:opacity-90"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="font-mono text-xl font-bold">{settings?.jazzCashNumber}</div>
                </div>

                {/* Easypaisa */}
                <div className="bg-accent rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-2xl">💳</span>
                      Easypaisa
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(settings?.easypaisaNumber || "")}
                      className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-full hover:opacity-90"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="font-mono text-xl font-bold">{settings?.easypaisaNumber}</div>
                </div>

                {/* Bank Transfer */}
                <div className="bg-accent rounded-lg p-4">
                  <div className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏦</span>
                    Bank Transfer
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank Name:</span>
                      <span className="font-semibold">{settings?.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{settings?.bankAccountNumber}</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(settings?.bankAccountNumber || "")}
                          className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-90"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account Title:</span>
                      <span className="font-semibold">{settings?.bankAccountTitle}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 w-full rounded-full bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Need Help? Contact on WhatsApp
              </a>
            </div>

            {/* Screenshot Upload */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-xl mb-2">Upload Payment Screenshot</h3>
              <p className="text-sm text-muted-foreground mb-6">
                After completing payment, upload a clear screenshot showing the transaction details.
                Our admin will verify and confirm your order within minutes.
              </p>

              <CldUploadWidget
                uploadPreset="payment_proofs"
                options={{
                  maxFiles: 1,
                  maxFileSize: 5000000,
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                  sources: ["local", "camera"],
                  multiple: false,
                }}
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <button
                    onClick={() => open()}
                    disabled={uploading}
                    className="w-full rounded-xl border-2 border-dashed border-border bg-accent p-8 text-center hover:border-primary hover:bg-accent/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span className="font-medium">Uploading & Submitting...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-5xl mb-3">📸</div>
                        <div className="font-semibold text-lg mb-1">Click to Upload Screenshot</div>
                        <div className="text-sm text-muted-foreground">
                          Maximum file size: 5MB • Formats: JPG, PNG, WebP
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Screenshot
                        </div>
                      </>
                    )}
                  </button>
                )}
              </CldUploadWidget>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Screenshot Guidelines:</p>
                    <ul className="space-y-1 ml-4 list-disc">
                      <li>Make sure transaction ID is clearly visible</li>
                      <li>Amount should match your order total</li>
                      <li>Screenshot should show date and time</li>
                      <li>Image should be clear and readable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
