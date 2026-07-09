import Breadcrumb from "@/components/Breadcrumb";
import StatsCounter from "@/components/StatsCounter";
import TestimonyCarousel from "@/components/TestimonyCarousel";
import ReservationForm from "@/components/ReservationForm";
import ServicesSection from "@/components/ServicesSection";
import Image from "next/image";
import type { Metadata } from "next";
import { HOURS_TEXT } from "@/lib/hours";

export const metadata: Metadata = {
  title: "About Leo's Café — New Zain Plaza, Kot Addu",
  description: "Learn about Leo's Café — Kot Addu's favourite fast food spot. Located at New Zain Plaza. Quality food, great service, open late.",
  openGraph: {
    title: "About Leo's Café",
    description: "Learn about Leo's Café — Kot Addu's favourite fast food spot. Quality food, great service, open late.",
    url: "https://leo-s-cafe.vercel.app/about",
    siteName: "Leo's Café",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Leo's Café Interior",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Leo's Café",
    description: "Learn about Leo's Café — Kot Addu's favourite fast food spot.",
    images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&h=630&fit=crop"],
  },
};

export default function AboutPage() {
  return (
    <main>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=60&w=1200&fit=crop&auto=format"
            alt="About Leo's Café"
            fill
            priority
            quality={60}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 z-10" />
        </div>

        <div className="relative z-20 text-center px-4 mt-16">
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
              <div className="w-1/2 h-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=800&h=1200&fit=crop&auto=format"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  alt="Head chef"
                  loading="lazy"
                />
              </div>
              <div className="w-1/2 h-full mt-8 relative">
                <Image
                  src="https://images.unsplash.com/photo-1556155092-490a1ba16284?q=80&w=800&h=1200&fit=crop&auto=format"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  alt="Kitchen in action"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Text */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="section-heading !text-left !mb-6">
                <span className="script-accent">About</span>
                <h2 className="bold-title">Leo's Café</h2>
              </div>
              <p className="mb-4 leading-relaxed" style={{ color: "var(--color-body-gray)" }}>
                Located in New Zain Plaza near THQ Hospital in Kot Addu, Punjab, Leo's Café has become 
                the go-to spot for authentic fast food lovers. We're known for our loaded pizzas with 
                generous toppings, crispy zinger burgers, and perfectly wrapped shawarmas.
              </p>
              <p className="mb-6 leading-relaxed" style={{ color: "var(--color-body-gray)" }}>
                Every dish is made fresh to order with quality ingredients. Whether you're craving a 
                cheesy Leo's Special Pizza or a spicy Chicken Tikka Roll, we serve it hot and ready. 
                Our menu features pizzas in three sizes, burgers, sandwiches, rolls, and more.
              </p>
              <p className="mb-8">
                <strong className="text-black block">{HOURS_TEXT.short}</strong>
                <strong className="text-black block text-sm">{HOURS_TEXT.friday}</strong>
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

      {/* ── Services Section ── */}
      <ServicesSection />

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
