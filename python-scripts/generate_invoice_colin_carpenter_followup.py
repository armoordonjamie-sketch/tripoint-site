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

INVOICE_ID = "TPD-2026-0033"
INVOICE_DATE = "8 May 2026"
DUE_DATE = "15 May 2026 (Net 7)"
TOTAL_PENCE = 17000  # £170.00 (VAT exempt)

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoices")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ── Step 1: Stripe Payment Link ─────────────────────────
REGENERATE_PAYMENT_LINK = False
EXISTING_PAYMENT_URL = "https://buy.stripe.com/dRm5kFctJ66CbCk9eXaZi0F"

if REGENERATE_PAYMENT_LINK:
    product = stripe.Product.create(
        name=f"Invoice {INVOICE_ID} - Repeat Diagnostic Visit (Leak Investigation)",
        description="Mercedes Sprinter BX69 BSV - Smoke test, leak localisation, EGR assessment (VAT exempt).",
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

# 2.0 hrs @ £85.00/hr = £170.00 (VAT exempt)
line_items_html = """
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Repeat Diagnostic Visit (Follow-up to TPD-2026-0021)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Diagnostic Labour - Leak Investigation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Return visit following DPF replacement (invoice TPD-2026-0021). Includes:<br>
                            &bull; Exhaust system pressurised smoke test (15 min soak, borescope inspection)<br>
                            &bull; Intake system pressurised smoke test<br>
                            &bull; Running-engine inspection; leak localised to LH engine bay<br>
                            &bull; EGR circuit assessment and elimination<br>
                            &bull; Advisory: oil contamination noted on LH exhaust heat shield
                        </span>
                    </td>
                    <td style="text-align:center;">2 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;170.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Invoice",
    "Diagnostic visit completion": "Repeat Diagnostic - Exhaust / Intake Leak Investigation",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": INVOICE_ID,
    "[INVOICE_DATE]": INVOICE_DATE,
    "[DUE_DATE]": "N/A",
    "[PAYMENT_TERMS]": "Paid on completion",
    "[STATUS_CLASS]": "paid",
    "[STATUS]": "PAID",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Colin Carpenter",
    "[CLIENT_EMAIL]": "colin.carpenter@hotmail.co.uk",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "48 Kilby Court\nGreenroof Way\nGreenwich, London\nSE10 0PY",
    "[SERVICE_ADDRESS]": "48 Kilby Court\nGreenroof Way\nGreenwich, London\nSE10 0PY",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz Sprinter",
    "[VEHICLE_REG]": "BX69 BSV",
    "[ODOMETER]": "-",
    "[JOB_ID]": INVOICE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;170.00",
    "[DISCOUNT]": "None (no callout fee on repeat visit)",
    "[VAT_RATE]": "VAT Exempt",
    "[VAT_AMOUNT]": "&pound;0.00",
    "[TOTAL]": "&pound;170.00",
    "[AMOUNT_PAID]": "&pound;170.00",
    "[BALANCE_DUE]": "&pound;0.00",
    "[PAYMENT_METHODS]": "Settled.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": '<p style="font-size:14px;font-weight:600;color:#065f46;">&#10003; Paid in full by Visa debit card &bull;&bull;&bull;&bull; 6478 on 23 May 2026 at 15:54. Thank you!</p>'
        '<p style="font-size:12px;color:#6b7280;margin-top:4px;">Stripe payment ID: pi_3TaGwiRzrswjZPkV17RH8UjF</p>',
    "[NOTES]": "<p><strong>Follow-up to invoice TPD-2026-0021 (DPF replacement):</strong> Return diagnostic visit "
               "to investigate reported leak / driveability concerns post-repair.</p>"
               "<p style='margin-top:8px;'><strong>Works carried out:</strong> Exhaust system pressurised smoke "
               "test performed (15 minute soak, borescope inspection); intake system pressurised smoke test; "
               "running-engine inspection with leak localised to the LH engine bay; EGR circuit assessed and "
               "eliminated as the source. <strong>Advisory:</strong> oil contamination noted on LH exhaust heat shield.</p>"
               "<p style='margin-top:8px;'><strong>This invoice:</strong> 2.0 hrs diagnostic labour at &pound;85.00 per "
               "hour = &pound;170.00 total. <strong>VAT exempt.</strong> No mobile callout fee on repeat visit.</p>"
               "<p style='margin-top:8px;'><strong>Payment:</strong> &pound;170.00 received in full on 23 May 2026 at 15:54 "
               "via Stripe (Visa debit &bull;&bull;&bull;&bull; 6478, NatWest). Invoice settled.</p>",
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
print(f"Customer: Colin Carpenter")
print(f"Vehicle:  Mercedes-Benz Sprinter (BX69 BSV)")
print(f"Scope:    Repeat visit - smoke tests, leak localisation, EGR elimination")
print(f"Labour:   2.0 hrs @ GBP85.00 = GBP170.00")
print(f"VAT:      EXEMPT (GBP0.00)")
print(f"Total:    GBP170.00")
print(f"Status:   PAID (Stripe, Visa debit ****6478, 23/05/2026 15:54)")
print(f"Payment ID: pi_3TaGwiRzrswjZPkV17RH8UjF")
print(f"{'='*60}")
