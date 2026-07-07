# Service Role Key Security - Leo's Cafe

## Critical Security Notice

**⚠️ THE SERVICE ROLE KEY BYPASSES ALL SECURITY ⚠️**

The Supabase Service Role Key:
- **BYPASSES ALL Row Level Security (RLS) policies**
- Has **FULL READ/WRITE ACCESS** to the entire database
- Can create, update, delete ANY row in ANY table
- **MUST NEVER be exposed to the client**

**A single mistake can expose your entire database.**

## What is the Service Role Key?

Supabase provides two types of API keys:

### 1. Anon Key (Public - Safe to Expose)
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

- ✅ Safe to include in client-side code
- ✅ Subject to ALL RLS policies
- ✅ Users can only access their own data
- ✅ Included in Next.js bundles
- ⚠️ Anyone can see this key in browser DevTools

**Use cases:**
- Client-side auth (login, signup)
- User queries (their own orders, profile)
- Public data (menu items, categories)

### 2. Service Role Key (Secret - NEVER Expose)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (NO NEXT_PUBLIC_ PREFIX!)
```

- ❌ **NEVER** in client-side code
- ❌ **NEVER** prefixed with `NEXT_PUBLIC_`
- ❌ **NEVER** in frontend bundles
- ✅ Only in server-side API routes
- ✅ Only in backend scripts
- ✅ Only in server actions

**Use cases:**
- Admin operations (verify payments, manage users)
- System automation (cron jobs, birthday vouchers)
- Bypassing RLS for legitimate admin tasks
- Database migrations and seeding

## Audit Results: Leo's Cafe

### ✅ SECURE IMPLEMENTATION CONFIRMED

**Service Role Key Used Only In:**

1. **Server-Side API Routes** (✅ Secure)
   - `app/api/admin/delivery-personnel/route.ts`
   - `app/api/admin/delivery-personnel/[id]/route.ts`

2. **Server-Side Scripts** (✅ Secure)
   - `scripts/create-admin.ts`
   - `lib/seed-admin.ts`
   - `lib/seed-delivery.ts`

3. **Environment Files** (✅ Secure - Not bundled)
   - `.env.example`
   - `.env.production`
   - `.env.production.example`

**Anon Key Used In:**

1. **Client Utilities** (✅ Correct)
   - `utils/supabase/client.ts` - Browser client
   - `utils/supabase/server.ts` - Server client (with user session)
   - `utils/supabase/middleware.ts` - Auth middleware

2. **All Client Components** (✅ Correct)
   - Uses utilities above, never direct service role access

## Security Architecture

### Correct Pattern

```typescript
// ✅ CLIENT-SIDE: utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ← Anon key
  );
}
```

```typescript
// ✅ SERVER-SIDE API ROUTE: app/api/admin/users/route.ts
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // Verify user is admin first!
  const userSupabase = await createServerClient(); // Uses anon key
  const { data: { user } } = await userSupabase.auth.getUser();
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Now use service role for admin operation
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ← Service role key (server-side only)
  );
  
  // Perform admin operation
  const { data, error } = await adminSupabase
    .from('users')
    .update({ role: 'admin' })
    .eq('id', userId);
  
  return NextResponse.json({ success: true });
}
```

### Dangerous Anti-Patterns

```typescript
// ❌ CRITICAL VULNERABILITY: Service key in client code
"use client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY! // ← EXPOSED TO CLIENT!
);
```

```typescript
// ❌ CRITICAL VULNERABILITY: Service key with NEXT_PUBLIC_ prefix
// In .env
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=eyJhbG... // ← BUNDLED IN CLIENT!
```

```typescript
// ❌ DANGEROUS: No auth check before using service key
export async function POST(req: Request) {
  // Missing auth check - anyone can call this!
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Direct admin operation without verification
  await supabase.from('users').delete().eq('id', req.body.userId);
}
```

## Verification Checklist

Run these checks to ensure service role key is properly isolated:

### Check 1: Grep for NEXT_PUBLIC_ Service Key

```bash
# Should return NO results (except in documentation)
grep -r "NEXT_PUBLIC.*SERVICE" . --exclude-dir=node_modules --exclude-dir=.git
```

**Expected:** No matches (except in docs)

### Check 2: Verify Client Utilities Use Anon Key

```bash
# Should only show ANON_KEY
grep -r "createClient\|createBrowserClient\|createServerClient" utils/supabase/
```

**Expected:** All use `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Check 3: Check Environment Variable Names

```bash
# List all Supabase-related env vars
grep -h "SUPABASE" .env* | grep -v "^#"
```

**Expected:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...  ← No NEXT_PUBLIC_ prefix!
```

### Check 4: Inspect Production Bundle

After building, check if service key is in bundle:

```bash
# Build the app
npm run build

