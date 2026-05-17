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

INVOICE_ID = "TPD-2026-0026"
INVOICE_DATE = "12 May 2026"
DUE_DATE = "Due on receipt"
TOTAL_PENCE = 20400  # £204.00 inc VAT

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Create Stripe Payment Link ──────────────────
product = stripe.Product.create(
    name=f"Invoice {INVOICE_ID} – Follow-up Diagnostic Visit (Visit 2)",
    description="Mercedes A-Class RV13 WFR – CAN bus / TCU / EZS diagnostic follow-up.",
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

# Labour 2.0 hrs @ £85.00 = £170.00 ex VAT
# VAT (20%):                £34.00
# Total inc VAT:            £204.00
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Follow-up Diagnostic Visit (Visit 2)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Additional Diagnostic Labour &mdash; Transmission / CAN Bus</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Follow-up visit focused on no-gear-selection condition:<br>
                            &bull; Transmission power and ground feeds confirmed good<br>
                            &bull; CAN communication scoped via oscilloscope at engine ECU and EZS (central gateway)<br>
                            &bull; All bus signals indicate TCU as non-responding node<br>
                            &bull; TCU previously bench-tested as functional &mdash; by elimination, fault now points
                            to the EZS / central gateway failing to pass communication through to the TCU<br>
                            &bull; Written diagnostic report &amp; next-step recommendation provided
                        </span>
                    </td>
                    <td style="text-align:center;">2 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;170.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Follow-up Diagnostic Visit &mdash; CAN Bus / TCU / EZS",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": DUE_DATE,
    "[PAYMENT_TERMS]": "Due on receipt",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "UNPAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "John Wafula",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "BR8 8DZ",
    "[SERVICE_ADDRESS]": "BR8 8DZ",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz A-Class",
    "[VEHICLE_REG]": "RV13 WFR",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;170.00",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;34.00",
    "[TOTAL]": "&pound;204.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;204.00",
    "[PAYMENT_METHODS]": "Pay securely online via the link below, or by bank transfer using the details shown.",
    "[BANK_DETAILS]": f'<p style="font-size:13px;color:#374151;margin:0 0 4px 0;"><strong>Bank transfer:</strong></p>'
        f'<p style="font-size:13px;color:#374151;margin:0;">Tripoint Diagnostics Ltd<br>Sort code: 04-06-05<br>Account: 30447065<br>Reference: {INVOICE_ID}</p>',
    "[PAYMENT_LINK]": f'<a href="{PAYMENT_URL}" class="pay-btn" style="color:#fff !important;">Pay &pound;204.00 Online &rarr;</a>',
    "[NOTES]": "<p><strong>Visit summary:</strong> Follow-up visit (Visit 2) on no-gear-selection fault. "
               "Transmission power and ground feeds confirmed good. CAN communication scoped using an "
               "oscilloscope at both the engine ECU and the EZS (Electronic Ignition Switch / central gateway). "
               "All signals on the bus point to the TCU as the non-responding node. As the TCU has already been "
               "bench-tested and returned as functional, by elimination the fault now points to the EZS failing "
               "to pass communication through to the TCU &mdash; a rare but known scenario on this platform.</p>"
               "<p style='margin-top:8px;'><strong>Recommended next step:</strong> Before condemning the EZS "
               "(a costly, security-coded component), source a known-working second-hand TCU and plug it in to "
               "confirm whether communication can be established. If the swapped-in TCU also fails to communicate, "
               "the EZS becomes the confirmed fault. If it does communicate correctly, the original TCU bench-test "
               "result will need to be revisited.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> Covers Visit 2 additional labour only "
               "(2 hrs at &pound;85.00/hr + VAT = &pound;204.00 inc. VAT). Diagnostic report covering Visit 2 findings "
               "supplied separately.</p>",
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
print(f"Customer: John Wafula")
print(f"Vehicle:  Mercedes-Benz A-Class (RV13 WFR)")
print(f"Scope:    Follow-up Visit 2 - CAN bus / TCU / EZS diagnostics")
print(f"Labour:   2.0 hrs @ GBP85.00 = GBP170.00 ex VAT")
print(f"VAT (20%):                     GBP34.00")
print(f"Total inc VAT:                 GBP204.00")
print(f"Status:                        UNPAID")
print(f"Payment Link: {PAYMENT_URL}")
print(f"{'='*60}")
