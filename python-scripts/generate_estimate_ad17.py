import base64
import stripe
from pathlib import Path

ESTIMATE_ID = "EST-2026-0004"
DATE = "12 April 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

line_items_html = """
                <tr>
                    <td>
                        <strong>Parts: Authentic Mercedes Ignition Coil</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Genuine Mercedes-Benz replacement ignition coil.<br>
                            Includes standard manufacturer parts warranty.
                        </span>
                    </td>
                    <td style="text-align:center;">4</td>
                    <td style="text-align:right;">&pound;75.83</td>
                    <td style="text-align:right;">&pound;303.33</td>
                </tr>
                <tr>
                    <td>
                        <strong>Labour: Mobile Callout &amp; Installation</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to vehicle location and up to 1 hour of on-site labour.<br>
                            Includes: Remove engine cover, replace 4x ignition coils, perform post-repair functional check &amp; clear related fault codes.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Repair Estimate",
    "Diagnostic visit completion": "Ignition Coil Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "David",
    "[CLIENT_EMAIL]": "leytonpolishcraft@gmail.com",
    "[CLIENT_PHONE]": "07436 260756",
    "[BILL_TO_ADDRESS]": "RM1 4XR",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "2017 Mercedes-Benz GLA 200 AMG Line Premium Plus",
    "[VEHICLE_REG]": "AD17BJX",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;423.33",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;84.67",
    "[TOTAL]": "&pound;508.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;508.00",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Notes:</strong> Estimate based on genuine Mercedes-Benz parts. Labour covers 1st hour including mobile callout to location, fitment, and post-repair XENTRY clearing/testing.</p>"
        "",
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

# Fix labels
template = template.replace("Invoice number", "Estimate number")
template = template.replace("Invoice date", "Estimate date")

# Save filled HTML
OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\estimates")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{ESTIMATE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML estimate saved: {html_path}")

# ── Step 3: Convert to PDF via Playwright ───────────────
from playwright.sync_api import sync_playwright

pdf_path = OUTPUT_DIR / f"{ESTIMATE_ID}.pdf"
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

print(f"[OK] PDF estimate saved: {pdf_path}")
print(f"\n{'='*60}")
print(f"ESTIMATE: {ESTIMATE_ID}")
print(f"Vehicle: AD17BJX GLA 200")
print(f"Labour ex VAT: GBP120.00")
print(f"Parts ex VAT:  GBP303.33")
print(f"VAT (20%):     GBP84.67")
print(f"Total inc VAT: GBP508.00")
print(f"{'='*60}")
