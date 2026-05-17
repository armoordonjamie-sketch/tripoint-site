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

INVOICE_ID = "TPD-2026-0012"
INVOICE_DATE = "18 April 2026"
DUE_DATE = "20 April 2026"
TOTAL_PENCE = 18000  # £180.00

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

# ── Step 1: Create Stripe Payment Link ──────────────────
# Reuse existing live Stripe link
PAYMENT_URL = "https://buy.stripe.com/9B6aEZ8dt0Mi7m49eXaZi0a"
print(f"[OK] Reusing LIVE Stripe link: {PAYMENT_URL}")

# ── Step 2: Build HTML Invoice ──────────────────────────
logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>Diagnostic Visit &ndash; Zone C (Whitstable)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Vauxhall Vivaro Campervan (DP68JUK)<br>
                            AdBlue / SCR diagnostic visit. Full-system diagnostic scan, live data analysis,
                            guided fault-finding, and written outcome report.
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;150.00</td>
                    <td style="text-align:right;">&pound;150.00</td>
                </tr>
"""

replacements = {
    "Diagnostic visit completion": "AdBlue / SCR Diagnostic Visit",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on completion",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "UNPAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Yesmore Ltd",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "FAO: Tom Khan-Lavin\n31 New Inn Yard\nLondon, EC2A 3EY",
    "[SERVICE_ADDRESS]": "44 Northwood Road\nWhitstable, CT5 2ES",
    "[VEHICLE_MAKE_MODEL]": "Vauxhall Vivaro (Campervan)",
    "[VEHICLE_REG]": "DP68JUK",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;150.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;30.00",
    "[TOTAL]": "&pound;180.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;180.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": f'<a href="{PAYMENT_URL}" class="pay-btn" style="color:#fff !important;">Pay &pound;180.00 Online &rarr;</a>',
    "[NOTES]": f"<p><strong>Notes:</strong> Zone C diagnostic callout (Whitstable) for AdBlue / SCR fault investigation on Vauxhall Vivaro campervan DP68JUK. Payment due by Monday 20 April 2026.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

for placeholder, value in replacements.items():
    template = template.replace(placeholder, value)

# Make logo bigger
template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

# Save
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
print(f"INVOICE: {INVOICE_ID}")
print(f"Customer: Tom Khan-Lavin / Yesmore Ltd")
print(f"Vehicle: Vauxhall Vivaro (Campervan) DP68JUK")
print(f"Subtotal:     GBP150.00")
print(f"VAT (20%):    GBP30.00")
print(f"Total:        GBP180.00")
print(f"Due:          Monday 20 April 2026")
print(f"Payment Link: {PAYMENT_URL}")
print(f"{'='*60}")
