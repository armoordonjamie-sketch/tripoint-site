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

INVOICE_ID = "TPD-2026-0018"
INVOICE_DATE = "27 April 2026"
DUE_DATE = "28 April 2026"
TOTAL_PENCE = 37800  # £378.00

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Create Stripe Payment Link ──────────────────
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} – Battery Replacement (V-Class)",
    description="Genuine Mercedes starter battery replacement – Mercedes-Benz V Class W447 (K9 DDH).",
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
                        <strong>MB Starter Battery</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz main starter battery</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;195.00</td>
                    <td style="text-align:right;">&pound;195.00</td>
                </tr>
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout &amp; Installation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Travel to customer location, supply and fit new battery. Includes battery registration/coding to vehicle system via XENTRY.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Battery Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due by 28 April",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "UNPAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Denise Harrild",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "7 Coppergate\nHempstead\nGillingham, Kent\nME7 3QN",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz V-Class W447 (Marco Polo)",
    "[VEHICLE_REG]": "K9 DDH",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Harrison Watling",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;315.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;63.00",
    "[TOTAL]": "&pound;378.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;378.00",
    "[PAYMENT_METHODS]": "Bank transfer or card payment via secure link.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": f'<a href="{PAYMENT_URL}" class="pay-btn" style="color:#fff !important;">Pay &pound;378.00 Online &rarr;</a>',
    "[NOTES]": "<p><strong>Notes:</strong> Battery supplied, installed and coded to vehicle successfully (as per Estimate EST-2026-0009).</p>",
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
print(f"Customer: Denise Harrild")
print(f"Vehicle: Mercedes-Benz V-Class W447 (Marco Polo)")
print(f"Subtotal:     GBP315.00")
print(f"VAT (20%):    GBP63.00")
print(f"Total:        GBP378.00")
print(f"Payment Link: {PAYMENT_URL}")
print(f"{'='*60}")
