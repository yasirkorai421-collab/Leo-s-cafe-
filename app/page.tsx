import HeroCarousel from "@/components/HeroCarousel";
import StatsCounter from "@/components/StatsCounter";
import TestimonyCarousel from "@/components/TestimonyCarousel";
import ReservationForm from "@/components/ReservationForm";
import ServicesSection from "@/components/ServicesSection";
import Image from "next/image";
import type { Metadata } from "next";
import { HOURS_TEXT } from "@/lib/hours";

export const metadata: Metadata = {
  title: "Leo's Café Kot Addu — Best Pizza & Fast Food",
  description: "Leo's Café in Kot Addu serves loaded pizzas, crispy burgers, fresh shawarmas and more. Open late. New Zain Plaza, Kot Addu.",
  openGraph: {
    title: "Leo's Café Kot Addu — Best Pizza & Fast Food",
    description: "Leo's Café in Kot Addu serves loaded pizzas, crispy burgers, fresh shawarmas and more. Open late. New Zain Plaza, Kot Addu.",
    url: "https://leo-s-cafe.vercel.app",
    siteName: "Leo's Café",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Leo's Café - Delicious Pizza",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leo's Café Kot Addu — Best Pizza & Fast Food",
    description: "Leo's Café in Kot Addu serves loaded pizzas, crispy burgers, fresh shawarmas and more. Open late.",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&h=630&fit=crop"],
  },
};

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
