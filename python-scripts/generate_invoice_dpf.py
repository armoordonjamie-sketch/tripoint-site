import base64
import os
import stripe
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / ".env.production")

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe.api_key:
    raise SystemExit("Set STRIPE_SECRET_KEY in python-scripts/.env")

INVOICE_ID = "TPD-2026-0021"
INVOICE_DATE = "1 May 2026"
DUE_DATE = "8 May 2026"
TOTAL_PENCE = 269900  # £2,699.00 (VAT out of scope)

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Create Stripe Payment Link ──────────────────
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} – Genuine MB DPF Replacement",
    description="Genuine Mercedes-Benz DPF Replacement and Labour.",
)
price = stripe.Price.create(
    unit_amount=TOTAL_PENCE,
    currency="gbp",
    product=product.id,
)
link = stripe.PaymentLink.create(
    line_items=[{"price": price.id, "quantity": 1}],
    after_completion={"type": "redirect", "redirect": {"url": "https://tripointdiagnostics.co.uk/payment-success"}},
)
PAYMENT_URL = link.url
print(f"[OK] LIVE Stripe payment link created: {PAYMENT_URL}")

# ── Step 2: Build HTML ──────────────────────────────────
template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Parts</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine MB Diesel Particulate Filter (A906 490 79 81/64)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz Exhaust System Assembly</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;2,197.80</td>
                    <td style="text-align:right;">&pound;2,197.80</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine MB Pipe Clamp (A002 995 57 02)</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;22.14</td>
                    <td style="text-align:right;">&pound;22.14</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine MB Sealing Ring (A000 492 08 81)</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;9.18</td>
                    <td style="text-align:right;">&pound;9.18</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine MB Flange Seal (A219 492 00 80)</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;8.15</td>
                    <td style="text-align:right;">&pound;8.15</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine MB Exhaust Clamp (A000 490 14 41)</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;15.23</td>
                    <td style="text-align:right;">&pound;15.23</td>
                </tr>
                <tr>
                    <td>
                        <strong>Used Genuine MB NOX Sensor</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz nitrogen oxide sensor (used/tested)</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;80.00</td>
                    <td style="text-align:right;">&pound;80.00</td>
                </tr>

                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Call-out charge</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Mobile attendance, Kent / SE London zone</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Diesel Particulate Filter &mdash; Replace</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Battery ground disconnect &middot; Underfloor panel R&R &middot; DPF R&R &middot; Xentry quick test</span>
                    </td>
                    <td style="text-align:center;">2.9 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;246.50</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "DPF Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Net 7",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Colin Carpenter",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "48 Kilby Court\nGreenroof Way\nGreenwich, London\nSE10 0PY",
    "[SERVICE_ADDRESS]": "48 Kilby Court\nGreenwich, London\nSE10 0PY",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter",
    "[VEHICLE_REG]": "BX69 BSV",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;2,699.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "Out of Scope",
    "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;2,699.00",
    "[AMOUNT_PAID]": "&pound;2,699.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Bank Transfer on 6 May 2026 &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Diesel Particulate Filter replaced with Genuine Mercedes-Benz part (Dealership diagnosed cracked). Used genuine NOX sensor supplied and fitted. All specified genuine Mercedes-Benz seals and clamps used. VAT out of scope for this transaction.</p>"
        "<p><strong>Payment:</strong> &pound;2,699.00 received via bank transfer on 6 May 2026. Invoice settled in full.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, str(value))

# Make logo bigger
template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

# Save HTML
html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

# ── Convert to PDF via Playwright ───────────────
from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{INVOICE_ID}.pdf"
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(f"file:///{html_path.as_posix()}")
    page.pdf(
        path=str(pdf_path),
        format="A4",
        margin={"top": "20mm", "bottom": "20mm", "left": "20mm", "right": "20mm"},
        print_background=True,
    )
    browser.close()

print(f"[OK] PDF saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"INVOICE: {INVOICE_ID}")
print(f"Subtotal:     GBP2699.00")
print(f"VAT:          GBP0.00 (Out of Scope)")
print(f"Total:        GBP2699.00")
print(f"Status:       PAID (Bank Transfer, 06/05/2026)")
print(f"{'='*60}")
