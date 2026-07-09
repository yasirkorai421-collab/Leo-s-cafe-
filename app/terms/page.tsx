import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Leo's Café",
  description: "Terms and conditions for using Leo's Café website and services.",
};

export default function TermsPage() {
  return (
    <main className="py-20" style={{ background: "var(--bg-page)" }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading font-bold text-4xl mb-8" style={{ color: "var(--color-heading)" }}>
          Terms & Conditions
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-6" style={{ color: "var(--color-body-gray)" }}>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using the Leo's Café website ("Service"), you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              2. Use of Service
            </h2>
            <p>
              Our Service allows you to browse our menu, place orders, make reservations, and access other features. 
              You agree to use the Service only for lawful purposes and in accordance with these Terms.
            </p>
            <p className="mt-4">You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the Service in any way that violates applicable laws or regulations</li>
              <li>Impersonate or attempt to impersonate Leo's Café, our employees, or other users</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              3. Orders and Payment
            </h2>
            <p>
              All orders placed through our Service are subject to acceptance and availability. We reserve the right 
              to refuse or cancel any order for any reason, including pricing errors, product unavailability, or 
              suspected fraudulent activity.
            </p>
            <p className="mt-4">
              Payment must be made as specified at checkout. We accept cash on delivery and online payments. For online 
              payments, payment verification is required before order processing.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              4. Delivery
            </h2>
            <p>
              Delivery times are estimates and not guaranteed. We will make reasonable efforts to deliver orders within 
              the estimated timeframe. Delivery is available within our designated service area in Kot Addu.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              5. Reservations
            </h2>
            <p>
              Table reservations are subject to availability and confirmation. We reserve the right to modify or cancel 
              reservations if necessary. Please arrive within 15 minutes of your reservation time.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              6. User Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify 
              us immediately of any unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              7. Pricing
            </h2>
            <p>
              All prices are listed in Pakistani Rupees (PKR) and are subject to change without notice. We strive to 
              display accurate pricing, but errors may occur. If an error is discovered, we reserve the right to correct 
              it and may cancel affected orders.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              8. Food Safety and Allergies
            </h2>
            <p>
              While we take precautions to accommodate dietary restrictions, we cannot guarantee that our food is free 
              from allergens. Please contact us directly at <a href="tel:+923361171626" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a> to 
              discuss specific dietary requirements.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              9. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are owned by Leo's Café and are protected 
              by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              10. Limitation of Liability
            </h2>
            <p>
              Leo's Café shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              11. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              12. Contact Information
            </h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Phone:</strong> <a href="tel:+923361171626" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a>
              </p>
              <p>
                <strong>WhatsApp:</strong> <a href="https://wa.me/923361171626" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a>
              </p>
              <p>
                <strong>Address:</strong> New Zain Plaza, Near THQ Hospital, Kot Addu, Punjab, Pakistan
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
