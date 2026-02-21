# TriPoint Diagnostics - Email Templates

Professional email templates for customer communications. Each template has an HTML version (table-based, inline CSS, email-client compatible) and a plain-text fallback.

## ⚠️ Reply-To Requirement

**The Python sender MUST set the `Reply-To` header:**

```
Reply-To: contact@tripointdiagnostics.co.uk
```

HTML files cannot set email headers. This must be done in the sending script.

---

## Templates

| # | File | Purpose | Subject Line |
|---|------|---------|--------------|
| 01 | `01-enquiry-auto-reply` | Auto-reply when someone submits the contact/enquiry form | `Thanks for getting in touch - TriPoint Diagnostics` |
| 02 | `02-booking-confirmation` | Sent when a booking is confirmed | `Booking confirmed - [SERVICE_NAME] on [BOOKING_DATE]` |
| 03 | `03-on-the-way` | ETA notification sent when technician departs | `We're on the way - ETA [ETA_WINDOW]` |
| 04 | `04-job-complete` | Post-visit email with report summary + invoice + Pay Now | `Job complete - your diagnostic report for [VEHICLE_REG]` |
| 05 | `05-payment-received` | Payment confirmation / receipt | `Payment received - thank you, [CLIENT_FIRST_NAME]` |
| 06 | `06-review-request` | Google review request (send 24–48h after job) | `How did we do? Quick feedback for [VEHICLE_REG]` |
| 07 | `07-overdue-invoice` | Polite overdue invoice reminder | `Friendly reminder - invoice [INVOICE_ID] is now overdue` |
| 08 | `08-deposit-pending` | Slot reserved, pay deposit to confirm | `Slot reserved - pay deposit to confirm [SERVICE_NAME] on [BOOKING_DATE]` |
| 09 | `09-deposit-confirmed` | Deposit received, booking confirmed | `Deposit received - your booking is confirmed` |
| 10 | `10-balance-request` | Admin-triggered balance payment request | `Payment requested - remaining balance for [VEHICLE_REG]` |

---

## Placeholders

Your Python script must replace these `[PLACEHOLDER]` strings before sending.

### Required (present in most templates)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[CLIENT_FIRST_NAME]` | Customer first name | `Jamie` |
| `[TECH_NAME]` | Technician / sender name | `Jamie` |
| `[CURRENT_YEAR]` | Current year for footer copyright | `2026` |

### Customer & Vehicle

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[CLIENT_FULL_NAME]` | Full name | `Jamie Armoordon` |
| `[CLIENT_EMAIL]` | Customer email | `jamie@example.com` |
| `[CLIENT_PHONE]` | Customer phone | `07700 900123` |
| `[VEHICLE_REG]` | Registration plate | `AB12 CDE` |
| `[VEHICLE_MAKE_MODEL]` | Vehicle make and model | `Mercedes Sprinter 314 CDI` |
| `[POSTCODE]` | Customer postcode | `TN9 1PP` |

### Booking

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[BOOKING_ID]` | Unique booking reference | 02, 03 |
| `[BOOKING_DATE]` | Formatted date | 02 |
| `[BOOKING_TIME_WINDOW]` | Time window string | 02 |
| `[BOOKING_LINK]` | URL to view/manage booking | 02, 09 |
| `[ICS_LINK]` | URL to download .ics calendar file | 02, 09 |
| `[PAYMENT_LINK]` | URL to payment page | 08, 10 |
| `[DEPOSIT_GBP]` | Deposit amount in GBP | 08, 09 |
| `[BALANCE_GBP]` | Balance amount in GBP | 10 |
| `[ETA_WINDOW]` | Estimated arrival window | 03 |

### Service

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[SERVICE_NAME]` | Service type name | 01, 02, 03, 04, 05, 06, 07 |
| `[SERVICE_SUMMARY]` | Brief description (reserved) | - |

### Reports

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[REPORT_ID]` | Diagnostic report reference | 04 |
| `[REPORT_SUMMARY]` | Paragraph of key findings | 04 |
| `[REPORT_LINK]` | URL to full report | 04, 05 |

### Invoicing & Payment

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[INVOICE_ID]` | Invoice reference | 04, 05, 07 |
| `[INVOICE_TOTAL]` | Total amount (formatted) | 04, 05, 07 |
| `[INVOICE_DUE_DATE]` | Payment due date | 07 |
| `[INVOICE_LINE_ITEMS_HTML]` | HTML fragment of line items | 04, 05, 07 |
| `[PAYMENT_LINK]` | URL to payment page | 04, 07 |
| `[PAYMENT_METHODS]` | Accepted methods string | 04, 07 |

### Location

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[ADDRESS_LINE]` | Full address/location description | 03 |
| `[MAP_LINK]` | Google Maps / Waze link | 03 |

