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
```

Fill in your actual values in `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

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
- `/admin/customers` - Customer management

### Delivery Routes
- `/delivery/login` - Delivery login
- `/delivery/dashboard` - View and update deliveries

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run seed:users       # Seed admin & delivery users
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Deploy

The build script automatically runs migrations and seeding.

### Manual Deployment

```bash
# Build the application
npm run build

# Run migrations
npx prisma migrate deploy

# Seed users
npm run seed:users

# Start production server
npm start
```

## 🔒 Security Features

- Role-based access control (Admin, Delivery, User)
- HTTPS enforcement in production
- CSRF protection
- XSS protection headers
- Content Security Policy
- SQL injection prevention via Prisma
- Password hashing via Supabase Auth
- Secure cookie handling

## 📊 Database Schema

The system uses PostgreSQL with the following main models:
- Users (customers, admin, delivery personnel)
- MenuItems & Categories
- Orders & OrderItems
- Reservations
- Offers
- Stories (homepage gallery)
- Reviews
- LoyaltyLedger
- AuditLog

See `prisma/schema.prisma` for complete schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for authentication
- Prisma for the excellent ORM
- Radix UI for accessible components

## 📞 Support

For issues or questions:
1. Check [ADMIN_SETUP.md](./ADMIN_SETUP.md) for admin-specific help
2. Review error logs
3. Check Supabase Auth dashboard
4. Open an issue on GitHub

---

**Made with ❤️ for Leo's Cafe**
