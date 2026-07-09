// Service icons with correct semantic meaning
function PizzaIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {/* Pizza slice shape */}
      <path d="M32 32 L8 56 L32 8 L56 56 Z" strokeLinejoin="round" />
      {/* Pepperoni dots */}
      <circle cx="28" cy="35" r="3" fill="currentColor" />
      <circle cx="36" cy="30" r="3" fill="currentColor" />
      <circle cx="32" cy="45" r="3" fill="currentColor" />
      <circle cx="24" cy="48" r="2.5" fill="currentColor" />
      <circle cx="40" cy="42" r="2.5" fill="currentColor" />
    </svg>
  );
}

function BurgerIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {/* Top bun */}
      <path d="M12 22 Q12 14 20 12 Q32 10 44 12 Q52 14 52 22 L52 26 L12 26 Z" strokeLinejoin="round" />
      {/* Lettuce */}
      <path d="M12 26 L52 26 L50 32 L14 32 Z" fill="none" />
      {/* Patty */}
      <rect x="14" y="32" width="36" height="6" rx="1" />
      {/* Cheese */}
      <path d="M14 38 L50 38 L48 42 L16 42 Z" />
      {/* Bottom bun */}
      <path d="M16 42 L48 42 L48 48 Q48 52 44 52 L20 52 Q16 52 16 48 Z" strokeLinejoin="round" />
      {/* Sesame seeds on top */}
      <circle cx="22" cy="18" r="1.5" fill="currentColor" />
      <circle cx="32" cy="16" r="1.5" fill="currentColor" />
      <circle cx="42" cy="18" r="1.5" fill="currentColor" />
      <circle cx="27" cy="20" r="1.5" fill="currentColor" />
      <circle cx="37" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {/* Clock circle */}
      <circle cx="32" cy="32" r="22" />
      {/* Clock hands */}
      <line x1="32" y1="32" x2="32" y2="18" strokeLinecap="round" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="42" y2="32" strokeLinecap="round" strokeWidth="2.5" />
      {/* Hour markers */}
      <circle cx="32" cy="14" r="1.5" fill="currentColor" />
      <circle cx="32" cy="50" r="1.5" fill="currentColor" />
      <circle cx="50" cy="32" r="1.5" fill="currentColor" />
      <circle cx="14" cy="32" r="1.5" fill="currentColor" />
      {/* Center dot */}
      <circle cx="32" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

const services = [
  {
    icon: <PizzaIcon />,
    title: "Pizza",
    desc: "Our signature loaded pizzas in three sizes with toppings you can customize. From Leo's Special to Peri Peri Chicken.",
  },
  {
    icon: <BurgerIcon />,
    title: "Fast Food",
    desc: "Crispy zinger burgers, grilled sandwiches, chicken shawarma, and a variety of rolls wrapped fresh and hot.",
  },
  {
    icon: <ClockIcon />,
    title: "Open Late",
    desc: "Kitchen runs past midnight most nights. Whether it's lunch or a late-night craving, we're here for you.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20" style={{ background: "var(--bg-section-light)" }}>
      <div className="container mx-auto px-4">
        <div className="section-heading">
          <span className="script-accent">Services</span>
          <h2 className="bold-title">Why Choose Us</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((item, i) => (
            <article key={i} className="text-center">
              <div className="flex items-center justify-center mb-6" style={{ color: "var(--color-accent)" }}>
                {item.icon}
              </div>
              <h3
                className="font-heading font-bold text-2xl mb-4"
                style={{ color: "var(--color-heading)" }}
              >
                {item.title}
              </h3>
              <p className="leading-relaxed text-base" style={{ color: "var(--color-body-gray)" }}>
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
