import Breadcrumb from "@/components/Breadcrumb";
import StatsCounter from "@/components/StatsCounter";
import ChefCarousel from "@/components/ChefCarousel";
import TestimonyCarousel from "@/components/TestimonyCarousel";
import ReservationForm from "@/components/ReservationForm";

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
    title: "Business Meetings",
    desc: "Impress clients and colleagues with a premium dining experience tailored to your corporate needs. Private rooms available.",
  },
  {
    icon: <WeddingIcon />,
    title: "Wedding Party",
    desc: "Make your special day unforgettable. Our team crafts bespoke menus and décor to match your vision perfectly.",
  },
  {
    icon: <CakeIcon />,
    title: "Birthday Party",
    desc: "Celebrate life's milestones in style. Custom cakes, themed menus, and warm hospitality for every age.",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=2070&h=1380&fit=crop"
            alt="About Feliciano"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 mt-16">
          <h1
            className="font-heading font-bold text-white uppercase mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", letterSpacing: "2px" }}
          >
            About
          </h1>
          <Breadcrumb paths={[{ label: "About" }]} />
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-12">
            {/* Photo collage */}
            <div className="w-full lg:w-1/2 flex h-[480px] gap-2">
              <div className="w-1/2 h-full">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&h=1200&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Head chef"
                />
              </div>
              <div className="w-1/2 h-full mt-8">
                <img
                  src="https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=800&h=1200&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Kitchen in action"
                />
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="section-heading !text-left !mb-6">
                <span className="script-accent">About</span>
                <h2 className="bold-title">Feliciano Restaurant</h2>
              </div>
              <p className="mb-4 leading-relaxed" style={{ color: "var(--color-body-gray)" }}>
                Nestled in the heart of the city, Feliciano brings together the warmth of home cooking
                and the craft of fine dining. Every dish is made from locally sourced ingredients,
                prepared fresh daily by our passionate team of chefs.
              </p>
              <p className="mb-6 leading-relaxed" style={{ color: "var(--color-body-gray)" }}>
                Founded in 2007, we have spent nearly two decades perfecting our craft — blending
                traditional recipes with contemporary techniques to create a menu that speaks to
                every palate.
              </p>
              <p className="mb-8">
                <strong className="text-black block">Mon – Fri &nbsp;8 AM – 11 PM</strong>
                <a
                  href="tel:+19781234567"
                  className="font-bold block mt-2"
                  style={{ color: "var(--color-accent)", fontSize: "1.75rem" }}
                >
                  +1-978-123-4567
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

      {/* ── Testimony ── */}
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
