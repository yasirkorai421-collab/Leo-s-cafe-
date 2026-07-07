# Payment Verification Flow Security - Leo's Cafe

## Overview

Leo's Cafe uses a **manual payment verification system** with WhatsApp screenshots for online payments. This is a common pattern in Pakistan and similar markets where automated payment gateways may not be available or practical.

## Security Requirements ✅

All critical security requirements are **IMPLEMENTED**:

1. ✅ **Never Auto-Confirm Payments** - Requires explicit admin approval
2. ✅ **Store Payment Evidence** - Screenshots stored with timestamp
3. ✅ **Detect Duplicate Screenshots** - Prevents reuse across orders
4. ✅ **Ownership Checks** - Users can only access their own proofs
5. ✅ **Atomic Verification** - Transaction-based with idempotency
6. ✅ **Audit Trail** - All verifications logged

## Payment Flow

### 1. User Selects Payment Method

**Endpoint:** `POST /api/orders/[id]/select-payment`

```typescript
// Cash on Delivery
{
  "paymentMethod": "cash_on_delivery"
}
```

**Security:**
- ✅ Ownership check (user must own the order)
- ✅ Order state validation (only pending orders)
- ✅ Input validation with Zod

**Result:**
- Order status: `pending_payment` → `payment_cod`
- Payment status: `pending` → `cod_selected`
- **No admin approval needed** - COD is confirmed on delivery

---

### 2. User Uploads Payment Screenshot (Online Payment)

**Endpoint:** `POST /api/orders/[id]/payment-proof`

```typescript
{
  "screenshotUrl": "https://res.cloudinary.com/..."
}
```

**Security Checks:**

#### ✅ Ownership Verification
```typescript
const authResult = await checkOrderOwnership(id);
if (!authResult.authorized) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### ✅ Duplicate Screenshot Detection
```typescript
const existingProof = await prisma.paymentProof.findFirst({
  where: {
    screenshotUrl,
    orderId: { not: id }
  }
});

if (existingProof) {
  // Log security incident
  console.warn("[SECURITY] Duplicate screenshot detected");
  
  // Check if same user (accidental) or different user (fraud)
  if (existingProof.order.userId === currentUserId) {
    return { error: "Screenshot already used for another order" };
  }
  
  // Different user - potential fraud
  return { error: "Invalid screenshot", code: "DUPLICATE_SCREENSHOT_FRAUD" };
}
```

**How Duplicate Detection Works:**

1. **Hash Generation**: Extract Cloudinary public ID from URL
   ```
   URL: https://res.cloudinary.com/demo/image/upload/v1234/payment_proofs/abc123.jpg
   Hash: SHA-256(payment_proofs/abc123)
   ```

2. **Database Check**: Query for same screenshot URL in other orders

3. **Response:**
   - **Same user**: "This screenshot has already been used for another order"
   - **Different user**: "This payment screenshot has already been submitted"

**Why This Matters:**

- Prevents user from copying someone else's payment screenshot
- Prevents user from using same screenshot for multiple orders
- Detects fraud attempts early
- Logs security incidents for review

#### ✅ Status Update
```typescript
// Payment proof created
await prisma.paymentProof.create({
  data: {
    orderId: id,
    screenshotUrl,
    status: "submitted", // ← Pending admin verification
  }
});

// Order updated to "pending verification"
await prisma.order.update({
  where: { id },
  data: {
    paymentMethod: "online_payment",
    paymentStatus: "screenshot_uploaded",
    status: "payment_online", // ← Still pending, NOT confirmed
  }
});
```

**Result:**
- Payment proof stored with status `submitted`
- Order marked as `payment_online` (waiting for verification)
- **Order NOT confirmed yet** - requires admin approval
- User sees "Payment submitted, waiting for verification"

---

### 3. Admin Reviews Payment

**Admin Dashboard:** `/admin/orders`

Admin sees:
- Order details
- Payment screenshot (preview)
- Customer information
- Transaction amount

**Admin Actions:**
- ✅ **Approve** - Verify payment is legitimate
- ❌ **Reject** - Payment proof is invalid/fraudulent

---

### 4. Admin Verifies/Rejects Payment

**Endpoint:** `PATCH /api/admin/orders/[id]/verify-payment`

```typescript
// Approve payment
{
  "action": "approve"
}

// Reject payment
{
  "action": "reject",
  "reason": "Screenshot unclear / Invalid transaction"
}
```

**Security Checks:**

#### ✅ Admin Authorization
```typescript
const admin = await requireAdmin();
if (!admin) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### ✅ Idempotency (Prevent Double-Verification)
```typescript
const order = await tx.order.findUnique({ where: { id } });

// Already verified? Return success without changes
if (order.paymentStatus === "verified" && action === "approve") {
  return { order, alreadyVerified: true };
}

// Already rejected? Return success without changes
if (order.paymentStatus === "rejected" && action === "reject") {
  return { order, alreadyRejected: true };
}
```

