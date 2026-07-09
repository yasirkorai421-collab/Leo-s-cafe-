import Breadcrumb from "@/components/Breadcrumb";
import type { Metadata } from "next";
import { HOURS_TEXT } from "@/lib/hours";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Contact Leo's Café — Call or Find Us in Kot Addu",
  description: "Get in touch with Leo's Café. Call us, WhatsApp us, or find us at New Zain Plaza, Kot Addu. We're open late.",
  openGraph: {
    title: "Contact Us — Leo's Café",
    description: "Get in touch with Leo's Café. Call +92 336 1171626 or visit us at New Zain Plaza, Kot Addu.",
    url: "https://leo-s-cafe.vercel.app/contact",
    siteName: "Leo's Café",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Contact Leo's Café",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — Leo's Café",
    description: "Get in touch with Leo's Café. Call +92 336 1171626 or WhatsApp us.",
    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&h=630&fit=crop"],
  },
};

export default function ContactPage() {
  return (
    <main>
      {/* ── Page Hero Banner ── */}
      <section className="relative h-[400px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1414235077428-338988a2e8c0?q=80&w=2070&h=1380&fit=crop"
            alt="Contact Leo's Café"
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 mt-16">
          <h1
            className="font-heading font-bold text-white uppercase mb-2"
            style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", letterSpacing: "2px" }}
          >
            Contact Us
          </h1>
          <Breadcrumb paths={[{ label: "Contact" }]} />
        </div>
      </section>

      {/* ── Contact Content ── */}
      <section className="py-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="section-heading !text-left !mb-6">
                <span className="script-accent">Get in Touch</span>
                <h2 className="bold-title">Contact Information</h2>
              </div>

              <div className="space-y-8">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-2" style={{ color: "var(--color-heading)" }}>
                      Address
                    </h3>
                    <p style={{ color: "var(--color-body-gray)" }}>
                      New Zain Plaza near THQ Hospital<br />
                      Kot Addu, Punjab, Pakistan
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-2" style={{ color: "var(--color-heading)" }}>
                      Phone
                    </h3>
                    <a 
                      href="tel:+923361171626" 
                      className="text-accent font-medium hover:underline"
                    >
                      +92 336 1171626
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-2" style={{ color: "var(--color-heading)" }}>
                      Opening Hours
                    </h3>
                    <p style={{ color: "var(--color-body-gray)" }}>
                      {HOURS_TEXT.short}<br />
                      {HOURS_TEXT.friday}
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl mb-2" style={{ color: "var(--color-heading)" }}>
                      Social Media
                    </h3>
                    <div className="space-x-4">
                      <a 
                        href="https://www.facebook.com/Leo450.1/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Facebook
                      </a>
                      <a 
                        href="https://www.instagram.com/Leo450.1/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form - Replaced with WhatsApp */}
            <div>
              <div className="section-heading !text-left !mb-6">
                <span className="script-accent">Message Us</span>
                <h2 className="bold-title">Get in Touch</h2>
              </div>

              <div className="space-y-6">
                <p className="text-base" style={{ color: "var(--color-body-gray)" }}>
                  The fastest way to reach us is through WhatsApp or by calling directly. 
                  We'll respond to your inquiry as quickly as possible.
                </p>

                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/923361171626?text=Hi%20Leo's%20Café!%20I%20have%20a%20question..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 transition-colors uppercase tracking-wider flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Message on WhatsApp</span>
                </a>

                {/* Call Button */}
                <a
                  href="tel:+923361171626"
                  className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-4 px-8 transition-colors uppercase tracking-wider flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call +92 336 1171626</span>
                </a>

                {/* Visit Note */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200">
                  <p className="text-sm" style={{ color: "var(--color-body-gray)" }}>
                    <strong>💡 Pro tip:</strong> You can also visit us directly at New Zain Plaza near THQ Hospital, 
                    Kot Addu. We're open {HOURS_TEXT.full.toLowerCase()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-16">
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
              {/* TODO: Replace iframe src with the correct Google Maps embed URL for
                  "Leo's Café, New Zain Plaza, Kot Addu" — get it from:
                  maps.google.com → search your location → Share → Embed a map → Copy iframe src */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.123!2d70.9655!3d30.4694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDI4JzA5LjgiTiA3MMKwNTcnNTUuOCJF!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
