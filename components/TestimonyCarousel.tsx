"use client";

import { useState } from "react";

const testimonials = [
  {
    name: "Arturo Guibuge",
    role: "Regular Customer",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&fit=crop",
    quote:
      "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove.",
  },
  {
    name: "Sophia Lennox",
    role: "Food Blogger",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop",
    quote:
      "A small river named Duden flows by their place and supplies it with the necessary regelialia. It is a paradisematic country, in which roasted parts of sentences fly into your mouth.",
  },
  {
    name: "Marcus Wilde",
    role: "Food Critic",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop",
    quote:
      "Even the all-powerful Pointing has no control about the blind texts — it is an almost unorthographic life. One day however a small line of blind text by the name of Lorem Ipsum decided to leave.",
  },
];

export default function TestimonyCarousel() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="max-w-2xl mx-auto text-center mt-12 px-4">
      {/* Avatar */}
      <div className="relative inline-block mb-8">
        <img
          src={testimonials[current].img}
          alt={testimonials[current].name}
          className="w-24 h-24 rounded-full object-cover mx-auto transition-opacity duration-300"
        />
        {/* Quote badge — explicitly circular per spec */}
        <div
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-bold leading-none"
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
