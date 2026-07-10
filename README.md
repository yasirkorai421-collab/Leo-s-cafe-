# 🍕 Leo's Cafe - Complete Management System

A modern, full-stack cafe management system built with Next.js 15, TypeScript, Prisma, and Supabase.

## 🚀 Features

### Customer Features
- 📱 **Menu Browsing** - Interactive menu with categories and search
- 🛒 **Shopping Cart** - Persistent cart with customizations
- 💳 **Dual Payment Options** - Cash on Delivery & Online Payment with screenshot upload
- 📋 **Order Tracking** - Real-time order status tracking
- 🎟️ **Reservations** - Table booking with admin approval workflow
- 🎁 **Offers & Promotions** - View and use discount codes
- ⭐ **Reviews** - Rate and review menu items
- 💝 **Loyalty Program** - Earn and redeem points
- 📞 **OTP Authentication** - Secure SMS-based login

### Admin Dashboard
- 📊 **Order Management** - Payment verification, status updates, delivery assignment
- 🚴 **Delivery Personnel Management** - CRUD operations for riders
- 📅 **Reservation Management** - Approve/reject table bookings with bulk operations
- 🎁 **Offers Management** - Create and manage promotional campaigns
- 📸 **Stories/Gallery Management** - Upload and approve homepage images
- 🍽️ **Menu Management** - Update prices and item availability
- 👥 **Customer Management** - View customer details and order history
- 📈 **Analytics Dashboard** - Sales, orders, and customer insights

### Delivery Personnel Dashboard
- 📦 **Order List** - View assigned deliveries
- 🔄 **Status Updates** - Update order status (picked up → out for delivery → delivered)
- 📱 **SMS Notifications** - Automatic customer notifications

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Supabase Auth
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod validation
- **SMS:** MSG91, Twilio (with fallback)
- **Notifications:** React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Supabase account
- SMS provider account (MSG91 or Twilio)

## 🔒 Security

- **Secrets management** — All API keys, service-role keys, and payment account numbers live only in environment variables (set via your hosting provider's dashboard in production, e.g. Vercel Project Settings → Environment Variables). Never hard-code them in source files or commit them in any form, including in setup notes, screenshots, or scripts.
- **Service-role key isolation** — `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security and must only be used in server-side code (API routes, server actions). It should never appear in client components or anything prefixed `NEXT_PUBLIC_`.
- **Row Level Security (RLS)** — Enable and test RLS policies on all Supabase tables so customers can only read/write their own orders, reservations, and reviews.
- **Admin & delivery auth** — Admin and delivery personnel routes must verify the authenticated user's role server-side on every request, not just hide UI elements client-side.
- **OTP/rate limiting** — Rate-limit OTP requests and login attempts per phone number/IP to prevent SMS-bombing and brute-force abuse.
- **Input validation** — All API routes validate incoming data with Zod (or equivalent) before touching the database; never trust client-supplied prices, discount codes, or order totals — recompute them server-side.
- **File uploads** — Payment screenshot and gallery image uploads should be size/type-restricted and scanned or sandboxed before being served publicly.
- **Dependency hygiene** — Run `npm audit` regularly and keep Next.js, Prisma, and Supabase packages up to date.
- **Git hygiene** — Before every commit, double-check `git status` for accidentally staged env files, and consider a pre-commit hook (e.g. `git-secrets` or `gitleaks`) to catch leaked credentials automatically.
- **HTTPS only** — Ensure production deployments enforce HTTPS and set secure, HttpOnly cookies for any session tokens.

If you discover a security issue in this project, please report it privately rather than opening a public issue.

**Made with ❤️ for Leo's Cafe**
