# WhatsApp Order Confirmation System - Setup Guide

Complete setup guide for the email verification, phone collection, and WhatsApp order confirmation system.

## Overview

This system consists of:
1. **Email Verification** - Supabase built-in email verification
2. **Phone Collection** - Pakistani phone number at signup
3. **WhatsApp Confirmation** - Order confirmation via WhatsApp before going to kitchen
4. **Profile Settings** - Phone number management

## Quick Start (Local Development)

### 1. Install WhatsApp Server Dependencies

```bash
npm run whatsapp:install
```

This will install dependencies in `whatsapp-server/` directory.

### 2. Start WhatsApp Server (in one terminal)

```bash
npm run whatsapp:server
```

You'll see a QR code:
```
🚀 WhatsApp Order Confirmation Server running on port 3001
📱 WhatsApp Client initializing...

=== WHATSAPP QR CODE ===
Scan this QR code with your WhatsApp:
[QR CODE DISPLAYED]
```

**Scan the QR code with your WhatsApp to authenticate.** This is required only once - the session persists in `whatsapp-server/whatsapp-sessions/`.

### 3. Start Next.js App (in another terminal)

```bash
npm run dev
```

The app runs on `http://localhost:3000`.

### 4. Test the Full Flow

1. **Signup:**
   - Navigate to signup page
   - Enter email: `test@example.com`
   - Enter phone: `03001234567` (will auto-format to `+923001234567`)
   - Submit signup

2. **Email Verification:**
   - Check email for Supabase verification link
   - Click link to verify email
   - Return to app (should show "Email verified ✓")

3. **Place Order:**
   - Add items to cart
   - Click "Place Order"
   - See "WhatsApp Confirmation" screen with waiting timer

4. **Confirm via WhatsApp:**
   - On your phone, you'll receive a WhatsApp message from the number you authenticated with
   - Message will have order details and ask to reply "YES" or "NO"
   - Reply "YES" to confirm
   - Watch the order status update in real-time

## Environment Setup

### Required Environment Variables

Create `.env.local` in root directory:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
DIRECT_URL=your-direct-url

# WhatsApp Server
WHATSAPP_SERVER_URL=http://localhost:3001
WHATSAPP_CALLBACK_SECRET=your-secret-key
NEXT_PUBLIC_WHATSAPP_CONFIRMATION_TIMEOUT=300000
NEXT_JS_API_URL=http://localhost:3000
```

### Database Migration

Run the Supabase migration to create the orders and WhatsApp confirmation tables:

```bash
# Apply migration (auto-runs on push)
npm run db:push

# Or manually via Supabase SQL Editor:
# Copy contents of: prisma/migrations/add_orders_and_whatsapp.sql
# Paste into Supabase SQL Editor and run
```

## Files Created

### Backend

- **`whatsapp-server/index.js`** - Standalone WhatsApp server
- **`whatsapp-server/package.json`** - WhatsApp server dependencies
- **`app/api/orders/place/route.ts`** - Order placement with WhatsApp trigger
- **`app/api/orders/[id]/whatsapp-status/route.ts`** - WhatsApp callback endpoint
- **`app/api/orders/status/[orderId]/route.ts`** - Order status polling
- **`app/api/profile/update-phone/route.ts`** - Phone number update
- **`prisma/migrations/add_orders_and_whatsapp.sql`** - Database schema

### Frontend Components

- **`components/orders/WaitingForConfirmation.tsx`** - Order confirmation screen
- **`components/profile/PhoneNumberSettings.tsx`** - Phone number management UI
- **`components/auth/PhoneNumberInput.tsx`** - Phone input with auto-formatting
- **`components/auth/EmailVerificationBanner.tsx`** - Email verification status

### Configuration

- **`.gitignore`** - Updated with WhatsApp session exclusions
- **`.env.example`** - WhatsApp environment variables
- **`.env.production`** - Production WhatsApp configuration
- **`whatsapp-server/README.md`** - Detailed WhatsApp server documentation

## Architecture

### Order Flow

```
Customer Signup
    ↓
[Phone number saved, NOT verified]
    ↓
Customer Places Order
    ↓
[Check: Is phone verified?]
    ├─ YES → Order status: confirmed
    └─ NO  → Order status: pending_whatsapp_confirmation
              ↓
              Call WhatsApp Server
              ↓
              Send WhatsApp Message
              ↓
              Customer Receives Message
              ↓
              Customer Replies YES/NO/No reply in 5min
              ↓
              WhatsApp Server Calls Callback API
              ↓
              Order Status Updated
              ↓
              [If YES: Mark phone as verified]
              ↓
              Future Orders Skip WhatsApp Confirmation
