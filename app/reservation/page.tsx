import Breadcrumb from "@/components/Breadcrumb";
import ReservationForm from "@/components/ReservationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Table — Leo's Café Kot Addu",
  description: "Reserve your table at Leo's Café, Kot Addu. Quick and easy online booking.",
  openGraph: {
    title: "Book a Table — Leo's Café",
    description: "Reserve your table at Leo's Café. Book online for dine-in at New Zain Plaza, Kot Addu.",
    url: "https://leo-s-cafe.vercel.app/reservation",
    siteName: "Leo's Café",
    images: [
      {
        url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Reserve a Table at Leo's Café",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Table — Leo's Café",
    description: "Reserve your table at Leo's Café. Book online for dine-in.",
    images: ["https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1200&h=630&fit=crop"],
  },
};

export default function ReservationPage() {
  return (
    <main>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&h=1380&fit=crop"
            alt="Book a Table at Leo's Café"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 mt-16">
          <h1
            className="font-heading font-bold text-white uppercase mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", letterSpacing: "2px" }}
          >
            Book a Table
          </h1>
          <Breadcrumb paths={[{ label: "Reservation" }]} />
        </div>
      </section>

      {/* ── Reservation Content ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="section-heading">
              <span className="script-accent">Reserve Your Spot</span>
              <h2 className="bold-title">Make a Reservation</h2>
            </div>
            <p className="mt-6" style={{ color: "var(--color-body-gray)" }}>
              Plan your visit to Leo's Café. Whether it's a quick lunch, dinner with family, or a late-night craving, 
              we're here to serve you. Reserve your table and enjoy our signature pizzas, burgers, and more.
            </p>
          </div>

          <ReservationForm />
        </div>
      </section>
    </main>
  );
}
