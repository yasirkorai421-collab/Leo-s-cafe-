# Leo's Cafe - Deployment Guide

## ✅ GitHub Repository
**Repository URL**: https://github.com/yasirkorai421-collab/Leo-s-cafe-.git
**Status**: Code successfully pushed (67 files, all 7 epics complete)

---

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Connect your GitHub account if not connected
4. Search for `yasirkorai421-collab/Leo-s-cafe-`
5. Click "Import"

### Step 2: Configure Project Settings

- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Click "Environment Variables" and add these (get values from your accounts):

#### Required Variables

```bash
# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:5432/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/menu
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/menu

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Settings
JAZZCASH_NUMBER=03001234567
EASYPAISA_NUMBER=03001234567
BANK_NAME=HBL
BANK_ACCOUNT_NUMBER=1234567890123
BANK_ACCOUNT_TITLE=Leo's Cafe
WHATSAPP_NUMBER=923001234567

# Security Secrets (Generate with: openssl rand -base64 32)
QR_TOKEN_SECRET=your_random_secret_here
UPLOAD_SECRET=your_random_secret_here
CRON_SECRET=your_random_secret_here

# App URL (Update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional Variables (for production features)

```bash
# Email (Resend)
RESEND_API_KEY=re_...

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Loyalty Settings
POINTS_PER_RS=1
REDEMPTION_RATE=1
REVIEW_BONUS_POINTS=50

# Birthday Program
BIRTHDAY_DISCOUNT=20
BIRTHDAY_VALIDITY_DAYS=7
BIRTHDAY_MESSAGE=Happy Birthday from Leo's Cafe!

# Win-Back Program
WINBACK_THRESHOLD_DAYS=30
WINBACK_DISCOUNT=15
WINBACK_VALIDITY_DAYS=14
WINBACK_MESSAGE=We miss you! Come back for a special discount.
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Vercel will provide your live URL: `https://your-project.vercel.app`

---

## 📦 Post-Deployment Setup

### 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update `DATABASE_URL` in Vercel environment variables
5. Run migrations:
   ```bash
   # Option A: From local terminal
   DATABASE_URL="your_supabase_url" npx prisma db push
   
   # Option B: Use Vercel CLI
   vercel env pull .env.local
   npx prisma db push
   ```

### 2. Configure Clerk Authentication

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Enable Phone (OTP) and Google OAuth
4. Add your Vercel domain to allowed origins:
   - Go to "Domains" in Clerk dashboard
   - Add your Vercel URL (e.g., `leos-cafe.vercel.app`)
5. Copy API keys to Vercel environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
6. Redeploy on Vercel after updating env vars

### 3. Configure Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com)
2. Create account or login
3. Go to Dashboard > Settings > Security
4. Enable unsigned uploads (for next-cloudinary widget)
5. Copy credentials to Vercel:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 4. Create First Admin User

1. Visit your deployed app: `https://your-app.vercel.app`
2. Sign up with your phone number or Google
3. Get your Clerk user ID from Clerk dashboard
4. Update user in Supabase database:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE clerk_id = 'user_xxxxxxxxxxxxx';
   ```
5. Logout and login again to activate admin role

### 5. Set Up Cron Jobs (Optional)

For birthday vouchers and win-back campaigns:

#### Option A: Vercel Cron (Recommended)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/birthday",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/winback",
      "schedule": "0 0 * * *"
    }
  ]
}
```

#### Option B: External Cron Service

Use [cron-job.org](https://cron-job.org) or similar:
- URL: `https://your-app.vercel.app/api/cron/birthday`
- Schedule: Daily at midnight
- Header: `Authorization: Bearer YOUR_CRON_SECRET`

### 6. Configure Payment WhatsApp Number

Update in Vercel environment variables:
- `WHATSAPP_NUMBER=923001234567` (format: country code + number)
- `JAZZCASH_NUMBER=03001234567`
- `EASYPAISA_NUMBER=03001234567`
- Bank details as needed

---

## 🔧 Updating the App

### Push Changes to GitHub
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically rebuild and redeploy.

### Manual Redeploy
Go to Vercel dashboard > Your project > Deployments > Redeploy

---

## 🔐 Security Checklist

✅ All environment variables added to Vercel
✅ Generate strong secrets for QR_TOKEN_SECRET, UPLOAD_SECRET, CRON_SECRET
✅ Database connection uses SSL (Supabase default)
✅ Clerk domain restrictions configured
✅ Cloudinary upload signing enabled
✅ CRON_SECRET protects cron endpoints
✅ Admin role properly assigned in database

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard for traffic insights
- Go to project > Analytics tab

### Error Tracking
- Check Vercel logs: Project > Logs
- Filter by severity, time range

### Database Performance
- Monitor in Supabase dashboard
- Check slow queries, connection pool

---

## 🆘 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all dependencies in package.json
- Ensure TypeScript types are correct

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set correctly
- Test database connection string

### Authentication Issues
- Verify Clerk domain is added
- Check Clerk API keys are correct
- Ensure redirect URLs match

### Database Connection Issues
- Verify DATABASE_URL format
- Check Supabase project is not paused
- Test connection with `npx prisma db pull`

---

## 📞 Support

For deployment issues:
- Email: yasirkorai421@gmail.com
- GitHub Issues: https://github.com/yasirkorai421-collab/Leo-s-cafe-/issues

---

## 🎉 You're Done!

Your app should now be live at: **https://your-project.vercel.app**

Next steps:
1. Test all features (menu, checkout, payment, admin)
2. Add real menu items via admin API
3. Generate and print table QR codes
4. Configure loyalty program settings
5. Invite customers to try the app!
