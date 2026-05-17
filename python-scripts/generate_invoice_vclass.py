import sys
import os
import io
import base64
from pathlib import Path
import stripe
from playwright.sync_api import sync_playwright
from dotenv import load_dotenv

# Setup env path
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
if not stripe.api_key:
    raise SystemExit("Set STRIPE_SECRET_KEY in python-scripts/.env")

INVOICE_ID = "TPD-2026-0013"
INVOICE_DATE = "21 April 2026"
DUE_DATE = "28 April 2026"
TOTAL_PENCE = 37200  # £372.00

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 1) Generate the LIVE Stripe Payment Link 
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} – Service B (V-Class)",
    description="Mercedes-Benz Service B / K9 DDH.",
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
print(f"[OK] LIVE Stripe link created: {PAYMENT_URL}")

# 2) Render HTML Template
logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Parts</td>
                </tr>
                <tr>
                    <td>
                        <strong>MB Engine Oil — 8.5L</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz specification engine oil</span>
                    </td>
                    <td style="text-align:center;">8.5</td>
                    <td style="text-align:right;">&pound;8.00</td>
                    <td style="text-align:right;">&pound;68.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>MB Oil Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz oil filter insert</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;18.00</td>
                    <td style="text-align:right;">&pound;18.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>MB Fuel Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz fuel filter assembly</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;42.00</td>
                    <td style="text-align:right;">&pound;42.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>MB Air Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz engine air filter element</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;32.00</td>
                    <td style="text-align:right;">&pound;32.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>MB Cabin Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Genuine Mercedes-Benz interior combination filter</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;30.00</td>
                    <td style="text-align:right;">&pound;30.00</td>
                </tr>
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout &amp; Service B</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Travel to customer location (Zone B), Service B procedures including oil & filter change, fuel/air/cabin filter change, comprehensive vehicle inspection, and full XENTRY system check & service indicator reset. Digital Service Book (DSB) update applied if applicable.</span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Service B",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Net 7 days",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Denise Harrild",
    "[CLIENT_EMAIL]": "dharrild25@gmail.com",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "7 Coppergate\nHempstead\nGillingham, Kent\nME7 3QN",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz V-Class W447 (Marco Polo)",
    "[VEHICLE_REG]": "K9 DDH",
    "[ODOMETER]": "62,677 miles / 100,871 km",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;310.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;62.00",
    "[TOTAL]": "&pound;372.00",
    "[AMOUNT_PAID]": "&pound;372.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Service B completed. Full diagnostic printout and service inspection sheet provided. Digital Service Book (DSB) updated. VIN: WDF44781323508228.</p><p><strong>Payment:</strong> &pound;372.00 paid securely online via Stripe on 22 April 2026 (Visa ending in 3108). Invoice settled in full.</p>",
    "[FOOTER_EXTRA]": "",
    "[CANCELLATION_URL]": "https://tripointdiagnostics.co.uk/legal/cancellation-policy",
    "[TERMS_URL]": "https://tripointdiagnostics.co.uk/legal/terms",
    "[PRIVACY_URL]": "https://tripointdiagnostics.co.uk/legal/privacy-policy",
    "[DISCLAIMER_URL]": "https://tripointdiagnostics.co.uk/legal/disclaimer",
    "[CURRENT_YEAR]": "2026",
    "[VAT_NUMBER]": "<strong>VAT No.:</strong> 515 7327 92",
}

template = TEMPLATE_PATH.read_text(encoding="utf-8")
for k, v in replacements.items():
    template = template.replace(k, str(v))

template = template.replace('style="max-height:40px;"', 'style="max-height:150px;"')
template = template.replace("max-height: 40px", "max-height: 150px")

html_path = OUTPUT_DIR / f"{INVOICE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML saved: {html_path}")

# 3) Convert to PDF
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
