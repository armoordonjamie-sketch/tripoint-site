# Full conversion tracking: GA4 + Google Ads

Your site sends **GA4 events** (`gtag('event', name, …)`) and **Google Ads conversions** (`gtag('event', 'conversion', { send_to: 'AW-…/label' })`). Both use the same gtag load (`google-tag-init.ts`).

---

## 1) One Google Ads customer ID everywhere

`VITE_GOOGLE_ADS_ID` in prod **must be the same** account as the conversion actions you create (e.g. `AW-1590217709` or `AW-17966741863` — pick **one**; mismatch = silent broken Ads conversions).

Set in `config/frontend.env` or `tripoint-frontend/.env.production`.

---

## 2) Google Ads: create conversions → paste labels into env

**Automated (Google Ads API):** after one-time OAuth (`python setup_conversions.py auth`) and `GOOGLE_ADS_DEVELOPER_TOKEN`:

```bash
cd tools/google_setup
python setup_conversions.py export-env --config config.yaml -o ../../config/frontend.env
```

Rebuilds the fragment from the API (labels + `VITE_GOOGLE_ADS_ID`). Enabling `googleads.googleapis.com` in GCP is required; the API still needs your **developer token** + **OAuth** (not just “API enabled”).

---

## 2b) Manual: create conversions → paste labels into env

In **Google Ads → Goals → Conversions → New conversion action → Website**.

For each goal, open the tag / **Use Google Tag** and copy **only the label** (the part **after** `AW-XXXXX/` in `send_to`).

| What happens on site | Env var (label only) | Notes |
|---------------------|----------------------|--------|
| WhatsApp click | `VITE_GOOGLE_ADS_CONV_WHATSAPP` | If empty, code **falls back** to booking label |
| Email click | `VITE_GOOGLE_ADS_CONV_EMAIL` | |
| Phone click | `VITE_GOOGLE_ADS_CONV_PHONE` | |
| Contact form submit | `VITE_GOOGLE_ADS_CONV_CONTACT` | |
| Booking: slots shown | `VITE_GOOGLE_ADS_CONV_BOOKING_AVAILABILITY` | |
| Booking: slot picked | `VITE_GOOGLE_ADS_CONV_BOOKING_SLOT` | |
| Booking confirmed (non-deposit path) | `VITE_GOOGLE_ADS_CONV_BOOKING` | Primary booking; default label in code if unset |
| Payment success page | `VITE_GOOGLE_ADS_CONV_PAYMENT` | If empty, **falls back** to booking label |
| “Book now” CTAs | `VITE_GOOGLE_ADS_CONV_BOOK_NOW` | Optional micro-conversion |

Rebuild the frontend after changing env (Vite bakes `VITE_*` at build time).

---

## 3) GA4: key events + link to Ads

**Events** already hit GA4 when you use `trackEvent` (see `src/lib/analytics.ts`).

**Mark key events in GA4** (so they show as conversions in GA4 reports):

**Admin → Data display → Events** → toggle **Mark as key event** for the events you care about, e.g.:

- `click_whatsapp`, `submit_contact_form`, `submit_booking_request`, `payment_completed`, `booking_slot_selected`, `booking_availability_ok`, …

(You can also manage these via `tools/google_setup` + service account — already partially done.)

**Link GA4 ↔ Google Ads** (for bidding / audiences):

**GA4 → Admin → Product links → Google Ads links** — link the Ads account you use for campaigns.

---

## 4) GA4 imported conversions from Google Ads (optional)

If you want Ads conversion actions to **also** appear in GA4 as linked conversions:

**Google Ads → Goals → Conversions →** open an action → ensure GA4 linkage / use Google’s “import” flow where offered. Exact UI varies; both products must use the same linked accounts.

---

## 5) Verify

1. Deploy with correct `VITE_*` and rebuild.
2. Open site with `?debug_tracking=1` — console shows `[track]` and `[track:conversion]`.
3. **GA4 → Admin → DebugView** — events in real time.
4. **Google Ads → Goals → Conversions** — status “Recording” after real traffic (can take 24–48h for some reports).

---

## 6) What you do *not* need for the live site

- **Service account JSON** — only for `tools/google_setup` (Admin API), not for visitors’ browsers.

---

## Code reference

- `tripoint-frontend/src/lib/analytics.ts` — `CONVERSIONS`, `trackEvent`, `trackConversion`
- `tripoint-frontend/src/lib/google-tag-init.ts` — loads Ads + GA4
- `tripoint-frontend/.env.production.example` — all `VITE_*` keys
- `deploy.sh` / `auto_deploy.sh` — copy `config/frontend.env` → `.env.production` before build
