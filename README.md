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

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/leos-cafe.git
cd leos-cafe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"


# SMS Configuration
HOST_PHONE_NUMBER="Your phone number" 
MSG91_API_KEY="your-msg91-api-key"
# ... other SMS settings

# Payment Settings
JAZZCASH_NUMBER="Your Account Number"
EASYPAISA_NUMBER="Your Account Number"
# ... other payment settings
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 5. Seed Admin & Delivery Personnel

```bash
npm run seed:users
```

This will create:
- Admin account in Supabase Auth and database
- Delivery personnel accounts based on `DELIVERY_PERSONNEL` env variable

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3001`

## 🔐 Admin Setup

Detailed admin setup instructions are in [ADMIN_SETUP.md](./ADMIN_SETUP.md)

### Quick Start:
1. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `.env.local`
2. Run `npm run seed:users`
3. Visit `/admin/login`
4. Login with your admin credentials

## 📱 Delivery Personnel Setup

1. Add delivery personnel to `DELIVERY_PERSONNEL` environment variable
2. Run `npm run seed:users`
3. Riders can login at `/delivery/login`

## 🗂️ Project Structure

```
leos-cafe/
├── app/                      # Next.js App Router pages
│   ├── admin/               # Admin dashboard pages
│   ├── delivery/            # Delivery personnel pages
│   ├── api/                 # API routes
│   ├── menu/                # Menu page
│   ├── offers/              # Offers page
│   └── track-order/         # Order tracking
├── components/              # React components
├── lib/                     # Utility functions
│   ├── prisma.ts           # Prisma client
│   ├── ownership.ts        # Auth helpers
│   ├── sms.ts              # SMS service
│   └── seed-*.ts           # Seeding scripts
├── store/                   # Zustand stores
│   └── cart.ts             # Shopping cart
├── hooks/                   # Custom React hooks
├── prisma/                  # Database schema
│   └── schema.prisma
├── public/                  # Static assets
└── utils/                   # Supabase helpers
```

## 📚 Key Routes

### Customer Routes
- `/` - Homepage
- `/menu` - Browse menu
- `/cart` - Shopping cart
- `/offers` - Active offers
- `/track-order/[id]` - Track order
- `/my-reservations` - View reservations

### Admin Routes
- `/admin/login` - Admin login
- `/admin/orders` - Order management
- `/admin/reservations` - Reservation management
- `/admin/delivery-personnel` - Manage riders
- `/admin/offers` - Offers management
- `/admin/stories` - Gallery management
- `/admin/menu` - Menu price management
- `/admin/customers` - Customer managements 

**Made with ❤️ for Leo's Cafe**
