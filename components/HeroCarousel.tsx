"use client";

import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=2070&fit=crop",
    script: "Feliciano",
    subtitle: "BEST RESTAURANT",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&fit=crop",
    script: "Feliciano",
    subtitle: "NUTRITIOUS & TASTY",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&fit=crop",
    script: "Feliciano",
    subtitle: "DELICIOUS SPECIALTIES",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next]);

  return (
    <section
      className="relative h-[88vh] min-h-[600px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={slide.img}
            alt={slide.subtitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 mt-16">
        <span
          className="font-script text-accent block"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.1 }}
        >
          {slides[current].script}
        </span>
        <h1
          className="font-heading font-bold text-white uppercase mt-3"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", letterSpacing: "3px" }}
        >
          {slides[current].subtitle}
        </h1>
      </div>

      {/* Arrow — Prev */}
      <button
        onClick={() => { prev(); setPaused(true); }}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors text-4xl font-thin select-none"
      >
        ‹
      </button>

      {/* Arrow — Next */}
      <button
        onClick={() => { next(); setPaused(true); }}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white transition-colors text-4xl font-thin select-none"
      >
        ›
      </button>
    </section>
  );
}
