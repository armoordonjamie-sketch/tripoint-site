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

TOTAL_PENCE = 10515  # £105.15

INVOICE_ID = "TPD-2026-0024"
INVOICE_DATE = "6 May 2026"
DUE_DATE = "N/A"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Step 1: Create Stripe Payment Link ──────────────────
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} – Service B + ATF Service",
    description="Friends & Family invoice for Service B and ATF service.",
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

# Parts full price inc VAT = £210.30
# Parts full price ex VAT = £175.25
# 50% F&F discount on parts = -£87.63
# Discounted parts net = £87.63 (rounding in customer's favour: £87.62)
# Labour: 4 hrs @ £0/hr = £0.00
# Net total: £87.63
# VAT @ 20%: £17.52
# Total inc VAT: £105.15

line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Parts &amp; Consumables</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Oil Filter</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;15.00</td>
                    <td style="text-align:right;">&pound;15.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Fuel Filter</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;35.00</td>
                    <td style="text-align:right;">&pound;35.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Air Filter &amp; Cabin Filter</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Cleaned and reused due to stock availability.</span>
                    </td>
                    <td style="text-align:center;">-</td>
                    <td style="text-align:right;">&pound;0.00</td>
                    <td style="text-align:right;">&pound;0.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Engine Oil (229.52)</strong>
                    </td>
                    <td style="text-align:center;">6 L</td>
                    <td style="text-align:right;">&pound;10.50</td>
                    <td style="text-align:right;">&pound;63.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz ATF (236.15)</strong>
                    </td>
                    <td style="text-align:center;">6 L</td>
                    <td style="text-align:right;">&pound;9.00</td>
                    <td style="text-align:right;">&pound;54.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Screw Plug</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;5.25</td>
                    <td style="text-align:right;">&pound;5.25</td>
                </tr>
                <tr>
                    <td>
                        <strong>Crush Washer</strong>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;3.00</td>
                    <td style="text-align:right;">&pound;3.00</td>
                </tr>
                <tr style="border-top:2px solid #e5e7eb;">
                    <td colspan="3" style="text-align:right;font-weight:600;">Parts subtotal (before discount)</td>
                    <td style="text-align:right;font-weight:600;">&pound;175.25</td>
                </tr>
                <tr style="color:#059669;">
                    <td colspan="3" style="text-align:right;font-weight:600;">Friends &amp; Family Discount (50% off parts)</td>
                    <td style="text-align:right;font-weight:600;">-&pound;87.63</td>
                </tr>
                <tr style="border-top:2px solid #e5e7eb;">
                    <td colspan="3" style="text-align:right;font-weight:700;">Parts subtotal (after discount)</td>
                    <td style="text-align:right;font-weight:700;">&pound;87.63</td>
                </tr>

                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">Labour</td>
                </tr>
                <tr>
                    <td>
                        <strong>Service B + ATF Service Labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">Full Service B and automatic transmission fluid drain &amp; refill.</span>
                    </td>
                    <td style="text-align:center;">4 hrs</td>
                    <td style="text-align:right;">&pound;0.00</td>
                    <td style="text-align:right;">&pound;0.00</td>
                </tr>
                <tr style="color:#059669;">
                    <td colspan="4" style="font-size:12px;padding:6px 12px;">
                        <em>Friends &amp; Family &mdash; labour provided at no charge</em>
                    </td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Service B + ATF Service",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": "N/A",
    "[PAYMENT_TERMS]": "Friends & Family",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Renganaden Armoordon",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "476 Sidcup Road\nLondon\nSE9 4HA",
    "[SERVICE_ADDRESS]": "476 Sidcup Road\nLondon, SE9 4HA",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz",
    "[VEHICLE_REG]": "YP15 XXB",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;87.63",
    "[DISCOUNT]": "Applied inline",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;17.52",
    "[TOTAL]": "&pound;105.15",
    "[AMOUNT_PAID]": "&pound;105.15",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Bank Transfer on 10 May 2026 &ndash; thank you!</p>',
    "[NOTES]": "<p><strong>Notes:</strong> Service B and ATF service completed. 50% Friends &amp; Family discount applied to all parts. Labour provided at no charge. Air filter and cabin filter cleaned and reused due to stock availability &mdash; to be replaced when parts are available.</p>",
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
print(f"Customer: Renganaden Armoordon")
print(f"Parts (net, before discount):  GBP175.25")
print(f"F&F Discount (50% parts):     -GBP87.63")
print(f"Labour (4 hrs @ £0/hr):        GBP0.00")
print(f"Subtotal (net):                GBP87.63")
print(f"VAT (20%):                     GBP17.52")
print(f"Total:                         GBP105.15")
print(f"{'='*60}")
