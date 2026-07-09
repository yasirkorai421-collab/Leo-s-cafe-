import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Leo's Café",
  description: "Privacy policy for Leo's Café. Learn how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="py-20" style={{ background: "var(--bg-page)" }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="font-heading font-bold text-4xl mb-8" style={{ color: "var(--color-heading)" }}>
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-6" style={{ color: "var(--color-body-gray)" }}>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <p>
            At Leo's Café, we respect your privacy and are committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
          </p>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              1. Information We Collect
            </h2>
            <h3 className="font-semibold text-xl mb-3 mt-6" style={{ color: "var(--color-heading)" }}>
              Information You Provide
            </h3>
            <p>We collect information you directly provide when you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Create an account (name, email, phone number)</li>
              <li>Place an order (delivery address, payment information)</li>
              <li>Make a reservation (name, phone number, party size)</li>
              <li>Contact us (name, email, message content)</li>
              <li>Leave reviews or feedback</li>
            </ul>

            <h3 className="font-semibold text-xl mb-3 mt-6" style={{ color: "var(--color-heading)" }}>
              Automatically Collected Information
            </h3>
            <p>We automatically collect certain information when you use our Service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, interactions)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              2. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Process and fulfill your orders and reservations</li>
              <li>Communicate with you about orders, promotions, and updates</li>
              <li>Improve our Service and customer experience</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Analyze usage patterns and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              3. Information Sharing
            </h2>
            <p>We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Delivery personnel:</strong> Name, phone number, and delivery address for order fulfillment</li>
              <li><strong>Payment processors:</strong> Payment information to process transactions</li>
              <li><strong>Service providers:</strong> Third-party services that help us operate our business (SMS providers, hosting)</li>
              <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="mt-4">Our security measures include:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure password hashing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              5. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized 
              content. You can control cookie preferences through your browser settings, but disabling cookies may affect 
              Service functionality.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at <a href="tel:+923361171626" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a> or 
              via <a href="https://wa.me/923361171626" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-accent)" }}>WhatsApp</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              7. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this 
              Privacy Policy, unless a longer retention period is required by law. Account information is retained 
              while your account is active and for a reasonable period thereafter.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              8. Children's Privacy
            </h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              9. Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites. We are not responsible for the privacy practices 
              of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              10. Changes to Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
              "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-2xl mb-4 mt-8" style={{ color: "var(--color-heading)" }}>
              11. Contact Us
            </h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 space-y-2">
              <p>
                <strong>Leo's Café</strong>
              </p>
              <p>
                <strong>Phone:</strong> <a href="tel:+923361171626" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a>
              </p>
              <p>
                <strong>WhatsApp:</strong> <a href="https://wa.me/923361171626" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-accent)" }}>+92 336 1171626</a>
              </p>
              <p>
                <strong>Address:</strong> New Zain Plaza, Near THQ Hospital, Kot Addu, Punjab, Pakistan
              </p>
              <p>
                <strong>Facebook:</strong> <a href="https://www.facebook.com/Leo450.1/" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-accent)" }}>facebook.com/Leo450.1</a>
              </p>
              <p>
                <strong>Instagram:</strong> <a href="https://www.instagram.com/Leo450.1/" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: "var(--color-accent)" }}>instagram.com/Leo450.1</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
