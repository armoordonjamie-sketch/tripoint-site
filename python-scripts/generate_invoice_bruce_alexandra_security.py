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

INVOICE_ID = "TPD-2026-0030"
INVOICE_DATE = "19 May 2026"
DUE_DATE = "26 May 2026 (Net 7)"
TOTAL_PENCE = 14400  # £144.00 inc VAT

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Stripe Payment Link ─────────────────────────
# Reuse the existing live payment link created on the first run of this script
# so re-runs (e.g. to fix address typos) don't create duplicate products / links
# in Stripe. Set REGENERATE_PAYMENT_LINK = True to create a fresh one.
REGENERATE_PAYMENT_LINK = False
EXISTING_PAYMENT_URL = "https://buy.stripe.com/9B600lbpF9iOaygaj1aZi0C"

if REGENERATE_PAYMENT_LINK:
    product = stripe.Product.create(
        name=f"Invoice {INVOICE_ID} - Mobile Diagnostic Visit",
        description="Mercedes Sprinter NK17 OFR - Emissions System Diagnostic (DPF, EGR, CAT) - Zone A.",
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
else:
    PAYMENT_URL = EXISTING_PAYMENT_URL
    print(f"[OK] Reusing existing Stripe payment link: {PAYMENT_URL}")

# ── Step 2: Build HTML ──────────────────────────────────
template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# £120.00 ex VAT + £24.00 VAT (20%) = £144.00 inc VAT
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Diagnostic Call-out
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Diagnostic Visit (Zone A) - Emissions System (DPF, EGR &amp; CAT)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Mercedes-Benz Sprinter (NK17 OFR) on-site diagnostic visit covering emissions
                            system operation:<br>
                            &bull; Full multi-module XENTRY systems scan<br>
                            &bull; Diesel Particulate Filter (DPF) status &amp; differential pressure check<br>
                            &bull; Exhaust Gas Recirculation (EGR) operation &amp; live data review<br>
                            &bull; Catalytic Converter (CAT) operation &amp; oxygen / NOx sensor review<br>
                            &bull; Findings and recommended next steps provided
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Mobile Diagnostic Visit - Emissions System (DPF, EGR &amp; CAT)",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Net 7 days",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "UNPAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Alexandra Security Ltd",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "FAO: Bruce Dickson\nAlexandra Security Ltd\nUnit 1 Perimeter Works\nWhetsted Road\nFive Oak Green\nTonbridge, Kent\nTN12 6PZ",
    "[SERVICE_ADDRESS]": "Unit 1 Perimeter Works\nWhetsted Road, Five Oak Green\nTonbridge, Kent, TN12 6PZ",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter",
    "[VEHICLE_REG]": "NK17 OFR",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;120.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;24.00",
    "[TOTAL]": "&pound;144.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;144.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer using the details shown.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">TriPoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": f'<a href="{PAYMENT_URL}" class="pay-btn" style="color:#fff !important;">Pay &pound;144.00 Online &rarr;</a>',
    "[NOTES]": "<p><strong>Vehicle:</strong> Mercedes-Benz Sprinter, registration NK17 OFR, "
               "VIN <strong>WDB9061352N709852</strong>.</p>"
               "<p style='margin-top:8px;'><strong>Visit summary:</strong> Mobile diagnostic visit (Zone A) covering "
               "emissions system operation - DPF status and differential pressure, EGR operation and live data, "
               "catalytic converter (CAT) operation and oxygen / NOx sensor review. Findings and recommended next "
               "steps provided.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> Covers the diagnostic visit only "
               "(&pound;120.00 + VAT = &pound;144.00 inc VAT). Any follow-up parts or labour will be quoted and "
               "invoiced separately.</p>"
               "<p style='margin-top:8px;'><strong>Payment terms:</strong> Net 7 days - due by 26 May 2026.</p>",
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

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

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
print(f"Customer: Bruce (Alexandra Security Ltd)")
print(f"Vehicle:  Mercedes-Benz Sprinter (NK17 OFR)")
print(f"VIN:      WDB9061352N709852")
print(f"Scope:    Mobile Diagnostic Visit - Emissions (DPF/EGR/CAT) Zone A")
print(f"Subtotal:        GBP120.00")
print(f"VAT (20%):       GBP24.00")
print(f"Total:           GBP144.00")
print(f"Status:          UNPAID - Net 7 (due 26 May 2026)")
print(f"Payment Link: {PAYMENT_URL}")
print(f"{'='*60}")
