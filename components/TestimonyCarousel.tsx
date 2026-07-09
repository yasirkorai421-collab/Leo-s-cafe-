"use client";

import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Ahmed Khan",
    role: "Regular Customer",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop",
    quote:
      "Best pizza in Kot Addu! The Leo's Special is loaded with toppings and always arrives hot. I've been ordering here for over a year now.",
  },
  {
    name: "Fatima Iqbal",
    role: "Local Resident",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop",
    quote:
      "Their zinger burger is crispy and fresh every time. Great taste, good portions, and the staff is always friendly. Highly recommend!",
  },
  {
    name: "Hassan Ali",
    role: "Food Enthusiast",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop",
    quote:
      "Quality food at reasonable prices. The chicken shawarma and pasta are my favorites. Perfect spot for late-night cravings.",
  },
];

export default function TestimonyCarousel() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="max-w-2xl mx-auto text-center mt-12 px-4">
      {/* Avatar */}
      <div className="relative inline-block mb-8 w-24 h-24">
        <Image
          src={testimonials[current].img}
          alt={testimonials[current].name}
          fill
          sizes="96px"
          className="rounded-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        {/* Quote badge — explicitly circular per spec */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold leading-none z-10"
          style={{ background: "var(--color-accent)" }}
          aria-hidden="true"
        >
          &ldquo;
        </div>
      </div>

      {/* Quote */}
      <p className="text-lg italic leading-relaxed mb-6" style={{ color: "var(--color-body-gray)" }}>
        &ldquo;{testimonials[current].quote}&rdquo;
      </p>

      {/* Name & role */}
      <h3 className="font-heading font-bold text-black text-xl mb-1">
        {testimonials[current].name}
      </h3>
      <p className="text-sm" style={{ color: "var(--color-label-gray)" }}>
        {testimonials[current].role}
      </p>

      {/* Dot indicators */}
      <div className="flex justify-center space-x-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Testimonial ${i + 1}`}
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              background: i === current ? "var(--color-accent)" : "var(--color-border-light)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
