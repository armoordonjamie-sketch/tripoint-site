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

INVOICE_ID = "TPD-2026-0028"
INVOICE_DATE = "15 May 2026"
DUE_DATE = "Due on receipt"
TOTAL_PENCE = 14400  # £144.00 inc VAT

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Create Stripe Payment Link ──────────────────
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} - Standard Diagnostic Visit",
    description="Ford Transit Custom - AdBlue / no-start fault investigation following turbo replacement.",
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

# £120.00 ex VAT + £24.00 VAT (20%) = £144.00 inc VAT
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Diagnostic Call-out
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Standard Diagnosis (Zone A) - AdBlue / No-start Fault Investigation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Investigation following recent turbo replacement. Includes:<br>
                            &bull; Full systems fault scan (multi-module)<br>
                            &bull; AdBlue system reset procedure<br>
                            &bull; Live data review of relevant injection / emissions parameters<br>
                            &bull; Written outcome with findings and recommended next steps
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Standard Diagnosis - AdBlue / No-start Investigation",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on receipt",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "UNPAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Balloonzone (Sue Mitchell)",
    "[CLIENT_EMAIL]": "Balloonzone@ntlworld.com",
    "[CLIENT_PHONE]": "+44 7711 981994",
    "[BILL_TO_ADDRESS]": "Balloonzone\n214 Croydon Road\nBeckenham\nBR3 4DE",
    "[SERVICE_ADDRESS]": "214 Croydon Road\nBeckenham, BR3 4DE",
    "[VEHICLE_MAKE_MODEL]": "2018 Ford Transit Custom",
    "[VEHICLE_REG]": "TBC",
    "[ODOMETER]": "TBC",
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
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": f'<a href="{PAYMENT_URL}" class="pay-btn" style="color:#fff !important;">Pay &pound;144.00 Online &rarr;</a>',
    "[NOTES]": "<p><strong>Visit summary:</strong> Standard diagnostic visit (Zone A) covering AdBlue / no-start "
               "fault investigation following recent turbo replacement. Full multi-module systems scan performed, "
               "AdBlue system reset procedure carried out, live data reviewed and a written outcome provided with "
               "findings and recommended next steps.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> Covers the standard diagnostic visit only "
               "(1 hr at &pound;120.00 + VAT = &pound;144.00 inc VAT). Any follow-up labour or parts will be quoted "
               "and invoiced separately.</p>",
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
print(f"Customer: Balloonzone (Sue Mitchell)")
print(f"Vehicle:  2018 Ford Transit Custom")
print(f"Scope:    Standard Diagnosis (Zone A) - AdBlue / no-start investigation")
print(f"Subtotal:        GBP120.00")
print(f"VAT (20%):       GBP24.00")
print(f"Total:           GBP144.00")
print(f"Status:          UNPAID")
print(f"Payment Link: {PAYMENT_URL}")
print(f"{'='*60}")
