"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  end: number;
  label: string;
  suffix?: string;
  prefix?: string;
  formatted?: boolean; // comma-format thousands
}

const stats: Stat[] = [
  { end: 18, label: "Years of Experienced" },
  { end: 100, label: "Menus / Dish" },
  { end: 50, label: "Staff Members" },
  { end: 15000, label: "Happy Customers", formatted: true },
];

function useCountUp(end: number, duration: number, triggered: boolean, formatted?: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!triggered) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [triggered, end, duration]);

  const display = formatted ? value.toLocaleString() : value.toString();
  return display;
}

function StatItem({ stat, triggered }: { stat: Stat; triggered: boolean }) {
  const display = useCountUp(stat.end, 1800, triggered, stat.formatted);

  return (
    <div className="text-center py-8">
      <div
        className="font-heading font-bold mb-3"
        style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)", color: "var(--color-accent)" }}
      >
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div className="text-white text-sm uppercase tracking-widest">{stat.label}</div>
    </div>
  );
}

export default function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16" style={{ background: "var(--color-black)" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} triggered={triggered} />
          ))}
        </div>
      </div>
    </section>
  );
}
