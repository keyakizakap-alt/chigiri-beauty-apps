# CHIGIRI commercial readiness — 2026-09-07

## Implemented

- Mobile header exposes 今日の調子 beside マイアイテム. Full proposal rendering and nearest scroll behavior remain.
- Uploaded asset access/deletion uses owner-scoped database records. Client-editable history is never authorization for legacy object keys.
- Browser consultation cache/outbox uses the Google subject as an account namespace. Old unscoped caches are left untouched but never auto-imported; server history is reloaded. Guest cache stays separate.
- Chat validates JSON structure and bounds streamed input; mutation endpoints reject foreign origins. Malformed percent-encoded cookies are ignored.
- Persistent atomic request counters: chat 12/minute; upload 5/minute; guest 30/day; account 100/day; active paid chat 500/day. All counters reset on UTC boundaries. The default global daily cap per operation is 1000. Failed attempts can consume allowance. This is admission control, not a guaranteed currency budget; configure provider spending limits too.
- Orca requests abort after 25 seconds. Browser chat requests abort after 40 seconds. Failed HTTP responses do not advance conversation state.
- /settings offers server data JSON export, consultation-text bulk deletion with tombstones, and transparent data-flow disclosure. Image bytes, image deletion, account deletion and backup erasure are not included in bulk deletion.
- Stripe hosted Checkout and Customer Portal require authenticated ownership. Price/customer IDs cannot be supplied by clients. Current Stripe subscription state determines the paid quota; success URL parameters cannot grant access. No webhook-derived entitlement cache is used, so webhook reordering is not an authorization path.

## Activate billing only after testing

1. Create a Stripe recurring price and configure the Customer Portal for cancellation and payment-method changes. Use a test-mode secret and test price first.
2. Set STRIPE_SECRET_KEY, STRIPE_PRICE_ID, APP_URL (canonical HTTPS origin), TERMS_URL, PRIVACY_URL, COMMERCE_URL. URLs must point to completed, published documents for the actual seller. Price, tax treatment, refund rules and seller contact details must be decided by the operator.
3. Test checkout success/cancellation, repeated clicks, active subscription redirect to portal, failed payment, renewal, cancellation, and a second account attempting access. Verify the configured price and billing interval in Checkout.
4. Current subscription status is read from Stripe on signed-in paid-customer chat admission. This adds a provider dependency and latency; an outage fails closed. Introduce a reconciled webhook cache when volume warrants it.
5. Checkout reuses an open session and derives its idempotency key from the previous session, allowing a new attempt after expiration. Do not enable unrestricted multiple purchases in the Stripe dashboard.

## Remaining launch work

- Real Stripe/Google/Turso/Blob integration tests require the deployment's configured credentials; local checks do not demonstrate successful live payment.
- Formal account deletion/revocation, configurable retention and backup deletion, orphan-image cleanup, and operational audit/alerting still need implementation.
- Unregistered legacy image keys fail closed. Backfill only from a trusted source; never infer ownership from editable session payloads.
- Guest cookies can be reset. Global request caps contain total admissions but do not prevent an attacker exhausting availability. Add trusted-edge abuse controls for public launch.
- Data export currently collects all owned records in memory; introduce paginated/streamed export for large accounts.
- Policy links are configuration gates, not a legal review. No seller information or commercial terms have been fabricated.

## Verification

60 node tests, TypeScript, ESLint and production build passed; npm audit reported zero vulnerabilities. HTTP smoke checks passed for home/settings, chat, malformed JSON, foreign-origin mutations and guest billing denial. Owner isolation/export, forged legacy key denial and tombstone replay were also verified against a temporary local database. Browser visual verification was blocked by the environment (agent-browser daemon exits at startup). No real payment was charged or verified.
