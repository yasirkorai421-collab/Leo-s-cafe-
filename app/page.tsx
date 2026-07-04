import HeroCarousel from "@/components/HeroCarousel";
import StatsCounter from "@/components/StatsCounter";
import ChefCarousel from "@/components/ChefCarousel";
import TestimonyCarousel from "@/components/TestimonyCarousel";
import ReservationForm from "@/components/ReservationForm";
import Image from "next/image";

// ── SVG service icons (outline / thin-line style) ──────────────────────────
function CakeIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 28h40v28H12z" />
      <path d="M20 28v-6a12 12 0 0124 0v6" />
      <circle cx="32" cy="14" r="4" />
      <line x1="32" y1="10" x2="32" y2="6" />
      <path d="M12 40h40M12 52h40" />
    </svg>
  );
}
function MeetingIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="20" cy="22" r="8" />
      <circle cx="44" cy="22" r="8" />
      <path d="M4 54c0-8.837 7.163-16 16-16h8M60 54c0-8.837-7.163-16-16-16h-8" />
      <rect x="24" y="36" width="16" height="18" rx="0" />
    </svg>
  );
}
function WeddingIcon() {
  return (
    <svg className="w-14 h-14" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M32 12l4 8 9 1.3-6.5 6.3 1.5 8.9L32 32l-8 4.5 1.5-8.9L19 21.3l9-1.3z" />
      <path d="M14 52h36M20 44c0-6.627 5.373-12 12-12s12 5.373 12 12" />
    </svg>
  );
}

const services = [
  {
    icon: <MeetingIcon />,
    title: "Pizza",
    desc: "Our signature loaded pizzas in three sizes with toppings you can customize. From Leo's Special to Peri Peri Chicken.",
  },
  {
    icon: <CakeIcon />,
    title: "Fast Food",
    desc: "Crispy zinger burgers, grilled sandwiches, chicken shawarma, and a variety of rolls wrapped fresh and hot.",
  },
  {
    icon: <WeddingIcon />,
    title: "Open Late",
    desc: "Kitchen runs past midnight most nights. Whether it's lunch or a late-night craving, we're here for you.",
  },
];

export default function Home() {
  return (
    <main>
      {/* ── Hero Carousel ── */}
      <HeroCarousel />

      {/* ── About Preview ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-12">
            {/* Photo collage */}
            <div className="w-full lg:w-1/2 flex h-[480px] gap-2">
              <div className="w-1/2 h-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&h=1200&fit=crop&auto=format"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  alt="Pizza fresh from oven"
                  loading="lazy"
                />
              </div>
              <div className="w-1/2 h-full mt-8 relative">
                <Image
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&h=1200&fit=crop&auto=format"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  alt="Delicious burger"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text block */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="section-heading !text-left !mb-6">
                <span className="script-accent">About</span>
                <h2 className="bold-title">Leo's Café</h2>
              </div>
              <p className="mb-6 leading-relaxed" style={{ color: "var(--color-body-gray)" }}>
                Located in New Zain Plaza near THQ Hospital, Leo's Café has grown into one of Kot Addu's most-loved fast food spots. 
                We serve loaded pizzas with generous toppings, zinger burgers with real crunch, and shawarmas wrapped tight and hot.
              </p>
              <p className="mb-8">
                <strong className="text-black block">Daily: 12:01 PM – 11:30 PM</strong>
                <strong className="text-black block text-sm">Friday: 3:00 PM – 11:00 PM</strong>
                <a
                  href="tel:+923361171626"
                  className="font-bold block mt-2"
                  style={{ color: "var(--color-accent)", fontSize: "1.75rem" }}
                >
                  +92 336 1171626
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Counter ── */}
      <StatsCounter />

      {/* ── Catering Services ── */}
      <section className="py-20" style={{ background: "var(--bg-section-alt)" }}>
        <div className="container mx-auto px-4">
          <div className="section-heading">
            <span className="script-accent">Services</span>
            <h2 className="bold-title">Catering Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16 text-center">
            {services.map((s) => (
              <div key={s.title} className="flex flex-col items-center">
                <div className="mb-6" style={{ color: "var(--color-accent)" }}>
                  {s.icon}
                </div>
                <h3
                  className="font-heading font-bold text-2xl mb-4"
                  style={{ color: "var(--color-black)" }}
                >
                  {s.title}
                </h3>
                <p style={{ color: "var(--color-body-gray)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Master Chef ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="section-heading">
            <span className="script-accent">Chef</span>
            <h2 className="bold-title">Our Master Chef</h2>
          </div>
          <div className="mt-12">
            <ChefCarousel />
          </div>
        </div>
      </section>

      {/* ── Happy Customer ── */}
      <section className="py-20" style={{ background: "var(--bg-section-alt)" }}>
        <div className="container mx-auto px-4">
          <div className="section-heading">
            <span className="script-accent">Testimony</span>
            <h2 className="bold-title">Happy Customer</h2>
          </div>
          <TestimonyCarousel />
        </div>
      </section>

      {/* ── Reservation Form ── */}
      <ReservationForm />
    </main>
  );
}
