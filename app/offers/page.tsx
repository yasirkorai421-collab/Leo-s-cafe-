/**
 * Customer Offers Page - /offers
 * Display active promotional offers
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  termsAndConditions: string | null;
  discountType: string;
  discountValue: number;
  code: string | null;
  startsAt: string;
  endsAt: string;
  isFeatured: boolean;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/offers");
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const getDiscountDisplay = (offer: Offer) => {
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    }
    return `Rs. ${offer.discountValue} OFF`;
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Offer code copied!");
  };

  const viewDetails = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const featuredOffers = offers.filter((o) => o.isFeatured);
  const regularOffers = offers.filter((o) => !o.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-2">🎁 Special Offers</h1>
          <p className="text-center text-gray-600">
            Exclusive deals and discounts just for you!
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-lg max-w-md mx-auto">
            <div className="text-6xl mb-4">🎈</div>
            <h3 className="text-xl font-semibold mb-2">No Active Offers</h3>
            <p className="text-gray-600">Check back soon for exciting deals!</p>
          </div>
        ) : (
          <>
            {/* Featured Offers */}
            {featuredOffers.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-400"></div>
                  <h2 className="text-2xl font-bold text-center">⭐ Featured Offers ⭐</h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-400"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onViewDetails={viewDetails}
                      onCopyCode={copyCode}
                      getDaysRemaining={getDaysRemaining}
                      getDiscountDisplay={getDiscountDisplay}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Offers */}
            {regularOffers.length > 0 && (
              <div>
                {featuredOffers.length > 0 && (
                  <h2 className="text-2xl font-bold text-center mb-6">All Offers</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onViewDetails={viewDetails}
                      onCopyCode={copyCode}
                      getDaysRemaining={getDaysRemaining}
                      getDiscountDisplay={getDiscountDisplay}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        {offers.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-primary to-orange-600 rounded-lg p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl font-bold mb-3">Ready to Order?</h3>
            <p className="mb-6">Browse our delicious menu and apply these offers at checkout!</p>
            <a
              href="/menu"
              className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              View Menu →
            </a>
          </div>
        )}
      </div>

      {/* Offer Details Modal */}
      {showModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Image */}
            <div className="relative h-64 bg-gray-200">
              <Image
                src={selectedOffer.imageUrl}
                alt={selectedOffer.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
              {selectedOffer.isFeatured && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-yellow-500 text-white font-bold rounded-full shadow-lg">
                  ⭐ FEATURED
                </div>
              )}
              <div className="absolute top-4 right-4 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-full shadow-lg text-lg">
                {getDiscountDisplay(selectedOffer)}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition shadow-lg"
                style={{ right: "auto", left: "auto", marginLeft: "auto" }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-4">{selectedOffer.title}</h2>
              <p className="text-gray-700 mb-6 text-lg">{selectedOffer.description}</p>

              {/* Offer Code */}
              {selectedOffer.code && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-orange-100 rounded-lg border-2 border-dashed border-primary">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Use Offer Code:</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-4 py-3 bg-white rounded-lg font-mono text-2xl font-bold text-primary">
                      {selectedOffer.code}
                    </div>
                    <button
                      onClick={() => copyCode(selectedOffer.code!)}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              {selectedOffer.termsAndConditions && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 text-gray-900">Terms & Conditions:</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedOffer.termsAndConditions}
                  </p>
                </div>
              )}

              {/* Validity */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-900">Offer Validity:</h3>
                <div className="text-sm text-blue-800">
                  <div>
                    From: {new Date(selectedOffer.startsAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div>
                    Until: {new Date(selectedOffer.endsAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-2 font-semibold text-blue-900">
                    {getDaysRemaining(selectedOffer.endsAt)} days remaining!
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <a
                href="/menu"
                className="block w-full py-3 bg-gradient-to-r from-primary to-orange-600 text-white text-center rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
              >
                Order Now & Use This Offer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Offer Card Component
function OfferCard({
  offer,
  onViewDetails,
  onCopyCode,
  getDaysRemaining,
  getDiscountDisplay,
  featured = false,
}: {
  offer: Offer;
  onViewDetails: (offer: Offer) => void;
  onCopyCode: (code: string) => void;
  getDaysRemaining: (endDate: string) => number;
  getDiscountDisplay: (offer: Offer) => string;
  featured?: boolean;
}) {
  const daysRemaining = getDaysRemaining(offer.endsAt);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden ${
        featured ? "ring-2 ring-yellow-400" : ""
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <Image
          src={offer.imageUrl}
          alt={offer.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {featured && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-md">
            ⭐ FEATURED
          </div>
        )}
        <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-md">
          {getDiscountDisplay(offer)}
        </div>
        {daysRemaining <= 3 && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
            🔥 {daysRemaining} days left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

        {/* Offer Code */}
        {offer.code && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Use Code:</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-sm font-bold text-primary">
                {offer.code}
              </div>
              <button
                onClick={() => onCopyCode(offer.code!)}
                className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:opacity-90 transition"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => onViewDetails(offer)}
          className="w-full py-2 bg-gradient-to-r from-primary to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
