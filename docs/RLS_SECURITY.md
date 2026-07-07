# Row Level Security (RLS) - Leo's Cafe

## Critical Security Notice

**⚠️ WITHOUT RLS, YOUR DATABASE IS EXPOSED ⚠️**

Without Row Level Security enabled, any user with the Supabase anon key (which is public in your frontend code) can:
- Read ALL users' orders, payments, loyalty points
- Modify other users' data
- Access private payment screenshots
- View all vouchers and redeem them
- Read personal information of all customers

**RLS is MANDATORY before going to production.**

## What is Row Level Security (RLS)?

Row Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access based on policies. Even with the database connection string, users can only see/modify rows that match the policy conditions.

### How It Works

```sql
-- Enable RLS on a table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create a policy
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  USING (auth.uid() = user_id);
```

Now when a user queries:
```sql
SELECT * FROM orders;
```

PostgreSQL automatically adds:
```sql
SELECT * FROM orders WHERE user_id = current_user_id;
```

## Setup Instructions

### Step 1: Deploy RLS Policies to Supabase

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Open the file `prisma/migrations/add_rls_policies.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run**
6. Wait for "Success" message
7. Verify: Check that ~50+ policies were created

**Option B: Via Command Line**

```bash
# Get your direct database URL (not pooled)
# From Supabase Dashboard → Settings → Database → Connection String → URI

# Run the migration
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f prisma/migrations/add_rls_policies.sql
```

**Option C: Via Prisma Migrate (if using Prisma migrations)**

```bash
# Convert SQL file to Prisma migration
mkdir -p prisma/migrations/20260707_add_rls
cp prisma/migrations/add_rls_policies.sql prisma/migrations/20260707_add_rls/migration.sql

# Apply migration
npx prisma migrate deploy
```

### Step 2: Verify RLS is Enabled

Run these verification queries in Supabase SQL Editor:

```sql
-- Check RLS is enabled on all tables
SELECT 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'orders', 'order_items', 'payment_proofs', 
    'reviews', 'loyalty_ledger', 'vouchers', 'review_point_claims',
    'favorites', 'reservations', 'table_sessions'
  )
ORDER BY tablename;
```

Expected output: All tables should show "✅ RLS Enabled"

```sql
-- Count policies created
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
```

Expected output: ~50+ policies

```sql
-- List all policies by table
SELECT 
  tablename, 
  policyname,
  cmd as operation,
  qual as using_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Step 3: Test RLS Policies

**Test 1: User Isolation (Critical)**

```sql
-- Set session to user 1
SET LOCAL "request.jwt.claims" = '{"sub": "user-id-1"}';

-- Try to read user 2's orders (should return empty)
SELECT * FROM orders WHERE user_id = 'user-id-2';
-- Expected: 0 rows

-- Read own orders (should succeed)
SELECT * FROM orders WHERE user_id = 'user-id-1';
-- Expected: Your orders
```

**Test 2: Admin Access**

```sql
-- Set session to admin user
SET LOCAL "request.jwt.claims" = '{"sub": "admin-user-id"}';

-- Admins should see all orders
SELECT COUNT(*) FROM orders;
-- Expected: All orders count
```

**Test 3: Anonymous Access**

```sql
-- Reset session (anonymous)
RESET "request.jwt.claims";

-- Try to read orders (should return empty)
SELECT * FROM orders;
-- Expected: 0 rows

-- Try to read public data (should succeed)
SELECT * FROM menu_items LIMIT 5;
-- Expected: Menu items
```

## RLS Policy Summary

### Users Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own profile only | Via webhook | Own profile (except role) | ❌ |
| Admin | All users | ✅ | All users | ❌ |
| Anonymous | ❌ | Via webhook | ❌ | ❌ |

### Orders Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own orders | Own orders | Own pending orders | ❌ |
| Admin | All orders | ✅ | All orders | ❌ |
| Delivery | Assigned orders | ❌ | Assigned order status | ❌ |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

### Payment Proofs Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own proofs | Own proofs | ❌ | ❌ |
| Admin | All proofs | ❌ | Verify/reject | ❌ |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

### Loyalty Ledger Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own history | ❌ | ❌ | ❌ |
| Admin | All history | Adjustments | ❌ | ❌ |
| System | ❌ | Auto entries | ❌ | ❌ |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

### Vouchers Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own vouchers | ❌ | Mark as used | ❌ |
| Admin | All vouchers | ✅ | ✅ | ❌ |
| System | ❌ | Auto generation | ❌ | ❌ |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

### Reviews Table

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | All reviews | Only for delivered items | Own reviews | Own reviews |
| Admin | All reviews | ✅ | All reviews | All reviews |
| Anonymous | All reviews (public) | ❌ | ❌ | ❌ |

### Favorites, Reservations, Review Claims

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Own only | Own only | Own only (limited) | Own only |
| Admin | All | ✅ | All | All |
| Anonymous | ❌ | ❌ | ❌ | ❌ |

### Table Sessions (Dine-in QR)

| Role | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| User | Active sessions only | ❌ | ❌ | ❌ |
| Admin | All sessions | ✅ | ✅ | ✅ |
| System | ❌ | Auto creation | ✅ | ❌ |
| Anonymous | Active sessions only | ❌ | ❌ | ❌ |

## Security Architecture

### Authentication Flow

```
1. User signs in with phone OTP
   ↓
2. Supabase Auth creates session
   ↓
3. JWT token contains: { sub: "user-uuid", role: "authenticated" }
   ↓
4. Client makes query with JWT
   ↓
5. PostgreSQL extracts auth.uid() from JWT
   ↓
6. RLS policies filter rows based on auth.uid()
   ↓
7. User receives only their own data
```

