# CLAUDE.md — Leo's Cafe: Non-Negotiable Rules

Read this file in full before starting any task. These rules override convenience,
speed, or what seems like the obvious implementation. If a task would require
breaking one of these, stop and flag it instead of proceeding.

## Security — never violate these

1. **Every user-data query is scoped to the session's user_id.**
   Orders, loyalty balance, vouchers, favorites, profile — always filter by
   `request.session.user_id` server-side. Never trust a user/order ID from the
   URL, query string, or request body as sufficient on its own. An ID in a URL
   is only used *after* confirming it belongs to the requesting user (or the
   requester is admin).

2. **Order status can only become `confirmed` in one place: the admin
   verify-payment handler.** No other code path — no client request, no
   webhook, no "helper" function — may set `order.status = confirmed` or
   `payment_status = verified`. If you're writing code that needs to confirm
   an order, you're calling the existing handler, not duplicating its logic.
   This is one instance of a general principle: every value-granting state
   transition (order confirmation, review-claim approval in rule 5, voucher
   issuance) has exactly one code path that can make it happen. If you find
   yourself writing a second path to reach the same state, stop — call the
   existing one instead.

3. **No client-supplied number is ever trusted for money or points.**
   Prices, delivery fees, discount amounts, voucher validity/value, point
   redemption amounts, loyalty balances — every business value that affects
   what gets charged or credited is rebuilt server-side from the database at
   request time, never read from the client payload. If a request body
   contains a `price`, `deliveryFee`, `discountAmount`, `pointsToRedeem`, or
   similar field, treat it as a hint to validate against, never as the
   value you act on. This applies at order-creation time too, not just at
   redemption/confirmation — the cart total submitted at checkout is
   recomputed from current menu prices, not trusted from the client cart
   state.

4. **Dine-in table sessions: one active session per table, always.**
   Before creating a new `table_sessions` row, check for an existing row with
   `status = active` for that `table_id` and reject the scan if one exists.
   QR tokens are signed (HMAC) and verified server-side before any database
   lookup. Session identity lives in an httpOnly cookie, never in a URL param
   or localStorage.

5. **Google-review points and payment confirmations require admin approval.**
   Never auto-approve either from a client action. Points are credited only
   after an admin marks a claim `approved`.

6. **No card data, ever.** This system is COD + WhatsApp-screenshot payment
   only. Don't add a card number, CVV, or expiry field anywhere, even as an
   unused placeholder.

7. **No secrets or internal detail reach the client — or the logs.** No stack
   traces, no raw database error text, no `X-Powered-By` header, in
   production responses. Generic error messages to the client; full detail
   in server logs only. Admin-only routes return 404 to a non-admin caller,
   not 403. Server logs themselves must never contain tokens, OTPs,
   passwords, signed-upload secrets, or full request bodies on auth/payment
   routes — log identifiers (user id, order id) and event type, not the
   sensitive payload.

8. **Every form is validated with Zod, client and server.** Client-side
   validation is for UX only — never trust it as the actual gate. The same
   schema (from `/schemas`) validates again inside the API route handler.

9. **Rate limit auth (login and OTP), order-create, screenshot-upload,
   review-claim, QR-scan, redeem, voucher-issuance, and admin endpoints.**
   Use the existing Upstash Redis rate limiter — don't ship a new endpoint
   in these categories without it. This list is the floor, not the
   ceiling: any endpoint that authenticates a user, spends money/points, or
   is restricted to admins gets a rate limit by default unless there's a
   specific reason it doesn't need one.

10. **Multi-step financial/loyalty mutations run in a single DB transaction.**
    Payment verification + points credit, redemption + ledger write, voucher
    issuance + ledger write — each such group commits atomically or not at
    all. Never let a crash or error leave one half written.

11. **Value-granting operations must be idempotent.** Admin approving the same
    payment or review claim twice (double-click, retry, replay) must not
    credit points, issue a voucher, or change state twice. Check current
    state inside the same transaction before granting, not before the
    request started.

