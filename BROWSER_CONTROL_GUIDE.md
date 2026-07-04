# 🎛️ Browser-Based Admin Control Panel Guide

## 🌟 Overview

Your Leo's Café website now has a **COMPLETE browser-based admin control panel**. You can manage everything without touching the database or code!

---

## 🔑 Getting Started

### Step 1: Access Admin Panel

1. Open your browser and go to: **http://localhost:3001**
2. Click **"Sign In"** or go to: **http://localhost:3001/auth/login**
3. Login with admin credentials (see below)

### Step 2: Create Your First Admin Account

Since you need an admin account to access the admin panel, create one in Supabase first:

#### Option A: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/zlszqcxqunihwzlhlasj
2. Click **Authentication** → **Users** → **Add User**
3. Enter:
   - **Email**: `admin@leoscafe.com`
   - **Password**: `LeosCafe2026!Admin`
   - **Auto Confirm User**: ✅ **YES** (important!)
4. Click **Create User**

5. Now set the role to admin in **SQL Editor**:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'admin@leoscafe.com';
   ```

#### Option B: Using the Browser (After you have one admin)

Once you have one admin account, you can create more admins directly from the browser:

1. Go to: **http://localhost:3001/admin/users**
2. Click **"+ Create User"**
3. Fill in the form and select **"Admin"** role
4. Done!

---

## 🎯 Admin Panel Features

### 1. **Dashboard** (`/admin`)

**What you see:**
- Quick stats: Orders, Revenue, Users
- Recent orders summary
- Top selling items
- Quick links to all admin sections

**Access:** http://localhost:3001/admin

---

### 2. **User Management** (`/admin/users`)

**What you can do:**
- ✅ **Create new users** (customers or admins)
- ✅ **Edit existing users** (change name, role, loyalty points, birthday)
- ✅ **Delete users** (with confirmation)
- ✅ **Search users** by email or name
- ✅ **View user stats** (total users, admins, customers)

**Key Features:**
- **Create User Form**:
  - Email (required)
  - Password (required, min 6 characters)
  - Name (optional)
  - Role (customer/admin)
  - Loyalty Points
  - Birthday (optional)

- **Edit User Form**:
  - Email (cannot be changed)
  - Name
  - Role (promote to admin or demote to customer)
  - Loyalty Points (adjust manually)
  - Birthday

- **Security**:
  - Admins can't see user passwords (never displayed)
  - Can't delete your own account
  - Confirmation required before deleting users

**Access:** http://localhost:3001/admin/users

**How to Use:**
```
1. Create Admin Account:
   - Click "+ Create User"
   - Email: owner@leoscafe.com
   - Password: SecurePass123
   - Role: Admin
   - Click "Create User"

2. Edit Customer:
   - Search for customer
   - Click "Edit"
   - Update loyalty points: 500
   - Click "Update User"

3. Delete Spam Account:
   - Find spam user
   - Click "Delete"
   - Confirm deletion
```

---

### 3. **System Settings** (`/admin/settings`)

**What you can do:**
- ✅ **Edit payment details** (JazzCash, Easypaisa, WhatsApp, Bank)
- ✅ **Configure loyalty program** (points per Rs, redemption rate, review bonus)
- ✅ **Set birthday rewards** (discount %, validity, message)
- ✅ **Configure win-back campaigns** (threshold days, discount, message)
- ✅ **All changes saved to database** (no need to edit .env files!)

**Sections:**

#### 💳 Payment Settings
- **JazzCash Number**: 03XX-XXXXXXX
- **Easypaisa Number**: 03XX-XXXXXXX
- **WhatsApp Number**: +92 XXX XXXXXXX
- **Bank Name**: HBL
- **Bank Account Number**: XXXX-XXXX-XXXX
- **Account Title**: Leo's Café

#### 🎁 Loyalty Program
- **Points Per Rs. 100**: 10 (default)
  - Example: Order Rs. 500 = 50 points earned
- **Redemption Rate (Rs per point)**: 1 (default)
  - Example: 100 points = Rs. 100 discount
- **Google Review Bonus**: 200 points (default)

#### 🎂 Birthday Rewards
- **Birthday Discount**: 20% (default)
- **Voucher Validity**: 7 days (default)
- **Birthday Message**: Customizable greeting

#### 🎯 Win-Back Campaign
- **Inactivity Threshold**: 30 days (default)
  - Customers who haven't ordered in 30 days get targeted
- **Win-Back Discount**: 15% (default)
- **Voucher Validity**: 7 days (default)
- **Win-Back Message**: Customizable "We miss you" message

**Access:** http://localhost:3001/admin/settings

**How to Use:**
```
1. Enable Edit Mode:
   - Click "Edit Settings" button (top right)

