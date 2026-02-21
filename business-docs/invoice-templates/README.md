# Tripoint Diagnostics Ltd - Invoice Templates

Professional invoice templates for email and PDF rendering. Designed for UK small-business invoicing with a clean, tech/precision aesthetic.

## Invoice Variants

| File | Purpose |
|------|---------|
| `deposit-invoice.html` / `.txt` | **Deposit Invoice** - Secures booking slot. Deducted from final invoice. Typically "Due on receipt". |
| `service-invoice.html` / `.txt` | **Service Invoice** - Completion invoice for diagnostic visit. Shows deposit credited if applicable. |
| `additional-work-invoice.html` / `.txt` | **Additional Work Invoice** - Follow-up repairs or extra work authorised after initial diagnosis. |

## Placeholder Reference

All placeholders use `[UPPERCASE_NAME]` format. Replace with Python (or other script) before sending/rendering. **Do not use curly braces.**

### Core Placeholders (all templates)

| Placeholder | Description | Required |
|-------------|-------------|----------|
| `[INVOICE_ID]` | Invoice reference (e.g. INV-2024-001) | Yes |
| `[INVOICE_DATE]` | Invoice date | Yes |
| `[DUE_DATE]` | Payment due date | Yes |
| `[PAYMENT_TERMS]` | e.g. "Due on receipt", "7 days" | Yes |
| `[STATUS]` | UNPAID, PAID, PARTIALLY PAID | Yes |
| `[STATUS_CLASS]` | CSS class: unpaid, paid, partial | Yes |
| `[CLIENT_FULL_NAME]` | Client name | Yes |
| `[CLIENT_EMAIL]` | Client email | Yes |
| `[CLIENT_PHONE]` | Client phone | Yes |
| `[BILL_TO_ADDRESS]` | Multi-line billing address | Yes |
| `[SERVICE_ADDRESS]` | Multi-line service/visit address | Yes |
| `[VEHICLE_REG]` | Vehicle registration | Yes |
| `[VEHICLE_MAKE_MODEL]` | Make and model | Yes |
| `[ODOMETER]` | Mileage (optional) | No |
| `[JOB_ID]` | Job reference (optional) | No |
| `[PO_NUMBER]` | Purchase order (optional) | No |
| `[TECH_NAME]` | Technician name | Yes |
| `[NOTES]` | Additional notes (optional) | No |
| `[PAYMENT_METHODS]` | Default: "Card (Stripe), bank transfer" | Yes |
| `[PAYMENT_LINK]` | Pay Now button URL or full HTML; **hide if empty** | No |
| `[BANK_DETAILS]` | Bank details block; **hide if empty** | No |
| `[SUBTOTAL]` | Subtotal amount | Yes |
| `[DISCOUNT]` | Discount (optional; use £0.00 or - if none) | No |
| `[VAT_RATE]` | e.g. "20%" (optional) | No |
| `[VAT_AMOUNT]` | VAT amount (optional) | No |
| `[TOTAL]` | Total amount | Yes |
| `[AMOUNT_PAID]` | Amount already paid (optional) | No |
| `[BALANCE_DUE]` | Outstanding balance | Yes |
| `[LINE_ITEMS_HTML]` | **Raw HTML** table rows; do not escape | Yes |
| `[FOOTER_EXTRA]` | Extra footer content (optional) | No |
| `[CURRENT_YEAR]` | e.g. 2024 | Yes |
| `[LOGO_URL]` | Logo image URL (default: https://tripointdiagnostics.co.uk/logo-no-text-light.png) | Yes |
| `[VAT_NUMBER]` | VAT reg; **hide entire VAT line if empty** | No |
| `[CANCELLATION_URL]` | Default: https://tripointdiagnostics.co.uk/legal/terms (cancellation in T&amp;C) | No |
| `[TERMS_URL]` | Default: https://tripointdiagnostics.co.uk/legal/terms | No |
| `[PRIVACY_URL]` | Default: https://tripointdiagnostics.co.uk/legal/privacy-policy | No |
| `[DISCLAIMER_URL]` | Default: https://tripointdiagnostics.co.uk/legal/disclaimer | No |

### Deposit Invoice only

| Placeholder | Description | Required |
|-------------|-------------|----------|
| `[DEPOSIT_AMOUNT]` | Deposit amount | Yes |
| `[DEPOSIT_REASON]` | Reason for deposit (optional) | No |

### Service Invoice only

| Placeholder | Description | Required |
|-------------|-------------|----------|
| `[DEPOSIT_CREDIT_HTML]` | Block showing deposit received + ref; **empty if no deposit** | No |
| `[DEPOSIT_CREDIT_TEXT]` | Plain-text version for .txt | No |
| `[DEPOSIT_RECEIVED]` | Amount (used inside DEPOSIT_CREDIT_HTML) | No |
| `[DEPOSIT_INVOICE_ID]` | Reference to deposit invoice | No |

### Additional Work Invoice only

| Placeholder | Description | Required |
|-------------|-------------|----------|
| `[AUTHORISATION_METHOD]` | e.g. "WhatsApp approval", "Email approval" | Yes |
| `[AUTHORISATION_DATE]` | Date work was authorised | Yes |
| `[AUTHORISATION_REF]` | Reference (optional) | No |
| `[WARRANTY_TEXT]` | Warranty/limitations (optional) | No |
| `[WARRANTY_BLOCK_HTML]` | Formatted warranty block; **empty if no warranty text** | No |

## Python Renderer Notes

### [LINE_ITEMS_HTML]

- **Trusted HTML** - generated server-side. Do **not** escape.
- Inject full `<tr>...</tr>` rows. Example:
  ```html
  <tr><td>Diagnostic callout</td><td style="text-align:center;">1</td><td style="text-align:right;">£120.00</td><td style="text-align:right;">£120.00</td></tr>
  ```

### Hiding sections when placeholders are empty

| Condition | Action |
|-----------|--------|
| `[VAT_NUMBER]` empty | Replace `[VAT_NUMBER]` with `""`; hide VAT row in totals (replace entire row with `""`) |
| `[PAYMENT_LINK]` empty | Replace `[PAYMENT_LINK]` with `""` (or replace the whole Pay Now button block with `""`) |
| `[BANK_DETAILS]` empty | Replace `[BANK_DETAILS]` with `""` |
| `[DEPOSIT_CREDIT_HTML]` | Inject block when deposit was taken; else `""` |
| `[WARRANTY_BLOCK_HTML]` | Inject block when `[WARRANTY_TEXT]` present; else `""` |

### [PAYMENT_LINK] behaviour

When a payment URL is provided, replace `[PAYMENT_LINK]` with the full button HTML, e.g.:
```html
<a href="https://..." class="pay-btn">Pay Now</a>
```
When empty, replace with `""` so the button is hidden.

### [BANK_DETAILS] behaviour

When provided, replace with formatted HTML, e.g.:
```html
<p><strong>Bank transfer:</strong><br>Sort code: 00-00-00<br>Account: 12345678<br>Ref: [INVOICE_ID]</p>
```
When empty, replace with `""`.

### PDF render settings (WeasyPrint / wkhtmltopdf)

- **Page size:** A4
- **Margins:** 20mm
- **Print media:** Use `@media print` or equivalent for print-friendly output

### Email

- **Reply-To:** contact@tripointdiagnostics.co.uk (handle in Python mailer)
- HTML templates use inline-friendly CSS; tables for layout where needed for email clients.

## Logo Asset

- **Path used:** `tripoint-frontend/public/logo-icon.svg`
- **Default URL for templates:** `https://tripointdiagnostics.co.uk/logo-no-text-light.png` (matches existing email templates)
- **Placeholder:** `[LOGO_URL]` - replace with full URL. For local PDF, use file path or data URI.

## Design

- **Accent colour:** `#0284c7` (brand-dark from site)
- **Background:** White
- **Fonts:** System stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`)
- **Layout:** Tables for line items; print-friendly with `page-break-inside: avoid` on rows
