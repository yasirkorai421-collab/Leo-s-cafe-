# Leo's Café - Admin Credentials

## Admin Account Details

**Email:** `admin@leoscafe.com`  
**Password:** `Leo@Admin2026`  
**Role:** Admin  
**Created:** July 4, 2026

---

## Setup Instructions

### Option 1: Create Admin via Signup Page (Recommended)

1. Go to `http://localhost:3001/auth/signup`
2. Fill in the signup form with the admin credentials above
3. Use any birthday (e.g., `1990-01-01`)
4. Complete the signup process
5. After signup, you need to manually update the user role in Supabase:
   - Go to Supabase Dashboard: https://zlszqcxqunihwzlhlasj.supabase.co
   - Navigate to Authentication → Users
   - Find the admin user (`admin@leoscafe.com`)
   - Click on the user
   - Under "User Metadata", add: `{ "role": "admin" }`
   - Save changes

### Option 2: Create Admin Directly in Supabase

1. Go to Supabase Dashboard: https://zlszqcxqunihwzlhlasj.supabase.co
2. Navigate to Authentication → Users
3. Click "Invite user" or "Add user"
4. Use the admin email above
5. Set a temporary password
6. Under "User Metadata", add: `{ "role": "admin" }`
7. Send invite or confirm email
8. Login with the admin credentials

---

## Database Details

**Supabase Project URL:** `https://zlszqcxqunihwzlhlasj.supabase.co`  
**Database Host:** `aws-0-ap-southeast-1.pooler.supabase.com`  
**Database Port:** `6543`  
**Database Name:** `postgres`  
**Database User:** `postgres.zlszqcxqunihwzlhlasj`  
**Database Password:** `Yas456ir123@`

---

## Admin Access

Once the admin role is set, the admin user can access:

- **Admin Dashboard:** `http://localhost:3001/admin`
- **Manage Orders:** `http://localhost:3001/admin/orders`
- **Manage Tables:** `http://localhost:3001/admin/tables`
- **Settings:** `http://localhost:3001/admin/settings`
- **Admin API Routes:** All `/api/admin/*` endpoints

---

## Security Notes

1. **Change the admin password** after first login
2. **Update database credentials** in production
3. **Never commit** `.env.local` or this file to public repositories
4. **Enable MFA** on the admin account in Supabase for added security
5. **Rotate credentials** regularly

---

## Quick Login Test

1. Start the development server: `npm run dev`
2. Open browser: `http://localhost:3001`
3. You should be redirected to `/auth/login`
4. Enter admin credentials above
5. After login, you should be redirected to homepage
6. Navigate to `/admin` to access admin dashboard

---

## Troubleshooting

**Can't access admin routes:**
- Verify the user has `role: "admin"` in user_metadata in Supabase
- Clear browser cache and cookies
- Check browser console for errors

**Login not working:**
- Verify credentials are correct
- Check if email is confirmed in Supabase
- Ensure Supabase environment variables are correct in `.env.local`

**Redirecting to login after successful login:**
- Check middleware.ts is configured correctly
- Verify session is being created in Supabase
- Check browser cookies are enabled
