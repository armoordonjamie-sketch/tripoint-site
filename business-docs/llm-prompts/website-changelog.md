# Changelog: GA4 analytics overhaul, lead tracking API, and Google Sheets

This document records the **GA4 + Measurement Protocol–ready frontend**, **non-blocking lead handoff to the Python API**, and **Google Sheets append pipeline** added to the TriPoint Diagnostics codebase. Use it for LLM context, onboarding, and GA4 admin alignment.

**Scope:** Vite + React frontend (`tripoint-frontend`), FastAPI backend (`python-scripts`). **No** Google Ads `gtag` on the site; GA4 via `react-ga4` only.

---

## 1. High-level goals (what shipped)

1. **Manual SPA `page_view`** – Keep `send_page_view: false`; `RouteTracker` still drives one `page_view` per navigation with **page context** (`page_type`, `service_category`, `service_name`, `area_slug`).
2. **Consistent parameters** – Core events merge **pathname-derived context** so admin-defined dimensions map cleanly.
3. **No PII to GA4** – No full postcode, reg, VIN, phone, email, message body, or raw slot identifiers in GA4 events.
4. **Lead pipeline** – `phone_click`, `whatsapp_click`, and `generate_lead` success paths also **POST** to `POST /api/leads/track` for **Google Sheets** (and optional future server analytics).
5. **Backend** – Idempotent **`event_id`** (per-request UUID) in SQLite; session grouping via **`journey_id`** in the payload; Sheets append with a fixed column schema; optional **GA4 Measurement Protocol** helper (not wired to user flows).

---

## 2. Frontend: new and changed files

### 2.1 `tripoint-frontend/src/lib/analyticsContext.ts` (new)

- **`getPageAnalyticsContextFromPath(fullPath)`** – Parses path + query; returns:
  - `page` – Normalised path + search string.
  - `page_type` – e.g. `home`, `services_index`, `service_detail`, `areas_index`, `area_detail`, `booking`, `contact`, `blog_index`, `blog_post`, `faq`, `pricing`, `payment`, `payment_success`, `about`, `process`, `our_work`, `report_viewer`, `admin`, `legal`, `other`.
  - `service_category` – `diagnostics` | `servicing` | `brakes` | `tuning` | `general` (brakes inferred from `*-brakes` slugs; catalogue from `src/config/servicesCatalog.ts`).
  - `service_name` – Label from catalogue when on `/services/:slug`, else title-cased slug segment.
  - `area_slug` – Set for `/areas-covered/:slug` only.
- **`getPageAnalyticsContext()`** – Uses `window.location` (client).
- **`getAnalyticsTitleForPath(pathOnly)`** – SEO title fallback via `getSeoForPath` from `src/routes.ts` when `document.title` is empty.

### 2.2 `tripoint-frontend/src/lib/analytics.ts` (refactor)

- **`initAnalytics()`** – Unchanged intent: `send_page_view: false`, `react-ga4` init.
- **`trackPageView(path?, title?)`** – Sends `ReactGA.send({ hitType: 'pageview', page, title, ... })` with **page context** fields (`page_type`, `service_category`, `service_name`, `area_slug`). Resolves title from argument, `document.title`, or SEO fallback.
- **Merge helper** – All non–page-view events get `page`, `page_type`, `service_category`, `service_name`, `area_slug` (optional overrides via `PageAnalyticsContext` where a function accepts it).

**Core events (names preserved):**

| Function | GA4 event | Notes |
|----------|-----------|--------|
| `trackPhoneClick` | `phone_click` | + `click_location`, `nav_label`, `contact_method: phone` + page context; **also** backend lead track (`lead_channel: phone`). |
| `trackWhatsAppClick` | `whatsapp_click` | Same pattern; **also** backend (`lead_channel: whatsapp`). |
| `trackNavClick` | `nav_click` | `nav_target`, `nav_label`, `click_location` + page context. |
| `trackContactFormSuccess` | `generate_lead` | `lead_type: contact_form`, `form_name: contact_form`, `service_interest`; optional `GenerateLeadOptions`; **also** backend (`lead_channel: contact_form`). |
| `trackBookingConfirmation` | `generate_lead` | `lead_type: booking_request`, `form_name: booking_form`, `service_interest`, optional `value`/`currency`/`lead_value`; **also** backend (`lead_channel: booking`). |
| `trackPaymentSuccess` | `generate_lead` | `payment_completed: true`, same lead_type/form_name pattern; optional `value`/`currency`/`lead_value`; **also** backend (`lead_channel: payment`). |
| `trackSocialClick` | `social_click` | `platform`, `click_location` + page context. |

