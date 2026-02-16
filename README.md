# TriPoint Site

Website and assets for **TriPoint Diagnostics** — a mobile, appointment-based diagnostics and repair service for modern diesel vans (Mercedes-Benz focus) across Kent and South East London.

**Positioning:** Compliance-first mobile diagnostics & repairs — dealer-level depth, written fix plans, no guesswork.

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

- `business-plan.md` — Full business plan (mission, market, operations, compliance, KPIs)
- `pricing.md` — Published pricing, zones, and booking policy
- `image-prompt.md` — Prompts used for generating site imagery

---

## Python scripts

- **process_images.py** — Converts HEIC images to JPG (e.g. for web use)
- **generate_images.py** — Uses image descriptions/assignments to generate or assign assets
- **Inputs:** `my-images/` (source HEIC), `image-descriptions.json`, `image-assignments.json`
- **Outputs:** `converted/` (JPGs)

Requires Python 3 and any dependencies listed in the scripts (e.g. `pillow`, `pyheif` if used).

---

## Links

- **GitHub repo:** [armoordonjamie-sketch/tripoint-site](https://github.com/armoordonjamie-sketch/tripoint-site)

## Booking API (Google Calendar + Zoho)

The FastAPI app in `python-scripts/api.py` now provides:
- `GET /calculate-zone`
- `GET /booking/services`
- `GET /booking/availability`
- `POST /booking/reserve`
- `POST /booking/cancel`
- `POST /booking/reschedule`

### Required environment variables

Google Calendar:
- `GOOGLE_CALENDAR_ID` (default: `primary`)
- One of:
  - Service account: `GOOGLE_SERVICE_ACCOUNT_FILE` **or** `GOOGLE_SERVICE_ACCOUNT_JSON`
  - OAuth refresh token: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- Optional: `GOOGLE_DELEGATED_USER` (if domain-wide delegation is used)

Booking behavior:
- `TRIPOINT_TIMEZONE` (default: `Europe/London`)
- `EARLY_LATE_SHIFT_MARKERS` (comma-separated event title markers, default includes `early shift` and `late shift`)

Zoho Mail notifications:
- `ZOHO_MAIL_ACCESS_TOKEN`
- `ZOHO_MAIL_ACCOUNT_ID`
- Optional: `ZOHO_FROM_EMAIL` (default `contact@tripointdiagnostics.co.uk`)

### Post-deploy checklist

1. Add the environment variables to the `tripoint-api` systemd service.
2. `sudo systemctl daemon-reload`
3. `sudo systemctl restart tripoint-api`
4. Verify `GET /api/booking/services` returns configured services.
5. Run a full booking flow from `/booking` and confirm event creation + emails.
