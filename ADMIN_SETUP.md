# Admin & Delivery Personnel Setup Guide

This guide explains how to set up admin and delivery personnel accounts for Leo's Cafe management system.

## Overview

The system supports three types of user roles:
- **Admin**: Full system access, can manage orders, reservations, menu, and delivery personnel
- **Delivery Person**: Can view and update delivery order statuses
- **User**: Regular customers (self-registration via OTP)

## Configuration

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Admin Credentials (Required)
ADMIN_EMAIL="admin@leoscafe.com"
ADMIN_PASSWORD="your-secure-admin-password"
ADMIN_PHONE="+923001234567"
ADMIN_NAME="Admin"

# Delivery Personnel (Optional)
# Format: NAME|EMAIL|PASSWORD|PHONE separated by semicolons
DELIVERY_PERSONNEL="Rider 1|rider1@leoscafe.com|rider1pass|+923001111111;Rider 2|rider2@leoscafe.com|rider2pass|+923002222222"

# Supabase (Required for auth)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"
```

### 2. Database Setup

First, make sure your database schema is up to date:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 3. Seed Users

Run the seeding script to create admin and delivery personnel accounts:

```bash
# Seed all users (admin + delivery personnel)
npm run seed:users

# Or use tsx directly
npx tsx scripts/seed-users.ts
```

The script will:
1. Create admin user in Supabase Auth
2. Create admin user in database with `admin` role
3. Create delivery personnel in Supabase Auth
4. Create delivery personnel in database with `delivery_person` role

## Login

### Admin Login
- URL: `/admin/login`
- Use the email and password configured in `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- No signup process - credentials are pre-configured

### Delivery Personnel Login
- URL: `/delivery/login`
- Use the email and password configured in `DELIVERY_PERSONNEL` environment variable

## Managing Delivery Personnel

### Via Environment Variables (Recommended for Initial Setup)

1. Add new delivery personnel to `DELIVERY_PERSONNEL` in `.env.local`:
```bash
DELIVERY_PERSONNEL="Existing Rider|email@example.com|pass|phone;New Rider|new@example.com|newpass|+923001234567"
```

2. Run the seed script again:
```bash
npm run seed:users
```

### Via Admin Dashboard (Coming Soon - Task #10)

Admins will be able to:
- Add new delivery personnel
- Update credentials
- Deactivate/activate delivery accounts
- View delivery performance

## Security Best Practices

1. **Strong Passwords**: Use strong, unique passwords for all accounts
2. **Environment Protection**: Never commit `.env.local` to version control
3. **Password Rotation**: Regularly update admin and delivery passwords
4. **Access Monitoring**: Review audit logs regularly
5. **HTTPS Only**: Always use HTTPS in production

## Troubleshooting

### Admin Can't Login

1. Verify environment variables are set:
```bash
echo $ADMIN_EMAIL
echo $ADMIN_PASSWORD
```

2. Run seed script again:
```bash
npm run seed:users
```

3. Check Supabase dashboard for user existence

### Delivery Personnel Can't Login

1. Verify `DELIVERY_PERSONNEL` format is correct (NAME|EMAIL|PASSWORD|PHONE)
2. Check for typos in semicolon separators
3. Run seed script with verbose logging

### "User not found in database" Error

This means the user exists in Supabase Auth but not in your database. Run:
```bash
npm run seed:users
```

### Role Verification Failed

The middleware checks user roles. If a user has the wrong role:
1. Update role in database directly:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@leoscafe.com';
```

2. Or delete and re-seed:
```bash
-- Delete from Supabase Auth dashboard
-- Then run:
npm run seed:users
```

## Production Deployment

### Vercel / Similar Platforms

1. Add environment variables in platform dashboard
2. Add seed script to build process:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && npm run seed:users && next build"
  }
}
```

### Manual Deployment

1. Set environment variables on server
2. Run migrations:
```bash
npx prisma migrate deploy
```

3. Seed users:
```bash
npm run seed:users
```

## Updates & Maintenance

### Changing Admin Password

1. Update `ADMIN_PASSWORD` in `.env.local`
2. Run seed script:
```bash
npm run seed:users
```

### Adding New Delivery Personnel

1. Append to `DELIVERY_PERSONNEL` environment variable
2. Run seed script:
```bash
npm run seed:users
```

### Removing Delivery Personnel

- Option 1: Remove from environment variable and re-seed (will not delete existing user)
- Option 2: Use admin dashboard (when implemented)
- Option 3: Delete directly from Supabase Auth and database

## Support

For issues or questions:
1. Check this documentation first
2. Review error logs
3. Check Supabase Auth dashboard
4. Verify environment variables
5. Contact system administrator

---

**Note**: Admin and delivery personnel credentials are sensitive. Handle with care and never share publicly.