**New / extended GA4 events:**

| Function | GA4 event | Parameters |
|----------|-----------|------------|
| `trackSelectContent` | `select_content` | `content_type`, `content_id`, optional extra fields, + page context. |
| `trackSearch` | `search` | `search_term` (truncated if long), `search_location`, + page context. |
| `trackZoneLookup` | `zone_lookup` | `zone_result` (`A` / `B` / `C` / `out_of_area` / `unknown`) – **not** raw postcode. |
| `trackBookingFunnelEvent` | `booking_start`, `booking_step_view`, `booking_service_select`, `booking_slot_select`, `booking_reserve_submit` | `booking_step`, optional `service_interest`, optional `lead_value` (GBP int when known), + page context. |

**`GenerateLeadOptions` (optional)** includes `serviceInterest`, `paymentCompleted`, `valueGbp`, `leadValue`, `context`, and reserved placeholders for future trusted flows: `leadQuality`, `disqualifyReason`, `vehicleMake`, `vehicleModel`, `qualifiedLeadValue` (not populated from arbitrary UI).

### 2.3 `tripoint-frontend/src/lib/leadTracking.ts` (new)

- **`getSessionJourneyId()`** – `sessionStorage` key `tripoint_journey_id`; `crypto.randomUUID()` once per browser session (groups related rows).
- **`getEventId()`** – New `crypto.randomUUID()` on every call; **idempotency key** for `POST /leads/track` (repeat actions in the same session each get a new `event_id`).
- **`buildLeadTrackPayload(...)`** – Merges attribution from `src/lib/attribution.ts` (`gclid`, `gbraid`, `wbraid`, `utm_*`) with page context and event fields; **`journey_id` / `event_id` cannot be overridden** via `extras`.
- **`trackLeadToBackend(...)`** – `POST` to **`/api/leads/track`** (same-origin; Vite/nginx proxy strips `/api` on the server). Uses **`navigator.sendBeacon`** with JSON `Blob`, then **`fetch(..., { keepalive: true })`** fallback; failures swallowed.

**Not sent:** message body, phone, email, reg, VIN, full postcode, free-text notes, slot IDs.

### 2.4 Components and pages (instrumentation)

| Location | Behaviour |
|----------|-----------|
| `src/components/RouteTracker.tsx` | Unchanged call pattern; `trackPageView` now enriched via `analytics.ts`. |
| `src/components/BookingScheduler.tsx` | `booking_start` on mount; `booking_step_view` on step/substep/service change (deduped by internal key); `select_content` + `booking_service_select` on category/service/brake model; `booking_slot_select` on slot pick (no slot ISO in GA); `booking_reserve_submit` + `trackBookingConfirmation` with **primary service id** and `lead_value` from price API when known; `sessionStorage` key `tripoint_payment_context` before Stripe redirect (`service_interest`, `lead_value_gbp`). |
| `src/components/ServicePicker.tsx` | `select_content` on category tabs and service card links. |
| `src/components/ZoneCalculator.tsx` | `zone_lookup` after successful `/api/calculate-zone` response. |
| `src/components/TownChips.tsx` | Towns link to `/areas-covered/{slug}` when slug exists in `src/data/areas.ts`; `select_content` for `area_town`. |
| `src/pages/FaqPage.tsx` | Debounced (~500ms) `search` when query length ≥ 2; `search_location: faq`. |
| `src/pages/BlogIndexPage.tsx` | `select_content` on blog post links (`blog_post` / slug). |
| `src/pages/BlogPostPage.tsx` | `select_content` on related service CTAs/links (`blog_related_service` + service slug from href). |
| `src/pages/areas-covered/AreaPage.tsx` | `select_content` on “We Also Cover” area links (`area_link`). |
| `src/pages/PaymentSuccessPage.tsx` | Reads `tripoint_payment_context`; fetches **`GET /api/payments/{token}/details`** for `service_ids` and `total_gbp`; calls `trackPaymentSuccess` with `value`/`lead_value` when known; clears session storage. |
| `src/pages/PaymentPage.tsx` | `PaymentDetails` type extended with optional `service_ids` (aligns with API). |
| `src/pages/ContactPage.tsx` | Optional **“What are you interested in?”** select (`diagnostics`, `servicing`, `brakes`, `tuning`, `other`); on success, `trackContactFormSuccess` uses that value for GA4 `service_interest`, or **`general`** when unset. Optional **`service_interest_category`** on `POST /api/contact/submit` for internal email only. |