### Review

| Placeholder | Description | Used in |
|-------------|-------------|---------|
| `[REVIEW_LINK]` | Google review link | 06 |

---

## Logo

All templates use the PNG logo hosted at:

```
https://tripointdiagnostics.co.uk/logo-no-text-light.png
```

Source file: `tripoint-frontend/public/logo-no-text-light.png`

---

## API Endpoints

The backend (`python-scripts/api.py`) exposes endpoints to manage and send emails. These require the `X-Admin-Key` header (if `ADMIN_KEY` env var is set).

### List Templates
`GET /api/email/templates`

### Get Raw Template
`GET /api/email/templates/{slug}?format=html|text`

### Preview (Render)
`POST /api/email/templates/{slug}/preview`
Render a template with provided data. Returns rendered HTML, text, subject, and missing placeholders.

**Body:**
```json
{
  "data": {
    "CLIENT_FIRST_NAME": "Jamie",
    "VEHICLE_REG": "AB12 CDE"
  }
}
```

### Send Test Email
`POST /api/email/send-test`
Render and send a real email via Zoho Mail integration.

**Body:**
```json
{
  "to": "jamie@example.com",
  "template": "04-job-complete",
  "data": { ... }
}
```

---

## Test Script usage

A test script is available at `python-scripts/test_email_api.py`.

```bash
# Preview (no send)
python python-scripts/test_email_api.py --preview --template 02-booking-confirmation

# Send real test email
python python-scripts/test_email_api.py --to jamie@example.com --template 04-job-complete
```

**Required Environment Variables:**
- `EMAIL_API_BASE`: API URL (default: `http://localhost:8000`)
- `EMAIL_API_KEY`: Admin key (if configured on server)

---

## Authentication & Production Setup

For production (VPS) or long-running instances, you must configure **Automatic Token Refreshing**.

### Required Environment Variables (.env)

| Variable | Description |
|----------|-------------|
| `ZOHO_MAIL_REFRESH_TOKEN` | **Critical**: Allows the API to generate new access tokens forever. |
| `ZOHO_CLIENT_ID` | Your Zoho Client ID (Self Client). |
| `ZOHO_CLIENT_SECRET` | Your Zoho Client Secret. |
| `ZOHO_MAIL_ACCOUNT_ID` | Your Zoho Account ID (numeric). |
| `ZOHO_FROM_EMAIL` | Sender address (e.g., `contact@tripointdiagnostics.co.uk`). |
| `ZOHO_MAIL_REGION` | `eu` (default) or `com`. Matches your Zoho account region. |

### How to get the Refresh Token
Run the helper script once:
```bash
python python-scripts/get_zoho_tokens.py
```
Follow the instructions to generate a code, paste it in, and the script will output your `ZOHO_MAIL_REFRESH_TOKEN`. Add this to your `.env` file.

Once configured, the API will automatically handle token expiration and renewal.

### Why did my token stop working?
Access Tokens expire in **1 hour**. If you only set `ZOHO_MAIL_ACCESS_TOKEN`, your API will break after 60 minutes.
By adding `ZOHO_MAIL_REFRESH_TOKEN` (and Client ID/Secret), the API will automatically generate new Access Tokens for you in the background, keeping it working forever.

---

## Email Client Compatibility

| Feature | Notes |
|---------|-------|
| **Layout** | Table-based, 600px max-width, responsive via `max-width` + `width:100%` |
| **Fonts** | System font stack: `-apple-system, 'Segoe UI', Roboto, Arial, sans-serif` |
| **CSS** | Fully inline - no `<style>` block (avoids Gmail clipping issues) |
| **Images** | Single logo image with `alt` text fallback |
| **Dark mode** | `color-scheme: light` meta tag; solid background colors avoid transparency issues |
| **Outlook** | MSO conditional font fallback included in `<head>` |
| **Preheader** | Hidden `<div>` with padding characters to prevent preview text leakage |

---

## Brand Colours Used

| Token | Value | Usage |
|-------|-------|-------|
| Primary accent | `#0ea5e9` | CTA buttons, links |
| Dark accent | `#0284c7` | Hover state (not used inline, for reference) |
| Success green | `#166534` on `#ecfdf5` | Confirmation banners |
| Warning amber | `#92400e` on `#fffbeb` | Invoice due banners |
| Overdue red | `#991b1b` on `#fef2f2` | Overdue banners |
| Text primary | `#111827` | Headings |
| Text body | `#374151` | Body copy |
| Text muted | `#6b7280` / `#9ca3af` | Secondary / footer text |
| Background | `#f4f5f7` | Outer wrapper |
| Surface | `#ffffff` | Email card |
| Surface alt | `#f9fafb` | Info boxes, footer |
| Border | `#e5e7eb` | Card borders, dividers |
