"""
UPDATED Invoice for Tom Wilson – 2016 Mercedes Vito DA16ZGO
Original £120 diagnostic PAID. New additional work: EIS repair.
Creates new LIVE Stripe link for outstanding £165 balance.
"""
import base64
import os
import stripe
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
load_dotenv(Path(__file__).parent / ".env.production")

# ── Config ─────────────────────────────────────────────
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe.api_key:
    raise SystemExit("Set STRIPE_SECRET_KEY in python-scripts/.env (never commit keys)")

INVOICE_ID = "TPD-2026-0002"
INVOICE_DATE = "2 March 2026"
UPDATED_DATE = "7 March 2026"
DUE_DATE = "14 March 2026"
BALANCE_PENCE = 0  # Fully paid

# No payment link needed - fully paid
PAYMENT_URL = ""
print("[OK] Invoice fully paid - no payment link needed")

# ── Step 2: Build HTML Invoice ──────────────────────────
TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>Diagnostic Callout - Intermittent Ignition Fault</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            2016 Mercedes Vito W447 (DA16ZGO)<br>
                            Customer complaint: Ignition won't turn on in the mornings - has progressed and is now intermittent.<br>
                            Full-system diagnostic scan, live data analysis, guided fault-finding, and written outcome report.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Follow-Up Visit - EIS Collection &amp; Repair</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to and from customer location, collected original EIS unit from vehicle.<br>
                            Taken back to unit for bench repair. Swapped common failure points: induction coil, IR reader, reflowed main IMU/processor.
                        </span>
                    </td>
                    <td style="text-align:center;">1.5 hrs</td>
                    <td style="text-align:right;">&pound;85.00/hr</td>
                    <td style="text-align:right;">&pound;127.50</td>
                </tr>
                <tr>
                    <td>
                        <strong>Donor EIS Unit (Parts)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Donor Electronic Ignition Switch used for replacement components.<br>
                            <em>Reduced from &pound;120.00</em>
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;"><s style="color:#9ca3af;">&pound;120.00</s><br>&pound;90.00</td>
                    <td style="text-align:right;">&pound;90.00</td>
                </tr>
"""

replacements = {
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on receipt",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Tom Wilson",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "23 New Road\nHextable\nBR8 7LS",
    "[SERVICE_ADDRESS]": "23 New Road\nHextable\nBR8 7LS",
    "[VEHICLE_MAKE_MODEL]": "2016 Mercedes-Benz Vito W447",
    "[VEHICLE_REG]": "DA16ZGO",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;337.50",
    "[DISCOUNT]": "&pound;0.00",
    "[VAT_RATE]": "N/A - below VAT threshold",
    "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;337.50",
    "[AMOUNT_PAID]": "&pound;337.50",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full - thank you!</p>',
    "[NOTES]": f'<p><strong>Notes:</strong> Diagnostic callout (&pound;120.00) paid 2 March 2026. '
        f'Balance (&pound;217.50) paid via Stripe 7 March 2026. Invoice settled in full.</p>',
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "",
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, value)

# Make logo bigger
template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

# Save filled HTML
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML invoice saved: {html_path}")

# ── Step 3: Convert to PDF via Playwright ───────────────
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

print(f"[OK] PDF invoice saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"UPDATED INVOICE: {INVOICE_ID}")
print(f"Customer: Tom Wilson | Vehicle: 2016 Vito DA16ZGO")
print(f"Subtotal:     GBP337.50")
print(f"Amount Paid:  GBP337.50 (FULLY PAID)")
print(f"Balance Due:  GBP0.00")
print(f"{'='*60}")