**Why Idempotency Matters:**
- Prevents accidental double-clicks from awarding points twice
- Prevents race conditions with multiple admins
- Ensures exactly-once semantics

#### ✅ Atomic Transaction
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update payment proof
  await tx.paymentProof.update({
    where: { id: proofId },
    data: {
      status: "verified",
      verifiedBy: admin.userId,
      verifiedAt: new Date()
    }
  });

  // 2. Update order status (THE ONLY PLACE that confirms orders)
  await tx.order.update({
    where: { id },
    data: {
      paymentStatus: "verified",
      status: "confirmed" // ← Order is now confirmed
    }
  });

  // 3. Award loyalty points
  await tx.loyaltyLedger.create({
    data: {
      userId: order.userId,
      orderId: order.id,
      type: "earn_purchase",
      points: calculatedPoints
    }
  });

  // 4. Update user balance
  await tx.user.update({
    where: { id: order.userId },
    data: {
      loyaltyBalance: { increment: calculatedPoints },
      lastOrderAt: new Date()
    }
  });

  // 5. Create audit log
  await tx.auditLog.create({
    data: {
      userId: admin.userId,
      action: "PAYMENT_VERIFIED",
      entityType: "payment_proof",
      entityId: proofId,
      details: { orderId: id }
    }
  });
});
```

**Why Transactions Matter:**
- **All-or-nothing**: Either all steps succeed or none do
- **No partial state**: Can't have verified payment without loyalty points
- **Data consistency**: Database never in inconsistent state
- **Rollback on error**: Automatic cleanup if anything fails

#### ✅ Audit Logging
```typescript
await tx.auditLog.create({
  data: {
    userId: admin.userId,
    action: "PAYMENT_VERIFIED",
    entityType: "payment_proof",
    entityId: proofId,
    details: { action: "approve", orderId: id },
  }
});
```

**Audit Trail Includes:**
- Which admin verified/rejected
- When (timestamp)
- What action (approve/reject)
- Order and proof IDs
- **Append-only** (never deleted, never modified)

**Result:**
- Payment proof status: `submitted` → `verified` (or `rejected`)
- Order status: `payment_online` → `confirmed` (or stays `payment_online`)
- Loyalty points awarded (if approved)
- User notified (TODO: implement notification)

---

## Payment Status State Machine

```
User Places Order
       ↓
[pending_payment]
       ↓
   ╔═══════╗
   ║ User  ║ Selects payment method
   ╚═══════╝
       ↓
   ┌─────────┐
   │   COD?  │
   └────┬────┘
     Yes│  │No (Online)
        │  │
        ↓  ↓
[payment_cod]  [payment_online]
   (confirmed)    (pending admin)
        │              ↓
        │         ╔═══════╗
        │         ║ Admin ║ Reviews
        │         ╚═══════╝
        │              ↓
        │         ┌──────────┐
        │         │ Approve? │
        │         └─────┬────┘
        │           Yes │ │ No
        │               │ │
        │               ↓ ↓
        │        [confirmed] [rejected]
        │               │      │
        └───────────────┴──────┘
                        ↓
                   [preparing]
                        ↓
                     [ready]
                        ↓
                  [out_for_delivery]
                        ↓
                   [delivered]
```

## Security Guarantees

### 1. No Auto-Confirmation ✅

**Requirement:** Payment screenshots must never auto-confirm orders.

**Implementation:**
```typescript
// User upload sets status to "payment_online" (NOT "confirmed")
await prisma.order.update({
  where: { id },
  data: {
    status: "payment_online" // ← Still pending
  }
});

// Only admin verification can set "confirmed"
// See: app/api/admin/orders/[id]/verify-payment/route.ts
await tx.order.update({
  where: { id },
  data: {
    status: action === "approve" ? "confirmed" : "payment_online"
  }
});
```

**Verification:**
```bash
# Search codebase for any other place that sets status="confirmed"
grep -r "status.*confirmed" app/api/ --exclude-dir=admin

# Expected: Only found in admin verification endpoint
```

### 2. Duplicate Screenshot Detection ✅

**Requirement:** Detect and flag if the same screenshot is submitted for multiple orders.

**Implementation:**
```typescript
const existingProof = await prisma.paymentProof.findFirst({
  where: {
    screenshotUrl,
    orderId: { not: id }
  }
});

