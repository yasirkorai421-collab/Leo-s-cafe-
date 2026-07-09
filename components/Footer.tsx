"use client";

import Image from "next/image";
import { SCHEDULE } from "@/lib/hours";

export default function Footer() {
  return (
    <footer className="bg-dark-panel text-body-gray py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Info Panel */}
        <div>
          <h2 className="font-heading font-bold text-white text-2xl mb-6">Leo's Café</h2>
          <p className="mb-6 leading-relaxed text-base">
            Located in New Zain Plaza near THQ Hospital, Kot Addu, Punjab. Your favorite spot for loaded pizzas, 
            crispy burgers, and fresh shawarmas. We serve quality fast food made with care.
          </p>
          <div className="flex space-x-4">
            <a 
              href="https://www.facebook.com/Leo450.1/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center text-white hover:bg-accent transition-colors"
              style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', background: '#2a2a2a', borderRadius: '50%' }}
              aria-label="Facebook"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a 
              href="https://www.instagram.com/Leo450.1/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center text-white hover:bg-accent transition-colors"
              style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', background: '#2a2a2a', borderRadius: '50%' }}
              aria-label="Instagram"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

        {/* Open Hours */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Open Hours</h3>
          <ul className="space-y-3">
            {SCHEDULE.map((item) => (
              <li key={item.day} className="flex justify-between items-center text-[#ccc] text-base">
                <span className="w-2/5 sm:w-1/3">{item.day}</span>
                <span className="text-sm sm:text-base">{item.open} - {item.close}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instagram Grid */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Instagram</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&h=200&fit=crop",
              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&h=200&fit=crop",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=200&h=200&fit=crop",
              "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=200&h=200&fit=crop",
              "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&h=200&fit=crop",
              "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=200&h=200&fit=crop",
            ].map((src, i) => (
              <a
                key={i}
                href="https://www.instagram.com/Leo450.1/"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gray-800 relative overflow-hidden block hover:opacity-80 transition-opacity"
              >
                <Image
                  src={src}
                  alt={`Leo's Café food photo ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 100px"
                  className="object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-heading font-bold text-white text-xl mb-6">Contact Us</h3>
          <ul className="space-y-4">
            <li>
              <div className="text-sm text-gray-400 mb-1">Phone</div>
              <a href="tel:+923361171626" className="text-accent hover:underline text-base font-semibold">
                +92 336 1171626
              </a>
            </li>
            <li>
              <div className="text-sm text-gray-400 mb-1">WhatsApp</div>
              <a 
                href="https://wa.me/923361171626" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline text-base font-semibold"
              >
                Message Us
              </a>
            </li>
            <li>
              <div className="text-sm text-gray-400 mb-1">Location</div>
              <p className="text-base">
                New Zain Plaza<br />
                Near THQ Hospital<br />
                Kot Addu, Punjab
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500 px-4">
        <p>Copyright ©{new Date().getFullYear()} Leo's Café. All rights reserved.</p>
      </div>
    </footer>
  );
}