**Note:** `src/components/ServiceCard.tsx` exists but is **not** wired into the live services grid (ServicePicker is used on `/services`). No `select_content` on that unused component.

### 2.5 Config (unchanged behaviour, relevant)

- `src/config/analyticsPublic.ts` – `VITE_GA4_MEASUREMENT_ID` with repo default; override in `.env.production` / `config/frontend.env` on server.
- `src/lib/attribution.ts` – Unchanged; used for lead payload and outbound URL decoration (WhatsApp, etc.).

---

## 3. Backend: new and changed files

### 3.1 `python-scripts/api.py`

- **`LeadTrackRequest`** – Pydantic model for JSON body (see §5).
- **`POST /leads/track`** – Accepts lead payloads; **idempotency** via `insert_lead_track_if_new(event_id)` only; on Sheets failure, **`delete_lead_track_dedupe(event_id)`** so the client can retry; response JSON: `ok`, `duplicate`, `sheets`, `message`.
- **`POST /contact/submit`** – Optional **`service_interest_category`** (string, max 40 chars) for ops visibility in the internal notification email when the contact form sends a category; no change to customer auto-reply.
- **`GET /payments/{token}/details`** – Response now includes **`service_ids`** (list of known catalogue slugs) for analytics-safe service interest on the payment success page.

### 3.2 `python-scripts/db.py`

- Table **`lead_track_event_dedupe`** – `event_id TEXT PRIMARY KEY`, `created_at` (idempotency cache only).
- **`insert_lead_track_if_new(event_id)`** – Returns `True` if insert succeeded (new `event_id`).
- **`delete_lead_track_dedupe(event_id)`** – Used when Sheets append fails after insert.
- **Migration:** On `init_db()`, legacy table **`lead_track_dedupe`** is **`DROP TABLE IF EXISTS`** (historical dedupe rows discarded; acceptable for a cache). Fresh installs get only `lead_track_event_dedupe`.

### 3.3 `python-scripts/services/sheets_leads.py` (new)

- Google **Sheets API v4** append.
- Env: `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_LEADS_TAB` (default `Leads`).
- Credentials: `GOOGLE_SERVICE_ACCOUNT_JSON` **or** `GOOGLE_SERVICE_ACCOUNT_FILE` **or** `GOOGLE_APPLICATION_CREDENTIALS` with scope `https://www.googleapis.com/auth/spreadsheets` (separate from Calendar scope in the same JSON file).
- Creates sheet tab if missing; writes **header row** once if row 1 is empty.
- Fixed column order (see §6).
- **Operational:** If an existing **Leads** tab still has the old header (`lead_id` first), auto-detection will not match the new schema. Point **`GOOGLE_SHEETS_LEADS_TAB`** at a new tab (e.g. `Leads_v2`) for a clean header, or add a new sheet / header row manually once, then appends continue.

### 3.4 `python-scripts/services/ga4_measurement.py` (new, optional)

- **`send_measurement_event(name, params, client_id=None)`** – POST to `https://www.google-analytics.com/mp/collect` using `GA4_MEASUREMENT_ID` and `GA4_API_SECRET`.
- **Not called** from booking/contact routes; scaffold for future `lead_qualified` / `lead_disqualified` style server events.

### 3.5 `python-scripts/requirements.txt`

- Added: `google-api-python-client`, `google-auth` (aligns with production `deploy.sh` pip install).

### 3.6 `python-scripts/.env.example`

- Documents Sheets and optional GA4 MP variables (no secrets).

---

## 4. Proxy and URLs

- **Local dev:** `vite.config.ts` proxies `/api` → `http://127.0.0.1:8000` with path rewrite **`/api` → ``** (empty), so browser calls **`/api/leads/track`** → backend **`POST /leads/track`**.
- **Production:** `deploy.sh` nginx `location /api/` → `proxy_pass http://127.0.0.1:8000/` (same stripping).

---

## 5. API contract: `POST /leads/track`

**URL (browser):** `POST /api/leads/track`  
**URL (FastAPI):** `POST /leads/track`

**Required JSON fields:**

- `journey_id` (string) – one per browser session; groups rows for analysis
- `event_id` (string, UUID-shaped, min 36 chars) – **unique per request**; sole idempotency key
- `event_name` (string) – e.g. `phone_click`, `whatsapp_click`, `generate_lead`
- `occurred_at` (ISO 8601 string)
- `lead_channel` – `phone` | `whatsapp` | `contact_form` | `booking` | `payment`

**Optional fields** (all map to sheet columns where applicable):

