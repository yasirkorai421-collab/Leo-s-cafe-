// Server component - no animations, real values rendered directly in HTML for SEO
interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  formatted?: boolean;
}

const stats: Stat[] = [
  { value: 18, label: "Years of Experience" },
  { value: 100, label: "Menus / Dish" },
  { value: 50, label: "Staff Members" },
  { value: 15000, label: "Happy Customers", formatted: true },
];

function StatItem({ stat }: { stat: Stat }) {
  const display = stat.formatted ? stat.value.toLocaleString() : stat.value.toString();

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
  return (
    <section className="py-16" style={{ background: "var(--color-black)" }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
