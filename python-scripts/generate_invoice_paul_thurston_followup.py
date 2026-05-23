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

INVOICE_ID = "TPD-2026-0032"
INVOICE_DATE = "23 May 2026"
DUE_DATE = "Due on receipt"
TOTAL_PENCE = 10200  # £102.00 inc VAT

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Stripe Payment Link (skip when regenerating as PAID) ──
REGENERATE_PAYMENT_LINK = False
EXISTING_PAYMENT_URL = "https://buy.stripe.com/bJe4gB9hxbqWayg1MvaZi0E"

if REGENERATE_PAYMENT_LINK:
    product = stripe.Product.create(
        name=f"Invoice {INVOICE_ID} - Repeat Diagnostic Visit",
        description="Mercedes GLA 220d Y6 PRT - Follow-up diagnostic (intake smoke test, turbo test, borescope).",
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
    print("[OK] Skipping Stripe link creation (invoice marked PAID)")

# ── Step 2: Build HTML ──────────────────────────────────
template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# 1.0 hr @ £85.00 ex VAT = £85.00 + £17.00 VAT = £102.00 inc VAT
# No mobile callout fee (repeat visit, agreed with customer)
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Repeat Diagnostic Visit (Follow-up to TPD-2026-0029)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Follow-up Diagnostic Labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Return visit following EML / limp-mode and intake whistle reported after
                            initial diagnostic on 18 May 2026. Includes:<br>
                            &bull; XENTRY quick test (multi-module fault check)<br>
                            &bull; Intake system smoke test (boost / induction leak check)<br>
                            &bull; Turbocharger operation test (live data / actuation)<br>
                            &bull; Borescope inspection of turbocharger (visual condition check)<br>
                            &bull; Findings discussed with customer on-site
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;85.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Repeat Diagnostic Visit - Intake / Turbo Investigation",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": "N/A",
    "[PAYMENT_TERMS]": "Paid on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Paul Thurston",
    "[CLIENT_EMAIL]": "paulrt2510@gmail.com",
    "[CLIENT_PHONE]": "07739 460043",
    "[BILL_TO_ADDRESS]": "15 Runnymede Road\nStanford-le-Hope\nSS17 0JY",
    "[SERVICE_ADDRESS]": "15 Runnymede Road\nStanford-le-Hope, SS17 0JY",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz GLA 220d",
    "[VEHICLE_REG]": "Y6 PRT",
    "[ODOMETER]": "67,000 miles (approx.)",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;85.00",
    "[DISCOUNT]": "None (no callout fee on repeat visit)",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;17.00",
    "[TOTAL]": "&pound;102.00",
    "[AMOUNT_PAID]": "&pound;102.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full via Stripe Link on 23 May 2026 at 14:34. Thank you!</p>'
        '<p style="font-size:12px;color:#6b7280;margin-top:4px;">Stripe payment ID: pi_3TaFgfRzrswjZPkV0nkeBnFt</p>',
    "[NOTES]": "<p><strong>Follow-up to invoice TPD-2026-0029 (18 May 2026):</strong> Return visit at customer "
               "home address, Stanford-le-Hope (SS17 0JY), following reported return of engine management light "
               "and intake whistle after the initial diagnostic visit.</p>"
               "<p style='margin-top:8px;'><strong>Works carried out:</strong> XENTRY quick test performed; "
               "intake system smoke tested; turbocharger operation tested; borescope used to inspect turbocharger "
               "condition. Findings discussed with customer on-site.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> Covers 1.0 hr labour at the standard "
               "hourly rate of &pound;85.00 + VAT (&pound;102.00 inc VAT). No mobile callout fee applied on this "
               "repeat visit, as agreed.</p>"
               "<p style='margin-top:8px;'><strong>Payment:</strong> &pound;102.00 received in full on 23 May 2026 at 14:34 "
               "via Stripe Link. Invoice settled.</p>",
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
print(f"Customer: Paul Thurston")
print(f"Vehicle:  Mercedes-Benz GLA 220d (Y6 PRT)")
print(f"Scope:    Repeat visit - quick test, intake smoke test, turbo test, borescope")
print(f"Labour:   1.0 hr @ GBP85.00 = GBP85.00 ex VAT")
print(f"Callout:  NOT APPLIED (repeat visit, as agreed)")
print(f"Subtotal:        GBP85.00")
print(f"VAT (20%):       GBP17.00")
print(f"Total:           GBP102.00")
print(f"Status:          PAID (Stripe Link, 23/05/2026 14:34)")
print(f"Payment ID:      pi_3TaFgfRzrswjZPkV0nkeBnFt")
print(f"{'='*60}")
