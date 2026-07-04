'use client';

import Image from "next/image";

export default function ReservationForm() {
  return (
    <>
      {/* Dark photo banner with decorative 3-part heading */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1920&h=600&fit=crop&auto=format"
            alt="Book a Table"
            fill
            sizes="100vw"
            quality={85}
            className="object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/55 z-10" />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
          {/* "Book a" — script, top-left offset */}
          <span
            className="font-script block text-accent"
            style={{ fontSize: "2.75rem", lineHeight: 1, opacity: 0.9, marginBottom: "-1rem" }}
          >
            Book a
          </span>
          {/* "Reservation" — bold heading, center */}
          <h2
            className="font-heading font-bold text-white inline-block relative z-10"
            style={{ fontSize: "2.25rem", marginTop: 0 }}
          >
            Reservation
          </h2>
          {/* "table" — script, bottom-right offset */}
          <span
            className="font-script block text-accent"
            style={{ fontSize: "2.75rem", lineHeight: 1, opacity: 0.9, marginTop: "-0.75rem" }}
          >
            table
          </span>
        </div>
      </section>

      {/* Form body — white bg, pulled up to overlap photo band */}
      <section className="pb-20" style={{ background: "var(--bg-page)" }}>
        <div className="container mx-auto px-4">
          <div
            className="max-w-3xl mx-auto bg-white p-8 md:p-12 shadow-lg -mt-10 relative z-20"
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="res-name"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="res-name"
                    type="text"
                    placeholder="Your Name"
                    className="w-full border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-email"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="res-email"
                    type="email"
                    placeholder="Your Email"
                    className="w-full border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-phone"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Phone
                  </label>
                  <input
                    id="res-phone"
                    type="tel"
                    placeholder="Phone"
                    className="w-full border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-date"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Date
                  </label>
                  <input
                    id="res-date"
                    type="date"
                    className="w-full border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-time"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Time
                  </label>
                  <input
                    id="res-time"
                    type="time"
                    className="w-full border px-4 py-3 focus:outline-none transition-colors"
                    style={{
                      borderColor: "var(--color-border-light)",
                      color: "var(--color-body-gray)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                  />
                </div>
                <div>
                  <label
                    htmlFor="res-person"
                    className="block font-heading font-bold text-black text-sm mb-2"
                  >
                    Person
                  </label>
                  <div className="relative">
                    <select
                      id="res-person"
                      className="w-full border px-4 py-3 focus:outline-none appearance-none bg-white pr-10 transition-colors"
                      style={{
                        borderColor: "var(--color-border-light)",
                        color: "var(--color-body-gray)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--color-border-light)")}
                    >
                      <option value="">Person</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5+">5+</option>
                    </select>
                    {/* Chevron icon */}
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-label-gray">
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white font-bold py-4 mt-6 uppercase tracking-wider transition-colors"
                style={{ background: "var(--color-accent)", marginTop: "1.5rem" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLButtonElement).style.background =
                    "var(--color-accent-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLButtonElement).style.background =
                    "var(--color-accent)")
                }
              >
                Make a Reservation
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