`click_location`, `nav_label`, `nav_target`, `contact_method`, `lead_type`, `form_name`, `service_interest`, `payment_completed`, `page`, `title`, `page_type`, `service_category`, `service_name`, `area_slug`, `booking_step`, `zone_result`, `content_type`, `content_id`, `lead_value`, `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`.

**Response:**

```json
{
  "ok": true,
  "duplicate": false,
  "sheets": true,
  "message": null
}
```

- `duplicate: true` – Same `event_id` already recorded (replay); no duplicate sheet row.
- `sheets: false` – Sheets append failed (check server logs); dedupe row removed so retry is allowed.
- `message` – Error detail when `sheets` is false.

---

## 6. Google Sheets schema (column order)

Columns written in order (header row auto-created):

1. `journey_id`  
2. `event_id`  
3. `occurred_at`  
4. `event_name`  
5. `lead_channel`  
6. `click_location`  
7. `nav_label`  
8. `nav_target`  
9. `contact_method`  
10. `lead_type`  
11. `form_name`  
12. `service_interest`  
13. `payment_completed`  
14. `page`  
15. `title`  
16. `page_type`  
17. `service_category`  
18. `service_name`  
19. `area_slug`  
20. `booking_step`  
21. `zone_result`  
22. `content_type`  
23. `content_id`  
24. `lead_value`  
25. `gclid`  
26. `gbraid`  
27. `wbraid`  
28. `utm_source`  
29. `utm_medium`  
30. `utm_campaign`  
31. `utm_content`  
32. `utm_term`  
33. `qualification_status` – **blank** from API (manual in sheet)  
34. `disqualify_reason` – **blank**  
35. `vehicle_make` – **blank**  
36. `vehicle_model` – **blank**  
37. `notes` – **blank** (no auto-fill from user text)

---

## 7. Environment variables

### Frontend (build-time)

| Variable | Purpose |
|----------|---------|
| `VITE_GA4_MEASUREMENT_ID` | GA4 measurement ID (see `src/config/analyticsPublic.ts`) |