### Service Role vs Anon Key

**Anon Key (Public - in client code):**
- Subject to ALL RLS policies
- Can only access data allowed by policies
- Safe to expose in frontend
- Used for user-initiated actions

**Service Role Key (Secret - server-side only):**
- **BYPASSES ALL RLS POLICIES**
- Full database access
- **NEVER expose to client**
- Used for:
  - Admin operations
  - Cron jobs (birthday/winback)
  - System-generated vouchers
  - Backend API routes

### Critical Security Rules

1. ✅ **Always use anon key in client code**
2. ❌ **Never use service role key in client code**
3. ✅ **Always enable RLS on user-accessible tables**
4. ✅ **Test policies before production**
5. ✅ **Log policy violations for monitoring**

## Common Pitfalls & Solutions

### Pitfall 1: Forgetting to Enable RLS

```sql
-- ❌ DANGEROUS: Table exists but RLS not enabled
CREATE TABLE sensitive_data (...);
-- Anyone can read all rows!

-- ✅ SECURE: Enable RLS
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own data" ON sensitive_data USING (auth.uid() = user_id);
```

### Pitfall 2: Overly Permissive Policies

```sql
-- ❌ DANGEROUS: Policy allows all users
CREATE POLICY "bad_policy" ON orders USING (true);

-- ✅ SECURE: Policy restricts to owner
CREATE POLICY "good_policy" ON orders USING (auth.uid() = user_id);
```

### Pitfall 3: Missing Policies for Operations

```sql
-- ❌ Users can't update even their own rows (no UPDATE policy)
CREATE POLICY "read_only" ON orders FOR SELECT USING (auth.uid() = user_id);

-- ✅ Add policies for all needed operations
CREATE POLICY "read_own" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "update_own" ON orders FOR UPDATE USING (auth.uid() = user_id);
```

### Pitfall 4: Not Testing with Real User Sessions

```sql
-- ❌ Testing as superuser (bypasses RLS)
SELECT * FROM orders; -- Shows all orders

-- ✅ Test as actual user
SET LOCAL "request.jwt.claims" = '{"sub": "user-123"}';
SELECT * FROM orders; -- Shows only user-123's orders
```

### Pitfall 5: Exposing Service Role Key

```typescript
// ❌ CRITICAL VULNERABILITY
const NEXT_PUBLIC_SUPABASE_SERVICE_KEY = "service_role_key";

// ✅ SECURE: Server-side only
const supabaseAdmin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

## Monitoring & Auditing

### Enable Policy Logging (Optional)

```sql
-- Log RLS policy evaluations (expensive, dev only)
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_duration = on;
```

### Query Slow Policies

```sql
-- Find policies causing performance issues
SELECT 
  schemaname,
  tablename,
  policyname,
  pg_get_expr(qual, 'pg_policy'::regclass) as policy_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check for Tables Without RLS

```sql
-- Find unprotected tables (should be empty)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
  AND tablename NOT LIKE '_prisma%'
  AND rowsecurity = false;
```

### Audit User Access Attempts

```sql
-- Track unauthorized access attempts
-- (Requires pgaudit extension or custom logging)
```

## Performance Considerations

### RLS adds overhead to every query:

**Impact:**
- Small (<1ms per query for simple policies)
- Indexed columns help (user_id should be indexed)
- Complex subqueries in policies can slow down queries

**Optimization:**

```sql
-- ✅ Fast: Direct column comparison
CREATE POLICY fast_policy ON orders USING (auth.uid() = user_id);

-- ⚠️ Slower: Subquery
CREATE POLICY slow_policy ON order_items USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ✅ Optimized: Add index
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

## Compliance

### GDPR Compliance

✅ RLS helps with:
- Data minimization (users only see own data)
- Access control (automated enforcement)
- Right to erasure (DELETE policies)
- Data portability (SELECT policies)

### PCI DSS Compliance

✅ RLS helps with:
- Requirement 7: Restrict access to data by business need-to-know
- Requirement 8: Identify and authenticate access
- Requirement 10: Track and monitor access

## Emergency Procedures

### If RLS is Accidentally Disabled

```sql
-- 1. Check which tables lost RLS
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;

-- 2. Re-enable immediately
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- (repeat for all affected tables)

-- 3. Verify policies still exist
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 4. Audit access logs for unauthorized access during downtime
```

### If Policies Are Deleted

```bash
# Re-run the migration
psql $DATABASE_URL -f prisma/migrations/add_rls_policies.sql
```

## Pre-Production Checklist

- [ ] RLS enabled on all user-accessible tables
- [ ] Policies created and tested for all operations
- [ ] User isolation tested (user A cannot see user B's data)
- [ ] Admin access tested (can see all data)
- [ ] Service role key is NOT in client code
- [ ] Anon key is used in client code
- [ ] All API routes use correct Supabase client (anon vs service)
- [ ] Performance tested with realistic data volume
- [ ] Monitoring/alerting configured for policy violations
- [ ] Documentation updated with RLS architecture
- [ ] Team trained on RLS policies
- [ ] Rollback plan documented

## Related Documentation

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Service Role Key Isolation](./SERVICE_ROLE_SECURITY.md) (next task)
- [API Security Guide](./API_SECURITY.md) (coming soon)

---

**Last Updated**: 2026-07-07  
**Version**: 1.0  
**Security Level**: CRITICAL  
**External Audit**: Recommended before production launch