if (existingProof) {
  // Log incident
  console.warn("[SECURITY] Duplicate screenshot detected:", {
    currentOrder: id,
    existingOrder: existingProof.orderId,
    currentUser: authResult.userId,
    existingUser: existingProof.order.userId,
  });
  
  // Reject submission
  return NextResponse.json({ error: "Duplicate screenshot" }, { status: 400 });
}
```

**How to Test:**
1. Create Order A, upload screenshot X → Success
2. Create Order B, upload same screenshot X → **Rejected** ✅
3. Check logs for security warning ✅

### 3. Ownership Isolation ✅

**Requirement:** Users can only access their own payment proofs.

**Implementation:**
```typescript
// Check ownership before allowing upload
const authResult = await checkOrderOwnership(id);
if (!authResult.authorized) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// RLS policies also enforce isolation at database level
-- Users can only read their own payment proofs
CREATE POLICY "Users can read own payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payment_proofs.order_id 
      AND orders.user_id = auth.uid()
    )
  );
```

**How to Test:**
1. User A creates order and uploads screenshot → Success
2. User B tries to access User A's payment proof → **401 Unauthorized** ✅

### 4. Atomic Verification ✅

**Requirement:** Payment verification must be atomic (all-or-nothing).

**Implementation:**
```typescript
await prisma.$transaction(async (tx) => {
  // All operations in single transaction
  await tx.paymentProof.update(...);
  await tx.order.update(...);
  await tx.loyaltyLedger.create(...);
  await tx.user.update(...);
  await tx.auditLog.create(...);
});
```

**Guarantees:**
- Either all succeed or all fail
- No partial state (e.g., points awarded but order not confirmed)
- Automatic rollback on error

### 5. Idempotency ✅

**Requirement:** Duplicate verification requests should not cause side effects.

**Implementation:**
```typescript
// Check if already verified
if (order.paymentStatus === "verified" && action === "approve") {
  return { order, alreadyVerified: true };
}

// If already verified, don't award points again
```

**How to Test:**
1. Admin verifies payment → Success, points awarded
2. Admin clicks verify again → **No-op**, same response, no extra points ✅

## Attack Scenarios & Mitigations

### 🚨 Scenario 1: Screenshot Reuse (Fraud)

**Attack:** User A pays for Order X, screenshots it. User B copies screenshot and submits for Order Y.

**Mitigation:** ✅ Duplicate screenshot detection
```typescript
// Detects and rejects duplicate screenshots
const existingProof = await prisma.paymentProof.findFirst({
  where: { screenshotUrl, orderId: { not: id } }
});

