import base64
from pathlib import Path

ESTIMATE_ID = "EST-2026-0013"
DATE = "11 May 2026"

TEMPLATE_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\invoice-templates\service-invoice.html")
LOGO_PATH = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\assets\logo\logo-with-text-transparrent.png")

template = TEMPLATE_PATH.read_text(encoding="utf-8")

logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode()
logo_data_uri = f"data:image/png;base64,{logo_b64}"

# ── Line items ──────────────────────────────────────────
# Parts inc VAT:
#   Driveshaft .................. £966.00  ->  £805.00 ex VAT
#   Driveshaft bolt ............. £ 12.00  ->  £ 10.00 ex VAT
# Labour: 1.5 hrs total
#   - Callout (incl. 1 hr labour) ........ £120.00
#   - Additional 0.5 hrs @ £85.00/hr ..... £ 42.50
#   Labour ex VAT total .................. £162.50
# Subtotal ex VAT .......................... £977.50
# VAT (20%) ................................ £195.50
# Total inc VAT ............................ £1,173.00
line_items_html = """
                <!-- PARTS -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Parts (Genuine Mercedes-Benz)
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Driveshaft Assembly</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Complete OE driveshaft assembly for Mercedes-Benz eSprinter (W910).<br>
                            Supplied at &pound;966.00 inc VAT (&pound;805.00 ex VAT).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;805.00</td>
                    <td style="text-align:right;">&pound;805.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Genuine Mercedes-Benz Driveshaft Bolt</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Single-use OE driveshaft retaining bolt.<br>
                            Supplied at &pound;12.00 inc VAT (&pound;10.00 ex VAT).
                        </span>
                    </td>
                    <td style="text-align:center;">1</td>
                    <td style="text-align:right;">&pound;10.00</td>
                    <td style="text-align:right;">&pound;10.00</td>
                </tr>

                <!-- LABOUR -->
                <tr style="background:#f0f9ff;">
                    <td colspan="4" style="padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#0369a1;font-weight:700;">
                        Labour
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Mobile Callout (includes first hour labour)</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Travel to customer location, vehicle preparation, remove and replace driveshaft,
                            torque retaining bolt to spec, road test and post-repair verification via XENTRY.
                        </span>
                    </td>
                    <td style="text-align:center;">1 hr</td>
                    <td style="text-align:right;">&pound;120.00</td>
                    <td style="text-align:right;">&pound;120.00</td>
                </tr>
                <tr>
                    <td>
                        <strong>Additional Labour</strong><br>
                        <span style="font-size:12px;color:#6b7280;">
                            Driveshaft replacement is a 1.5 hr job. Time beyond the included first hour billed
                            at the standard hourly rate of &pound;85.00 + VAT.
                        </span>
                    </td>
                    <td style="text-align:center;">0.5 hrs</td>
                    <td style="text-align:right;">&pound;85.00</td>
                    <td style="text-align:right;">&pound;42.50</td>
                </tr>
"""

replacements = {
    "Service Invoice": "Estimate",
    "Diagnostic visit completion": "Driveshaft Replacement",
    "[LOGO_URL]": logo_data_uri,
    "[INVOICE_ID]": ESTIMATE_ID,
    "[INVOICE_DATE]": DATE,
    "[DUE_DATE]": "Valid for 30 days",
    "[PAYMENT_TERMS]": "Estimate",
    "[STATUS_CLASS]": "unpaid",
    "[STATUS]": "ESTIMATE",
    "[DEPOSIT_CREDIT_HTML]": "",
    "[CLIENT_FULL_NAME]": "Customer",
    "[CLIENT_EMAIL]": "",
    "[CLIENT_PHONE]": "",
    "[BILL_TO_ADDRESS]": "",
    "[SERVICE_ADDRESS]": "Customer location",
    "[VEHICLE_MAKE_MODEL]": "Mercedes-Benz eSprinter (W910)",
    "[VEHICLE_REG]": "TBC",
    "[ODOMETER]": "-",
    "[JOB_ID]": ESTIMATE_ID,
    "[PO_NUMBER]": "-",
    "[TECH_NAME]": "Jamie Armoordon",
    "[LINE_ITEMS_HTML]": line_items_html,
    "[SUBTOTAL]": "&pound;977.50",
    "[DISCOUNT]": "None",
    "[VAT_RATE]": "20%",
    "[VAT_AMOUNT]": "&pound;195.50",
    "[TOTAL]": "&pound;1,173.00",
    "[AMOUNT_PAID]": "&pound;0.00",
    "[BALANCE_DUE]": "&pound;1,173.00",
    "[PAYMENT_METHODS]": "This is an estimate. Do not pay. To proceed, please contact us to schedule the repair.",
    "[BANK_DETAILS]": "",
    "[PAYMENT_LINK]": "",
    "[NOTES]": "<p><strong>Scope:</strong> Replacement of driveshaft assembly on Mercedes-Benz eSprinter (W910). "
               "Includes new single-use retaining bolt, torque-to-spec, road test and post-repair verification via XENTRY.</p>"
               "<p style='margin-top:8px;'><strong>Labour:</strong> 1.5 hrs total. Mobile callout includes the first hour "
               "of labour at &pound;120.00 + VAT; additional time is charged at the standard hourly rate of &pound;85.00 + VAT.</p>"
               "<p style='margin-top:8px;'><strong>Parts pricing:</strong> Driveshaft &pound;966.00 inc VAT "
               "(&pound;805.00 ex VAT) and bolt &pound;12.00 inc VAT (&pound;10.00 ex VAT) shown above; VAT included in totals.</p>"
               "<p style='margin-top:8px;'>This estimate is valid for 30 days. Final invoice will reflect actual work carried out.</p>",
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

# Fix labels
template = template.replace("Invoice number", "Estimate number")
template = template.replace("Invoice date", "Estimate date")

OUTPUT_DIR = Path(r"c:\Users\JamiePC\Desktop\TriPoint-site\business-docs\estimates")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

html_path = OUTPUT_DIR / f"{ESTIMATE_ID}.html"
html_path.write_text(template, encoding="utf-8")
print(f"[OK] HTML estimate saved: {html_path}")

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
print(f"Vehicle: Mercedes-Benz eSprinter (W910)")
print(f"Scope:   Driveshaft Replacement (1.5 hrs)")
print(f"Parts ex VAT:    GBP815.00  (driveshaft GBP805 + bolt GBP10)")
print(f"Labour ex VAT:   GBP162.50  (1hr callout + 0.5hr @ GBP85)")
print(f"Subtotal:        GBP977.50")
print(f"VAT (20%):       GBP195.50")
print(f"Total inc VAT:   GBP1,173.00")
print(f"{'='*60}")
