# Leo's Cafe - Online Ordering Platform

A full-featured online food ordering platform with delivery, dine-in QR ordering, loyalty rewards, and comprehensive admin management.

## Features

### Customer Features
- 🍕 **Menu Browsing** - Browse categories, search items, view customizations
- 🛒 **Shopping Cart** - Full cart management with edit, remove, and quantity controls
- 💳 **Checkout** - Streamlined checkout with order confirmation
- 📱 **WhatsApp Payment** - Screenshot-based payment with JazzCash/Easypaisa/Bank
- 📦 **Order Tracking** - Real-time order status updates
- 📋 **Order History** - View all your past orders
- 🎯 **Dine-In QR Ordering** - Scan table QR, order without waiting
- ⭐ **Favorites** - Save favorite menu items
- 🎁 **Loyalty Rewards** - Earn points, redeem vouchers, birthday rewards
- 🎂 **Birthday Program** - Automatic birthday vouchers
- 💝 **Win-Back Offers** - Re-engagement discounts for inactive customers
- 📱 **Mobile OTP Verification** - Secure phone number verification

### Admin Features
- 📊 **Analytics Dashboard** - Revenue, orders, top items
- 📋 **Order Management** - View, filter, update order status
- ✅ **Payment Verification** - Approve WhatsApp payment screenshots
- 🍽️ **Menu Management** - Add/edit menu items via API
- 🪑 **Table Management** - Create tables, generate QR codes, rotate tokens
- ⚙️ **Settings** - Configure loyalty rates, payment details, offers
- 🎫 **Review Claims** - Approve Google review point claims
- 📝 **Audit Logs** - Complete admin action history

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma 7
- **Auth**: Supabase Authentication with phone OTP verification
- **Uploads**: Cloudinary
- **Animation**: Framer Motion
- **State**: Zustand (cart), TanStack Query
- **Forms**: React Hook Form + Zod validation

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# SMS OTP
MSG91_API_KEY=your_msg91_api_key
MSG91_SENDER_ID=LEOCAFE
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payment Settings
PAYMENT_JAZZCASH_NUMBER=
PAYMENT_EASYPAISA_NUMBER=
PAYMENT_BANK_NAME=
PAYMENT_BANK_ACCOUNT=
PAYMENT_BANK_IBAN=
PAYMENT_WHATSAPP_NUMBER=

# Security
QR_SECRET= # Generate with: openssl rand -base64 32
CRON_SECRET=

# Redis (optional but recommended)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yasirkorai421-collab/Leo-s-cafe-.git
   cd Leo-s-cafe-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up Supabase database**
   - Create a Supabase project
   - Copy the connection string to `DATABASE_URL`

5. **Run Prisma migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

7. **Configure OTP delivery**
   - Add `MSG91_API_KEY` and `MSG91_SENDER_ID` (or Twilio credentials) to `.env.local`
   - Restart the dev server after changing environment variables

7. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel

1. **Push to GitHub** (already done)

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `yasirkorai421-collab/Leo-s-cafe-`

3. **Configure Environment Variables**
   - Add all variables from `.env.example`
   - Generate secrets for `QR_TOKEN_SECRET`, `UPLOAD_SECRET`, `CRON_SECRET`

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at: `https://your-project.vercel.app`

5. **Set up Supabase**
   - Create a Supabase project if not done
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma db push`

6. **Set up OTP delivery**
   - Add the MSG91 or Twilio credentials in Vercel environment variables
   - Make sure your sender ID is approved for the provider you use

7. **Set up Cloudinary**
   - Create Cloudinary account
   - Add credentials to Vercel env variables

## Database Schema

15 tables:
- `users` - Customer/admin accounts
- `categories` - Menu categories
- `menu_items` - Food items
- `customizations` - Item customizations
- `orders` - Customer orders
- `order_items` - Order line items
- `payment_proofs` - Payment screenshots
- `reviews` - Customer reviews
- `offers` - Promotional offers
- `loyalty_ledger` - Points transactions
- `vouchers` - Discount vouchers
- `review_point_claims` - Google review claims
- `tables` - Dine-in tables
- `table_sessions` - Active QR sessions
- `favorites` - Saved menu items
- `audit_log` - Admin action history

## Security Features

✅ Server-side price recomputation
✅ Single payment confirmation path
✅ Ownership checks on all user data
✅ HMAC-signed QR tokens
✅ Transaction-wrapped financial operations
✅ Idempotent value-granting operations
✅ DB-level uniqueness constraints
✅ CSRF protection on dine-in orders
✅ Audit logging on admin actions
✅ HttpOnly, secure, SameSite cookies

## Project Structure

```
leos-cafe-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── menu/              # Menu browsing
│   ├── checkout/          # Checkout flow
│   ├── order/             # Order tracking/payment
│   ├── dine/              # Dine-in QR ordering
│   ├── favorites/         # Favorites page
│   └── profile/           # User profile
├── components/            # React components
├── lib/                   # Shared utilities
│   ├── prisma.ts         # Prisma client
│   ├── ownership.ts      # Ownership checks
│   ├── settings.ts       # Admin settings
│   ├── qrToken.ts        # QR token signing
│   └── notificationService.ts
├── schemas/               # Zod validation schemas
├── store/                 # Zustand stores
├── prisma/                # Database schema
├── CLAUDE.md             # Security rules
└── PROJECT.md            # Current state
```

## Admin Access

### Making a User Admin

#### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **users** table  
3. Find the user by email or phone
4. Edit the `role` field and change from `user` to `admin`
5. Save changes

#### Method 2: Using SQL Query

```sql
-- Find your user ID first
SELECT id, name, email FROM users WHERE email = 'your-email@example.com';

-- Update to admin role
UPDATE users SET role = 'admin' WHERE id = 'your-user-uuid';
```

#### Method 3: Using Admin Creation Script

```bash
npm run admin:create
```

Follow the prompts to create a new admin user.

## Cron Jobs

Set up these cron endpoints on Vercel/external service:

- `GET /api/cron/birthday` - Daily at midnight (birthday vouchers)
- `GET /api/cron/winback` - Daily at midnight (win-back vouchers)

Add `Authorization: Bearer YOUR_CRON_SECRET` header.

## License

Private project - All rights reserved

## Contact

For support: yasirkorai421@gmail.com