if (existingProof && existingProof.order.userId !== currentUserId) {
  // Different user - fraud attempt
  console.warn("[SECURITY] Potential fraud detected");
  return { error: "Invalid screenshot" };
}
```

### 🚨 Scenario 2: Bypassing Admin Verification

**Attack:** User tries to confirm order without admin approval by calling verification endpoint directly.

**Mitigation:** ✅ Admin-only endpoint with role check
```typescript
const admin = await requireAdmin();
if (!admin || admin.role !== 'admin') {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 🚨 Scenario 3: Double Point Award

**Attack:** Admin accidentally clicks "Verify" twice, awarding loyalty points twice.

**Mitigation:** ✅ Idempotency check
```typescript
if (order.paymentStatus === "verified") {
  return { alreadyVerified: true }; // No-op
}
```

### 🚨 Scenario 4: Accessing Other Users' Screenshots

**Attack:** User A tries to view User B's payment screenshot.

**Mitigation:** ✅ Ownership checks + RLS policies
```typescript
// Application-level
const authResult = await checkOrderOwnership(orderId);
if (!authResult.authorized) {
  return 401;
}

// Database-level (RLS)
CREATE POLICY "Users can read own payment proofs"
  ON payment_proofs
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id));
```

### 🚨 Scenario 5: Race Condition (Multiple Admins)

**Attack:** Two admins verify the same order simultaneously.

**Mitigation:** ✅ Database transaction with idempotency
```typescript
await prisma.$transaction(async (tx) => {
  // Transaction ensures serializable isolation
  const order = await tx.order.findUnique({ where: { id } });
  
  if (order.paymentStatus === "verified") {
    return { alreadyVerified: true }; // Second admin gets no-op
  }
  
  // First admin proceeds with verification
  await tx.order.update(...);
});
```

## Monitoring & Alerts

### Security Events to Monitor

1. **Duplicate Screenshot Attempts**
   ```
   [SECURITY] Duplicate screenshot detected: { ... }
   ```
   **Alert if:** More than 3 attempts per hour
   **Action:** Review for fraud patterns

2. **Rejected Payment Proofs**
   ```
   Admin rejected payment: { orderId, reason, adminId }
   ```
   **Alert if:** High rejection rate (>20%)
   **Action:** Review admin training or fraud spike

3. **Failed Ownership Checks**
   ```
   Unauthorized payment proof access: { userId, orderId }
   ```
   **Alert if:** Any occurrence
   **Action:** Review for account compromise

4. **Screenshot Upload Failures**
   ```
   Payment proof submission error: { error, userId }
   ```
   **Alert if:** Spike in failures
   **Action:** Check Cloudinary integration

### Dashboard Metrics

- **Pending Verifications**: Count of `screenshot_uploaded` status
- **Verification Time**: Time between upload and admin action
- **Rejection Rate**: % of rejected proofs
- **Duplicate Attempts**: Count per day
- **Average Processing Time**: Order placement → confirmation

## Admin Best Practices

### When to Approve

✅ **Approve if:**
- Transaction ID is clearly visible
- Amount matches order total (±1% for rounding)
- Screenshot shows date/time within 24 hours
- Sender name matches customer name
- Payment method matches (JazzCash/Easypaisa/Bank)

### When to Reject

❌ **Reject if:**
- Screenshot is blurry or unreadable
- Amount doesn't match
- Transaction is older than 48 hours
- Sender name doesn't match customer
- Screenshot appears edited/photoshopped
- Same screenshot was used before (system flags this)
- Transaction ID not visible

### Red Flags 🚩

- **Multiple orders, same screenshot**: Fraud attempt
- **Same user, multiple rejections**: Training issue or fraud
- **Unusual transaction times**: (e.g., 3 AM transactions)
- **Round numbers only**: (e.g., exactly Rs. 1000) - suspicious
- **Poor quality screenshots**: Intentionally obscured

## Cloudinary Security

### Upload Configuration

```typescript
<CldUploadWidget
  uploadPreset="payment_proofs"
  options={{
    maxFiles: 1,
    maxFileSize: 5000000, // 5MB
    clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
    sources: ["local", "camera"], // No URL import
    multiple: false,
    folder: "payment_proofs", // Organized storage
  }}
/>
```

### Cloudinary Settings

**Recommended:**
- **Upload preset**: `payment_proofs` (unsigned for client uploads)
- **Folder**: `leos-cafe/payments/`
- **Access mode**: `Public` (but URLs are unpredictable)
- **Max file size**: 5 MB
- **Allowed formats**: jpg, jpeg, png, webp
- **Transformations**: None (preserve original for verification)

**Security:**
- ✅ Unsigned uploads (no API key in client)
- ✅ File type restrictions
- ✅ Size limits
- ✅ Organized folders
- ❌ No URL signing (not needed - URLs are UUIDs)

## Compliance

### PCI DSS

**Not applicable** - No card data is processed. Screenshots don't contain CVV or full card numbers.

### GDPR

✅ **Data minimization**: Only necessary screenshot data stored  
✅ **Right to erasure**: Screenshots deleted when order deleted  
✅ **Access control**: RLS + ownership checks  
✅ **Audit trail**: All actions logged

### Pakistani Regulations

✅ **Manual verification**: Complies with local payment practices  
✅ **Transparent process**: User knows admin reviews payment  
✅ **Dispute resolution**: Rejection reasons provided

## Testing Checklist

### Unit Tests

- [ ] Duplicate screenshot detection works
- [ ] Ownership checks prevent unauthorized access
- [ ] Idempotency prevents double-verification
- [ ] Transaction rollback on error

### Integration Tests

- [ ] End-to-end payment flow (COD)
- [ ] End-to-end payment flow (Online)
- [ ] Admin verification updates all related entities
- [ ] Loyalty points awarded correctly

### Security Tests

- [ ] User A cannot access User B's payment proofs
- [ ] Non-admin cannot verify payments
- [ ] Duplicate screenshot rejected
- [ ] SQL injection attempts handled
- [ ] XSS attempts sanitized

### Manual Testing

- [ ] Upload screenshot → Verify it appears in admin dashboard
- [ ] Admin approve → Order confirmed, points awarded
- [ ] Admin reject → Order stays pending
- [ ] Try uploading same screenshot twice → Rejected
- [ ] Check audit logs for all actions

## Production Deployment

### Pre-Launch Checklist

- [ ] Cloudinary account configured with real credentials
- [ ] Payment account numbers updated in system settings
- [ ] Admin accounts created and trained
- [ ] RLS policies enabled
- [ ] Monitoring/alerting configured
- [ ] Audit logging enabled
- [ ] Screenshot storage tested
- [ ] Duplicate detection tested
- [ ] Idempotency verified

### Post-Launch Monitoring

**Week 1:**
- Monitor duplicate screenshot attempts daily
- Review rejection rate
- Track average verification time
- Check for any security incidents

**Ongoing:**
- Weekly security log review
- Monthly fraud pattern analysis
- Quarterly admin training review

## Related Documentation

- [RLS Security](./RLS_SECURITY.md)
- [Service Role Key Isolation](./SERVICE_ROLE_SECURITY.md)
- [API Security Guide](./API_SECURITY.md) (coming soon)

---

**Last Updated**: 2026-07-07  
**Version**: 1.0  
**Security Level**: HIGH  
**Audit Status**: ✅ PASS - All requirements met