12. **Uniqueness invariants are enforced at the database level, not just in
    application code.** "One active session per table" (rule 4) and any
    similar invariant must be backed by a DB unique constraint (or
    equivalent) so two concurrent requests can't both pass an
    application-level check and both succeed. The check-then-insert must
    happen inside one transaction.

13. **CSRF protection on authenticated state-changing requests.** Any
    cookie-authenticated POST/PATCH/DELETE (this includes the dine-in
    session cookie flow in rule 4) needs CSRF protection, not just
    same-origin assumptions.

14. **Uploaded files are tied to their owning record and never publicly
    enumerable.** Payment screenshots and any other user upload must not be
    guessable or listable by ID alone — access goes through an
    ownership-checked route, not a public/static URL pattern. The storage
    object name/key itself must be a cryptographically random identifier
    (not the order ID, a sequential ID, or anything derivable from one),
    so even a leaked or logged URL doesn't let someone enumerate other
    users' uploads.

15. **Audit log rows are append-only.** No update or delete path may touch an
    existing audit_log row, including via cascade or cleanup scripts.

16. **Foreign-key behavior is explicit for every relation, not left at the
    ORM default.** For each foreign key, decide and document whether
    deleting the parent should CASCADE, RESTRICT, or SET NULL on the child
    — particularly for anything referenced by a historical order
    (menu_items, categories, customizations, users). Don't let Prisma's
    default silently decide this.

17. **Entities referenced by past orders are soft-deleted, never physically
    deleted.** A menu item, category, or customization that's been ordered
    at least once gets an `is_active`/`deleted_at`-style flag instead of a
    hard delete, so historical orders still render correctly. Hard delete is
    only safe for entities with zero historical references.

18. **Admin edits to shared records use optimistic concurrency or
    documented last-write-wins.** Menu items, categories, and settings rows
    that two admins could edit concurrently carry an `updated_at` (or
    version) check on write — reject the write if the record changed since
    it was loaded — or, if you intentionally skip this for a given
    low-contention table, say so in PROJECT.md rather than leaving it
    unspecified.

19. **Destructive database migrations require explicit human approval before
    running.** Any migration that drops a column/table, or could silently
    discard data, gets flagged and confirmed by a human before it's applied
    — never auto-run as part of a task.

20. **If the stack can't cleanly support a required property in this
    document — security or otherwise — stop and escalate; don't ship a
    weaker version silently.** This applies to any rule above, not only
    the transaction/idempotency/uniqueness rules: if your ORM/DB setup
    makes a true atomic transaction across two tables awkward, if the
    hosting platform doesn't give you a clean idempotency mechanism, if the
    DB engine has no equivalent to a partial unique index, or if a
    soft-delete/FK-behavior/concurrency requirement above doesn't map
    cleanly onto your schema tooling, do not fall back to a weaker version
    and move on. Report the limitation, explain what the weaker version
    would actually leave exposed or broken, and propose options (a
    different library, a workaround, or a scoped exception you flag for
    human sign-off) — the same way rule 22 already handles a conflicting
    request.

## Code organization

21. **Target ~250–300 lines per file.** When a file is approaching that, your
    next move is to extract a component, hook, or service function — not to
    keep adding to the file. Don't pre-emptively split a 60-line file either.

22. **Use the minimum number of files necessary.** Group related logic into
    one service file per domain (e.g. one `loyaltyService.ts` covering
    points, redemption, and review claims — not three separate files) rather
    than fragmenting. Split only when a file would otherwise cross the
    ~280-line mark.

23. **Reuse existing shared helpers** (the ownership-check helper, the
    notification dispatcher, the Zod schemas in `/schemas`) instead of
    writing a new local version of something that already exists. Search the
    codebase before writing a new utility.

## Process

24. **Check PROJECT.md before starting any task** to see what already exists
    and avoid re-implementing or conflicting with it.

25. **Update PROJECT.md after finishing and testing a task** — current state
    only, not a running log (see PROJECT.md's own rules for what belongs
    there).

26. **If a request conflicts with any rule above, say so and propose the
    compliant alternative** instead of silently picking one side.