### Backend (runtime)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Target spreadsheet ID |
| `GOOGLE_SHEETS_LEADS_TAB` | Worksheet name (default `Leads`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Inline JSON (alternative to file) |
| `GOOGLE_SERVICE_ACCOUNT_FILE` | Path to service account JSON |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternate file path (Sheets module) |
| `GA4_MEASUREMENT_ID` | Optional MP sender |
| `GA4_API_SECRET` | Optional MP sender |

**Sheets access:** Share the spreadsheet with the **service account client email** from the JSON key (Editor).

---

## 8. GA4 Admin follow-up (manual)

1. In GA4, register **custom dimensions** for event parameters you need (e.g. `page_type`, `service_category`, `service_name`, `area_slug`, `booking_step`, `zone_result`, `content_type`, `content_id`, `search_location`).
2. Register **custom metrics** if using `lead_value` / purchase-style `value` on `generate_lead`.
3. Confirm **no duplicate automatic page views** – site uses manual `page_view` only (`send_page_view: false`).
4. Use **DebugView** with `?debug_tracking=1` in non-production or dev logging where implemented.

---

## 9. Known limitations and caveats

- **`ServiceCard.tsx`** – Not used in the main services UX; instrumentation targets **ServicePicker** and other live links.
- **React Strict Mode (dev)** – May double-invoke effects; can produce duplicate **booking_start** in development only.
- **FAQ search** – Events fire on **debounced** input (not every keystroke) to limit noise.
- **Slot selection** – GA4 does **not** receive slot ISO strings; only funnel step labels and optional monetary hints.
- **Payment success** – Combines `sessionStorage` pre-redirect hint with **`GET /payments/{token}/details`** for authoritative `service_ids` and `total_gbp`.
- **ESLint** – Some pre-existing rules (e.g. `setState` in animation effects in `BookingScheduler`) remain; not introduced solely for GA4.
- **Secrets** – Do not commit real `.env` files; use `.env.example` and server-only config.

---

## 10. Quick reference: event → typical `lead_channel` (backend)

| GA4 / user action | `event_name` in payload | `lead_channel` |
|-------------------|-------------------------|----------------|
| Phone link | `phone_click` | `phone` |
| WhatsApp link | `whatsapp_click` | `whatsapp` |
| Contact form success | `generate_lead` | `contact_form` |
| Booking reserve success | `generate_lead` | `booking` |
| Payment success page | `generate_lead` | `payment` |

---

## 11. Admin Leads tab, Sheets read/update, and Google Ads export (March 2025)

**Goal:** Internal **Leads** admin surface on top of the existing **Google Sheets** lead pipeline (`journey_id` + `event_id`), without exposing service account credentials to the browser or changing public `POST /leads/track` behaviour.

### 11.1 Frontend (`tripoint-frontend`)

- **Route:** `/admin/leads` — lazy-loaded `AdminLeadsPage`.
- **Navigation:** Shared **`AdminNav`** (Bookings | Leads | Reports | Log out) on admin dashboard, reports, and leads pages.
- **Features:** Server-backed table (filters, sort, pagination), row selection, bulk actions bar, detail drawer (attribution, qualification edits, journey history by `journey_id`), **Google Ads export** panel (qualified + adjustment CSV flows, export history downloads), optional **CSV export** of the visible table, toast notifications (`toast-context` + `useToast`).
- **API client:** `src/lib/adminApi.ts` — typed `fetch` to `/api/admin/leads/*` with credentials.
- **Types:** `src/types/leads.ts` — mirrors backend enums (`qualification_status`, `disqualify_reason`, `vehicle_make`) and sheet column names.

### 11.2 Backend (`python-scripts`)

- **Router:** `routes/admin_leads.py` — included from `api.py`; all routes use **`verify_admin_session`** (cookie).
- **Sheets:** `services/sheets_leads.py` — retains append + idempotent dedupe path; adds read-all, header merge for new columns, update by `event_id`, bulk update, optional **data validation** + frozen header (`apply_leads_sheet_formatting`), export log append, dedicated export tab writes.
- **Constants:** `lead_constants.py` — column lists, dropdown values, export tab names, `ads_config()` defaults from env.
- **Google Ads helpers:** `services/google_ads_export.py` — eligibility (`ads_exportable`, click-id priority gclid → wbraid → gbraid), qualified/adjustment CSV row builders.
- **SQLite:** `google_ads_exports` table stores **export_id → CSV** for `GET /admin/leads/google-ads/exports/{export_id}` downloads (history list via `GET .../exports`).

### 11.3 New / noteworthy HTTP endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/leads` | List + filter + paginate (query params) |
| GET | `/admin/leads/{event_id}` | Single lead + computed enrichment |
| GET | `/admin/leads/journey/{journey_id}` | All events for journey |
| PATCH | `/admin/leads/{event_id}` | Editable qualification / Google Ads override fields |
| POST | `/admin/leads/bulk-update` | Bulk updates + presets (mark exported, queue adjustment, etc.) |
| POST | `/admin/leads/sync-sheet-validations` | Sheet dropdowns + header formatting |
| POST | `/admin/leads/google-ads/export-qualified` | Qualified/won export + optional Sheet tab |
| POST | `/admin/leads/google-ads/export-adjustments` | Adjustment export (RETRACTION/RESTATEMENT rows) |
| GET | `/admin/leads/google-ads/exports` | Export history metadata |
| GET | `/admin/leads/google-ads/exports/{export_id}` | Download CSV |

### 11.4 Sheet schema extensions (appended columns)

`google_ads_export_status`, `google_ads_export_type`, `google_ads_conversion_name`, `google_ads_conversion_value`, `google_ads_currency`, `google_ads_exported_at`, `google_ads_export_batch_id`, `google_ads_adjustment_type`, `google_ads_adjustment_value`, `google_ads_last_error`, `google_ads_eligible`, `google_ads_identifier_type`, `google_ads_identifier_value`.

Optional tabs: `GoogleAds_Qualified_Export`, `GoogleAds_Adjustments_Export`, `GoogleAds_Export_Log`.

### 11.5 Environment variables (see `.env.example`)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEETS_URL` | Optional “open in browser” link from admin Leads |
| `GOOGLE_ADS_QUALIFIED_CONVERSION_NAME` | Default conversion name for `qualified` |
| `GOOGLE_ADS_WON_CONVERSION_NAME` | Default for `won` |
| `GOOGLE_ADS_DEFAULT_CURRENCY` | e.g. `GBP` |
| `GOOGLE_ADS_DEFAULT_QUALIFIED_VALUE` / `GOOGLE_ADS_DEFAULT_WON_VALUE` | Fallback values when none in sheet |

### 11.6 Operational notes

- **Listing** reads the full Leads sheet in memory and filters in Python — acceptable for typical volumes; scale-up may need caching or archival.
- **Public lead capture** unchanged: `POST /leads/track` still dedupes on `event_id` and appends rows; new columns default empty via `LEADS_COLUMNS` alignment.

---

*Document generated to capture the GA4 + lead tracking + Sheets implementation. Update this file when behaviour or env vars change.*