2. Update Payment Numbers:
   - JazzCash: 0336-1171626
   - Easypaisa: 0336-1171626
   - WhatsApp: +92 336 1171626

3. Increase Loyalty Points:
   - Points Per Rs. 100: 15 (from 10)
   - Now customers earn 15 points per Rs. 100 spent!

4. Update Birthday Discount:
   - Birthday Discount: 25% (from 20%)
   - Validity: 14 days (from 7)

5. Save Changes:
   - Click "Save Changes"
   - See success notification
   - Changes are immediately active!

6. Cancel Without Saving:
   - Click "Cancel"
   - All changes discarded
```

---

### 4. **Order Management** (`/admin/orders`)

**What you can do:**
- ✅ View all orders
- ✅ Filter by status (Pending, Confirmed, Preparing, Ready, Delivered)
- ✅ View payment screenshots (WhatsApp payments)
- ✅ Verify or reject payments
- ✅ Update order status
- ✅ Add admin notes
- ✅ View customer details and items

**Access:** http://localhost:3001/admin/orders

---

### 5. **Customer Management** (`/admin/customers`)

**What you can do:**
- ✅ View all customers
- ✅ Search customers
- ✅ See birthday indicators (🎂 Today!)
- ✅ Send birthday wishes (creates 20% voucher + 100 points)
- ✅ Grant/deduct loyalty points
- ✅ View Google review status
- ✅ View order history

**Access:** http://localhost:3001/admin/customers

---

### 6. **Tables Management** (`/admin/tables`)

**What you can do:**
- ✅ Create QR codes for dine-in tables
- ✅ View active table sessions
- ✅ Customers scan QR → order directly to table

**Access:** http://localhost:3001/admin/tables

---

## 🚀 Quick Start Workflows

### Workflow 1: Setup New Admin Account
```
1. Go to Supabase Dashboard
2. Create user: admin@leoscafe.com
3. Run SQL: UPDATE users SET role = 'admin' WHERE email = 'admin@leoscafe.com'
4. Login at http://localhost:3001/auth/login
5. Go to /admin/users
6. Create more admin accounts from browser
```

### Workflow 2: Configure Payment Settings
```
1. Login as admin
2. Go to /admin/settings
3. Click "Edit Settings"
4. Update JazzCash/Easypaisa/WhatsApp numbers
5. Update bank details
6. Click "Save Changes"
7. Test by making an order - new numbers show up!
```

### Workflow 3: Increase Loyalty Points for Special Event
```
1. Go to /admin/settings
2. Click "Edit Settings"
3. Change "Points Per Rs. 100" from 10 to 20 (double points!)
4. Click "Save Changes"
5. Announce to customers: "Double points this weekend!"
6. After event, change back to 10
```

### Workflow 4: Manually Grant Points to VIP Customer
```
1. Go to /admin/customers
2. Search for customer: "Ali Ahmad"
3. Click "+ Points"
4. Enter: 500 points
5. Reason: "VIP customer appreciation"
6. Click "Grant Points"
7. Customer sees 500 new points in their account
```

### Workflow 5: Send Birthday Wishes
```
1. Go to /admin/customers
2. Look for 🎂 Today! indicator
3. Click "🎂 Send Wish" button
4. System automatically:
   - Creates 20% off voucher (valid 7 days)
   - Grants 100 bonus points
   - Marks birthday as sent
