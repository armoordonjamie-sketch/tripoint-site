# Changelog: GA4 analytics overhaul, lead tracking API, and Google Sheets

This document records the **GA4 + Measurement Protocol–ready frontend**, **non-blocking lead handoff to the Python API**, and **Google Sheets append pipeline** added to the TriPoint Diagnostics codebase. Use it for LLM context, onboarding, and GA4 admin alignment.

**Scope:** Vite + React frontend (`tripoint-frontend`), FastAPI backend (`python-scripts`). **No** Google Ads `gtag` on the site; GA4 via `react-ga4` only.

---

## 1. High-level goals (what shipped)

1. **Manual SPA `page_view`** – Keep `send_page_view: false`; `RouteTracker` still drives one `page_view` per navigation with **page context** (`page_type`, `service_category`, `service_name`, `area_slug`).
2. **Consistent parameters** – Core events merge **pathname-derived context** so admin-defined dimensions map cleanly.
3. **No PII to GA4** – No full postcode, reg, VIN, phone, email, message body, or raw slot identifiers in GA4 events.
4. **Lead pipeline** – `phone_click`, `whatsapp_click`, and `generate_lead` success paths also **POST** to `POST /api/leads/track` for **Google Sheets** (and optional future server analytics).
5. **Backend** – Idempotent **`event_id`** (per-request UUID) in SQLite; session grouping via **`journey_id`** in the payload; Sheets append with a fixed column schema; optional **GA4 Measurement Protocol** for **admin qualification** transitions (`lead_qualified` / `lead_disqualified` / `lead_won`) when `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` are set and the lead row has web **`ga_client_id`** / **`ga_session_id`**.

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

### 3.4 `python-scripts/services/ga4_measurement.py` (optional)

- **`build_ga4_mp_payload(...)`** – Canonical JSON body: `client_id`, `timestamp_micros` (string, Unix µs), `non_personalized_ads`, `events[{ name, params }]`.
- **`build_ga4_mp_url(base, measurement_id, api_secret)`** – `measurement_id` and `api_secret` as **URL-encoded query params** (avoids broken requests when the secret contains reserved characters).
- **`send_measurement_event(...)`** – POST JSON to **`/mp/collect`** with that URL shape; if `GA4_MP_DEBUG=1`, also POST the **same body** to **`/debug/mp/collect`** using the **same query pattern** (both require `measurement_id` + `api_secret` on the URL).
- **`send_admin_qualification_ga4`** – Called from admin lead PATCH / bulk-update when qualification transitions to `qualified` / `disqualified` / `won`; skips without synthetic IDs when `ga_client_id` or `ga_session_id` is missing on the row.

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
- **Types:** `src/types/leads.ts` — mirrors backend enums (`qualification_status`, `disqualify_reason`, `vehicle_make`) and sheet column names; optional **`qualified_at`** / **`won_at`** for offline conversion timestamps.

### 11.2 Backend (`python-scripts`)

- **Router:** `routes/admin_leads.py` — included from `api.py`; all routes use **`verify_admin_session`** (cookie).
- **Sheets:** `services/sheets_leads.py` — retains append + idempotent dedupe path; adds read-all, header merge for new columns, update by `event_id`, bulk update, optional **data validation** + frozen header (`apply_leads_sheet_formatting`), export log append, dedicated export tab writes.
- **Constants:** `lead_constants.py` — column lists, dropdown values, export tab names, `ads_config()` defaults from env, **`OFFLINE_EXPORT_TAB`** / **`OFFLINE_EXPORT_COLUMNS`** for the deduped offline-import sheet.
- **Google Ads helpers:** `services/google_ads_export.py` — eligibility (`ads_exportable`, click-id priority gclid → wbraid → gbraid), qualified/adjustment CSV row builders.
- **Offline export tab sync:** `services/ads_offline_sync.py` — rebuilds **`google_ads_offline_export`** from the Leads tab (filter: `ads_exportable` + truthy **`google_ads_eligible`**, dedupe by **`export_key`**); updates source rows to **`google_ads_export_status=ready`** (unless already `ready`/`exported`, or **`force`** on the API). Developer doc: **`docs/google_ads_offline_export.md`**.
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
| POST | `/admin/leads/google-ads/sync-offline-export` | Rebuild deduped **`google_ads_offline_export`** tab from Leads; body `{ "force": false }` |
| GET | `/admin/leads/google-ads/exports` | Export history metadata |
| GET | `/admin/leads/google-ads/exports/{export_id}` | Download CSV |

### 11.4 Sheet schema extensions (appended columns)

`google_ads_export_status`, `google_ads_export_type`, `google_ads_conversion_name`, `google_ads_conversion_value`, `google_ads_currency`, `google_ads_exported_at`, `google_ads_export_batch_id`, `google_ads_adjustment_type`, `google_ads_adjustment_value`, `google_ads_last_error`, `google_ads_eligible`, `google_ads_identifier_type`, `google_ads_identifier_value`.

These columns (including click identifiers) support admin listing, filters, and Google Ads CSV export; they are **not** copied into GA4 Measurement Protocol under `google_*` parameter names (GA4 forbids that prefix on custom event params).

