import Image from "next/image";
import Breadcrumb from "@/components/Breadcrumb";
import MenuDisplay from "@/components/MenuDisplay";
import { categories, menuData } from "@/lib/menu-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu — Leo's Café Kot Addu | Pizzas, Burgers & More",
  description: "Browse our full menu — loaded pizzas, zinger burgers, shawarmas, pasta, drinks and desserts. All prices in PKR. Order online or call +92 336 1171626.",
  openGraph: {
    title: "Menu — Leo's Café Kot Addu",
    description: "Browse our full menu — loaded pizzas, zinger burgers, shawarmas, pasta, drinks and desserts.",
    url: "https://leo-s-cafe.vercel.app/menu",
    siteName: "Leo's Café",
    images: [
      {
        url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Leo's Café Menu",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu — Leo's Café Kot Addu",
    description: "Browse our full menu — loaded pizzas, zinger burgers, shawarmas, pasta, drinks and desserts.",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&h=630&fit=crop"],
  },
};

export default function MenuPage() {
  return (
    <main style={{ background: "var(--bg-page)" }}>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=60&w=1200&fit=crop&auto=format"
            alt="Menu hero"
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
            Our Menu
          </h1>
          <Breadcrumb paths={[{ label: "Menu" }]} />
        </div>
      </section>

      {/* ── Menu Display (Client Component) ── */}
      <MenuDisplay categories={categories} menuData={menuData} />
    </main>
  );
}