5. Customer receives notification
```

---

## 🔒 Security Features

### Access Control
- ✅ Only users with `role='admin'` can access admin panel
- ✅ Regular customers redirected to customer pages
- ✅ Unauthenticated users redirected to login

### Password Protection
- ✅ Passwords are **never displayed** to admins
- ✅ Passwords stored as bcrypt hashes (cannot be reversed)
- ✅ Admins can reset passwords but never see existing ones

### User Deletion Safety
- ✅ Confirmation required before deletion
- ✅ Cannot delete your own account
- ✅ User data permanently removed

### Input Validation
- ✅ Email format validation
- ✅ Password minimum length (6 characters)
- ✅ Number range validation (discounts 0-100%)
- ✅ Required field checking

---

## 📊 Database Tables

### SystemSettings Table
```sql
CREATE TABLE system_settings (
  id                        TEXT PRIMARY KEY,
  
  -- Payment
  jazz_cash_number          TEXT DEFAULT '',
  easypaisa_number          TEXT DEFAULT '',
  bank_name                 TEXT DEFAULT '',
  bank_account_number       TEXT DEFAULT '',
  bank_account_title        TEXT DEFAULT '',
  whatsapp_number           TEXT DEFAULT '',
  
  -- Loyalty
  loyalty_points_per_currency FLOAT DEFAULT 10,
  loyalty_redemption_rate   FLOAT DEFAULT 1,
  google_review_bonus       INT DEFAULT 200,
  
  -- Birthday
  birthday_discount         INT DEFAULT 20,
  birthday_validity_days    INT DEFAULT 7,
  birthday_message          TEXT DEFAULT 'Happy Birthday! Enjoy your special discount!',
  
  -- Winback
  winback_threshold_days    INT DEFAULT 30,
  winback_discount          INT DEFAULT 15,
  winback_validity_days     INT DEFAULT 7,
  winback_message           TEXT DEFAULT 'We miss you! Come back for a special offer!',
  
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW()
);
```

**Note:** Settings are stored in database, NOT .env files. Changes take effect immediately without server restart!

---

## 🎨 UI/UX Features

### Modern Design
- ✅ Dark mode support
- ✅ Smooth transitions
- ✅ Loading spinners
- ✅ Toast notifications (success/error messages)
- ✅ Modal dialogs for forms
- ✅ Responsive cards and grids

### Mobile Responsive
- ✅ Works on all screen sizes
- ✅ Touch-friendly buttons (48px minimum)
- ✅ Readable fonts (18px+)
- ✅ Horizontal scrolling where needed

### Accessibility
- ✅ Keyboard navigation
- ✅ Clear labels
- ✅ Error messages
- ✅ Confirmation dialogs

---

## ⚡ Performance

### Fast Loading
- ✅ Optimized queries (only fetch needed fields)
- ✅ Client-side rendering for instant interactions
- ✅ Minimal API calls
- ✅ Local state management

### Real-Time Updates
- ✅ Instant form validation
- ✅ Live search filtering
- ✅ Optimistic UI updates

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Problem:** Can't access admin panel
**Solution:**
```sql
-- Check your role in database:
SELECT email, role FROM users WHERE email = 'your@email.com';

-- If role is 'customer', change to 'admin':
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### "Failed to create user" Error
**Problem:** User with email already exists
**Solution:**
- Check if email is already registered
- Use different email
- Or delete existing user first

### Settings Not Saving
**Problem:** Click "Save Changes" but nothing happens
**Solution:**
- Check browser console for errors (F12)
- Verify you're logged in as admin
- Check database connection
- Refresh page and try again

### Can't See New Users
**Problem:** Created user in Supabase but not showing in /admin/users
**Solution:**
- User might exist in Supabase Auth but not in users table
- Login as that user once to create database record
- Or create directly from /admin/users page

---

## 📝 API Endpoints Reference

### User Management
```
GET    /api/admin/users          - List all users
POST   /api/admin/users          - Create new user
PATCH  /api/admin/users/[id]     - Update user
DELETE /api/admin/users/[id]     - Delete user
```

### Settings Management
```
GET    /api/admin/settings       - Fetch all settings
PUT    /api/admin/settings       - Update settings
```

### Customer Management
```
GET    /api/admin/customers                      - List all customers
POST   /api/admin/customers/[id]/birthday-wish   - Send birthday wish
POST   /api/admin/customers/[id]/loyalty         - Grant/deduct points
```

### Order Management
```
GET    /api/admin/orders                         - List all orders
PATCH  /api/admin/orders/[id]/update-status      - Update order status
POST   /api/admin/orders/[id]/verify-payment     - Verify payment
```

---

## 🎯 Next Steps

1. **Create your admin account** (follow "Getting Started" section above)
2. **Configure payment settings** to show your actual numbers
3. **Create staff accounts** with admin role for your employees
4. **Test the loyalty program** by creating test customers
5. **Set up birthday notifications** by adding customer birthdays

---

## 🎉 You're All Set!

You now have **complete control** over your restaurant website from the browser. No need to:
- ❌ Access database directly
- ❌ Edit .env files
- ❌ Write SQL queries
- ❌ Restart server
- ❌ Touch any code

Everything is controlled through the beautiful admin interface at **http://localhost:3001/admin**!

---

## 📞 Support

If you need help:
1. Check this guide first
2. Check browser console for errors (F12)
3. Check server logs in terminal
4. Ask me for assistance!

---

**Last Updated:** July 4, 2026
**Version:** 2.0.0
**Status:** ✅ Production Ready