**Additional Leads columns (after `ga_session_id`):** **`qualified_at`**, **`won_at`** — appended via header merge; set automatically when admin sets **`qualification_status`** to **`qualified`** or **`won`** via PATCH or bulk-update (ISO timestamp), for use as offline **conversion time** in the export tab (fallback: **`occurred_at`**).

Optional tabs: `GoogleAds_Qualified_Export`, `GoogleAds_Adjustments_Export`, `GoogleAds_Export_Log`, **`google_ads_offline_export`** (deduped import-ready rows; tab name overridable via **`GOOGLE_ADS_OFFLINE_EXPORT_TAB`**).

### 11.5 Environment variables (see `.env.example`)

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEETS_URL` | Optional “open in browser” link from admin Leads |
| `GOOGLE_ADS_QUALIFIED_CONVERSION_NAME` | Default conversion name for `qualified` |
| `GOOGLE_ADS_WON_CONVERSION_NAME` | Default for `won` |
| `GOOGLE_ADS_DEFAULT_CURRENCY` | e.g. `GBP` |
| `GOOGLE_ADS_DEFAULT_QUALIFIED_VALUE` / `GOOGLE_ADS_DEFAULT_WON_VALUE` | Fallback values when none in sheet |
| `GOOGLE_ADS_OFFLINE_EXPORT_TAB` | Optional override for offline export sheet tab name (default `google_ads_offline_export`) |

### 11.6 Operational notes

- **Listing** reads the full Leads sheet in memory and filters in Python — acceptable for typical volumes; scale-up may need caching or archival.
- **Public lead capture** unchanged: `POST /leads/track` still dedupes on `event_id` and appends rows; new columns default empty via `LEADS_COLUMNS` alignment.

### 11.7 Google Ads offline export layer (`google_ads_offline_export`)

- **Purpose:** A clean, deduplicated tab for Google Ads **offline conversion import** (CSV workflow unchanged elsewhere). Raw Leads remains the audit log.
- **Export key (dedupe):** `{journey_id}:{qualification_status}:{conversion_name}:{identifier_value}`; if multiple source rows match, the one with the **latest** **`occurred_at`** wins. Full column list: **`OFFLINE_EXPORT_COLUMNS`** in `lead_constants.py` (includes **`source_event_name`** for audit; **`conversion_name`** is the Ads action, not `phone_click` / `whatsapp_click`).
- **Sync:** Idempotent full tab rewrite (`write_export_tab`). Successful runs set source **`google_ads_export_status`** to **`ready`**, **`google_ads_export_type`** to **`offline_export`**, batch + identifier fields, and append **`GoogleAds_Export_Log`** with `export_type` **`offline_export`**.
- **Auto-sync on qualification edits:** **`PATCH /admin/leads/{event_id}`** runs offline export sync when **`qualification_status`** is in the patch and the old/new values differ with at least one side in **`qualified` / `won` / `disqualified`**. **`POST /admin/leads/bulk-update`** runs one sync when **`qualification_status`** is in the merged updates. Both use **`force: true`** so existing **`ready`** rows refresh. Response field **`offline_export_sync`** carries the sync summary (or an error object); sync failures do not roll back the sheet edit.
- **Disqualified / no longer exportable:** Rebuild drops those rows from the export tab; source rows stuck in **`ready`** get **`disqualified_removed`**. Rows that were **`exported`** as **`qualified`** / **`won`** and are then set to **`disqualified`** via PATCH or bulk-update get **`google_ads_export_status=adjustment_required`**, **`google_ads_adjustment_type=RETRACTION`**, and **`google_ads_conversion_name`** filled for the adjustments CSV — then use **`POST /admin/leads/google-ads/export-adjustments`** to retract in Google Ads.
- **Tests:** `python-scripts/tests/test_ads_offline_sync.py`, `python-scripts/tests/test_google_ads_export.py` (`pytest` from `python-scripts`).

---

## 12. Attribution persistence, GA4 web IDs on leads, and Measurement Protocol (2025-03)

### 12.1 First-party attribution (click IDs and UTMs)

- **Where captured:** `tripoint-frontend/src/lib/attribution.ts` reads `gclid`, `gbraid`, `wbraid`, and `utm_*` from `window.location.search` once at bootstrap (`entry-client.tsx` → `captureAttributionFromUrl()`).
- **Policy:** Latest-touch merge with non-blank preservation — a visit with tracked query params merges into storage; keys not present in the URL keep prior values. Visits with no tracked params do not change stored data.
- **Where stored:** `localStorage` key `tp_attribution` plus first-party cookie `tp_attribution` (JSON blob includes internal `_captured_at` ISO timestamp).
- **Expiry:** 90 days from last merge that included URL attribution params (`EXPIRY_DAYS` in `attribution.ts`). Expired blobs are cleared on read.
- **Flow into leads:** `leadTracking.ts` `basePayload()` merges `getAttribution()` into every `POST /api/leads/track` payload (phone, WhatsApp, contact, booking, payment). **Source of truth is stored state**, not the URL at click time.
- **Debug (any environment):** `window.__tripointAttributionDebug()` and `window.__tripointAttributionClear()` (registered in `registerAttributionDebugHelpers()`). In dev, the client logs a snapshot after capture when data exists.

### 12.2 GA4 `ga_client_id` and `ga_session_id` on lead rows

- **Purpose:** Link admin-driven qualification events sent via **Measurement Protocol** to the same GA4 client/session as the web stream (Realtime / key events).
- **Capture:** `leadTracking.ts` `getGa4WebIds()` reads first-party cookies — `_ga` → `ga_client_id` (segment after `GA1.x.`), `_ga_<STREAM>` (stream suffix from `G-…` in `analyticsPublic.ts`) → `ga_session_id` (first numeric segment after `GS1.` / `GS2.`).
- **Payload / sheet:** Optional fields on `LeadTrackRequest` and Leads sheet columns `ga_client_id`, `ga_session_id` (`LEAD_ATTRIBUTION_EXTRA_COLUMNS` in `lead_constants.py`). Header merge appends missing columns on older sheets.

### 12.3 Measurement Protocol qualification events (`services/ga4_measurement.py`)

- **Requires** non-empty `ga_client_id` and `ga_session_id` on the sheet row; otherwise the send is skipped with `skipped_reason` `missing_ga_client_id` or `missing_ga_session_id` (no synthetic `client_id`). **`ga_session_id` policy:** required for Realtime / DebugView session linkage; skips are logged explicitly; responses include **`ga4_sync_session_id_policy`** (e.g. `included_in_event_params`, `required_skipped_missing_ga_session_id`, `not_applicable`).
- **HTTP contract:** `POST`, `Content-Type: application/json`, **JSON body** (not form-encoded). Query string only: `measurement_id`, `api_secret` (built via **`urlencode`**).
- **Payload (shape):** Built once by **`build_ga4_mp_payload`**: top-level `client_id`, `timestamp_micros` (Unix microseconds as string), `non_personalized_ads: true`, and one event whose `name` is `lead_qualified` | `lead_disqualified` | `lead_won` (see next bullet for `params`).
- **Payload (event `params`, closed set):** From **`build_lead_qualification_mp_params`**: always `session_id`, `engagement_time_msec` (`1`), `event_id`, `journey_id`, `lead_channel`, `lead_quality`, `disqualify_reason`, `vehicle_make`, `vehicle_model`, `service_interest`, `service_category`, `service_name`; plus `lead_value` and `qualified_lead_value` only when numeric values exist on the row (`qualified_lead_value` uses **`google_ads_conversion_value`** when set, otherwise **`lead_value`**).
- **Reserved parameter names (GA4):** Custom MP parameter names must not start with `google_`, `ga_`, `firebase_`, a leading `_`, or `gtag.`. Qualification MP therefore does **not** send `google_ads_identifier_type`, `google_ads_identifier_value`, `page`, or `page_type` as event parameters (identifiers and page context stay on the sheet / admin path only).
- **Debug validation:** Set `GA4_MP_DEBUG=1` in `python-scripts/.env` to POST to **`/debug/mp/collect`** (with the **same encoded query params and body** as collect) before **`/mp/collect`**. Parsed **`validationMessages`** are logged at INFO and surfaced in admin as `ga4_sync_validation_messages`. If the debug response is not JSON, logs include HTTP status, **path only** (no secrets), truncated body, and flags for query params / JSON body presence.
- **Fix (2025-03-27, debug URL):** Earlier, debug validation POSTed to `/debug/mp/collect` **without** `measurement_id` and `api_secret` on the URL, which produced GA4’s *“Unable to process malformed HTTP request.”* Production collect already had query params; debug now uses the same **`build_ga4_mp_url`** helper.
- **Fix (2025-03-27, MP event params):** Removed `google_ads_identifier_*` and `page` / `page_type` from qualification event params so GA4 debug validation no longer reports reserved-prefix errors on those names.

### 12.4 Admin API / UI

- **PATCH `/admin/leads/{event_id}`** response `ga4_qualification_sync` includes `ga4_sync_attempted`, `ga4_sync_sent`, `ga4_sync_skipped_reason`, `ga4_sync_validation_messages`, **`ga4_sync_session_id_policy`** (plus legacy `measurement_protocol_sent`, `skipped_reason`). Bulk **`POST /admin/leads/bulk-update`** echoes `ga4_sync_session_id_policy` per event where applicable.
- **Lead detail drawer** shows last sync fields including **`ga4_sync_session_id_policy`** (`tripoint-frontend` `LeadDetailDrawer.tsx`, `adminApi.ts` types).
- **Leads list** supports filters `identifier_type` (`gclid` | `wbraid` | `gbraid` | `none`) and `google_ads_eligible` (boolean, matches computed `ads_exportable`).
- **Table:** “Click ID” column uses enriched `identifier_type`; “Ads OK” uses exportability badges and tooltips.

### 12.5 Migration

- **Existing rows** without `ga_client_id` / `ga_session_id` will not receive MP sends until new site traffic repopulates them; qualification changes still save to Sheets.

---

*Document generated to capture the GA4 + lead tracking + Sheets implementation. Update this file when behaviour or env vars change.*
