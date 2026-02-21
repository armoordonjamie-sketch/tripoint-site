# TriPoint Site

Website and assets for **TriPoint Diagnostics** - a mobile, appointment-based diagnostics and repair service for modern diesel vans (Mercedes-Benz focus) across Kent and South East London.

**Positioning:** Compliance-first mobile diagnostics & repairs - dealer-level depth, written fix plans, no guesswork.

---

## Repository structure

| Folder | Description |
|--------|-------------|
| **tripoint-frontend** | Main marketing/booking site: React 19 + Vite 7 + TypeScript + Tailwind 4 |
| **business-docs** | Business plan, pricing, and image prompts (internal reference) |
| **python-scripts** | Image conversion (HEIC→JPG) and asset generation for the site |

---

## TriPoint frontend (website)

- **Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4, React Router, React Hook Form, Zod
- **Run locally:** `cd tripoint-frontend && npm install && npm run dev`
- **Build:** `npm run build`
- **Preview build:** `npm run preview`

See `tripoint-frontend/README.md` for Vite/React details.

---

## Business docs

- `business-plan.md` - Full business plan (mission, market, operations, compliance, KPIs)
- `pricing.md` - Published pricing, zones, and booking policy
- `image-prompt.md` - Prompts used for generating site imagery

---

## Python scripts

- **process_images.py** - Converts HEIC images to JPG (e.g. for web use)
- **generate_images.py** - Uses image descriptions/assignments to generate or assign assets
- **Inputs:** `my-images/` (source HEIC), `image-descriptions.json`, `image-assignments.json`
- **Outputs:** `converted/` (JPGs)

Requires Python 3 and any dependencies listed in the scripts (e.g. `pillow`, `pyheif` if used).

---

## Links

- **GitHub repo:** [armoordonjamie-sketch/tripoint-site](https://github.com/armoordonjamie-sketch/tripoint-site)

## Booking API (SQLite + Stripe + Google Calendar + Zoho)

The FastAPI app in `python-scripts/api.py` provides:

**Public:**
- `GET /calculate-zone` - Zone calculation from postcode
- `GET /booking/services` - Service catalog
- `GET /booking/availability` - Available slots (calendar + DB)
- `POST /booking/reserve` - Create booking, returns payment URL
- `GET /payments/{token}/details` - Booking details for payment page
- `POST /payments/deposit-session` - Create Stripe Checkout for deposit
- `POST /payments/balance-session` - Create Stripe Checkout for balance
- `POST /webhooks/stripe` - Stripe webhook (no `/api` prefix; Stripe calls production URL directly)
- `POST /contact/submit` - Contact form

**Admin (session cookie auth):**
- `POST /admin/login` - Set session cookie
- `GET /admin/session` - Check session
- `POST /admin/logout` - Clear cookie
- `GET /admin/bookings` - List bookings
- `POST /admin/bookings/{id}/complete` - Mark job completed (COMPLETED_UNPAID)
- `POST /admin/bookings/{id}/mark-paid` - Admin override for balance
- `POST /admin/bookings/{id}/generate-balance-link` - Send balance payment email
- `POST /admin/reports` - Create report from booking
- `GET /admin/reports` - List reports (filter: status, q, date_from, date_to)
- `GET /admin/reports/{id}` - Get full nested report
- `PATCH /admin/reports/{id}` - Update report (status COMPLETED triggers email)
- `DELETE /admin/reports/{id}` - Archive report
- `POST /admin/reports/{id}/vehicles` - Add vehicle
- `PATCH /admin/vehicles/{id}` - Update vehicle
- `DELETE /admin/vehicles/{id}` - Delete vehicle
- `POST /admin/vehicles/{id}/faults` - Add fault
- `PATCH /admin/faults/{id}` - Update fault
- `DELETE /admin/faults/{id}` - Delete fault
- `POST /admin/vehicles/{id}/tests` - Add test
- `PATCH /admin/tests/{id}` - Update test
- `DELETE /admin/tests/{id}` - Delete test
- `POST /admin/reports/{id}/media` - Upload media (multipart)
- `PATCH /admin/media/{id}` - Update media caption/tags
- `DELETE /admin/media/{id}` - Delete media

**Public (no auth):**
- `GET /reports/share/{share_token}` - View completed report by share link

### Required environment variables

**Google Calendar:**
- `GOOGLE_CALENDAR_ID` (default: `primary`)
- One of: `GOOGLE_SERVICE_ACCOUNT_FILE` or `GOOGLE_SERVICE_ACCOUNT_JSON`, or OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- Optional: `GOOGLE_DELEGATED_USER`

**Stripe:**
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe Dashboard)
- `STRIPE_SUCCESS_URL_BASE` - Base URL for success redirect (default: `SITE_URL`)

**Admin:**
- `ADMIN_PASSWORD` - Password for admin dashboard
- `SECRET_KEY` - Secret for session cookie signing (use a long random string in production)

**Booking:**
- `TRIPOINT_TIMEZONE` (default: `Europe/London`)
- `SITE_URL` (default: `https://tripointdiagnostics.co.uk`)
- `PENDING_BOOKING_TTL_MINS` (default: `30`) - Auto-expire unpaid bookings
- `BOOKINGS_DB_PATH` - Optional path for SQLite DB (default: `python-scripts/bookings.db`)

**Zoho Mail:**
- `ZOHO_MAIL_ACCESS_TOKEN`, `ZOHO_MAIL_ACCOUNT_ID`
- Optional: `ZOHO_FROM_EMAIL`, `TECH_NAME`

**Diagnostic reports (media storage):**
- `MEDIA_DIR` (default: `python-scripts/media/`) - Path for report uploads
- `MEDIA_URL_PREFIX` (default: `/media`) - URL prefix for serving media

### Local setup

1. **Python dependencies:** `cd python-scripts && pip install -r requirements.txt`
2. **Run API:** `uvicorn api:app --reload --host 127.0.0.1 --port 8000`
3. **Run frontend:** `cd tripoint-frontend && npm install && npm run dev`
4. Vite proxy forwards `/api/*` and `/media` to `http://127.0.0.1:8000`

### Stripe CLI (webhook testing)

For local webhook testing:

```bash
stripe listen --forward-to localhost:8000/webhooks/stripe
```

Use the webhook signing secret from the CLI output as `STRIPE_WEBHOOK_SECRET` in `.env`.

**Production webhook URL:** `https://tripointdiagnostics.co.uk/webhooks/stripe` (no `/api` prefix)

### Diagnostic report system

The report system lets admins create diagnostic reports from bookings, add vehicles/faults/tests, upload media, and share completed reports with customers via email.

- **Admin flow:** Dashboard → Create Report from booking → Edit report (vehicles, faults, tests, media) → Mark Completed (sends email with share link)
- **Public flow:** Customer receives email → Opens `/report/{shareToken}` → Read-only report viewer
- **Media:** Stored in `MEDIA_DIR`, served at `/media`. Add `python-scripts/media/` to `.gitignore` (already done)

### Post-deploy checklist

1. Add all environment variables to the `tripoint-api` systemd service.
2. Ensure `bookings.db` is writable (or set `BOOKINGS_DB_PATH`).
3. Configure Stripe webhook in Dashboard → Webhooks → Add endpoint: `https://tripointdiagnostics.co.uk/webhooks/stripe`, events: `checkout.session.completed`.
4. `sudo systemctl daemon-reload && sudo systemctl restart tripoint-api`
5. Verify `GET /api/booking/services` returns services.
6. Run a full booking flow: reserve → redirect to `/pay/{token}` → pay deposit → confirm webhook creates calendar event + email.