```

### Component Interaction

```
┌─────────────────────────────────────────────────┐
│            Next.js Application                  │
│  (Port 3000)                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Signup Form                                    │
│  ├─ PhoneNumberInput (auto-format 03→+92)     │
│  ├─ EmailVerificationBanner                    │
│  └─ Creates User with phone field              │
│                                                 │
│  Order Placement                                │
│  ├─ /api/orders/place                          │
│  ├─ Checks: email verified? → YES              │
│  ├─ Checks: phone verified? → if NO, trigger   │
│  └─ WaitingForConfirmation.tsx                 │
│                                                 │
│  Profile Settings                              │
│  └─ PhoneNumberSettings.tsx                    │
│     ├─ Display current phone                   │
│     ├─ Show verification status                │
│     └─ Allow update via /api/profile/update    │
│                                                 │
└─────────────────────────────────────────────────┘
         │                           ▲
         │ POST to /send-confirmation │
         │ with orderId, phone, items │ Status: pending_whatsapp_confirmation
         │                            │
         ▼                            │
┌─────────────────────────────────────────────────┐
│     WhatsApp Server (Port 3001)                 │
│  whatsapp-server/index.js                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ON STARTUP:                                    │
│  ├─ Connect to WhatsApp                        │
│  ├─ Show QR code in terminal                   │
│  └─ Scan with phone (creates persistent        │
│     session in whatsapp-sessions/)             │
│                                                 │
│  ON ORDER:                                      │
│  ├─ Receive /send-confirmation POST            │
│  ├─ Send WhatsApp message to customer          │
│  ├─ Start 5-minute timeout                     │
│  └─ Listen for YES/NO replies                  │
│                                                 │
│  ON RESPONSE:                                   │
│  ├─ Detect "YES" or "NO"                       │
│  ├─ POST to /api/orders/[id]/whatsapp-status  │
│  ├─ Update order status                        │
│  └─ Mark phone_verified = true (if YES)       │
│                                                 │
│  ON TIMEOUT (5 min):                            │
│  └─ Auto-update order status to "expired"      │
│                                                 │
└─────────────────────────────────────────────────┘
         ▲
         │ Listens for incoming messages
         │ Sends HTTP callbacks
         │
Your WhatsApp Phone (the one you scanned QR with)
├─ Receives order confirmation messages
├─ Replies YES/NO
└─ WhatsApp Web listens & server processes reply
```

## Database Schema

### orders table
```sql
id UUID PK
user_id UUID FK → users.id
items JSONB
total_price DECIMAL(10,2)
status VARCHAR(50) -- pending_whatsapp_confirmation | confirmed | cancelled | expired | preparing | ready | completed
phone_verified BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

### whatsapp_confirmations table
```sql
id UUID PK
order_id UUID FK → orders.id
customer_phone VARCHAR(20)
sent_at TIMESTAMP
expires_at TIMESTAMP
status VARCHAR(50) -- pending | confirmed | cancelled | expired
response_at TIMESTAMP
response_text VARCHAR(255)
created_at TIMESTAMP
```

### users table (additions)
```sql
email_verified BOOLEAN
phone_verified BOOLEAN -- Set to true after first successful WhatsApp confirmation
```

## API Endpoints

### Order Creation
- **POST** `/api/orders/place` - Create order, trigger WhatsApp if needed
- **GET** `/api/orders/status/[orderId]` - Poll order status (3-second interval)

### WhatsApp Callback
- **POST** `/api/orders/[id]/whatsapp-status` - Update order after WhatsApp response

### Phone Management
- **POST** `/api/profile/update-phone` - Update user's phone number

### WhatsApp Server
- **POST** `/send-confirmation` - Send WhatsApp message
- **GET** `/status/:orderId` - Get confirmation status
- **GET** `/health` - Health check

## Phone Number Format

**Required Format:** Pakistani numbers only

Valid formats accepted:
- `+923001234567` (international format)
- `03001234567` (local format, auto-converts to `+923001234567`)

Invalid formats rejected:
- `92 300 123 4567` (spaces)
- `923001234567` (missing +)
- `03 300 123 4567` (mixed)

## Email Verification

Uses Supabase built-in email verification:

1. User signs up with email
2. Supabase sends verification email
3. User clicks link in email
4. Supabase marks `email_confirmed_at` in `auth.users`
5. Trigger in database updates `users.email_verified = true`
6. Order placement checks `email_verified` - blocks if false

## Phone Verification

Progressive verification approach:

1. **At signup:** Phone saved but NOT verified
2. **At first order:**
   - If `phone_verified = false`, trigger WhatsApp confirmation
   - Show waiting screen with 5-minute countdown
3. **On customer confirms via WhatsApp:**
   - Order status → confirmed
   - `phone_verified = true` in profiles table
4. **Future orders:**
   - Skip WhatsApp confirmation step
   - Order goes directly to kitchen

## Troubleshooting

### WhatsApp Messages Not Sending

1. **Check if WhatsApp server is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return `{"status": "ready"}`

2. **Check authentication:**
   - QR code should have been scanned
   - `whatsapp-server/whatsapp-sessions/` should contain session files
   - WhatsApp should be logged in on your phone

3. **Check phone number format:**
   - Must be valid Pakistani number
   - Must have active WhatsApp account

### Email Verification Not Working

1. **Check Supabase configuration:**
   - Email provider configured in Supabase dashboard
   - SMTP credentials correct

2. **Check email received:**
   - Look in spam/promotions folder
   - Verify email address is correct

### Phone Number Not Auto-Formatting

- Verify input component is PhoneNumberInput
- Check regex validation logic
- Test with different input formats

## Production Deployment

### WhatsApp Server Deployment

Deploy to a cloud server (DigitalOcean, AWS, etc.):

1. **SSH into server and install Node.js 18+**
2. **Clone repository:**
   ```bash
   git clone <repo>
   cd leo-cafe/whatsapp-server
   npm install
   ```

3. **Create `.env.local`:**
   ```env
   NEXT_JS_API_URL=https://leos-cafe.vercel.app
   WHATSAPP_CALLBACK_SECRET=your-secure-secret
   ```

4. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "whatsapp-server"
   pm2 save
   pm2 startup
   ```

5. **Update Next.js `.env.production`:**
   ```env
   WHATSAPP_SERVER_URL=https://your-whatsapp-server.com
   NEXT_JS_API_URL=https://leos-cafe.vercel.app
   ```

### Session Persistence

WhatsApp sessions must persist between restarts:
- Use persistent volume in Docker
- Use `/opt/whatsapp-sessions` on server
- Set appropriate file permissions: `chmod 755 /opt/whatsapp-sessions`

## Security Considerations

1. **WhatsApp Callback Secret:**
   - Set `WHATSAPP_CALLBACK_SECRET` environment variable
   - Use Bearer token on all callbacks
   - Server validates token before processing

2. **Phone Numbers:**
   - Stored in Prisma (database)
   - Only used for WhatsApp messaging
   - Not exposed to frontend API responses

3. **Order Data:**
   - WhatsApp server doesn't store order data
   - Data is in-memory only (lost on restart)
   - Real order data stored in Supabase

4. **Rate Limiting:**
   - Implement rate limiting on `/api/orders/place`
   - Prevent spam orders
   - Consider Upstash Redis (already in package.json)

## Support & Documentation

- **WhatsApp Server:** See `whatsapp-server/README.md`
- **Component Props:** Check JSDoc comments in component files
- **API Routes:** Check TypeScript types in route files
- **Database:** See `prisma/migrations/add_orders_and_whatsapp.sql`

## Next Steps

1. ✅ WhatsApp server created
2. ✅ Database schema created
3. ✅ API routes implemented
4. ✅ React components created
5. ✅ Environment variables documented
6. **NOW:** Install dependencies and test locally
7. **THEN:** Deploy to production
8. **FINALLY:** Monitor and optimize

## Testing Checklist

- [ ] WhatsApp server starts with QR code
- [ ] QR code scans and authenticates
- [ ] Signup form accepts phone number
- [ ] Phone number auto-formats 03 → +92
- [ ] Email verification email received
- [ ] Email verification completes
- [ ] Order placement sends WhatsApp message
- [ ] Waiting confirmation screen shows
- [ ] Customer receives WhatsApp message
- [ ] Replying YES/NO updates order
- [ ] Phone marked as verified after first order
- [ ] Second order skips WhatsApp confirmation
- [ ] Profile settings allow phone update
- [ ] All navigation works without errors

---

**Created:** 2024-01-15
**Updated:** 2024-01-15
**Status:** Complete Implementation
