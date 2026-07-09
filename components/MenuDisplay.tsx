"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { toast } from "react-hot-toast";

interface MenuItem {
  name: string;
  description: string;
  price: string;
  priceSmall?: string;
  priceMedium?: string;
  priceLarge?: string;
  img: string;
  badge?: string;
}

interface MenuDisplayProps {
  categories: string[];
  menuData: Record<string, MenuItem[]>;
}

export default function MenuDisplay({ categories, menuData }: MenuDisplayProps) {
  const [activeTab, setActiveTab] = useState("Pizzas");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSizeModal, setShowSizeModal] = useState(false);
  const items = menuData[activeTab] ?? [];
  const isPizzaTab = activeTab === "Pizzas";
  const { addItem } = useCart();

  const handleAddToCart = (item: MenuItem, size?: 'small' | 'medium' | 'large') => {
    // Check if item has price or needs size selection
    if (item.price === "Ask staff" || item.price === "Varies") {
      toast.error("Please call +92 336 1171626 to order this item");
      return;
    }

    // For pizzas, show size selector if size not provided
    if (isPizzaTab && !size) {
      setSelectedItem(item);
      setSelectedSize('medium');
      setShowSizeModal(true);
      return;
    }

    // Get price based on size or regular price
    let priceValue = 0;
    let sizeLabel = '';
    
    if (isPizzaTab && size) {
      if (size === 'small') {
        priceValue = parseInt(item.priceSmall?.replace(/[^0-9]/g, '') || '0');
        sizeLabel = 'Small';
      } else if (size === 'medium') {
        priceValue = parseInt(item.priceMedium?.replace(/[^0-9]/g, '') || '0');
        sizeLabel = 'Medium';
      } else {
        priceValue = parseInt(item.priceLarge?.replace(/[^0-9]/g, '') || '0');
        sizeLabel = 'Large';
      }
    } else {
      priceValue = parseInt(item.price.replace(/[^0-9]/g, '') || '0');
    }

    if (priceValue === 0) {
      toast.error("Unable to add item");
      return;
    }

    addItem({
      itemId: `${item.name}-${size || 'regular'}`,
      name: size ? `${item.name} (${sizeLabel})` : item.name,
      price: priceValue,
      imageUrl: item.img,
      quantity: 1,
      customizations: size ? { size } : undefined,
    });

    toast.success(`Added ${item.name} to cart!`);
    setShowSizeModal(false);
  };

  return (
    <>
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Info note */}
          <div className="mb-8 text-center">
            <p className="text-sm italic" style={{ color: "var(--color-body-gray)" }}>
              All prices in PKR. Custom toppings available — ask staff about extra cheese, chicken, or sweet corn.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">

            {/* Category Tabs — horizontal scroll on mobile, stacked on desktop */}
            <div className="w-full md:w-1/4 flex-shrink-0">
              {/* Mobile: Horizontal scroll */}
              <div className="md:hidden overflow-x-auto pb-2 mb-6 flex gap-2 snap-x snap-mandatory scrollbar-hide">
                {categories.map((cat) => {
                  const isActive = activeTab === cat;
                  return (
                    <button
                      key={cat}
                      id={`menu-tab-${cat.toLowerCase()}`}
                      onClick={() => setActiveTab(cat)}
                      className="px-6 py-3 text-base font-medium transition-all whitespace-nowrap snap-start flex-shrink-0"
                      style={{
                        background: isActive ? "var(--color-accent)" : "var(--bg-tab-inactive)",
                        color: isActive ? "#ffffff" : "var(--color-heading)",
                        fontWeight: isActive ? 700 : 500,
                        borderRadius: 0,
                        minHeight: '48px',
                        minWidth: 'fit-content',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Desktop: Vertical stack */}
              <div className="hidden md:flex flex-col border border-border-light overflow-hidden">
                {categories.map((cat) => {
                  const isActive = activeTab === cat;
                  return (
                    <button
                      key={cat}
                      id={`menu-tab-${cat.toLowerCase()}-desktop`}
                      onClick={() => setActiveTab(cat)}
                      className="py-4 px-6 text-center text-lg font-medium transition-colors border-b last:border-b-0"
                      style={{
                        background: isActive ? "var(--color-accent)" : "var(--bg-tab-inactive)",
                        color: isActive ? "#ffffff" : "var(--color-heading)",
                        fontWeight: isActive ? 700 : 500,
                        borderColor: "var(--color-border-light)",
                        borderRadius: 0,
                        minHeight: '56px',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="w-full">
              {isPizzaTab && (
                <div className="mb-6 grid grid-cols-3 gap-2 text-center font-bold text-sm">
                  <div className="py-2" style={{ background: "#f5f5f5", color: "#666" }}>SMALL</div>
                  <div className="py-2" style={{ background: "#f9e4d4", color: "#d65813" }}>MEDIUM</div>
                  <div className="py-2" style={{ background: "#ffe0e0", color: "#d62828" }}>LARGE</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {items.map((item, idx) => (
                  <article
                    key={idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-4 sm:p-6 transition-shadow hover:shadow-lg relative"
                    style={{ borderColor: "var(--color-border-light)" }}
                  >
                    {item.badge && (
                      <div className="absolute top-3 right-3 bg-accent text-white text-xs px-3 py-1 font-bold uppercase">
                        {item.badge}
                      </div>
                    )}

                    {/* Food photo */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-full relative mx-auto sm:mx-0">
                      <Image
                        src={item.img}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 w-full">
                      <h3
                        className="font-heading font-bold text-xl leading-tight mb-2"
                        style={{ color: "var(--color-heading)" }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-base mb-4" style={{ color: "var(--color-label-gray)" }}>
                        {item.description}
                      </p>

                      {/* Pricing & Add to Cart */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          {isPizzaTab && item.priceSmall ? (
                            <div className="flex gap-3 text-sm font-bold">
                              <span style={{ color: "#666" }}>S: {item.priceSmall}</span>
                              <span style={{ color: "#d65813" }}>M: {item.priceMedium}</span>
                              <span style={{ color: "#d62828" }}>L: {item.priceLarge}</span>
                            </div>
                          ) : (
                            <span
                              className="font-bold text-xl"
                              style={{ color: "var(--color-accent)" }}
                            >
                              {item.price}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white text-base transition-all hover:shadow-lg active:scale-95"
                          style={{ 
                            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                            minHeight: '52px',
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                          </svg>
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {activeTab === "Burgers & Rolls" && (
                <div className="mt-6 p-4 bg-gray-50 border" style={{ borderColor: "var(--color-border-light)" }}>
                  <p className="text-sm italic" style={{ color: "var(--color-body-gray)" }}>
                    Roll pricing varies by filling — ask staff for today's rates. The Tortilla is a regular favourite.
                  </p>
                </div>
              )}

              {activeTab === "Mains & Pasta" && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200">
                    <h4 className="font-bold mb-2" style={{ color: "var(--color-heading)" }}>
                      ✓ Halal, always
                    </h4>
                    <p className="text-sm" style={{ color: "var(--color-body-gray)" }}>
                      Every dish at Leo's is prepared in a fully halal kitchen.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200">
                    <h4 className="font-bold mb-2" style={{ color: "var(--color-heading)" }}>
                      Built for sharing
                    </h4>
                    <p className="text-sm" style={{ color: "var(--color-body-gray)" }}>
                      Mains arrive generously portioned — pair with a side pizza for groups.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Size Selection Modal for Pizzas */}
      {showSizeModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold font-heading mb-1">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>
              <button
                onClick={() => setShowSizeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="mb-6 relative h-48 rounded-lg overflow-hidden">
              <Image
                src={selectedItem.img}
                alt={selectedItem.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>

            <h4 className="font-semibold mb-3 text-lg">Select Size:</h4>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedSize('small')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedSize === 'small'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSize === 'small' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {selectedSize === 'small' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Small</div>
                    <div className="text-sm text-gray-500">Perfect for 1 person</div>
                  </div>
                </div>
                <span className="font-bold text-lg" style={{ color: '#666' }}>
                  {selectedItem.priceSmall}
                </span>
              </button>

              <button
                onClick={() => setSelectedSize('medium')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedSize === 'medium'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSize === 'medium' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {selectedSize === 'medium' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Medium</div>
                    <div className="text-sm text-gray-500">Great for 2-3 people</div>
                  </div>
                </div>
                <span className="font-bold text-lg" style={{ color: '#d65813' }}>
                  {selectedItem.priceMedium}
                </span>
              </button>

              <button
                onClick={() => setSelectedSize('large')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedSize === 'large'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSize === 'large' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {selectedSize === 'large' && (
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Large</div>
                    <div className="text-sm text-gray-500">Feeds 4-5 people</div>
                  </div>
                </div>
                <span className="font-bold text-lg" style={{ color: '#d62828' }}>
                  {selectedItem.priceLarge}
                </span>
              </button>
            </div>

            <button
              onClick={() => handleAddToCart(selectedItem, selectedSize)}
              className="w-full py-3.5 px-4 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
