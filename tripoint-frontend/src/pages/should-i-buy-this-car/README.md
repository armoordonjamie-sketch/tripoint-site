# "Should I Buy This Car?" — free used-car verdict (validation experiment)

A self-contained landing page + form at **`/should-i-buy-this-car`** that reuses the
site's existing styling, email, Stripe and analytics. Linked from nothing in the nav
(add a link when ready). Built to be trivially removable if the experiment doesn't pan out.

## Routes
| Path | Component | Notes |
|---|---|---|
| `/should-i-buy-this-car` | `ShouldIBuyThisCarPage.tsx` | Landing + free form + £7 upsell. Prerendered + in sitemap. |
| `/should-i-buy-this-car/thanks` | `ThanksPage.tsx` (`VerdictThanksPage`) | Free confirmation, affiliate nudge, Priority upsell. `noindex`, SPA-fallback. |
| `/should-i-buy-this-car/priority-thanks` | `PriorityThanksPage.tsx` (`VerdictPriorityThanksPage`) | Stripe success landing. `noindex`, SPA-fallback. |

## 1. Existing infrastructure reused (no new dependencies, no new providers)
- **Styling/components**: `Seo`, `Section`, `CTAButton`, lucide-react icons, the site's shared
  `inputClass`/`labelClass`/`errorClass` form styling, Tailwind `@theme` tokens, Header/Footer
  (auto-applied by `Layout`). Form uses the site's existing **react-hook-form + zod** stack.
- **Email**: backend `routes/verdict.py` calls **`api._send_zoho_email`** (the existing Zoho SMTP
  transport) — same function the contact form/booking flow use. No new email service.
- **Stripe**: backend reuses **`services/stripe_service.py`** (same `STRIPE_SECRET_KEY` / `SITE_URL`).
  Two additive helpers: `create_verdict_priority_checkout_session` and `retrieve_checkout_session`.
  The £7 charge is created server-side; no secret keys touch the client.
- **Analytics**: reuses the already-initialised **react-ga4** singleton + `window.dataLayer`.

### Images
Generic used-car photos live in `public/images/should-i-buy-this-car/` (`forecourt.jpg`,
`dealer-chat.jpg`, `viewing.jpg`, `mileage.jpg`, `keys.jpg`). They are **royalty-free, commercial-use
photos from Pexels** (Pexels License — free for commercial use, no attribution required) and are
committed to the repo (no hotlinking to third-party CDNs). They render via the shared `OptimizedImage`
component; the folder is whitelisted in `OptimizedImage.tsx`'s `useOriginalAsset()` so it serves the raw
files without needing an `/images/optimized/` mirror. To swap any image, drop a new file in with the same
name. Source photo IDs: forecourt 164634, dealer-chat 7144172, viewing 36729871, mileage 241188, keys 97079.

### New backend files / edits
- `python-scripts/routes/verdict.py` — new self-contained `APIRouter` (`/verdict/*`).
- `python-scripts/services/stripe_service.py` — two functions added (marked "verdict experiment").
- `python-scripts/api.py` — **one** line: `app.include_router(verdict_router)`.

Endpoints (frontend calls them via the `/api` proxy):
- `POST /api/verdict/submit` → emails admin (always) + confirmation to user.
- `POST /api/verdict/priority-session` → returns a Stripe Checkout URL for the £7 Priority Verdict.
- `POST /api/verdict/priority-confirm` → server-side verifies the paid session, then emails admin
  (flagged **PRIORITY**) + the buyer. Idempotent against page refresh.

## 2. New environment variables
| Var | Where | Purpose | Default |
|---|---|---|---|
| `VITE_AFFILIATE_HISTORY_CHECK_URL` | frontend (`.env.production.example`) | Affiliate link on the thanks page | placeholder in `config.ts` |
| `ADMIN_NOTIFY_EMAIL` | backend (`python-scripts/.env.example`) | Where verdict notifications go | `NOTIFY_EMAIL` → `contact@tripointdiagnostics.co.uk` |
| `VERDICT_PRIORITY_PRICE_PENCE` | backend | Priority Verdict price (pence) | `700` (£7.00) |

The affiliate URL is primarily a config constant: `config.ts → AFFILIATE_HISTORY_CHECK_URL`
(placeholder `https://example.com/REPLACE_WITH_AFFILIATE_HISTORY_CHECK_URL`). The env var overrides it.

## 3. Where the 3 analytics events fire
All go through `verdictAnalytics.ts → trackVerdictEvent()` (pushes to `window.dataLayer`, fires
`ReactGA.event`, and `console.log`s — so they're reliably importable into Google Ads/GA4).
- **`verdict_request_submit`** — `ShouldIBuyThisCarPage.tsx`, in `onSubmit()` right after a
  successful `POST /api/verdict/submit`, before navigating to `/thanks`.
- **`affiliate_click`** — `ThanksPage.tsx`, in `handleAffiliateClick()` **before** `window.open(...)`.
- **`priority_verdict_purchase`** — `PriorityThanksPage.tsx`, in the mount `useEffect` when a
  `session_id` is present (i.e. Stripe redirected here after payment). Value `7`, currency `GBP`.

## 4. Manual steps before launch
1. **Replace the affiliate URL** — set `VITE_AFFILIATE_HISTORY_CHECK_URL` (or edit `config.ts`).
2. **Google Ads** — mark these GA4 events as conversions and import them (set
   `VITE_GOOGLE_ADS_CONVERSION_SEND_TO` if you want the gtag pixel too).
3. **Stripe redirects use `SITE_URL`** — in local dev, Stripe success/cancel point at the
   production domain. Test the £7 flow on the deployed site (or set `STRIPE_SUCCESS_URL_BASE`).
4. **Restart the API** so the new router loads: `systemctl restart tripoint-api`.
5. (Optional) Add a nav/footer link to `/should-i-buy-this-car` when ready.

## To remove the experiment
Delete this folder; remove the 3 lazy imports + 3 `<Route>`s in `App.tsx`; remove the 3 manifest
entries in `routes.ts`; delete `public/images/should-i-buy-this-car/` and the
`/images/should-i-buy-this-car/` line in `OptimizedImage.tsx`'s `useOriginalAsset()`; delete
`python-scripts/routes/verdict.py`, its `include_router` line in `api.py`, and the two
"verdict experiment" functions in `services/stripe_service.py`.
