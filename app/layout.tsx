import type { Metadata } from "next";
import { Poppins, Baloo_2, Alex_Brush } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import FloatingCartButton from "@/components/FloatingCartButton";
import FloatingCallButton from "@/components/FloatingCallButton";
import BottomNavBar from "@/components/BottomNavBar";
import ToasterProvider from "@/components/ToasterProvider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const alexBrush = Alex_Brush({
  variable: "--font-alex",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leo's Café - Kot Addu | Best Pizza & Fast Food",
  description: "Leo's Café in Kot Addu - Your favorite spot for loaded pizzas, crispy burgers, and fresh shawarmas. Open late, 100% halal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${baloo.variable} ${alexBrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-page text-body-gray">
        <ToasterProvider />
        <SiteHeader />
        {children}
        <Footer />
        
        {/* Mobile Enhancements */}
        <FloatingCartButton />
        <FloatingCallButton />
        <BottomNavBar />
        
        <SpeedInsights />
      </body>
    </html>
  );
}