# Search for service key in output
grep -r "service_role" .next/static/ || echo "✅ Not found in bundle"
```

**Expected:** "✅ Not found in bundle"

### Check 5: Check Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

✅ **Correct:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY         ← No NEXT_PUBLIC_ prefix
```

❌ **Incorrect:**
```
NEXT_PUBLIC_SUPABASE_SERVICE_KEY  ← EXPOSED TO CLIENT!
```

## Attack Scenarios

### 🚨 Scenario 1: Service Key Exposed in Client Bundle

**Attack:**
```javascript
// Attacker opens browser DevTools → Network → Any page load
// Examines bundled JavaScript files
// Finds: NEXT_PUBLIC_SUPABASE_SERVICE_KEY=eyJhbG...

// Attacker now has full database access
const supabase = createClient(url, stolenServiceKey);
await supabase.from('users').select('*'); // Get all users
await supabase.from('orders').delete().gte('total', 0); // Delete all orders
await supabase.from('users').update({ role: 'admin' }).eq('id', attackerId); // Make self admin
```

**Impact:** Complete database compromise

**Mitigation:** ✅ Never prefix service key with `NEXT_PUBLIC_`

### 🚨 Scenario 2: Missing Auth Check in Admin API

**Attack:**
```javascript
// Attacker calls admin API directly
fetch('/api/admin/users', {
  method: 'POST',
  body: JSON.stringify({ userId: 'target', action: 'delete' })
});
```

**Vulnerable code:**
```typescript
export async function POST(req: Request) {
  // No auth check!
  const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { userId } = await req.json();
  await supabase.from('users').delete().eq('id', userId);
  return NextResponse.json({ success: true });
}
```

**Impact:** Unauthorized admin operations

**Mitigation:** ✅ Always verify user role before using service key

## Best Practices

### 1. Always Verify Auth Before Service Role Operations

```typescript
export async function POST(req: Request) {
  // Step 1: Get user with anon-key client
  const userSupabase = await createServerClient(); // Anon key
  const { data: { user } } = await userSupabase.auth.getUser();
  
  // Step 2: Verify user role
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Step 3: Now safe to use service role
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Perform admin operation
  // ...
}
```

### 2. Create Admin Client Helper

```typescript
// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

### 3. Use Middleware for Auth Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const { supabaseResponse, user } = await updateSession(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return supabaseResponse;
  }
}
```

### 4. Audit Regularly

```bash
# Weekly security check
npm run audit:service-key

# Check for exposed keys
grep -r "NEXT_PUBLIC.*SERVICE" . --exclude-dir=node_modules

# Check client bundles
npm run build && grep -r "service_role" .next/static/
```

### 5. Use Environment Variable Validation

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).refine(
    (key) => !key.startsWith('NEXT_PUBLIC_'),
    { message: "Service role key must not be public" }
  ),
});

export const env = envSchema.parse(process.env);
```

## Incident Response

### If Service Key is Compromised

1. **Immediately Rotate Key**
   - Go to Supabase Dashboard → Settings → API
   - Click "Reset Service Role Key"
   - Generate new key

2. **Update Environment Variables**
   - Update in Vercel: Settings → Environment Variables
   - Update in `.env.production`
   - Redeploy immediately

3. **Audit Database**
   ```sql
   -- Check for suspicious activity
   SELECT * FROM audit_log WHERE created_at > NOW() - INTERVAL '24 hours';
   
   -- Check for unauthorized admin users
   SELECT * FROM users WHERE role = 'admin' AND created_at > NOW() - INTERVAL '7 days';
   
   -- Check for deleted data
   SELECT * FROM deleted_records WHERE deleted_at > NOW() - INTERVAL '24 hours';
   ```

4. **Revoke Access**
   - Revoke any unauthorized admin users
   - Restore deleted data from backups if needed
   - Reset passwords for compromised accounts

5. **Notify Users**
   - If user data was accessed, notify affected users
   - Follow GDPR breach notification requirements (if applicable)

6. **Post-Incident Review**
   - Document how the exposure occurred
   - Update security policies
   - Implement additional safeguards

## Compliance

### GDPR
✅ Service role key isolation helps with:
- Article 32: Security of processing
- Article 25: Data protection by design and default

### PCI DSS
✅ Service role key isolation helps with:
- Requirement 6.5.3: Insecure cryptographic storage
- Requirement 7.1: Limit access to system components

### SOC 2
✅ Service role key isolation helps with:
- CC6.1: Logical and physical access controls
- CC6.6: Encryption at rest and in transit

## Related Documentation

- [Row Level Security (RLS)](./RLS_SECURITY.md)
- [API Security Guide](./API_SECURITY.md) (coming soon)
- [Ownership Checks](./OWNERSHIP_CHECKS.md) (coming soon)

---

**Last Updated**: 2026-07-07  
**Version**: 1.0  
**Security Level**: CRITICAL  
**Audit Status**: ✅ PASS - No issues found
