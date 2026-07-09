import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold font-heading mb-4" style={{ color: 'var(--color-accent)' }}>
            404
          </h1>
          <h2 className="text-3xl font-bold font-heading mb-2" style={{ color: 'var(--color-heading)' }}>
            Page Not Found
          </h2>
          <p style={{ color: 'var(--color-body-gray)' }}>
            Sorry, we couldn't find the page you're looking for. Perhaps you'd like to check out our menu instead?
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-4 px-6 text-white font-bold uppercase tracking-wider transition-all hover:shadow-lg"
            style={{ background: 'var(--color-accent)' }}
          >
            Go to Home
          </Link>
          <Link
            href="/menu"
            className="block w-full py-4 px-6 font-bold uppercase tracking-wider transition-all hover:bg-gray-50"
            style={{ 
              border: '2px solid var(--color-accent)', 
              color: 'var(--color-accent)' 
            }}
          >
            View Menu
          </Link>
        </div>

        <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <p className="text-sm mb-4" style={{ color: 'var(--color-label-gray)' }}>
            Quick Links:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
              About
            </Link>
            <Link href="/contact" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
              Contact
            </Link>
            <Link href="/reservation" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
              Reservations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
